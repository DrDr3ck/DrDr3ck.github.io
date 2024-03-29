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

let randomizer = null;

const GAME_LOADING_STATE = 0;
const GAME_START_STATE = 1;
const GAME_PLAY_STATE = 2;
const GAME_OVER_STATE = 3;
let curState = GAME_LOADING_STATE;
let toggleDebug = false;
let lastTime = 0;

let overPlayerCardIndex = -1;
let overResourceCardIndex = -1;

function preload() {
	spritesheet.addSpriteSheet("cover", "./cover.jpg", 977, 1000);
}

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
const startButton = new BButton(80, windowHeight - 50, "START", startClicked);

const cards = [
	new Card(COLOR.ORANGE),
	new Card(COLOR.BLUE),
	new Card(COLOR.GREEN),
	new Card(COLOR.PURPLE),
];

cards[0].setCenter(COLOR.ORANGE);
cards[1].setCenter(COLOR.BLUE);
cards[2].setCenter(COLOR.GREEN);
cards[3].setCenter(COLOR.PURPLE);
cards[0].setPoints("1");
cards[1].setPoints(OBJECT.FEATHER);
cards[2].setPoints("corner");
cards[3].setPoints("5");
cards[0].setCorners(
	{ value: null },
	null,
	{ value: COLOR.ORANGE },
	{ value: OBJECT.INKWELL }
);

cards[1].setCorners({ value: OBJECT.PARCHMENT }, { value: COLOR.BLUE }, null, {
	value: null,
});

cards[2].setCorners(
	{ value: OBJECT.FEATHER },
	null,
	{ value: COLOR.PURPLE },
	{
		value: COLOR.GREEN,
	}
);

cards[2].setCost([COLOR.GREEN, COLOR.GREEN, COLOR.GREEN]);

let board = null;

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

	frameRate(15);

	spritesheet.addSpriteSheet("objects", "./objects.png", 45, 45);
	spritesheet.addSpriteSheet("centers", "./centers.png", 70, 70);
	spritesheet.addSpriteSheet("corners", "./corners.png", 54, 65);
	spritesheet.addSpriteSheet("points", "./points.png", 80, 35);
	spritesheet.addSpriteSheet("resources", "./resources.png", 45, 45);
	spritesheet.addSpriteSheet(
		"objective_cards",
		"./objective_cards.png",
		210,
		140
	);
	spritesheet.addSpriteSheet("verso_cards", "./verso_cards.png", 210, 140);
	spritesheet.addSpriteSheet(
		"background_cards",
		"./background_cards.png",
		210,
		140
	);

	lastTime = Date.now();
}

function updateGame(elapsedTime) {}

function drawGame() {
	board.draw(overPlayerCardIndex, overResourceCardIndex);
}

function initGame() {
	board = new Board();
	randomizer = new Randomizer(); // TODO
	board.initCards();
}

function drawLoading() {
	fill(0);
	spritesheet.drawScaledSprite(
		"cover",
		0,
		(windowWidth - 977 * 0.8) / 2,
		0,
		0.8
	);
	noStroke();
	textSize(50);
	textAlign(CENTER, CENTER);
	fill(250);
	text("Loading...", width / 2 - 2, height / 2 - 2);
	textAlign(CENTER, CENTER);
	fill(0);
	text("Loading...", width / 2, height / 2);
	if (
		soundManager.totalLoadedSounds === soundManager.soundToLoad &&
		spritesheet.totalLoadedImages === spritesheet.totalImagesToLoad
	) {
		curState = GAME_START_STATE;

		// init game
		initGame();
		textAlign(LEFT, BASELINE);
		uiManager.addLogger("Ce jeu n'est pas sponsorisé par Bombyx");
		uiManager.addLogger("Auteur: Thomas Dupont");
		uiManager.addLogger("Illustrateur: Maxime Morin");
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
		spritesheet.drawScaledSprite(
			"cover",
			0,
			(windowWidth - 977 * 0.8) / 2,
			0,
			0.8
		);
		cards[0].draw(50, 100);
		cards[1].draw(1150, 100);
		cards[2].draw(50, 250);
		cards[3].drawVerso(1150, 250);
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

// check if mouse is over one of the 3 cards of the player
function isOverPlayerCard() {
	return board.isOverPlayerCard(mouseX, mouseY);
}

// check if mouse is over one of the 6 resource cards
function isOverResourceCard() {
	return board.isOverResourceCard(mouseX, mouseY);
}

function mouseClicked() {
	if (toggleDebug) {
		uiManager.addLogger(`X=${mouseX}, Y=${mouseY}`);
	}
	toolManager.mouseClicked();
	uiManager.mouseClicked();
	return false;
}

function mouseMoved() {
	overPlayerCardIndex = isOverPlayerCard();
	overResourceCardIndex = isOverResourceCard();
}

function keyPressed() {
	if (key === "D") {
		toggleDebug = !toggleDebug;
	}
}
