'use strict';

module.exports = function (obj) {
  var left = obj.x - obj.width / 2,
      right = left + obj.width,
      top = obj.y - obj.height / 2,
      bottom = top + obj.height;
  return {
    'left': left,
    'right': right,
    'top': top,
    'bottom': bottom
  };
};
