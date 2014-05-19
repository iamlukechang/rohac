/**
 * A parser help to parse a math string or a object string into a real value
 * @author iamlukechang@gmail.com (Luke Chang)
 */

/**
 * Parser Class
 * @contructor
 */
function Parser() {
  this.operators = {
    '+xor-': function (str) {
      return str.replace(/[+-]\s*[+-]/, function ($0) {
        if ($0.slice(0, 1) === $0.slice($0.length - 1)) {
          return '+';
        } else {
          return '-';
        }
      });
    },
    '()': function (str) {
      str = this['+xor-'](str);

      var value = 0;
      var arr = str.split(/\s(?=[+-])/),
          arrLen = arr.length;

      for (var i = 0; i < arrLen; i++) {
        if (/[\*\/]\s*$/.test(arr[i]) && /^\s*\-/.test(arr[i + 1])) {
          arr[i] = this['+xor-']('-' + arr[i] + arr[i + 1].slice(arr[i + 1].indexOf('-') + 1));
          arr.splice(i + 1, 1);
          arrLen = arr.length;
        }
        value += this['+-'](arr[i]);
      }

      return value;
    },
    '+-': function (str) {
      if (str.charAt(0) === '+') {
        return this['*/%'](str.slice(1));
      } else if (str.charAt(0) === '-') {
        return - this['*/%'](str.slice(1));
      } else {
        return this['*/%'](str);
      }
    },
    '*/%': function (str) {
      var stop = str.search(/[\*\/%](?!.*[\*\/%])/);
      var value, oper;

      if (stop === -1) return parseInt(str);

      value = str.slice(stop + 1);
      oper = str.slice(stop, stop + 1);
      str = str.slice(0, stop);

      if (oper === '*') {
        return this['*/%'](str) * parseInt(value);
      } else if (oper === '/') {
        return this['*/%'](str) / parseInt(value);
      } else if (oper === '%') {
        return this['*/%'](str) % parseInt(value);
      }
    }
  };
}


/**
 * a recursion to get the object value
 * @param {string} str
 * @param {object | array} value
 */
Parser.prototype.openObjExpr = function (str, value) {
  var arrStop = str.search(/\]/),
      objStop = str.search(/[\.\[]/);
  var prop, nextStr;

  if (objStop === -1) {
    if (arrStop === -1) return value[str];
    return value[parseInt(str.slice(0, arrStop))];

  } else if (arrStop > objStop || arrStop === -1) { // obj
    prop = str.slice(0, objStop);
    nextStr = str.slice(objStop + 1);

  } else if (arrStop < objStop) { // arr
    prop = parseInt(str.slice(0, arrStop));
    nextStr = str.slice(arrStop + 2);

  }

  return this.openObjExpr(nextStr, value[prop]);
};

/**
 * transfer an expression string of object notation "."  and array suffix "[]" into a value
 * @param {string} str
 * @param {object} value
 */
Parser.prototype.openObj = function (str, value) {
  return this.openObjExpr(str.slice(str.search(/[\.\[]/) + 1), value);
};

/**
 * transfer an math expression string into a value
 * @param {string} str
 */
Parser.prototype.openEqu = function (str) {
  var strLen = str.length;
  var pareArr = [];
  var pare;

  for (var i = 0; i < strLen; i++) {
    if (str.charAt(i) === '(') {
      pareArr.push(i);
    } else if (str.charAt(i) === ')') {
      pare = pareArr.pop();

      str = str.slice(0, pare) + this.operators['()'](str.slice(pare + 1, i)) + str.slice(i + 1);
      strLen = str.length;
      i = pare;
    }
  }

  return this.operators['()'](str);
};

module.exports = new Parser();
