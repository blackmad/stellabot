// TOOD
// finish spiral
// randomize order, orientation
// srand
// variable padding

var _ = require('underscore');
var shuffle = require('shuffle-array');

var Canvas = require('canvas')
  , Image = Canvas.Image;

var fs = require('fs');

function randInt (low, high) {
    return Math.floor(Math.random() * (high - low) + low);
}

function getRndColor() {
    var r = 255*Math.random()|0,
        g = 255*Math.random()|0,
        b = 255*Math.random()|0;
    return 'rgb(' + r + ',' + g + ',' + b + ')';
}

var max_x = 1000;
var max_y = 700;

var canvas = new Canvas(max_x, max_y);
var ctx = canvas.getContext('2d');
ctx.antialias = 'none';

// draw background
ctx.fillStyle = '#e0e0e0'
ctx.fillRect(0, 0, max_x, max_y);

// pick number of lines
var num_lines = randInt(5, 10) * 2;
var num_bands = num_lines + 1

var padding_ratio = 0.1 + 0.1*Math.random()
var squares_per_row = 3
var square_size = (max_x / squares_per_row) * (1 - padding_ratio)
var padding_size = (max_x / squares_per_row) * padding_ratio

// figure out line spacing
// TODO: make this very clean integers the whole way
var band_to_line_width_multiplier = randInt(2, 5);

// draw lines
/*
(num_lines * line_width) + ((num_lines + 1) * band_width) = max_x
(num_lines * line_width) + ((num_lines + 1) * (line_width*band_to_line_width_multiplier) = max_x
num_lines*line_width + num_lines*line_width*band_to_line_width_multiplier + line_width*band_to_line_width_multiplier = max_x
line_width(num_lines + num_lines*multiplier + multiplier) = max_x
line_width = max_x / (num_lines + num_lines*multiplier + multiplier)
*/

function make_shape_helper(max_x, max_y, draw_cb) {
  // pick color
  // TODO: make these colors within reasonable bounds, complimentary, etc
  var bg_color = getRndColor();
  var fg_color = '#FFFFFF';

  // draw background
  ctx.fillStyle = bg_color;
  ctx.fillRect(0, 0, max_x, max_y);

  // draw lines
  ctx.fillStyle = fg_color;
  ctx.strokeStyle = fg_color

  var line_width = max_x*1.0 / (num_lines + num_lines*band_to_line_width_multiplier + band_to_line_width_multiplier)
  var band_width = line_width * band_to_line_width_multiplier

  ctx.save();
  ctx.rect(0, 0, max_x, max_y);
  ctx.stroke();
  ctx.clip();
  draw_cb(max_x, max_y, line_width, band_width, bg_color, fg_color);
  ctx.restore();
}


function make_corners(max_x, max_y, line_width, band_width, bg_color, fg_color) {
  ctx.lineWidth = line_width;
  ctx.clip();
  _(num_lines).times(function(line_index) {
    var offset = line_index*line_width + (line_index+1)*band_width + line_width / 2
    ctx.beginPath()
    ctx.moveTo(offset, 0)
    ctx.lineTo(offset, max_y - offset)
    ctx.lineTo(max_x, max_y - offset);
    ctx.stroke();
  })
}

function make_squares(max_x, max_y, line_width, band_width, bg_color, fg_color) {
  ctx.lineWidth = line_width;
  // num_lines must be even
  _(num_lines / 2).times(function(line_index) {
    var offset = line_index*line_width + (line_index+1)*band_width + line_width / 2
    ctx.strokeRect(offset, offset, max_x - 2*offset, max_y - 2*offset);
  })
}

function make_lines(max_x, max_y, line_width, band_width, bg_color, fg_color) {
  ctx.lineWidth = line_width;
  _(num_lines).times(function(line_index) {
    var offset = line_index*line_width + (line_index+1)*band_width + line_width / 2
    ctx.beginPath()
    ctx.moveTo(offset, 0)
    ctx.lineTo(offset, max_y);
    ctx.stroke();

  })
}

