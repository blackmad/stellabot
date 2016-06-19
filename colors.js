if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    colors: colors,
    title: 'Windowpanes'
  }
}

function ColorsMaker() {
  var colors = null;
  var colorIndex = null;

  this.initColors = function() {
    colorOptions = [
      tinycolor(getRndColor()).analogous(slices = randInt(10, 100), results = randInt(4, 40)),
      tinycolor(getRndColor()).analogous(slices = randInt(10, 100), results = randInt(4, 40)),
      tinycolor(getRndColor()).analogous(slices = randInt(10, 100), results = randInt(4, 40)),
      tinycolor(getRndColor()).analogous(slices = randInt(10, 100), results = randInt(4, 40)),
    ]
    colors = _.sample(colorOptions)
    //colors = _.times(7, function() { return getRndColor(); })

    var colorFunctions = ['lighten'] // , 'darken', 'brighten', 'saturate', 'desaturate']
    var colorFunction = _.sample(colorFunctions)
    colors = colors.map(function(c) { return c.lighten(20); });
    colors = colors.map(function(t) { return t.toHexString(); });

    this.colors = colors
    this.colorIndex = 0;
  }

  this.maybeInitColors = function() {
    // please remove this awful globals hack
    if (this.colors === null) {
      this.initColors()
    }
  }

  this.getNextColor = function() {
    this.maybeInitColors();

    var c = this.colors[this.colorIndex % this.colors.length];
    this.colorIndex += 1;
    return c;
  }
}

var Colors = ColorsMaker()