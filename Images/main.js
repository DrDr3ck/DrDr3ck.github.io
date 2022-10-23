const imageWidth = 325;
const imageHeight = 300;

const uiManager = new UIManager();
const windowWidth = imageWidth*5;
const windowHeight = imageHeight*2.5;
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
let toggleDebug = false;

const images = [];

let delta = {X: 0, Y:0};

function preload() {
	spritesheet.addSpriteSheet('image', '../BatisseursMulti/batiments06.png', 1021, 683);
}

function musicClicked() {
	// TODO
}

const speakerStorageKey = 'DrDr3ck/GameEngine/Speaker';

function initUI() {
	uiManager.setUI([]);
}

function setup() {
    initUI();
	canvas = createCanvas(windowWidth, windowHeight);
    canvas.parent('canvas');

	frameRate(20);
}

function drawGame() {
	spritesheet.drawSprite("image", 0, 0, 0);

	images.forEach((image,i)=>{
		copy(image.X, image.Y, imageWidth, imageHeight, imageWidth*i, 0, imageWidth, imageHeight);
	});

	stroke(0);
	strokeWeight(1);
	noFill();

	rect(mouseX+delta.X, mouseY+delta.Y, imageWidth, imageHeight);
}

function initGame() {

}

function drawLoading() {
	fill(0);
	noStroke();
	textSize(50);
	textAlign(CENTER, CENTER);
	text('Loading...', width / 2, height / 2);
	if (
		soundManager.totalLoadedSounds === soundManager.soundToLoad &&
		spritesheet.totalLoadedImages === spritesheet.totalImagesToLoad
	) {
		curState = GAME_START_STATE;

        // init game
        initGame();
		textAlign(LEFT, BASELINE);
		uiManager.addLogger('Game loaded');
	}
}

function draw() {
    background(51);
    if (curState === GAME_LOADING_STATE) {
		drawLoading();
		return;
	}

    uiManager.processInput();

    // draw game
	if( curState === GAME_START_STATE ) {
		drawGame();
	}

    uiManager.draw();
	if (toolManager.currentTool) {
		toolManager.currentTool.draw();
	}
    jobManager.draw();
}

function mouseClicked() {
	if( toggleDebug ) {
		uiManager.addLogger(`X=${mouseX}, Y=${mouseY}`);
	}

	images.push({
		X: mouseX+delta.X,
		Y: mouseY+delta.Y
	});

	delta = {X: 0, Y:0};

	toolManager.mouseClicked();
	uiManager.mouseClicked();
	return false;
}

function keyPressed() {
	if (key === "D") {
		toggleDebug = !toggleDebug;
	}

	if( keyCode === DELETE && images.length > 0 ) {
		images.pop();
	}

	if( keyCode === UP_ARROW ) {
		delta = {X: delta.X, Y:delta.Y-1};
	}
	if( keyCode === DOWN_ARROW ) {
		delta = {X: delta.X, Y:delta.Y+1};
	}
	if( keyCode === LEFT_ARROW ) {
		delta = {X: delta.X-1, Y:delta.Y};
	}
	if( keyCode === RIGHT_ARROW ) {
		delta = {X: delta.X+1, Y:delta.Y};
	}
}