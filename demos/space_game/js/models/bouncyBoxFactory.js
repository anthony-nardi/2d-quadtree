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

    'angle': {},

    'speed': 1,

    'breaks': 2,

    'isAsteroid': true,

    'removeNextUpdate': false,
    'isRemoved' : false,

    'sim'  : clock.UPDATE_BUFFER,

    'impact': function () {
      var quadTree = this.quadTree;

        this.removeNextUpdate = true;
      if (this.breaks === 0) {
      } else {

        quadTree.insert(create({
          'x': this.x,
          'y': this.y,
          'width': this.width * 0.6,
          'height': this.height * 0.6,
          'speed': this.speed * 0.9,
          'angle': {
            'x': Math.getRandomInt(-180, 180),
            'y': Math.getRandomInt(-180, 180)
          },
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
          'speed': this.speed * 0.9,
          'breaks': this.breaks - 1,
          'quadTree': quadTree
        }));

      }

    },

    'update': function () {

      if (this.removeNextUpdate && !this.isRemoved) {
        this.isRemoved = true;
 
        this.off('update');
       this.remove();
       this.removed = true;
       return;
      }

      this.add(this.angle.normalize().mult(this.speed / this.sim));

      this.move(this.x, this.y);

    },

    'render': function (ctx, viewport) {
      ctx.fillStyle = this.color;
      ctx.lineWidth = this.lineWidth * viewport.scale;
      ctx.fillRect(-this.width * viewport.scale / 2, -this.height* viewport.scale / 2, this.width * viewport.scale, this.height * viewport.scale);
    }

  };

  function init(newBox) {

    _.extend(newBox, createVector(newBox.x, newBox.y));
    _.extend(newBox.angle, createVector(newBox.angle.x, newBox.angle.y));
    newBox.on('update', newBox.update);

    return newBox;

  }

  function create (config) {
    return init(_.extend(Object.create(boxPrototype), config));
  }

  return create;

}());