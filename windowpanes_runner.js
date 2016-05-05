var Canvas = require('canvas');

var fs = require('fs');

var max_x = 1000;
var max_y = 1000;
var canvas = new Canvas(max_x, max_y);

var benjamin_moore = require('./windowpanes');
benjamin_moore.draw_everything(canvas);

var out = fs.createWriteStream(__dirname + '/windowpanes.png')
  , stream = canvas.createPNGStream();

stream.on('data', function(chunk){
  out.write(chunk);
});