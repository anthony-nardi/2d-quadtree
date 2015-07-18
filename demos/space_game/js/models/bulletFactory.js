'use strict';
var _ = require('underscore');
module.exports = (function () {

  var createVector  = require('../util/math/vector'),
      clock         = require('../core/clock'),
	  bulletPrototype = {
      'width'       : 6,
      'height'      : 6,
      'x'           : 0,
      'y'           : 0,
      'color'       : '#ffffff',
      'angle'       : {},
      'velocity'    : {},
      'acceleration': {},
      'mass'        : 3,
      'force'       : 20,
      'range'       : 900,
      'isBullet'    : true,
      'traveled'    : 0,
      'sim'         : clock.UPDATE_BUFFER,
      'removeNextUpdate': false,
      'render' : function (ctx, viewport) {
        ctx.fillStyle = this.color;
        ctx.fillRect(-this.width * viewport.scale / 2, -this.height* viewport.scale / 2, this.width * viewport.scale, this.height * viewport.scale);
      },
      'update':function () {
        if (this.removeNextUpdate) {
          this.off('update');
          this.remove();
          return;
        }
        var collidesList = this.getCollisions();

        for (var i = 0; i < collidesList.length; i += 1) {
          if (collidesList[i].isAsteroid) {
            collidesList[i].impact(this);
            this.onCollision();
          }
        }

        this.angle.normalize().mult(this.force / this.mass);
        this.traveled += this.angle.length();
        this.add(this.angle);
        this.move(this.x, this.y);

      }
    };

  function init(newBullet) {

    _.extend(newBullet, createVector(newBullet.x, newBullet.y));
    _.extend(newBullet.angle, createVector(newBullet.angle.x, newBullet.angle.y));
    _.extend(newBullet.velocity, createVector());
    newBullet.on('update', newBullet.update);

    return newBullet;
  }

  return function (config) {
    return init(_.extend(Object.create(bulletPrototype), config));
  };

}());