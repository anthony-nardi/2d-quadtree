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
          yPos = this.y;

      ctx.strokeStyle = this.isBusy ? this.busyColor : this.color;
     
      if (this.static) {
        xPos = this.x + (viewport.x - viewport.width  / 2) * viewport.scale;
        yPos = this.y + (viewport.y - viewport.height / 2) * viewport.scale;
      }

      ctx.drawImage(this.img, xPos, yPos, this.width, this.height);

      ctx.strokeRect(xPos, yPos, this.width, this.height);

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

      var buttonLeft   = this.x * (1 + this.viewport.scale),
          buttonRight  = buttonLeft + this.width,
          buttonTop    =   this.y * (1 + this.viewport.scale),
          buttonBottom = buttonTop + this.height;

      return (buttonLeft <= x && buttonRight >= x && buttonTop <= y && buttonBottom >= y);
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