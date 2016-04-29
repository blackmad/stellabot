var Canvas = require('canvas');

var fs = require('fs');

var max_x = 600;
var max_y = 400;
var canvas = new Canvas(max_x, max_y);

var jaspers_dilemma = require('./jaspers_dilemma');
jaspers_dilemma.draw_everything(canvas);

var out = fs.createWriteStream(__dirname + '/jaspers_dilemma.png')
  , stream = canvas.createPNGStream();

stream.on('data', function(chunk){
  out.write(chunk);
});