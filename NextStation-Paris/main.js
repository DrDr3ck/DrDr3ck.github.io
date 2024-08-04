const uiManager = new UIManager();
const windowWidth = 1500;
const windowHeight = 800;
uiManager.loggerContainer = new LoggerContainer(
	windowWidth - 300,
	windowHeight - 500,
	240,
	100
);
uiManager.loggerContainer.visible = true;

const toolManager = new ToolManager();
const jobManager = new JobManager();
const soundManager = new SoundMgr();
const spritesheet = new SpriteSheet();

const GAME_LOADING_STATE = 0;
const GAME_START_STATE = 1;
const GAME_PLAY_STATE = 2;
const GAME_OVER_STATE = 3;
let curState = GAME_LOADING_STATE;
let toggleDebug = false;
let lastTime = 0;

let randomizer = null;

let useSwitch = false;

let stationLine = [];
const allStationLines = [];

let over = {};
let clickedStation = null;

let seed = "ParisJO"; // switch0: ParisJO2024 switch1: Paris switch2: ParisJO

let pencils = [COLORS.GREEN, COLORS.BLUE, COLORS.ORANGE, COLORS.PURPLE];

let round = 0;

let cardArray = [];

const scoreUI = {
	lines: [
		{
			districts: {
				topLeft: { x: 861, y: 513 },
				bottomRight: { x: 903, y: 550 },
			},
			stations: {
				topLeft: { x: 861, y: 570 },
				bottomRight: { x: 903, y: 607 },
			},
			monuments: {
				topLeft: { x: 861, y: 625 },
				bottomRight: { x: 903, y: 665 },
			},
		},
	],
	links: {
		two: {},
		three: {},
		four: {},
	},
	overheads: {
		one: {},
		two: {},
	},
};

function preload() {}

function musicClicked() {
	// TODO
}

const speakerStorageKey = "DrDr3ck/GameEngine/Speaker";
function speakerClicked() {
	speakerButton.checked = !speakerButton.checked;
	soundManager.mute(!speakerButton.checked);
	localStorage.setItem(speakerStorageKey, speakerButton.checked ? "on" : "off");
}

function startClicked() {
	curState = GAME_PLAY_STATE;
	uiManager.setUI([speakerButton, musicButton]);
	uiManager.addLogger("Start game");
	console.log("seed:", seed);
	randomizer = new Randomizer(seed);
	randomizer.shuffleArray(cardArray);

	randomizer.shuffleArray(pencils);
	randomizer.shuffleArray(cards);

	startLine();
}

const speakerButton = new BFloatingSwitchButton(
	windowWidth - 70 - 10 - 70,
	70,
	"\uD83D\uDD0A",
	speakerClicked
);
const musicButton = new BFloatingSwitchButton(
	windowWidth - 70,
	70,
	"\uD83C\uDFB6",
	musicClicked
);
const startButton = new BButton(
	850,
	windowHeight - 50 - 200,
	"START",
	startClicked
);

function initUI() {
	speakerButton.setTextSize(50);
	musicButton.setTextSize(50);
	musicButton.enabled = false;
	musicButton.checked = false;
	const isSpeakerOn = localStorage.getItem(speakerStorageKey);
	if (isSpeakerOn === "off") {
		speakerButton.checked = false;
		soundManager.mute(true);
	}
	const menu = [speakerButton, startButton, musicButton];
	uiManager.setUI(menu);
}

function setup() {
	initUI();
	canvas = createCanvas(windowWidth, windowHeight);
	canvas.parent("canvas");

	spritesheet.addSpriteSheet("paris", "./paris.png", 770, 765);
	spritesheet.addSpriteSheet("score", "./score.png", 615, 315);
	spritesheet.addSpriteSheet("cards", "./cards.png", 325, 210);
	spritesheet.addSpriteSheet("switch", "./switch.png", 131, 131);
	spritesheet.addSpriteSheet("crayons", "./crayons.png", 93, 93);

	frameRate(15);

	lastTime = Date.now();
}

