var Utils = Utils || {};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    Utils: Utils
  }
}

Utils.shuffle = function(array) {
  var currentIndex = array.length, temporaryValue, randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}

Utils.getRndColor = function() {
  var r = 255*Math.random()|0,
      g = 255*Math.random()|0,
      b = 255*Math.random()|0;
  return 'rgb(' + r + ',' + g + ',' + b + ')';
}

Utils.randInt = function(low, high) {
    return Math.floor(Math.random() * (high - low) + low);
}

var l = Utils.randInt(10, 100)
Utils.makeColors = function() {
  if (l === null || l === undefined) {
    l = randInt(10, 100)
  }
  // return  tinycolor(getRndColor()).analogous(slices = 400, results = 5).map(function(t) { return t.toHexString(); });
  return _.times(10, function() {
    //return tinycolor({ h: randInt(0, 100), s: randInt(0, 100), l: 50 })
    return tinycolor({ h: randInt(0, 100), s: randInt(0, 100), l: l })
  })
}

Utils.createArray = function (length) {
  var arr = new Array(length || 0),
      i = length;

  if (arguments.length > 1) {
      var args = Array.prototype.slice.call(arguments, 1);
      while(i--) arr[length-1 - i] = Utils.createArray.apply(this, args);
  }

  return arr;
}