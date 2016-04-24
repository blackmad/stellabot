var Canvas = require('canvas');

var fs = require('fs');

var max_x = 600;
var max_y = 400;
var canvas = new Canvas(max_x, max_y);

var benjamin_moore = require('./benjamin_moore');
benjamin_moore.draw_everything(canvas);

var out = fs.createWriteStream(__dirname + '/output.png')
  , stream = canvas.createPNGStream();

stream.on('data', function(chunk){
  out.write(chunk);
});