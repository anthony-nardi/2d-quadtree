'use strict';

var _ = require('underscore');

module.exports = (function () {
  var img = new Image();
  
  img.src = './planet.png';
  img.onload = function () {
    console.log('img loaded');
    img.width  *= 2;
    img.height *= 2;
  }
  var planetPrototype = {
    'x': 0,
    'y': 0,
    'width': 835 * 2,
    'height': 835 * 2,
    'radius': 835,
    'color': 'green',
    'z-index': 10,
    'border': 'blue',                           
    'render': function (ctx, viewport) {
      ctx.drawImage(img, 0, 0, viewport.scale * img.width, viewport.scale * img.height);
      // ctx.fillStyle = this.color;
      // ctx.beginPath();
      // ctx.arc(0, 0, this.radius * viewport.scale, 0, 2 * Math.PI, false);
      // ctx.fill();
      // ctx.closePath();
    }
  };

  function init(newPlanet) {

    return newPlanet;    

  } 

  return function (config) {                        
    return init(_.extend(Object.create(planetPrototype), config));
  };

}());                   