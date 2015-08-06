'use strict';

var _ = require('underscore'),
  min = Math.min,
  max = Math.max;
function timeFunction (t) { return (--t)*t*t+1; }

var sheildPrototype = {
  'x'       : 0,
  'y'       : 0,
  'radius'  : 1000,
  'maxOpacity': 0.3,
  'centerColor': '0, 255, 204',
  'outerColor': '0, 255, 204',
  'z-index' : 10,
  'totalDuration': 1200,
  'border'  : 'blue',
  'maxHealth': 5000,
  'currentHealth' : 5000,
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
          if (this.currentHealth < 0) {
            this.radius = 0;
            this.width  = 0;
            this.height = 0;
          }
          this.hits.push({
            'x': currentObject.x,
            'y': currentObject.y,
            'duration': 600,
            'startTime': Date.now()
          });
        }
      }
    }

  },                         
  'render': function (ctx, viewport, time) {
    
    var duration = min(max((time - this.startTime) / this.totalDuration, 0), 1),
        gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, this.radius * timeFunction(duration) * viewport.scale);

    gradient.addColorStop(0, 'rgba(' + this.centerColor + ', 0)');
    gradient.addColorStop(1, 'rgba(' + this.outerColor + ', ' + this.maxOpacity * (this.currentHealth / this.maxHealth) + ')');
    
    ctx.fillStyle = gradient;

    ctx.beginPath();
    ctx.arc(0, 0, this.radius * timeFunction(duration) * viewport.scale, 0, 2 * Math.PI, false);
    ctx.fill();
    ctx.closePath();

    for (var i = 0; i < this.hits.length; i++) {
      
      var duration = min(max((time - this.hits[i].startTime) / this.hits[i].duration, 0), 1),
          hitX     = this.hits[i].x,
          hitY     = this.hits[i].y;

      if (duration === 1) {
        this.hits.splice(this.hits.indexOf(this.hits[i]));
        continue;
      }

      gradient = ctx.createRadialGradient(
        (hitX - this.x) * viewport.scale, 
        (hitY - this.y) * viewport.scale,
        0, 
        (hitX - this.x) * viewport.scale, 
        (hitY - this.y) * viewport.scale,
        this.radius * viewport.scale
      );

      gradient.addColorStop(0, 'rgba(' + this.outerColor + ', ' + (1 * (1 - timeFunction(duration))) + ')');
      gradient.addColorStop(1, 'rgba(' + this.centerColor + ', 0)');
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(0, 0, this.radius * viewport.scale, 0, Math.PI * 2, false);
      ctx.fill();
      ctx.closePath();
      
    }

  }
};

function init(newSheild) {
  newSheild.startTime = Date.now();
  newSheild.width     = newSheild.radius * 2;
  newSheild.height    = newSheild.radius * 2;
  newSheild.hits      = []; //this is for drawing the things that hit the sheild... looks cool! (hopefully)
  newSheild.on('update', newSheild.update);
  return newSheild;    

} 

function createSheild (config) {                        
  return init(_.extend(Object.create(sheildPrototype), config));
}

module.exports = createSheild;