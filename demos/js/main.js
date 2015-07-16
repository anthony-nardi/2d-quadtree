'use strict';

var Quadtree = window.Quadtree = require('../../js/quadtree.js');


var map = window.map = new Quadtree();

// var object1 = window.object1 = {'x': 10,  'y': 10,  'height': 10, 'width': 10};
// var object2 = window.object2 = {'x': 200, 'y': 200, 'height': 20, 'width': 20};
// var object3 = window.object3 = {'x': 55,  'y': 150, 'height': 30, 'width': 30};
// var object4 = window.object4 = {'x': 800, 'y': 700, 'height': 40, 'width': 40};
// var object5 = window.object5 = {'x': 660, 'y': 220, 'height': 50, 'width': 50};

// map.insert(object1);
// map.insert(object2);
// map.insert(object3);
// map.insert(object4);
// map.insert(object5);

var lastMouseX,
    lastMouseY,
    lastRect;

window.addEventListener('DOMContentLoaded', init);


function init () {
  initCanvas();
  addButtonEventListeners();
  updateInfo();
}

function drawChildren () {

  var canvas      = document.getElementById('canvas'),
      ctx         = canvas.getContext('2d'),
      allChildren = map.getChildren(),
      item;

  for (var i = 0; i < allChildren.length; i++) {
    item = allChildren[i];
    ctx.strokeStyle = item === lastRect ? '#fff' : '#0cd';
    ctx.strokeRect(item.x, item.y, item.width, item.height);
  }

}

function drawOrphans () {

  var canvas      = document.getElementById('canvas'),
      ctx         = canvas.getContext('2d'),
      allOrphans  = map.getOrphans(),
      item;
  
  for (var i = 0; i < allOrphans.length; i++) {
    item = allOrphans[i];
    ctx.strokeStyle = item === lastRect ? '#fff' : '#da0';
    ctx.strokeRect(item.x, item.y, item.width, item.height);
  }
}

function drawQuadtreeBoundaries (quadTree) {
  
  var canvas = document.getElementById('canvas'),
      ctx    = canvas.getContext('2d'),
      l      = quadTree.children.length;
  
  ctx.strokeStyle = '#cf2';
  ctx.lineWidth   = '4';
  
  ctx.strokeRect(quadTree.x, quadTree.y, quadTree.width, quadTree.height);
  
  if (!quadTree.isLeaf) {
    for (var i = 0; i < l; i++) {
      drawQuadtreeBoundaries(quadTree.children[i]);
    }
  }
}

function drawComparisons () {
  
  var canvas      = document.getElementById('canvas'),
      ctx         = canvas.getContext('2d'),
      comparisons = map.getComparisons(lastRect),
      item;
  
  ctx.strokeStyle = '#66FF66';
  
  for (var i = 0; i < comparisons.length; i++) {
    item = comparisons[i];
    ctx.strokeRect(item.x, item.y, item.width, item.height);
  }

}

function drawCollisions () {

  var canvas      = document.getElementById('canvas'),
      ctx         = canvas.getContext('2d'),
      collisions = map.getCollisions(lastRect),
      item;
  
  ctx.strokeStyle = '#FF0000';
  
  for (var i = 0; i < collisions.length; i++) {
    item = collisions[i];
    ctx.strokeRect(item.x, item.y, item.width, item.height);
  }

}

function clearCanvas () {
  
  var canvas = document.getElementById('canvas'),
      ctx    = canvas.getContext('2d');
  
  ctx.fillStyle = '#000';
  
  ctx.fillRect(0, 0, canvas.width, canvas.height);

} 
            
function removeRectFromQuad (event) {
  
  var x             = event.offsetX,
      y             = event.offsetY,
      clickedPoint  = {'x': x, 'y': y, 'width': 1, 'height': 1},
      collisionList = map.getBruteForceCollisions(clickedPoint);
  for (var i = 0; i < collisionList.length; i++) {
    collisionList[i].parent.remove(collisionList[i]);
  }

  updateCanvas();
  updateInfo();

}

var boundaryButtonState    = true,
    orphansButtonState     = true,
    childrenButtonState    = true,
    comparisonsButtonState = false,
    collisionsButtonState  = false;

function initCanvas () {

  var canvas = document.getElementById('canvas');

  canvas.width  = map.width;
  canvas.height = map.height;

  clearCanvas(canvas);

  updateCanvas();

}

