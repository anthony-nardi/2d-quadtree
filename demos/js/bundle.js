(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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
    ctx.strokeRect(item.x + map.halfWidth - item.width / 2, item.y + map.halfHeight - item.height / 2, item.width, item.height);
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
    ctx.strokeRect(item.x + map.halfWidth - item.width / 2, item.y + map.halfHeight - item.height / 2, item.width, item.height);
  }
}

function drawQuadtreeBoundaries (quadTree) {
  
  var canvas = document.getElementById('canvas'),
      ctx    = canvas.getContext('2d'),
      l      = quadTree.children.length;
  
  ctx.strokeStyle = '#cf2';
  ctx.lineWidth   = '4';

  ctx.strokeRect(quadTree.x + map.halfWidth - quadTree.halfWidth, quadTree.y + map.halfHeight - quadTree.halfHeight, quadTree.width, quadTree.height);

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
    ctx.strokeRect(item.x + map.halfWidth - item.width / 2, item.y + map.halfHeight - item.height / 2, item.width, item.height);
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
    ctx.strokeRect(item.x + map.halfWidth - item.width / 2, item.y + map.halfHeight - item.height / 2, item.width, item.height);
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
      clickedPoint  = {'x': x - map.halfWidth, 'y': y - map.halfHeight, 'width': 1, 'height': 1},
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
  lastMouseX = event.offsetX - map.halfWidth;
  lastMouseY = event.offsetY - map.halfHeight;
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
  lastRect.width  = Math.abs(event.offsetX - map.halfWidth  - lastMouseX) * 2;
  lastRect.height = Math.abs(event.offsetY - map.halfHeight - lastMouseY) * 2;
  lastRect.x = lastMouseX;
  lastRect.y = lastMouseY;
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
},{"../../js/quadtree.js":2}],2:[function(require,module,exports){
'use strict';

var _ = window._ = require('underscore');

var DEFAULT_MAX_CHILDREN = 4,
    DEFAULT_DEPTH        = 4,
    DEFAULT_WIDTH        = 1000,
    DEFAULT_HEIGHT       = 1000,
    NORTH_WEST           = 1,
    NORTH_EAST           = 2,
    SOUTH_WEST           = 4,
    SOUTH_EAST           = 8;           

var rectPrototype = {

  'move': function (x, y) {
  
    this.x = x;
    this.y = y;
    
    if (this.parent.orphans.indexOf(this) !== -1 || !isWithinBounds(this.parent, this)) {
      this.parent.remove(this);
      this.parent.insert(this);
    }

  },

  'getCollisions': function () {
    return this.parent.getCollisions(this);
  },

  'remove': function () {
    this.parent.remove(this);
  }

};

function Quadtree (options) {
  
  options = options || {};

	this.maxChildren = options.maxChildren || DEFAULT_MAX_CHILDREN;
	this.depth       = options.depth       || DEFAULT_DEPTH;
  this.height      = options.height      || DEFAULT_HEIGHT;
  this.width       = options.width       || DEFAULT_WIDTH;
  this.halfHeight  = this.height / 2;
  this.halfWidth   = this.width  / 2;
  this.x           = options.x || 0;
  this.y           = options.y || 0;
  this.parent      = options.parent || null;
  this.children    = [];
  this.orphans     = [];
  this.isLeaf      = true;
  this.quadrant    = options.quadrant || (NORTH_WEST + NORTH_EAST + SOUTH_WEST + SOUTH_EAST);
}

/**
 * 
 * [insert Inserts an object into the quadTree]
 * @param  {Object} object [An arbitrary object with rectangle properties]
 * @return {[type]}        [description]
 */
Quadtree.prototype.insert = function (object) {

  var numberOfChildren = this.children.length;
  
  if (!hasRectProps(object)) {
    throw 'Inserting an object into the Quadtree requires a height, width, x, and y property'; 
  }
 
  if (!object.move) {
    _.extend(object, rectPrototype);
  }

  if (!isWithinBounds(this, object)) {
    if (this.parent) {
      this.parent.insert(object);
      return;
    } else {
      forceObjectWithinBounds(object, this);
      // console.log('Object is outside the bounds this Quadtree');      
    }
  }

  object.parent   = this;
  object.quadrant = undefined;

  // This quadTree does not contain quadTrees
  if (this.isLeaf) {
    
    this.children.push(object);
    setQuadrant(object, this);

    if (this.children.length > this.maxChildren && this.depth) {
      // console.log('Quadtree must divide because the number of children exceeds ' + this.maxChildren);
      this.divide();
      return;
    }

  
  // This quadTree contains quadTrees
  // We should check if the object we are inserting can be completely contained within
  // one of these quadTrees.  If it can't, it must be an orphan.
  } else {

    for (var i = 0; i < numberOfChildren; i++) {
      if (isWithinBounds(this.children[i], object)) {
        this.children[i].insert(object);
        // console.log('Object fits completely within a child Quadtree.');
        return;
      }
    }

    // Object does not fit within any of the sub-quadTrees.  It's an orphan.

    // console.log('Object is an orphan of %o', this);

    setQuadrant(object, this);
    this.orphans.push(object);

  }    

};

/**
 * [remove removes the object  and collapses the quadTree]
 * @param  {Object} object [Item that was inserted into the quadTree]
 * @return {[type]}        [description]
 */
Quadtree.prototype.remove = function (object) {

  var parent    = object.parent,
      children  = parent.children,
      orphans   = parent.orphans,
      newParent = parent;

  if (_.contains(children, object)) {
    children.splice(children.indexOf(object), 1);
  } else if (_.contains(orphans, object)) {
    orphans.splice(orphans.indexOf(object), 1);
  } else {
    debugger;
    throw 'Object not found in quadTree when attempting to remove';
  }
  while (newParent.parent) {
    newParent = newParent.parent;
  }
  object.parent = newParent;
  parent.collapse();
};

/**
 * [divide partitions the quadTree into 4 equal sized quadTrees.
 *  It also re-inserts all of the children that the leaf contained.
 * ]
 * @return {[type]} [description]
 */
Quadtree.prototype.divide = function () {

  var children      = this.children,
      quarterWidth  = this.width  / 4,
      quarterHeight = this.height / 4,
      options       = {
                        'depth' : this.depth - 1,
                        'width' : this.width  / 2,
                        'height': this.height / 2,
                        'parent': this
                      };

  this.isLeaf = false;

  this.children = [
    new Quadtree(_.extend(options, {
      'x'       : this.x - quarterWidth,
      'y'       : this.y - quarterHeight,
      'quadrant': NORTH_WEST
    })),
    new Quadtree(_.extend(options, {
      'x'       : this.x + quarterWidth,
      'y'       : this.y - quarterHeight,
      'quadrant': NORTH_EAST
    })),
    new Quadtree(_.extend(options, {
      'x'       : this.x - quarterWidth,
      'y'       : this.y + quarterHeight,
      'quadrant': SOUTH_WEST
    })),
    new Quadtree(_.extend(options, {
      'x'       : this.x + quarterWidth,
      'y'       : this.y + quarterHeight,
      'quadrant': SOUTH_EAST
    }))
  ];

  for (var i = 0, l = children.length; i < l; i++) {
    this.insert(children[i]);
  }

    
};

/**
 * [collapse Collapses the quadTree]
 * @return {[type]} [description]
 */
Quadtree.prototype.collapse = function () {

  if (this.parent) {
    if (this !== this.parent.children[0] && this !== this.parent.children[1] && this !== this.parent.children[2] && this !== this.parent.children[3]) {
      debugger;
    }
  }
  
  if (this.parent && this.parent.canCollapse()) {
    this.parent.collapse();
    return; 
  }

  if (this.canCollapse() && !this.isLeaf) {

    var allChildrenAndOrphans = this.getOrphansAndChildren();

    this.children = [];
    this.orphans  = [];
    this.isLeaf   = true;

    for (var i = 0; i < allChildrenAndOrphans.length; i++) {
      this.insert(allChildrenAndOrphans[i]);
    }  

  }

};

Quadtree.prototype.canCollapse = function () {
  return this.getOrphanAndChildCount() <= this.maxChildren;
}

/**
 * [getOrphanCount returns the number of orphans in the quadTree]
 * @return {Array} [number of orphans in the quadTree]
 */
Quadtree.prototype.getOrphanCount = function () {
  
  var numberOfOrphans  = this.orphans.length,
      numberOfChildren = this.children.length, 
      count            = numberOfOrphans;

  if (this.isLeaf) {
    if (count !== 0) {
      throw 'Why does this leaf have orphans?!';
    }
    return count; // should be 0.
  } else {
    for (var i = 0; i < numberOfChildren; i++) {
      count += this.children[i].getOrphanCount();
    }
  }

  return count;

};

/**
 * [getChildCount returns the number of children in the quadTree]
 * @return {Integer} [number of children in the quadTree]
 */
Quadtree.prototype.getChildCount = function () {

  var count            = 0,
      numberOfChildren = this.children.length;

  if (!this.isLeaf) {
    for (var i = 0; i < numberOfChildren; i++) {
      count += this.children[i].getChildCount();
    }
  } else {
    count += numberOfChildren;
  }

  return count;

};

Quadtree.prototype.getOrphanAndChildCount = function () {
  return this.getOrphanCount() + this.getChildCount();
};

/**
 * [getOrphans return all the orphans of the quadTree]
 * @return {Array} [all the orphans of the quadTree]
 */
Quadtree.prototype.getOrphans = function () {

  var orphans = [];

  if (!this.isLeaf) {
    
    orphans = this.orphans;

    for (var i = 0; i < this.children.length; i++) {
      orphans = orphans.concat(this.children[i].getOrphans());
    }

  }

  return orphans;

};

/**
 * [getChildren returns an array of all the children of the quadTree]
 * @return {Array} [all the children of the quadTree]
 */
Quadtree.prototype.getChildren = function () {
  
  var children = [];

  if (this.isLeaf) {
    return this.children;
  } else {
    for (var i = 0; i < this.children.length; i++) {
      children = children.concat(this.children[i].getChildren());
    }
  }

  return children;
};

/**
 * [getOrphansAndChildren returns an array of all the children and orphans of the quadTree]
 * @return {Array} [all the children and orphans of the quadTree]
 */
Quadtree.prototype.getOrphansAndChildren = function () {
  return this.getChildren().concat(this.getOrphans());
};

/**
 * [getQuadtreeCount returns the number of divisions within the quadtree.]
 * @return {Integer} [The number of divisions within the quadtree.]
 */
Quadtree.prototype.getQuadtreeCount = function () {
  
  var count = this.children.length;
  
  if (this.isLeaf) {
    return 0;
  }

  for (var i = 0; i < this.children.length; i++) {
    count += this.children[i].getQuadtreeCount();
  }

  return count;

};

Quadtree.prototype.getEntireQuadtreesOrphansAndChildren = function () {
  
  var originalParent = this;

  while (originalParent.parent) {
    originalParent = originalParent.parent;
  }

  return originalParent.getOrphansAndChildren();

}

Quadtree.prototype.getParentOrphanComparisons = function () {
  
  var comparisonList  = [],
      orphans         = this.parent && this.parent.orphans;

  if (!orphans) {
    return comparisonList;
  }

  for (var i = 0; i < orphans.length; i++) {
    if ((orphans[i].quadrant & this.quadrant)) {
      comparisonList.push(orphans[i]);
    }
  }

  return comparisonList.concat(this.parent.getParentOrphanComparisons());
};

Quadtree.prototype.getCollisions = function (rect) {
  
  if (!hasRectProps(rect)) {
    throw 'Collsion must be a rect';
  }

  return getCollisions(this.getComparisons(rect), rect);

};

// This might be an area to optimized.  A rectangle that is an orphans of the parent-most quadtree
// that overlaps all quadrants will be the same as a brute force collision detector.
Quadtree.prototype.getOrphansAndChildrenInQuadrants = function (rect) {
  
  var orphansAndChildren = [],
      quadrant           = rect.quadrant;

  if (quadrant & NORTH_WEST) {
    orphansAndChildren = orphansAndChildren.concat(this.children[0].getOrphansAndChildren());
  }
  
  if (quadrant & NORTH_EAST) {
    orphansAndChildren = orphansAndChildren.concat(this.children[1].getOrphansAndChildren());
  }

  if (quadrant & SOUTH_WEST) {
    orphansAndChildren = orphansAndChildren.concat(this.children[2].getOrphansAndChildren());
  }

  if (quadrant & SOUTH_EAST) {
    orphansAndChildren = orphansAndChildren.concat(this.children[3].getOrphansAndChildren());
  }

  return orphansAndChildren;

};

Quadtree.prototype.getComparisons = function (rect) {

  if (!hasRectProps(rect)) {
    throw 'Collsion must be a rect';
  }

  if (!rect.quadrant) {
    throw 'Rect does not have a quadrant property';
  }

  var comparisonList          = rect.parent.isLeaf ? rect.parent.getChildren() : rect.parent.getOrphansAndChildrenInQuadrants(rect),
      directOrphans           = rect.parent.orphans,
      parentOrphanComparisons = rect.parent.getParentOrphanComparisons(rect); 

  for (var i = 0; i < directOrphans.length; i++) {
    if ((directOrphans[i].quadrant & rect.quadrant)) {
      comparisonList.push(directOrphans[i]);
    }
  }

  comparisonList = comparisonList.concat(parentOrphanComparisons);

  if (_.contains(comparisonList, rect)) {
    comparisonList.splice(comparisonList.indexOf(rect), 1);    
  }

  return comparisonList;

};

Quadtree.prototype.getBruteForceCollisions = function (rect) {
  
  if (!hasRectProps(rect)) {
    throw 'Collsion must be a rect';
  }

  var comparisonList,
      currentQuadTree = this;

  while (currentQuadTree.parent) {
    currentQuadTree = currentQuadTree.parent;
  }

  comparisonList = currentQuadTree.getOrphansAndChildren();

  if (_.contains(comparisonList, rect)) {
    comparisonList.splice(comparisonList.indexOf(rect), 1);    
  }

  return getCollisions(comparisonList, rect);

};

// Helper functions

/**
 * [setQuadrant sets the overlapping quadrants (quadtrees) given an object]
 * @param {Object} object   [A rectangle that is inserted in the quadtree]
 * @param {Object} quadtree [A quadtree]
 */
function setQuadrant (object, quadtree) {

  if (quadtree.isLeaf) {

    if (quadtree.parent) {
      object.quadrant = (isIntersecting(quadtree.parent.children[0], object) * NORTH_WEST) +
                        (isIntersecting(quadtree.parent.children[1], object) * NORTH_EAST) +
                        (isIntersecting(quadtree.parent.children[2], object) * SOUTH_WEST) +
                        (isIntersecting(quadtree.parent.children[3], object) * SOUTH_EAST);      
    } else {
      object.quadrant = 15;
    }

  } else {

    object.quadrant = (isIntersecting(quadtree.children[0], object) * NORTH_WEST) +
                      (isIntersecting(quadtree.children[1], object) * NORTH_EAST) +
                      (isIntersecting(quadtree.children[2], object) * SOUTH_WEST) +
                      (isIntersecting(quadtree.children[3], object) * SOUTH_EAST);
  
  }
}

/**
 * [hasRectProps determines if the object has the necessary properties to be considered a rectangle]
 * @param  {Object}  object [The object questioned for rect props]
 * @return {Boolean}        [True if it is a rectangle]
 */
function hasRectProps (object) {
  return typeof object.width !== 'undefined' && object.height !== 'undefined' && object.x !== 'undefined' && object.y !== 'undefined';
}

/**
 * [getBounds returns the bounds of a rectangle]
 * @param  {Object} r [x, y, width, height]
 * @return {Object}   [left, right, top, bottom]
 */
function getBounds (r) {
  return {
    'left'  : r.x - r.width  / 2,
    'right' : r.x + r.width  / 2,
    'top'   : r.y - r.height / 2,
    'bottom': r.y + r.height / 2
  };
}

/**
 * [isWithinBounds retuns true if rect2 is completely within rect1]
 * @param  {Object}  r1 [x, y, width, height]
 * @param  {Object}  r2 [x, y, width, height]
 * @return {Boolean}    [true if rect2 is completely within rect1]
 */
function isWithinBounds (r1, r2) {

  var r1Bounds = getBounds(r1),
      r2Bounds = getBounds(r2);
      
  return (r2Bounds.left   >= r1Bounds.left  &&
          r2Bounds.right  <= r1Bounds.right &&
          r2Bounds.top    >= r1Bounds.top   &&
          r2Bounds.bottom <= r1Bounds.bottom);
}

/**
 * [isIntersecting returns true if two rectangles intersect]
 * @param  {Object}  r1 [rectangle]
 * @param  {Object}  r2 [rectangle]
 * @return {Boolean}    [True if two rectangles isIntersecting]
 * @diagram
 *  
 *   * * * * * *
 *   *   r2    *
 *   *       * * * *
 *   * * * * * *   *
 *           *  r1 *
 *           * * * *
 *
 *  * * * * * * 
 *  *    r2   *
 *  *         *   * * * *
 *  * * * * * *   *  r1 *
 *                *     *
 *                * * * * 
 */
function isIntersecting (r1, r2) {

  var r1Bounds = getBounds(r1),
      r2Bounds = getBounds(r2);
      
  return (r1Bounds.left   < r2Bounds.right  &&
          r1Bounds.right  > r2Bounds.left   &&
          r1Bounds.top    < r2Bounds.bottom &&
          r1Bounds.bottom > r2Bounds.top);

}

function getCollisions (comparisonList, rect) {

  var collisionList = [];
  
  for (var i = 0; i < comparisonList.length; i++) {
    if (isIntersecting(comparisonList[i], rect)) {
      collisionList.push(comparisonList[i]);
    }
  }

  return collisionList;

}

function forceObjectWithinBounds (object, rect) {

  var objectBounds    = getBounds(object),
      containerBounds = getBounds(rect),
      isTooFarLeft    = objectBounds.left   < containerBounds.left,
      isTooFarRight   = objectBounds.left   > containerBounds.right,
      isTooFarAbove   = objectBounds.top    < containerBounds.top,
      isTooFarBelow   = objectBounds.top    > containerBounds.bottom; 

  if (isTooFarLeft) {
    while (object.x < containerBounds.left) {
      object.x = containerBounds.right + object.x + rect.halfWidth;
    }
  }

  if (isTooFarRight) {
    while (object.x > containerBounds.right) {
      object.x = containerBounds.left + object.x - rect.halfWidth;
    }
  }

  if (isTooFarAbove) {
    while (object.y < containerBounds.top) {
      object.y = containerBounds.bottom + object.y + rect.halfHeight;
    }
  }
  
  if (isTooFarBelow) {
    while (object.y > containerBounds.bottom) {
      object.y = containerBounds.top + object.y - rect.halfHeight;
    }
  }  

}

module.exports = Quadtree;
},{"underscore":3}],3:[function(require,module,exports){
//     Underscore.js 1.8.3
//     http://underscorejs.org
//     (c) 2009-2015 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
//     Underscore may be freely distributed under the MIT license.

(function() {

  // Baseline setup
  // --------------

  // Establish the root object, `window` in the browser, or `exports` on the server.
  var root = this;

  // Save the previous value of the `_` variable.
  var previousUnderscore = root._;

  // Save bytes in the minified (but not gzipped) version:
  var ArrayProto = Array.prototype, ObjProto = Object.prototype, FuncProto = Function.prototype;

  // Create quick reference variables for speed access to core prototypes.
  var
    push             = ArrayProto.push,
    slice            = ArrayProto.slice,
    toString         = ObjProto.toString,
    hasOwnProperty   = ObjProto.hasOwnProperty;

  // All **ECMAScript 5** native function implementations that we hope to use
  // are declared here.
  var
    nativeIsArray      = Array.isArray,
    nativeKeys         = Object.keys,
    nativeBind         = FuncProto.bind,
    nativeCreate       = Object.create;

  // Naked function reference for surrogate-prototype-swapping.
  var Ctor = function(){};

  // Create a safe reference to the Underscore object for use below.
  var _ = function(obj) {
    if (obj instanceof _) return obj;
    if (!(this instanceof _)) return new _(obj);
    this._wrapped = obj;
  };

  // Export the Underscore object for **Node.js**, with
  // backwards-compatibility for the old `require()` API. If we're in
  // the browser, add `_` as a global object.
  if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
      exports = module.exports = _;
    }
    exports._ = _;
  } else {
    root._ = _;
  }

  // Current version.
  _.VERSION = '1.8.3';

  // Internal function that returns an efficient (for current engines) version
  // of the passed-in callback, to be repeatedly applied in other Underscore
  // functions.
  var optimizeCb = function(func, context, argCount) {
    if (context === void 0) return func;
    switch (argCount == null ? 3 : argCount) {
      case 1: return function(value) {
        return func.call(context, value);
      };
      case 2: return function(value, other) {
        return func.call(context, value, other);
      };
      case 3: return function(value, index, collection) {
        return func.call(context, value, index, collection);
      };
      case 4: return function(accumulator, value, index, collection) {
        return func.call(context, accumulator, value, index, collection);
      };
    }
    return function() {
      return func.apply(context, arguments);
    };
  };

  // A mostly-internal function to generate callbacks that can be applied
  // to each element in a collection, returning the desired result — either
  // identity, an arbitrary callback, a property matcher, or a property accessor.
  var cb = function(value, context, argCount) {
    if (value == null) return _.identity;
    if (_.isFunction(value)) return optimizeCb(value, context, argCount);
    if (_.isObject(value)) return _.matcher(value);
    return _.property(value);
  };
  _.iteratee = function(value, context) {
    return cb(value, context, Infinity);
  };

  // An internal function for creating assigner functions.
  var createAssigner = function(keysFunc, undefinedOnly) {
    return function(obj) {
      var length = arguments.length;
      if (length < 2 || obj == null) return obj;
      for (var index = 1; index < length; index++) {
        var source = arguments[index],
            keys = keysFunc(source),
            l = keys.length;
        for (var i = 0; i < l; i++) {
          var key = keys[i];
          if (!undefinedOnly || obj[key] === void 0) obj[key] = source[key];
        }
      }
      return obj;
    };
  };

  // An internal function for creating a new object that inherits from another.
  var baseCreate = function(prototype) {
    if (!_.isObject(prototype)) return {};
    if (nativeCreate) return nativeCreate(prototype);
    Ctor.prototype = prototype;
    var result = new Ctor;
    Ctor.prototype = null;
    return result;
  };

  var property = function(key) {
    return function(obj) {
      return obj == null ? void 0 : obj[key];
    };
  };

  // Helper for collection methods to determine whether a collection
  // should be iterated as an array or as an object
  // Related: http://people.mozilla.org/~jorendorff/es6-draft.html#sec-tolength
  // Avoids a very nasty iOS 8 JIT bug on ARM-64. #2094
  var MAX_ARRAY_INDEX = Math.pow(2, 53) - 1;
  var getLength = property('length');
  var isArrayLike = function(collection) {
    var length = getLength(collection);
    return typeof length == 'number' && length >= 0 && length <= MAX_ARRAY_INDEX;
  };

  // Collection Functions
  // --------------------

  // The cornerstone, an `each` implementation, aka `forEach`.
  // Handles raw objects in addition to array-likes. Treats all
  // sparse array-likes as if they were dense.
  _.each = _.forEach = function(obj, iteratee, context) {
    iteratee = optimizeCb(iteratee, context);
    var i, length;
    if (isArrayLike(obj)) {
      for (i = 0, length = obj.length; i < length; i++) {
        iteratee(obj[i], i, obj);
      }
    } else {
      var keys = _.keys(obj);
      for (i = 0, length = keys.length; i < length; i++) {
        iteratee(obj[keys[i]], keys[i], obj);
      }
    }
    return obj;
  };

  // Return the results of applying the iteratee to each element.
  _.map = _.collect = function(obj, iteratee, context) {
    iteratee = cb(iteratee, context);
    var keys = !isArrayLike(obj) && _.keys(obj),
        length = (keys || obj).length,
        results = Array(length);
    for (var index = 0; index < length; index++) {
      var currentKey = keys ? keys[index] : index;
      results[index] = iteratee(obj[currentKey], currentKey, obj);
    }
    return results;
  };

  // Create a reducing function iterating left or right.
  function createReduce(dir) {
    // Optimized iterator function as using arguments.length
    // in the main function will deoptimize the, see #1991.
    function iterator(obj, iteratee, memo, keys, index, length) {
      for (; index >= 0 && index < length; index += dir) {
        var currentKey = keys ? keys[index] : index;
        memo = iteratee(memo, obj[currentKey], currentKey, obj);
      }
      return memo;
    }

    return function(obj, iteratee, memo, context) {
      iteratee = optimizeCb(iteratee, context, 4);
      var keys = !isArrayLike(obj) && _.keys(obj),
          length = (keys || obj).length,
          index = dir > 0 ? 0 : length - 1;
      // Determine the initial value if none is provided.
      if (arguments.length < 3) {
        memo = obj[keys ? keys[index] : index];
        index += dir;
      }
      return iterator(obj, iteratee, memo, keys, index, length);
    };
  }

  // **Reduce** builds up a single result from a list of values, aka `inject`,
  // or `foldl`.
  _.reduce = _.foldl = _.inject = createReduce(1);

  // The right-associative version of reduce, also known as `foldr`.
  _.reduceRight = _.foldr = createReduce(-1);

  // Return the first value which passes a truth test. Aliased as `detect`.
  _.find = _.detect = function(obj, predicate, context) {
    var key;
    if (isArrayLike(obj)) {
      key = _.findIndex(obj, predicate, context);
    } else {
      key = _.findKey(obj, predicate, context);
    }
    if (key !== void 0 && key !== -1) return obj[key];
  };

  // Return all the elements that pass a truth test.
  // Aliased as `select`.
  _.filter = _.select = function(obj, predicate, context) {
    var results = [];
    predicate = cb(predicate, context);
    _.each(obj, function(value, index, list) {
      if (predicate(value, index, list)) results.push(value);
    });
    return results;
  };

  // Return all the elements for which a truth test fails.
  _.reject = function(obj, predicate, context) {
    return _.filter(obj, _.negate(cb(predicate)), context);
  };

  // Determine whether all of the elements match a truth test.
  // Aliased as `all`.
  _.every = _.all = function(obj, predicate, context) {
    predicate = cb(predicate, context);
    var keys = !isArrayLike(obj) && _.keys(obj),
        length = (keys || obj).length;
    for (var index = 0; index < length; index++) {
      var currentKey = keys ? keys[index] : index;
      if (!predicate(obj[currentKey], currentKey, obj)) return false;
    }
    return true;
  };

  // Determine if at least one element in the object matches a truth test.
  // Aliased as `any`.
  _.some = _.any = function(obj, predicate, context) {
    predicate = cb(predicate, context);
    var keys = !isArrayLike(obj) && _.keys(obj),
        length = (keys || obj).length;
    for (var index = 0; index < length; index++) {
      var currentKey = keys ? keys[index] : index;
      if (predicate(obj[currentKey], currentKey, obj)) return true;
    }
    return false;
  };

  // Determine if the array or object contains a given item (using `===`).
  // Aliased as `includes` and `include`.
  _.contains = _.includes = _.include = function(obj, item, fromIndex, guard) {
    if (!isArrayLike(obj)) obj = _.values(obj);
    if (typeof fromIndex != 'number' || guard) fromIndex = 0;
    return _.indexOf(obj, item, fromIndex) >= 0;
  };

  // Invoke a method (with arguments) on every item in a collection.
  _.invoke = function(obj, method) {
    var args = slice.call(arguments, 2);
    var isFunc = _.isFunction(method);
    return _.map(obj, function(value) {
      var func = isFunc ? method : value[method];
      return func == null ? func : func.apply(value, args);
    });
  };

  // Convenience version of a common use case of `map`: fetching a property.
  _.pluck = function(obj, key) {
    return _.map(obj, _.property(key));
  };

  // Convenience version of a common use case of `filter`: selecting only objects
  // containing specific `key:value` pairs.
  _.where = function(obj, attrs) {
    return _.filter(obj, _.matcher(attrs));
  };

  // Convenience version of a common use case of `find`: getting the first object
  // containing specific `key:value` pairs.
  _.findWhere = function(obj, attrs) {
    return _.find(obj, _.matcher(attrs));
  };

  // Return the maximum element (or element-based computation).
  _.max = function(obj, iteratee, context) {
    var result = -Infinity, lastComputed = -Infinity,
        value, computed;
    if (iteratee == null && obj != null) {
      obj = isArrayLike(obj) ? obj : _.values(obj);
      for (var i = 0, length = obj.length; i < length; i++) {
        value = obj[i];
        if (value > result) {
          result = value;
        }
      }
    } else {
      iteratee = cb(iteratee, context);
      _.each(obj, function(value, index, list) {
        computed = iteratee(value, index, list);
        if (computed > lastComputed || computed === -Infinity && result === -Infinity) {
          result = value;
          lastComputed = computed;
        }
      });
    }
    return result;
  };

  // Return the minimum element (or element-based computation).
  _.min = function(obj, iteratee, context) {
    var result = Infinity, lastComputed = Infinity,
        value, computed;
    if (iteratee == null && obj != null) {
      obj = isArrayLike(obj) ? obj : _.values(obj);
      for (var i = 0, length = obj.length; i < length; i++) {
        value = obj[i];
        if (value < result) {
          result = value;
        }
      }
    } else {
      iteratee = cb(iteratee, context);
      _.each(obj, function(value, index, list) {
        computed = iteratee(value, index, list);
        if (computed < lastComputed || computed === Infinity && result === Infinity) {
          result = value;
          lastComputed = computed;
        }
      });
    }
    return result;
  };

  // Shuffle a collection, using the modern version of the
  // [Fisher-Yates shuffle](http://en.wikipedia.org/wiki/Fisher–Yates_shuffle).
  _.shuffle = function(obj) {
    var set = isArrayLike(obj) ? obj : _.values(obj);
    var length = set.length;
    var shuffled = Array(length);
    for (var index = 0, rand; index < length; index++) {
      rand = _.random(0, index);
      if (rand !== index) shuffled[index] = shuffled[rand];
      shuffled[rand] = set[index];
    }
    return shuffled;
  };

  // Sample **n** random values from a collection.
  // If **n** is not specified, returns a single random element.
  // The internal `guard` argument allows it to work with `map`.
  _.sample = function(obj, n, guard) {
    if (n == null || guard) {
      if (!isArrayLike(obj)) obj = _.values(obj);
      return obj[_.random(obj.length - 1)];
    }
    return _.shuffle(obj).slice(0, Math.max(0, n));
  };

  // Sort the object's values by a criterion produced by an iteratee.
  _.sortBy = function(obj, iteratee, context) {
    iteratee = cb(iteratee, context);
    return _.pluck(_.map(obj, function(value, index, list) {
      return {
        value: value,
        index: index,
        criteria: iteratee(value, index, list)
      };
    }).sort(function(left, right) {
      var a = left.criteria;
      var b = right.criteria;
      if (a !== b) {
        if (a > b || a === void 0) return 1;
        if (a < b || b === void 0) return -1;
      }
      return left.index - right.index;
    }), 'value');
  };

  // An internal function used for aggregate "group by" operations.
  var group = function(behavior) {
    return function(obj, iteratee, context) {
      var result = {};
      iteratee = cb(iteratee, context);
      _.each(obj, function(value, index) {
        var key = iteratee(value, index, obj);
        behavior(result, value, key);
      });
      return result;
    };
  };

  // Groups the object's values by a criterion. Pass either a string attribute
  // to group by, or a function that returns the criterion.
  _.groupBy = group(function(result, value, key) {
    if (_.has(result, key)) result[key].push(value); else result[key] = [value];
  });

  // Indexes the object's values by a criterion, similar to `groupBy`, but for
  // when you know that your index values will be unique.
  _.indexBy = group(function(result, value, key) {
    result[key] = value;
  });

  // Counts instances of an object that group by a certain criterion. Pass
  // either a string attribute to count by, or a function that returns the
  // criterion.
  _.countBy = group(function(result, value, key) {
    if (_.has(result, key)) result[key]++; else result[key] = 1;
  });

  // Safely create a real, live array from anything iterable.
  _.toArray = function(obj) {
    if (!obj) return [];
    if (_.isArray(obj)) return slice.call(obj);
    if (isArrayLike(obj)) return _.map(obj, _.identity);
    return _.values(obj);
  };

  // Return the number of elements in an object.
  _.size = function(obj) {
    if (obj == null) return 0;
    return isArrayLike(obj) ? obj.length : _.keys(obj).length;
  };

  // Split a collection into two arrays: one whose elements all satisfy the given
  // predicate, and one whose elements all do not satisfy the predicate.
  _.partition = function(obj, predicate, context) {
    predicate = cb(predicate, context);
    var pass = [], fail = [];
    _.each(obj, function(value, key, obj) {
      (predicate(value, key, obj) ? pass : fail).push(value);
    });
    return [pass, fail];
  };

  // Array Functions
  // ---------------

  // Get the first element of an array. Passing **n** will return the first N
  // values in the array. Aliased as `head` and `take`. The **guard** check
  // allows it to work with `_.map`.
  _.first = _.head = _.take = function(array, n, guard) {
    if (array == null) return void 0;
    if (n == null || guard) return array[0];
    return _.initial(array, array.length - n);
  };

  // Returns everything but the last entry of the array. Especially useful on
  // the arguments object. Passing **n** will return all the values in
  // the array, excluding the last N.
  _.initial = function(array, n, guard) {
    return slice.call(array, 0, Math.max(0, array.length - (n == null || guard ? 1 : n)));
  };

  // Get the last element of an array. Passing **n** will return the last N
  // values in the array.
  _.last = function(array, n, guard) {
    if (array == null) return void 0;
    if (n == null || guard) return array[array.length - 1];
    return _.rest(array, Math.max(0, array.length - n));
  };

  // Returns everything but the first entry of the array. Aliased as `tail` and `drop`.
  // Especially useful on the arguments object. Passing an **n** will return
  // the rest N values in the array.
  _.rest = _.tail = _.drop = function(array, n, guard) {
    return slice.call(array, n == null || guard ? 1 : n);
  };

  // Trim out all falsy values from an array.
  _.compact = function(array) {
    return _.filter(array, _.identity);
  };

  // Internal implementation of a recursive `flatten` function.
  var flatten = function(input, shallow, strict, startIndex) {
    var output = [], idx = 0;
    for (var i = startIndex || 0, length = getLength(input); i < length; i++) {
      var value = input[i];
      if (isArrayLike(value) && (_.isArray(value) || _.isArguments(value))) {
        //flatten current level of array or arguments object
        if (!shallow) value = flatten(value, shallow, strict);
        var j = 0, len = value.length;
        output.length += len;
        while (j < len) {
          output[idx++] = value[j++];
        }
      } else if (!strict) {
        output[idx++] = value;
      }
    }
    return output;
  };

  // Flatten out an array, either recursively (by default), or just one level.
  _.flatten = function(array, shallow) {
    return flatten(array, shallow, false);
  };

  // Return a version of the array that does not contain the specified value(s).
  _.without = function(array) {
    return _.difference(array, slice.call(arguments, 1));
  };

  // Produce a duplicate-free version of the array. If the array has already
  // been sorted, you have the option of using a faster algorithm.
  // Aliased as `unique`.
  _.uniq = _.unique = function(array, isSorted, iteratee, context) {
    if (!_.isBoolean(isSorted)) {
      context = iteratee;
      iteratee = isSorted;
      isSorted = false;
    }
    if (iteratee != null) iteratee = cb(iteratee, context);
    var result = [];
    var seen = [];
    for (var i = 0, length = getLength(array); i < length; i++) {
      var value = array[i],
          computed = iteratee ? iteratee(value, i, array) : value;
      if (isSorted) {
        if (!i || seen !== computed) result.push(value);
        seen = computed;
      } else if (iteratee) {
        if (!_.contains(seen, computed)) {
          seen.push(computed);
          result.push(value);
        }
      } else if (!_.contains(result, value)) {
        result.push(value);
      }
    }
    return result;
  };

  // Produce an array that contains the union: each distinct element from all of
  // the passed-in arrays.
  _.union = function() {
    return _.uniq(flatten(arguments, true, true));
  };

  // Produce an array that contains every item shared between all the
  // passed-in arrays.
  _.intersection = function(array) {
    var result = [];
    var argsLength = arguments.length;
    for (var i = 0, length = getLength(array); i < length; i++) {
      var item = array[i];
      if (_.contains(result, item)) continue;
      for (var j = 1; j < argsLength; j++) {
        if (!_.contains(arguments[j], item)) break;
      }
      if (j === argsLength) result.push(item);
    }
    return result;
  };

  // Take the difference between one array and a number of other arrays.
  // Only the elements present in just the first array will remain.
  _.difference = function(array) {
    var rest = flatten(arguments, true, true, 1);
    return _.filter(array, function(value){
      return !_.contains(rest, value);
    });
  };

  // Zip together multiple lists into a single array -- elements that share
  // an index go together.
  _.zip = function() {
    return _.unzip(arguments);
  };

  // Complement of _.zip. Unzip accepts an array of arrays and groups
  // each array's elements on shared indices
  _.unzip = function(array) {
    var length = array && _.max(array, getLength).length || 0;
    var result = Array(length);

    for (var index = 0; index < length; index++) {
      result[index] = _.pluck(array, index);
    }
    return result;
  };

  // Converts lists into objects. Pass either a single array of `[key, value]`
  // pairs, or two parallel arrays of the same length -- one of keys, and one of
  // the corresponding values.
  _.object = function(list, values) {
    var result = {};
    for (var i = 0, length = getLength(list); i < length; i++) {
      if (values) {
        result[list[i]] = values[i];
      } else {
        result[list[i][0]] = list[i][1];
      }
    }
    return result;
  };

  // Generator function to create the findIndex and findLastIndex functions
  function createPredicateIndexFinder(dir) {
    return function(array, predicate, context) {
      predicate = cb(predicate, context);
      var length = getLength(array);
      var index = dir > 0 ? 0 : length - 1;
      for (; index >= 0 && index < length; index += dir) {
        if (predicate(array[index], index, array)) return index;
      }
      return -1;
    };
  }

  // Returns the first index on an array-like that passes a predicate test
  _.findIndex = createPredicateIndexFinder(1);
  _.findLastIndex = createPredicateIndexFinder(-1);

  // Use a comparator function to figure out the smallest index at which
  // an object should be inserted so as to maintain order. Uses binary search.
  _.sortedIndex = function(array, obj, iteratee, context) {
    iteratee = cb(iteratee, context, 1);
    var value = iteratee(obj);
    var low = 0, high = getLength(array);
    while (low < high) {
      var mid = Math.floor((low + high) / 2);
      if (iteratee(array[mid]) < value) low = mid + 1; else high = mid;
    }
    return low;
  };

  // Generator function to create the indexOf and lastIndexOf functions
  function createIndexFinder(dir, predicateFind, sortedIndex) {
    return function(array, item, idx) {
      var i = 0, length = getLength(array);
      if (typeof idx == 'number') {
        if (dir > 0) {
            i = idx >= 0 ? idx : Math.max(idx + length, i);
        } else {
            length = idx >= 0 ? Math.min(idx + 1, length) : idx + length + 1;
        }
      } else if (sortedIndex && idx && length) {
        idx = sortedIndex(array, item);
        return array[idx] === item ? idx : -1;
      }
      if (item !== item) {
        idx = predicateFind(slice.call(array, i, length), _.isNaN);
        return idx >= 0 ? idx + i : -1;
      }
      for (idx = dir > 0 ? i : length - 1; idx >= 0 && idx < length; idx += dir) {
        if (array[idx] === item) return idx;
      }
      return -1;
    };
  }

  // Return the position of the first occurrence of an item in an array,
  // or -1 if the item is not included in the array.
  // If the array is large and already in sort order, pass `true`
  // for **isSorted** to use binary search.
  _.indexOf = createIndexFinder(1, _.findIndex, _.sortedIndex);
  _.lastIndexOf = createIndexFinder(-1, _.findLastIndex);

  // Generate an integer Array containing an arithmetic progression. A port of
  // the native Python `range()` function. See
  // [the Python documentation](http://docs.python.org/library/functions.html#range).
  _.range = function(start, stop, step) {
    if (stop == null) {
      stop = start || 0;
      start = 0;
    }
    step = step || 1;

    var length = Math.max(Math.ceil((stop - start) / step), 0);
    var range = Array(length);

    for (var idx = 0; idx < length; idx++, start += step) {
      range[idx] = start;
    }

    return range;
  };

  // Function (ahem) Functions
  // ------------------

  // Determines whether to execute a function as a constructor
  // or a normal function with the provided arguments
  var executeBound = function(sourceFunc, boundFunc, context, callingContext, args) {
    if (!(callingContext instanceof boundFunc)) return sourceFunc.apply(context, args);
    var self = baseCreate(sourceFunc.prototype);
    var result = sourceFunc.apply(self, args);
    if (_.isObject(result)) return result;
    return self;
  };

  // Create a function bound to a given object (assigning `this`, and arguments,
  // optionally). Delegates to **ECMAScript 5**'s native `Function.bind` if
  // available.
  _.bind = function(func, context) {
    if (nativeBind && func.bind === nativeBind) return nativeBind.apply(func, slice.call(arguments, 1));
    if (!_.isFunction(func)) throw new TypeError('Bind must be called on a function');
    var args = slice.call(arguments, 2);
    var bound = function() {
      return executeBound(func, bound, context, this, args.concat(slice.call(arguments)));
    };
    return bound;
  };

  // Partially apply a function by creating a version that has had some of its
  // arguments pre-filled, without changing its dynamic `this` context. _ acts
  // as a placeholder, allowing any combination of arguments to be pre-filled.
  _.partial = function(func) {
    var boundArgs = slice.call(arguments, 1);
    var bound = function() {
      var position = 0, length = boundArgs.length;
      var args = Array(length);
      for (var i = 0; i < length; i++) {
        args[i] = boundArgs[i] === _ ? arguments[position++] : boundArgs[i];
      }
      while (position < arguments.length) args.push(arguments[position++]);
      return executeBound(func, bound, this, this, args);
    };
    return bound;
  };

  // Bind a number of an object's methods to that object. Remaining arguments
  // are the method names to be bound. Useful for ensuring that all callbacks
  // defined on an object belong to it.
  _.bindAll = function(obj) {
    var i, length = arguments.length, key;
    if (length <= 1) throw new Error('bindAll must be passed function names');
    for (i = 1; i < length; i++) {
      key = arguments[i];
      obj[key] = _.bind(obj[key], obj);
    }
    return obj;
  };

  // Memoize an expensive function by storing its results.
  _.memoize = function(func, hasher) {
    var memoize = function(key) {
      var cache = memoize.cache;
      var address = '' + (hasher ? hasher.apply(this, arguments) : key);
      if (!_.has(cache, address)) cache[address] = func.apply(this, arguments);
      return cache[address];
    };
    memoize.cache = {};
    return memoize;
  };

  // Delays a function for the given number of milliseconds, and then calls
  // it with the arguments supplied.
  _.delay = function(func, wait) {
    var args = slice.call(arguments, 2);
    return setTimeout(function(){
      return func.apply(null, args);
    }, wait);
  };

  // Defers a function, scheduling it to run after the current call stack has
  // cleared.
  _.defer = _.partial(_.delay, _, 1);

  // Returns a function, that, when invoked, will only be triggered at most once
  // during a given window of time. Normally, the throttled function will run
  // as much as it can, without ever going more than once per `wait` duration;
  // but if you'd like to disable the execution on the leading edge, pass
  // `{leading: false}`. To disable execution on the trailing edge, ditto.
  _.throttle = function(func, wait, options) {
    var context, args, result;
    var timeout = null;
    var previous = 0;
    if (!options) options = {};
    var later = function() {
      previous = options.leading === false ? 0 : _.now();
      timeout = null;
      result = func.apply(context, args);
      if (!timeout) context = args = null;
    };
    return function() {
      var now = _.now();
      if (!previous && options.leading === false) previous = now;
      var remaining = wait - (now - previous);
      context = this;
      args = arguments;
      if (remaining <= 0 || remaining > wait) {
        if (timeout) {
          clearTimeout(timeout);
          timeout = null;
        }
        previous = now;
        result = func.apply(context, args);
        if (!timeout) context = args = null;
      } else if (!timeout && options.trailing !== false) {
        timeout = setTimeout(later, remaining);
      }
      return result;
    };
  };

  // Returns a function, that, as long as it continues to be invoked, will not
  // be triggered. The function will be called after it stops being called for
  // N milliseconds. If `immediate` is passed, trigger the function on the
  // leading edge, instead of the trailing.
  _.debounce = function(func, wait, immediate) {
    var timeout, args, context, timestamp, result;

    var later = function() {
      var last = _.now() - timestamp;

      if (last < wait && last >= 0) {
        timeout = setTimeout(later, wait - last);
      } else {
        timeout = null;
        if (!immediate) {
          result = func.apply(context, args);
          if (!timeout) context = args = null;
        }
      }
    };

    return function() {
      context = this;
      args = arguments;
      timestamp = _.now();
      var callNow = immediate && !timeout;
      if (!timeout) timeout = setTimeout(later, wait);
      if (callNow) {
        result = func.apply(context, args);
        context = args = null;
      }

      return result;
    };
  };

  // Returns the first function passed as an argument to the second,
  // allowing you to adjust arguments, run code before and after, and
  // conditionally execute the original function.
  _.wrap = function(func, wrapper) {
    return _.partial(wrapper, func);
  };

  // Returns a negated version of the passed-in predicate.
  _.negate = function(predicate) {
    return function() {
      return !predicate.apply(this, arguments);
    };
  };

  // Returns a function that is the composition of a list of functions, each
  // consuming the return value of the function that follows.
  _.compose = function() {
    var args = arguments;
    var start = args.length - 1;
    return function() {
      var i = start;
      var result = args[start].apply(this, arguments);
      while (i--) result = args[i].call(this, result);
      return result;
    };
  };

  // Returns a function that will only be executed on and after the Nth call.
  _.after = function(times, func) {
    return function() {
      if (--times < 1) {
        return func.apply(this, arguments);
      }
    };
  };

  // Returns a function that will only be executed up to (but not including) the Nth call.
  _.before = function(times, func) {
    var memo;
    return function() {
      if (--times > 0) {
        memo = func.apply(this, arguments);
      }
      if (times <= 1) func = null;
      return memo;
    };
  };

  // Returns a function that will be executed at most one time, no matter how
  // often you call it. Useful for lazy initialization.
  _.once = _.partial(_.before, 2);

  // Object Functions
  // ----------------

  // Keys in IE < 9 that won't be iterated by `for key in ...` and thus missed.
  var hasEnumBug = !{toString: null}.propertyIsEnumerable('toString');
  var nonEnumerableProps = ['valueOf', 'isPrototypeOf', 'toString',
                      'propertyIsEnumerable', 'hasOwnProperty', 'toLocaleString'];

  function collectNonEnumProps(obj, keys) {
    var nonEnumIdx = nonEnumerableProps.length;
    var constructor = obj.constructor;
    var proto = (_.isFunction(constructor) && constructor.prototype) || ObjProto;

    // Constructor is a special case.
    var prop = 'constructor';
    if (_.has(obj, prop) && !_.contains(keys, prop)) keys.push(prop);

    while (nonEnumIdx--) {
      prop = nonEnumerableProps[nonEnumIdx];
      if (prop in obj && obj[prop] !== proto[prop] && !_.contains(keys, prop)) {
        keys.push(prop);
      }
    }
  }

  // Retrieve the names of an object's own properties.
  // Delegates to **ECMAScript 5**'s native `Object.keys`
  _.keys = function(obj) {
    if (!_.isObject(obj)) return [];
    if (nativeKeys) return nativeKeys(obj);
    var keys = [];
    for (var key in obj) if (_.has(obj, key)) keys.push(key);
    // Ahem, IE < 9.
    if (hasEnumBug) collectNonEnumProps(obj, keys);
    return keys;
  };

  // Retrieve all the property names of an object.
  _.allKeys = function(obj) {
    if (!_.isObject(obj)) return [];
    var keys = [];
    for (var key in obj) keys.push(key);
    // Ahem, IE < 9.
    if (hasEnumBug) collectNonEnumProps(obj, keys);
    return keys;
  };

  // Retrieve the values of an object's properties.
  _.values = function(obj) {
    var keys = _.keys(obj);
    var length = keys.length;
    var values = Array(length);
    for (var i = 0; i < length; i++) {
      values[i] = obj[keys[i]];
    }
    return values;
  };

  // Returns the results of applying the iteratee to each element of the object
  // In contrast to _.map it returns an object
  _.mapObject = function(obj, iteratee, context) {
    iteratee = cb(iteratee, context);
    var keys =  _.keys(obj),
          length = keys.length,
          results = {},
          currentKey;
      for (var index = 0; index < length; index++) {
        currentKey = keys[index];
        results[currentKey] = iteratee(obj[currentKey], currentKey, obj);
      }
      return results;
  };

  // Convert an object into a list of `[key, value]` pairs.
  _.pairs = function(obj) {
    var keys = _.keys(obj);
    var length = keys.length;
    var pairs = Array(length);
    for (var i = 0; i < length; i++) {
      pairs[i] = [keys[i], obj[keys[i]]];
    }
    return pairs;
  };

  // Invert the keys and values of an object. The values must be serializable.
  _.invert = function(obj) {
    var result = {};
    var keys = _.keys(obj);
    for (var i = 0, length = keys.length; i < length; i++) {
      result[obj[keys[i]]] = keys[i];
    }
    return result;
  };

  // Return a sorted list of the function names available on the object.
  // Aliased as `methods`
  _.functions = _.methods = function(obj) {
    var names = [];
    for (var key in obj) {
      if (_.isFunction(obj[key])) names.push(key);
    }
    return names.sort();
  };

  // Extend a given object with all the properties in passed-in object(s).
  _.extend = createAssigner(_.allKeys);

  // Assigns a given object with all the own properties in the passed-in object(s)
  // (https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object/assign)
  _.extendOwn = _.assign = createAssigner(_.keys);

  // Returns the first key on an object that passes a predicate test
  _.findKey = function(obj, predicate, context) {
    predicate = cb(predicate, context);
    var keys = _.keys(obj), key;
    for (var i = 0, length = keys.length; i < length; i++) {
      key = keys[i];
      if (predicate(obj[key], key, obj)) return key;
    }
  };

  // Return a copy of the object only containing the whitelisted properties.
  _.pick = function(object, oiteratee, context) {
    var result = {}, obj = object, iteratee, keys;
    if (obj == null) return result;
    if (_.isFunction(oiteratee)) {
      keys = _.allKeys(obj);
      iteratee = optimizeCb(oiteratee, context);
    } else {
      keys = flatten(arguments, false, false, 1);
      iteratee = function(value, key, obj) { return key in obj; };
      obj = Object(obj);
    }
    for (var i = 0, length = keys.length; i < length; i++) {
      var key = keys[i];
      var value = obj[key];
      if (iteratee(value, key, obj)) result[key] = value;
    }
    return result;
  };

   // Return a copy of the object without the blacklisted properties.
  _.omit = function(obj, iteratee, context) {
    if (_.isFunction(iteratee)) {
      iteratee = _.negate(iteratee);
    } else {
      var keys = _.map(flatten(arguments, false, false, 1), String);
      iteratee = function(value, key) {
        return !_.contains(keys, key);
      };
    }
    return _.pick(obj, iteratee, context);
  };

  // Fill in a given object with default properties.
  _.defaults = createAssigner(_.allKeys, true);

  // Creates an object that inherits from the given prototype object.
  // If additional properties are provided then they will be added to the
  // created object.
  _.create = function(prototype, props) {
    var result = baseCreate(prototype);
    if (props) _.extendOwn(result, props);
    return result;
  };

  // Create a (shallow-cloned) duplicate of an object.
  _.clone = function(obj) {
    if (!_.isObject(obj)) return obj;
    return _.isArray(obj) ? obj.slice() : _.extend({}, obj);
  };

  // Invokes interceptor with the obj, and then returns obj.
  // The primary purpose of this method is to "tap into" a method chain, in
  // order to perform operations on intermediate results within the chain.
  _.tap = function(obj, interceptor) {
    interceptor(obj);
    return obj;
  };

  // Returns whether an object has a given set of `key:value` pairs.
  _.isMatch = function(object, attrs) {
    var keys = _.keys(attrs), length = keys.length;
    if (object == null) return !length;
    var obj = Object(object);
    for (var i = 0; i < length; i++) {
      var key = keys[i];
      if (attrs[key] !== obj[key] || !(key in obj)) return false;
    }
    return true;
  };


  // Internal recursive comparison function for `isEqual`.
  var eq = function(a, b, aStack, bStack) {
    // Identical objects are equal. `0 === -0`, but they aren't identical.
    // See the [Harmony `egal` proposal](http://wiki.ecmascript.org/doku.php?id=harmony:egal).
    if (a === b) return a !== 0 || 1 / a === 1 / b;
    // A strict comparison is necessary because `null == undefined`.
    if (a == null || b == null) return a === b;
    // Unwrap any wrapped objects.
    if (a instanceof _) a = a._wrapped;
    if (b instanceof _) b = b._wrapped;
    // Compare `[[Class]]` names.
    var className = toString.call(a);
    if (className !== toString.call(b)) return false;
    switch (className) {
      // Strings, numbers, regular expressions, dates, and booleans are compared by value.
      case '[object RegExp]':
      // RegExps are coerced to strings for comparison (Note: '' + /a/i === '/a/i')
      case '[object String]':
        // Primitives and their corresponding object wrappers are equivalent; thus, `"5"` is
        // equivalent to `new String("5")`.
        return '' + a === '' + b;
      case '[object Number]':
        // `NaN`s are equivalent, but non-reflexive.
        // Object(NaN) is equivalent to NaN
        if (+a !== +a) return +b !== +b;
        // An `egal` comparison is performed for other numeric values.
        return +a === 0 ? 1 / +a === 1 / b : +a === +b;
      case '[object Date]':
      case '[object Boolean]':
        // Coerce dates and booleans to numeric primitive values. Dates are compared by their
        // millisecond representations. Note that invalid dates with millisecond representations
        // of `NaN` are not equivalent.
        return +a === +b;
    }

    var areArrays = className === '[object Array]';
    if (!areArrays) {
      if (typeof a != 'object' || typeof b != 'object') return false;

      // Objects with different constructors are not equivalent, but `Object`s or `Array`s
      // from different frames are.
      var aCtor = a.constructor, bCtor = b.constructor;
      if (aCtor !== bCtor && !(_.isFunction(aCtor) && aCtor instanceof aCtor &&
                               _.isFunction(bCtor) && bCtor instanceof bCtor)
                          && ('constructor' in a && 'constructor' in b)) {
        return false;
      }
    }
    // Assume equality for cyclic structures. The algorithm for detecting cyclic
    // structures is adapted from ES 5.1 section 15.12.3, abstract operation `JO`.

    // Initializing stack of traversed objects.
    // It's done here since we only need them for objects and arrays comparison.
    aStack = aStack || [];
    bStack = bStack || [];
    var length = aStack.length;
    while (length--) {
      // Linear search. Performance is inversely proportional to the number of
      // unique nested structures.
      if (aStack[length] === a) return bStack[length] === b;
    }

    // Add the first object to the stack of traversed objects.
    aStack.push(a);
    bStack.push(b);

    // Recursively compare objects and arrays.
    if (areArrays) {
      // Compare array lengths to determine if a deep comparison is necessary.
      length = a.length;
      if (length !== b.length) return false;
      // Deep compare the contents, ignoring non-numeric properties.
      while (length--) {
        if (!eq(a[length], b[length], aStack, bStack)) return false;
      }
    } else {
      // Deep compare objects.
      var keys = _.keys(a), key;
      length = keys.length;
      // Ensure that both objects contain the same number of properties before comparing deep equality.
      if (_.keys(b).length !== length) return false;
      while (length--) {
        // Deep compare each member
        key = keys[length];
        if (!(_.has(b, key) && eq(a[key], b[key], aStack, bStack))) return false;
      }
    }
    // Remove the first object from the stack of traversed objects.
    aStack.pop();
    bStack.pop();
    return true;
  };

  // Perform a deep comparison to check if two objects are equal.
  _.isEqual = function(a, b) {
    return eq(a, b);
  };

  // Is a given array, string, or object empty?
  // An "empty" object has no enumerable own-properties.
  _.isEmpty = function(obj) {
    if (obj == null) return true;
    if (isArrayLike(obj) && (_.isArray(obj) || _.isString(obj) || _.isArguments(obj))) return obj.length === 0;
    return _.keys(obj).length === 0;
  };

  // Is a given value a DOM element?
  _.isElement = function(obj) {
    return !!(obj && obj.nodeType === 1);
  };

  // Is a given value an array?
  // Delegates to ECMA5's native Array.isArray
  _.isArray = nativeIsArray || function(obj) {
    return toString.call(obj) === '[object Array]';
  };

  // Is a given variable an object?
  _.isObject = function(obj) {
    var type = typeof obj;
    return type === 'function' || type === 'object' && !!obj;
  };

  // Add some isType methods: isArguments, isFunction, isString, isNumber, isDate, isRegExp, isError.
  _.each(['Arguments', 'Function', 'String', 'Number', 'Date', 'RegExp', 'Error'], function(name) {
    _['is' + name] = function(obj) {
      return toString.call(obj) === '[object ' + name + ']';
    };
  });

  // Define a fallback version of the method in browsers (ahem, IE < 9), where
  // there isn't any inspectable "Arguments" type.
  if (!_.isArguments(arguments)) {
    _.isArguments = function(obj) {
      return _.has(obj, 'callee');
    };
  }

  // Optimize `isFunction` if appropriate. Work around some typeof bugs in old v8,
  // IE 11 (#1621), and in Safari 8 (#1929).
  if (typeof /./ != 'function' && typeof Int8Array != 'object') {
    _.isFunction = function(obj) {
      return typeof obj == 'function' || false;
    };
  }

  // Is a given object a finite number?
  _.isFinite = function(obj) {
    return isFinite(obj) && !isNaN(parseFloat(obj));
  };

  // Is the given value `NaN`? (NaN is the only number which does not equal itself).
  _.isNaN = function(obj) {
    return _.isNumber(obj) && obj !== +obj;
  };

  // Is a given value a boolean?
  _.isBoolean = function(obj) {
    return obj === true || obj === false || toString.call(obj) === '[object Boolean]';
  };

  // Is a given value equal to null?
  _.isNull = function(obj) {
    return obj === null;
  };

  // Is a given variable undefined?
  _.isUndefined = function(obj) {
    return obj === void 0;
  };

  // Shortcut function for checking if an object has a given property directly
  // on itself (in other words, not on a prototype).
  _.has = function(obj, key) {
    return obj != null && hasOwnProperty.call(obj, key);
  };

  // Utility Functions
  // -----------------

  // Run Underscore.js in *noConflict* mode, returning the `_` variable to its
  // previous owner. Returns a reference to the Underscore object.
  _.noConflict = function() {
    root._ = previousUnderscore;
    return this;
  };

  // Keep the identity function around for default iteratees.
  _.identity = function(value) {
    return value;
  };

  // Predicate-generating functions. Often useful outside of Underscore.
  _.constant = function(value) {
    return function() {
      return value;
    };
  };

  _.noop = function(){};

  _.property = property;

  // Generates a function for a given object that returns a given property.
  _.propertyOf = function(obj) {
    return obj == null ? function(){} : function(key) {
      return obj[key];
    };
  };

  // Returns a predicate for checking whether an object has a given set of
  // `key:value` pairs.
  _.matcher = _.matches = function(attrs) {
    attrs = _.extendOwn({}, attrs);
    return function(obj) {
      return _.isMatch(obj, attrs);
    };
  };

  // Run a function **n** times.
  _.times = function(n, iteratee, context) {
    var accum = Array(Math.max(0, n));
    iteratee = optimizeCb(iteratee, context, 1);
    for (var i = 0; i < n; i++) accum[i] = iteratee(i);
    return accum;
  };

  // Return a random integer between min and max (inclusive).
  _.random = function(min, max) {
    if (max == null) {
      max = min;
      min = 0;
    }
    return min + Math.floor(Math.random() * (max - min + 1));
  };

  // A (possibly faster) way to get the current timestamp as an integer.
  _.now = Date.now || function() {
    return new Date().getTime();
  };

   // List of HTML entities for escaping.
  var escapeMap = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '`': '&#x60;'
  };
  var unescapeMap = _.invert(escapeMap);

  // Functions for escaping and unescaping strings to/from HTML interpolation.
  var createEscaper = function(map) {
    var escaper = function(match) {
      return map[match];
    };
    // Regexes for identifying a key that needs to be escaped
    var source = '(?:' + _.keys(map).join('|') + ')';
    var testRegexp = RegExp(source);
    var replaceRegexp = RegExp(source, 'g');
    return function(string) {
      string = string == null ? '' : '' + string;
      return testRegexp.test(string) ? string.replace(replaceRegexp, escaper) : string;
    };
  };
  _.escape = createEscaper(escapeMap);
  _.unescape = createEscaper(unescapeMap);

  // If the value of the named `property` is a function then invoke it with the
  // `object` as context; otherwise, return it.
  _.result = function(object, property, fallback) {
    var value = object == null ? void 0 : object[property];
    if (value === void 0) {
      value = fallback;
    }
    return _.isFunction(value) ? value.call(object) : value;
  };

  // Generate a unique integer id (unique within the entire client session).
  // Useful for temporary DOM ids.
  var idCounter = 0;
  _.uniqueId = function(prefix) {
    var id = ++idCounter + '';
    return prefix ? prefix + id : id;
  };

  // By default, Underscore uses ERB-style template delimiters, change the
  // following template settings to use alternative delimiters.
  _.templateSettings = {
    evaluate    : /<%([\s\S]+?)%>/g,
    interpolate : /<%=([\s\S]+?)%>/g,
    escape      : /<%-([\s\S]+?)%>/g
  };

  // When customizing `templateSettings`, if you don't want to define an
  // interpolation, evaluation or escaping regex, we need one that is
  // guaranteed not to match.
  var noMatch = /(.)^/;

  // Certain characters need to be escaped so that they can be put into a
  // string literal.
  var escapes = {
    "'":      "'",
    '\\':     '\\',
    '\r':     'r',
    '\n':     'n',
    '\u2028': 'u2028',
    '\u2029': 'u2029'
  };

  var escaper = /\\|'|\r|\n|\u2028|\u2029/g;

  var escapeChar = function(match) {
    return '\\' + escapes[match];
  };

  // JavaScript micro-templating, similar to John Resig's implementation.
  // Underscore templating handles arbitrary delimiters, preserves whitespace,
  // and correctly escapes quotes within interpolated code.
  // NB: `oldSettings` only exists for backwards compatibility.
  _.template = function(text, settings, oldSettings) {
    if (!settings && oldSettings) settings = oldSettings;
    settings = _.defaults({}, settings, _.templateSettings);

    // Combine delimiters into one regular expression via alternation.
    var matcher = RegExp([
      (settings.escape || noMatch).source,
      (settings.interpolate || noMatch).source,
      (settings.evaluate || noMatch).source
    ].join('|') + '|$', 'g');

    // Compile the template source, escaping string literals appropriately.
    var index = 0;
    var source = "__p+='";
    text.replace(matcher, function(match, escape, interpolate, evaluate, offset) {
      source += text.slice(index, offset).replace(escaper, escapeChar);
      index = offset + match.length;

      if (escape) {
        source += "'+\n((__t=(" + escape + "))==null?'':_.escape(__t))+\n'";
      } else if (interpolate) {
        source += "'+\n((__t=(" + interpolate + "))==null?'':__t)+\n'";
      } else if (evaluate) {
        source += "';\n" + evaluate + "\n__p+='";
      }

      // Adobe VMs need the match returned to produce the correct offest.
      return match;
    });
    source += "';\n";

    // If a variable is not specified, place data values in local scope.
    if (!settings.variable) source = 'with(obj||{}){\n' + source + '}\n';

    source = "var __t,__p='',__j=Array.prototype.join," +
      "print=function(){__p+=__j.call(arguments,'');};\n" +
      source + 'return __p;\n';

    try {
      var render = new Function(settings.variable || 'obj', '_', source);
    } catch (e) {
      e.source = source;
      throw e;
    }

    var template = function(data) {
      return render.call(this, data, _);
    };

    // Provide the compiled source as a convenience for precompilation.
    var argument = settings.variable || 'obj';
    template.source = 'function(' + argument + '){\n' + source + '}';

    return template;
  };

  // Add a "chain" function. Start chaining a wrapped Underscore object.
  _.chain = function(obj) {
    var instance = _(obj);
    instance._chain = true;
    return instance;
  };

  // OOP
  // ---------------
  // If Underscore is called as a function, it returns a wrapped object that
  // can be used OO-style. This wrapper holds altered versions of all the
  // underscore functions. Wrapped objects may be chained.

  // Helper function to continue chaining intermediate results.
  var result = function(instance, obj) {
    return instance._chain ? _(obj).chain() : obj;
  };

  // Add your own custom functions to the Underscore object.
  _.mixin = function(obj) {
    _.each(_.functions(obj), function(name) {
      var func = _[name] = obj[name];
      _.prototype[name] = function() {
        var args = [this._wrapped];
        push.apply(args, arguments);
        return result(this, func.apply(_, args));
      };
    });
  };

  // Add all of the Underscore functions to the wrapper object.
  _.mixin(_);

  // Add all mutator Array functions to the wrapper.
  _.each(['pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift'], function(name) {
    var method = ArrayProto[name];
    _.prototype[name] = function() {
      var obj = this._wrapped;
      method.apply(obj, arguments);
      if ((name === 'shift' || name === 'splice') && obj.length === 0) delete obj[0];
      return result(this, obj);
    };
  });

  // Add all accessor Array functions to the wrapper.
  _.each(['concat', 'join', 'slice'], function(name) {
    var method = ArrayProto[name];
    _.prototype[name] = function() {
      return result(this, method.apply(this._wrapped, arguments));
    };
  });

  // Extracts the result from a wrapped and chained object.
  _.prototype.value = function() {
    return this._wrapped;
  };

  // Provide unwrapping proxy for some methods used in engine operations
  // such as arithmetic and JSON stringification.
  _.prototype.valueOf = _.prototype.toJSON = _.prototype.value;

  _.prototype.toString = function() {
    return '' + this._wrapped;
  };

  // AMD registration happens at the end for compatibility with AMD loaders
  // that may not enforce next-turn semantics on modules. Even though general
  // practice for AMD registration is to be anonymous, underscore registers
  // as a named module because, like jQuery, it is a base library that is
  // popular enough to be bundled in a third party lib, but not be part of
  // an AMD load request. Those cases could generate an error when an
  // anonymous define() is called outside of a loader request.
  if (typeof define === 'function' && define.amd) {
    define('underscore', [], function() {
      return _;
    });
  }
}.call(this));

},{}]},{},[1]);