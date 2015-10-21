'use strict';

var _ = require('underscore');

module.exports = (function () {

  var createVector      = require('../util/math/vector'),
      fullScreenDisplay = require('./fullScreenDisplay'),
      bounds            = require('../util/math/bounds'),
      render            = true,
      resizeTimeout,

      viewportProto = _.extend({

        // PROPERTIES
        'width'                   : fullScreenDisplay.canvas.width,
        'height'                  : fullScreenDisplay.canvas.height,
        'scale'                   : 1,
        'angle'                   : createVector(1, 0),
        //DISPLAY PROPERTIES
        'fullScreenDisplay'       : fullScreenDisplay,
        'fullScreenDisplayCanvas' : fullScreenDisplay.canvas,
        'fullScreenDisplayCtx'    : fullScreenDisplay.ctx,

        //-----PROTOTYPE METHODS--------
        'calculateDisplayPositions' : function () {

          // Fullscreen to fit browser window size
          fullScreenDisplay.resize();

          
          //TO DO: Actually calculate x and y fullScreenDisplay positions...
          return this;

        },

        'alwaysRender' : [],

        'addObjectToAlwaysRender': function (obj) {
          this.alwaysRender.push(obj);
        },

        'clearRender': function () {
          this.alwaysRender = [];
        },

        'calculateScale' : function () {

          // // Fullscreen to fit browser window size.
          this.calculateDisplayPositions();

          // Ideal aspect ratio is 3:1 as defined by the prototype width/height
          this.ratio = this.width / this.height;

          // The
          this.fullScreenDisplayRatio = this.fullScreenDisplayCanvas.width / this.fullScreenDisplayCanvas.height;

          // If our display ratio (width/height) is greater than our ideal display ratio (3:1), then scale by height.
          if(this.ratio <= this.fullScreenDisplayRatio) {

            this.scale = this.fullScreenDisplayCanvas.height / this.height;

          } else {

            this.scale = this.fullScreenDisplayCanvas.width  / this.width; //Wtf.

          }

          return this;

        },

        'follow' : function (obj) {
          console.log('Following ' + obj);
          this.following = obj;
        },

        'unfollow' : function () {
          this.following = false;
        },

        'zoomBy' : function (dUnits) {
          
          var oldHeight = this.height,
              oldWidth  = this.width;
          
          this.height += dUnits;
          this.width  += dUnits * this.ratio;
          
          if (this.height < 1) {
            this.height = oldHeight;
            this.width  = oldWidth;
            return this;
          }
        
          if (this.width < 1) {
            this.height = oldHeight;
            this.width  = oldWidth;
            return this;
          }

          this.calculateScale();
          this.y -= dUnits / 2; // So it zooms from the planet center as origin
          
          return this;
        
        },

        'translateCanvasCoordinates': function (coordinates) {

          var x = coordinates.x,
              y = coordinates.y,
              posVector = createVector(x, y);

          posVector.x -= this.width * this.scale * 0.5;
          posVector.y -= this.height * this.scale;
          
          posVector.rotate(this.angle.toRadians());
          
          posVector.x += this.width * this.scale * 0.5;
          posVector.y += this.height * this.scale;
          
          return {
            'x': this.bounds.left + posVector.x / this.scale,
            'y': this.bounds.top  + posVector.y / this.scale
          };

        },

        'render' : function (time) {

          var scale      = this.scale,
              ctx        = this.fullScreenDisplayCtx,
              renderList = _.sortBy(this.quadTree.getOrphansAndChildren().concat(this.alwaysRender), 'z-index'),//this.collidesList().concat(this.alwaysRender),
              offsetX    = this.x - this.width / 2,
              offsetY    = this.y - this.height / 2;
          
          
          this.bounds = bounds(this);
          
          renderList.splice(renderList.indexOf(this), 1);

          ctx.fillStyle = '#000000';
          ctx.fillRect(0, 0, this.fullScreenDisplayCanvas.width, this.fullScreenDisplayCanvas.height);
          ctx.save();

          ctx.translate((this.rotationOrigin.x - offsetX) * scale, (this.rotationOrigin.y - offsetY) * scale);
          ctx.rotate(-this.angle.toRadians());
          ctx.translate(-((this.rotationOrigin.x - offsetX) * scale), -((this.rotationOrigin.y - offsetY) * scale));
          for (var i = 0; i < renderList.length; i += 1) {
            ctx.save();
            ctx.translate((renderList[i].x - offsetX) * scale, (renderList[i].y - offsetY) * scale);
            if (renderList[i].getRotation) {
             ctx.rotate(renderList[i].getRotation());
            }
            renderList[i].render(ctx, this, time);
            ctx.restore();
          }
          ctx.restore();
          ctx.strokeStyle = '#E01B6A';
          ctx.lineWidth = '2';
          ctx.strokeRect(0, 0, this.width * scale, this.height * scale);
          return this;

        }

      }, createVector());


  function init (that) {

    window.addEventListener('resize', function () {

      render = false;

      if (resizeTimeout) {
        clearTimeout(resizeTimeout);
      }

      resizeTimeout = setTimeout(function () {

        that.zoomBy(0);
        render = true;

      }, 500);

    }, false);

    // Fullscreen to fit browser window size and set scale.
    that.calculateScale();

    that.quadTree.insert(that);

    that.forceRender = function () {
      render = true;
    };

    that.on('update', function () {

      if (this.following) {
        this.x = this.following.x;
        this.y = this.following.y;
      }

    });

    that.on('render', function (time) {
      if (render) {
        that.render(time);
      }
    });

    that.on('input', function (inputs) {
      if (inputs('z')) {
        that.zoomBy(-5);
      }
      if (inputs('x')) {
        that.zoomBy(5);
      }
      if (inputs('a')) {
        // this.x += this.rotationOrigin.x * that.scale;
        // this.y += this.rotationOrigin.y * that.scale;
        this.angle.rotate(0.0025);
        // this.x -= this.rotationOrigin.x * that.scale;
        // this.y -= this.rotationOrigin.y * that.scale;
      }
      if (inputs('d')) {
        this.x -= this.rotationOrigin.x * that.scale;
        this.y -= this.rotationOrigin.y * that.scale;
        this.angle.rotate(-0.0025);
        this.x += this.rotationOrigin.x * that.scale;
        this.y += this.rotationOrigin.y * that.scale;
      }
      render = true;
    });

    return that;

  }

  return function (OO) {
    return init(_.extend(Object.create(viewportProto), (OO || {})));
  };

}());