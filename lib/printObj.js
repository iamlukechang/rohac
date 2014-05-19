/**
 * Print an object including it's methods to a string
 * @author iamlukechang@gmail.com (Luke Chang)
 */
var util = require('util');

function dump(obj) {
  switch (typeof obj) {
    case 'undefined':
      return 'undefined';
      break;
    case 'boolean':
      return obj.toString();
      break;
    case 'string':
      return '"' + obj.replace(/(\r\n|\n|\r)/gm, ' ') + '"';
      break;
    case 'number':
      return obj.toString();
      break;
    case 'function':
      return obj.toString();
      break;
    case 'object': 
      var rsl = '';
      if (util.isArray(obj)) {
        var len = obj.length;
        for (var i = 0; i < len; i++) {
          rsl += dump(obj[i]) + ',';
        }
        return '[' + rsl.slice(0, rsl.length - 1) + ']';
      } else if (obj === null){
        return 'null';
      } else {
        for (var p in obj) {
          rsl += '"' + p + '"' + ': ' + dump(obj[p]) + ',';
        } 
        return '{' + rsl.slice(0, rsl.length - 1) + '}';
      }
      break;
  }
};

module.exports = dump;
