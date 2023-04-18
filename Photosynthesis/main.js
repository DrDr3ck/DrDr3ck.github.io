const uiManager = new UIManager();
const windowWidth = 1600;
const windowHeight = 900;
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
let lastTime = 0;

let overTileIndex = -1;
let ringTileIndices = [];

function preload() {
}

function musicClicked() {
	// TODO
}

const speakerStorageKey = 'DrDr3ck/GameEngine/Speaker';
function speakerClicked() {
	speakerButton.checked = !speakerButton.checked;
	soundManager.mute(!speakerButton.checked);
	localStorage.setItem(speakerStorageKey, speakerButton.checked?"on":"off");
}

function startClicked() {
	curState = GAME_PLAY_STATE;
	uiManager.setUI([ speakerButton, musicButton ]);
	uiManager.addLogger("Start game");
}

const speakerButton = new BFloatingSwitchButton(windowWidth - 70 - 10 - 70, 70, '\uD83D\uDD0A', speakerClicked);
const musicButton = new BFloatingSwitchButton(windowWidth - 70, 70, '\uD83C\uDFB6', musicClicked);
const startButton = new BButton(80, windowHeight - 50 - 200, "START", startClicked);

function initUI() {
    speakerButton.setTextSize(50);
	musicButton.setTextSize(50);
	musicButton.enabled = false;
	musicButton.checked = false;
	const isSpeakerOn = localStorage.getItem(speakerStorageKey);
	if( isSpeakerOn === "off" ) {
		speakerButton.checked = false;
		soundManager.mute(true);
	}
	const menu = [ speakerButton, startButton, musicButton ];
	uiManager.setUI(menu);
}

function setup() {
    initUI();
	canvas = createCanvas(windowWidth, windowHeight);
    canvas.parent('canvas');

	spritesheet.addSpriteSheet('board', './board.png', 850, 850);

    frameRate(60);

    lastTime = Date.now();
}

function updateGame(elapsedTime) {

}

const radius = 120;
const tiles = [
	{X:475, Y:455, index: 18, leaf: 4}, {X:475+122, Y:455, index: 19, leaf: 3},
	{X:475+244, Y:455, index: 20, leaf: 2}, {X:475+366, Y:455, index: 21, leaf: 1}, {X:475-122, Y:455, index: 17, leaf: 3}, {X:475-244, Y:455, index: 16, leaf: 2},
	{X:475-366, Y:455, index: 15, leaf: 1}, {X:165, Y:560, index: 22, leaf: 1}, {X:165+122, Y:560, index: 23, leaf: 2},
	{X:165+244, Y:560, index: 24, leaf: 3}, {X:165+366, Y:560, index: 25, leaf: 3}, {X:165+488, Y:560, index: 26, leaf: 2}, {X:165+488+122, Y:560, index: 27, leaf: 1},
	{X:165, Y:348, index: 9, leaf: 1},{X:165+122, Y:348, index: 10, leaf: 2},{X:165+244, Y:348, index: 11, leaf: 3},
	{X:165+366, Y:348, index: 12, leaf: 3},{X:165+488, Y:348, index: 13, leaf: 2},{X:165+488+122, Y:348, index: 14, leaf: 1},
	{X:230, Y:240, index: 4, leaf: 1}, {X:230+122, Y:240, index: 5, leaf: 2}, {X:230+244, Y:240, index: 6, leaf: 2}, {X:230+366, Y:240, index: 7, leaf: 2}, {X:230+488, Y:240, index: 8, leaf: 1},
	{X:230, Y:665, index: 28, leaf: 1}, {X:230+122, Y:665, index: 29, leaf: 2}, {X:230+244, Y:665, index: 30, leaf: 2}, {X:230+366, Y:665, index: 31, leaf: 2}, {X:230+488, Y:665, index: 32, leaf: 1},
	{X:285, Y:775, index: 33, leaf: 1}, {X:285+122, Y:775, index: 34, leaf: 1}, {X:285+244, Y:775, index: 35, leaf: 1}, {X:285+366, Y:775, index: 36, leaf: 1},
	{X:285, Y:135, index: 0, leaf: 1}, {X:285+122, Y:135, index: 1, leaf: 1}, {X:285+244, Y:135, index: 2, leaf: 1}, {X:285+366, Y:135, index: 3, leaf: 1}
];

function displayTiles() {
	fill(150,250,150,150);
	stroke(0);
	strokeWeight(1);
	textSize(20);
	textAlign(CENTER, CENTER);
	tiles.forEach(tile=>{
		if( overTileIndex === tile.index ) {
			strokeWeight(3);
		} else {
			strokeWeight(1);
		}
		ellipse(tile.X,tile.Y,radius,radius);
	});
	noStroke();
	fill(0);
	tiles.forEach(tile=>{
		if( tile.index !== undefined ) {
			text(tile.index, tile.X, tile.Y);
		}
	});
}

function displayNeighbor(tileIndex, ring) {
	// find coordinate for tileIndex
	fill(250,250,150,150);
	stroke(0);
	strokeWeight(2);
	const curTile = tiles.find(tile=>tile.index === tileIndex);
	tiles.forEach(tile=>{
		if( distance(curTile.X, curTile.Y, tile.X, tile.Y) <= ring*radius*1.1 ) {
			ellipse(tile.X,tile.Y,radius,radius);
		}
	});
}

function drawGame() {
	spritesheet.drawSprite("board", 0, 50, 20);
	displayTiles();
	if( overTileIndex !== -1 ) {
		displayNeighbor(overTileIndex, 1);
	}
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
	if( curState === GAME_START_STATE ) {
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
	if( toggleDebug ) {
		uiManager.addLogger(`X=${mouseX}, Y=${mouseY}`);
	}
	toolManager.mouseClicked();
	uiManager.mouseClicked();
	return false;
}

const distance = (x1, y1, x2, y2) => {
	return sqrt(pow(x2 - x1, 2) + pow(y2 - y1, 2));
}

function mouseMoved() {
	overTileIndex = -1;
	tiles.forEach(tile=>{
		if( distance(mouseX, mouseY, tile.X, tile.Y) <= radius/2.5 ) {
			overTileIndex = tile.index;
		}
	})
}

function keyPressed() {
	if (key === "D") {
		toggleDebug = !toggleDebug;
	}
}