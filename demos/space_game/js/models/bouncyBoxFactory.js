'use strict';

var _ = require('underscore');

module.exports = (function () {

  var createVector = require('../util/math/vector'),
      clock        = require('../core/clock');

  var boxPrototype = {

    'x': 0,
    'y': 0,

    'width': 50,
    'height': 50,

    'color': 'green',

    'border': 'blue',

    'lineWidth': 2,
    'z-index': 50,
    'angle'   : {},
    
    'rotation': {},
    'spin': 0,
    
    'mass': 30,
    'force': 1,

    'maxSpeed': 3,

    'breaks': 2,

    'isAsteroid': true,

    'removeNextUpdate': false,
    

    'sim'  : clock.UPDATE_BUFFER,

    'getRotation': function () {
        return this.rotation.toRadians();
    },

    'impact': function () {
      var quadTree = this.quadTree;
        this.removeNextUpdate = true;
      if (this.breaks === 0) {
      } else {
        var color = this.color;
        quadTree.insert(create({
          'x': this.x,
          'y': this.y,
          'width': this.width * 0.6,
          'height': this.height * 0.6,
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
          'width': this.width * 0.6,
          'angle': {
            'x': Math.getRandomInt(-180, 180),
            'y': Math.getRandomInt(-180, 180)
          },
          'height': this.height * 0.6,
          'speed': this.speed * 1.1,
          'breaks': this.breaks - 1,
          'color': color,
          'quadTree': quadTree
        }));

      }

    },

    'updatePosition': function () {

      this.add(this.velocity);
      this.move(this.x, this.y);
    },

    'updateRotation': function () {

      this.rotation.rotate(this.spin);
        
 
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
      
      this.updateRotation();
      this.updatePosition();
    
    },

    'render': function (ctx, viewport) {
      ctx.fillStyle = this.color;
      ctx.lineWidth = this.lineWidth * viewport.scale;
      ctx.fillRect(-this.width * viewport.scale / 2, -this.height* viewport.scale / 2, this.width * viewport.scale, this.height * viewport.scale);
    }

  };

  function init(newBox) {

    _.extend(newBox, createVector(newBox.x, newBox.y));

    newBox.angle = createVector(newBox.angle.x, newBox.angle.y);
    
    newBox.velocity = createVector(Math.getRandomInt(0, 100) / 100, Math.getRandomInt(0, 100) / 100);
    newBox.rotation = createVector(Math.getRandomInt(0, 100) / 100, Math.getRandomInt(0, 100) / 100);

    newBox.on('update', newBox.update);

    return newBox;

  }

  function create (config) {
    return init(_.extend(Object.create(boxPrototype), config));
  }

  return create;

}());