
/**
 *
 * Created by chriswri on 26/01/15.
 * With much influence and learning from the great Mary Rose Cook maryrosecook.com
 * Those who know something about statistical physics ought avert their gaze,and it's still full of magic numbers.
 */

/** Refactored by Kevin Shi 3/3/2015
 * Changelog:
 * - Magic numbers removed, settings (global constants) moved to top
 * - New collision detection system for box boundaries, not yet correct but removes +15 hack on sim redraw
 * - Position, width of membrane can now be adjusted
 * - Atom position judged by topleft corner instead of centre, size adjustable
 * - Redesign of concentration count: now expressed as integer / 100 (membrane position dependent)
 * - Canvas element now occupies full screen, simulation expands to fill space (not responsive)
*/

// Global settings
var NUMBER_OF_ATOMS = 1000;
var MEMBRANE_LOCATION = 0.8; // position of membrane; proportion of box taken by LHS
var MEMBRANE_WIDTH = 5;
var PERMEABILITY_CONSTANT = 0.90; // permeability of the membrane: if Rnd() > PERMEABILITY_CONSTANT then particle passes through
var ATOM_SIZE = 3;

// Display settings
var TEXT_HEIGHT = 100;
var TEXT_UPDATE_INTERVAL = 250; // time in ms between each recount of atoms
var TEXT_MARGIN = 150; // padding between left corner of text and 

