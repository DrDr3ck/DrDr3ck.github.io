const uiManager = new UIManager();
const windowWidth = 1600;
const windowHeight = 1000;
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

function preload() {
	spritesheet.addSpriteSheet('cover', './cover.png', 630, 460);
	spritesheet.addSpriteSheet('avenia', './avenia.png', 1680, 1405);
}

function musicClicked() {
	// TODO
}

const speakerStorageKey = 'DrDr3ck/GuildeMarchande/Speaker';
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
const startButton = new BButton(140, windowHeight - 120, "START", startClicked);

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

    frameRate(60);

    lastTime = Date.now();
}

function updateGame(elapsedTime) {

}

function debugDrawCase(x,y) {
	const dx = 0;//100;
	const dy = 0;//50;
	/*
	beginShape();
	vertex(x+dx, y+31+24+dy);
	vertex(x-15+dx, y+31+dy);
	vertex(x+dx, y+dy);
	vertex(x+33+dx, y+dy);
	vertex(x+33+15+dx, y+31+dy);
	vertex(x+33+dx, y+31+24+dy);
	endShape(CLOSE);
	*/
	ellipse(x+16+dx,y+30+dy,45);
}

function debugDrawBoard() {
	noFill();
	stroke(0);
	debugDrawCase(206,119);
	debugDrawCase(395,225);
	debugDrawCase(443,199);
	debugDrawCase(488,172);
	debugDrawCase(675,121);
}


function drawGame() {
	spritesheet.drawScaledSprite("avenia", 0, 0, 0, 0.65);
	debugDrawBoard();
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
		spritesheet.drawScaledSprite("cover", 0, 125, 0, 1.75);
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

function keyPressed() {
	if (key === "D") {
		toggleDebug = !toggleDebug;
	}
}