'use strict';

if (!Object.prototype.extend) {

  Object.prototype.extend = function (object) {

    for (var key in object) {

      if (typeof object[key] === 'object' &&
          typeof this[key] === 'object'   &&
          this.hasOwnProperty(key)) {

        this[key].extend(object[key]);

      } else {
        this[key] = object[key];
      }
    }
    return this;
  };
}