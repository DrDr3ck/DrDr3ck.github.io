const uiManager = new UIManager();
const windowWidth = 1200;
const windowHeight = 800;
uiManager.loggerContainer = new LoggerContainer(windowWidth-300, windowHeight-100, 240, 100);
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

let lastTime = 0;

function preload() {
}

function musicClicked() {
	// TODO
}

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

const FPS = 30;

function setup() {
    initUI();
	canvas = createCanvas(windowWidth, windowHeight);
    canvas.parent('canvas');

	frameRate(FPS);
	
	spritesheet.addSpriteSheet('wall', './DungeonWall.png', 32, 32);
	spritesheet.addSpriteSheet('player', './player.png', 24, 32);

    lastTime = Date.now();
}

function updateGame(elapsedTime) {
	world.update(elapsedTime);
}

function drawGame() {
	push();
	translate(128,14);
	world.draw();
	pop();
}

function initGame() {
	world = new World(32);
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
		uiManager.addLogger('Game loaded');		
	}
}

function draw() {
    const currentTime = Date.now();
	const elapsedTime = currentTime - lastTime;
    background(129,144,160);
    if (curState === GAME_LOADING_STATE) {
		drawLoading();
		return;
	}

	uiManager.processInput();
    uiManager.update(elapsedTime);

    // draw game
	if (curState === GAME_PLAY_STATE) {
		const verticalDirection = keyIsDown(68) ? "right" : (keyIsDown(81) ? "left" : "");
		const horizontalDirection = keyIsDown(90) ? "up" : (keyIsDown(83) ? "down" : "");
		world.player.stopMove();
		world.player.startMove(`${verticalDirection}${horizontalDirection}` || "idle");
		updateGame(elapsedTime);
	}
	drawGame();
	text(elapsedTime, 10,50);

    uiManager.draw();
	if (toolManager.currentTool) {
		toolManager.currentTool.draw();
	}
    jobManager.draw();
    
	lastTime = currentTime;
}

function mouseClicked() {
	toolManager.mouseClicked();
	uiManager.mouseClicked();
}