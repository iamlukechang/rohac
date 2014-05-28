/**
 * A scope instance stores properties for a scope element
 * @author iamlukechang@gmail.com (Luke Chang)
 */

/**
 * Scope Class
 * @constructor
 * @param {number} _id
 * @param {jquery object} $elem
 */
function Scope(_id, $elem) {
  this._id = _id;
  this._parentId = null;

  if (typeof $elem.attr('rh-repeat') !== 'undefined') {
    this._type = 'repeat';
  } else {
    this._childrenIds = null;
    this._type = 'scope';
  }

  this.init($elem[0].childNodes);
};

/**
 * get all the properties defined with a equal sign in a double braces
 * @param {array} nodes
 */
Scope.prototype.init = function (nodes) {
  var reg = /\{\{(\w+\s*=\s*.*)\}\}/g;
  var that = this;
  var node, prop;
  var nodesLen = nodes.length;

  for (var i = 0; i < nodesLen; i++) {
    node = nodes[i]

    if (node.nodeType === 3 && reg.test(node.nodeValue)) {
      node.nodeValue = node.nodeValue.replace(reg, function ($0, $1) {
        prop = $1.split(/\s*=\s*/);
        that[prop[0]] = JSON.parse(prop[1]);
        return '';
      });
    }
  }
};

Object.defineProperty(Scope.prototype, 'init', {enumerable: false}); // prevent printing out init in client API file

module.exports = Scope;
