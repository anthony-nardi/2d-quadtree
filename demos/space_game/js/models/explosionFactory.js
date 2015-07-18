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
    'color': 'red',
    'totalDuration': 7000,
    'border': 'blue',
    'render': function (ctx, viewport, time) {
      var duration = Math.min(Math.max((time - this.startTime) / this.totalDuration, 0), 1); 
      var gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, this.radius * timeFunction(duration) / 2);
      gradient.addColorStop(1, '#000');
      gradient.addColorStop(0, this.color);
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