'use strict';


var QuadTree = window.QuadTree = require('./core/quadTree.js'),
    clock                      = require('./core/clock'),
    boxFactory                 = require('./models/boxFactory'),
    bouncyBoxFactory           = require('./models/bouncyBoxFactory'),
    asteroidFactory            = require('./models/asteroidFactory'),
    explosionFactory           = require('./models/explosionFactory'),
    shipFactory                = require('./models/shipFactory'),
    planetFactory              = require('./models/planetFactory'),
    map                        = new QuadTree({
      'width': 10000,
      'height': 10000
    });


function init () {
    
  var viewport = require('./core/viewport');

  var myViewport = viewport({
    'quadTree': map
  });


  map.insert(planetFactory());
  
  var myShip = shipFactory({
    'angle':{
      'x':0.5,
      'y':0
    },
    'quadTree': map,
    'viewport': myViewport
  });

  map.insert(myShip);

  myViewport.zoomBy(2000);

  myViewport.follow(myShip);


  if (!Math.getRandomInt) {
    Math.getRandomInt = function (min, max) {
      return Math.floor(Math.random() * (max - min + 1)) + min;
    };
  }
  
  for (var i = 0; i < 200; i += 1) {

    var negX   = Math.random() < 0.5,
        negY   = Math.random() < 0.5,
        angleX = Math.random(),
        angleY = Math.random(),
        radius  = Math.getRandomInt(25,75);

    map.insert(asteroidFactory({

    'radius': radius,

    'quadTree' : map,

    'speed': Math.getRandomInt(1, 10),

    'x': Math.getRandomInt(map.x - map.halfWidth,  map.x  + map.halfWidth),
    'y': Math.getRandomInt(map.y - map.halfHeight, map.y + map.halfHeight),

    'angle': {
      'x': negX ? - angleX : angleX,
      'y': negY ? - angleY : angleY
    },


    'color': '#'+Math.floor(Math.random()*16777215).toString(16)
    
    }));

  }

  myViewport.addObjectToAlwaysRender(boxFactory({
    'x': map.x,
    'y': map.y,
    'width': map.width,
    'height': map.heightwxc
  }));


  clock.start();

  window.map = map;
  window.clock = clock;
  window.myViewport = myViewport;
  window.explosionFactory = explosionFactory;

}

window.addEventListener('DOMContentLoaded', init);