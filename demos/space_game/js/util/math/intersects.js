module.exports = (function () {
  var bounds = require('./bounds');

  return function (obj1, obj2) {
		
		var obj1 = bounds(obj1),
	      obj2 = bounds(obj2);

		return (obj1.left < obj2.right &&
		        obj1.right > obj2.left &&
	          obj1.top < obj2.bottom &&
	          obj1.bottom > obj2.top);
  }

}());
