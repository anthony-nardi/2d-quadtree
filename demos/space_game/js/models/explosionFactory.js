'use strict';
// https://gist.github.com/gre/1650294
var _ = require('underscore');

module.exports = (function () {

  var explosionPrototype = {
    'x': 0,
    'y': 0,
    'width': 600,
    'height': 600,
    'radius': 300,
    'color': '233, 75, 2',
    'totalDuration': 7000,
    'border': 'blue',
    'z-index': 9999,
    'render': function (ctx, viewport, time) {
      var duration = Math.min(Math.max((time - this.startTime) / this.totalDuration, 0), 1); 
      var gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, this.radius * timeFunction(duration) * viewport.scale);
      gradient.addColorStop(1, 'rgba('+this.color+', 0)');
      gradient.addColorStop(0, 'rgba('+this.color+', 1)');
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
  
  function timeFunction (t) { return (--t)*t*t+1; }

  return function (config) {
    return init(_.extend(Object.create(explosionPrototype), config));
  };

}());