function make_slants(max_x, max_y, line_width, band_width, bg_color, fg_color) {
  ctx.lineWidth = line_width;
  _(num_lines * 3).times(function(line_index) {
    var offset = line_index*line_width + (line_index+1)*band_width + line_width / 2
    ctx.beginPath()
    ctx.moveTo(offset - 15, -15)
    ctx.lineTo(0 - 15, offset - 15)
    ctx.stroke();
  })
}

function make_cross(max_x, max_y, line_width, band_width, bg_color, fg_color) {
  var local_num_lines = num_lines + 1
  console.log(local_num_lines)
  var line_width = max_x*1.0 / (local_num_lines + local_num_lines*band_to_line_width_multiplier + band_to_line_width_multiplier)
  var band_width = line_width * band_to_line_width_multiplier

  ctx.lineWidth = line_width;
  function draw_quarter() {
    _(num_lines / 2 ).times(function(line_index) {
      line_index = num_lines - line_index
      var offset = line_index*line_width + (line_index+1)*band_width + line_width / 2
      ctx.beginPath()
      ctx.moveTo(offset, 0)
      ctx.lineTo(offset, max_y - offset)
      ctx.lineTo(max_x, max_y - offset);
      ctx.stroke();
    })
  }

  draw_quarter();

  ctx.save()
  ctx.rotate(Math.PI / 2)
  ctx.translate(0, -max_y)
  draw_quarter();
  ctx.restore()

  ctx.save()
  ctx.rotate(Math.PI)
  ctx.translate(-max_x, -max_y)
  draw_quarter();
  ctx.restore()

  ctx.save()
  ctx.rotate(Math.PI * 1.5)
  ctx.translate(-max_x, 0)
  draw_quarter();
  ctx.restore()

  ctx.beginPath()
  ctx.moveTo(max_x / 2, 0)
  ctx.lineTo(max_x / 2, max_y)
  ctx.stroke();

  ctx.beginPath()
  ctx.moveTo(0, max_y / 2)
  ctx.lineTo(max_x, max_y / 2)
  ctx.stroke();
}

function make_spiral(max_x, max_y, line_width, band_width, bg_color, fg_color) {
  ctx.lineWidth = line_width;
  ctx.beginPath()
  // ctx.moveTo(0, 0)
  _(num_lines / 2).times(function(line_index) {
    var offset = line_index*line_width + (line_index+1)*band_width + line_width / 2
    ctx.lineTo(offset, offset - band_width - line_width)
    ctx.lineTo(offset, max_y - offset)
    ctx.lineTo(max_x - offset, max_y - offset);
    ctx.lineTo(max_x - offset, offset);
    ctx.lineTo(offset + band_width + line_width, offset)
  })
  ctx.stroke();
}

var drawing_funcs = [
  make_corners, make_squares, make_lines, 
  make_slants, 
  make_spiral,
  make_cross
]

shuffle(drawing_funcs)

_(drawing_funcs.length).times(function(index) {
  var y_offset = Math.floor(index / squares_per_row) * (max_x / squares_per_row)
  var x_offset = index % squares_per_row* (max_x / squares_per_row)

  ctx.save()

  console.log("moving to " + x_offset + ", " + y_offset)
  ctx.translate(x_offset, y_offset)
  ctx.translate(padding_size / 2, padding_size / 2)

  // possibly spin it
  ctx.translate(square_size/2, square_size/2)
  ctx.rotate(Math.PI * (randInt(0, 3) / 2))
  ctx.translate(-square_size/2, -square_size/2)

  make_shape_helper(square_size, square_size, drawing_funcs[index])
  ctx.restore()
})




var out = fs.createWriteStream(__dirname + '/output.png')
  , stream = canvas.createPNGStream();

stream.on('data', function(chunk){
  out.write(chunk);
});