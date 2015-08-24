'use strict';

var _ = require('underscore');

var createVector = require('../util/math/vector'),
    img          = new Image();

img.src = './rocket.png';

img.onload = function () {
  img.width  /= 2.5;
  img.height /= 2.5;
  rocketPrototype.width  = img.width;
  rocketPrototype.height = img.height;
};

var rocketPrototype = {
  'x': 0,
  'y': 0,
  'z-index': 100,
  'removeNextUpdate': false,
  'angle': {},
  'turnRate': Math.PI / 200,
  'maxSpeed': 10,
  'mass': 30,
  'force': 3,
  'acceleration': {},
  'getRotation': function () { 
    return this.angle.toRadians(); 
  },
  'updatePosition': function () {
    this.add(this.velocity);
    this.move(this.x, this.y);
  },

  'updateVelocity': function () {
    this.velocity.add(this.angle.normalize().mult(this.force / this.mass));
  },

  'limitVelocity': function () {
    if (this.velocity.length() > this.maxSpeed) {

      this.velocity.mult(this.maxSpeed / this.velocity.length());

    }
  },
  'render': function (ctx, viewport) {

    var xPos = -this.width  / 2 * viewport.scale,
        yPos = -this.height / 2 * viewport.scale;


    ctx.drawImage(img, xPos, yPos, this.width * viewport.scale, this.height * viewport.scale);

  },
  'update': function () {

    if (this.removeNextUpdate) {
      this.off('update');
      this.remove();
      return;
    }
    if (this.target.removeNextUpdate) {
      console.log('Aquiring new target');
      this.getTarget();
    }
    var collidesList = this.getCollisions();

    for (var i = 0; i < collidesList.length; i += 1) {
      if (collidesList[i].isAsteroid) {
        collidesList[i].impact(this);
        this.onCollision();
        return;
      }
    }
  
    var targetAngle  = Math.atan2(this.y - this.target.y, this.x - this.target.x),
        currentAngle = this.getRotation(),
        deltaAngle   = currentAngle - targetAngle;

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
    
    this.updatePosition();
    this.updateVelocity();
    this.limitVelocity();

  },
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

  }
};

function getDistance (obj1, obj2) {
  return Math.sqrt(Math.pow(obj1.x - obj2.x, 2) + (Math.pow(obj1.y - obj2.y, 2)));
}

function init (newRocket) {
  
  newRocket.velocity     = {};
  newRocket.acceleration = {};
  
  _.extend(newRocket.velocity,     createVector(0, 0));
  _.extend(newRocket.acceleration, createVector(0, 0));
  _.extend(newRocket, createVector(newRocket.x, newRocket.y));

  _.extend(newRocket.angle, createVector(newRocket.angle.x, newRocket.angle.y));
  
  if (newRocket.scale) {
    newRocket.width  = newRocket.width * newRocket.scale;
    newRocket.height = newRocket.height * newRocket.scale;
  }

  newRocket.getTarget();

  if (!newRocket.target) {
    return;
  }  
  
  newRocket.on('update', newRocket.update);
  
  return newRocket;
}

function createRocket (config) {
  return init(_.extend(Object.create(rocketPrototype), config));
}

module.exports = createRocket;