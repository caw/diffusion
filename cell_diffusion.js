

ATOM_COUNT = 10000;
ATOM_SIZE = 3;

TEXT_HEIGHT = 0; // pro tem
TEXT_UPDATE_INTERVAL = 250; // ms

RADIUS = 150;
RADIUS_SQUARED = 150 * 150;

SOLVENT = 0;
SODIUM = 1;
CHLORIDE = 2;
UREA = 3;
INTRACELLULAR = 4;

ATOM_COLORS = {
    "SODIUM": "yellow",
    "CHLORIDE": "green",
    "UREA": "yellow",
    "INTRACELLULAR": "red"
};

DIFFUSABLE = 1;
NON_DIFFUSABLE = 2;


window.onload = function(url, callback) {
    new Sim("screen");
};

let sim_size;

function Sim (canvasId)  {
    self = this;
    const canvas = document.getElementById(canvasId);
    sim_size = { x: canvas.width, y: canvas.height - TEXT_HEIGHT };
    const screen = canvas.getContext("2d");

    // create solvent (H2O) molecules
    self.bodies = createAtoms({ x: sim_size.x, y: sim_size.y}, ATOM_COUNT, SOLVENT);

    // create na and cl extra-cellular ions
//    ecf_ions = createAtoms({ x: sim_size, y: sim_size.y}, ECF_ION);

    let tick = () => {
        self.update(sim_size);
        self.draw(screen, sim_size);
        requestAnimationFrame(tick);
    };

    // leave this out, for the moment - updating text

    //setInterval( function () {
    //    screen.font = "bold 32px Arial";
    //}, TEXT_UPDATE_INTERVAL );

    tick();
}

Sim.prototype = {
    update () {
        _.forEach(self.bodies, (b) => b.update(sim_size));
        ic_count = _.filter(self.bodies, (b) => b.compartment == 1).length;
        ec_count = ATOM_COUNT - ic_count;
        ic_area = Math.PI * RADIUS * RADIUS;
        ic_concentration = ic_count / ic_area;
        ec_area = sim_size.x * sim_size.y - ic_area;
        ec_concentration = ec_count / ec_area;
       // console.log(ic_concentration, ec_concentration);
    },

    draw (screen) {
        screen.clearRect(0, 0, sim_size.x + ATOM_SIZE, sim_size.y + ATOM_SIZE);
        _.forEach(self.bodies, (b) => b.drawSelf(screen));

        // redraw the cell membrane
        screen.beginPath();
        centre = {
            x: sim_size.x / 2,
            y: sim_size.y / 2
        };
        screen.arc(centre.x, centre.y, RADIUS, 0, 2 * Math.PI, true);
        screen.lineWidth = 3;
        screen.strokeStyle = 'red';
        screen.stroke();
    },

    addBody (body) {
        self.bodies.push(body);
    },
};

// compartment : IC = 1, EC = 0
function Atom (x_pos, y_pos, x_v, y_v, compartment) {
    this.size = { x: ATOM_SIZE, y: ATOM_SIZE };
    this.pos = { x: x_pos, y: y_pos };
    this.v = { x: x_v, y: y_v};
    this.compartment = compartment;
}

Atom.prototype = {
    update (sim_size)  {
        // going out the top
        if (this.pos.y + this.v.y < 0) {
            this.v.y = -this.v.y;
            return;
        }

        // going out the LHS
        if (this.pos.x + this.v.x < 0) {
            this.v.x = -this.v.x;
            return;
        }

        // going out the RHS
        if (this.pos.x + this.v.x > sim_size.x) {
            this.v.x = -this.v.x;
            return;
        }

        // going out the bottom
        if (this.pos.y + this.v.y > sim_size.y) {
            this.v.y = -this.v.y;
            return;
        }

        this.pos.x += this.v.x;
        this.pos.y += this.v.y;
    },

    drawSelf (screen) {
        if (inCell( this.pos.x, this.pos.y )) {
            this.compartment = 1;
            screen.fillStyle = 'green';
        } else {
            this.compartment = 0;
            screen.fillStyle = 'grey';
        }
        screen.fillRect(this.pos.x, this.pos.y, this.size.x, this.size.y);
    }
};

function Dummy () {
    dummy1 = 1;
}

// need to fix up the capitalized things
let createAtoms =  (sim_size, ATOM_COUNT, type) => {
    let atoms = [];

    // currently random; no stat mech here!
    _.times(ATOM_COUNT, () => {
        let xp = _.random(0, sim_size.x);
        let yp = _.random(0, sim_size.y);
        let x_vel = _.random(-10, 10);
        let y_vel = _.random(-10, 10);
        atoms.push(new Atom( xp, yp, x_vel, y_vel, 'foo'));
    });
    return atoms;
};


let toCentreCoords = (x, y) => {
    return {
        x: x - sim_size.x / 2,
        y: y - sim_size.y / 2
    };
};

let inCell = (x, y) => {
    cellCoords = toCentreCoords(x, y);
    squaredDistanceFromCentre = cellCoords.x * cellCoords.x + cellCoords.y * cellCoords.y;
    if (squaredDistanceFromCentre < RADIUS_SQUARED) {
        return true;
    } else {
        return false;
    }
};
