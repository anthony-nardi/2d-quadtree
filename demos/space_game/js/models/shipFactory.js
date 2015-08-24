'use strict';

var _ = require('underscore'), 
    events = require('../core/events.js'),
    buttonFactory = require('./buttonFactory'),
    createRocket  = require('./rocketFactory'),
    bulletUpgradeImage_1 = new Image(),
    rocketUpgradeImage_1 = new Image();

bulletUpgradeImage_1.src = './shipBulletUpgrade_1.png';
rocketUpgradeImage_1.src = './shipRocketUpgrade_1.png';

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
        'turnRate': Math.PI / 90,
        'angle': {},
        'velocity': {},
        'acceleration': {},
        'mass': 30,
        'force': 1,
        'RocketUpgrade_1_Cost': 2000,
        'BulletUpgrade_1_Cost': 1500,
        'bullets': undefined,
        'maxBullets': 3,
        'bulletRange': 900,
        'firesBullets': true,
        'cooldown': 1,
        'maxCooldown': 1,

        'thrustWidthPercentage': 0.8,
        'thrustHeightPercentage': 0.4,

        'rotate': true,

        'sim': clock.UPDATE_BUFFER / 1000,

        'maxSpeed': 3,

        'thrust': false,
        'isShooting'  : false,

        'ammoCapacity': 2,
       
        'getTarget': function () {

          var allObjects    = this.quadTree.getEntireQuadtreesOrphansAndChildren(),
              closestTarget,
              closestTargetDistance;

          for (var i = 0; i < allObjects.length; i++) {
            if (allObjects[i].isAsteroid) {
              if (!closestTarget) {
                closestTarget = allObjects[i];
                closestTargetDistance = getDistance(this, closestTarget);
              } else {
                if (getDistance(this, allObjects[i]) < closestTargetDistance) {
                  closestTarget = allObjects[i];
                  closestTargetDistance = getDistance(this, allObjects[i]);
                }
              }
            } 
          }

          this.target = closestTarget;

        },

        'fireBullet': function () {

          if (this.bullets.length >= this.maxBullets) {
            return;
          }

          var newBullet = createBullet({
            'x': this.x,
            'y': this.y,
            'range': this.bulletRange,
            'angle': {
              'x': this.angle.x,
              'y': this.angle.y
            }
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

        'fireRocket': function () {

          var that = this;

          var newRocket = createRocket({
            'x': this.x,
            'y': this.y,
            'turnRate': Math.PI / 120,
            'mass': 15,
            'scale': 0.5,
            'quadTree': this.quadTree,
            'getRotation': function () { return this.angle.toRadians(); },
            'angle': createVector(this.angle.x, this.angle.y)
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

          if (this.target && this.target.removeNextUpdate) {
            this.getTarget();
          }

          if (!this.isPlayerControlled) {

            if (this.target) {

              var targetAngle  = Math.atan2(this.y - this.target.y, this.x - this.target.x),
                  currentAngle = this.getRotation(),
                  deltaAngle   = currentAngle - targetAngle,
                  distanceFromTarget = getDistance(this, this.target);

              if (deltaAngle > Math.PI) {
                deltaAngle -= Math.PI * 2; 
              }
              if (deltaAngle < -Math.PI) {
                deltaAngle += Math.PI * 2;
              }

              if (deltaAngle > 0) {
                this.angle.rotate(this.turnRate);
              } else {
                this.angle.rotate(-this.turnRate);
              }

              if (this.firesBullets) {

                if (distanceFromTarget <= this.bulletRange) {
                  this.isShooting = true;
                  this.thrust     = false;
                } else {
                  this.isShooting = false;
                  this.thrust = true;
                }
              
              } else {
                this.isShooting = true;
                if (distanceFromTarget <= this.bulletRange) {
                  this.thrust     = false;
                } else {
                  this.thrust = true;
                }  
              }

              
            } else {
              this.thrust     = false;
              this.isShooting = false;
            }
            
          }
          
          
          
          var collidesList = this.getCollisions();

          for (var i = 0; i < collidesList.length; i++) {
            if (collidesList[i].isAsteroid) {

              var newExplosion = createExplosion({
                'x': this.x,
                'y': this.y
              });
              if (this.bulletUpgradeButton) {
                this.bulletUpgradeButton.remove();
                this.rocketUpgradeButton.remove();
              }
              this.quadTree.insert(newExplosion);
              this.off('update');
              this.remove();
              events.fire('playerDead');
            }
          }

          this.updatePosition();
          this.updateVelocity();
          this.limitVelocity();

          if (this.isShooting && this.cooldown <= 0) {
            if (this.firesBullets) {
              this.fireBullet();
            } else {
              this.fireRocket();
            }
            this.cooldown  = this.maxCooldown;
          }
          console.log(this.cooldown);
          this.cooldown -= this.sim;

          if (this.bulletUpgradeButton) {
            this.bulletUpgradeButton.x = this.x + 400;
            this.bulletUpgradeButton.y = this.y - 400;
            this.rocketUpgradeButton.x = this.x - 400;
            this.rocketUpgradeButton.y = this.y - 400;
          }

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
          
        },
    
        'showUpgradeTree': function () {
          
          var currentShip = this;

          if (this.upgrading) {
            return false;
          }

          console.log('Show upgrade tree');
          
          var rocketUpgradeButton = buttonFactory({
            'img': rocketUpgradeImage_1,
            'x': this.x - 400,
            'y': this.y - 400,
            'width': 400,
            'height': 400,
            'viewport': this.viewport,
            'static': false,
            'z-index': 999999999,
            'onClick': function () {
              if (currentShip.money.value >= currentShip.RocketUpgrade_1_Cost) {
                console.log('Rocket upgrade');
                currentShip.firesBullets = false;
                currentShip.maxCooldown  = 4;
                currentShip.money.value -= currentShip.RocketUpgrade_1_Cost;                
                currentShip.rocketUpgradeButton = undefined;
                currentShip.bulletUpgradeButton = undefined;
                this.remove();
                bulletUpgradeButton.remove();                
              }
            }
          });


          var bulletUpgradeButton = buttonFactory({
            'img': bulletUpgradeImage_1,
            'x': this.x + 400,
            'y': this.y - 400,
            'width': 400,
            'height': 400,
            'viewport': this.viewport,
            'static': false,
            'z-index': 999999999,
            'onClick': function () {
              if (currentShip.money.value >= currentShip.BulletUpgrade_1_Cost) {
                console.log('Bullet upgrade');
                currentShip.money.value -= currentShip.BulletUpgrade_1_Cost;
                currentShip.maxBullets  = 10;
                currentShip.maxCooldown = 0.3;
                currentShip.bulletRange = 1300;
                currentShip.rocketUpgradeButton = undefined;
                currentShip.bulletUpgradeButton = undefined;
                this.remove();
                rocketUpgradeButton.remove();
              }
            }
          });

          this.rocketUpgradeButton = rocketUpgradeButton;
          this.bulletUpgradeButton = bulletUpgradeButton;

          this.upgrading = true;

        },   

        'onClick': function () {
          console.log('Ship clicked!');
          if (this.viewport.following === this) {
            this.viewport.follow(this.planet);
          } else {
            this.viewport.follow(this);
          }
          if (this.money.value >= this.RocketUpgrade_1_Cost || this.money.value >= this.BulletUpgrade_1_Cost)
          this.showUpgradeTree();
        },

        'isClicked': function (x, y) {

          var clickCoordinates = this.viewport.translateCanvasCoordinates({x: x, y: y}),
            shipLeft   = this.x - this.width / 2,
            shipRight  = shipLeft + this.width,
            shipTop    = this.y - this.height / 2,
            shipBottom = shipTop + this.height;

          return (shipLeft <= clickCoordinates.x && shipRight >= clickCoordinates.x && shipTop <= clickCoordinates.y && shipBottom >= clickCoordinates.y);

        },

        'isClickedInput': function (inputs) {
        
          var clickEvent = inputs('click');

          if (clickEvent) {
            if (clickEvent.srcElement.tagName === 'CANVAS') {
              if (this.isClicked(clickEvent.offsetX, clickEvent.offsetY)) {
                this.onClick();
              }
            }
          }
        },

        'input': function (inputs) {
         
          this.isClickedInput(inputs);

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
            this.isShooting = true;
          } else {
            this.isShooting = false;
          }

        }
      };
  
  function getDistance (obj1, obj2) {
    return Math.sqrt(Math.pow(obj1.x - obj2.x, 2) + (Math.pow(obj1.y - obj2.y, 2)));
  }
  
  function init(newShip) {

    newShip.bullets = [];
    newShip.rockets = [];
    _.extend(newShip,              createVector(newShip.x, newShip.y));
    _.extend(newShip.angle,        createVector(newShip.angle.x, newShip.angle.y));
    newShip.velocity = {};
    _.extend(newShip.velocity,     createVector(0, 0));
    _.extend(newShip.acceleration, createVector(0, 0));

    if (newShip.isPlayerControlled) {
      newShip.on('input',  newShip.input);
    } else {
      newShip.on('input', newShip.isClickedInput);
      newShip.getTarget();
    }

    newShip.on('input', function () {

    });

    if (!newShip.target) {
      return;
    }

    setTimeout(function () {
      newShip.on('update', newShip.update);
    }, 2000);

    return newShip;

  }

  return function (config) {
    return init(_.extend(Object.create(shipPrototype), config));
  };

}());