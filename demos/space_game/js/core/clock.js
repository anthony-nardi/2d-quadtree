'use strict';

module.exports = (function () {

  var inputs = require('./input'),
  		events = require('./events'),
      fps    = require('./fps'),

      renderOpsPerSec = Object.create(fps),

      UPDATE_BUFFER  = 10,

      getCurrentTime = Date.now,

      now            = 0,
      last           = 0,
      dtBuffer       = 0,

      looping        = false,
      draw           = true,
      requestAnimationFrameId;

  function onRequestAnimationFrame () {
    draw = true;
  }

  function loop () {
   
    now = getCurrentTime();

    dtBuffer += now - last;

    events.fire('input', inputs.getKey);
    
    inputs.resetMouse();

    while (dtBuffer >= UPDATE_BUFFER) {
      events.fire('update');
      dtBuffer -= UPDATE_BUFFER;
    }

    if (draw) {
      events.fire('render', now);
      draw = false;
      requestAnimationFrameId = window.requestAnimationFrame(onRequestAnimationFrame);
    }


    last = now;

    if (looping) {
      setTimeout(loop, 0);
    }

  }

  function start () {

    if (!looping) {
      console.log('Clock started.');
      looping = true;
      last    = getCurrentTime();
      requestAnimationFrameId = window.requestAnimationFrame(onRequestAnimationFrame);
      loop();

    }

  }

  function stop () {
    console.log('Clock stoped.');
    cancelAnimationFrame(requestAnimationFrameId);
    looping = false;

  }

  return {
    'start': start,
    'stop' : stop,
    'UPDATE_BUFFER': UPDATE_BUFFER
  };

}());