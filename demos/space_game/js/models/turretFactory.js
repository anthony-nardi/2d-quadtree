 'use strict';

var _ = require('underscore');

module.exports = (function () {

  var createVector = require('../util/math/vector'),
      clock        = require('../core/clock'),
      img          = new Image();

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
    

    'sim'  : clock.UPDATE_BUFFER,
    
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

    'resetAngle': function () {
      this.angle.x = 0;
      this.angle.y = 4;
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
          if (collidesList[i].isPlanet) {
            this.isValidPlacement = true;
            this.resetAngle();
            this.updateAngle(Math.atan2(this.y - collidesList[i].y, this.x - collidesList[i].x));
            this.normalize().mult(collidesList[i].radius + this.height / 2);
            return;
          }
        }
        this.resetAngle();
        this.isValidPlacement = false;
        
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

    return newTurret;

  }

  function create (config) {
    return init(_.extend(Object.create(turretPrototype), config));
  }

  return create;

}());