/* other ideas
http://jsfiddle.net/95tft/
http://perfectionkills.com/exploring-canvas-drawing-techniques/#pen-2

antialiased thick line: http://members.chello.at/~easyfilter/bresenham.html
*/

if (typeof module !== 'undefined' && module.exports) {
  console.log('exports')
  var _ = require('underscore');
  var Simple1DNoise = require('./noise').Simple1DNoise;
}

class ShapeUtil {
   constructor(context, percentage, noisy, seed) {
    this.context = context;
    this.percentage = percentage;
    this.noisy = noisy;
    this.seed = seed;
  }


  draw_noisy_shape() {
    var points = Array.prototype.slice.call(arguments, 1);
    this.draw_noisy_shape_helper({
      points: points,
      closed: true,
      percentage: this.percentage
    })
  }

  draw_noisy_line() {
    var points = Array.prototype.slice.call(arguments, 1);
    this.draw_noisy_shape_helper({
      points: points,
      closed: false,
      percentage: this.percentage
    })
  }

  draw_noisy_shape_helper(params) {
    var context = this.context;
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
    this.draw_clean_shape_helper(params)
    context.lineWidth = origLineWidth

    var generator = new Simple1DNoise(points[0][0]);

    function line_cb(x1, y1, x2, y2) {
      context.beginPath();
      this.draw_noisy_line_helper(generator, x1, y1, x2, y2)
      context.stroke();
    }

    this.draw_percentage_shape_helper(_.bind(line_cb, this), params)
  }

  draw_clean_shape() {
    var points = Array.prototype.slice.call(arguments, 1);
    this.draw_clean_shape_helper({
      points: points,
      closed: true,
      percentage: this.percentage
    })
  }

  distance(p1, p2) {
    var x1 = p1[0]
    var y1 = p1[1]
    var x2 = p2[0]
    var y2 = p2[1]

    var d = Math.sqrt( (x1-x2)*(x1-x2) + (y1-y2)*(y1-y2) );
    return d;
  }

  sum_array(array) {
    return _.reduce(array, function(a, b) { return a + b}, 0)
  }

  total_distance(points) {
    function sliding(array, window) {
      var i, length = array.length, iterations = length - window, accum = [];
      if(iterations < 1) return [array.slice(0, window)];
      for (i = 0; i <= iterations; ++i)
        accum.push(array.slice(i, i + window));
      return accum;
    }

    var distances = _.map(sliding(points, 2), function(points, index) {
      var p1 = points[0]
      var p2 = points[1]
      // console.log('distance from ' + p1 + ' to ' + p2)
      return this.distance(p1, p2)
    }, this);

    var totalDistance = this.sum_array(distances);
    return totalDistance;
  }

  draw_percentage_shape_helper(line_cb, params) {
    var context = this.context;
    var points = params.points;
    var closed = params.closed;
    var percentage = params.percentage;

    if (Array.isArray(points[0]) && Array.isArray(points[0][0])) {
      points = points[0]
    }
    var totalDistance = this.total_distance(points);

    var firstPoint = points[0]
    var restPoints = Array.prototype.slice.call(points, 1);

    var distanceToHit = totalDistance * percentage;
    var distanceSoFar = 0
    context.moveTo(firstPoint[0], firstPoint[1])
    var lastPoint = firstPoint;

    for (var i = 0; i < points.length; i++) {
      var point = points[i];
      // console.log('looking at point ' + i)
      // console.log('distance to lastPoint ' + distance(lastPoint, point))
      // console.log('distanceSoFar: ' + distanceSoFar);

      if (this.distance(lastPoint, point) + distanceSoFar > distanceToHit) {
        var distanceForMe = distanceToHit - distanceSoFar;
        // console.log('distanceForMe: ' + distanceForMe)
        var percentageForMe = distanceForMe / this.distance(lastPoint, point)
        // console.log('percentageForMe: ' + percentageForMe)
        var newX = lastPoint[0] + ((point[0] - lastPoint[0]) * percentageForMe)
        var newY = lastPoint[1] + ((point[1] - lastPoint[1]) * percentageForMe)

        line_cb(lastPoint[0], lastPoint[1], newX, newY)
        // context.lineTo(point[0], point[1])
        break;
      } else {
        // console.log('draw full line')
        distanceSoFar += this.distance(lastPoint, point);
        line_cb(lastPoint[0], lastPoint[1], point[0], point[1])
      }
      lastPoint = point;
    }
  }

