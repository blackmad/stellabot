var falafel = require('falafel');
var argv = require('minimist')(process.argv.slice(2));

var header =
  'function glitchNumber(n) { return n * 0.8+0.2*Math.random(); }' +
  'function noop() { return 0; }'

function file_parser(data) {
  var output = falafel(data, function (node) {
    if (node.type === 'Literal' &&
        node.parent.type === 'CallExpression') {
      console.log('found literal: ')
      console.log(node.parent)
      if (!isNaN(node.source()) && Math.random() < 1.0) {
        node.update('glitchNumber(' + node.source() + ')');
      }
    }

    if (node.type === 'CallExpression' &&
        node.callee.type === 'MemberExpression' &&
        node.callee.object.name === 'ctx' &&
        // node.callee.property.name === 'lineTo' &&
        Math.random() < 0.2
    ) {
      console.log('making ')
      console.log(node)
      console.log(' into noop')
//      node.update('// noop: ' + node.source());
    }
  });

  return header + output;
 // console.log(data);
}

var tmp = require('tmp');
var fs = require('fs');
var exec = require('child_process').execSync;


tmp.dir(function _tempDirCreated(err, path, cleanupCallback) {
  if (err) throw err;
  console.log("Dir: ", path);
  data = fs.readFileSync(argv['g'], 'utf8')
  output = file_parser(data);
  fs.writeFileSync(path + '/' + argv['g'], output)

  var cmd = 'cp -r ' + argv['r'] + ' ' + path
  exec(cmd)

  var cmd = 'cp -r node_modules ' + path
  exec(cmd)

  var cmd = 'node ' + path + '/' + argv['r']
  console.log(cmd)
  exec_output = exec(cmd)
  console.log(exec_output)

  var cmd = 'open ' + path + '/*png'
  console.log(cmd)
  exec(cmd)
  exec(cmd, function(error, stdout, stderr) {})


  // cleanupCallback();
 });