function addButtonEventListeners () {
  
  var boundaryButton    = document.getElementById('boundaries'),
      orphansButton     = document.getElementById('orphans'),
      childrenButton    = document.getElementById('children'),
      comparisonsButton = document.getElementById('comparisons'),
      collisionsButton  = document.getElementById('collisions'),
      clearButton       = document.getElementById('clear'),
      canvas            = document.getElementById('canvas');

  boundaryButton.addEventListener('click', toggleButtonState);
  orphansButton.addEventListener('click', toggleButtonState);
  childrenButton.addEventListener('click', toggleButtonState);
  comparisonsButton.addEventListener('click', toggleButtonState);
  collisionsButton.addEventListener('click', toggleButtonState);
  clearButton.addEventListener('click', clear);

  canvas.addEventListener('contextmenu', removeRectFromQuad);
  canvas.addEventListener('mousedown', startDrag);
  canvas.addEventListener('mouseup', endDrag);

}

function toggleButtonState (event) {
  
  var enabledText = 'Hide',
      disabledText = 'Show',
      newText,
      isEnabled;

  switch (event.target.id) {
  
    case 'boundaries':
      if (boundaryButtonState) {
        boundaryButtonState = false;
        isEnabled           = false;
      } else {
        boundaryButtonState = true;
        isEnabled           = true;
      }
      break;
    case 'children':
      if (childrenButtonState) {
        childrenButtonState = false;
        isEnabled           = false;
      } else {
        childrenButtonState = true;
        isEnabled           = true;
      }
      break;
    case 'orphans':
      if (orphansButtonState) {
        orphansButtonState  = false;
        isEnabled           = false;
      } else {
        orphansButtonState  = true;
        isEnabled           = true;
      }
      break;
    case 'comparisons':
      if (comparisonsButtonState) {
        comparisonsButtonState = false;
        isEnabled              = false;
      } else {
        comparisonsButtonState = true;
        isEnabled              = true;
      }
      break;
    case 'collisions':
      if (collisionsButtonState) {
        collisionsButtonState = false;
        isEnabled             = false;
      } else {
        collisionsButtonState = true;
        isEnabled             = true;
      }
      break;
   }
  
  newText = isEnabled ? enabledText : disabledText;

  event.target.getElementsByTagName('span')[0].innerHTML = newText;

  updateCanvas();
}

function resetButtons () {

  var boundaryButton  = document.getElementById('boundaries'),
      orphansButton     = document.getElementById('orphans'),
      childrenButton    = document.getElementById('children'),
      comparisonsButton = document.getElementById('comparisons'),
      collisionsButton  = document.getElementById('collisions');
  
  boundaryButtonState    = true;
  orphansButtonState     = true;
  childrenButtonState    = true;
  comparisonsButtonState = false;
  collisionsButtonState  = false;

  boundaryButton.getElementsByTagName('span')[0].innerHTML    = 'Hide';
  orphansButton.getElementsByTagName('span')[0].innerHTML     = 'Hide';
  childrenButton.getElementsByTagName('span')[0].innerHTML    = 'Hide';
  comparisonsButton.getElementsByTagName('span')[0].innerHTML = 'Show';
  collisionsButton.getElementsByTagName('span')[0].innerHTML  = 'Show';

}

function updateCanvas () {
  clearCanvas();
  if (boundaryButtonState) {
    drawQuadtreeBoundaries(map);
  }
  if (childrenButtonState) {
    drawChildren();
  }
  if (orphansButtonState) {
    drawOrphans();
  }
  if (comparisonsButtonState) {
    drawComparisons();
  }
  if (collisionsButtonState) {
    drawCollisions();
  }
}

function updateInfo () {
  
  var numberOfQuadTrees = map.getQuadtreeCount(),
      numberOfChildren  = map.getChildCount(),
      numberOfOrphans   = map.getOrphanCount();

  document.getElementById('info_quadtrees').innerHTML = numberOfQuadTrees;
  document.getElementById('info_orphans').innerHTML   = numberOfOrphans;
  document.getElementById('info_children').innerHTML  = numberOfChildren;

}

