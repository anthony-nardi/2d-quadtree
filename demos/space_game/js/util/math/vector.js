'use strict';

var _ = require('underscore');

module.exports = (function () {

  var vectorProto = {

    'add' : function (v) {
      this.x += v.x;
      this.y += v.y;
      return this;
    },

    'sub' : function (v) {
      this.x -= v.x;
      this.y -= v.y;
      return this;
    },

    'mult' : function (m) {
      this.x *= m;
      this.y *= m;
      return this;
    },

    'div' : function (m) {
      this.x /= m;
      this.y /= m;
      return this;
    },

    'dot' : function (v) {
      return v.x * this.x + v.y * this.y;
    },

    'lengthSquared' : function () {
      return this.dot(this);
    },

    'length' : (function () {
      var sqrt = Math.sqrt;
      return function () {
        return sqrt(this.lengthSquared());
      };
    }()),

    'normalize' : function () {
      var len = this.length();
      if (len) {
        return this.div(len);
      }
      return this;
    },

    'rotate' : function (angle) {

      var x      = this.x,
          y      = this.y,
          cosVal = Math.cos(angle),
          sinVal = Math.sin(angle);

      this.x = x * cosVal - y * sinVal;
      this.y = x * sinVal + y * cosVal;

      return this;

    },

    'toRadians': function () {
      return Math.atan2(this.y, this.x);
    }

  };

  return function (x, y) {
    return _.extend(Object.create(vectorProto),{
      'x' : x || 0,
      'y' : y || 0
    });
  };

}());
