var fs = require('fs');
var rh = require('./lib/rohac.js');

if (!fs.existsSync('./build')) fs.mkdirSync('./build');
rh.expand('./example/index.html', './build/index.html');
