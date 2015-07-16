'use strict';

module.exports = (function () {

	var logProto = {

    'information': {},

    'x': 0,
    'y': 0,

    'width': undefined,
    'height': undefined,

    'font': '20px Georgia',

    'color': '#ffffff',

    'getText': function () {

      var text = '';

      for (var key in this.information) {
        if (this.information.hasOwnProperty(key)) {
          text += key + ': ' + this.information[key] + '\n';
        }
      }

      return text.split('\n');

    },

    'render': function (ctx, viewport) {

      var text = this.getText();

      ctx.font = this.font;
      ctx.fillStyle = this.color;

      for (var i = 0; i < text.length; i += 1) {
        ctx.fillText(text[i], 0, i * 20);
      }

  	}

  };

	function init (newLog) {
		newLog.viewport.addObjectToAlwaysRender(newLog);
    return newLog;
	}

	return function (config) {
    return init(Object.create(logProto).extend(config));
	};

}());