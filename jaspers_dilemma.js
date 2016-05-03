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

function randInt (low, high) {
    return Math.floor(Math.random() * (high - low) + low);
}

var colors = null;
var colorIndex = null;

function initColors() {
  // please remove this awful globals hack
  if (colors === null) {
    colorOptions = [
      tinycolor(getRndColor()).analogous(slices = randInt(10, 100), results = randInt(4, 40)),
      tinycolor(getRndColor()).analogous(slices = randInt(10, 100), results = randInt(4, 40)),
      tinycolor(getRndColor()).analogous(slices = randInt(10, 100), results = randInt(4, 40)),
      tinycolor(getRndColor()).analogous(slices = randInt(10, 100), results = randInt(4, 40)),
      tinycolor(getRndColor()).tetrad().slice(1),
      tinycolor(getRndColor()).triad()
    ]
    colors = _.sample(colorOptions)
    //colors = _.times(7, function() { return getRndColor(); })

    var colorFunctions = ['lighten', 'darken', 'brighten', 'saturate', 'desaturate']
    var colorFunction = _.sample(colorFunctions)
    colors = colors.map(function(c) { return c[colorFunction](randInt(0, 20)); })

    colors = colors.map(function(t) { return t.toHexString(); })
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

function make_trapezoid(ctx, length, height, start_hack) {

  var padding = 5

  height -= padding

  // tan 45
  var inset = (height) / Math.tan(Math.PI / 4)
  console.log('length: ' + length)
  console.log('height: ' + height)
  console.log('inset: ' + inset)

  if (inset + padding > length/2) {
    height = (length/2 - padding / 2) * Math.tan(Math.PI / 4)
    inset = length / 2 - padding / 2 - 2
  }

  console.log('inset: ' + inset)

  ctx.save()
  ctx.beginPath()
  if (start_hack) { 
    ctx.moveTo(0, 0)
    ctx.lineTo(0, height)
  } else {
    ctx.moveTo(padding, 0)
    ctx.lineTo(inset + padding, height)
  }
  ctx.lineTo(length - inset - padding, height)
  ctx.lineTo(length - padding, 0)
  ctx.closePath()
  ctx.fillStyle = getNextColor();

  ctx.fill()
  ctx.restore()
}

function draw_it(ctx, max_x, band_width, padding) {
   var iterations = Math.floor(2*max_x / band_width)
   if (iterations % 2 == 0) {
    iterations -= 1
   }

  _.times(iterations, function(index) {
    if (index > 2 && index % 2 == 1) {
      max_x -= band_width
    }
    console.log('index ' + index)
    console.log('max x: ' + max_x)
    make_trapezoid(ctx, max_x, band_width, index == 0)
    rotate90(ctx, max_x)
  })

  max_x -= band_width
  make_trapezoid(ctx, max_x, band_width / 2)
  rotate90(ctx, max_x)
  make_trapezoid(ctx, max_x, band_width / 2)
}

function draw_everything(canvas, forceGlitch) {
  var ctx = canvas.getContext('2d');

  var band_width = randInt(15, 30)
  var padding = randInt(4, 10)

  var max_x = Math.min(canvas.width / 2, canvas.height) * (randInt(75, 95)*1.0/100)

  ctx.translate((canvas.width - 2*max_x) / 2, (canvas.height - max_x) / 2)

  ctx.save()
  rotateDegrees(ctx, 90, max_x)
  draw_it(ctx, max_x, band_width, padding);
  ctx.restore()

  ctx.translate(max_x, 0)
  rotate90(ctx, max_x)
  ctx.scale(1, -1)
  ctx.translate(0, -max_x)
  colors = _.map(colors, function(c) { return tinycolor(c).greyscale().toHexString(); });
  ctx.save()
  draw_it(ctx, max_x, band_width, padding);
  ctx.restore
}
