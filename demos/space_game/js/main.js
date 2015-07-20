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
      'width': 20000,
      'height': 20000
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
    'x': 20,
    'y': 30,
    'font': '2em Georgia',
    'value': 10000
  });

  var turretButton = buttonFactory({

    'x': 35,
    'y': 50,
    'img': (function () {
      var img = new Image();
      img.src = 'turretButton.png';
      return img;
    }()),
    'viewport': myViewport,

    'static': true,
    
    'onClick': function () {
      var turretButton = this;
      if (money.value >= 1000) {

        money.value = money.value - 1000;
        money.information = '$' + money.value;

        turretButton.isBusy = true;

        var newTurret = turretFactory({
          'static': true,
          'viewport': myViewport,
          'quadTree': map,
          'onPlacement': function () {
            turretButton.isBusy = false;
          }
        });

        map.insert(newTurret);
        
      }
    }
  });

  function createNewPlayerShip () {
 
    setTimeout(function () {
      
      if (money.value >= 3000) {

        money.value = money.value - 3000;
        
        money.information = '$' + money.value;    
        
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

      }
    }, 3000);

  }
  var planet = planetFactory();

  map.insert(planet);
  
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

  function isIntersectingCircles (c1, c2) {
  
    var dx       = c1.x - c2.x,
        dy       = c1.y - c2.y,
        distance = Math.sqrt(dx * dx + dy * dy);

    return distance < c1.radius + c2.radius;
  }

  for (var i = 0; i < 200; i += 1) {

    var negX   = Math.random() < 0.5,
        negY   = Math.random() < 0.5,
        angleX = Math.random(),
        angleY = Math.random(),
        radius = Math.getRandomInt(25,75),
        randX  = Math.getRandomInt(map.x - map.halfWidth,  map.x  + map.halfWidth),
        randY  = Math.getRandomInt(map.y - map.halfHeight, map.y + map.halfHeight);

    while (isIntersectingCircles({'x':randX, 'y':randY, 'radius': radius}, {'x':planet.x, 'y':planet.y, 'radius': planet.radius * 4})) {
      console.log('trying to place asteroid in good location.');
      randX  = Math.getRandomInt(map.x - map.halfWidth,  map.x  + map.halfWidth);
      randY  = Math.getRandomInt(map.y - map.halfHeight, map.y + map.halfHeight);
    }

    map.insert(asteroidFactory({

    'radius': radius,

    'quadTree' : map,

    'speed': Math.getRandomInt(1, 10),

    'x': randX,
    'y': randY,

    'angle': {
      'x': negX ? - angleX : angleX,
      'y': negY ? - angleY : angleY
    },

    'onLastImpact': addMoneyWhenAsteroidIsDestroyed,

    'color': '#'+Math.floor(Math.random()*16777215).toString(16)
    
    }));

  }

  function addMoneyWhenAsteroidIsDestroyed () {
    money.value = money.value + 200;
    money.information = '$' + money.value;
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