var Twit = require('twit')
var T = new Twit(require('./config.js'));

var Canvas = require('canvas');

var fs = require('fs');
var _ = require('underscore')

var argv = require('minimist')(process.argv.slice(2));
console.dir(argv);

var max_x = 1200;
var max_y = 800;
var canvas = new Canvas(max_x, max_y);

var draw_modules = [
  require('./benjamin_moore'),
  require('./jaspers_dilemma'), 
]

var draw_module = _.sample(draw_modules);
draw_module.draw_everything(canvas, argv['glitch'] || false);

Math.seed = function(s) {
  return function() {
    s = Math.sin(s) * 10000; return s - Math.floor(s);
  };
};

var seed = new Date().getTime()
Math.random = Math.seed(seed)

T.post('media/upload', { media_data: canvas.toBuffer().toString('base64') }, function (err, data, response) {
  var mediaIdStr = data.media_id_string

  var params = { status: draw_module.title + ' ' + seed, media_ids: [mediaIdStr] }

  T.post('statuses/update', params, function (err, data, response) {
    console.log(data)
  })
});

