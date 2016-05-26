function parseQuery(qstr) {
    var query = {};
    var a = qstr.substr(1).split('&');
    for (var i = 0; i < a.length; i++) {
        var b = a[i].split('=');
        query[decodeURIComponent(b[0])] = decodeURIComponent(b[1] || '');
    }
    return query;
}

var params = parseQuery(window.location.search);

var redrawTimeout = null;
if (params['redraw']) {
  redrawTimeout = parseInt(params['redraw']);
}

function resize_canvas(){
  canvas = document.getElementById("myCanvas");
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;

  var forceGlitch = params['glitch'] === 'yes';
  draw_everything(canvas, forceGlitch);

  if (redrawTimeout) {
   setTimeout(resize_canvas, redrawTimeout);
  }
}

$(document).ready(function() {
  var html = '<input type="button" class="redraw btn" id="redraw" value="redraw"/>' +
    '<canvas id="myCanvas" width="100%" height="100%" style="border:1px solid #000000;"/>'

  if (params['interactive'] !== 'no') {
    $('body').append($(
      '<input type="button" class="redraw btn" id="redraw" value="redraw"/>'
    ));
  }

  $('body').append($(
    '<canvas id="myCanvas" width="100%" height="100%" style="border:1px solid #000000;"/>'
  ));

  $(window).on("resize", resize_canvas);
  $('#redraw').on("click", resize_canvas);

  resize_canvas();
});