 'use strict';

var _ = require('underscore');

module.exports = (function () {

  var createVector  = require('../util/math/vector'),
      clock         = require('../core/clock'),
      createBullet  = require('./bulletFactory'),
      img           = new Image();

  img.src = './turret.png';

  img.onload = function () {
    img.width  /= 2.5;
    img.height /= 2.5;
    console.log('turret image loaded');
  };

  var turretPrototype = {

    'x': 0,
    'y': 0,
    
    'color': 'green',

    'isValidBorder': 'green',
    'isInvalidBorder': 'red',

    'lineWidth': 2,
    'z-index': 50,

    'angle'   : {},
    'rotation': {},
    
    'mass': 30,
    'force': 1,
    'isStationary': false,
    'isValidPlacement': false,
    'newPosition': undefined,

    'removeNextUpdate': false,
    

    'sim'  : clock.UPDATE_BUFFER / 1000,

    'maxBullets': 1,
    'cooldown': 1,
    'maxCooldown': 3,

    'fireBullet': function () {

      if (this.bullets.length >= this.maxBullets) {
        return;
      }

      var newBullet = createBullet({
        'x': this.x,
        'y': this.y,
        'width': 26,
        'height': 12,
        'range': 1300,
        'getRotation': function () { return this.angle.toRadians(); },
        'angle': createVector(this.angle.y, -this.angle.x)
      }),

      that = this;

      newBullet.on('update', function () {
        if (this.traveled > this.range) {
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
    
    'updateAngle': function (angle) {

      this.angle.rotate(angle);

    },

    'updatePosition': function () {
      if (this.newPosition) {
        this.x = this.newPosition.x;
        this.y = this.newPosition.y;
      } 
      this.newPosition = undefined;
    },

    'resetAngle': function (x, y) {
      this.angle.x = x || 0;
      this.angle.y = y || 0;
    },

    'update': function () {

      if (this.removeNextUpdate) {
        this.off('update');
        this.remove();
        this.removed = true;
        return;
      }
      

      if (!this.isStationary) {

        this.updatePosition();

        var collidesList = this.getCollisions();

        for (var i = 0; i < collidesList.length; i++) {
          if (collidesList[i].isPlanet || collidesList[i].isSatellite) {
            this.isValidPlacement = true;
            this.anchor = collidesList[i].isSatellite ? collidesList[i] : false; 
            this.resetAngle(0, 1);
            this.updateAngle(Math.atan2(this.y - collidesList[i].y, this.x - collidesList[i].x));
            this.x -= collidesList[i].x;
            this.y -= collidesList[i].y;
            this.normalize().mult(collidesList[i].radius - 20 + this.height / 2);
            this.x += collidesList[i].x;
            this.y += collidesList[i].y;
            this.move(this.x, this.y);
            return;
          }
        }

        this.resetAngle();
        
        this.isValidPlacement = false;
        
      } else {
        if (this.anchor) {
          this.updateAngle(0.001);
          this.angle.normalize();
          var offset = createVector(this.angle.y, -this.angle.x);
          var offsetX = offset.x * (this.anchor.radius - 20 + this.width  / 2);
          var offsetY = offset.y * (this.anchor.radius - 20 + this.height / 2);
          this.move(
            offsetX +  this.anchor.planet.x + this.anchor.angle.x * this.anchor.distanceFromPlanetCenter, 
            offsetY + this.anchor.planet.y + this.anchor.angle.y * this.anchor.distanceFromPlanetCenter
          );
        }
        if (this.cooldown <= 0) {
          this.fireBullet();
          this.cooldown  = this.maxCooldown;
        }

        this.cooldown -= this.sim;

      }



    },

    'input': function (inputs) {

      var mousemove = inputs('mousemove'),
          click     = inputs('click');

      if (!this.isStationary && mousemove && mousemove.srcElement.tagName === 'CANVAS') {
        this.newPosition = this.viewport.translateCanvasCoordinates({'x': mousemove.offsetX, 'y': mousemove.offsetY});
      }

      if (!this.isStationary && click && click.srcElement.tagName === 'CANVAS' && this.isValidPlacement) {
        this.off('input');
        this.isStationary = true;
        this.onPlacement();
      }

    },

    'render': function (ctx, viewport) {
      
      var xPos = -this.width / 2 * viewport.scale,
          yPos = -this.height / 2 * viewport.scale;


      ctx.drawImage(img, xPos, yPos, this.width * viewport.scale, this.height * viewport.scale);

      if (!this.isStationary) {

        ctx.strokeStyle = this.isValidPlacement ? this.isValidBorder : this.isInvalidBorder;
        ctx.strokeRect(xPos, yPos, this.width * viewport.scale, this.height * viewport.scale);
        
      }
    }

  };

  function init(newTurret) {

    _.extend(newTurret, createVector(newTurret.x, newTurret.y));

    newTurret.width  = img.width;
    newTurret.height = img.height;
    newTurret.angle  = createVector();
    newTurret.on('update', newTurret.update);
    newTurret.on('input',  newTurret.input);

    newTurret.bullets = [];

    return newTurret;

  }

  function create (config) {
    return init(_.extend(Object.create(turretPrototype), config));
  }

  return create;

}());