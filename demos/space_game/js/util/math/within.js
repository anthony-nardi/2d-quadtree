module.exports = (function () {

  var bounds = require('./bounds');

  return function (obj1, obj2) {
    var b1 = bounds(obj1),
        b2 = bounds(obj2);

    return (b1.left >= b2.left &&
        b1.top >= b2.top &&
        b1.right <= b2.right &&
        b1.bottom <= b2.bottom)
  }
}());
