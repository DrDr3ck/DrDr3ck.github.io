const uiManager = new UIManager();
uiManager.loggerContainer = new LoggerContainer(200, 200, 240, 100);
uiManager.loggerContainer.visible = true;

const toolManager = new ToolManager();
const jobManager = new JobManager();

let lastTime = 0;

function setup() {
	canvas = createCanvas(800, 600);
    canvas.parent('canvas');

    frameRate(60);

    uiManager.addLogger('This is a logger');
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