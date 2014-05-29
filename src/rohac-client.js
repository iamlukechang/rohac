rohac = {
  model: {}, 
  view: {}, 
  controller: {
    reg: {
      '=': /\s*=\s*/,
      '|': /\s*\|\s*/,
      '()': /\((.*)\)/g,
      '{{}}': /\{\{([^}]*)\}\}/g,
      '{{=}}': /\{\{(\w+\s*=\s*.*)\}\}/g
    },
    $: function (query) {
      return document.querySelectorAll(query);
    }
  },
  init: function () {
    var targets = this.view.targets;
    var scope;
    var len = targets.length; // this is also scopes length
    for (var i = 0; i < len; i++) {
      targets[i] = this.getDom(document.querySelector('[rh-scope="' + i + '"]'), targets[i]);
      scope = this.model.scopes[i];

      Object.defineProperties(scope, {
        "_id": {enumerable: false},
        "_parentId": {enumerable: false},
        "_childrenIds": {enumerable: false},
        "_type": {enumerable: false}
      });

      for (var p in scope) {
        this.watcher(scope, p, function (oldVal, newVal) {
          var _id = this._id;
          // TODO: create a scope property value to template map
          setTimeout(function () { // the watch "callback" is actually fired before the property is set, so use a setTimeout for a bit delay for now
            rohac.controller.compile(_id, rohac.view, rohac.model, 'loopChildren');
          }, 50);
        });
      }
    }

    if (this.readyCallback) this.readyCallback();
  },
  getDom: function (node, target) {
    var tmpArr = [];
    if (typeof target === 'string') {
      return [{
        node: node,
        template: target
      }];
    } else {
      for (var p in target) {
        tmpArr = tmpArr.concat(this.getDom(node.childNodes[p], target[p]));
      }
      return tmpArr;
    }
  },
  ready: function (callback) {
    this.readyCallback = callback;
  },
  // TODO: make create API
  create: function () {
  },
  // TODO: make read API
  read: function () {
  },
  update: function (query) {
    for (var p in query.content) {
      this.model.scopes[query.id][p] = query.content[p];
    }
  },
  // TODO: make remove API 
  remove: function () {
  },
};

##fill##

document.addEventListener('DOMContentLoaded', function () {
  rohac.init();
});