;(function () {
  var Sim = function (canvasId) {
    var self = this;
    var canvas = document.getElementById(canvasId);
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
    window.addEventListener("keypress", Keyboarder, true);
	var screen = canvas.getContext('2d');
    SIMULATION_SIZE = { x: canvas.width, y: canvas.height - TEXT_HEIGHT};
    bodies = createAtoms({ x: (SIMULATION_SIZE.x * MEMBRANE_LOCATION), y: SIMULATION_SIZE.y }, NUMBER_OF_ATOMS);
    var tick = function () {
      self.update(SIMULATION_SIZE);
      self.draw(screen, SIMULATION_SIZE);
      requestAnimationFrame(tick);
    };
    setInterval(function () {
      screen.fillStyle = "blue";
      screen.font = "bold 32px Arial";
      screen.clearRect(0, SIMULATION_SIZE.y, canvas.width, TEXT_HEIGHT);
	  screen.fillText(Math.round(printCounts(bodies).left / (0.01 * NUMBER_OF_ATOMS * MEMBRANE_LOCATION)), TEXT_MARGIN, SIMULATION_SIZE.y + (TEXT_HEIGHT / 2));
      screen.fillText(Math.round(printCounts(bodies).right / (0.01 * NUMBER_OF_ATOMS * (1-MEMBRANE_LOCATION))), SIMULATION_SIZE.x - TEXT_MARGIN, SIMULATION_SIZE.y + (TEXT_HEIGHT / 2));

    } , TEXT_UPDATE_INTERVAL);

    tick();
  };

  Sim.prototype = {
    update: function (SIMULATION_SIZE) {
        for (var i = 0; i < bodies.length; i++) {
          bodies[i].update(SIMULATION_SIZE);
        }
    },

    draw: function (screen, SIMULATION_SIZE) {
	  // There was a dirty hack here that cleared the 15px under the sim area
	  // because atoms would leave artifacts (due to incomplete collision detection)
	  // As a reminder to clean that up, the artifacts are now being redrawn.
      // I think it works now.
	  screen.clearRect(0, 0, SIMULATION_SIZE.x + ATOM_SIZE, SIMULATION_SIZE.y + ATOM_SIZE);
      screen.fillStyle = "#FF0000";
      screen.fillRect((MEMBRANE_LOCATION * SIMULATION_SIZE.x) - (MEMBRANE_WIDTH / 2), 0, MEMBRANE_WIDTH, SIMULATION_SIZE.y);
      screen.fillStyle = "#000000";
      for (var i = 0; i < bodies.length; i++) {
        bodies[i].drawSelf(screen)
      }
    },

    addBody: function(body) {
      bodies.push(body);
    },

  };


    var Atom = function (position, velocity) {
        this.size = { x: ATOM_SIZE, y: ATOM_SIZE };
        this.position = position;
        this.velocity = velocity;
        // 1 for left, 0 for right
        this.compartment = 1;


    };

    Atom.prototype = {
        update: function (SIMULATION_SIZE) {
            // detect collision with boundaries of container, compute reflections
			// a simpler collision system, and avoids atoms 'escaping' the box
			// (removes need for the 15px clearance on bottom of box)
			// not mathematically accurate: particles move faster near boundaries
			// but aesthetically acceptable.
			if (this.position.y + this.velocity.y < 0) { 
                this.velocity.y = -this.velocity.y;
            } else if (this.position.y + this.velocity.y + this.size.y > SIMULATION_SIZE.y) {
                this.velocity.y = -this.velocity.y;
            } else { // Newtonian physics
                this.position.y += this.velocity.y;
            }

            if (this.compartment === 1) {
                if (this.position.x + this.velocity.x < 0) {
                    this.velocity.x = -this.velocity.x;
                } else if (this.position.x + this.velocity.x + this.size.x >= (MEMBRANE_LOCATION * SIMULATION_SIZE.x)) {
                    if (Math.random() > PERMEABILITY_CONSTANT) { // membrane allows particle through
                        this.compartment = 0;
                    } else {
                        this.velocity.x = -this.velocity.x;
                    }
                }
            } else {
                if (this.position.x + this.velocity.x + this.size.x > SIMULATION_SIZE.x) {
                    this.velocity.x = -this.velocity.x
                } else if (this.position.x + this.velocity.x < (MEMBRANE_LOCATION * SIMULATION_SIZE.x)) {
                    if (Math.random() > PERMEABILITY_CONSTANT) {
                        this.compartment = 1;
                    } else {
                        this.velocity.x = -this.velocity.x
                    }
                }
            }
			this.position.x += this.velocity.x
        },

        drawSelf: function (screen) {
            screen.fillRect(this.position.x, this.position.y, this.size.x, this.size.y);
        } // updated: use this.position as the TL corner of the atom
		//   this avoids having to divide this.size by 2 to determine atom edges.

    };

    var createAtoms = function(SIMULATION_SIZE, NUMBER_OF_ATOMS) {
        var atoms = [];
        // TODO: this needs to follow a Boltzmann distribution
		for (var i = 0; i < NUMBER_OF_ATOMS; i++) {
            var x = getRandomInt(0, SIMULATION_SIZE.x);
            var y = getRandomInt(0, SIMULATION_SIZE.y);
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
        left = atoms.filter(function(atom) {return atom.compartment === 1}).length;
        right = NUMBER_OF_ATOMS - left;
      return { left: left, right: right };
    };


  // is this implemented yet?
  var Keyboarder = function () {
        var keyState = {};

        onkeydown = function(e) {
            keyState[e.keyCode] = true;
        };

        onkeyup = function(e) {
            keyState[e.keyCode] = false;
        };

        this.isDown = function(keycode) {
            return keyState[keycode] === true;
        };
        this.KEYS = { LEFT: 37, RIGHT: 39, SPACE: 32 };
    };

	// this one doesn't seem to be either, computationally expensive
	// perhaps we could leave it out if we assume ideal fluid/gas
    var colliding = function(b1, b2) {
        return !(b1 === b2 ||
                 b1.position.x + b1.size.x / 2 < b2.position.x - b2.size.x / 2 ||
                 b1.position.y + b1.size.y / 2 < b2.position.y - b2.size.y / 2 ||
                 b1.position.x - b1.size.x / 2 > b2.position.x + b2.size.x / 2 ||
                 b1.position.y - b1.size.y / 2 > b2.position.y + b2.size.y / 2 );
    };

    onload = function (url, callback) {
      new Sim("screen");
    };

})()