function updateGame(elapsedTime) {}

function getX(x) {
	return (x - 1) * ((747 - 53) / 9) + 53;
}

function getY(y) {
	return (y - 1) * ((747 - 53) / 9) + 50;
}

const getStation = (stations, x, y) => {
	return stations.find(
		(station) => station.position.x == x && station.position.y == y
	);
};

function startLine() {
	// which color for current line ?
	switch (pencils[round]) {
		case COLORS.GREEN:
			stationLine = [getStation(stations, 3, 7)];
			break;
		case COLORS.BLUE:
			stationLine = [getStation(stations, 4, 3)];
			break;
		case COLORS.ORANGE:
			stationLine = [getStation(stations, 8, 4)];
			break;
		case COLORS.PURPLE:
			stationLine = [getStation(stations, 8, 8)];
			break;
	}
	allStationLines.push({ color: pencils[round], line: stationLine });
	// check if first card is the 'switch' !!
	if (cards[0].switch) {
		nextCard();
		useSwitch = true;
	}
}

function displayDistrict(district) {
	noFill();
	stroke(0);
	strokeWeight(2);
	if (district === 1) {
		beginShape();
		vertex(20, 23);
		vertex(80, 23);
		vertex(80, 74);
		vertex(20, 74);
		endShape(CLOSE);
	}
	if (district === 5) {
		beginShape();
		vertex(20, 92);
		vertex(100, 92);
		vertex(100, 23);
		vertex(390, 23);
		vertex(390, 153);
		vertex(20, 153);
		endShape(CLOSE);
	}
	if (district === 7) {
		beginShape();
		vertex(20, 175);
		vertex(390, 175);
		vertex(390, 308);
		vertex(308, 308);
		vertex(308, 383);
		vertex(20, 383);
		endShape(CLOSE);
	}
	if (district === 9) {
		beginShape();
		vertex(20, 408);
		vertex(312, 408);
		vertex(312, 485);
		vertex(390, 485);
		vertex(390, 615);
		vertex(20, 615);
		endShape(CLOSE);
	}
	if (district === 10) {
		beginShape();
		vertex(415, 485);
		vertex(493, 485);
		vertex(493, 410);
		vertex(773, 410);
		vertex(773, 615);
		vertex(415, 615);
		endShape(CLOSE);
	}
	if (district === 13) {
		beginShape();
		vertex(337, 331);
		vertex(463, 331);
		vertex(463, 460);
		vertex(337, 460);
		endShape(CLOSE);
	}
}

function displayMonuments(monumentColor) {
	if (!monumentColor) {
		return;
	}
	const coloredLine = allStationLines.find(
		(line) => line.color == monumentColor
	);
	if (coloredLine) {
		const stations = getMonuments(coloredLine.line);
		stations.forEach((station) => displayStation(station, "black"));
	}
}

function displayStations(stationColor) {
	if (!stationColor) {
		return;
	}
	const coloredLine = allStationLines.find(
		(line) => line.color == stationColor
	);
	if (coloredLine) {
		const stations = getMaxStations(coloredLine.line);
		stations.forEach((station) => displayStation(station, "black"));
		const district = stations[0].district;
		displayDistrict(district);
	}
}

function displayDistricts(districtColor) {
	if (!districtColor) {
		return;
	}
	const coloredLine = allStationLines.find(
		(line) => line.color == districtColor
	);
	if (coloredLine) {
		const districts = getCrossedDistricts(coloredLine.line);
		districts.forEach((district) => displayDistrict(district));
	}
}

