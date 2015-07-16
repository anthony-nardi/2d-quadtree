'use strict';

var _ = require('underscore');

module.exports = (function () {

  var boxPrototype = {
    'x': 0,
    'y': 0,
    'width': 10,
    'height': 10,
    'color': 'yellow',
    'border': 'blue',
    'render': function (ctx, viewport) {
      ctx.strokeStyle = this.color;
      ctx.strokeRect(-this.width * viewport.scale / 2, -this.height* viewport.scale / 2, this.width * viewport.scale, this.height * viewport.scale);
    }
  };

  function init(newBox) {

    return newBox;

  }

  return function (config) {
    return init(_.extend(Object.create(boxPrototype), config));
  };

}());