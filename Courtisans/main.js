const uiManager = new UIManager();
const windowWidth = 1400;
const windowHeight = 900;
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

const COLOR = {
	CARPE: "carpe",
	LIEVRE: "lievre",
	ROSSIGNOL: "rossignol",
	CERF: "cerf",
	PAPILLON: "papillon",
	CRAPAUD: "crapaud",
};

const ROLE = {
	MURDER: "murder",
	PROTECT: "protect",
	NOBLE: "noble",
	SPY: "spy",
	CITIZEN: "citizen",
};

let cards = [];

function addRole(color, role, nb, index) {
	for (let i = 0; i < nb; i++) {
		cards.push({ color, role, index });
	}
}

function addFamily(color, index) {
	addRole(color, ROLE.MURDER, 2, index);
	addRole(color, ROLE.PROTECT, 3, index + 1);
	addRole(color, ROLE.NOBLE, 4, index + 2);
	addRole(color, ROLE.SPY, 2, index + 3);
	addRole(color, ROLE.CITIZEN, 4, index + 4);
}

function addCards() {
	let index = 0;
	addFamily(COLOR.CARPE, index);
	addFamily(COLOR.LIEVRE, index + 5);
	addFamily(COLOR.ROSSIGNOL, index + 10);
	addFamily(COLOR.CERF, index + 15);
	addFamily(COLOR.PAPILLON, index + 20);
	addFamily(COLOR.CRAPAUD, index + 25);
}

const GAME_LOADING_STATE = 0;
const GAME_START_STATE = 1;
const GAME_PLAY_STATE = 2;
const GAME_OVER_STATE = 3;
let curState = GAME_LOADING_STATE;
let toggleDebug = false;
let lastTime = 0;

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

	cards = [];
	addCards();
	shuffleArray(cards);
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
	windowWidth / 2 - 200,
	windowHeight - 100,
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

	frameRate(60);

	spritesheet.addSpriteSheet("main", "./main.png", 310, 575);
	spritesheet.addSpriteSheet("cover", "./cover.png", 260, 450);
	spritesheet.addSpriteSheet("cards", "./cards.png", 260, 450);
	// 4 nobles, 2 espions, 2 assassins, 3 gardes et 4 autres

	spritesheet.addSpriteSheet("missions", "./missions.png", 340, 230);

	spritesheet.addSpriteSheet("board", "./board.png", 2070, 560);

	lastTime = Date.now();
}

function updateGame(elapsedTime) {}

function drawGame() {
	spritesheet.drawScaledSprite("cards", 10, 440, 160, 0.75);
	spritesheet.drawScaledSprite("cards", 7, 800, 160, 0.75);
	spritesheet.drawScaledSprite("cards", 27, 260, 100, 0.75);
	spritesheet.drawScaledSprite("cards", 26, 260, 160, 0.75);

	spritesheet.drawScaledSprite(
		"board",
		0,
		(windowWidth - 2070 * 0.65) / 2,
		(windowHeight - 560 * 0.65) / 2,
		0.65
	);

	spritesheet.drawScaledSprite("cards", 0, 1160, 450, 0.75);
	spritesheet.drawScaledSprite("cards", 21, 65, 450, 0.75);
	spritesheet.drawScaledSprite("cards", 17, 973, 450, 0.75);
	spritesheet.drawScaledSprite("cards", 19, 973, 510, 0.75);

	spritesheet.drawScaledSprite("cover", 0, 617, 450, 0.75);

	// main
	spritesheet.drawScaledSprite("cards", cards[0].index, 410, 820, 0.75);
	spritesheet.drawScaledSprite("cards", cards[1].index, 610, 820, 0.75);
	spritesheet.drawScaledSprite("cards", cards[2].index, 810, 820, 0.75);
}

function initGame() {}

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
		spritesheet.drawSprite("main", 0, (windowWidth - 310) / 2, 20);
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

/* Randomize array in-place using Durstenfeld shuffle algorithm */
const shuffleArray = (array) => {
	for (var i = array.length - 1; i > 0; i--) {
		var j = Math.floor(Math.random() * (i + 1));
		var temp = array[i];
		array[i] = array[j];
		array[j] = temp;
	}
};
