// http://whitney.org/image_columns/0071/3484/frank-stella_jaspers-dilemma_1962_700.jpg?1446039574

// brushes / textures
// https://github.com/kangax/fabric.js
// http://processingjs.org/
// https://github.com/disjukr/croquis.js
// http://www.tricedesigns.com/2012/01/04/sketching-with-html5-canvas-and-brush-images/
// https://github.com/rhyolight/Harmony-Brushes
// http://perfectionkills.com/exploring-canvas-drawing-techniques/

if (typeof module !== 'undefined' && module.exports) {
  var _ = require('underscore');
  var tinycolor = require("tinycolor2");
  module.exports = {
    draw_everything: draw_everything,
    title: 'Jasper\'s Dilemma'
  }
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
    colors = _.times(7, function() { return getRndColor(); })
  }
  if (colorIndex === null) {
    colorIndex = 0;
  }
}

function getNextColor() {
  initColors();

  var c = colors[colorIndex % colors.length];
  colorIndex+=1;
  return c;
}

function getNextColorNoAdvance() {
  initColors();

  var c = colors[colorIndex % colors.length];
  return c;
}


function calculate_isosceles_height(base) {
  return (base/2)*Math.tan(Math.PI/4)
}

function rotate90(ctx, max_y) {
  rotateDegrees(ctx, 90, max_y)
}

function rotateDegrees(ctx, degrees, max_y) {
  ctx.rotate(degrees * (Math.PI/180))
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

function draw_it(ctx, max_x, band_width, padding) {
   ctx.fillStyle = getNextColorNoAdvance()
   ctx.fillRect(0, 0, band_width , band_width - padding)

  _.times(Math.floor(2*max_x / band_width) - 1, function(index) {
    if (index > 2 && index % 2 == 1) {
      max_x -= band_width
    }
    make_trapezoid(ctx, max_x, band_width)
    rotate90(ctx, max_x)
  })

  max_x -= band_width
  make_trapezoid(ctx, max_x, band_width / 2)
  rotate90(ctx, max_x)
  make_trapezoid(ctx, max_x, band_width / 2)
}

function draw_everything(canvas, forceGlitch) {
  var ctx = canvas.getContext('2d');

  var band_width = 25
  var padding = 5

  var max_x = Math.min(canvas.width, canvas.height) / 2;

  ctx.translate((canvas.width - 2*max_x) / 2, (canvas.height - max_x) / 2)

  ctx.save()
  rotateDegrees(ctx, 90, canvas.height/2)
  draw_it(ctx, max_x, band_width, padding);
  ctx.restore()

  ctx.translate(max_x, 0)
  rotate90(ctx, canvas.height/2)
  ctx.scale(1, -1)
  ctx.translate(0, -max_x)
  colors = _.map(colors, function(c) { return tinycolor(c).greyscale().toHexString(); });
  ctx.save()
  draw_it(ctx, max_x, band_width, padding);
  ctx.restore
}
