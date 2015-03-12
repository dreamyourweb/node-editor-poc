Scene = function(_nodes) {
  var nodes = _nodes.map(function(node) {
    return new Node(node, this);
  });
  var dep = new Deps.Dependency;

  Object.defineProperty(this, 'nodes', {
    get: function() {
      dep.depend();
      return nodes;
    }
  });
};

Scene.prototype.getNodeById = function(id) {
  return _.find(this.nodes, function(node) {
    return node.id === id;
  });
};

Scene.prototype.getLinks = function() {
  var links = [];
  var self = this;
  this.nodes.forEach(function(node) {
    if (node.nextNode !== null) {
      links.push(new Link([node, self.getNodeById(node.nextNode)]));
    }
  });
  return links;
};

Node = function(node, scene) {
  var self = this;
  var dep = new Deps.Dependency;
  this.scene = scene;

  _.keys(node).forEach(function(prop) {
    Object.defineProperty(self, prop, {
      get: function() {
        dep.depend();
        return node[prop];
      },
      set: function(newValue) {
        if (newValue !== node[prop])
          dep.changed();
        node[prop] = newValue;
      }
    });
  });

};

// Node.prototype.getSockets = function() {
//   return {
//     prev: {
//       x: 100,
//       y: 0,
//       node: this.prevNode
//     }
//   };
// };

Node.prototype.getNextNode = function() {
  return this.scene.getNodeById(this.nextNode);
};

Link = function(nodes) {
  this.nodes = nodes;
};

Link.prototype.getPath = function() {
  var startPos = [this.nodes[0].x + 100, this.nodes[0].y + 200];
  var endPos = [this.nodes[1].x + 100, this.nodes[1].y];

  var Q1 = [startPos[0], startPos[1] + 100];
  var Q2 = [endPos[0], endPos[1] - 100];
  var C = [startPos[0] + (endPos[0] - startPos[0]) / 2, startPos[1] + (endPos[1] - startPos[1]) / 2];

  // return "M" + startPos + " L" + endPos;
  return "M" + startPos + " Q" + Q1 + " " + C + " Q" + Q2 + " " + endPos;
};

// Node.prototype.

if (Meteor.isClient) {

  scene = new Scene([{
    id: "node1",
    x: 100,
    y: 100,
    prevNode: null,
    nextNode: "node2"
  }, {
    id: "node2",
    x: 200,
    y: 200,
    prevNode: "node1",
    nextNode: "node4"
  }, {
    id: "node3",
    x: 0,
    y: 400,
    prevNode: null,
    nextNode: "node2"
  }, {
    id: "node4",
    x: 500,
    y: 400,
    prevNode: "node2",
    nextNode: null
  }]);



  Template.nodeEditor.helpers({

    nodes: function() {
      return scene.nodes;
    },
    links: function() {
      return scene.getLinks();
    }

  });

  Template.nodeEditor.rendered = function() {

  };

  Template.node.rendered = function() {
    var node = this.data;
    $(this.firstNode).css({
      top: node.y,
      left: node.x
    });

    var draggie = new Draggabilly(this.firstNode);
    draggie.on('dragMove', function(event, pointer, moveVector) {
      node.x = draggie.position.x;
      node.y = draggie.position.y;
    });
  };


  Template.node.helpers({
    x: function() {
      // return Scene.get()[this.name].x;
      return this.x;
    },
    y: function() {
      // return Scene.get()[this.name].y;
      return this.y;
    },
    sockets: function() {
      return JSON.stringify(this.getSockets());
    },
    node: function() {
      return JSON.stringify(this);
    },

    id: function() {
      return this.id;
    }

  });

  Template.link.helpers({
    path: function() {
      return this.getPath();
    }
  });


}

// QuadBezierLink = function(nodes) {
//   this.nodes = nodes;
// };

// QuadBezierLink.prototype.getPath = function() {
//   var n0 = this.nodes[0];
//   var n1 = this.nodes[1];
//   var x0 = n0.x + 100;
//   var x1 = n1.x - 0;
//   var M = [x0, n0.y];
//   var T = [x1, n1.y];
//   var Q1 = [(x1 - x0) / 2 + x0, n0.y];
//   var Q2 = [(x1 - x0) / 2 + x0, n1.y];
//   var C = [(x1 - x0) / 2 + x0, (n1.y - n0.y) / 2 + n0.y];
//   return "M" + M + " Q" + Q1 + " " + C + " Q" + Q2 + " " + T;
// };

// QuadBezierLink.prototype.getControlPath = function() {
//   var n0 = this.nodes[0];
//   var n1 = this.nodes[1];
//   var x0 = n0.x + 100;
//   var x1 = n1.x - 0;
//   var M = [x0, n0.y];
//   var T = [x1, n1.y];
//   var Q1 = [(x1 - x0) / 2 + x0, n0.y];
//   var Q2 = [(x1 - x0) / 2 + x0, n1.y];
//   return "M" + M + " L" + Q1 + " L" + Q2 + " L" + T;
// };