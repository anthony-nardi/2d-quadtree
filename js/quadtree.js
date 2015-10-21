'use strict';

var _ = require('underscore');

var DEFAULT_MAX_CHILDREN = 4,
    DEFAULT_DEPTH        = 4,
    DEFAULT_WIDTH        = 1000,
    DEFAULT_HEIGHT       = 1000,
    NORTH_WEST           = 1,
    NORTH_EAST           = 2,
    SOUTH_WEST           = 4,
    SOUTH_EAST           = 8;           

/**
 * Rectangles inserted into the quadtree are extended with this object literal
 */
var rectPrototype = {
  /**
   * Moves the rectangle in the quadtree to a new position (x, y)
   * @method
   * @param  {Number} x The x coordinate as defined by the quadtree coordinate system
   * @param  {Number} y The y coordinate as defined by the quadtree coordinate system
   */
  'move': function (x, y) {
  
    this.x = x;
    this.y = y;
    
    if (this.parent.orphans.indexOf(this) !== -1 || !isWithinBounds(this.parent, this)) {
      this.parent.remove(this);
      this.parent.insert(this);
    }

  },

  /**
   * Returns an array of the rectangles within the quadtree that intersect with this rectangle
   * @method
   * @return {Array} The rectangles that intersect with this rectangle
   */
  'getCollisions': function () {
    return this.parent.getCollisions(this);
  },

  /**
   * Comepletely removes this rectangle from the quadtree
   * @method
   */
  'remove': function () {
    this.parent.remove(this);
  }

};

/**
 * Quadtree contstructor function. Use to initialize the Quadtree. Also, whenever the quadtree splits,
 * this constructor is used to initialize the new nodes of the quadtree.
 * @constructor
 * @param {Object} options The only options of concern to you: width, height, maxChildren, depth
 */
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
 * Inserts an object into the quadTree
 * @param  {Object} An arbitrary object with rectangle properties (x, y, width, height)
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
    }
  }

  object.parent   = this;
  object.quadrant = undefined;

  // This quadTree does not contain quadTrees
  if (this.isLeaf) {
    
    this.children.push(object);
    setQuadrant(object, this);

    if (this.children.length > this.maxChildren && this.depth) {
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
        return;
      }
    }

    // Object does not fit within any of the sub-quadTrees.  It's an orphan.

    setQuadrant(object, this);
    this.orphans.push(object);

  }    

};

/**
 * Removes the object and potentially collapses the quadTree
 * @method remove
 * @param  {Object} Item that was inserted into the quadTree
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
    throw 'Object not found in quadTree when attempting to remove';
  }
  while (newParent.parent) {
    newParent = newParent.parent;
  }
  object.parent = newParent;
  parent.collapse();
};

/**
 * Partitions the quadTree into 4 equal sized quadTrees.
 * It also re-inserts all of the children that the leaf contained.
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
 * Collapses the quadTree
 */
Quadtree.prototype.collapse = function () {

  if (this.parent) {
    if (this !== this.parent.children[0] && this !== this.parent.children[1] && this !== this.parent.children[2] && this !== this.parent.children[3]) {
      throw 'This was a bug that was fixed, but I am paranoid this will get hit so I left it...';
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

/**
 * Helper method that determines if the quadtree should collapse
 */
Quadtree.prototype.canCollapse = function () {
  return this.getOrphanAndChildCount() <= this.maxChildren;
}

/**
 * getOrphanCount returns the number of orphans in the quadTree
 * @return {Array} number of orphans in the quadTree
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
 * Returns the number of children in the quadTree
 * @return {Number} The number of children in the quadTree
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

/**
 * getOrphanAndChildCount returns all rectangles that have been inserted into the quadtree
 * @return {Number} The number of all inserted objects in the quadtree
 */
Quadtree.prototype.getOrphanAndChildCount = function () {
  return this.getOrphanCount() + this.getChildCount();
};

/**
 * getOrphans return all the orphans of the quadTree
 * @return {Array} all the orphans of the quadTree
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
 * getChildren returns an array of all the children of the quadTree
 * @return {Array} all the children of the quadTree
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
 * getOrphansAndChildren returns an array of all the children and orphans of the quadTree
 * @return {Array} all the children and orphans of the quadTree
 */
Quadtree.prototype.getOrphansAndChildren = function () {
  return this.getChildren().concat(this.getOrphans());
};

/**
 * getQuadtreeCount returns the number of divisions within the quadtree.
 * @return {Number} The number of divisions within the quadtree.
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
 * setQuadrant sets the overlapping quadrants (quadtrees) given an object
 * @param {Object} object   A rectangle that is inserted in the quadtree
 * @param {Object} quadtree A quadtree
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
  return typeof object.width !== 'undefined' && typeof object.height !== 'undefined' && typeof object.x !== 'undefined' && typeof object.y !== 'undefined';
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

  if (r1.radius && r2.radius) {
    return isIntersectingCircles(r1, r2);
  } else {
    return isIntersectingSquares(r1, r2);
  }

}

function isIntersectingSquares (r1, r2) {
  var r1Bounds = getBounds(r1),
      r2Bounds = getBounds(r2);
      
  return (r1Bounds.left   < r2Bounds.right  &&
          r1Bounds.right  > r2Bounds.left   &&
          r1Bounds.top    < r2Bounds.bottom &&
          r1Bounds.bottom > r2Bounds.top);

}

function isIntersectingCircles (c1, c2) {
  
  var dx       = c1.x - c2.x,
      dy       = c1.y - c2.y,
      distance = Math.sqrt(dx * dx + dy * dy);

  return distance < c1.radius + c2.radius;
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

/**
 * [forceObjectWithinBounds forces the inserted object into the quadtree bounds.
 * This makes the quadtree behave like pac-man when he goes into the opening on
 * the side of the map]
 * @param  {Object} object [This is the parent-most quadtree]
 * @param  {Object} rect   [The inserted rectangle]
 */
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