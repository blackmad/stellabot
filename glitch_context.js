if (typeof module !== 'undefined' && module.exports) {
  console.log('exports')
  var _ = require('underscore');
  var Simple1DNoise = require('./noise').Simple1DNoise;
}

class GlitchContext {
  constructor(context) {
    this.generator = new Simple1DNoise();
    this.context = context;
    this.calls = [];
    this.lastPoint = null;
  }

  saveCall(func, args) {
    this.calls.push([func, args])

    var call = _.sample(this.calls)
    if (call && Math.random() > 0.8) {
      // call[0].apply(this.context, call[1])
    }
  }

  m(num) {
    return num*(0.9+Math.random()*0.1);
    // return num;
  }

  passthru() {
    this.context.fillStyle = this.fillStyle
    this.context.strokeStyle = this.strokeStyle
    this.context.lineWidth = this.lineWidth
  }

  beginPath() {
    this.saveCall(this.context.beginPath, null)
    this.context.beginPath();
  } 

  closePath() {
    this.saveCall(this.context.closePath, null)
    this.context.closePath();
  } 

  stroke() {
    this.passthru()
    this.saveCall(this.context.stroke, null)
    this.context.stroke();
  } 

  clip() {
    this.saveCall(this.context.clip, null)
    this.context.clip();
  } 

  save() {
    this.saveCall(this.context.save, null)
    this.context.save();
  } 

  restore() {
    this.saveCall(this.context.restore, null)
    this.context.restore();
  }

  rotate(angle) {
    this.saveCall(this.context.rotate, arguments)
    this.context.rotate(angle)
  } 

  translate(x, y) {
    this.passthru()
    this.saveCall(this.context.translate, arguments)
    // this.context.translate(this.m(x), this.m(y));
    this.context.translate(x, y)
  } 

  moveTo(x, y) {
    this.passthru()
    this.saveCall(this.context.moveTo, arguments)
    // x = this.m(x)
    // y = this.m(y);
    this.context.moveTo(x, y)
    this.lastPoint = [x, y]
  } 

  veryClose(p1, p2) {
    return 
      Math.abs(p1[0] - p2[0]) < 0.00001 &&
        Math.abs(p1[1] - p2[1]) < 0.00001
  }

  lineTo(x, y) {
    this.passthru()
    this.saveCall(this.context.lineTo, arguments)
    
    // x = this.m(x);
    // y = this.m(y);

    // if (Math.random() < 0.0) {
    //   var randomX = this.lastPoint[0] + (x - this.lastPoint[0])*Math.random()
    //   var randomY = this.lastPoint[1] + (y - this.lastPoint[1])*Math.random()
    //   console.log('start: ' + this.lastPoint)
    //   console.log('in the middle: ' + randomX + ', ' + randomY)
    //   console.log('end: ' + x + ', ' + y)

    //   this.context.quadraticCurveTo(randomX+(Math.random()*50-25), randomY+(Math.random()*50-25),x,y);
    // } 

    if (true) {
      var numPoints = 100;
      var startX = this.lastPoint[0]
      var startY = this.lastPoint[1]
      var endX = x
      var endY = y

      var originalWidth = this.context.lineWidth;

      _.times(numPoints, _.bind(function(i) {
        var percentage = (i+1) * (numPoints*1.0 / 100)
        var curX = startX + ((endX-startX)/numPoints)*percentage
        var curY = startY + ((endY-startY)/numPoints)*percentage

        // console.log('lastPoint: ' + this.lastPoint)
        // console.log('percentage: ' + percentage)
        // console.log('cur point: ' + [curX, curY])
        // console.log('driving towards: ' + [endX, endY])

        // console.log(startX + ',' + startY)
        this.context.lineWidth = this.generator.getVal(curX*curY)*0.5+1;
        this.context.lineTo(curX, curY)
        this.context.stroke()
        this.context.beginPath()
        this.context.moveTo(curX, curY)

      }, this))

      this.context.lineTo(x, y)
    } else {
      this.context.lineTo(x, y)
    }
    this.lastPoint = [x, y]
  } 

  rect(x,y,w,h) {
    this.passthru()
    this.saveCall(this.context.rect, arguments)
    this.context.rect(this.m(x),this.m(y),w,h)
  }

  fillRect(x,y,w,h) {
    this.passthru()
    this.saveCall(this.context.fillRect, arguments)
    this.context.fillRect.apply(this.context, arguments)
    // this.context.fillRect(this.m(x),this.m(y),w,h)
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    GlitchContext: GlitchContext
  };
} else {
  var glitch_context = {
    GlitchContext: GlitchContext
  }
}
