'use strict';

var _ = require('underscore');

module.exports = (function () {

  var buttonPrototype = {

    'information': {},

    'isBusy': false,

    'x': 0,
    'y': 0,

    'width': 80,
    'height': 80,

    'font': '20px Georgia',
    'z-index': 9999999,

    'color': '#ffffff',
    'busyColor': 'green',

    'render': function (ctx, viewport) {

      var xPos = this.x,
          yPos = this.y,
          width = this.width,
          height = this.height;

      ctx.strokeStyle = this.isBusy ? this.busyColor : this.color;
     
      if (this.static) {
        xPos = this.x + (viewport.x - viewport.width  / 2) * viewport.scale;
        yPos = this.y + (viewport.y - viewport.height / 2) * viewport.scale;
      } else {
        width  = width  * viewport.scale;
        height = height * viewport.scale;
        xPos   = -width  / 2;
        yPos   = -height / 2;
      }

      ctx.drawImage(this.img, xPos, yPos, width, height);

      ctx.strokeRect(xPos, yPos, width, height);

    },

    'input': function (inputs) {
      
      if (this.isBusy) {
        return;
      }

      var clickEvent = inputs('click');

      if (clickEvent) {
        if (clickEvent.srcElement.tagName === 'CANVAS') {
          if (this.isClicked(clickEvent.offsetX, clickEvent.offsetY)) {
            this.onClick();
          }
        }
      }
    },

    'isClicked': function (x, y) {
      if (this.static) {
        var buttonLeft   = this.x * (1 + this.viewport.scale),
            buttonRight  = buttonLeft + this.width,
            buttonTop    =   this.y * (1 + this.viewport.scale),
            buttonBottom = buttonTop + this.height;

        return (buttonLeft <= x && buttonRight >= x && buttonTop <= y && buttonBottom >= y);

      } else {
        var clickCoordinates = this.viewport.translateCanvasCoordinates({x: x, y: y}),
          turretLeft   = this.x - this.width / 2,
          turretRight  = turretLeft + this.width,
          turretTop    = this.y - this.height / 2,
          turretBottom = turretTop + this.height;

      return (turretLeft <= clickCoordinates.x && turretRight >= clickCoordinates.x && turretTop <= clickCoordinates.y && turretBottom >= clickCoordinates.y);
      }
    },

    'remove': function () {
      this.viewport.alwaysRender.splice(this.viewport.alwaysRender.indexOf(this), 1);
      this.off('input', this.input);
    }

  };

  function init (newButton) {
    newButton.viewport.addObjectToAlwaysRender(newButton);
    newButton.on('input',  newButton.input);
    return newButton;
  }

  return function (config) {
    return init(_.extend(Object.create(buttonPrototype), config));
  };

}());