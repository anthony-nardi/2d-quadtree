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
    sheildFactory              = require('./models/sheildFactory'),
    satelliteFactory           = require('./models/satelliteFactory'),

    MAP_WIDTH          = 20000,
    MAP_HEIGHT         = 20000,

    STARTING_MONEY     = 10000,
    TURRET_COST        = 1000,
    SHIP_COST          = 3000,
    SHEILD_COST        = 5000,
    SATELLITE_COST     = 8000,
    PLANET_HIT_COST    = 500,
    ASTEROID_VALUE     = 300,

    MIN_ASTEROID_RADIUS = 25,
    MAX_ASTEROID_RADIUS = 100,

    MIN_ASTEROID_SPEED  = 1,
    MAX_ASTEROID_SPEED  = 15,

    SHIP_RESPAWN_TIMER = 3000,

    NUMBER_OF_STARTING_ASTEROIDS = 200,

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

  function addStarsToBackground () {

    var NUMBER_OF_SMALL_STARS  = 400,
        NUMBER_OF_MEDIUM_STARS = 200,
        NUMBER_OF_LARGE_STARS  = 100,
        SMALL_STAR_SIZE        = 10,
        MEDIUM_STAR_SIZE       = 20,
        LARGE_STAR_SIZE        = 30;     

    for (var i = 0; i < NUMBER_OF_SMALL_STARS; i++) {
      
      var randX  = Math.getRandomInt(map.x - map.halfWidth  / 2,  map.x  + map.halfWidth / 2),
          randY  = Math.getRandomInt(map.y - map.halfHeight / 2, map.y  + map.halfHeight / 2);
      
      while (isIntersectingCircles({'x':randX, 'y':randY, 'radius': SMALL_STAR_SIZE}, {'x':planet.x, 'y':planet.y, 'radius': planet.radius * 1.25})) {
        randX = Math.getRandomInt(map.x - map.halfWidth,  map.x  + map.halfWidth);
        randY = Math.getRandomInt(map.y - map.halfHeight, map.y  + map.halfHeight);
      }

      myViewport.addObjectToAlwaysRender({
        'x': randX,
        'y': randY,
        'lastViewportX': myViewport.x,
        'lastViewportY': myViewport.y,
        'width': SMALL_STAR_SIZE,
        'height': SMALL_STAR_SIZE,
        'render': function (ctx, viewport) {
          var scale = viewport.scale;
          ctx.fillStyle = 'white';
          this.x += (this.lastViewportX - myViewport.x) * scale * 0.1;
          this.y += (this.lastViewportY - myViewport.y) * scale * 0.1;
          this.lastViewportX = myViewport.x;
          this.lastViewportY = myViewport.y;
          ctx.fillRect(this.x * scale, this.y * scale, this.width * scale, this.height * scale);
        }
      }); 
    }
    for (var i = 0; i < NUMBER_OF_MEDIUM_STARS; i++) {
      
      var randX  = Math.getRandomInt(map.x - map.halfWidth  / 2,  map.x  + map.halfWidth / 2),
          randY  = Math.getRandomInt(map.y - map.halfHeight / 2, map.y  + map.halfHeight / 2);

      myViewport.addObjectToAlwaysRender({
        'x': randX,
        'y': randY,
        'width': MEDIUM_STAR_SIZE,
        'height': MEDIUM_STAR_SIZE,
        'lastViewportX': myViewport.x,
        'lastViewportY': myViewport.y,
        'render': function (ctx, viewport) {
          
          var scale = viewport.scale;
          
          this.x += (this.lastViewportX - myViewport.x) * scale * 0.3;
          this.y += (this.lastViewportY - myViewport.y) * scale * 0.3;
          this.lastViewportX = myViewport.x;
          this.lastViewportY = myViewport.y;

          ctx.fillStyle = 'white';
          
          ctx.fillRect(this.x * scale, this.y * scale, this.width * scale, this.height * scale);
        }
      }); 
    }
    for (var i = 0; i < NUMBER_OF_LARGE_STARS; i++) {
      
      var randX  = Math.getRandomInt(map.x - map.halfWidth  / 2,  map.x  + map.halfWidth / 2),
          randY  = Math.getRandomInt(map.y - map.halfHeight / 2, map.y  + map.halfHeight / 2);

      myViewport.addObjectToAlwaysRender({
        'x': randX,
        'y': randY,
        'width': LARGE_STAR_SIZE,
        'height': LARGE_STAR_SIZE,
        'lastViewportX': myViewport.x,
        'lastViewportY': myViewport.y,
        'render': function (ctx, viewport) {
          var scale = viewport.scale;
          this.x += (this.lastViewportX - myViewport.x) * scale * 0.6;
          this.y += (this.lastViewportY - myViewport.y) * scale * 0.6;
          this.lastViewportX = myViewport.x;
          this.lastViewportY = myViewport.y;
          ctx.fillStyle = 'white';
          ctx.fillRect(this.x * scale, this.y * scale, this.width * scale, this.height * scale);
        }
      }); 
    }
  }

  myViewport.addObjectToAlwaysRender({
    'x': 0,
    'y': 0,
    'render': function (ctx, viewport) {
      drawQuadtreeBoundaries(map, ctx, viewport);
    }
  });

  function drawQuadtreeBoundaries (quadTree, ctx, viewport) {
  
    var l      = quadTree.children.length;
    
    ctx.strokeStyle = '#cf2';
    ctx.lineWidth   = '4';

    ctx.strokeRect(
      (quadTree.x - quadTree.halfWidth)  * viewport.scale, 
      (quadTree.y - quadTree.halfHeight) * viewport.scale, 
      quadTree.width  * viewport.scale, 
      quadTree.height * viewport.scale
    );

    if (!quadTree.isLeaf) {
      for (var i = 0; i < l; i++) {
        drawQuadtreeBoundaries(quadTree.children[i], ctx, viewport);
      }
    }
  }

  // The planet
  var planet = planetFactory({
    'x': 1200,
    'y': 1200,
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
    'x': planet.x,
    'y': planet.y,
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

  // Planetary sheild button
  buttonFactory({
    'img': (function () {
      var img = new Image();
      img.src = 'sheildButton.png';
      return img;
    }()),
    'x': 35,
    'y': 125,
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
    'y'       : 205,
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

  function createNewPlayerShip () {
 
    setTimeout(function () {
      
      if (money.value >= SHIP_COST) {

        money.value = money.value - SHIP_COST;
        
        var myShip = shipFactory({
          'angle':{
            'x':0.5,
            'y':0
          },
          'x': planet.x,
          'y': planet.y,
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

  myViewport.zoomBy(4000);

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

  addStarsToBackground();

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