if (typeof module !== 'undefined' && module.exports) {
  var _ = require('underscore');
}

module.exports = {
  draw_everything: draw_everything
};

function getRndColor() {
    var r = 255*Math.random()|0,
        g = 255*Math.random()|0,
        b = 255*Math.random()|0;
    return 'rgb(' + r + ',' + g + ',' + b + ')';
}

function calculate_isosceles_height(base) {
  return (base/2)*Math.tan(Math.PI/4)
}


function make_triangle(ctx, triangleWidth, num_lines, line_width, line_padding) {
  // pick color
  // TODO: make these colors within reasonable bounds, complimentary, etc
  var bg_color = getRndColor();
  var fg_color = '#FFFFFF';

  x = 0
  y = 0 
  triangleHeight = calculate_isosceles_height(triangleWidth)

  ctx.beginPath()
  ctx.moveTo(x, y)
  ctx.lineTo(x + triangleWidth / 2, y + triangleHeight)
  ctx.lineTo(x + triangleWidth, y)
  ctx.closePath()
  ctx.clip()

ctx.fillStyle = bg_color
  _.times(num_lines, function(index) {
    ctx.fillRect(0, index*(line_width+line_padding), triangleWidth, line_width)
  })

}

function draw_everything(canvas) {
  var ctx = canvas.getContext('2d');

  var max_x = canvas.width;
  var max_y = canvas.height;
  make_triangle(ctx, canvas.width, 100, 20, 5)
}