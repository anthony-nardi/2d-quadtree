'use strict';
// https://gist.github.com/gre/1650294
var _   = require('underscore'),
    min = Math.min,
    max = Math.max;

function timeFunction (t) { return (--t)*t*t+1; }

var explosionPrototype = {
  'x'            : 0,
  'y'            : 0,
  'width'        : 600,
  'height'       : 600,
  'radius'       : 300,
  'centerColor'  : 'rgba(233, 75, 2, 1)',
  'outerColor'   : 'rgba(233, 75, 2, 0)',
  'totalDuration': 7000,
  'z-index'      : 9999,
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

function init(newExplosion) {
  newExplosion.startTime = Date.now();
  return newExplosion;
}


function createExplosion (config) {
  return init(_.extend(Object.create(explosionPrototype), config));
}

module.exports = createExplosion;
