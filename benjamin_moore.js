if (typeof module !== 'undefined' && module.exports) {
  console.log('exports')
  var _ = require('underscore');
  var tinycolor = require("tinycolor2");
  var ShapeUtil = require("./shape_util").ShapeUtil;
  var glitch_context = require("./glitch_context");
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

class BenjaminMoore {
  constructor(params) {
    this.colors = null;
    this.colorIndex = null;
    this.initColors();
    this.shouldGlitchAtAll = null;

    var canvas = params.canvas
    var always_glitch = params.always_glitch
    var min_square_size = params.min_square_size

    if (Math.random() < 0.6) {
      this.initColors();
    }

    // if (Math.random() < 0.99) {  
    //   draw_noisy_shape = draw_clean_shape
    //   console.log('everything should be clean now')
    // }

    this.shouldGlitchAtAll = always_glitch;

    var ctx = new glitch_context.GlitchContext(canvas.getContext('2d'));
    // var ctx = canvas.getContext('2d');
    this.ctx = ctx;
    ctx.save();

    var max_x = canvas.width;
    var max_y = canvas.height;

    // ctx.antialias = 'none';

    // draw background
    ctx.fillStyle = '#e0e0e0'
    // ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, max_x, max_y);

    // pick number of lines
    this.num_lines = randInt(5, 10) * 2;
    this.num_bands = this.num_lines + 1

    min_square_size = min_square_size || 150;
    console.log('min square size: ' + min_square_size)
    var max_cols = max_x / min_square_size
    console.log('max cols: ' + max_cols)

    this.cols = randInt(2, max_cols)
    this.rows = Math.max(1, Math.floor(this.cols * (max_y / max_x) * (randInt(60, 100)/100)))
    if (params['rows']) { this.rows = parseInt(params['rows'])}
    if (params['cols']) { this.cols = parseInt(params['cols'])}


    var total_squares = this.cols * this.rows

    console.log((max_x / this.cols))
    console.log((max_y / this.rows))
    console.log('rows: ' + this.rows)
    console.log('cols: ' + this.cols)

    this.square_size = Math.min(
      (max_x / this.cols),
      (max_y / this.rows)
    ) * (randInt(60, 90)/100)

    this.padding_between_squares = Math.min(
      (max_y - (this.square_size * this.rows)) / (this.rows - 1),
      this.square_size * 0.1
    )

    // figure out line spacing
    // TODO: make this very clean integers the whole way
    this.band_to_line_width_multiplier = randInt(2, 5);

    this.drawing_funcs = [
      this.make_lines, 
      this.make_slants, this.make_corners,
      this.make_squares, this.make_cross, this.make_spiral
    ]

    shuffle(this.drawing_funcs)

    var inner_x = (this.cols * this.square_size) + (this.padding_between_squares * (this.cols - 1))
    var inner_y = (this.rows * this.square_size) + (this.padding_between_squares * (this.rows - 1))

    ctx.translate(
      (max_x - inner_x) / 2,
      (max_y - inner_y) / 2
    )
  }

  initColors() {
    var colorOptions = [
      tinycolor(getRndColor()).analogous(randInt(10, 100), 100),
      tinycolor(getRndColor()).tetrad().slice(1),
      tinycolor(getRndColor()).triad(),
      _.times(100, function() { return tinycolor(getRndColor()); })
    ]
    var colors = _.sample(colorOptions)

    var colorFunctions = ['lighten', 'darken', 'brighten', 'saturate', 'desaturate']
    var colorFunction = _.sample(colorFunctions)
    colors = colors.map(function(c) { return c[colorFunction](randInt(0, 20)); })

    this.colors = colors.map(function(t) { return t.toHexString(); })
    this.colorIndex = 0;
  }

  maybeInitColors() {
    // please remove this awful globals hack
    if (this.colors === null) {
      this.initColors()
    }
  }

  getNextColor() {
    this.maybeInitColors();

    var c = this.colors[this.colorIndex % this.colors.length];
    this.colorIndex+=1;
    return c;
  }

  make_shape_helper(ctx, shape_util, num_lines, band_to_line_width_multiplier, max_x, max_y, draw_cb) {
    // console.log(arguments)
    // pick color
    // TODO: make these colors within reasonable bounds, complimentary, etc
    var bg_color = this.getNextColor();
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
    // ctx.beginPath()
    // ctx.rect(0, 0, max_x, max_y);
    // ctx.stroke();
    // ctx.clip();
    _.bind(draw_cb, this, ctx, shape_util, max_x, max_y, line_width, band_width, bg_color, fg_color, num_lines)();
    ctx.restore();
  }

  calculateOffset(line_index, line_width, band_width) {
    var glitch = Math.random() < 0.6
    if (this.shouldGlitchAtAll && glitch) {
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

  make_corners(ctx, shape_util, max_x, max_y, line_width, band_width, bg_color, fg_color, num_lines) {
    var that = this;
    ctx.lineWidth = line_width;
    // ctx.clip();
    _(num_lines).times(function(line_index) {
      var offset = that.calculateOffset(line_index, line_width, band_width)
      shape_util.draw_line(ctx,
        [offset(), 0],
        [offset(), max_y - offset()],
        [max_x, max_y - offset()]
      )
    })
  }

  make_squares(ctx, shape_util, max_x, max_y, line_width, band_width, bg_color, fg_color, num_lines) {
    var that = this;
    ctx.lineWidth = line_width;
    // num_lines must be even
    _(num_lines / 2).times(function(line_index) {
      var offset = that.calculateOffset(line_index, line_width, band_width)
      shape_util.draw_shape(ctx,
        [offset(), offset()],
        [offset(), max_y - offset()],
        [max_x - offset(), max_y - offset()],
        [max_x - offset(), offset()],
        [offset(), offset()]
      )
    })
  }

  make_lines(ctx, shape_util, max_x, max_y, line_width, band_width, bg_color, fg_color, num_lines) {
    var that = this;

    ctx.lineWidth = line_width;
    var lines = _(num_lines).times(function(line_index) {
      var offset = that.calculateOffset(line_index, line_width, band_width)
      return [[offset(), 0], [offset(), max_y]]
    })
    shape_util.draw_lines(ctx, lines)
  }

  make_slants(ctx, shape_util, max_x, max_y, line_width, band_width, bg_color, fg_color, num_lines) {
    var that = this;
    ctx.antialias = 'default';
    ctx.lineWidth = line_width;
    var lines = _(num_lines).times(function(line_index) {
      var offset = that.calculateOffset(line_index, line_width, band_width)
      return [[offset(), 0], [0, offset()]]
    })

    lines = lines.concat([[[0, max_y], [max_x, 0]]])

    lines = lines.concat(_(num_lines).times(function(line_index) {
      var offset = that.calculateOffset(line_index, line_width, band_width)
      return [[offset(), max_y], [max_x, offset()]]
    }))

    shape_util.draw_lines(ctx, lines)
  }

  make_cross(ctx, shape_util, max_x, max_y, line_width, band_width, bg_color, fg_color, num_lines) {
    var that = this;
    var local_num_lines = num_lines + 1
    var band_to_line_width_multiplier = band_width / line_width;
    var line_width = max_x*1.0 / (local_num_lines + local_num_lines*band_to_line_width_multiplier + band_to_line_width_multiplier)
    var band_width = line_width * band_to_line_width_multiplier

    ctx.lineWidth = line_width;
    function draw_quarters() {
      function upper_right(offset) {
        return [[offset(), 0],
          [offset(), max_y - offset()],
          [max_x, max_y - offset()]]
      }

      function lower_left(offset) {
        return [[0, offset()],
          [max_x - offset(), offset()],
          [max_x - offset(), max_y]]
      }

      function upper_left(offset) {
        return [[0, max_y - offset()],
          [max_x - offset(), max_y - offset()],
          [max_x - offset(), 0]]
      }

      function lower_right(offset) {
        return [[offset(), max_y],
          [offset(), offset()],
          [max_x, offset()]]
      }

      var funcs = [upper_left, upper_right, lower_right, lower_left]

      function make_corner(cb) {
        return _(num_lines / 2 ).times(function(line_index) {
          line_index = num_lines - line_index
          var offset = that.calculateOffset(line_index, line_width, band_width)
          return cb(offset)
        })
      }

      var lines = []
      _.each(funcs, function(cb) {
        lines = lines.concat(make_corner(cb))
      })
      return lines;
    }

    var lines = draw_quarters()

    lines.push([[max_x / 2, 0], [max_x / 2, max_y]])
    lines.push([[0, max_y /2], [max_x, max_y / 2]])

    shape_util.draw_lines(ctx, lines)
  }

  make_spiral(ctx, shape_util, max_x, max_y, line_width, band_width, bg_color, fg_color, num_lines) {
    ctx.lineWidth = line_width;
    var points = []
    // console.log("num lines " + num_lines)
    _(num_lines / 2).times(_.bind(function(line_index) {
      var offset = this.calculateOffset(line_index, line_width, band_width)
      points.push([offset(), offset() - band_width - line_width])
      points.push([offset(), max_y - offset()])
      points.push([max_x - offset(), max_y - offset()])
      points.push([max_x - offset(), offset()])
      points.push([offset() + band_width + line_width, offset()])
    }, this))
    shape_util.draw_line(ctx, points)
  }

  draw_everything(params) {
    this.colorIndex = 0
    var percentage = params.percentage;
    var ctx = this.ctx;
    // console.log(ctx)
    ctx.save()

    var noisy = true;
    noisy = false;
    var shape_util = new ShapeUtil(this.ctx, percentage, noisy)
    // console.log(this)

    _(this.rows*this.cols).times(_.bind(function(index) {
      var y_index = Math.floor(index / this.cols)
      var y_offset = (y_index * this.square_size) + (y_index * this.padding_between_squares)

      var x_index = index % this.cols
      var x_offset = (x_index * this.square_size) + (x_index * this.padding_between_squares)

      ctx.save()

      ctx.translate(x_offset, y_offset)

      // possibly spin it
      // ctx.translate(this.square_size/2, this.square_size/2)
      // ctx.rotate(Math.PI * (randInt(0, 3) / 2))
      // ctx.translate(-this.square_size/2, -this.square_size/2)

      var drawing_func = this.drawing_funcs[index % this.drawing_funcs.length]

      this.make_shape_helper(
        this.ctx, 
        shape_util,
        this.num_lines, 
        this.band_to_line_width_multiplier, 
        this.square_size, 
        this.square_size, 
        drawing_func
      )
      ctx.restore()
    }, this))

    ctx.restore();
  }
}

if (typeof module !== 'undefined' && module.exports) {
  console.log('exports')
  module.exports = {
    BenjaminMoore: BenjaminMoore,
    title: 'Benjamin Moore Series'
  };
}