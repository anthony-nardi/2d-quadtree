(function () {

      window.onload = function () {

      var socket = io();

      if (Object.prototype.on === undefined) {
        Object.prototype.on = events.on;
      }

      if (Object.prototype.off === undefined) {
        Object.prototype.off = events.off;
      }

      if (Object.prototype.fire === undefined) {
        Object.prototype.fire = events.fire;
      }

      window.on('keydown', function(event) {

        console.log('Key sent: ' + event.which);
        socket.emit('keydown', event.which);

      });

      socket.on('update', function(key) {
        console.log('Key received: ' + key);
      });



    };

  }());