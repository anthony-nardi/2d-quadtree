'use strict';

var _ = require('underscore'),
  min = Math.min,
  max = Math.max;
function timeFunction (t) { return (--t)*t*t+1; }

var sheildPrototype = {
  'x'       : 0,
  'y'       : 0,
  'radius'  : 1000,
  'centerColor'   : 'rgba(0, 255, 204, 0)',
  'outerColor': 'rgba(0, 255, 204, 0.3)',
  'z-index' : 10,
  'totalDuration': 800,
  'border'  : 'blue',
  'update'  : function () {

    var collidesList = this.getCollisions(),
        i            = 0,
        l            = collidesList.length,
        currentObject;

    for (; i < l; i++) {
      currentObject = collidesList[i];
      if (currentObject.isAsteroid) {
        currentObject.impact(this);
        if (this.impact) {
          this.impact(currentObject);
        }
      }
    }

  },                         
  'render': function (ctx, viewport, time) {
    
    var duration = min(max((time - this.startTime) / this.totalDuration, 0), 1),
        gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, this.radius * timeFunction(duration) * viewport.scale);

    gradient.addColorStop(0, this.centerColor);
    gradient.addColorStop(1, this.outerColor);
    
    ctx.fillStyle = gradient;

    ctx.beginPath();
    ctx.arc(0, 0, this.radius * timeFunction(duration) * viewport.scale, 0, 2 * Math.PI, false);
    ctx.fill();
    ctx.closePath();
  }
};

function init(newSheild) {
  newSheild.startTime = Date.now();
  newSheild.width     = newSheild.radius * 2;
  newSheild.height    = newSheild.radius * 2;
  newSheild.on('update', newSheild.update);
  return newSheild;    

} 

function createSheild (config) {                        
  return init(_.extend(Object.create(sheildPrototype), config));
}

module.exports = createSheild;