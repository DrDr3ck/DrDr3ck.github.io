const uiManager = new UIManager();
const windowWidth = 1440;
const windowHeight = 900;
uiManager.loggerContainer = new LoggerContainer(windowWidth - 300, windowHeight - 100, 240, 100);
uiManager.loggerContainer.visible = true;

const toolManager = null;
const jobManager = null;
const soundManager = new SoundMgr();
const spritesheet = new SpriteSheet();

const GAME_LOADING_STATE = 0;
const GAME_START_STATE = 1;
const GAME_PLAY_STATE = 2;
const GAME_OVER_STATE = 3;
let curState = GAME_LOADING_STATE;

let lastTime = 0;

function preload() {}

function musicClicked() {
	// TODO
}

const FPS = 60;
let sprite = null;

function speakerClicked() {
	speakerButton.checked = !speakerButton.checked;
	soundManager.mute(!speakerButton.checked);
}

const speakerButton = new BFloatingButton(windowWidth - 70 - 10 - 70, 70, '\uD83D\uDD0A', speakerClicked);
const musicButton = new BFloatingButton(windowWidth - 70, 70, '\uD83C\uDFB6', musicClicked);

function initUI() {
	speakerButton.setTextSize(50);
	musicButton.setTextSize(50);
	musicButton.enabled = false;
	musicButton.checked = false;
	const menu = [ speakerButton, musicButton ];
	uiManager.setUI(menu);
}

function setup() {
    spritesheet.addSpriteSheet('world', './sprites.png', 32, 32);

	initUI();
	canvas = createCanvas(windowWidth, windowHeight);
	canvas.parent('canvas');

	frameRate(FPS);

	lastTime = Date.now();
}

function updateGame(elapsedTime) {}

function drawGame() {
    sprite.draw();
}

function initGame() {
    sprite = new Sprite(50, 50);
    sprite.addAnimation('idle', 'world', [ 0 ], FPS, true);
    sprite.addAnimation('wait1', 'world', [ 8,9,10,11,12,13,14,15 ], FPS, true);
    sprite.addAnimation('wait2', 'world', [ 16,17,18,19,20,21,22,23 ], FPS, true);
    sprite.playAnimation('wait2');
}

function drawLoading() {
	fill(0);
	noStroke();
	textSize(50);
	textAlign(CENTER, CENTER);
	text('Loading...', width / 2, height / 2);
	if (
		soundManager.maxLoadedSounds === soundManager.maxLoadingSounds &&
		spritesheet.maxLoadedImages === spritesheet.maxLoadingImages
	) {
		curState = GAME_START_STATE;

		// init game
		initGame();
		textAlign(LEFT, BASELINE);
		uiManager.addLogger('Finish him!!!');
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
    sprite.update(elapsedTime);

	// draw game
	if (curState === GAME_PLAY_STATE) {
		updateGame(elapsedTime);
	}
	drawGame();

	uiManager.draw();
	if (toolManager && toolManager.currentTool) {
		toolManager.currentTool.draw();
	}
	if (jobManager) {
		jobManager.draw();
	}

	lastTime = currentTime;
}

function mouseClicked() {
	if (toolManager) {
		toolManager.mouseClicked();
	}
	uiManager.mouseClicked();
}
