'use strict';


var QuadTree                   = require('./core/quadTree.js'),
    clock                      = require('./core/clock'),
    boxFactory                 = require('./models/boxFactory'),
    asteroidFactory            = require('./models/asteroidFactory'),
    shipFactory                = require('./models/shipFactory'),
    planetFactory              = require('./models/planetFactory'),
    events                     = require('./core/events.js'),
    textFactory                = require('./models/textFactory'),
    buttonFactory              = require('./models/buttonFactory'),
    turretFactory              = require('./models/turretFactory'),

    MAP_WIDTH          = 20000,
    MAP_HEIGHT         = 20000,

    STARTING_MONEY     = 10000,
    TURRET_COST        = 1000,
    SHIP_COST          = 3000,
    PLANET_HIT_COST    = 500,
    ASTEROID_VALUE     = 300,

    MIN_ASTEROID_RADIUS = 25,
    MAX_ASTEROID_RADIUS = 100,

    MIN_ASTEROID_SPEED  = 1,
    MAX_ASTEROID_SPEED  = 15,

    SHIP_RESPAWN_TIMER = 3000,

    NUMBER_OF_STARTING_ASTEROIDS = 250,

    map = new QuadTree({
      'width' : MAP_WIDTH,
      'height': MAP_HEIGHT
    });

function init () {
  
  var viewport = require('./core/viewport');

  var myViewport = viewport({
    'quadTree': map
  });
    
  // Outline quadtree
  myViewport.addObjectToAlwaysRender(boxFactory({
    'x'     : map.x,
    'y'     : map.y,
    'width' : map.width,
    'height': map.height
  }));
  
  // The planet
  var planet = planetFactory({
    'health': 50000,
    'impact': function (object) {
      this.health -= object.mass;
      money.value -= PLANET_HIT_COST;
    }
  });

  // Player ship
  var myShip = shipFactory({
    'angle':{
      'x':0.5,
      'y':0
    },
    'quadTree': map,
    'viewport': myViewport
  });

  // The money
  var money = textFactory({
    'information': function () {
      return '$' + this.value;
    },
    'viewport'   : myViewport,
    'color'      : '#94cd4b',
    'static'     : true,
    'x'          : 20,
    'y'          : 30,
    'font'       : '2em Georgia',
    'value'      : STARTING_MONEY
  });

  // Asteroid count text
  textFactory({
    'information': function () {
      return 'Asteroids: ' + getAsteroidCount();
    },
    'viewport': myViewport,
    'color'   : '#e893ff',
    'static'  : true,
    'x'       : myViewport.width * myViewport.scale - 700,
    'y'       : 30,
    'font'    : '2em Georgia'
  });

  // Turret button
  buttonFactory({
    'img': (function () {
      var img = new Image();
      img.src = 'turretButton.png';
      return img;
    }()),
    'x'       : 35,
    'y'       : 50,
    'viewport': myViewport,
    'static'  : true,
    'onClick' : function () {

      var turretButton = this;
      
      if (money.value >= TURRET_COST) {

        money.value = money.value - TURRET_COST;

        turretButton.isBusy = true;

        var newTurret = turretFactory({
          'static'     : true,
          'viewport'   : myViewport,
          'quadTree'   : map,
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
      
      if (money.value >= SHIP_COST) {

        money.value = money.value - SHIP_COST;
        
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
    }, SHIP_RESPAWN_TIMER);

  }

  map.insert(planet);

  map.insert(myShip);

  myViewport.zoomBy(2000);

  myViewport.follow(myShip);

  for (var i = 0; i < NUMBER_OF_STARTING_ASTEROIDS; i++) {

    var negX   = Math.random() < 0.5,
        negY   = Math.random() < 0.5,
        angleX = Math.random() * (negX ? -1 : 1),
        angleY = Math.random() * (negY ? -1 : 1),
        radius = Math.getRandomInt(MIN_ASTEROID_RADIUS, MAX_ASTEROID_RADIUS),
        randX  = Math.getRandomInt(map.x - map.halfWidth,  map.x  + map.halfWidth),
        randY  = Math.getRandomInt(map.y - map.halfHeight, map.y  + map.halfHeight);

    // Prevent asteroids from spawning near the planet.
    while (isIntersectingCircles({'x':randX, 'y':randY, 'radius': radius}, {'x':planet.x, 'y':planet.y, 'radius': planet.radius * 4})) {
      console.log('trying to place asteroid in good location.');
      randX = Math.getRandomInt(map.x - map.halfWidth,  map.x  + map.halfWidth);
      randY = Math.getRandomInt(map.y - map.halfHeight, map.y  + map.halfHeight);
    }

    map.insert(asteroidFactory({
      'radius'   : radius,
      'quadTree' : map,
      'speed'    : Math.getRandomInt(MIN_ASTEROID_SPEED, MAX_ASTEROID_SPEED),
      'x'        : randX,
      'y'        : randY,
      'value'    : ASTEROID_VALUE,
      'onImpact' : addMoneyWhenAsteroidIsDestroyed,
      'color'    : '#' + Math.floor(Math.random()*16777215).toString(16),
      'angle'    : {
        'x': angleX,
        'y': angleY
      }
    }));

  }

  function addMoneyWhenAsteroidIsDestroyed () {
    money.value = money.value + this.value;
  }

  clock.start();

  window.clock = clock;

  events.on('playerDead', createNewPlayerShip);

}

window.addEventListener('DOMContentLoaded', init);

function getAsteroidCount () {

  var allItems = map.getOrphansAndChildren(),
      count    = 0,
      i        = 0,
      l        = allItems.length;
  
  for (; i < l; i++) {
    if (allItems[i].isAsteroid) {
      count++;
    }
  }

  return count;
}

function isIntersectingCircles (c1, c2) {

  var dx       = c1.x - c2.x,
      dy       = c1.y - c2.y,
      distance = Math.sqrt(dx * dx + dy * dy);

  return distance < c1.radius + c2.radius;
}

if (!Math.getRandomInt) {
  Math.getRandomInt = function (min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };
}