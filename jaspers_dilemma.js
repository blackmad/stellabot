// http://whitney.org/image_columns/0071/3484/frank-stella_jaspers-dilemma_1962_700.jpg?1446039574

if (typeof module !== 'undefined' && module.exports) {
  var _ = require('underscore');
  var tinycolor = require("tinycolor2");
  module.exports = {
    draw_everything: draw_everything
  };
}

function getRndColor() {
    var r = 255*Math.random()|0,
        g = 255*Math.random()|0,
        b = 255*Math.random()|0;
    return 'rgb(' + r + ',' + g + ',' + b + ')';
}

var colors = null;
var colorIndex = null;

function initColors() {
  // please remove this awful globals hack
  if (colors === null) {
    colors = _.times(5, function() { return getRndColor(); })
  }
  if (colorIndex === null) {
    colorIndex = 0;
  }
}

function getNextColor() {
  initColors();

  colorIndex+=1;
  var c = colors[colorIndex % colors.length];
  return c;
}

function getCurrentColor() {
  initColors();

  return colors[colorIndex % colors.length];
}

function calculate_isosceles_height(base) {
  return (base/2)*Math.tan(Math.PI/4)
}

function rotate90(ctx, max_y) {
  ctx.rotate(Math.PI / 2)
  ctx.translate(0, -max_y)
}

function make_trapezoid(ctx, length, height) {

  var padding = 5

  height -= padding

  // tan 45
  var inset = (height) / Math.tan(Math.PI / 4)

  ctx.save()
  ctx.beginPath()
  ctx.moveTo(padding, 0)
  ctx.lineTo(inset + padding, height)
  ctx.lineTo(length - inset - padding, height)
  ctx.lineTo(length - padding, 0)
  ctx.closePath()
  ctx.fillStyle = getNextColor();
  ctx.fill()
  ctx.restore()
}

function draw_it(ctx, max_x, band_width, num_lines, line_width, padding) {
  //ctx.fillStyle = getRndColor()
  make_trapezoid(ctx, max_x, band_width)
  ctx.fillStyle = getCurrentColor()
  ctx.fillRect(0, 0, band_width , band_width - padding)
  rotate90(ctx, max_x)
  make_trapezoid(ctx, max_x, band_width)
  rotate90(ctx, max_x)

  _.times(Math.floor((max_x / band_width)/2) - 1, function(index) {
   // _.times(1, function(index) {
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
}

function draw_everything(canvas) {
  var ctx = canvas.getContext('2d');

  var band_width = 40
  var num_lines = 20
  var line_width = 6
  var padding = 5

  var max_x = canvas.width / 2;

  ctx.save()
  draw_it(ctx, max_x, band_width, num_lines, line_width, padding);
  ctx.restore()
  ctx.translate(max_x, 0)
  colors = _.map(colors, function(c) { return tinycolor(c).greyscale().toHexString(); });
  console.log(colors)
  draw_it(ctx, max_x, band_width, num_lines, line_width, padding);
}
