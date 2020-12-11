const uiManager = new UIManager();
uiManager.loggerContainer = new LoggerContainer(200, 200, 240, 100);
uiManager.loggerContainer.visible = true;

const toolManager = new ToolManager();
const jobManager = new JobManager();

const GAME_START_STATE = 1;
const GAME_PLAY_STATE = 2;
const GAME_OVER_STATE = 3;
let curState = GAME_START_STATE;

let lastTime = 0;

function preload() {
}

function initUI() {
}

function setup() {
    initUI();
	canvas = createCanvas(800, 600);
    canvas.parent('canvas');

    frameRate(60);

    uiManager.addLogger('This is a logger');
    lastTime = Date.now();
}

function updateGame(elapsedTime) {

}

function drawGame() {

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