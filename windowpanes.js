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
  return makeColors()[0];
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

var l = randInt(10, 100)
function makeColors() {
  if (l === null || l === undefined) {
    l = randInt(10, 100)
  }
  // return  tinycolor(getRndColor()).analogous(slices = 400, results = 5).map(function(t) { return t.toHexString(); });
  return _.times(10, function() {
    //return tinycolor({ h: randInt(0, 100), s: randInt(0, 100), l: 50 })
    return tinycolor({ h: randInt(0, 100), s: randInt(0, 100), l: l })
  })
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

function createArray(length) {
    var arr = new Array(length || 0),
        i = length;

    if (arguments.length > 1) {
        var args = Array.prototype.slice.call(arguments, 1);
        while(i--) arr[length-1 - i] = createArray.apply(this, args);
    }

    return arr;
}

function is_curve(entry) { return _.contains(['CTL', 'CTR', 'CBR', 'CBL'], entry); }

function make_plan() {
  var rows = 1;
  var cols = randInt(2, 5);

  var plan = createArray(rows, cols);

  function opposite_curve(c) { 
    if (c == 'CTL') { return 'CBR'; } 
    else if (c == 'CTR') { return 'CBL'; }
    else if (c == 'CBR') { return 'CTL'; }
    else if (c == 'CBL') { return 'CTR'; }
  }

  function vertical_mirror_curve(c) { 
    if (c == 'CTL') { return 'CTR'; } 
    else if (c == 'CTR') { return 'CTL'; }
    else if (c == 'CBR') { return 'CBL'; }
    else if (c == 'CBL') { return 'CBR'; }
  }

  for (row = 0; row < rows; row++) {
    var curves_in_row = 0;
    var starting_curve = null;
    var cells_in_row = 0;

    for (col = 0; col < cols; col++) {
      var entry = null;

      if (curves_in_row == 2) {
        entry = null;
      } else if (curves_in_row == 0) {
        if (row == 0) {
          entry = _.sample(['CTL', 'CBL', 'SQ', null])
        } else {
          if (plan[row-1][col] == 'CBL') {
            entry = _.sample(['CTL', null]) 
          } else {
            entry = _.sample(['CBL', 'SQ', null])
          }
        }
      } else if (curves_in_row == 1) {
        var possibilities = ['SQ']
        if (starting_curve) {

          /* /CTL CTR\
             \CBL CBR/
          */
          if (cells_in_row % 2 == 0) {
            console.log('appending opposite curve of ' + starting_curve + ': ' + opposite_curve(starting_curve))
            possibilities.push(opposite_curve(starting_curve))

          } else {
            console.log('appending mirror curve of ' + starting_curve + ': ' + vertical_mirror_curve(starting_curve))
            possibilities.push(vertical_mirror_curve(starting_curve))
          }
        }

        entry = _.sample(possibilities)
      }

      if (entry != null) {
        cells_in_row += 1
        if (curves_in_row == 0 || is_curve(entry)) {
          curves_in_row += 1;
        }
        if (!starting_curve && is_curve(entry)) {
          starting_curve = entry;
        }
      }
      console.log("adding " + entry + " now have curves in row " + curves_in_row + " starting with " + starting_curve)
      plan[row][col] = entry
    }
  }

  var drawn_plan = _.map(plan, function(row) {
    return _.map(row, function(entry) {
      switch(entry) {
        case 'SQ':
          return '[]'
        case 'CBL':
          return '\\'
        case 'CTL':
          return '/'
        case 'CTR':
          return '\\'
        case 'CBR':
          return '/'
      }
    }).join('')
  }).join('\n')

  var written_plan = _.map(plan, function(row) {
    return _.map(row, function(entry) {
      switch(entry) {
        case 'SQ':
          return 'SQQ'
        case null:
          return '   '
        default:
          return entry
      }
    }).join('-')
  }).join('\n')

  console.log(plan)
  console.log(drawn_plan)
  console.log(written_plan)
  return plan
}

function make_coloring_plan(plan) {
  var fill_plan = createArray(plan.length, plan[0].length);

  _.times(plan.length, function(row) {
    _.times(plan[row].length, function(col) {
     if (fill_plan[row][col] == null) {
        fill_plan[row][col] = new Object();
      }
      plan_entry = plan[row][col];
      entry = fill_plan[row][col];
      if (is_curve(plan_entry)) {
        entry.top = new Object();
        entry.top.orientation = plan_entry;
        entry.top.colors = makeColors();
      } else {
        entry.top = new Object();
        entry.top.orientation = 'CTL';
        entry.top.colors = makeColors();
      }
    })
  })
  console.log(fill_plan)
  return fill_plan;
}

function draw_circles(ctx, colors, radius, band_width, padding) {
  var radiiAndColors = []
  var currentRadius = radius
  var currentColorIndex = 0

  while (currentRadius > 0) {
    radiiAndColors.push([currentRadius, colors[currentColorIndex % colors.length]])
    currentRadius -= band_width;
    currentColorIndex += 1
  }
  // radiiAndColors.reverse()
  console.log(radiiAndColors)

  console.log('\n\n circles!!!!')
  console.log('drawing with colors: ' + colors)

  var iterations = Math.floor(radius / band_width)
  _.each(radiiAndColors, function(radiusAndColor, index) {

    var radius = radiusAndColor[0]
    var color = radiusAndColor[1]
    // console.log('drawing circle ' + index + ' with color ' + color + ' & radius: ' + radius)
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(0, 0)
    ctx.arc(padding,padding,radius-padding, 0,Math.PI / 2);
    ctx.fill();

    ctx.strokeStyle = '#ffffff'
    ctx.lineWidth = padding;
    ctx.beginPath();
    ctx.arc(padding, padding,radius-padding, 0,Math.PI / 2);
    ctx.stroke();

    radius -= band_width
  })
}

function draw_square_border(ctx, size, border_size, color) {
  ctx.save()
  ctx.beginPath()
  ctx.rect(border_size/2, border_size/2, size - border_size, size - border_size)
  ctx.strokeStyle = color;
  ctx.lineWidth = border_size;
  ctx.stroke();
  ctx.restore();

  // ctx.beginPath()
  // ctx.rect(border_size, border_size, size - border_size*2, size - border_size*2)
  // ctx.strokeStyle = 'white'
  // ctx.lineWidth = 1
  // ctx.stroke();
}

function reorient(ctx, size, orientation) {
  rotate = 0
  switch(orientation) {
    case 'CBL':
      rotate = 90
      break;
    case 'CTL':
      rotate = -180
      break;
      return '/'
    case 'CTR':
      rotate = 270;
      break;
    case 'CBR':
      rotate = 0
      break;
  }

  // ctx.translate(size/ 2, size / 2)
  // ctx.rotate(rotate * (Math.PI/180))
  // ctx.translate(-size/2, -size/2)

}

function draw_curved_border(ctx, size, border_size, border_color, orientation) {
  ctx.save()
  reorient(ctx, size, orientation)

  // ctx.beginPath()
  // ctx.moveTo(0, 0)
  // ctx.arc(0, 0, size - border_size, 0, Math.PI / 2);
  // ctx.lineTo(size, size)
  // ctx.strokeStyle = '#ffffff'
  // ctx.lineWidth = 2
  // ctx.stroke();

  ctx.strokeStyle = border_color;
  ctx.lineWidth = border_size;
  ctx.beginPath()
  ctx.moveTo(border_size/2, border_size/2)
  ctx.lineTo(size - border_size / 2, border_size / 2)
  ctx.arc(border_size/2, border_size/2, size - border_size , 0, Math.PI / 2);
  ctx.lineTo(border_size/2, 0)
  ctx.stroke();

  ctx.restore();
}

function render_cell({ 
  ctx = this.ctx,
  coloring_plan = this.coloring_plan,
  plan = this.plan, 
  row = this.row,
  col = this.col,
  pane_size = this.pane_size,
  arc_size = this.arc_size,
  border_size = this.border_size,
  arc_border_size = this.arc_border_size
}) {
  function draw_coloring_plan_entry(coloring_plan_entry) {
    ctx.save()
    if (!coloring_plan_entry) {
      return;
    }
    // reorient(ctx, pane_size, coloring_plan_entry.orientation)
    // draw_circles(ctx, coloring_plan_entry.colors, pane_size - border_size + 1, arc_size, arc_border_size)
    ctx.restore();
  }

  ctx.save()
  var entry = plan[row][col]
  console.log('drawing ' + row + ', ' + col + ': ' + entry)
  console.log(pane_size)
  ctx.translate(pane_size*col, pane_size*row)
  console.log('moving to ' + pane_size*row + ', ' + pane_size*col)

  if (entry != null) {
    coloring_plan_entry = coloring_plan[row][col]
    if (coloring_plan_entry) {
      draw_coloring_plan_entry(coloring_plan_entry.top)
      draw_coloring_plan_entry(coloring_plan_entry.bottom)
    }

    if (is_curve(entry)) {
      console.log('drawing curve')
      draw_curved_border(ctx, pane_size, border_size, getRndColor(), entry);
    } else {
      console.log('drawing square')
      draw_square_border(ctx, pane_size, border_size, getRndColor());
    }
  }

  ctx.restore()
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

  var colors1 = makeColors()
  var colors2 = makeColors()

  var canvas_size = canvas.width
  var num_panes_per_row = 5

  var pane_size = canvas_size / num_panes_per_row

  var arc_size = pane_size * 0.12
  var border_size = pane_size * 0.15
  var arc_border_size = 1

  var plan = make_plan()
  plan = [['CTL', 'CTL', 'CTL']]
  var coloring_plan = make_coloring_plan(plan)
  var min_x_index = _.min(_.map(plan, function(row) { return _.findIndex(row, function(e) { return e != null }) }))
  var max_x_index = _.max(_.map(plan, function(row) { return _.findLastIndex(row, function(e) { return e != null }) })) + 1
  var max_y_index = _.findLastIndex(plan, function(row) { return _.filter(row, null) != 0 }) + 1
  console.log(max_x_index)
  console.log(max_y_index)
  var pane_size = _.min([canvas.width / max_x_index, canvas.height / max_y_index])
  // TODO: figure out why 1-row plans are failing
  // debugger;

  _.times(plan.length, function(row) {
    _.times(plan[row].length, function(col) {
      render_cell({
        ctx: ctx,
        coloring_plan: coloring_plan,
        plan: plan, 
        row: row, 
        col: col,
        pane_size: pane_size,
        arc_size: arc_size,
        border_size: border_size,
        arc_border_size: arc_border_size
      })
    })
  })
  ctx.restore();
}
