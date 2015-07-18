'use strict';


var QuadTree = window.QuadTree = require('./core/quadTree.js'),
    clock                      = require('./core/clock'),
    boxFactory                 = require('./models/boxFactory'),
    bouncyBoxFactory           = require('./models/bouncyBoxFactory'),
    explosionFactory           = require('./models/explosionFactory'),
    shipFactory                = require('./models/shipFactory'),
    map                        = new QuadTree({
      'width': 10000,
      'height': 10000
    });


function init () {
    
  var viewport = require('./core/viewport');

  var myViewport = viewport({
    'quadTree': map
  });



  myViewport.zoomBy(1000);


  if (!Math.getRandomInt) {
    Math.getRandomInt = function (min, max) {
      return Math.floor(Math.random() * (max - min + 1)) + min;
    };
  }
  
  for (var i = 0; i < 200; i += 1) {

    var negX   = Math.random() < 0.5,
        negY   = Math.random() < 0.5,
        negSpin = Math.random() < 0.5,
        spin    = (negSpin ? -1 : 1) * Math.getRandomInt(0, 25) / 1000,
        angleX = Math.random(),
        angleY = Math.random(),
        width  = Math.getRandomInt(25,100);

    map.insert(bouncyBoxFactory({

    'width' : width,
    'height': width,

    'quadTree' : map,

    'speed': Math.getRandomInt(1, 10),

    'x': Math.getRandomInt(map.x - map.halfWidth,  map.x  + map.halfWidth),
    'y': Math.getRandomInt(map.y - map.halfHeight, map.y + map.halfHeight),

    'angle': {
      'x': negX ? - angleX : angleX,
      'y': negY ? - angleY : angleY
    },

    'spin': spin,

    'color': '#'+Math.floor(Math.random()*16777215).toString(16)
    
    }));

  }

  myViewport.addObjectToAlwaysRender(boxFactory({
    'x': map.x,
    'y': map.y,
    'width': map.width,
    'height': map.heightwxc
  }));

  var myShip = shipFactory({
    'angle':{
      'x':0.5,
      'y':0
    },
    'quadTree': map,
    'viewport': myViewport
  });

  map.insert(myShip);

  myViewport.follow(myShip);

  clock.start();

  window.map = map;
  window.clock = clock;
  window.myViewport = myViewport;
  window.explosionFactory = explosionFactory;

}

window.addEventListener('DOMContentLoaded', init);