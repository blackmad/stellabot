/* TODO
 * make the filling in actually work
 * all the borders
 * bring back the inner borders
 */

if (typeof module !== 'undefined' && module.exports) {
  var _ = require('underscore');
  var tinycolor = require("tinycolor2");
  var Utils = require("./utils").Utils
  var ColoringPlanEntry = require('./windowpanes_plan').ColoringPlanEntry;
  var Colors = require('./colors').Colors;
  module.exports = {
    draw_everything: draw_everything,
    title: 'Windowpanes'
  }
}

var randInt = Utils.randInt
var getRndColor = Utils.getRndColor

Math.seed = function(s) {
  return function() {
    s = Math.sin(s) * 10000; return s - Math.floor(s);
  };
};

function vertical_mirror_curve(c) { 
  if (c == 'CTL') { return 'CTR'; } 
  else if (c == 'CTR') { return 'CTL'; }
  else if (c == 'CBR') { return 'CBL'; }
  else if (c == 'CBL') { return 'CBR'; }
}

function horizontal_mirror_curve(c) { 
  if (c == 'CTL') { return 'CBL'; } 
  else if (c == 'CTR') { return 'CBR'; }
  else if (c == 'CBR') { return 'CTR'; }
  else if (c == 'CBL') { return 'CTL'; }
}

function axis_mirror_curve(c) {
  if (c == 'CTL') { return 'CBR'; } 
  else if (c == 'CTR') { return 'CBL'; }
  else if (c == 'CBR') { return 'CTL'; }
  else if (c == 'CBL') { return 'CTR'; }
}

function is_curve(entry) { return _.contains(['CTL', 'CTR', 'CBR', 'CBL'], entry); }
function is_bottom(entry) { return _.contains(['CBR', 'CBL'], entry); }
function is_top(entry) { return _.contains(['CTR', 'CTL'], entry); }

function make_row({ 
  row_index = this.row_index,
  cols = this.cols,
  plan = this.plan
}) {
  var row = Utils.createArray(cols);

  var curves_in_row = 0;
  var starting_curve = null;
  var cells_in_row = 0;

  _.times(cols, function(col_index) {
    var entry = null;

    if (curves_in_row == 2) {
      entry = null;
    } else if (curves_in_row == 0) {
      if (row_index == 0) {
        entry = _.sample(['CTL', 'CBL', 'SQ', null])
      } else {
        if (plan[row_index-1][col_index] == 'CBL') {
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
          console.log('appending opposite curve of ' + starting_curve + ': ' + axis_mirror_curve(starting_curve))
          possibilities.push(axis_mirror_curve(starting_curve))

        } else {
          console.log('appending mirror curve of ' + starting_curve + ': ' + vertical_mirror_curve(starting_curve))
          possibilities.push(vertical_mirror_curve(starting_curve))
        }
      }

      entry = _.sample(possibilities)
    }

    var plan_entry = new ColoringPlanEntry(entry, row_index, col_index);
    if (entry != null) {
      cells_in_row += 1
      if (curves_in_row == 0 || plan_entry.is_curve()) {
        curves_in_row += 1;
      }
      if (!starting_curve && plan_entry.is_curve()) {
        starting_curve = entry;
      }
    }
    console.log("adding " + entry + " now have curves in row " + curves_in_row + " starting with " + starting_curve)
    row[col_index] = plan_entry;
  });

  return row;
}

