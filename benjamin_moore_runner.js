
var _ = require('underscore');
var shuffle = require('shuffle-array');

var Canvas = require('canvas')
  , Image = Canvas.Image;

var fs = require('fs');

var max_x = 504;
var max_y = 353;
var canvas = new Canvas(max_x, max_y);

var benjamin_moore = require('./benjamin_moore');
benjamin_moore.draw_everything(canvas);

var out = fs.createWriteStream(__dirname + '/output.png')
  , stream = canvas.createPNGStream();

stream.on('data', function(chunk){
  out.write(chunk);
});