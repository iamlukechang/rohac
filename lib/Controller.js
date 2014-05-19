/**
 * Controller can merge data from model into view template
 * @author iamlukechang@gmail.com (Luke Chang)
 */
var util = require('util');


/**
 * Controller Class
 * @constructor
 * @param {object} modifiers
 */
function Controller(modifiers) {
  this.parser = require('./parser.js');
  this.modifiers = (typeof modifiers !== 'undefined') ? modifiers : {};
};

Controller.prototype.reg = {
  '=': /\s*=\s*/,
  '|': /\s*\|\s*/,
  '()': /\((.*)\)/g,
  '{{}}': /\{\{([^}]*)\}\}/g,
  '{{=}}': /\{\{(\w+\s*=\s*.*)\}\}/g
};

/**
 * allows controller to use jquery
 * @param {jquery} $
 */
Controller.prototype.init = function ($) {
  this.$ = $;
};

/**
 * compile a scope
 * @param {number} _id
 * @param {View instance} view
 * @param {Model instance} model
 * @param {string} method 
 */
Controller.prototype.compile = function (_id, view, model, method) {
  var target = view.targets[_id],
      scope = model.scopes[_id];
  var targetLen = target.length;

  for (var i = 0; i < targetLen; i++) {
    target[i].node.nodeValue = this.parse(target[i].template, _id, model);
  }

  if (scope._type === 'repeat') {
    this.$('[rh-scope="' + _id + '"]')[0].innerHTML = this.repeat(view.repeaters[_id], _id, model);
  }

  // use a recursion to compile children scope
  if (method === 'loopChildren' && util.isArray(scope._childrenIds) && scope._childrenIds.length !== 0) {
    var _childrenLen = scope._childrenIds.length;

    for (var i = 0; i < _childrenLen; i++) {
      this.compile(scope._childrenIds[i], view, model, 'loopChildren');
    }
  }
};

/**
 * parse a string which includes mustaches
 * @param {string} str
 * @param {number} _id 
 * @param {Model instance} model
 */
Controller.prototype.parse = function (str, _id, model) {
  var that = this
  var value, expr;

  return str.replace(this.reg['{{}}'], function ($0, $1) {
    if (that.reg['|'].test($1)) {
      expr = $1.split(that.reg['|'])[0];
      var modifier = that.modifiers[$1.split(that.reg['|'])[1]];
    } else {
      expr = $1;
    }


    if (/[\+\-\*\/\(\)%]/.test(expr)) {
      expr = expr.replace(/[^\+\-\*\/\(\)%\s]+/g, function ($0) {
        if (!isNaN($0)) return $0;
        return that.parseLiteral($0, _id, model, modifier);
      });
      return that.parser.openEqu(expr);
    }

    return that.parseLiteral(expr, _id, model, modifier);

  });
};

/**
 * parse a string in a mustache
 * @param {string} str
 * @param {number} _id
 * @param {Model instance} model
 * @param {object} modifier
 */
Controller.prototype.parseLiteral = function (str, _id, model, modifier) {
  var objStop = str.search(/[\.\[]/);

  if (objStop === -1) {
    value = model.findProperty(str, _id);
  } else {
    value = model.findProperty(str.slice(0, objStop), _id);
    value = this.parser.openObj(str, value);
  }

  if (typeof modifier !== 'undefined') value = modifier(value);

  if (typeof value === 'number' || typeof value === 'string') return value; 
  return JSON.stringify(value);
};

/**
 * repeat the whole content within an ac-repeat scope
 * @param {string} str
 * @param {number} _id
 * @param {Model instance} model
 */
Controller.prototype.repeat = function (str, _id, model) {
  var that = this;
  var result = '',
      valueObj = {},
      repeatLen = 0;
  var value, expr, objStop;

  str.replace(this.reg['{{}}'], function ($0, $1) {
    objStop = $1.search(/[\.\[]/);
    value = model.findProperty($1.slice(0, objStop), _id);

    objStop = $1.slice(0, $1.indexOf('[?]')).search(/[\.\[]/);
    if (objStop !== -1) value = that.parser.openObj($1.slice(0, $1.indexOf('[?]')), value);

    valueObj[$1] = value;
  });

  // find the largest array
  for (var p in valueObj) {
    if (util.isArray(valueObj[p]) && valueObj[p].length > repeatLen) repeatLen = valueObj[p].length;
  }

  // TODO: handle array with different length
  for (var i = 0; i < repeatLen; i++) {
    result += str.replace(this.reg['{{}}'], function ($0, $1) {
      if (that.reg['|'].test($1)) {
        expr = $1.split(that.reg['|'])[0];
        var modifier = that.modifiers[$1.split(that.reg['|'])[1]];
      } else {
        expr = $1;
      }

      expr = expr.slice(expr.indexOf('[?]')).replace('[?]', '[' + i + ']');
      value = that.parser.openObj(expr, valueObj[$1])

      if (typeof modifier !== 'undefined') value = modifier(value);

      if (typeof value === 'number' || typeof value === 'string') return value;
      return JSON.stringify(value);
    });
  }

  return result;
};

module.exports = Controller;
