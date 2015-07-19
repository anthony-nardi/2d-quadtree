'use strict';

module.exports = (function () {

  var inputs = require('./input'),
  		events = require('./events'),

      UPDATE_BUFFER  = 10,

      getCurrentTime = Date.now,

      now            = 0,
      last           = 0,
      dtBuffer       = 0,

      looping        = false;

  //renderOpsPerSec = Object.create(fps);

  function loop () {

    now = getCurrentTime();

    dtBuffer += now - last;

    events.fire('input', inputs.getKey);
    
    inputs.resetMouse();

    while (dtBuffer >= UPDATE_BUFFER) {
      events.fire('update');
      dtBuffer -= UPDATE_BUFFER;
    }

    
    events.fire('render', now);

    last = now;

    if (looping) {
    	setTimeout(loop, 1);
    }

  }

  /*
      PUBLIC METHODS
   */

  function start () {

    if (!looping) {
      console.log('Clock started.');
      looping = true;
      last    = getCurrentTime();

      loop();

    }

  }

  function stop () {

    looping = false;

  }

  return {
    'start': start,
    'stop' : stop,
    'UPDATE_BUFFER': UPDATE_BUFFER
  };

}());