function make_plan() {
  var rows = 1;
  var cols = 4 //randInt(2, 5);

  var plan = Utils.createArray(rows, cols);

  _.times(rows, function(row_index) {
    var make_row_attempts_left = 10;
    var new_row = null;
    var has_connection = false;

    while (make_row_attempts_left > 0 && !has_connection) {
      new_row = make_row({'cols': cols, 'row_index': row_index, 'plan': plan})
      if (row_index > 0) {
        has_connection = _.find(new_row, function(new_entry, col_index) {
          return plan[row_index-1][col_index].is_connected_below(new_entry)
        })
      } else {
        has_connection = true;
      }
      make_row_attempts_left -= 1;
      console.log('have ' + make_row_attempts_left + ' ' + 'row connection attempts left')
    }

    plan[row_index] = new_row
  })

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
  function fill_in_missing_coloring_plan(entry, colors, orientation) {
    // debugger;
    if (!entry) { return false }

    var entry_to_fill = entry.unset_entry()
    if (!entry_to_fill) { return false }

    if (entry.is_curve() && (entry.orientation != orientation)) {
      return false;
    }

    entry_to_fill.set_orientation(orientation);
    entry_to_fill.set_colors(colors);

    return true;
  }

  function complete_semicircle(row, col, from_entry) {
    var put_down_other_half = false;
    if (plan[row+1] && !is_bottom(from_entry.orientation)) {
      put_down_other_half |= fill_in_missing_coloring_plan(plan[row+1][col], from_entry.colors, horizontal_mirror_curve(from_entry.orientation))
    }
    if (plan[row-1] && !put_down_other_half && !is_top(from_entry.orientation)) {
      put_down_other_half |= fill_in_missing_coloring_plan(plan[row-1][col], from_entry.colors, horizontal_mirror_curve(from_entry.orientation))
    }
    if (!put_down_other_half) {
      put_down_other_half |= fill_in_missing_coloring_plan(plan[row][col+1], from_entry.colors, vertical_mirror_curve(from_entry.orientation))
    }
    if (!put_down_other_half) {
      put_down_other_half |= fill_in_missing_coloring_plan(plan[row][col-1], from_entry.colors, vertical_mirror_curve(from_entry.orientation))
    }

  }

  // first find all the curved pieces, fill those in, and the ones directly next to them
  _.times(plan.length, function(row) {
    _.times(plan[row].length, function(col) {
      entry = plan[row][col];
      if (entry.is_curve()) {
        entry.top.set_orientation(entry.orientation)
        entry.top.set_colors(Utils.makeColors());

        complete_semicircle(row, col, entry.top)
      }
    })
  })

  // do that again for any square pieces that have partial fills

  _.times(plan.length, function(row) {
    _.times(plan[row].length, function(col) {
      var entry = plan[row][col];
      console.log('looking at entry ' + row + ',' + col)
      console.log(entry)
      if (entry.is_partly_full()) {
        var entry_to_set = entry.top;
        var entry_to_mirror = entry.bottom;
        if (entry.top.is_set()) {
          console.log('top is set, setting bottom')
          entry_to_set = entry.bottom;
          entry_to_mirror = entry.top;
        } else {
          console.log('bottom is set, setting top')
        }
        entry_to_set.set_orientation(axis_mirror_curve(entry_to_mirror.orientation))
        entry_to_set.set_colors(Utils.makeColors())
        complete_semicircle(row, col, entry_to_set)
      }
    })
  })

  // need to do that for any empty squares now too

  console.log(plan)
}

function draw_circles(ctx, colors, radius, band_width, border_size, padding) {
  var radiiAndColors = []
  var currentRadius = radius - border_size*1.5
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
    ctx.strokeStyle = color;
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI / 2);
    ctx.lineWidth = border_size;
    ctx.stroke();

    ctx.strokeStyle = '#ffffff'
    ctx.lineWidth = padding;
    ctx.beginPath();
    ctx.arc(0, 0, radius + border_size/2, 0, Math.PI / 2);
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

  ctx.beginPath()
  ctx.rect(border_size, border_size, size - border_size*2, size - border_size*2)
  ctx.strokeStyle = 'white'
  ctx.lineWidth = 1
  ctx.stroke();

  ctx.beginPath()
  ctx.rect(0, 0, size, size)
  ctx.strokeStyle = 'white'
  ctx.lineWidth = 1
  ctx.stroke();
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

  ctx.translate(size/ 2, size / 2)
  ctx.rotate(rotate * (Math.PI/180))
  ctx.translate(-size/2, -size/2)

}