function displayStation(station, lineColor) {
	if (!station) {
		return;
	}
	stroke(110, 160, 130);
	const color = lineColor ?? station.color;
	if (color === COLORS.BLUE) {
		stroke(50, 50, 130);
	} else if (color === COLORS.ORANGE) {
		stroke(255, 127, 80);
	} else if (color === COLORS.GREEN) {
		stroke(127, 255, 80);
	} else if (color === COLORS.PURPLE) {
		stroke(127, 0, 127);
	}
	strokeWeight(5);
	if (station.monument && !lineColor) {
		fill(160, 110, 130);
	} else {
		noFill();
	}
	const X = station.district === 13 ? getX(5.5) : getX(station.position.x);
	const Y = station.district === 13 ? getY(5.5) : getY(station.position.y);
	ellipse(X, Y, station.district === 13 ? 145 : 45);
	if (!lineColor) {
		if (station.symbol === SHAPES.SQUARE) {
			square(X - 10, Y - 10, 20);
		} else if (station.symbol === SHAPES.CIRCLE) {
			ellipse(X, Y, 20);
		} else if (station.symbol === SHAPES.TRIANGLE) {
			triangle(X, Y - 10, X - 10, Y + 10, X + 10, Y + 10);
		} else if (station.symbol === SHAPES.PENTAGONE) {
			beginShape();
			vertex(X, Y - 10);
			vertex(X + 10, Y - 5);
			vertex(X + 5, Y + 10);
			vertex(X - 5, Y + 10);
			vertex(X - 10, Y - 5);
			endShape(CLOSE);
		}
		textAlign(CENTER, CENTER);
		stroke(0);
		strokeWeight(1);
		fill(0);
		textSize(15);
		text(station.district, X, Y);
		//text(`${station.position.x},${station.position.y}`, X, Y);
	}
}

function displaySection(section) {
	line(
		getX(section.stations[0].position.x),
		getY(section.stations[0].position.y),
		getX(section.stations[1].position.x),
		getY(section.stations[1].position.y)
	);
}

function displayPencil() {
	// COLORS.GREEN, COLORS.BLUE, COLORS.ORANGE, COLORS.PURPLE
	switch (pencils[round]) {
		case COLORS.GREEN:
			spritesheet.drawSprite("crayons", 0, 1200, 120);
			break;
		case COLORS.BLUE:
			spritesheet.drawSprite("crayons", 1, 1200, 120);
			break;
		case COLORS.ORANGE:
			spritesheet.drawSprite("crayons", 2, 1200, 120);
			break;
		case COLORS.PURPLE:
			spritesheet.drawSprite("crayons", 3, 1200, 120);
			break;
	}
}

function getRGBColor(color = null) {
	switch (color ?? pencils[round]) {
		case COLORS.GREEN:
			return [5, 134, 62];
		case COLORS.BLUE:
			return [0, 164, 227];
		case COLORS.ORANGE:
			return [235, 92, 43];
		case COLORS.PURPLE:
			return [146, 101, 168];
	}
}

let stations = [];
let sections = [];

let cards = [];

function displayLines() {
	allStationLines.forEach((cur, index) =>
		displayLine(cur.color, cur.line, allStationLines.length === index + 1)
	);
}

function displayLine(color, line, lastLine) {
	if (lastLine) {
		line.forEach((station) => displayStation(station, color));
	}
	const sections = [];
	line.forEach((station) => {
		for (const section of station.sections) {
			if (section.color === color && !sections.includes(section)) {
				sections.push(section);
			}
		}
	});
	strokeWeight(3);
	const colors = getRGBColor(color);
	stroke(colors[0], colors[1], colors[2]);
	sections.forEach((section) => displaySection(section));
}

function getOverHead(num) {
	// TODO: score for overhead
	return 0;
}

function getLinks(num) {
	// TODO: score for links
	return 0;
}

function getCrossedDistricts(stationLine) {
	const districts = [];
	stationLine.forEach((station) => {
		const district = station.district;
		if (!districts.includes(district)) {
			districts.push(district);
		}
	});
	return districts;
}
function getMaxStations(stationLine) {
	const districts = [[], [], [], [], [], [], [], [], [], [], [], [], [], []];
	stationLine.forEach((station) => {
		const district = station.district;
		// special case for district 13: only 1 station !!
		if (
			(district === 13 && districts[district].length === 0) ||
			district !== 13
		) {
			districts[district].push(station);
		}
	});
	return districts.reduce((previous, cur) => {
		if (cur.length > previous.length) {
			return cur;
		}
		return previous;
	}, []);
}

