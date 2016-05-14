module.exports = {
  glitchNumber: glitchNumber,
  aggressiveGlitchNumber: aggressiveGlitchNumber
}

var rwc = require('random-weighted-choice');

function glitchNumber(n) {

  var table = [
    { weight: 100, id: function(n) { return n }},
    { weight: 1, id: function(n) { return n*Math.random() }},
    { weight: 1, id: function(n) { return n*Math.random()*50 }},
    { weight: 1, id: function(n) { return n*Math.random()*30 }},
    { weight: 1, id: function(n) { return n*-4*Math.random() }},
    { weight: 1, id: function(n) { if (n == 0) { return -100 } else { return n } }},
    { weight: 8, id: function(n) { return 0.8*n + 0.2*Math.random()*20 }},
    { weight: 20, id: function(n) { return 0.8*n + 0.2*Math.random() }},
    { weight: 1, id: function(n) { return 0.8*n + 0.2*Math.random()*100 }}
  ];

  var new_num = eval('(' + rwc(table) + ')')(n)
  console.log('glitching ' + n + ' to ' + new_num)
  return new_num;
}


function aggressiveGlitchNumber(n) {

  var table = [
    { weight: 5, id: function(n) { return n }},
    { weight: 10, id: function(n) { return n+Math.random()*10 }},
    { weight: 10, id: function(n) { return n+Math.random()*50 }},
    { weight: 10, id: function(n) { return n+Math.random()*30 }},
    { weight: 0, id: function(n) { return n*-4*Math.random() }},
    { weight: 1, id: function(n) { if (n == 0) { return -100 } else { return n } }},
    { weight: 8, id: function(n) { return 0.8*n + 0.2*Math.random()*20 }},
    { weight: 20, id: function(n) { return 0.8*n + 0.2*Math.random() }},
    { weight: 1, id: function(n) { return 0.8*n + 0.2*Math.random()*100 }}
  ];

  var new_num = eval('(' + rwc(table) + ')')(n)
  console.log('glitching ' + n + ' to ' + new_num)
  return new_num;
}

function noop() { return 0; }
