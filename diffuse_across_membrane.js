
/**
 *
 * Created by chriswri on 26/01/15.
 * With much influence and learning from the great Mary Rose Cook maryrosecook.com
 * Those who know something about statistical physics ought avert their gaze,and it's still full of magic numbers.
 */

;(function () {
  var Sim = function (canvasId) {
    var self = this;
    var canvas = document.getElementById(canvasId);
    var screen = canvas.getContext('2d');
    var boxSize = { x: canvas.width, y: canvas.height - 100 };
    var numberOfAtoms = 1000;
    var graphPane = { x: canvas.width, y: canvas.height -100 };

    // vertical membrance at x = 600
    membrane_x = 600;
    bodies = createAtoms({ x: boxSize.x - 200, y: boxSize.y }, numberOfAtoms);
    var tick = function () {
      self.update(boxSize);
      self.draw(screen, boxSize);
      requestAnimationFrame(tick);
    };
    setInterval(function () {
      screen.fillStyle = "blue";
      screen.font = "bold 32px Arial";
      screen.clearRect(0, 310 ,800, 100);
      screen.fillText(Math.round(printCounts(bodies).big/6), 200, 350);
      screen.fillText(Math.round(printCounts(bodies).small/2), 700, 350);
    } , 1000);

    tick();
  };

  Sim.prototype = {
    update: function (boxSize) {
        for (var i = 0; i < bodies.length; i++) {
          bodies[i].update(boxSize);
        }
    },

    draw: function (screen, boxSize) {
      screen.clearRect(0, 0, boxSize.x, boxSize.y + 15);
      screen.fillStyle = "#FF0000";
      screen.fillRect(595, 0, 10, boxSize.y +15);
      screen.fillStyle = "#000000";
      for (var i = 0; i < bodies.length; i++) {
        bodies[i].drawSelf(screen)
      }
    },

    addBody: function(body) {
      bodies.push(body);
    },

  };


    var  Atom = function (center, velocity) {
        this.size = { x: 3, y: 3 };
        this.center = center;
        this.velocity = velocity;
        // 1 for big, 0 for small
        this.compartment = 1;


    };

    Atom.prototype = {
        update: function (boxSize) {
            if (this.center.y < 0) {
                this.velocity.y = -this.velocity.y;
                this.center.y = 0;
            } else if (this.center.y > boxSize.y) {
                this.velocity.y = -this.velocity.y;
                this.center.y = boxSize.y;
            } else {
                this.center.x += this.velocity.x;
                this.center.y += this.velocity.y;
            }


            if (this.compartment === 1) {
                if (this.center.x < 0) {
                    this.velocity.x = -this.velocity.x;
                    this.center.x = 0;
                } else if (this.center.x >= 600) {
                    if (Math.random() > 0.90) {
                        this.compartment = 0;
                    } else {
                        this.velocity.x = -this.velocity.x;
                        this.center.x = 600;
                    }
                }
            } else {
                if (this.center.x > boxSize.x) {
                    this.center.x = boxSize.x;
                    this.velocity.x = -this.velocity.x
                } else if (this.center.x < 600) {
                    if (Math.random() > 0.90) {
                        this.compartment = 1;
                    } else {
                        this.center.x = 600;
                        this.velocity.x = -this.velocity.x
                    }
                }
            }
        },

        drawSelf: function (screen) {
            screen.fillRect(this.center.x - this.size.x / 2,
                            this.center.y - this.size.y / 2,
                            this.size.x, this.size.y);
        }

    };

    var createAtoms = function(boxSize, numberOfAtoms) {
        var atoms = [];
        for (var i = 0; i < numberOfAtoms; i++) {
            var x = getRandomInt(0, boxSize.x);
            var y = getRandomInt(0, boxSize.y);
            var rx = getRandomInt(1, 10);
            var ry = getRandomInt(1, 10);
            var x_vel = Math.random() > 0.5 ? getRandomInt(1, 10) : -getRandomInt(1, 10);
          var y_vel = Math.random() > 0.5 ? getRandomInt(1, 10) : -getRandomInt(1, 10);
            atoms.push(new Atom({x: x, y: y}, {x: x_vel, y: y_vel}))
        };
        return atoms;
    };

    // from MDN
    var getRandomInt = function(max, min) {
        return Math.floor(Math.random() *  (max - min)) + min;
    };

    var printCounts = function (atoms) {
        big = atoms.filter(function(atom) {return atom.compartment === 1}).length;
        small = 1000 - big;
      return { big: big, small: small };
    };

  var Keyboarder = function () {
        var keyState = {};

        window.onkeydown = function(e) {
            keyState[e.keyCode] = true;
        };

        window.onkeyup = function(e) {
            keyState[e.keyCode] = false;
        };

        this.isDown = function(keycode) {
            return keyState[keycode] === true;
        };

        this.KEYS = { LEFT: 37, RIGHT: 39, SPACE: 32 };
    };

    var colliding = function(b1, b2) {
        return !(b1 === b2 ||
                 b1.center.x + b1.size.x / 2 < b2.center.x - b2.size.x / 2 ||
                 b1.center.y + b1.size.y / 2 < b2.center.y - b2.size.y / 2 ||
                 b1.center.x - b1.size.x / 2 > b2.center.x + b2.size.x / 2 ||
                 b1.center.y - b1.size.y / 2 > b2.center.y + b2.size.y / 2 );
    };

    window.onload = function (url, callback) {
      new Sim("screen");
    };

})()
