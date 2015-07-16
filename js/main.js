var Quadtree = window.Quadtree = require('./quadtree.js');


var map = window.map = new Quadtree();

var object1 = window.object1 = {'x': 10, 'y': 10, 'height': 10, 'width': 10};
var object2 = window.object2 = {'x': 0, 'y': 0, 'height': 20, 'width': 20};
var object3 = window.object3 = {'x': 0, 'y': 0, 'height': 30, 'width': 30};
var object4 = window.object4 = {'x': 0, 'y': 0, 'height': 40, 'width': 40};
var object5 = window.object5 = {'x': 0, 'y': 0, 'height': 50, 'width': 50};

map.insert(object1);
map.insert(object2);
map.insert(object3);
map.insert(object4);
map.insert(object5);

console.log('-----------------------------------------------------------------------------');

console.log('Number of children: ' + map.getChildCount());
console.log('Number of orphans : ' + map.getOrphanCount());
console.log('Number of orphans and children: ' + map.getOrphanAndChildCount());