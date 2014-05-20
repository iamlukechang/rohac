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
 * expand an html file
 * @param {string} fileName File name
 * @param {string} srcPath Source directory path
 * @param {string} destPath Dest directory path
 */
Rohac.prototype.expandFile = function (fileName, srcPath, destPath) {
  var that = this;
  jsdom.env({
    file: srcPath + fileName,
    done: function (err, window) {
      if (err) throw err;
      var $ = require('jquery')(window);
      var model = new Model($('[rh-scope]'), $)
      var view = new View($('[rh-scope]'), $);

      that.controller.init($);
      
      model.rootScopeIds.forEach(function (scopeId) {
        that.controller.compile(scopeId, view, model, 'loopChildren');
      });

      that.generateClientAPI($, model, view, destPath, fileName.replace('.html', ''));
      fs.writeFile((typeof destPath === 'string') ? destPath + fileName : './' + fileName, window.document.innerHTML, function (err) {
        if (err) throw err;
      });
    }
  });
};

/**
 * expand all html files in a directory
 * @param {string} srcPath Source directory path
 * @param {string} destPath Dest directory path
 */
Rohac.prototype.expandDir = function (srcPath, destPath) {
  var that = this;
  var filePath;
  fs.readdir(srcPath, function (err, files) {
    files.forEach(function (file) {
      if (/\.html/.test(file)) that.expandFile(file, srcPath, destPath);
    });
  });
};

/**
 * generate client side js file
 * @param {jquery} $
 * @param {Model instance} model
 * @param {View instance} view
 * @param {string} destPath Dest directory path
 * @param {string} prefix Prefix for a custom rohac client js file
 */
Rohac.prototype.generateClientAPI = function ($, model, view, destPath, prefix) {
  var rsl = 'rohac.model.scopes = ' + printObj(model.scopes) + ';' + 
            'rohac.model.rootScopeIds = ' + printObj(model.rootScopeIds) + ';' +
            'rohac.model.findProperty = ' + printObj(model.findProperty) + ';' +
            'rohac.view.targets = ' + printObj(view.clientDOMNodeReference) + ';' + 
            'rohac.view.repeaters = ' + printObj(view.repeaters) + ';' + 
            'rohac.controller.compile = ' + printObj(this.controller.compile).replace('util', 'Array') + ';' + 
            'rohac.controller.parse = ' + printObj(this.controller.parse) + ';' + 
            'rohac.controller.parseLiteral = ' + printObj(this.controller.parseLiteral) + ';' + 
            'rohac.controller.repeat = ' + printObj(this.controller.repeat).replace('util', 'Array') + ';' +
            'rohac.controller.parser = ' + printObj(this.controller.parser) + ';';

  fs.readFile('./src/rohac-client.js', function (err, data) {
    if (err) throw err;
    rsl = data.toString().replace('##fill##', rsl);
    fs.writeFile(destPath + prefix + '-rohac.js', uglify.minify(rsl, {fromString: true}).code);
  });

  if ($('head script:eq(0)').length !== 0) {
    $('head script:eq(0)').before('<script src="' + prefix + '-rohac.js"></script>');
  } else {
    $('head').append('<script src="' + prefix + '-rohac.js"></script>');
  }
};

//TODO: keep monitoring the templates
Rohac.prototype.watch = function () {
}


module.exports = new Rohac;
