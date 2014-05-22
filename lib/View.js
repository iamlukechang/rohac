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
  this.clientDOMNodeReference = []; // store the node reference for client side APIs

  $scopeElems.each(function (index) {
    that.targets[index] = [];
    that.clientDOMNodeReference[index] = {};
    that.initTarget(index, $(this), that.clientDOMNodeReference[index]);
  });
}

/**
 * put every text node and attribute node which has a mustache in the scope target
 * @param {number} _id
 * @param {jquery element} $elem 
 * @param {object} ref The node reference for client side APIs
 */
View.prototype.initTarget = function (_id, $elem, ref) {
  var $ = this.$;
  var node, nodes;

  if (typeof $elem.attr('rh-repeat') !== 'undefined') {
    nodes = $.makeArray($elem[0].attributes);
    this.repeaters[_id] = this.toDoubleBraces($elem[0].innerHTML);
  } else {
    nodes = $.makeArray($elem[0].childNodes).concat($.makeArray($elem[0].attributes));
  }

  var nodesLen = nodes.length;

  for (var i = 0; i < nodesLen; i++) {
    node = nodes[i]

    if (node.nodeType === 1 && typeof $(node).attr('rh-scope') === 'undefined') {
      ref[i] = {};
      this.initTarget(_id, $(node), ref[i]);
    } else if ((node.nodeType === 2 || node.nodeType === 3) && /\{\{([^}=]*)\}\}/g.test(node.nodeValue)) {
      if ($elem.prop('tagName') === 'STYLE' && node.nodeType === 3) node.nodeValue = this.toDoubleBraces(node.nodeValue);

      ref[i] = node.nodeValue;
      this.targets[_id].push({
        node: node,
        template: node.nodeValue
      });
    }
  }
};

/**
 * The double braces syntax in an style element needs to be wrapped with quotes, replace it with only double braces in templates
 * @param {string} str A string including '{{}}'
 */
View.prototype.toDoubleBraces = function (str) {
  // the dollor sign regexp remember syntax won't work here
  return str.replace(/'(\{\{[^}=]*\}\})'/g, function ($0, $1) {
    return $1;
  });
};

module.exports = View;
