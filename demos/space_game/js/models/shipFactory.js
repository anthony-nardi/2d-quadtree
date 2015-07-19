'use strict';

var _ = require('underscore'), 
    events = require('../core/events.js');

module.exports = (function () {

  var createVector  = require('../util/math/vector'),
      clock         = require('../core/clock'),
      createExplosion = require('./explosionFactory'),
      createBullet  = require('./bulletFactory'),

      shipPrototype = {

        'x': 0,
        'y': 0,

        'width': 30,
        'height':30,

        'color': '#ffffff',
        'thrustColor': '#3E65C0',

        'angle': {},
        'velocity': {},
        'acceleration': {},
        'mass': 30,
        'force': 1,

        'bullets': undefined,
        'maxBullets': 9,

        'cooldown': 1,
        'maxCooldown': 0.1,

        'thrustWidthPercentage': 0.8,
        'thrustHeightPercentage': 0.4,

        'rotate': true,

        'sim': clock.UPDATE_BUFFER / 1000,

        'maxSpeed': 3,

        'thrust': false,
        'fire'  : false,

        'ammoCapacity': 2,

        'fireBullet': function () {

          if (this.bullets.length >= this.maxBullets) {
            return;
          }

          var newBullet = createBullet({
            'x': this.x,
            'y': this.y,
            'angle': {
              'x': this.angle.x,
              'y': this.angle.y
            }
          }),

          that = this;

          newBullet.on('update', function () {
            if (this.traveled > this.range) {
              console.log('Removing bullet');
              that.bullets.splice(that.bullets.indexOf(newBullet, 1));
              this.off('update');
              newBullet.remove();
            }
          });

          newBullet.onCollision = function () {
            that.bullets.splice(that.bullets.indexOf(newBullet, 1));
            this.removeNextUpdate = true;
          };

          this.bullets.push(this.quadTree.insert(newBullet));
        },

        'getRotation': function () {
          return this.angle.toRadians();
        },

        'updatePosition': function () {
          this.add(this.velocity);
          this.move(this.x, this.y);
        },

        'updateVelocity': function () {
          if (this.thrust) this.velocity.add(this.angle.normalize().mult(this.force / this.mass));
        },

        'limitVelocity': function () {
          if (this.velocity.length() > this.maxSpeed) {

            this.velocity.mult(this.maxSpeed / this.velocity.length());

          }
        },

        'update': function () {

          var collidesList = this.getCollisions();

          for (var i = 0; i < collidesList.length; i++) {
            if (collidesList[i].isAsteroid) {

              var newExplosion = createExplosion({
                'x': this.x,
                'y': this.y
              });

              this.quadTree.insert(newExplosion);
              this.off('update');
              this.remove();
              events.fire('playerDead');
            }
          }

          this.updatePosition();
          this.updateVelocity();
          this.limitVelocity();


          if (this.fire && this.cooldown <= 0) {
            this.fireBullet();
            this.cooldown  = this.maxCooldown;
          }

          this.cooldown -= this.sim;

        },

        'render': function (ctx, viewport) {

          var thrustWidth, thrustHeight;

          ctx.fillStyle = this.color;

          ctx.beginPath();

          /*
               | *1
               | *    *
               | *        ->2
               | *    *
               | *3
          */

          //TODO : do the correct math for drawing a triangle...
          ctx.moveTo(-this.width / 2 * viewport.scale, -(this.height * viewport.scale) / 2);
          ctx.lineTo( this.width / 2 * viewport.scale, 0                                  );
          ctx.lineTo(-this.width / 2 * viewport.scale, (this.height * viewport.scale)  / 2);
          ctx.closePath();
          ctx.fill();
          if (this.thrust) {
            ctx.beginPath();
            ctx.fillStyle = this.thrustColor;
            thrustWidth  = this.thrustWidthPercentage  * this.width;
            thrustHeight = this.thrustHeightPercentage * this.height;
            ctx.moveTo(-this.width / 2 * viewport.scale, (this.height * viewport.scale)  / 2);
            ctx.lineTo((-this.width - thrustWidth)  / 2 * viewport.scale, this.height * viewport.scale / 2);

            ctx.lineTo((-this.width  - thrustWidth) / 2 * viewport.scale, (this.height - thrustHeight) * viewport.scale / 2);

            ctx.lineTo(-this.width / 2 * viewport.scale, ((this.height-thrustHeight) * viewport.scale)  / 2);

            ctx.moveTo(-this.width / 2 * viewport.scale, -(this.height * viewport.scale) / 2);

            ctx.lineTo((-this.width - thrustWidth) / 2 * viewport.scale, -(this.height * viewport.scale) / 2);

            ctx.lineTo((-this.width - thrustWidth) / 2 * viewport.scale, ((-this.height + thrustHeight) * viewport.scale) / 2);

            ctx.lineTo(-this.width / 2 * viewport.scale, (((-this.height+thrustHeight)) * viewport.scale) / 2);

            ctx.fill();
            ctx.closePath();
          }

          //ctx.fillRect(-this.width * viewport.scale / 2, -this.height* viewport.scale / 2, this.width * viewport.scale, this.height * viewport.scale);
        },

        'input': function (inputs) {

          if (inputs('w') || inputs('UP')) {
            this.thrust = true;
            if (this.speed < this.maxSpeed) {
              if (this.speed === 0) {
                this.speed = 1;
              } else {
                this.speed += 1;
              }
            }
          } else {
            this.thrust = false;
          }

          if (inputs('s') || inputs('DOWN')) {
            if (this.speed > 0) {
              this.speed -= 0.1;
            }
            if (this.speed < 0) {
              this.speed = 0;
            }
          }

          if (inputs('a') || inputs('LEFT')) {
            this.angle.rotate(-0.025);
          }

          if (inputs('d') || inputs('RIGHT')) {
            this.angle.rotate(0.025);
          }

          if (inputs('v') || inputs('SPACE')) {
            this.fire = true;
          } else {
            this.fire = false;
          }

        }
      };

  function init(newShip) {

    newShip.bullets = [];

    _.extend(newShip,              createVector(newShip.x, newShip.y));
    _.extend(newShip.angle,        createVector(newShip.angle.x, newShip.angle.y));
    newShip.velocity = {};
    _.extend(newShip.velocity,     createVector(0, 0));
    _.extend(newShip.acceleration, createVector(0, 0));

    newShip.on('update', newShip.update);

    newShip.on('input',  newShip.input);

    return newShip;

  }

  return function (config) {
    return init(_.extend(Object.create(shipPrototype), config));
  };

}());