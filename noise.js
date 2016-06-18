/* other ideas
http://jsfiddle.net/95tft/
http://perfectionkills.com/exploring-canvas-drawing-techniques/#pen-2

antialiased thick line: http://members.chello.at/~easyfilter/bresenham.html
*/

module.exports = {
  draw_noisy_shape: draw_noisy_shape,
  draw_noisy_line: draw_noisy_line,
  draw_clean_shape: draw_clean_shape
};

var Simple1DNoise = function() {
    var MAX_VERTICES = 256;
    var MAX_VERTICES_MASK = MAX_VERTICES -1;
    var amplitude = 1;
    var scale = 1;

    var r = [];

    for ( var i = 0; i < MAX_VERTICES; ++i ) {
        r.push(Math.random());
    }

    var getVal = function( x ){
        var scaledX = x * scale;
        var xFloor = Math.floor(scaledX);
        var t = scaledX - xFloor;
        var tRemapSmoothstep = t * t * ( 3 - 2 * t );

        /// Modulo using &
        var xMin = xFloor & MAX_VERTICES_MASK;
        var xMax = ( xMin + 1 ) & MAX_VERTICES_MASK;

        var y = lerp( r[ xMin ], r[ xMax ], tRemapSmoothstep );

        return y * amplitude;
    };

    /**
    * Linear interpolation function.
    * @param a The lower integer value
    * @param b The upper integer value
    * @param t The value between the two
    * @returns {number}
    */
    var lerp = function(a, b, t ) {
        return a * ( 1 - t ) + b * t;
    };

    // return the API
    return {
        getVal: getVal,
        setAmplitude: function(newAmplitude) {
            amplitude = newAmplitude;
        },
        setScale: function(newScale) {
            scale = newScale;
        }
    };
};

function draw_noisy_shape(context) {
  var points = Array.prototype.slice.call(arguments, 1);
  draw_noisy_shape_helper({
    context: context,
    points: points,
    closed: true
  })
}

function draw_noisy_line(context) {
  var points = Array.prototype.slice.call(arguments, 1);
  draw_noisy_shape_helper({
    context: context,
    points: points,
    closed: false
  })
}

function draw_noisy_shape_helper(params) {
  var context = params.context;
  var points = params.points;
  var closed = params.closed;

  // if was passed like f(x, [p0, p1], [p2, p3])
  // then points will be an array of arrays
  // if was passed like f(x, [[p0, p1], [p2, p3]])
  // then points will be array of array of arrays?

  if (Array.isArray(points[0]) && Array.isArray(points[0][0])) {
    points = points[0]
  }

  var origLineWidth = context.lineWidth
  context.lineWidth = origLineWidth*0.9;
  draw_clean_shape_helper(params)
  context.lineWidth = origLineWidth

  var lastPoint = points.shift();
  points.forEach(function(point) {
    context.beginPath();
    draw_noisy_line_helper(context, lastPoint[0], lastPoint[1], point[0], point[1])
    lastPoint = point;
    context.stroke();
  })
}

function draw_clean_shape(context) {
  var points = Array.prototype.slice.call(arguments, 1);
  draw_clean_shape_helper({
    context: context,
    points: points,
    closed: true
  })
}

function draw_clean_shape_helper(params) {
  var context = params.context;
  var points = params.points;
  var closed = params.closed;

  if (Array.isArray(points[0]) && Array.isArray(points[0][0])) {
    points = points[0]
  }

  context.beginPath();
  var firstPoint = points[0]
  var restPoints = Array.prototype.slice.call(points, 1);
  context.moveTo(firstPoint[0], firstPoint[1])
  points.forEach(function(point) {
    context.lineTo(point[0], point[1])
  });
  context.stroke()

  // closed shape, need to overdraw for dumb reasons
  if (closed) {
    console.log('we should overdraw')
    points.forEach(function(point) {
      context.lineTo(point[0], point[1])
    });
    context.stroke()
  }
}

function draw_noisy_line_helper(context, x0, y0, x1, y1) {
  var generator = new Simple1DNoise();

  var dx = x1 - x0;
  var dy = y1 - y0;

  var inc_x = (dx >= 0) ? +1 : -1;
  var inc_y = (dy >= 0) ? +1 : -1;

  dx = (dx < 0) ? -dx : dx;
  dy = (dy < 0) ? -dy : dy;

  function drawPoint(i, x, x0, y, y0) {
    // for a line width of 7 we want the range to be +/- 0.5
    // var noiseRange = context.lineWidth*1.0 / 7
    var noiseRange = 1
    var noise = (generator.getVal(i)*noiseRange) - (noiseRange/2)
    context.lineTo(x + x0 + noise, y + y0 + noise);
  }

  if (dx >= dy) {
    var d = 2*dy - dx
    var delta_A = 2*dy
    var delta_B = 2*dy - 2*dx

    var x = 0;
    var y = 0;
    for (i=0; i<=dx; i++) {
      drawPoint(i, x, x0, y, y0)
      if (d > 0) {
        d += delta_B;
        x += inc_x;
        y += inc_y;
      }
      else {
        d += delta_A;
        x += inc_x;
      }
    }
  }
  else {
    var d = 2*dx - dy
    var delta_A = 2*dx
    var delta_B = 2*dx - 2*dy

    var x = 0;
    var y = 0;
    for (i=0; i<=dy; i++) {
      drawPoint(i, x, x0, y, y0)
      if (d > 0) {
        d += delta_B;
        x += inc_x;
        y += inc_y;
      }
      else {
        d += delta_A;
        y += inc_y;
      }
    }
  }
}

function drawLine(from_x, from_y, to_x, to_y) {
  var slope = from_x - to_x / from_y - to_y;

  context.save()
  context.beginPath();
  context.strokeStyle="#FF0000";
  context.moveTo(from_x, from_y);
  context.lineTo(to_x, to_y);
  // context.stroke();
  context.restore()

  context.strokeStyle="#000000";

  context.beginPath();
  context.moveTo(from_x, from_y)

  var distance = 0.0
  _.times(1000, function(x) {
    var distance = x / Math.abs(Math.floor(from_x - to_x))
    var x_offset = (distance * (to_x - from_x)) + from_x
    var y_offset = (distance * (to_y - from_y)) + from_y
    var x_jitter = 0  // (Math.random() * 10) - 5
    var y_jitter = generator.getVal(x) - 0.5
    context.lineTo(x_offset , y_offset + y_jitter)
  })

  context.stroke();

}


function draw_clean_line(context, from_x, from_y, to_x, to_y) {
  var slope = from_x - to_x / from_y - to_y;

  context.save()
  context.beginPath();
  context.strokeStyle="#FF0000";
  context.moveTo(from_x, from_y);
  context.lineTo(to_x, to_y);
  context.stroke();
  context.restore()
}
