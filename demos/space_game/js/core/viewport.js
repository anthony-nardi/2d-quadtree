'use strict';

var _ = require('underscore');

module.exports = (function () {

  var createQuadTree    = require('./quadTree'),
      createVector      = require('../util/math/vector'),
      fullScreenDisplay = require('./fullScreenDisplay'),
      bounds            = require('../util/math/bounds'),
      clock             = require('./clock'),
      viewportCounter   = 0,
      render            = true,
      resizeTimeout,

      viewportProto = _.extend({

        // PROPERTIES
        'width'                   : 300,
        'height'                  : 300,
        'zIndex'                  : 0,
        'scale'                   : 1,
        'angle'                   : createVector(0, 0),
        'zoomSpeed'               : 40,
        'speed'                   : 100,
        'up'                      : 'h',
        'left'                    : 'b',
        'right'                   : 'm',
        'down'                    : 'n',
        'zoomDirection'           : 0,
        'zoomIn'                  : 'i',
        'zoomOut'                 : 'k',

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
              oldWidth = this.width;
          this.height += dUnits;
          this.width += dUnits * this.ratio;
          if (this.height < 1) {
            this.height = oldHeight;
            this.width = oldWidth;
            return this;
          }
          if (this.width < 1) {
            this.height = oldHeight;
            this.width = oldWidth;
            return this;
          }
          this.calculateScale();
          // this.updateParent();
          return this;
        },

        'translateCanvasCoordinates': function (coordinates) {

          var x = coordinates.x,
              y = coordinates.y;

          return {
            'x': this.bounds.left + x / this.scale,
            'y': this.bounds.top  + y / this.scale
          };

        },

        'inputUpdate': function () {
          var state = this.input(this.up)    * 8 +
                      this.input(this.down)  * 2 +
                      this.input(this.right) * 1 +
                      this.input(this.left)  * 4;
          switch (state) {
            case 0:
              this.angle.x= 0;
              this.angle.y= 0;
              break;
            case 1:
              this.angle.x= 1;
              this.angle.y= 0;
              break;
            case 2:
              this.angle.x= 0;
              this.angle.y= 1;
              break;
            case 3:
              this.angle.x= 0.7071067811865475;
              this.angle.y= 0.7071067811865475;
              break;
            case 4:
              this.angle.x= -1;
              this.angle.y= 0;
              break;
            case 5:
              this.angle.x= 0;
              this.angle.y= 0;
              break;
            case 6:
              this.angle.x= -0.7071067811865475;
              this.angle.y= 0.7071067811865475;
              break;
            case 7:
              this.angle.x= 0;
              this.angle.y= 1;
              break;
            case 8:
              this.angle.x= 0;
              this.angle.y= -1;
              break;
            case 9:
              this.angle.x= 0.7071067811865475;
              this.angle.y= -0.7071067811865475;
              break;
            case 10:
              this.angle.x= 0;
              this.angle.y= 0;
              break;
            case 11:
              this.angle.x= 1;
              this.angle.y= 0;
              break;
            case 12:
              this.angle.x= -0.7071067811865475;
              this.angle.y= -0.7071067811865475;
              break;
          }

          state = this.input(this.zoomIn) * 1 +
                  this.input(this.zoomOut) * 2;
          if (state === 1) {
            this.zoomDirection = -1;
            return this;
          }
          if (state === 2) {
            this.zoomDirection = 1;
            return this;
          }
          if (!state) {
            this.zoomDirection = 0;
            return this;
          }
          return this;
        },

        'render' : function (time) {

          var scale      = this.scale,
              ctx        = this.fullScreenDisplayCtx,
              renderList = _.sortBy(this.quadTree.getOrphansAndChildren().concat(this.alwaysRender), 'z-index'),//this.collidesList().concat(this.alwaysRender),
              offsetX    = this.x - this.width / 2,
              offsetY    = this.y - this.height / 2;

          // console.log('~~~~~~~~~~~~~~RENDER LIST~~~~~~~~~~~~~~~~~~~~~');
          // console.log(renderList);
          //get bounds for render
          this.bounds = bounds(this);

          renderList.splice(renderList.indexOf(this), 1);
          // renderList = sortByProp(renderList, 'zIndex');

          ctx.fillStyle = '#000000';
          ctx.fillRect(0, 0, this.fullScreenDisplayCanvas.width, this.fullScreenDisplayCanvas.height);

          for (var i = 0; i < renderList.length; i += 1) {
            ctx.save();
            ctx.translate((renderList[i].x - offsetX) * scale, (renderList[i].y - offsetY) * scale);
            if (renderList[i].getRotation) {
             ctx.rotate(renderList[i].getRotation());
            }
            renderList[i].render(ctx, this, time);
            ctx.restore();
          }

          ctx.strokeStyle = '#E01B6A';
          ctx.lineWidth = '2';
          ctx.strokeRect(0, 0, this.width * scale, this.height * scale);
          return this;

        }

      }, createVector());


  function init (that) {
    that.sim          = clock.UPDATE_BUFFER / 1000;
    that.viewportName = viewportCounter += 1;

    window.addEventListener('resize', function () {

      render = false;

      if (resizeTimeout) {
        clearTimeout(resizeTimeout);
      }

      resizeTimeout = setTimeout(function () {

        that.calculateScale();
        render = true;

      }, 500);

    }, false);

    that.quadTree = that.quadTree || createQuadTree({'bounds':true});

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
        //console.log('Updating viewport.');
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
      render = true;
    });

    return that;

  }

  return function (OO) {
    return init(_.extend(Object.create(viewportProto), (OO || {})));
  };

}());