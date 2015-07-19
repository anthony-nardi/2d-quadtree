'use strict';

var _ = require('underscore');

module.exports = (function () {

  var createVector = require('../util/math/vector'),
      clock        = require('../core/clock');

  var asteroidPrototype = {

    'x': 0,
    'y': 0,

    'radius': 25,

    'color': 'green',

    'border': 'blue',

    'lineWidth': 2,
    'z-index': 50,

    'angle'   : {},
    
    'mass': 30,
    'force': 1,

    'maxSpeed': 3,

    'breaks': 2,

    'isAsteroid': true,

    'removeNextUpdate': false,
    

    'sim'  : clock.UPDATE_BUFFER,



    'impact': function () {
      
      var quadTree = this.quadTree;
      
      this.removeNextUpdate = true;
      
      if (this.breaks === 0) {
      } else {
      
        var color = this.color;
        quadTree.insert(create({
          'x': this.x,
          'y': this.y,
          'radius': this.radius * 0.7,
          'speed': this.speed * 1.1,
          'angle': {
            'x': Math.getRandomInt(-180, 180),
            'y': Math.getRandomInt(-180, 180)
          },
          'spin': (Math.random() < 0.5 ? -1 : 1) * Math.getRandomInt(0, 25) / 1000,
          'color': color,
          'breaks': this.breaks - 1,
          'quadTree': quadTree
        }));
        quadTree.insert(create({
          'x': this.x,
          'y': this.y,
          'radius': this.radius * 0.7,
          'speed': this.speed * 1.1,
          'angle': {
            'x': Math.getRandomInt(-180, 180),
            'y': Math.getRandomInt(-180, 180)
          },
          'spin': (Math.random() < 0.5 ? -1 : 1) * Math.getRandomInt(0, 25) / 1000,
          'color': color,
          'breaks': this.breaks - 1,
          'quadTree': quadTree
        }));

      }

    },

    'updatePosition': function () {

      this.add(this.velocity);
      this.move(this.x, this.y);
    },



    'updateVelocity': function () {
      this.velocity.add(this.angle.normalize().mult(this.force / this.mass));

      this.velocity.mult(this.maxSpeed / this.velocity.length());
    },

    'limitVelocity': function () {
      if (this.velocity.length() > this.maxSpeed) {
      }
    },
    'update': function () {

      if (this.removeNextUpdate) {
        this.off('update');
        this.remove();
        this.removed = true;
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

    newAsteroid.width = newAsteroid.radius * 2;
    newAsteroid.height = newAsteroid.radius * 2;
    newAsteroid.angle = createVector(newAsteroid.angle.x, newAsteroid.angle.y);
    
    newAsteroid.velocity = createVector(Math.random() * (Math.random() < 0.5 ? 1 : -1), Math.random() * (Math.random() < 0.5 ? 1 : -1));


    newAsteroid.on('update', newAsteroid.update);

    return newAsteroid;

  }

  function create (config) {
    return init(_.extend(Object.create(asteroidPrototype), config));
  }

  return create;

}());