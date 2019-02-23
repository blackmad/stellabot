var fs = require('fs');

var max_x = 1024;
var max_y = 512;

const { createCanvas, loadImage } = require('canvas')
const canvas = createCanvas(200, 200)

var benjamin_moore = require('./benjamin_moore');
benjamin_moore.draw_everything(canvas);

var out = fs.createWriteStream(__dirname + '/benjamin_moore.png')
  , stream = canvas.createPNGStream();

stream.on('data', function(chunk){
  out.write(chunk);
});
