'use strict';


var QuadTree = window.QuadTree = require('./core/quadTree.js'),
    clock                      = require('./core/clock'),
    boxFactory                 = require('./models/boxFactory'),
    shipFactory                = require('./models/shipFactory'),
    map                        = new QuadTree();


function init () {
    
  var viewport = require('./core/viewport');

  var myViewport = viewport({
    'quadTree': map
  });

  var box1 = boxFactory();

  myViewport.zoomBy(100);

  map.insert(box1);

  if (!Math.getRandomInt) {
    Math.getRandomInt = function (min, max) {
      return Math.floor(Math.random() * (max - min + 1)) + min;
    };
  }

  myViewport.addObjectToAlwaysRender(boxFactory({
    'x': map.x,
    'y': map.y,
    'width': map.width,
    'height': map.height
  }));

  var myShip = map.insert(shipFactory({
    'angle':{
      'x':0.5,
      'y':0
    },
    'quadTree': map,
    'viewport': myViewport
  }));

  clock.start();

  window.map = map;
  window.myViewport = myViewport;

}

window.addEventListener('DOMContentLoaded', init);