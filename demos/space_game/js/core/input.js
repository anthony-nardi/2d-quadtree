'use strict';

module.exports = (function () {


  var keys = require('./keys'),
      mouse = ['mousedown', 'mouseup', 'click', 'move'],
      inputState = [];

  window.addEventListener('keydown', function (event) {
    inputState[event.which] = true;
  });

  window.addEventListener('keyup', function (event) {
  	inputState[event.which] = false;
  });

  // window.addEventListener('mousedown', function (event) {
  //   inputState.mouseDown = event;
  // });

  // window.addEventListener('mouseup', function (event) {
  //   inputState.mouseUp = event;
  // });
  
  window.addEventListener('mousemove', function (event) {
    mouse.mousemove = event;
  });
  
  window.addEventListener('click', function (event) {
    mouse.click = event;
    console.log(event)
  });

  return {
    'getKey': function (key) {
      return (mouse[key] || inputState[keys.indexOf(key)]);
    },
    'resetMouse': function () {
      mouse.mousedown = false;
      mouse.mouseup   = false;
      mouse.click     = false;
      mouse.mousemove = false;
    }
  };

}());