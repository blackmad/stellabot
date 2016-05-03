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
    title: 'Windowpanes'
  }
}

Math.seed = function(s) {
  return function() {
    s = Math.sin(s) * 10000; return s - Math.floor(s);
  };
};

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

function makeColors() {
  return  tinycolor(getRndColor()).analogous(slices = 5, results = 40).map(function(t) { return t.toHexString(); });
}

function initColors() {
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

  var colorFunctions = ['lighten'] // , 'darken', 'brighten', 'saturate', 'desaturate']
  var colorFunction = _.sample(colorFunctions)
  colors = colors.map(function(c) { return c.lighten(20); });
  colors = colors.map(function(t) { return t.toHexString(); });

  colorIndex = 0;
}

function maybeInitColors() {
  // please remove this awful globals hack
  if (colors === null) {
    initColors()
  }
}

function getNextColor() {
  maybeInitColors();

  var c = colors[colorIndex % colors.length];
  colorIndex+=1;
  return c;
}

function getNextColorNoAdvance() {
  maybeInitColors();

  var c = colors[colorIndex % colors.length];
  return c;
}


function rotate90(ctx, max_y) {
  rotateDegrees(ctx, 90, max_y)
}

function rotateDegrees(ctx, degrees, max_y) {
  ctx.rotate(degrees * (Math.PI/180))
  ctx.translate(0, -max_y)
}

function draw_circles(ctx, colors, radius, band_width, padding) {
  ctx.beginPath();
  ctx.rect(0, 0, radius, radius);
  ctx.clip();

  var radiiAndColors = []
  var currentRadius = band_width
  var currentColorIndex = 0
  while (currentRadius < radius) {
    radiiAndColors.push([currentRadius, colors[currentColorIndex % colors.length]])
    currentRadius += band_width;
    currentColorIndex += 1
  }
  radiiAndColors.reverse()
  console.log(radiiAndColors)

  console.log('\n\n circles!!!!')
  console.log('drawing with colors: ' + colors)

  var iterations = Math.floor(radius / band_width)
  _.each(radiiAndColors, function(radiusAndColor, index) {
    var radius = radiusAndColor[0]
    var color = radiusAndColor[1]
    console.log('drawing circle ' + index + ' with color ' + color + ' & radius: ' + radius)
    ctx.fillStyle = 
    ctx.beginPath();
    ctx.arc(padding,padding,radius-padding, 0,Math.PI);
    ctx.fill();

    // ctx.strokeStyle = '#ffffff'
    // ctx.lineWidth = padding;
    // ctx.beginPath();
    // ctx.arc(padding, padding,radius-padding, 0,Math.PI);
    // ctx.stroke();

    radius -= band_width
  })
}

function draw_pane(ctx, size, colors1, colors2) {
  arc_size = size * 0.12
  border_size = size * 0.10

  ctx.save()
  ctx.beginPath();
  ctx.rect(0, 0, size, size);
  ctx.clip();
  draw_circles(ctx, colors1, size * 2, arc_size, 1)
  ctx.restore()

  ctx.save()
  ctx.beginPath();
  ctx.rect(0, 0, size, size);
  ctx.clip();
  rotate90(ctx, size)
  rotate90(ctx, size)
  draw_circles(ctx, colors2, size * 0.82, arc_size, 1)
  ctx.restore()

  ctx.beginPath()
  ctx.rect(border_size/2, border_size/2, size - border_size, size - border_size)
  ctx.strokeStyle = getRndColor()
  ctx.lineWidth = size * 0.10
  ctx.stroke();
}


function draw_everything(canvas, forceGlitch) {
  // var seed = new Date().getTime()
  var seed = 100
  Math.random = Math.seed(seed)

  initColors();

  var ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = true;
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.moveTo(0, 0)

  ctx.save()
  ctx.translate(50, 50)

  var colors1 = makeColors()
  var colors2 = makeColors()

  ctx.save()
  draw_pane(ctx, 300, colors1, colors2)
  ctx.restore()

  // // flip vertical
  // ctx.scale(-1, 1)
  // ctx.translate(-300, 300)

  // flip horizontal
  ctx.scale(1, -1)
  ctx.translate(300, -300)

  draw_pane(ctx, 300, colors2, makeColors())

  ctx.restore()

}
