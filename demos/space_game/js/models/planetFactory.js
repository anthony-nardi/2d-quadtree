'use strict';

var _ = require('underscore');

var img = new Image();

img.src = './planet.png';

img.onload = function () {
  console.log('img loaded');
  img.width  *= 2;
  img.height *= 2;
}

var planetPrototype = {
  'x'       : 0,
  'y'       : 0,
  'radius'  : 835,
  'color'   : 'green',
  'z-index' : 10,
  'border'  : 'blue',
  'isPlanet': true,
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
  'render': function (ctx, viewport) {
    ctx.drawImage(img, -this.width / 2 * viewport.scale, -this.height / 2 * viewport.scale, viewport.scale * img.width, viewport.scale * img.height);
  }
};

function init(newPlanet) {
  newPlanet.width  = newPlanet.radius * 2;
  newPlanet.height = newPlanet.radius * 2;
  newPlanet.on('update', newPlanet.update);
  return newPlanet;    

} 

function createPlanet (config) {                        
  return init(_.extend(Object.create(planetPrototype), config));
}

module.exports = createPlanet;