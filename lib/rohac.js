/**
 * Pre compile all the double braces in the target html file and generate a new static file and client side APIs 
 * @author iamlukechang@gmail.com (Luke Chang)
 */
var jsdom = require('jsdom');
var fs = require('fs');
var util = require('util');
var uglify = require('uglify-js');
var Model = require('./Model.js');
var View = require('./View.js');
var Controller = require('./Controller.js');
var printObj = require('./printObj.js');

/**
 * Rohac Class
 * @contructor
 */
function Rohac() {
  this.controller = new Controller();
}

/**
 * generate an expanded file
 * @param {string} srcPath The original template file path 
 * @param {string} destPath The dest file path
 */
Rohac.prototype.expand = function (srcPath, destPath) {
  var that = this;
  jsdom.env({
    file: srcPath,
    done: function (err, window) {
      if (err) throw err;
      var $ = require('jquery')(window);
      var model = new Model($('[rh-scope], [rh-repeat]'), $)
      var view = new View($('[rh-scope], [rh-repeat]'), $);
      that.model = model;
      that.view = view;

      that.controller.init($);
      
      var rootsLen = model.rootScopeIds.length;
      for (var i = 0; i < rootsLen; i++) {
        that.controller.compile(model.rootScopeIds[i], view, model, 'loopChildren');
      }

      that.generateClientAPI($);
      fs.writeFile((typeof destPath === 'string') ? destPath : './' + srcPath.slice(srcPath.search(/\/(?=[^\/]*$)/) + 1), window.document.innerHTML, function (err) {
        if (err) throw err;
      });
    }
  });
};

/**
 * generate client side js file
 * @param {jquery} $
 */
Rohac.prototype.generateClientAPI = function ($) {
  var rsl = 'rohac.model.scopes = ' + printObj(this.model.scopes) + ';' + 
            'rohac.model.rootScopeIds = ' + printObj(this.model.rootScopeIds) + ';' +
            'rohac.model.findProperty = ' + printObj(this.model.findProperty) + ';' +
            'rohac.view.targets = ' + printObj(this.view.clientDOMNodeReference) + ';' + 
            'rohac.view.repeaters = ' + printObj(this.view.repeaters) + ';' + 
            'rohac.controller.compile = ' + printObj(this.controller.compile).replace('util', 'Array') + ';' + 
            'rohac.controller.parse = ' + printObj(this.controller.parse) + ';' + 
            'rohac.controller.parseLiteral = ' + printObj(this.controller.parseLiteral) + ';' + 
            'rohac.controller.repeat = ' + printObj(this.controller.repeat).replace('util', 'Array') + ';' +
            'rohac.controller.parser = ' + printObj(this.controller.parser) + ';';

  fs.readFile('./src/rohac-client.js', function (err, data) {
    if (err) throw err;
    rsl = data.toString().replace('##fill##', rsl);
    fs.writeFile('./build/rohac.js', uglify.minify(rsl, {fromString: true}).code);
  });

  if ($('head script:eq(0)').length !== 0) {
    $('head script:eq(0)').before('<script src="rohac.js"></script>');
  } else {
    $('head').append('<script src="rohac.js"></script>');
  }
};

//TODO: keep monitoring the templates
Rohac.prototype.watch = function () {
}


module.exports = new Rohac;