  draw_clean_shape_helper(params) {
    var context = this.context;
    var points = params.points;
    var closed = params.closed;

    context.beginPath();

    function line_cb(x1, y1, x2, y2) {
      context.lineTo(x2, y2)
    }
    this.draw_percentage_shape_helper(line_cb, params)

    context.stroke();

    // closed shape, need to overdraw for dumb reasons
    // TODO: bring this back
    if (closed) {
      // console.log('we should overdraw')
      // points.forEach(function(point) {
      //   context.lineTo(point[0], point[1])
      // });
      // context.stroke()
    }
  }

  draw_noisy_line_helper(generator, x0, y0, x1, y1) {
    var context = this.context;
    
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
      for (var i=0; i<=dx; i++) {
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
      for (var i=0; i<=dy; i++) {
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

  // drawLine(from_x, from_y, to_x, to_y) {
  //   var slope = from_x - to_x / from_y - to_y;

  //   context.save()
  //   context.beginPath();
  //   context.strokeStyle="#FF0000";
  //   context.moveTo(from_x, from_y);
  //   context.lineTo(to_x, to_y);
  //   // context.stroke();
  //   context.restore()

  //   context.strokeStyle="#000000";

  //   context.beginPath();
  //   context.moveTo(from_x, from_y)

  //   var distance = 0.0
  //   _.times(1000, function(x) {
  //     var distance = x / Math.abs(Math.floor(from_x - to_x))
  //     var x_offset = (distance * (to_x - from_x)) + from_x
  //     var y_offset = (distance * (to_y - from_y)) + from_y
  //     var x_jitter = 0  // (Math.random() * 10) - 5
  //     var y_jitter = generator.getVal(x) - 0.5
  //     context.lineTo(x_offset , y_offset + y_jitter)
  //   })

  //   context.stroke();
  // }

  draw_clean_line() {
    var points = Array.prototype.slice.call(arguments, 1);

    this.draw_clean_shape_helper({
      points: points,
      closed: false,
      percentage: this.percentage
    })
  }

  draw_lines(ctx, lines) {
    var lineFunc = null;

    if (this.noisy) {
      lineFunc = _.bind(this.draw_noisy_shape_helper, this)
    } else {
      lineFunc = _.bind(this.draw_clean_shape_helper, this)
    }

    var totalDistance = this.sum_array(
      _.map(lines, function(points) {return this.total_distance(points) }, this)
    )

    // console.log('totalDistance: ' + totalDistance)

    var distanceToHit = totalDistance * this.percentage;
    var distanceSoFar = 0
    
    for (var i = 0; i < lines.length; i++) {
      // console.log('line: ' + i)
      var line = lines[i];
      var lineDistance = this.total_distance(line);

      var percentageForMe = 1.0;
      if (distanceSoFar > distanceToHit) {
        break;
      }
      
      if (distanceSoFar + lineDistance > distanceToHit) {
        var distanceForMe = distanceToHit - distanceSoFar;
        // console.log('distanceForMe: ' + distanceForMe)
        percentageForMe = distanceForMe / lineDistance;
      }
      distanceSoFar += lineDistance;
      // console.log('percentageForMe: ' + percentageForMe)
      lineFunc({
        points: line,
        closed: false,
        percentage: percentageForMe
      })
    }
  }

  draw_line() {
    if (this.noisy) {
      this.draw_noisy_line.apply(this, arguments)
    } else {
      this.draw_clean_line.apply(this, arguments)
    }
  }

  draw_shape() {
    if (this.noisy) {
      this.draw_noisy_shape.apply(this, arguments)
    } else {
      this.draw_clean_shape.apply(this, arguments)
    }
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    ShapeUtil: ShapeUtil
  };
}