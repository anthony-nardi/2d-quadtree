'use strict';

var _                          = require('underscore'),
    QuadTree                   = require('./core/quadTree.js'),
    clock                      = require('./core/clock'),
    asteroidFactory            = require('./models/asteroidFactory'),
    shipFactory                = require('./models/shipFactory'),
    planetFactory              = require('./models/planetFactory'),
    explosionFactory           = require('./models/explosionFactory'),

    textFactory                = require('./models/textFactory'),
    buttonFactory              = require('./models/buttonFactory'),
    turretFactory              = require('./models/turretFactory'),
    sheildFactory              = require('./models/sheildFactory'),
    satelliteFactory           = require('./models/satelliteFactory'),

    MAP_WIDTH          = 20000,
    MAP_HEIGHT         = 20000,

    STARTING_MONEY     = 10000,
    TURRET_COST        = 1000,
    SHIP_COST          = 1000,
    SHEILD_COST        = 5000,
    SATELLITE_COST     = 8000,
    PLANET_HIT_COST    = 500,
    ASTEROID_VALUE     = 300,

    MIN_ASTEROID_RADIUS = 25,
    MAX_ASTEROID_RADIUS = 100,

    MIN_ASTEROID_SPEED  = 1,
    MAX_ASTEROID_SPEED  = 10,

    PLANET_X = 1200,
    PLANET_Y = 1200,

    NUMBER_OF_STARTING_ASTEROIDS_WHITE = 100,
    NUMBER_OF_STARTING_ASTEROIDS_BLUE  = 15, 
    NUMBER_OF_STARTING_ASTEROIDS_RED   = 10,
    

    map = new QuadTree({
      'width' : MAP_WIDTH,
      'height': MAP_HEIGHT
    });

