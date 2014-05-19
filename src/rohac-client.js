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
    var targetsLen = targets.length;
    for (var i = 0; i < targetsLen; i++) {
      targets[i] = this.getDom(document.querySelector('[rh-scope="' + i + '"]'), targets[i]);
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
  // TODO: make update API
  update: function (query) {
    for (var p in query.content) {
      this.model.scopes[query.id][p] = query.content[p];
    }
    this.controller.compile(query.id, this.view, this.model, 'loopChildren');
  },
  // TODO: make remove API 
  remove: function () {
  },
};

##fill##

document.addEventListener('DOMContentLoaded', function () {
  rohac.init();
});
