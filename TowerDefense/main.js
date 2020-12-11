const uiManager = new UIManager();
uiManager.loggerContainer = new LoggerContainer(600, 500, 200, 100);
uiManager.loggerContainer.visible = true;

const toolManager = new ToolManager();
const jobManager = new JobManager();

const GAME_START_STATE = 1;
const GAME_PLAY_STATE = 2;
const GAME_OVER_STATE = 3;
let curState = GAME_START_STATE;

let lastTime = 0;

function startClicked() {
	curState = GAME_PLAY_STATE;
    startButton.visible = false;
}
const startButton = new BButton(200, 200, 'START', startClicked);

function preload() {
}

function initUI() {
    startButton.setTextSize(40);
	uiManager.setUI([startButton]);
}

function setup() {
    initUI();
	canvas = createCanvas(800, 600);
    canvas.parent('canvas');

    frameRate(60);

    uiManager.addLogger('How long will you survive!');
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
	toolManager.mouseClicked();
	uiManager.mouseClicked();
}