function draw_curved_border(ctx, size, border_size, border_color, entry) {
  var inner_line_width = 1

  ctx.save()
  reorient(ctx, size, entry.orientation)
  ctx.strokeStyle = border_color;
  ctx.lineWidth = border_size;

  ctx.beginPath()
  ctx.moveTo(border_size / 2, size - border_size / 2)
  ctx.lineTo(border_size/2, border_size/2)
  ctx.lineTo(size - border_size / 2, border_size / 2)
  ctx.stroke();

  ctx.beginPath()
  ctx.arc(0, 0, size - border_size/2, 0, Math.PI / 2);
  ctx.stroke();

  ctx.beginPath()
  ctx.moveTo(size - border_size - inner_line_width*2, border_size)
  ctx.lineTo(border_size, border_size) 
  ctx.lineTo(border_size, size - border_size - inner_line_width*2)
  ctx.strokeStyle = '#ffffff'
  ctx.lineWidth = inner_line_width
  ctx.stroke();

  ctx.save();
  ctx.beginPath();
  ctx.rect(border_size, border_size, size - border_size, size - border_size)
  ctx.clip();

  ctx.beginPath()
  ctx.lineWidth = 1
  ctx.arc(0, 0, size - border_size, 0, Math.PI / 2);
  ctx.stroke();

  ctx.restore();

  ctx.restore();
}

function render_cell({ 
  ctx = this.ctx,
  plan = this.plan, 
  row = this.row,
  col = this.col,
  pane_size = this.pane_size,
  arc_size = this.arc_size,
  border_size = this.border_size,
  arc_border_size = this.arc_border_size
}) {
  function draw_entry(entry) {
    ctx.save()
    if (entry.is_set()) {
      reorient(ctx, pane_size, entry.orientation)
      draw_circles(ctx, entry.colors, pane_size, arc_size, border_size, arc_border_size)
    }
    ctx.restore();
  }

  ctx.save()
  var entry = plan[row][col]
  console.log('drawing ' + row + ', ' + col + ': ' + entry)
  console.log(pane_size)
  ctx.translate(pane_size*col, pane_size*row)
  console.log('moving to ' + pane_size*row + ', ' + pane_size*col)

  if (entry != null) {
    if (entry.is_set()) {
      draw_entry(entry.bottom)
      draw_entry(entry.top)
    }

    if (entry.is_curve()) {
      console.log('drawing curve')
      draw_curved_border(ctx, pane_size, border_size, getRndColor(), entry);
    } else {
      console.log('drawing square')
      draw_square_border(ctx, pane_size, border_size, getRndColor());
    }
  }

  ctx.restore()
}

function make_static_plan(orientations) {
  var plan = Utils.createArray(orientations.length, orientations[0].length)
  _.times(orientations.length, function(row) {
    _.times(orientations[0].length, function(col) {
      plan[row][col] = new ColoringPlanEntry(orientations[row][col], row, col)
    })
  })
  return plan;
}


function draw_everything({
  canvas = this.canvas,
  alwaysGlitch = this.alwaysGlitch
}) {
  // var seed = new Date().getTime()
  // var seed = 100
  // Math.random = Math.seed(seed)

  // Colors.initColors();

  var ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = true;
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.moveTo(0, 0)

  ctx.save()

  var canvas_size = canvas.width
  var num_panes_per_row = 5

  var pane_size = Math.floor(canvas_size / num_panes_per_row)

  var arc_size = Math.floor(pane_size * 0.10)
  var border_size = Math.floor(pane_size * 0.10)
  var arc_border_size = 1

  // var plan = make_plan()
  // var plan = make_static_plan([['CBL', 'SQ', 'SQ', 'CBR']])
  // var plan = make_static_plan([['CBL', 'SQ', 'CTR']])
  // var plan = make_static_plan([['CBL', 'SQ', 'SQ', 'SQ', 'CTR']])
  var plan = make_static_plan([['CBL', 'SQ', 'SQ', 'SQ', 'CTR'], ['CBL', 'SQ', 'SQ', 'SQ', 'CTR']])
  make_coloring_plan(plan)

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
