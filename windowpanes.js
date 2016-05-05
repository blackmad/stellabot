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

function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
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

function makeColors() {
  return  tinycolor(getRndColor()).analogous(slices = 400, results = 5).map(function(t) { return t.toHexString(); });
}

function initColors() {
  colorOptions = [
    tinycolor(getRndColor()).analogous(slices = randInt(10, 100), results = randInt(4, 40)),
    tinycolor(getRndColor()).analogous(slices = randInt(10, 100), results = randInt(4, 40)),
    tinycolor(getRndColor()).analogous(slices = randInt(10, 100), results = randInt(4, 40)),
    tinycolor(getRndColor()).analogous(slices = randInt(10, 100), results = randInt(4, 40)),
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
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(padding,padding,radius-padding, 0,Math.PI);
    ctx.fill();

    ctx.strokeStyle = '#ffffff'
    ctx.lineWidth = padding;
    ctx.beginPath();
    ctx.arc(padding, padding,radius-padding, 0,Math.PI);
    ctx.stroke();

    radius -= band_width
  })
}

function clip_to_square(ctx, size, fn) {
  ctx.save()
  ctx.beginPath();
  ctx.rect(0, 0, size, size);
  ctx.clip();
  fn()
  ctx.restore()
}

function draw_square_pane(ctx, size, colors1, colors2) {
  arc_size = size * 0.12
  border_size = size * 0.10

  clip_to_square(ctx, size, function() {
    draw_circles(ctx, colors1, size * 2, arc_size, 1)

    rotate90(ctx, size)
    rotate90(ctx, size)
    draw_circles(ctx, colors2, size * 0.82, arc_size, 1)
  });

  make_square_border(ctx, size, border_size, getRndColor());
}

function make_square_border(ctx, size, border_size, color) {
  ctx.beginPath()
  ctx.rect(border_size/2, border_size/2, size - border_size, size - border_size)
  ctx.strokeStyle = color;
  ctx.lineWidth = size * 0.10
  ctx.stroke();

  ctx.beginPath()
  ctx.rect(border_size, border_size, size - border_size*2, size - border_size*2)
  ctx.strokeStyle = 'white'
  ctx.lineWidth = 1
  ctx.stroke();
}

function draw_curved_border(ctx, size, border_size, border_color) {
  ctx.save()
  ctx.rotate(Math.PI / 2)
  ctx.translate(0, -size)

  ctx.beginPath()
  ctx.arc(0, 0, size, 0,Math.PI/2);
  ctx.lineTo(0, 0)
  ctx.closePath()
  ctx.clip()

  ctx.beginPath()
  ctx.arc(0, 0, size - border_size, 0, Math.PI / 2);
  ctx.strokeStyle = '#ffffff'
  ctx.lineWidth = 2 
  ctx.stroke();

  make_square_border(ctx, size, border_size, border_color)

  ctx.beginPath()
  ctx.arc(0, 0, size - border_size/2 , 0, Math.PI);
  ctx.strokeStyle = border_color;
  ctx.lineWidth = size * 0.10
  ctx.stroke();

  ctx.restore();
}

function draw_curved_pane(ctx, size, colors1, colors2) {
  ctx.save()
  ctx.beginPath()
  ctx.arc(0, 0, size, 0,Math.PI/2);
  ctx.lineTo(0, 0)
  ctx.closePath()
  // ctx.stroke()
  ctx.clip()

  arc_size = size * 0.12
  border_size = size * 0.10

  draw_circles(ctx, colors1, size * 2, arc_size, 1)

  ctx.save()
  rotate90(ctx, size)
  rotate90(ctx, size)
  draw_circles(ctx, colors2, size * 0.82, arc_size, 1)
  ctx.restore()

  var border_color = getRndColor()
  

}


function draw_everything(canvas, forceGlitch) {
  // var seed = new Date().getTime()
  // var seed = 100
  // Math.random = Math.seed(seed)

  initColors();

  var ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = true;
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.moveTo(0, 0)

  ctx.save()
  // ctx.translate(50, 50)

  var colors1 = makeColors()
  var colors2 = makeColors()

  var canvas_size = canvas.width
  var num_panes_per_row = 5
  var pane_size = canvas_size / num_panes_per_row

  var arc_size = pane_size * 0.15
  var border_size = pane_size * 0.10
  var arc_border_size = 1

  var circle_work = _.times(num_panes_per_row - 1, function(node_index) {
    return function() {
      ctx.save()
      ctx.translate(pane_size*(node_index+1), 0)
      if (node_index % 2 == 1) {
        ctx.scale(1, -1)
        ctx.translate(0, -pane_size)
      }
      draw_circles(ctx, makeColors(), pane_size, arc_size, arc_border_size)
      ctx.restore()
    }
  })

  _.each(shuffle(circle_work), function(fn) { fn(); })

  draw_curved_border(ctx, pane_size, border_size, getRndColor());

  ctx.save()
  ctx.translate(pane_size, 0)
  _.times(num_panes_per_row-2, function(node_index) {
    make_square_border(ctx, pane_size, border_size, getRndColor());
    ctx.translate(pane_size, 0)
  })
  ctx.restore()

  ctx.save()
  ctx.rotate(Math.PI)
  ctx.translate(-pane_size*(num_panes_per_row), -pane_size)
  // ctx.translate(pane_size*(num_panes_per_row-1), 0)
  
  draw_curved_border(ctx, pane_size, border_size, getRndColor());
  ctx.restore()

  // ctx.save()
  // ctx.rotate(Math.PI / 2); // in the screenshot I used angle = 20
  // ctx.translate(0, -pane_size)
  // draw_curved_pane(ctx, pane_size, colors1, makeColors())
  // ctx.restore()

  // lastColors = colors1
  // nextColors = null
  // _.times(3, function() {
  //   ctx.translate(pane_size, 0)
  //   nextColors = makeColors()
  //   ctx.save()
  //   draw_square_pane(ctx, pane_size, lastColors, nextColors)
  //   ctx.restore()
  //   lastColors = nextColors
  // });

  // ctx.translate(pane_size, 0)

  // ctx.save()
  // // flip vertical
  // ctx.scale(1, -1)
  // ctx.translate(0, -pane_size)
  // draw_curved_pane(ctx, pane_size, lastColors, makeColors())
  // ctx.restore()

  // // // flip vertical
  // // ctx.scale(-1, 1)
  // // ctx.translate(-300, 300)

  // // flip horizontal
  // ctx.scale(1, -1)
  // ctx.translate(pane_size, -pane_size)

  // // draw_curved_pane(ctx, 300, colors2, makeColors())

  // ctx.restore()

}
