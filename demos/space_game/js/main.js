'use strict';


var QuadTree = window.QuadTree = require('./core/quadTree.js'),
    clock                      = require('./core/clock'),
    boxFactory                 = require('./models/boxFactory'),
    asteroidFactory            = require('./models/asteroidFactory'),
    explosionFactory           = require('./models/explosionFactory'),
    shipFactory                = require('./models/shipFactory'),
    planetFactory              = require('./models/planetFactory'),
    events                     = require('./core/events.js'),
    textFactory                = require('./models/textFactory'),
    buttonFactory              = require('./models/buttonFactory'),
    turretFactory              = require('./models/turretFactory'),
    map                        = new QuadTree({
      'width': 10000,
      'height': 10000
    });

function init () {
    
  var viewport = require('./core/viewport');

  var myViewport = viewport({
    'quadTree': map
  });

  var money = textFactory({
    'information': '$10000',
    'viewport': myViewport,
    'color': '#94cd4b',
    'static': true,
    'x': 10,
    'y': 20,
    'font': '2em Georgia'
  });

  var turretButton = buttonFactory({
    'x': 25,
    'y': 40,
    'img': (function () {
      var img = new Image();
      img.src = 'turretButton.png';
      return img;
    }()),
    'viewport': myViewport,
    'static': true,
    'onClick': function () {
      var newTurret = turretFactory({
        'static': true,
        'viewport': myViewport
      });
      // map.insert(turretFactory());
    }
  });

  function createNewPlayerShip () {
    setTimeout(function () {
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
    }, 3000);
  }
 
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

  events.on('playerDead', createNewPlayerShip);

}

window.addEventListener('DOMContentLoaded', init);