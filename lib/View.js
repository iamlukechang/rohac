/**
 * A view instance stores DOM node reference and it's template for every double braces syntax within a scope
 * @author iamlukechang@gmail.com (Luke Chang)
 */

/**
 * View Class
 * @param {jquery object} $scopeElems
 * @param {jquery} $
 */
function View($scopeElems, $) {
  var that = this;

  this.$ = $;
  this.targets = [];
  this.repeaters = [];
  this.clientDOMNodeReference = []; // store the reference node for client side APIs

  $scopeElems.each(function (index) {
    that.targets[index] = [];
    that.clientDOMNodeReference[index] = {};
    if (typeof $(this).attr('rh-repeat') !== 'undefined') {
      that.initTarget(index, $.makeArray(this.attributes), that.clientDOMNodeReference[index]);
      that.repeaters[index] = this.innerHTML;
    } else {
      that.initTarget(index, $.makeArray(this.childNodes).concat($.makeArray(this.attributes)), that.clientDOMNodeReference[index]);
    }
  });
}

/**
 * put every text node and attribute node which has a mustache in the scope target
 * @param {number} _id
 * @param {array} nodes
 */
View.prototype.initTarget = function (_id, nodes, ref) {
  var $ = this.$;
  var target = this.targets[_id];
  var node;
  var nodesLen = nodes.length;

  for (var i = 0; i < nodesLen; i++) {
    node = nodes[i]

    if (node.nodeType === 1) {
      if (typeof $(node).attr('rh-scope') === 'undefined') {
        ref[i] = {};
        this.initTarget(_id, $.makeArray(node.childNodes).concat($.makeArray(node.attributes)), ref[i]);
      }
    } else if (node.nodeType === 3 || node.nodeType === 2) {
      if (/\{\{([^}=]*)\}\}/g.test(node.nodeValue)) {
        ref[i] = node.nodeValue;
        target.push({
          node: node,
          template: node.nodeValue
        });
      }
    }
  }
};

module.exports = View;
