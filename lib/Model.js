/**
 * A Model instance manages all the scopes and global model properties
 * @author iamlukechang@gmail.com (Luke Chang)
 */
var Scope = require('./Scope.js');
var fs = require('fs');
var path = require('path');

/**
 * Model Class
 * @constructor
 * @param {jquery object} $scopeElems
 * @param {jquery} $
 */
function Model($scopeElems, $, srcPath) {
  var that = this;
  this.$ = $;
  this.scopes = [];
  this.rootScopeIds = [];

  $scopeElems.each(function (index) {
    $(this).attr('rh-scope', index);
    that.scopes.push(new Scope(index, $(this)));
    if (typeof $(this).attr('rh-model') !== 'undefined') that.getGlobalModel(index, srcPath + $(this).attr('rh-model'));
  });

  this.buildScopeTree();
};

/**
 * check each scope and set _children and _parent property if any
 */
Model.prototype.buildScopeTree = function () {
  var scope, parentScope, parentId;
  var scopesLen = this.scopes.length;

  for (var i = 0; i < scopesLen; i++) {
    scope = this.scopes[i];
    parentId = this.checkParent(i, i - 1);

    scope._parentId = parentId;
    parentScope = this.scopes[parentId];

    if (parentId !== null) {
      if (parentScope._childrenIds === null) parentScope._childrenIds = [];
      parentScope._childrenIds.push(i);
    } else {
      this.rootScopeIds.push(i);
    }
  }
};

/**
 * check a scope's parent
 * @param {number} id_
 * @param {number} _parentId
 */
Model.prototype.checkParent = function (_id, _parentId) {
  if (_parentId < 0) return null;
  var parent = this.$('[rh-scope="' + _parentId + '"]'),
      child = this.$('[rh-scope="' + _id + '"]');

  if (this.$.contains(parent[0], child[0])) return _parentId;

  if (this.scopes[_parentId]._parentId) {
    return this.checkParent(_id, this.scopes[_parentId]._parentId);
  } else {
    return null;
  }
};

/**
 * Find a property through ancestors
 * @param {string} key 
 * @param {number} _id
 */
Model.prototype.findProperty = function (key, _id) {
  var scope = this.scopes[_id];
  // if property exist, return it 
  if (typeof scope[key] !== 'undefined') return scope[key];

  // if property doesn't exist, look into the parent scope
  if (scope._parentId !== null) return this.findProperty(key, scope._parentId);

  // if parent scope doesn't exist, look into the global model 
  if (typeof this[key] !== 'undefined') return this[key];

  // return an empty string if couldn't find a match property
  return '';
};

/**
 * get the global model from the model.json in the same directory
 * @param {string} path
 * @param {function} callback
 */
Model.prototype.getGlobalModel = function (_id, filePath) {
  //fs.readdir('./', function (err, files) {console.log(files);});
  var json = require(path.resolve(process.env.PWD, filePath));

  this.$.extend(this.scopes[_id], json);
};

module.exports = Model;
