var Twit = require('twit')
var T = new Twit(require('./config.js'));

var Canvas = require('canvas');

var fs = require('fs');

var max_x = 1200;
var max_y = 800;
var canvas = new Canvas(max_x, max_y);

var benjamin_moore = require('./benjamin_moore');
benjamin_moore.draw_everything(canvas);

Math.seed = function(s) {
    return function() {
        s = Math.sin(s) * 10000; return s - Math.floor(s);
    };
};

var seed = new Date().getTime()
Math.random = Math.seed(seed)

T.post('media/upload', { media_data: canvas.toBuffer().toString('base64') }, function (err, data, response) {
  var mediaIdStr = data.media_id_string

  var params = { status: 'Benjamin Moore Series ' + seed, media_ids: [mediaIdStr] }

  T.post('statuses/update', params, function (err, data, response) {
    console.log(data)
  })
});