function init () {
  
  var viewport = require('./core/viewport');
  var myViewport = viewport({
    'quadTree': map,
    'rotationOrigin': {
      'x': PLANET_X,
      'y': PLANET_Y
    }
  });

  // The money
  var money = textFactory({
    'information': function () {
      return '$' + this.value;
    },
    'viewport'   : myViewport,
    'color'      : '#94cd4b',
    'static'     : true,
    'x'          : 200,
    'y'          : 20,
    'font'       : '2em Georgia',
    'value'      : STARTING_MONEY
  });

  
  var WHITE_ASTEROID_TYPE = {
      'color': '#fff',
      'hitsToBreak': 1
    },

    BLUE_ASTEROID_TYPE = {
      'hitsToBreak': 3,
      'color': '#00FFFF',
      'speed': 0.3,
      'onImpact': function () {
        money.value = money.value + this.value;
        this.radius = this.radius * 0.1;
        this.width  = this.radius * 2;
        this.height = this.radius * 2;
      },
      'customUpdate': function () {
        this.radius = Math.min(this.radius * 1.01, MAX_ASTEROID_RADIUS);
        this.width  = this.radius * 2;
        this.height = this.radius * 2;
      }
    },

    RED_ASTEROID_TYPE = {
      'color' : '#B22222',
      'speed' : 0.2,
      'breaks': 0,
      'hitsToBreak': 0,
      'onImpact': function () {
        money.value = money.value + this.value;
        var newExplosion = explosionFactory({
          'x': this.x,
          'y': this.y,
          'ignore': this
        });

        this.quadTree.insert(newExplosion);
  
      },
    };

  // The planet
  var planet = planetFactory({
    'x': PLANET_X,
    'y': PLANET_Y,
    'health': 50000,
    'impact': function (object) {
      this.health -= object.mass;
    }
  });

  textFactory({
    'information': function () {
      return 'Planet health: ' + Math.round(planet.health);
    },
    'viewport'   : myViewport,
    'color'      : '#94cd4b',
    'static'     : true,
    'x'          : 400,
    'y'          : 20,
    'font'       : '2em Georgia',
    'value'      : 'Planet health: ' + Math.round(planet.health)
  });
  
  myViewport.x = planet.x;
  myViewport.y = planet.y - 650;
  myViewport.zoomBy(250);


  map.insert(planet);

  generateAsteroids(WHITE_ASTEROID_TYPE, NUMBER_OF_STARTING_ASTEROIDS_WHITE);
  generateAsteroids(BLUE_ASTEROID_TYPE, NUMBER_OF_STARTING_ASTEROIDS_BLUE);
  generateAsteroids(RED_ASTEROID_TYPE, NUMBER_OF_STARTING_ASTEROIDS_RED);

  function generateAsteroids (type, number) {

    for (var i = 0; i < number; i++) {

      var radius = Math.getRandomInt(MIN_ASTEROID_RADIUS, MAX_ASTEROID_RADIUS),
          randX  = Math.getRandomInt(map.x - map.halfWidth,  map.x  + map.halfWidth),
          randY  = Math.getRandomInt(map.y - map.halfHeight, map.y  + map.halfHeight);

      // Prevent asteroids from spawning near the planet.
      while (isIntersectingCircles({'x':randX, 'y':randY, 'radius': radius}, {'x':planet.x, 'y':planet.y, 'radius': planet.radius * 4})) {
        console.log('trying to place asteroid in good location.');
        randX = Math.getRandomInt(map.x - map.halfWidth,  map.x  + map.halfWidth);
        randY = Math.getRandomInt(map.y - map.halfHeight, map.y  + map.halfHeight);
      }
      
      map.insert(asteroidFactory(_.extend({
        'radius'   : radius,
        'quadTree' : map,
        'speed'    : 0.5,
        'x'        : randX,
        'y'        : randY,
        'value'    : ASTEROID_VALUE,
        'onImpact' : addMoneyWhenAsteroidIsDestroyed,
        'velocity' : {
          'x': PLANET_X - randX,
          'y': PLANET_Y - randY
        }
      }, type)));

    }

  }

  // Asteroid count text
  textFactory({
    'information': function () {
      return 'Asteroids: ' + getAsteroidCount();
    },
    'viewport': myViewport,
    'color'   : '#e893ff',
    'static'  : true,
    'x'       : myViewport.width * myViewport.scale - 700,
    'y'       : 20,
    'font'    : '2em Georgia'
  });

  // Turret button
  buttonFactory({
    'img': (function () {
      var img = new Image();
      img.src = 'turretButton.png';
      return img;
    }()),
    'left'       : 365,
    'bottom'       : 15,
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
          'money'      : money,
          'onPlacement': function () {
            turretButton.isBusy = false;
          }
        });

        map.insert(newTurret);
        
      }
    }
  });

  // Ship button
  buttonFactory({
    'img': (function () {
      var img = new Image();
      img.src = 'shipButton.png';
      return img;
    }()),
    'bottom': 15,
    'left': 145,
    'viewport': myViewport,
    'static': true,
    'onClick': function () {

      console.log('create ship AI');

      if (money.value >= SHIP_COST) {

        money.value = money.value - SHIP_COST;
        
        var newShip = shipFactory({
          'angle':{
            'x':0.5,
            'y':0
          },
          'x': planet.x,
          'y': planet.y,
          'quadTree': map,
          'viewport': myViewport,
          'planet': planet,
          'money': money
        });

        map.insert(newShip);

      }
    }
  });

  // Planetary sheild button
  buttonFactory({
    'img': (function () {
      var img = new Image();
      img.src = 'sheildButton.png';
      return img;
    }()),
    'left': 35,
    'bottom': 15,
    'viewport': myViewport,
    'static': true,
    'onClick' : function () {
      
      var sheildButton = this;
      
      if (sheildButton.isBusy) {
        return;
      }

      if (money.value >= SHEILD_COST) {

        money.value = money.value - SHEILD_COST;

        sheildButton.isBusy = true;

        map.insert(sheildFactory({
          'x'            : planet.x,
          'y'            : planet.y,
          'static'       : true,
          'viewport'     : myViewport,
          'quadTree'     : map,
          'maxHealth'    : 5000,
          'currentHealth': 5000,
          'impact': function (object) {
            this.currentHealth -= object.mass;
            if (this.currentHealth < 0) {
              sheildButton.isBusy = false;
              this.off('update');
              this.remove();
            }
          },
        }));        
      }
    }
  });

  // Satellite Button
  buttonFactory({
    'img': (function () {
      var img = new Image();
      img.src = 'satelliteButton.png';
      return img;
    }()),
    'left'       : 255,
    'bottom'       : 15,
    'viewport': myViewport,
    'static'  : true,
    'onClick' : function () {

      var satelliteButton = this;
      
      if (money.value >= SATELLITE_COST) {

        money.value = money.value - SATELLITE_COST;

        satelliteButton.isBusy = true;

        map.insert(satelliteFactory({
          'x': planet.x + planet.radius + 100,
          'y': planet.y + planet.radius + 100,
          'viewport': myViewport,
          'planet': planet,
          'onPlacement': function () {
            satelliteButton.isBusy = false;
          }
        }));

      }
    }
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
    'y'       : 20,
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
    'y'       : 45,
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
          'money'      : money,
          'onPlacement': function () {
            turretButton.isBusy = false;
          }
        });

        map.insert(newTurret);
        
      }
    }
  });

  // Ship button
  buttonFactory({
    'img': (function () {
      var img = new Image();
      img.src = 'shipButton.png';
      return img;
    }()),
    'y': 375,
    'x': 35,
    'viewport': myViewport,
    'static': true,
    'onClick': function () {

      console.log('create ship AI');

      if (money.value >= SHIP_COST) {

        money.value = money.value - SHIP_COST;
        
        var newShip = shipFactory({
          'angle':{
            'x':0.5,
            'y':0
          },
          'x': planet.x,
          'y': planet.y,
          'quadTree': map,
          'viewport': myViewport,
          'planet': planet,
          'money': money
        });

        map.insert(newShip);

      }
    }
  });

  // Planetary sheild button
  buttonFactory({
    'img': (function () {
      var img = new Image();
      img.src = 'sheildButton.png';
      return img;
    }()),
    'x': 35,
    'y': 155,
    'viewport': myViewport,
    'static': true,
    'onClick' : function () {
      
      var sheildButton = this;
      
      if (sheildButton.isBusy) {
        return;
      }

      if (money.value >= SHEILD_COST) {

        money.value = money.value - SHEILD_COST;

        sheildButton.isBusy = true;

        map.insert(sheildFactory({
          'x'            : planet.x,
          'y'            : planet.y,
          'static'       : true,
          'viewport'     : myViewport,
          'quadTree'     : map,
          'maxHealth'    : 5000,
          'currentHealth': 5000,
          'impact': function (object) {
            this.currentHealth -= object.mass;
            if (this.currentHealth < 0) {
              sheildButton.isBusy = false;
              this.off('update');
              this.remove();
            }
          },
        }));        
      }
    }
  });

  // Satellite Button
  buttonFactory({
    'img': (function () {
      var img = new Image();
      img.src = 'satelliteButton.png';
      return img;
    }()),
    'x'       : 35,
    'y'       : 265,
    'viewport': myViewport,
    'static'  : true,
    'onClick' : function () {

      var satelliteButton = this;
      
      if (money.value >= SATELLITE_COST) {

        money.value = money.value - SATELLITE_COST;

        satelliteButton.isBusy = true;

        map.insert(satelliteFactory({
          'x': planet.x + planet.radius + 100,
          'y': planet.y + planet.radius + 100,
          'viewport': myViewport,
          'planet': planet,
          'onPlacement': function () {
            satelliteButton.isBusy = false;
          }
        }));

      }
    }
  });

  function addMoneyWhenAsteroidIsDestroyed () {
    money.value = money.value + this.value;
  }

  clock.start();

  window.clock = clock;


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