function updateCollisionInfo () {
  
  if (lastRect) {
    
    var bruteForceCollisionsElement  = document.getElementById('info_brute_force_collisions'),
        bruteForceComparisonsElement = document.getElementById('info_brute_force_comparisons'),
        bruteForceTimeElement        = document.getElementById('info_brute_force_time'),
        optimizedCollisionsElement   = document.getElementById('info_optimized_collisions'),
        optimizedComparisonsElement  = document.getElementById('info_optimized_comparisons'),
        optimizedTimeElement         = document.getElementById('info_optimized_time'),
        bruteForceComparisonCount    = map.getOrphanAndChildCount(),
        optimizedComparisons         = map.getComparisons(lastRect),
        optimizedComparisonCount     = optimizedComparisons.length,
        bruteForceStartTime,
        bruteForceEndTime,
        optimizedStartTime,
        optimizedEndTime,
        optimizedCollisions,
        bruteForceCollisions;

    bruteForceStartTime  = Date.now();
    bruteForceCollisions = map.getBruteForceCollisions(lastRect);
    bruteForceEndTime    = Date.now();  

    optimizedStartTime   = Date.now();
    optimizedCollisions  = map.getCollisions(lastRect);
    optimizedEndTime     = Date.now();

    bruteForceCollisionsElement.innerHTML  = 'Collisions:   ' + bruteForceCollisions.length;  // because this doesn't filter rect doing the collision  
    bruteForceComparisonsElement.innerHTML = 'Comparisions: ' + (bruteForceComparisonCount - 1);
    bruteForceTimeElement.innerHTML        = 'Time:         ' + (bruteForceEndTime - bruteForceStartTime) + 'ms';

    optimizedCollisionsElement.innerHTML  = 'Collisions:   ' + optimizedCollisions.length;  
    optimizedComparisonsElement.innerHTML = 'Comparisions: ' + optimizedComparisonCount;
    optimizedTimeElement.innerHTML        = 'Time:         ' + (optimizedEndTime - optimizedStartTime) + 'ms';

  }

}

function startDrag (event) {
  if (event.button !== 0) {
    return;
  }
  var canvas = document.getElementById('canvas');
  lastMouseX = event.offsetX;
  lastMouseY = event.offsetY;
  canvas.addEventListener('mousemove', continueDrag);
  lastRect = {
    'x'     : lastMouseX,
    'y'     : lastMouseY,
    'width' : 0,
    'height': 0
  };
  map.insert(lastRect);
  event.preventDefault();
  updateCanvas();
}

function endDrag () {
  if (event.button !== 0) {
    return;
  }
  var canvas = document.getElementById('canvas');
  canvas.removeEventListener('mousemove', continueDrag);
  if (!lastRect.width || !lastRect.height) {
    map.remove(lastRect);
    return;
  }
  map.remove(lastRect);
  map.insert(lastRect);
  updateCanvas();
  updateInfo();
  updateCollisionInfo();
  window.lastRect = lastRect;
}

function continueDrag (event) {
  lastRect.width  = Math.abs(event.offsetX - lastMouseX) * 2;
  lastRect.height = Math.abs(event.offsetY - lastMouseY) * 2;
  lastRect.x = lastMouseX - (lastRect.width  / 2);
  lastRect.y = lastMouseY - (lastRect.height / 2);
  if (!lastRect.width || !lastRect.height) {
    return;
  }
  map.remove(lastRect);
  map.insert(lastRect);
  updateCanvas();
  updateInfo();
}

function clearCollisionInfo () {
 
  var bruteForceCollisionsElement  = document.getElementById('info_brute_force_collisions'),
      bruteForceComparisonsElement = document.getElementById('info_brute_force_comparisons'),
      bruteForceTimeElement        = document.getElementById('info_brute_force_time'),
      optimizedCollisionsElement   = document.getElementById('info_optimized_collisions'),
      optimizedComparisonsElement  = document.getElementById('info_optimized_comparisons'),
      optimizedTimeElement         = document.getElementById('info_optimized_time');

  bruteForceCollisionsElement.innerHTML  = 'Collisions:   0';
  bruteForceComparisonsElement.innerHTML = 'Comparisions: 0';
  bruteForceTimeElement.innerHTML        = 'Time:         0';

  optimizedCollisionsElement.innerHTML  = 'Collisions:   0';
  optimizedComparisonsElement.innerHTML = 'Comparisions: 0';
  optimizedTimeElement.innerHTML        = 'Time:         0';
}

function clear () {
  map = new Quadtree();
  updateCanvas();
  updateInfo();
  resetButtons();
  clearCollisionInfo();
}

window.updateCanvas = updateCanvas;