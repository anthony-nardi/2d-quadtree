'use strict';
var _ = require('underscore');
module.exports = (function () {

	var textProto = {

    'information': {},

    'x': 0,
    'y': 0,

    'width': undefined,
    'height': undefined,

    'font': '20px Georgia',
    'z-index': 9999999,

    'color': '#ffffff',

    'getText': function () {

      if (typeof this.information === 'string' || typeof this.information === 'number') {
        return this.information;
      }

      if (typeof this.information === 'function') {
        return this.information();
      }

    },

    'render': function (ctx, viewport) {

      var xPos = this.x,
          yPos = this.y;
      
      if (this.static) {
        xPos = this.x + (viewport.x - viewport.width  / 2) * viewport.scale;
        yPos = this.y + (viewport.y - viewport.height / 2) * viewport.scale;

        
      }
      var text = this.getText();

      ctx.font = this.font;
      ctx.fillStyle = this.color;

      
      ctx.fillText(text, xPos, yPos);
      

  	}

  };

	function init (newText) {
		newText.viewport.addObjectToAlwaysRender(newText);
    return newText;
	}

	return function (config) {
    return init(_.extend(Object.create(textProto), config));
	};

}());