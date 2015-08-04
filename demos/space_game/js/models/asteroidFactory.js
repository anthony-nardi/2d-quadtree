'use strict';

var _              = require('underscore'),
    createVector   = require('../util/math/vector'),
    clock          = require('../core/clock'),
    BREAK_RADIUS   = 0.5,
    MASS_FACTOR    = 4,
    VALUE_FACTOR   = 0.5,
    SPEED_INCREASE = 1.2;

var asteroidPrototype = {
  'x'               : 0,
  'y'               : 0,
  'radius'          : 25,
  'mass'            : 100,
  'color'           : 'green',
  'border'          : 'blue',
  'lineWidth'       : 2,
  'z-index'         : 50,
  'angle'           : {},
  'force'           : 1,
  'maxSpeed'        : 3,
  'value'           : 300,
  'breaks'          : 2,
  'isAsteroid'      : true,
  'removeNextUpdate': false,
  'sim'             : clock.UPDATE_BUFFER / 1000,
 
  'impact': function () {
    
    var newAsteroid = {
      'x'       : this.x,
      'y'       : this.y,
      'radius'  : this.radius * BREAK_RADIUS,
      'mass'    : this.radius * BREAK_RADIUS * MASS_FACTOR,
      'speed'   : this.speed  * SPEED_INCREASE,
      'onImpact': this.onImpact,
      'value'   : this.value * VALUE_FACTOR,
      'color'   : this.color,
      'breaks'  : this.breaks - 1,
      'quadTree': this.quadTree
    };
    
    this.removeNextUpdate = true;

    if (this.onImpact) {
      this.onImpact();
    }
    
    if (this.breaks > 0) {

      this.quadTree.insert(createAsteroid(_.extend(newAsteroid, {
        'spin'    : (Math.random() < 0.5 ? -1 : 1) * Math.getRandomInt(0, 25) / 1000,
        'angle': {
          'x': Math.getRandomInt(-180, 180),
          'y': Math.getRandomInt(-180, 180)
        }
      })));

      this.quadTree.insert(createAsteroid(_.extend(newAsteroid, {
        'spin'    : (Math.random() < 0.5 ? -1 : 1) * Math.getRandomInt(0, 25) / 1000,
        'angle': {
          'x': Math.getRandomInt(-180, 180),
          'y': Math.getRandomInt(-180, 180)
        }
      })));

    }

  },

  'updatePosition': function () {
    this.add(this.velocity);
    this.move(this.x, this.y);
  },

  'update': function () {

    if (this.removeNextUpdate) {
      this.off('update');
      this.remove();
      return;
    }
    
    this.updatePosition();
  
  },

  'render': function (ctx, viewport) {
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(0, 0, this.radius * viewport.scale, 0, 2 * Math.PI, false);
    ctx.fill();
    ctx.closePath();
  }

};

function init(newAsteroid) {

  _.extend(newAsteroid, createVector(newAsteroid.x, newAsteroid.y));

  newAsteroid.velocity = createVector(Math.random() * (Math.random() < 0.5 ? 1 : -1), Math.random() * (Math.random() < 0.5 ? 1 : -1));
  newAsteroid.angle    = createVector(newAsteroid.angle.x, newAsteroid.angle.y);

  newAsteroid.width = newAsteroid.radius  * 2;
  newAsteroid.height = newAsteroid.radius * 2;

  newAsteroid.mass = newAsteroid.radius * MASS_FACTOR;

  newAsteroid.on('update', newAsteroid.update);

  return newAsteroid;

}

function createAsteroid (config) {
  return init(_.extend(Object.create(asteroidPrototype), config));
}

module.exports = createAsteroid;