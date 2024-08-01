const uiManager = new UIManager();
const windowWidth = 1400;
const windowHeight = 800;
uiManager.loggerContainer = new LoggerContainer(
	windowWidth - 300,
	windowHeight - 100,
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

let seed = 0;

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
	80,
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
	spritesheet.addSpriteSheet("cards", "./cards.png", 325, 210);
	spritesheet.addSpriteSheet("crayons", "./crayons.png", 93, 93);

	frameRate(60);

	lastTime = Date.now();
}

function updateGame(elapsedTime) {}

function displayStation(station) {
	stroke(110, 160, 130);
	if (station.color === COLORS.BLUE) {
		stroke(50, 50, 130);
	}
	strokeWeight(5);
	if (station.monument) {
		fill(160, 110, 130);
	} else {
		noFill();
	}
	const X = (station.position.x - 1) * ((747 - 53) / 9) + 53;
	const Y = (station.position.y - 1) * ((747 - 53) / 9) + 50;
	ellipse(X, Y, 40);
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
}

let stations = [];

function drawGame() {
	spritesheet.drawSprite("paris", 0, 15, 15);

	spritesheet.drawSprite("cards", 0, 815, 15);

	spritesheet.drawSprite("crayons", 0, 1200, 120);

	// debug
	stations.forEach((element) => {
		displayStation(element);
	});
	// end debug
}

function initGame() {
	stations = getStations();
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

function mouseClicked() {
	if (toggleDebug) {
		uiManager.addLogger(`X=${mouseX}, Y=${mouseY}`);
	}
	toolManager.mouseClicked();
	uiManager.mouseClicked();
	return false;
}

function keyPressed() {
	if (key === "D") {
		toggleDebug = !toggleDebug;
	}
}
