var Canvas = require('canvas');

var fs = require('fs');

var max_x = 1024;
var max_y = 512;
var canvas = new Canvas(max_x, max_y);

var benjamin_moore = require('./benjamin_moore');
benjamin_moore.draw_everything({canvas: canvas});

var out = fs.createWriteStream(__dirname + '/benjamin_moore.png')
  , stream = canvas.createPNGStream();

stream.on('data', function(chunk){
  out.write(chunk);
});
