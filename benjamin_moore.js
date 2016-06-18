// TODO
// fix squares in clean mode

if (typeof module !== 'undefined' && module.exports) {
  var _ = require('underscore');
  var tinycolor = require("tinycolor2");
  var noise = require("./noise");
  var draw_noisy_shape = noise.draw_noisy_shape;
  var draw_clean_shape = noise.draw_clean_shape;
  var draw_noisy_line = noise.draw_noisy_line;

  module.exports = {
    draw_everything: draw_everything,
    title: 'Benjamin Moore Series'
  };
}

function randInt (low, high) {
    return Math.floor(Math.random() * (high - low) + low);
}

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

var colors = null;
var colorIndex = null;
initColors();

var shouldGlitchAtAll = null;

function initColors() {
  colorOptions = [
    tinycolor(getRndColor()).analogous(slices = randInt(10, 100), results = 100),
    tinycolor(getRndColor()).tetrad().slice(1),
    tinycolor(getRndColor()).triad(),
    _.times(100, function() { return tinycolor(getRndColor()); })
  ]
  colors = _.sample(colorOptions)

  var colorFunctions = ['lighten', 'darken', 'brighten', 'saturate', 'desaturate']
  var colorFunction = _.sample(colorFunctions)
  colors = colors.map(function(c) { return c[colorFunction](randInt(0, 20)); })

  colors = colors.map(function(t) { return t.toHexString(); })

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

function make_shape_helper(ctx, num_lines, band_to_line_width_multiplier, max_x, max_y, draw_cb) {
  // pick color
  // TODO: make these colors within reasonable bounds, complimentary, etc
  var bg_color = getNextColor();
  var fg_color = '#FFFFFF';

  // draw background
  ctx.fillStyle = bg_color;
  ctx.fillRect(0, 0, max_x, max_y);

  // draw lines
  ctx.fillStyle = fg_color;
  ctx.strokeStyle = fg_color

  var line_width = max_x*1.0 / (num_lines + num_lines*band_to_line_width_multiplier + band_to_line_width_multiplier)
  console.log('line width: ' + line_width)
  var band_width = line_width * band_to_line_width_multiplier

  ctx.save();
  ctx.beginPath()
  ctx.rect(0, 0, max_x, max_y);
  ctx.stroke();
  ctx.clip();
  draw_cb(ctx, max_x, max_y, line_width, band_width, bg_color, fg_color, num_lines);
  ctx.restore();
}

function calculateOffset(line_index, line_width, band_width) {
  var glitch = Math.random() < 0.6
  if (shouldGlitchAtAll && glitch) {
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

function make_corners(ctx, max_x, max_y, line_width, band_width, bg_color, fg_color, num_lines) {
  ctx.lineWidth = line_width;
  ctx.clip();
  _(num_lines).times(function(line_index) {
    var offset = calculateOffset(line_index, line_width, band_width)
    draw_noisy_line(ctx,
      [offset(), 0],
      [offset(), max_y - offset()],
      [max_x, max_y - offset()]
    )
  })
}

function make_squares(ctx, max_x, max_y, line_width, band_width, bg_color, fg_color, num_lines) {
  ctx.lineWidth = line_width;
  // num_lines must be even
  _(num_lines / 2).times(function(line_index) {
    var offset = calculateOffset(line_index, line_width, band_width)
    draw_noisy_shape(ctx,
      [offset(), offset()],
      [offset(), max_y - offset()],
      [max_x - offset(), max_y - offset()],
      [max_x - offset(), offset()],
      [offset(), offset()]
    )
  })
}

function make_lines(ctx, max_x, max_y, line_width, band_width, bg_color, fg_color, num_lines) {
  ctx.lineWidth = line_width;
  _(num_lines).times(function(line_index) {
    var offset = calculateOffset(line_index, line_width, band_width)
    draw_noisy_line(ctx, [offset(), 0], [offset(), max_y])
  })
}

function make_slants(ctx, max_x, max_y, line_width, band_width, bg_color, fg_color, num_lines) {
  ctx.antialias = 'default';
  ctx.lineWidth = line_width;
  _(num_lines * 3).times(function(line_index) {
    var offset = calculateOffset(line_index, line_width, band_width)
    draw_noisy_line(ctx, [offset() - 15, -15], [0 - 15, offset() - 15])
  })
}

function make_cross(ctx, max_x, max_y, line_width, band_width, bg_color, fg_color, num_lines) {
  var local_num_lines = num_lines + 1
  var band_to_line_width_multiplier = band_width / line_width;
  var line_width = max_x*1.0 / (local_num_lines + local_num_lines*band_to_line_width_multiplier + band_to_line_width_multiplier)
  var band_width = line_width * band_to_line_width_multiplier

  ctx.lineWidth = line_width;
  function draw_quarter() {
    _(num_lines / 2 ).times(function(line_index) {
      line_index = num_lines - line_index
      var offset = calculateOffset(line_index, line_width, band_width)
      draw_noisy_line(ctx, 
        [offset(), 0],
        [offset(), max_y - offset()],
        [max_x, max_y - offset()]
      )
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

  draw_noisy_line(ctx, [max_x / 2, 0], [max_x / 2, max_y])
  draw_noisy_line(ctx, [0, max_y /2], [max_x, max_y / 2])
}

function make_spiral(ctx, max_x, max_y, line_width, band_width, bg_color, fg_color, num_lines) {
  ctx.lineWidth = line_width;
  points = []
  _(num_lines / 2).times(function(line_index) {
    var offset = calculateOffset(line_index, line_width, band_width)
    points.push([offset(), offset() - band_width - line_width])
    points.push([offset(), max_y - offset()])
    points.push([max_x - offset(), max_y - offset()])
    points.push([max_x - offset(), offset()])
    points.push([offset() + band_width + line_width, offset()])
  })
  draw_noisy_line(ctx, points)
}

function draw_everything({
  canvas = this.canvas,
  always_glitch = this.always_glitch,
  min_square_size = this.min_square_size
}) {
  if (Math.random() < 0.6) {
    initColors();
  }
  if (Math.random() < 0.99) {
    // draw_noisy_shape = draw_clean_shape
    console.log('everything should be clean now')
  }

  shouldGlitchAtAll = always_glitch || Math.random() < 0.1;

  var ctx = canvas.getContext('2d');
  ctx.save();

  var max_x = canvas.width;
  var max_y = canvas.height;

  // ctx.antialias = 'none';

  // draw background
  ctx.fillStyle = '#e0e0e0'
  // ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, max_x, max_y);

  // pick number of lines
  var num_lines = randInt(5, 10) * 2;
  var num_bands = num_lines + 1

  min_square_size = min_square_size || 150;
  console.log('min square size: ' + min_square_size)
  var max_cols = max_x / min_square_size
  console.log('max cols: ' + max_cols)
  var cols = randInt(2, max_cols)
  console.log('cols: ' + cols)
  var rows = Math.max(1, Math.floor(cols * (max_y / max_x) * (randInt(60, 100)/100)))

  var total_squares = cols * rows

  console.log((max_x / cols))
  console.log((max_y / rows))
  console.log('rows: ' + rows)
  console.log('cols: ' + cols)

  var square_size = Math.min(
    (max_x / cols),
    (max_y / rows)
  ) * (randInt(60, 90)/100)

  var padding_between_squares = Math.min(
    (max_y - (square_size * rows)) / (rows - 1),
    square_size * 0.1
  )

  // figure out line spacing
  // TODO: make this very clean integers the whole way
  var band_to_line_width_multiplier = randInt(2, 5);

  var drawing_funcs = [
    make_lines, make_slants, make_corners,
    make_squares, make_cross, make_spiral
  ]


  shuffle(drawing_funcs)

  var inner_x = (cols * square_size) + (padding_between_squares * (cols - 1))
  var inner_y = (rows * square_size) + (padding_between_squares * (rows - 1))

  ctx.translate(
    (max_x - inner_x) / 2,
    (max_y - inner_y) / 2
  )

  _(rows*cols).times(function(index) {
    var y_index = Math.floor(index / cols)
    var y_offset = (y_index * square_size) + (y_index * padding_between_squares)

    var x_index = index % cols
    var x_offset = (x_index * square_size) + (x_index * padding_between_squares)

    ctx.save()

    ctx.translate(x_offset, y_offset)

    // possibly spin it
    ctx.translate(square_size/2, square_size/2)
    ctx.rotate(Math.PI * (randInt(0, 3) / 2))
    ctx.translate(-square_size/2, -square_size/2)

    drawing_func = drawing_funcs[index % drawing_funcs.length]
    make_shape_helper(ctx, num_lines, band_to_line_width_multiplier, square_size, square_size, drawing_func)
    ctx.restore()
  })

  ctx.restore();
}