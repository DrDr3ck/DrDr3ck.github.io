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
let world = null;

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

function updateGame(elapsedTime) {
	world.update(elapsedTime);
}

function drawGame() {
	world.draw();
}

function initGame() {
	world = new World();

	// add walls
	world.platforms.push(new Platform(300,windowHeight-100,200,10));
	world.platforms.push(new Platform(100,windowHeight-200,200,20));
	world.platforms.push(new Platform(300,windowHeight-250,200,10));
	world.platforms.push(new Platform(300,windowHeight-400,200,10));
	world.platforms.push(new Platform(300,windowHeight-550,200,10));

	world.walls.push(new Wall(550,100,10,windowHeight));
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
		curState = GAME_PLAY_STATE; //GAME_START_STATE;

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

	if (keyIsDown(LEFT_ARROW)) {
		if (world.player.sprite.state !== 'left') {
			world.player.sprite.playAnimation('left');
			world.player.vx = -3;
			world.player.inMove = true;
		}
	} else if (keyIsDown(RIGHT_ARROW)) {
		if (world.player.sprite.state !== 'right') {
			world.player.sprite.playAnimation('right');
			world.player.vx = 3;
			world.player.inMove = true;
		}
	}

	if (keyIsDown(UP_ARROW)) {
		// JUMP
		if (!world.player.inMove) {
			world.player.vy = -17.5;
			world.player.inMove = true;
		}
	}

	// draw game
	if (curState === GAME_PLAY_STATE) {
		updateGame(elapsedTime);
		drawGame();
	}

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

function keyPressed() {
	if (key === 'm' || key === 'M') {
		musicClicked();
	}
	if (key === 's' || key === 'S') {
		speakerClicked();
	}
}

function keyReleased() {
	world.player.sprite.playAnimation('idle');
	world.player.vx = 0;
}
