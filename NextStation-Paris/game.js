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

function getStations() {
	const stations = [];
	// line 1
	stations.push(new Station(SHAPES.SQUARE, 1, { x: 1, y: 1 }));
	stations.push(new Station(SHAPES.CIRCLE, 5, { x: 2, y: 1 }));
	stations.push(new Station(SHAPES.TRIANGLE, 5, { x: 4, y: 1 }));
	stations.push(new Station(SHAPES.SQUARE, 6, { x: 7, y: 1 }));
	stations.push(new Station(SHAPES.TRIANGLE, 6, { x: 8, y: 1 }));
	stations.push(new Station(SHAPES.CIRCLE, 3, { x: 10, y: 1 }));
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
	return stations;
}

class Section {
	constructor(station1, station2, overhead = false) {
		this.stations = [station1, station2]; // two stations
		this.overhead = overhead; // pont aerien
		this.crossing = [];
		this.color = undefined;
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
