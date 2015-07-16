'use strict';

module.exports = (function () {


  var keys = require('./keys'),
      inputState = [];

  window.addEventListener('keydown', function (event) {
    inputState[event.which] = true;
  });

  window.addEventListener('keyup', function (event) {
  	inputState[event.which] = false;
  });

  return function (key) {
    return (true === inputState[keys.indexOf(key)]);
  };

}());