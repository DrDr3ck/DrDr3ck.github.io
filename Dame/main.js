const uiManager = new UIManager();
uiManager.loggerContainer = new LoggerContainer(600, 400, 240, 100);
uiManager.loggerContainer.visible = true;

const toolManager = new ToolManager();
const jobManager = new JobManager();

const GAME_START_STATE = 1;
const GAME_PLAY_STATE = 2;
let curState = GAME_START_STATE;

function startClicked() {
    curState = GAME_START_STATE;
}

const menu = [
	new BButton(100, 400, 'START', startClicked)
];
uiManager.setUI(menu);

let lastTime = 0;

function setup() {
	canvas = createCanvas(800, 600);
    canvas.parent('canvas');

    frameRate(60);

    uiManager.addLogger('Jeu de Dames');
    lastTime = Date.now();
}

function draw() {
    const currentTime = Date.now();
	const elapsedTime = currentTime - lastTime;
    background(51);

    uiManager.processInput();

    uiManager.update(elapsedTime);

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