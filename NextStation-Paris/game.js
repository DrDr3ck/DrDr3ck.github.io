class Station {
	constructor(symbol, district, position, monument = false, color = undefined) {
		this.symbol = symbol;
		this.district = district;
		this.position = position;
		this.monument = monument;
		this.color = color;

		this.sections = [];
	}

	onBorder(curColor) {
		return (
			this.sections.reduce((total, section) => {
				if (section.color === curColor) {
					return total + 1;
				}
				return total;
			}, 0) <= 1
		);
	}

	hasSameSymbol(symbol) {
		if (symbol === SHAPES.JOKER || this.symbol === SHAPES.JOKER) {
			return true;
		}
		return symbol === this.symbol;
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
	stations.push(new Station(SHAPES.JOKER, 13, { x: 5, y: 5 }));
	stations.push(new Station(SHAPES.JOKER, 13, { x: 6, y: 5 }));
	stations.push(new Station(SHAPES.JOKER, 13, { x: 5, y: 6 }));
	stations.push(new Station(SHAPES.JOKER, 13, { x: 6, y: 6 }));

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
			throw "error in add Section" + x1 + "," + y1 + ":" + x2 + "," + y2;
		}
		sections.push(new Section(stationFrom, stationTo));
	};

	const addSections = (x1, y1, positions) => {
		for (let i = 0; i < positions.length; i += 2) {
			const x2 = positions[i];
			const y2 = positions[i + 1];
			addSection(x1, y1, x2, y2);
		}
	};

	// line 1
	addSections(1, 1, [2, 2, 2, 1, 1, 2]);
	addSections(2, 1, [1, 2, 2, 2, 4, 1, 4, 3]);
	addSections(4, 1, [2, 3, 4, 3, 5, 2, 7, 1]);
	addSections(7, 1, [6, 2, 7, 4, 9, 3, 8, 1]);
	addSections(8, 1, [6, 3, 8, 4, 9, 2, 10, 1]);
	addSections(10, 1, [9, 2, 10, 2]);
	// line 2
	addSections(1, 2, [1, 5, 2, 3, 2, 2]);
	addSections(2, 2, [2, 3, 4, 4, 5, 2]);
	addSections(5, 2, [4, 3, 5, 4, 6, 3, 6, 2]);
	addSections(6, 2, [4, 4, 6, 3, 8, 4, 9, 2]);
	addSections(9, 2, [7, 4, 9, 3, 10, 2]);
	addSections(10, 2, [9, 3, 10, 4]);
	// line 3
	addSections(2, 3, [2, 4, 3, 4, 4, 3]);
	addSections(4, 3, [3, 4, 4, 4, 5, 4, 6, 3]);
	addSections(6, 3, [5, 4, 6, 5, 7, 4, 9, 3]);
	addSections(9, 3, [8, 4, 9, 8, 10, 4]);
	// line 4
	addSections(2, 4, [1, 5, 2, 7, 4, 6, 3, 4]);
	addSections(3, 4, [1, 6, 3, 7, 5, 6, 4, 4]);
	addSections(4, 4, [4, 6, 5, 5, 5, 4, 7, 4]);
	addSections(5, 4, [2, 7, 5, 5, 6, 5, 7, 4]); // 2 points centraux!!
	addSections(7, 4, [6, 5, 7, 5, 8, 4]);
	addSections(8, 4, [7, 5, 8, 6, 10, 6, 10, 4]);
	addSections(10, 4, [8, 6, 10, 5]);
	// line 5
	addSections(1, 5, [1, 6, 3, 7, 5, 5]);
	addSections(7, 5, [6, 5, 6, 6, 7, 7, 8, 6, 10, 5]); // 2 points centraux!!
	addSections(10, 5, [10, 6]);
	// line 6
	addSections(1, 6, [1, 9, 2, 7, 4, 6]);
	addSections(4, 6, [3, 7, 4, 9, 5, 7, 5, 5, 5, 6]); // 2 points centraux!!
	addSections(8, 6, [6, 6, 7, 7, 8, 8, 10, 6]);
	addSections(10, 6, [8, 8, 10, 9]);
	// line 7
	addSections(2, 7, [2, 9, 3, 8, 3, 7]);
	addSections(3, 7, [1, 9, 3, 8, 5, 9, 5, 7]);
	addSections(5, 7, [5, 8, 6, 8, 6, 7, 5, 6, 6, 6]); // 2 points centraux!!
	addSections(6, 7, [5, 6, 6, 6, 5, 8, 6, 8, 7, 7]); // 2 points centraux!!
	addSections(7, 7, [6, 6, 6, 8, 7, 10, 8, 8]);
	// line 8
	addSections(3, 8, [2, 9, 3, 10, 4, 9, 5, 8, 5, 6]);
	addSections(5, 8, [4, 9, 5, 9, 7, 10, 6, 8]);
	addSections(6, 8, [5, 9, 6, 10, 8, 10, 8, 8]);
	addSections(8, 8, [6, 10, 8, 10, 9, 9, 9, 8]);
	addSections(9, 8, [6, 5, 7, 10, 9, 9, 10, 9]);
	// line 9
	addSections(1, 9, [1, 10, 2, 9]);
	addSections(2, 9, [1, 10, 3, 10, 4, 9]);
	addSections(4, 9, [3, 10, 5, 9]);
	addSections(5, 9, [6, 10, 9, 9]);
	addSections(9, 9, [8, 10, 10, 10, 10, 9]);
	addSections(9, 10, [10, 10]);
	// line 9
	addSections(1, 10, [3, 10]);
	addSections(3, 10, [6, 10]);
	addSections(6, 10, [7, 10]);
	addSections(7, 10, [8, 10]);
	addSections(8, 10, [10, 10]);

	// TODO: compute 'crossing' sections

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

	// return true if section is already crossed by another one
	isCrossed() {
		// section already used by another line
		if (this.color) {
			return true;
		}
		// section is a overhead: no crossing
		if (this.overhead) {
			return false;
		}
		return this.crossing.some((section) => section.color !== undefined);
	}
}

class Overhead {
	constructor(section1, section2) {
		this.sections = [section1, section2];
	}
}

class Card {
	constructor(cardIndex, color, symbol) {
		this.index = cardIndex;
		this.color = color;
		this.symbol = symbol;
		this.switch = color === "switch";
	}
}

function getCards() {
	const cards = [];
	cards.push(new Card(1, "blue", SHAPES.CIRCLE));
	cards.push(new Card(2, "blue", SHAPES.TRIANGLE));
	cards.push(new Card(3, "blue", SHAPES.PENTAGONE));
	cards.push(new Card(4, "blue", SHAPES.SQUARE));
	cards.push(new Card(5, "blue", SHAPES.JOKER));
	cards.push(new Card(6, "switch", SHAPES.JOKER)); // SWITCH
	cards.push(new Card(7, "yellow", SHAPES.PENTAGONE));
	cards.push(new Card(8, "yellow", SHAPES.CIRCLE));
	cards.push(new Card(9, "yellow", SHAPES.TRIANGLE));
	cards.push(new Card(10, "yellow", SHAPES.SQUARE));
	cards.push(new Card(11, "yellow", SHAPES.JOKER));
	return cards;
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

const distance = (x1, y1, x2, y2) => {
	return sqrt(pow(x2 - x1, 2) + pow(y2 - y1, 2));
};
