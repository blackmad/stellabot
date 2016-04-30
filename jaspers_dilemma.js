// http://whitney.org/image_columns/0071/3484/frank-stella_jaspers-dilemma_1962_700.jpg?1446039574

if (typeof module !== 'undefined' && module.exports) {
  var _ = require('underscore');
}

module.exports = {
  draw_everything: draw_everything
};

function getRndColor() {
    var r = 255*Math.random()|0,
        g = 255*Math.random()|0,
        b = 255*Math.random()|0;
    return 'rgb(' + r + ',' + g + ',' + b + ')';
}

function calculate_isosceles_height(base) {
  return (base/2)*Math.tan(Math.PI/4)
}

var shouldGlitchAtAll = false

function calculateOffset(line_index, line_width, band_width) {
  var glitch = Math.random() < 0.6
  if (shouldGlitchAtAll) { // && glitch) {
    if (Math.random() < 0.5) {
      return function() { return (line_index*line_width + (line_index+1)*band_width + line_width / 2) + Math.random()*50 }
    } else {
      var randOffset = (line_index*line_width + (line_index+1)*band_width + line_width / 2) + Math.random()*50;
      return function() { return randOffset }
    }
  } else {
    return function() { 
      return line_index*line_width + (line_index+1)*band_width + line_width / 2
    }
  }
}

function rotate90(ctx, max_y) {
  ctx.rotate(Math.PI / 2)
  ctx.translate(0, -max_y)
}

function make_spiral(ctx, max_x, max_y, line_width, band_width, num_lines) {
  ctx.lineWidth = line_width;
  ctx.beginPath()
  _(num_lines / 2).times(function(line_index) {
    var offset = calculateOffset(line_index, line_width, band_width)
    ctx.lineTo(offset(), offset() - band_width - line_width)
    ctx.lineTo(offset(), max_y - offset())
    ctx.lineTo(max_x - offset(), max_y - offset());
    ctx.lineTo(max_x - offset(), offset());
    ctx.lineTo(offset() + band_width + line_width, offset())
  })
  ctx.stroke();
}


function make_triangle(ctx, triangleWidth, num_lines, line_width, line_padding) {
  // pick color
  // TODO: make these colors within reasonable bounds, complimentary, etc
  var bg_color = getRndColor();
  var fg_color = '#FFFFFF';

  x = 0
  y = 0 
  triangleHeight = calculate_isosceles_height(triangleWidth)

  ctx.save()
  ctx.beginPath()
  ctx.moveTo(x, y)
  ctx.lineTo(x + triangleWidth / 2, y + triangleHeight)
  ctx.lineTo(x + triangleWidth, y)
  ctx.closePath()
  ctx.fillStyle = bg_color
  // ctx.fill()
  ctx.clip()

  _.times(num_lines, function(index) {
    var bg_color = getRndColor(); 
    ctx.fillStyle = bg_color
    ctx.fillRect(0, index*(line_width+line_padding), triangleWidth, line_width)
  })
  ctx.restore()

}

function make_trapezoid(ctx, length, height) {
  // tan 45
  var inset = height / Math.tan(Math.PI / 4)

  ctx.save()
  ctx.beginPath()
  ctx.moveTo(0, 0)
  ctx.lineTo(inset, height)
  ctx.lineTo(length - inset, height)
  ctx.lineTo(length, 0)
  ctx.closePath()
  ctx.fillStyle = getRndColor();
  ctx.fill()
  ctx.restore()
}

function draw_everything(canvas) {
  var ctx = canvas.getContext('2d');

  var band_width = 40
  var num_lines = 20
  var line_width = 6

  var max_x = canvas.width;
  var max_y = canvas.height;

  console.log(max_x)

  ctx.fillStyle = getRndColor()
  ctx.fillRect(0, 0, max_x, band_width)
  rotate90(ctx, max_x)
  make_trapezoid(ctx, max_x, band_width)
  rotate90(ctx, max_x)

  _.times(Math.floor(max_x / band_width)/2 - 1, function(index) {
    make_trapezoid(ctx, max_x, band_width)
    rotate90(ctx, max_x)
    max_x -= band_width
    make_trapezoid(ctx, max_x, band_width)
    rotate90(ctx, max_x)
    make_trapezoid(ctx, max_x, band_width)
    rotate90(ctx, max_x)
    make_trapezoid(ctx, max_x-band_width, band_width)
    max_x -= band_width
    rotate90(ctx, max_x)
  })

  make_trapezoid(ctx, max_x, band_width)
  rotate90(ctx, max_x)
  max_x -= band_width
  make_trapezoid(ctx, max_x, band_width / 2)
  rotate90(ctx, max_x)
  make_trapezoid(ctx, max_x, band_width / 2)

  ctx.fillStyle = '#FFFFFF'
  // make_spiral(ctx, 400, 400, line_width, band_width, 10)
}