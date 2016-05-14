var falafel = require('falafel');
var argv = require('minimist')(process.argv.slice(2));

var header = 'var glitch_lib = require(\'./glitch_lib\');'

function file_parser(data) {
  var output = falafel(data, function (node) {
    // if (node.type === 'Literal' &&
    //     node.parent.type === 'CallExpression') {
    //   console.log('found literal: ')
    //   console.log(node.parent)
    //   if (!isNaN(node.source()) && Math.random() < 1.0) {
    //     node.update('glitch_lib.glitchNumber(' + node.source() + ')');
    //   }
    // }

      if (
        node.callee && node.callee.object
        && node.callee.object.name === 'ctx'
        && node.callee.property
        && node.callee.property.name === 'clip'
      ) {

        console.log('no-op-ing ' + node.source())
        node.update('/* noop: ' + node.source + '*/')
      }


      if (
        node.callee && node.callee.object
        && node.callee.object.name === 'ctx'
        && node.callee.property
        && node.callee.property.name === 'endPath'
      ) {

        console.log('no-op-ing ' + node.source())
        node.update('/* noop: ' + node.source + '*/')
      }

    if (node.parent 
        && node.parent.type === 'CallExpression'
        && node.parent.callee.type === 'MemberExpression'
        && node.parent.callee.object.name === 'ctx'
        && node.type !== 'MemberExpression'
        // && (!node.callee || node.callee.type !== 'MemberExpression')
        // node.callee.property.name === 'lineTo' &&
        // Math.random() < 0.2
    ) {
      console.log('glitching ' + node.source() + ' argument ')
      // console.log(node)
      node.update('glitch_lib.glitchNumber(' + node.source() + ')');
    }


      if (node.parent 
        && node.parent.type === 'CallExpression'
        && node.parent.callee.type === 'MemberExpression'
        && node.parent.callee.object.name === '_'
        && node.parent.callee.property.name === 'times'
        && node.type !== 'FunctionExpression'
        && node.type !== 'MemberExpression'
        // && (!node.callee || node.callee.type !== 'MemberExpression')
        // node.callee.property.name === 'lineTo' &&
        // Math.random() < 0.2
    ) {
      console.log('glitching ' + node.source() + ' argument ')
      // console.log(node)
      node.update('Math.floor(glitch_lib.aggressiveGlitchNumber(' + node.source() + '))');
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

  var cmd = 'cp -r glitch_lib.js ' + path
  exec(cmd)

  var cmd = 'node ' + path + '/' + argv['r']
  console.log(cmd)
  exec_output = exec(cmd, {stdio:[0,1,2]});
  console.log(exec_output)

  var cmd = 'open ' + path + '/*png'
  console.log(cmd)
  exec(cmd)


  // cleanupCallback();
 });