function getMonuments(stationLine) {
	const monuments = [];
	stationLine.forEach((station) => {
		if (station.monument) {
			monuments.push(station);
		}
	});
	return monuments;
}

function drawScore() {
	textAlign(CENTER, CENTER);
	strokeWeight(1);
	textSize(20);
	let total = 0;
	allStationLines.forEach((cur, index) => {
		const colors = getRGBColor(cur.color);
		stroke(colors[0], colors[1], colors[2]);
		fill(colors[0], colors[1], colors[2]);
		const districs = getCrossedDistricts(cur.line).length;
		const maxStation = getMaxStations(cur.line).length;
		const monument = getMonuments(cur.line).length;
		const Xs = [881, 939, 997, 1056];
		const X = Xs[index];
		text(districs, X, 400 + 135);
		text(maxStation, X, 455 + 135);
		text(monument, X, 510 + 135);
		total += districs * maxStation + monument * 2;
		text(districs * maxStation + monument * 2, X, 565 + 135);
	});
	// total station lines
	text(total, 1115, 700);
	// TODO: overhead
	const overhead2 = getOverHead(1);
	const overhead6 = getOverHead(2);
	text(overhead2, 1056, 755);
	text(overhead6, 1178, 755);

	text(overhead2 * 2 + overhead6 * 6, 1178, 700);
	total += overhead2 * 2 + overhead6 * 6;
	// TODO: correspondance
	const link2 = getLinks(2);
	const link5 = getLinks(3);
	const link9 = getLinks(4);

	text(link2 * 2 + link5 * 5 + link9 * 9, 1242, 700);
	total += link2 * 2 + link5 * 5 + link9 * 9;
	// grand total
	text(total, 1280, 755);
}

function drawLine(station) {
	const X = getX(station.position.x);
	const Y = getY(station.position.y);
	const colors = getRGBColor();
	stroke(colors[0], colors[1], colors[2]);
	strokeWeight(3);
	line(X, Y, mouseX, mouseY);
}

function drawCard() {
	spritesheet.drawSprite("cards", cards[0].index, 815, 15);
	if (useSwitch) {
		spritesheet.drawScaledSprite("switch", 0, 1080, 160, 0.8);
	}
}

function drawGame() {
	spritesheet.drawSprite("paris", 0, 15, 15);
	const scoreScale = 0.9;
	spritesheet.drawScaledSprite(
		"score",
		0,
		windowWidth - 615 * scoreScale - 145,
		windowHeight - 315 * scoreScale - 15,
		scoreScale
	);
	drawScore();

	drawCard();

	displayPencil();

	displayLines();

	displayStation(over.station, pencils[round]);

	displayDistricts(over.districts);
	displayStations(over.stations);
	displayMonuments(over.monuments);

	if (clickedStation) {
		drawLine(clickedStation);
	}

	/* debug
	stroke(80);
	strokeWeight(2);
	noFill();
	sections.forEach((element) => {
		displaySection(element);
	});
	stations.forEach((element) => {
		displayStation(element, null);
	});
	// end debug*/
}

function initGame() {
	const map = buildMap();
	stations = map.stations;
	sections = map.sections;

	cards = getCards();

	// debug
	startClicked();
}

function drawLoading() {
	fill(0);
	noStroke();
	textSize(50);
	textAlign(CENTER, CENTER);
	text("Loading...", width / 2, height / 2);
	if (
		soundManager.totalLoadedSounds === soundManager.soundToLoad &&
		spritesheet.totalLoadedImages === spritesheet.totalImagesToLoad
	) {
		curState = GAME_START_STATE;

		// init game
		initGame();
		textAlign(LEFT, BASELINE);
		uiManager.addLogger("Game loaded");
	}
}

