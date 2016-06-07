var Canvas = require('canvas');

var fs = require('fs');
var fabric = require('fabric').fabric;

var max_x = 600;
var max_y = 400;

var canvas = fabric.createCanvasForNode(570, 600);

var circle = new fabric.Circle({
  radius: 20, fill: 'green', left: 100, top: 100
});
var triangle = new fabric.Triangle({
  width: 20, height: 30, fill: 'blue', left: 50, top: 50
});

canvas.add(circle, triangle);

var out = fs.createWriteStream(__dirname + '/jaspers_dilemma.png')
  , stream = canvas.createPNGStream();

stream.on('data', function(chunk){
  out.write(chunk);
});


