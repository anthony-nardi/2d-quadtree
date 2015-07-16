'use strict';

module.exports = (function () {

  var canvas   = document.createElement('canvas'),
      ctx      = canvas.getContext('2d'),
      toResize = true;

  function resize () {
    if (toResize) {
      console.log('Resizing canvas.');
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
      toResize      = false;
    }
  }

  function setToResize () {
    console.log('Window resizing.');
    toResize = true;
  }

  window.document.body.appendChild(canvas);
  window.document.body.style.margin = '0px';
  window.document.body.style.overflow = 'hidden';

  canvas.ctx = ctx;

  resize();

  window.addEventListener('resize', setToResize, false);

  return {
    'canvas' : canvas,
    'ctx'    : ctx,
    'resize' : resize
  };

}());
