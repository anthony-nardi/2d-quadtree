'use strict';

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
      'range'       : 400,
      'isBullet'    : true,
      'traveled'    : 0,
      'sim'         : clock.UPDATE_BUFFER,
      'render' : function (ctx, viewport) {
        ctx.fillStyle = this.color;
        ctx.fillRect(-this.width * viewport.scale / 2, -this.height* viewport.scale / 2, this.width * viewport.scale, this.height * viewport.scale);
      },
      'update':function () {

        var collidesList = this.collidesList();

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

    newBullet.extend(createVector(newBullet.x, newBullet.y));
    newBullet.angle.extend(createVector(newBullet.angle.x, newBullet.angle.y));
    newBullet.velocity.extend(createVector());
    newBullet.on('update', newBullet.update);

    return newBullet;
  }

  return function (config) {
    return init(Object.create(bulletPrototype).extend(config));
  };

}());