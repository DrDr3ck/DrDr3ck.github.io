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

let stationLine = [];

let overStation = null;
let clickedStation = null;

let seed = Math.random();

let pencils = [COLORS.GREEN, COLORS.BLUE, COLORS.ORANGE, COLORS.PURPLE];

let round = 0;

let cardArray = [];

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
}

function displayStation(station, over = false) {
	stroke(110, 160, 130);
	const color = over ? pencils[round] : station.color;
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
	if (station.monument && !over) {
		fill(160, 110, 130);
	} else {
		noFill();
	}
	const X = getX(station.position.x);
	const Y = getY(station.position.y);
	ellipse(X, Y, over ? 45 : 40);
	if (!over) {
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

function getCurrentColor() {
	switch (pencils[round]) {
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

function displayLine() {
	stationLine.forEach((station) => displayStation(station));
}

function getCrossedDistricts(stationLine) {
	const districts = [];
	stationLine.forEach((station) => {
		const district = station.district;
		if (!districts.includes(district)) {
			districts.push(district);
		}
	});
	return districts.length;
}
function getMaxStation(stationLine) {
	const districts = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
	stationLine.forEach((station) => {
		const district = station.district;
		districts[district]++;
	});
	return districts.reduce((previous, cur) => {
		if (cur > previous) {
			return cur;
		}
		return previous;
	}, 0);
}

function getMonument(stationLine) {
	let monuments = 0;
	stationLine.forEach((station) => {
		if (station.monument) {
			monuments++;
		}
	});
	return monuments;
}

function drawScore() {
	textAlign(CENTER, CENTER);
	strokeWeight(1);
	const colors = getCurrentColor();
	stroke(colors[0], colors[1], colors[2]);
	fill(colors[0], colors[1], colors[2]);
	textSize(20);
	const districs = getCrossedDistricts(stationLine);
	const maxStation = getMaxStation(stationLine);
	const monument = getMonument(stationLine);
	if (round === 0) {
		text(districs, 910 - 30, 400 + 135);
		text(maxStation, 910 - 30, 455 + 135);
		text(monument, 910 - 30, 510 + 135);
		text(districs * maxStation + monument * 2, 910 - 30, 565 + 135);
	}
}

function drawLine(station) {
	const X = getX(station.position.x);
	const Y = getY(station.position.y);
	const colors = getCurrentColor();
	stroke(colors[0], colors[1], colors[2]);
	strokeWeight(3);
	line(X, Y, mouseX, mouseY);
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

	spritesheet.drawSprite("cards", cards[0].index, 815, 15);

	displayPencil();

	displayLine();

	if (overStation) {
		displayStation(overStation, true);
	}

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
		displayStation(element);
	});
	// end debug*/
}

function initGame() {
	const map = buildMap();
	stations = map.stations;
	sections = map.sections;

	cards = getCards();

	// debug
	//startClicked();
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
		if (station.onBorder()) {
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

function mouseClicked() {
	if (toggleDebug) {
		uiManager.addLogger(`X=${mouseX}, Y=${mouseY}`);
	}
	toolManager.mouseClicked();
	uiManager.mouseClicked();

	if (overStation) {
		console.log("overStation is clicked:", overStation);
		if (clickedStation !== overStation) {
			// check if station is clickable !!
			if (isClickable(overStation)) {
				if (!clickedStation) {
					clickedStation = overStation;
				} else {
					// draw line
					const section = findSection(clickedStation, overStation);
					section.color = pencils[round];
					stationLine.push(overStation);
					clickedStation = null;
				}
			}
		} else {
			clickedStation = null;
		}
	}
	return false;
}

function isOverStation(station) {
	const X = getX(station.position.x);
	const Y = getY(station.position.y);
	return distance(X, Y, mouseX, mouseY) < 20;
}

function mouseMoved() {
	overStation = null;
	stations.forEach((station) => {
		if (isOverStation(station)) {
			overStation = station;
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
