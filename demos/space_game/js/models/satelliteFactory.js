'use strict';

var _           = require('underscore'),
   createVector = require('../util/math/vector');

var satellitePrototype = {
  'radius': 100,
  'z-index': 10,
  'color': '#ccc',
  'isSatellite': true,
  'isStationary': false,
  'update': function () {
    // if (this.isStationary) {
      this.angle.rotate(0.001);
      this.move(this.planet.x + this.angle.x * this.distanceFromPlanetCenter, this.planet.y + this.angle.y * this.distanceFromPlanetCenter);
    // }
  },
  'render': function (ctx, viewport) {
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(0, 0, this.radius * viewport.scale, 0, 2 * Math.PI, false);
    ctx.fill();
    ctx.closePath();
  },
  'input': function (inputs) {

    var mousemove = inputs('mousemove'),
        click     = inputs('click');

    if (!this.isStationary && mousemove && mousemove.srcElement.tagName === 'CANVAS') {
      console.log('satellite pos')
      var newPos = this.viewport.translateCanvasCoordinates({'x': mousemove.offsetX, 'y': mousemove.offsetY});
      this.move(newPos.x, newPos.y);
    }

    if (!this.isStationary && click && click.srcElement.tagName === 'CANVAS' && this.isValidPlacement) {
      this.off('input');
      this.isStationary = true;
      this.onPlacement();
    }
  }

};

function init (newSatellite) {
  _.extend(newSatellite, createVector(newSatellite.planet.x, newSatellite.planet.y));
  newSatellite.angle = createVector(1, 0);
  newSatellite.width  = newSatellite.radius * 2;
  newSatellite.height = newSatellite.radius * 2;
  newSatellite.distanceFromPlanetCenter = newSatellite.planet.radius + 500;
  newSatellite.on('update', newSatellite.update);
  // newSatellite.on('input', newSatellite.input);
  return newSatellite;
}

function createSatellite (config) {
  return init(_.extend(Object.create(satellitePrototype), config));
}

module.exports = createSatellite;