function draw() {
	const currentTime = Date.now();
	const elapsedTime = currentTime - lastTime;
	background(51);
	if (curState === GAME_LOADING_STATE) {
		drawLoading();
		return;
	}

	uiManager.processInput();

	uiManager.update(elapsedTime);

	// draw game
	if (curState === GAME_START_STATE) {
		spritesheet.drawSprite("paris", 0, 15, 15);

		spritesheet.drawSprite("cards", 0, 815, 15);

		displayPencil();
	}
	if (curState === GAME_PLAY_STATE) {
		updateGame(elapsedTime);
		drawGame();
	}

	uiManager.draw();
	if (toolManager.currentTool) {
		toolManager.currentTool.draw();
	}
	jobManager.draw();

	lastTime = currentTime;
}

function getBorderStations(line) {
	const border = [];
	line.forEach((station) => {
		if (useSwitch || station.onBorder(pencils[round])) {
			border.push(station);
		}
	});
	return border;
}

function findSection(stationFrom, stationTo) {
	for (const section of sections) {
		if (
			section.stations.includes(stationFrom) &&
			section.stations.includes(stationTo)
		) {
			return section;
		}
	}
	return null;
}

// check if station is clickable.
// for first station, it should be a station that is at an end of the line
// for second station, it should be a station that has a section with clickedStation
// + section that is not crossing another already drawn section
// + no loop
function isClickable(station) {
	if (!clickedStation) {
		// first station
		const stations = getBorderStations(stationLine);
		return stations.includes(station);
	}
	// second station
	if (!station.hasSameSymbol(cards[0].symbol)) {
		return false;
	}
	// check if a section exists between the two stations
	const section = findSection(clickedStation, station);
	if (!section) {
		return false;
	}
	// TODO: check if section is not already crossed by another section
	return !section.isCrossed();
}

function nextRound() {
	round++;
	if (round === 4) {
		// TODO: end of game
	} else {
		cards = getCards();
		randomizer.shuffleArray(cards);
		startLine();
	}
}

function nextCard() {
	useSwitch = false;
	cards.shift();
	if (cards.length === 0) {
		nextRound();
		return;
	}
	if (cards[0].switch) {
		nextCard();
		useSwitch = true;
		return;
	}
}

function addLine() {
	const section = findSection(clickedStation, over.station);
	section.color = pencils[round];
	stationLine.push(over.station);
	clickedStation = null;
	nextCard();
}

function mouseClicked() {
	if (toggleDebug) {
		uiManager.addLogger(`X=${mouseX}, Y=${mouseY}`);
	}
	toolManager.mouseClicked();
	uiManager.mouseClicked();

	if (over.station) {
		console.log("an overed Station is clicked:", over.station);
		if (clickedStation !== over.station) {
			// check if station is clickable !!
			if (isClickable(over.station)) {
				if (!clickedStation) {
					clickedStation = over.station;
				} else {
					// draw line
					addLine();
				}
			}
		} else {
			clickedStation = null;
		}
	}
	return false;
}

function isOverStation(station) {
	const X = station.district === 13 ? getX(5.5) : getX(station.position.x);
	const Y = station.district === 13 ? getY(5.5) : getY(station.position.y);
	return distance(X, Y, mouseX, mouseY) < (station.district === 13 ? 70 : 20);
}

function mouseInSquare(square) {
	const between = (value, min, max) => {
		return value > min && value < max;
	};
	return (
		between(mouseX, square.topLeft.x, square.bottomRight.x) &&
		between(mouseY, square.topLeft.y, square.bottomRight.y)
	);
}

function mouseMoved() {
	over = {};
	stations.forEach((station) => {
		if (isOverStation(station)) {
			over.station = station;
		}
	});
	scoreUI.lines.forEach((line, index) => {
		if (mouseInSquare(line.districts)) {
			over.districts = pencils[index];
		}
		if (mouseInSquare(line.stations)) {
			over.stations = pencils[index];
		}
		if (mouseInSquare(line.monuments)) {
			over.monuments = pencils[index];
		}
	});
}

function keyPressed() {
	if (key === "D") {
		toggleDebug = !toggleDebug;
	}
	if (keyCode === ESCAPE) {
		clickedStation = null;
	}
}
