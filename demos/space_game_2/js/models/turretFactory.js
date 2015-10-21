 'use strict';

var _ = require('underscore');

module.exports = (function () {

  var createVector  = require('../util/math/vector'),
      clock         = require('../core/clock'),
      createBullet  = require('./bulletFactory'),
      createRocket  = require('./rocketFactory'),
      buttonFactory = require('./buttonFactory'),
      img           = new Image(),
      bulletUpgradeImage_1 = new Image(),
      rocketUpgradeImage_1 = new Image();

  img.src = './turret.png';
  bulletUpgradeImage_1.src = './turretBulletUpgrade_1.png';
  rocketUpgradeImage_1.src = './turretRocketUpgrade_1.png';


  img.onload                  = scaleImage;
  // bulletUpgradeImage_1.onload = scaleImage;
  // rocketUpgradeImage_1.onload = scaleImage;

  function scaleImage () {
    this.width  /= 2.5;
    this.height /= 2.5;
  }

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

    'RocketUpgrade_1_Cost': 2000,
    'BulletUpgrade_1_Cost': 1500,
    
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

    'firesBullets': true,

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

    'fireLazer': function () {

      if (this.bullets.length >= this.maxBullets) {
        return;
      }

      var newBullet = createBullet({
        'x': this.x,
        'y': this.y,
        'width': 250,
        'height': 12,
        'color': '#32CD32',
        'force': 40,
        'mass': 2,
        'range': 3900,
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

      newBullet.onCollision = function () {};

      this.bullets.push(this.quadTree.insert(newBullet));
    },

    'fireRocket': function () {

      var that = this;

      var newRocket = createRocket({
        'x': this.x,
        'y': this.y,
        'quadTree': this.quadTree,
        'getRotation': function () { return this.angle.toRadians(); },
        'angle': createVector(this.angle.y, -this.angle.x)
      });

      if (newRocket) {

        newRocket.onCollision = function () {
          that.rockets.splice(that.rockets.indexOf(newRocket, 1));
          this.removeNextUpdate = true;
        };

        this.rockets.push(this.quadTree.insert(newRocket));

      }
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

    'isClicked': function (x, y) {

      var clickCoordinates = this.viewport.translateCanvasCoordinates({x: x, y: y}),
          turretLeft   = this.x - this.width / 2,
          turretRight  = turretLeft + this.width,
          turretTop    = this.y - this.height / 2,
          turretBottom = turretTop + this.height;

      return (turretLeft <= clickCoordinates.x && turretRight >= clickCoordinates.x && turretTop <= clickCoordinates.y && turretBottom >= clickCoordinates.y);
    },

    'showUpgradeTree': function () {
      
      var currentTurret = this;

      if (this.upgrading) {
        return false;
      }

      console.log('Show upgrade tree');
      
      var rocketUpgradeButton = buttonFactory({
        'img': rocketUpgradeImage_1,
        'left'  : 305,
        'bottom': 125,
        'width': 400,
        'height': 400,
        'viewport': this.viewport,
        'static': false,
        'z-index': 999999999,
        'onClick': function () {
          console.log('Rocket upgrade');
          currentTurret.firesBullets = false;
          currentTurret.maxCooldown  = 7;
          currentTurret.money.value -= currentTurret.RocketUpgrade_1_Cost;
          rocketUpgradeButton.remove();
          bulletUpgradeButton.remove();
        }
      });

      var bulletUpgradeButton = buttonFactory({
        'img': bulletUpgradeImage_1,
        'left'       : 425,
        'bottom'       : 125,
        'width': 400,
        'height': 400,
        'viewport': this.viewport,
        'static': false,
        'z-index': 999999999,
        'onClick': function () {
          console.log('Bullet upgrade');
          currentTurret.maxBullets = 1;
          currentTurret.maxCooldown = 1;
          currentTurret.firesLazers = true;
          currentTurret.money.value -= currentTurret.BulletUpgrade_1_Cost;
          bulletUpgradeButton.remove();
          rocketUpgradeButton.remove();
        }
      });

      // var bulletUpgradeButton = buttonFactory({
      //   'img': bulletUpgradeImage_1,
      //   'left'       : 425,
      //   'bottom'       : 125,
      //   'width': 400,
      //   'height': 400,
      //   'viewport': this.viewport,
      //   'static': false,
      //   'z-index': 999999999,
      //   'onClick': function () {
      //     console.log('Bullet upgrade');
      //     currentTurret.maxBullets = 5;
      //     currentTurret.maxCooldown = 1;
      //     currentTurret.money.value -= currentTurret.BulletUpgrade_1_Cost;
      //     this.remove();
      //     rocketUpgradeButton.remove();
      //   }
      // });

      this.upgrading = true;

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
          if (this.firesLazers) {
            this.fireLazer();
          }
          else if (this.firesBullets) {
            this.fireBullet();
          } else {
            this.fireRocket();
          }
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
        this.isStationary = true;
        this.onPlacement();
        return;
      }

      if (this.isStationary && click && click.srcElement.tagName === 'CANVAS' && this.isClicked(click.offsetX, click.offsetY)) {
        this.showUpgradeTree(click.offsetX, click.offsetY);
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
    newTurret.rockets = [];

    return newTurret;

  }

  function create (config) {
    return init(_.extend(Object.create(turretPrototype), config));
  }

  return create;

}());