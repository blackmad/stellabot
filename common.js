$(document).ready(function() {
  var html = '<input type="button" class="redraw btn" id="redraw" value="redraw"/>' +
    '<canvas id="myCanvas" width="100%" height="100%" style="border:1px solid #000000;"/>'

  $('body').append($(
    '<input type="button" class="redraw btn" id="redraw" value="redraw"/>'
  ));

  $('body').append($(
    '<canvas id="myCanvas" width="100%" height="100%" style="border:1px solid #000000;"/>'
  ));

  $('body').resize(resize_canvas);

  $('#redraw').click(resize_canvas);

  function resize_canvas(){
    canvas = document.getElementById("myCanvas");
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    draw_everything(canvas, false);
  }

   //setTimeout(draw, 2500);

  console.log('resizing');
  resize_canvas();
});