var fs = require('fs');
var rh = require('./lib/rohac.js');

if (!fs.existsSync('./build')) fs.mkdirSync('./build');
rh.expandDir('./example/', './build/');
