const uiManager = new UIManager();
uiManager.loggerContainer = new LoggerContainer(550, 500, 250, 100);
uiManager.loggerContainer.visible = true;

const toolManager = new ToolManager();
const jobManager = new JobManager();

const GAME_START_STATE = 1;
const GAME_PLAY_STATE = 2;
const GAME_OVER_STATE = 3;
let curState = GAME_START_STATE;

let lastTime = 0;

let world = null;

function startClicked() {
	uiManager.addLogger('Click on enemies to kill them!');
	curState = GAME_PLAY_STATE;
	startButton.visible = false;
	world.init();
	world.initWave();
}

let startButton = null;

function preload() {}

function initUI() {
	startButton = new BButton(200, 200, 'START', startClicked);
	startButton.setTextSize(40);
	uiManager.setUI([ startButton ]);
}

function setup() {
	initUI();
	canvas = createCanvas(800, 600);
	canvas.parent('canvas');

	world = new World();

	frameRate(60);

	uiManager.addLogger('How long will you survive!');
	lastTime = Date.now();
}

function updateGame(elapsedTime) {
	world.update(elapsedTime);
}

function drawGame() {
	world.draw();
}

function draw() {
	const currentTime = Date.now();
	const elapsedTime = currentTime - lastTime;
	background(51);

	uiManager.processInput();
	uiManager.update(elapsedTime);

	// draw game
	if (curState === GAME_PLAY_STATE) {
		updateGame(elapsedTime);
	}
	drawGame();

	if (curState !== GAME_PLAY_STATE) {
		background(51, 51, 51, 200);
	}

	uiManager.draw();
	if (toolManager.currentTool) {
		toolManager.currentTool.draw();
	}
	jobManager.draw();

	lastTime = currentTime;
}

function mouseClicked() {
	if (curState === GAME_PLAY_STATE) {
		world.fireBullet(mouseX, mouseY);
	}
	toolManager.mouseClicked();
	uiManager.mouseClicked();
}

function keyPressed() {
	if (key === ' ') {
		world.enemies.push(new GroundEnemy(-10, 0.1, 5));
	}
	if (key === 'a') {
		world.enemies.push(new GroundEnemy(-10, 1, 20));
	}
}
