var Canvas = require('canvas');

var fs = require('fs');

var max_x = 1024;
var max_y = 512;

var _ = require('underscore');
const execSync = require('child_process').execSync;
var tempfs = require('temp-fs');

var BenjaminMoore = require('./benjamin_moore').BenjaminMoore;
var EasingFunctions = require('./easings').EasingFunctions
var util = require('util');
var fs = require('fs');

var argv = require('minimist')(process.argv.slice(2));

// var easingFunction = EasingFunctions[_.sample(Object.keys(EasingFunctions))]
var easingFunction = EasingFunctions['linear']

var times = 20;

function pad(n, width, z) {
  z = z || '0';
  n = n + '';
  return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
}

Math.seed = function(s) {
    return function() {
        s = Math.sin(s) * 10000; return s - Math.floor(s);
    };
};
var originalTime = new Date().getTime();

var canvas = new Canvas(max_x, max_y);

var params = {
  canvas: canvas,
}

if (argv['1']) {
  params['rows'] = 1
  params['cols'] = 1
}
if (argv['glitch'] || argv['g']) {
  params['always_glitch'] = true
}

var benjamin_moore = new BenjaminMoore(params)

var prefix = 'benjamin_moore'

function do_iteration(dirPath, iteration, doneCallback) {
  var output_file = dirPath + '/' + prefix + '_' + pad(iteration, 4) + '.png';
  Math.random = Math.seed(originalTime);

  var percentage = (iteration*1.0)/times;
  console.log('percentage: ' + percentage);

  var params = {
    percentage: easingFunction(percentage)
  }

  console.log(params)

  benjamin_moore.draw_everything(params);

  var out = fs.createWriteStream(output_file);
  var stream = canvas.createPNGStream();

  stream.on('data', function(chunk){
    // console.log('data')
    out.write(chunk);
  });
  stream.on('end', function () {
    out.end();
  })
  out.on('finish', function () {
    if (iteration == times) {
      console.log('done with all framess')
      doneCallback(output_file)
    } else {
      do_iteration(dirPath, iteration + 1, doneCallback);
    }
  })
}

function do_render(opts, callback) {
  var should_animate = opts['animate'];

  if (should_animate) {
      var dirPath = tempfs.mkdirSync().path
      console.log(dirPath)
      do_iteration(dirPath, 0, function() {
        var output_file = prefix + '.gif'
        execSync('ls -l ' + dirPath + '/*png ', {stdio:[0,1,2]});
        var cmd = 'convert ' + dirPath + '/*png -duplicate 1,-2-1 -coalesce ' + output_file
        console.log(cmd)
        execSync(cmd)
        callback(output_file)
      });
    } else {
      times = 1
      do_iteration('.', 1, function(output_file) {
        callback(output_file)
      });
    }

}

var should_animate = argv['animate'] || argv['a'];
do_render({
  animate: should_animate,
}, function(output_file) {
  if (argv['o']) {
    execSync('open -a "Google Chrome" ' + output_file);
  }
});

