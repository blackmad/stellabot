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

var easingFunction = EasingFunctions[_.sample(Object.keys(EasingFunctions))]

var times = 70;


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
var benjamin_moore = new BenjaminMoore({
  canvas: canvas,
  // always_glitch: true
})

var prefix = 'benjamin_moore'

function do_iteration(dirPath, iteration, doneCallback) {
  Math.random = Math.seed(originalTime);
  if (iteration > times) {
    console.log('done with all framess')
    doneCallback();
    return;
  }
  var percentage = (iteration*1.0)/times;
  console.log('percentage: ' + percentage);

  benjamin_moore.draw_everything({
    percentage: easingFunction(percentage)
  });

  var out = fs.createWriteStream(dirPath + '/' + prefix + '_' + pad(iteration, 4) + '.png')
    , stream = canvas.createPNGStream();

  stream.on('data', function(chunk){
    // console.log('data')
    out.write(chunk);
  });
  stream.on('end', function () {
    out.end();
  })
  out.on('finish', function () {
    do_iteration(dirPath, iteration + 1, doneCallback);
  })

}

if (argv['animate']) {
  var dirPath = tempfs.mkdirSync().path
  console.log(dirPath)
  do_iteration(dirPath, 0, function() {
    execSync('ls -l ' + dirPath + '/*png ', {stdio:[0,1,2]});
    var cmd = 'convert ' + dirPath + '/*png -duplicate 1,-2-1 -coalesce ' + prefix + '.gif'
    console.log(cmd)
    execSync(cmd)
    if (argv['o']) {
      execSync('open -a "Google Chrome" ' + prefix + '.gif');
    }
  });
} else {
  times = 1
  do_iteration('.', 1, function() {
    if (argv['o']) {
      execSync('open -a "Google Chrome" ' + prefix + '*.png');
    }
  });
}

