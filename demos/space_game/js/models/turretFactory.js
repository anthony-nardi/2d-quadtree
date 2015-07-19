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

    'border': 'blue',

    'lineWidth': 2,
    'z-index': 50,

    'angle'   : {},
    'rotation': {},
    
    'mass': 30,
    'force': 1,
    'isStationary': false,

    'removeNextUpdate': false,
    

    'sim'  : clock.UPDATE_BUFFER,

    'update': function () {

      if (this.removeNextUpdate) {
        this.off('update');
        this.remove();
        this.removed = true;
        return;
      }
    
    },

    'input': function (inputs) {
      var mousemove = inputs('mousemove');
      if (!this.isStationary && mousemove && mousemove.srcElement.tagName === 'CANVAS') {
        var coords = this.viewport.translateCanvasCoordinates({
          'x': mousemove.offsetX,
          'y': mousemove.offsetY
        });
        this.x = coords.x;
        this.y = coords.y;
      }
    },

    'render': function (ctx, viewport) {
      
      var xPos = -this.width / 2 * viewport.scale,
          yPos = -this.height / 2 * viewport.scale;



      
      ctx.drawImage(img, xPos, yPos, this.width * viewport.scale, this.height * viewport.scale);
      ctx.strokeRect(xPos, yPos, this.width * viewport.scale, this.height * viewport.scale);
    }

  };

  function init(newTurret) {

    _.extend(newTurret, createVector(newTurret.x, newTurret.y));

    if (newTurret.static) {
      console.log('always render')
      newTurret.viewport.addObjectToAlwaysRender(newTurret);
    }
    newTurret.width  = img.width;
    newTurret.height = img.height;
    newTurret.on('update', newTurret.update);
    newTurret.on('input',  newTurret.input);

    return newTurret;

  }

  function create (config) {
    return init(_.extend(Object.create(turretPrototype), config));
  }

  return create;

}());