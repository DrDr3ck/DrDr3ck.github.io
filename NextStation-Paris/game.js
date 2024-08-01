class Station {
	constructor(symbol, district, position, monument = false, color = undefined) {
		this.symbol = symbol;
		this.district = district;
		this.position = position;
		this.monument = monument;
		this.color = color;

		this.sections = [];
	}
}

const SHAPES = {
	SQUARE: "square",
	CIRCLE: "circle",
	TRIANGLE: "triangle",
	PENTAGONE: "pentagone",
	JOKER: "*",
};

const COLORS = {
	BLUE: "blue",
	ORANGE: "orange",
	PURPLE: "purple",
	GREEN: "green",
};

function buildMap() {
	const stations = [];
	// line 1
	stations.push(new Station(SHAPES.SQUARE, 1, { x: 1, y: 1 }));
	stations.push(new Station(SHAPES.CIRCLE, 5, { x: 2, y: 1 }));
	stations.push(new Station(SHAPES.TRIANGLE, 5, { x: 4, y: 1 }));
	stations.push(new Station(SHAPES.SQUARE, 6, { x: 7, y: 1 }));
	stations.push(new Station(SHAPES.TRIANGLE, 6, { x: 8, y: 1 }));
	stations.push(new Station(SHAPES.CIRCLE, 2, { x: 10, y: 1 }));
	// line 2
	stations.push(new Station(SHAPES.JOKER, 5, { x: 1, y: 2 }, true));
	stations.push(new Station(SHAPES.SQUARE, 5, { x: 2, y: 2 }));
	stations.push(new Station(SHAPES.PENTAGONE, 5, { x: 5, y: 2 }));
	stations.push(new Station(SHAPES.CIRCLE, 6, { x: 6, y: 2 }));
	stations.push(new Station(SHAPES.JOKER, 6, { x: 9, y: 2 }, true));
	stations.push(new Station(SHAPES.PENTAGONE, 6, { x: 10, y: 2 }));
	// line 3
	stations.push(new Station(SHAPES.TRIANGLE, 7, { x: 2, y: 3 }));
	stations.push(
		new Station(SHAPES.CIRCLE, 7, { x: 4, y: 3 }, false, COLORS.BLUE)
	);
	stations.push(new Station(SHAPES.SQUARE, 8, { x: 6, y: 3 }));
	stations.push(new Station(SHAPES.PENTAGONE, 8, { x: 9, y: 3 }));
	// line 4
	stations.push(new Station(SHAPES.JOKER, 7, { x: 2, y: 4 }, true));
	stations.push(new Station(SHAPES.PENTAGONE, 7, { x: 3, y: 4 }));
	stations.push(new Station(SHAPES.SQUARE, 7, { x: 4, y: 4 }));
	stations.push(new Station(SHAPES.CIRCLE, 7, { x: 5, y: 4 }));
	stations.push(new Station(SHAPES.TRIANGLE, 8, { x: 7, y: 4 }));
	stations.push(
		new Station(SHAPES.PENTAGONE, 8, { x: 8, y: 4 }, false, COLORS.ORANGE)
	);
	stations.push(new Station(SHAPES.SQUARE, 8, { x: 10, y: 4 }));
	// line 5
	stations.push(new Station(SHAPES.TRIANGLE, 7, { x: 1, y: 5 }));
	stations.push(new Station(SHAPES.CIRCLE, 8, { x: 7, y: 5 }));
	stations.push(new Station(SHAPES.JOKER, 8, { x: 10, y: 5 }, true));
	// line 6
	stations.push(new Station(SHAPES.JOKER, 9, { x: 1, y: 6 }, true));
	stations.push(new Station(SHAPES.SQUARE, 9, { x: 4, y: 6 }));
	stations.push(new Station(SHAPES.PENTAGONE, 10, { x: 8, y: 6 }));
	stations.push(new Station(SHAPES.SQUARE, 10, { x: 10, y: 6 }));
	// line 7
	stations.push(new Station(SHAPES.CIRCLE, 9, { x: 2, y: 7 }));
	stations.push(
		new Station(SHAPES.TRIANGLE, 9, { x: 3, y: 7 }, false, COLORS.GREEN)
	);
	stations.push(new Station(SHAPES.TRIANGLE, 9, { x: 5, y: 7 }));
	stations.push(new Station(SHAPES.JOKER, 10, { x: 6, y: 7 }, true));
	stations.push(new Station(SHAPES.TRIANGLE, 10, { x: 7, y: 7 }));
	// line 8
	stations.push(new Station(SHAPES.PENTAGONE, 9, { x: 3, y: 8 }));
	stations.push(new Station(SHAPES.PENTAGONE, 9, { x: 5, y: 8 }));
	stations.push(new Station(SHAPES.CIRCLE, 10, { x: 6, y: 8 }));
	stations.push(
		new Station(SHAPES.SQUARE, 10, { x: 8, y: 8 }, false, COLORS.PURPLE)
	);
	stations.push(new Station(SHAPES.CIRCLE, 10, { x: 9, y: 8 }));
	// line 9
	stations.push(new Station(SHAPES.SQUARE, 11, { x: 1, y: 9 }));
	stations.push(new Station(SHAPES.TRIANGLE, 11, { x: 2, y: 9 }));
	stations.push(new Station(SHAPES.PENTAGONE, 11, { x: 4, y: 9 }));
	stations.push(new Station(SHAPES.CIRCLE, 11, { x: 5, y: 9 }));
	stations.push(new Station(SHAPES.PENTAGONE, 12, { x: 9, y: 9 }));
	stations.push(new Station(SHAPES.CIRCLE, 12, { x: 10, y: 9 }));
	// line 10
	stations.push(new Station(SHAPES.PENTAGONE, 3, { x: 1, y: 10 }));
	stations.push(new Station(SHAPES.JOKER, 11, { x: 3, y: 10 }, true));
	stations.push(new Station(SHAPES.TRIANGLE, 12, { x: 6, y: 10 }));
	stations.push(new Station(SHAPES.JOKER, 12, { x: 7, y: 10 }, true));
	stations.push(new Station(SHAPES.SQUARE, 12, { x: 8, y: 10 }));
	stations.push(new Station(SHAPES.TRIANGLE, 4, { x: 10, y: 10 }));
	// centrale
	stations.push(new Station(SHAPES.JOKER, 13, { x: 5.5, y: 5.5 }));

	const getStation = (x, y) => {
		return stations.find(
			(station) => station.position.x == x && station.position.y == y
		);
	};

	// create also sections ?
	const sections = [];

	const addSection = (x1, y1, x2, y2) => {
		const stationFrom = getStation(x1, y1);
		const stationTo = getStation(x2, y2);
		if (!stationFrom || !stationTo) {
			throw "error in add Section";
		}
		sections.push(new Section(stationFrom, stationTo));
	};

	console.log("stations:", stations);
	console.log("1,1:", getStation(1, 1));

	// line 1
	addSection(1, 1, 2, 2);
	addSection(1, 1, 2, 1);
	addSection(1, 1, 1, 2);
	addSection(2, 1, 1, 2);
	addSection(2, 1, 2, 2);
	addSection(2, 1, 4, 1);
	addSection(2, 1, 4, 3);
	addSection(4, 1, 2, 3);
	addSection(4, 1, 4, 3);
	addSection(4, 1, 5, 2);
	addSection(4, 1, 7, 1);
	addSection(7, 1, 6, 2);
	addSection(7, 1, 7, 4);
	addSection(7, 1, 9, 3);
	addSection(7, 1, 8, 1);
	addSection(8, 1, 6, 3);
	addSection(8, 1, 8, 4);
	addSection(8, 1, 9, 2);
	addSection(8, 1, 10, 1);
	addSection(10, 1, 9, 2);
	addSection(10, 1, 10, 2);
	// line 2
	addSection(1, 2, 2, 2);
	return { stations: stations, sections: sections };
}

class Section {
	constructor(station1, station2, overhead = false) {
		this.stations = [station1, station2]; // two stations
		this.overhead = overhead; // pont aerien
		this.crossing = [];
		this.color = undefined;
		station1.sections.push(this);
		station2.sections.push(this);
	}
}

class Overhead {
	constructor(section1, section2) {
		this.sections = [section1, section2];
	}
}

class Card {
	constructor(color, symbol, trackSwitch = false) {
		this.color = color;
		this.symbol = symbol;
		this.switch = trackSwitch;
	}
}

class Randomizer {
	constructor(seed) {
		if (seed) {
			this.generator = new Math.seedrandom(seed.toString());
		} else {
			this.generator = Math.random;
		}
	}

	/* Randomize array in-place using Durstenfeld shuffle algorithm */
	shuffleArray(array) {
		for (var i = array.length - 1; i > 0; i--) {
			var j = this.randomInt(i + 1);
			var temp = array[i];
			array[i] = array[j];
			array[j] = temp;
		}
	}

	randomInt(i) {
		return Math.floor(this.generator() * i);
	}
}
