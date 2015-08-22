'use strict';

module.exports = (function () {

  var canvas   = document.createElement('canvas'),
      ctx      = canvas.getContext('2d'),
      toResize = true;

  function resize () {
    if (toResize) {
      console.log('Resizing canvas.');
      if (window.innerHeight < window.innerWidth) {
        canvas.width  = window.innerHeight;
        canvas.height = window.innerHeight;
      } else {
        canvas.width  = window.innerWidth;
        canvas.height = window.innerWidth;
      }
      toResize      = false;
    }
  }

  function setToResize () {
    console.log('Window resizing.');
    toResize = true;
  }

  window.document.body.appendChild(canvas);
  window.document.body.style.margin = '0 auto';
  window.document.body.style.overflow = 'hidden';
  window.document.body.style.background = '#000';
  canvas.style.display = 'block';
  canvas.style.margin = '0 auto';
  canvas.setAttribute('oncontextmenu', 'return false');



  canvas.ctx = ctx;

  resize();

  window.addEventListener('resize', setToResize, false);

  return {
    'canvas' : canvas,
    'ctx'    : ctx,
    'resize' : resize
  };

}());
