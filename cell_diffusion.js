ATOM_COUNT = 10000;
ATOM_SIZE = 3;

TEXT_HEIGHT = 0; // pro tem
TEXT_UPDATE_INTERVAL = 250; // ms

RADIUS = 150;
RADIUS_SQUARED = 150 * 150;

SOLVENT = 0;
DIFFUSABLE = 1;
NON_DIFFUSABLE = 2;

;(function () {
    var Sim = function (canvasId) {
        var self = this;
        var canvas = document.getElementById(canvasId);
        SIM_SIZE = { x: canvas.width, y: canvas.height - TEXT_HEIGHT } // This is HORRIBLE - it'a a global... fix this window.SIM_SIZE
        screen = canvas.getContext("2d");

        // create solvent atoms
        bodies = createAtoms({ x: SIM_SIZE.x, y: SIM_SIZE.y}, ATOM_COUNT, SOLVENT);

        var tick = function () {
            self.update(SIM_SIZE);
            self.draw(screen, SIM_SIZE);
            requestAnimationFrame(tick);
        };

        // leave this out, for the moment - updating text

        //setInterval( function () {
        //    screen.font = "bold 32px Arial";
        //}, TEXT_UPDATE_INTERVAL );

        tick();
    };

    Sim.prototype = {
        update: function () {
            for (var i = 0; i < bodies.length; i++) {
                bodies[i].update(SIM_SIZE);
            };
            ic_atoms = bodies.filter(function (b) {
                return (b.compartment == 1);
            });
            ic_count = ic_atoms.length;
            ec_count = ATOM_COUNT - ic_count;
            ic_area = Math.PI * RADIUS * RADIUS;
            ic_concentration = ic_count / ic_area
            ec_area = SIM_SIZE.x * SIM_SIZE.y - ic_area;
            ec_concentration = ec_count / ec_area;
            console.log(ic_concentration, ec_concentration);
        },

        draw: function (screen) {
            screen.clearRect(0, 0, SIM_SIZE.x + ATOM_SIZE, SIM_SIZE.y + ATOM_SIZE);
            // redraw all the bodies
            for (var i = 0; i < bodies.length; i++) {
                bodies[i].drawSelf(screen)
            };

            // redraw the cell membrane
            screen.beginPath();
            centre = {
                x: SIM_SIZE.x / 2,
                y: SIM_SIZE.y / 2
            };
            screen.arc(centre.x, centre.y, RADIUS, 0, 2 * Math.PI, true);
            screen.lineWidth = 3;
            screen.strokeStyle = 'red';
            screen.stroke();
        },

        addBody: function (body) {
            bodies.push(body);
        },
    };

    // compartment : IC = 1, EC = 0
    var Atom = function (x_pos, y_pos, x_v, y_v, compartment) {
        this.size = { x: ATOM_SIZE, y: ATOM_SIZE };
        this.pos = { x: x_pos, y: y_pos };
        this.v = { x: x_v, y: y_v};
        this.compartment = compartment;
    };

    Atom.prototype = {
        update: function (SIM_SIZE) {
            // going out the top
            if (this.pos.y + this.v.y < 0) {
                this.v.y = -this.v.y;
                return;
            };


            // going out the LHS
            if (this.pos.x + this.v.x < 0) {
                this.v.x = -this.v.x;
                return;
            };


            // going out the RHS
            if (this.pos.x + this.v.x > SIM_SIZE.x) {
                this.v.x = -this.v.x;
                return
            };

            // going out the bottom
            if (this.pos.y + this.v.y > SIM_SIZE.y) {
                this.v.y = -this.v.y;
                return
            }

            this.pos.x += this.v.x;
            this.pos.y += this.v.y;
        },

        drawSelf: function (screen) {
            if (inCell( this.pos.x, this.pos.y )) {
                this.compartment = 1;
                screen.fillStyle = 'green';
            } else {
                this.compartment = 0;
                screen.fillStyle = 'red';
            }
            screen.fillRect(this.pos.x, this.pos.y, this.size.x, this.size.y);
        }
    };


    // need to fix up the capitalized things
    var createAtoms = function (SIM_SIZE, ATOM_COUNT, type) {
        var atoms = [];

        // currently random; no stat mech here!
        for (var i = 0; i < ATOM_COUNT; i++) {
            var xp = getRandomInt(0, SIM_SIZE.x);
            var yp = getRandomInt(0, SIM_SIZE.y);
            var x_vel = Math.random() > 0.5 ? getRandomInt(1,10) : -getRandomInt(1, 10);
            var y_vel = Math.random() > 0.5 ? getRandomInt(1, 10): -getRandomInt(1, 10);
            atoms.push(new Atom( xp, yp, x_vel, y_vel, 'foo'));
        }
        return atoms;
    };

    // from MDN
    var getRandomInt = function (max, min) {
        return Math.floor(Math.random() * (max - min)) + min;
    };

    toCentreCoords = function(x, y) {
        return {
            x: x - SIM_SIZE.x / 2,
            y: y - SIM_SIZE.y / 2
        }
    };

    inCell = function(x, y) {
        cellCoords = toCentreCoords(x, y);
        squaredDistanceFromCentre = cellCoords.x ** 2 + cellCoords.y ** 2
        if (squaredDistanceFromCentre < RADIUS_SQUARED) {
            return true;
        } else {
            return false
        };
    };



    onload = function(url, callback) {
        new Sim("screen");
    };


})();
