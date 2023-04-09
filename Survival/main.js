const uiManager = new UIManager();
const windowWidth = 1400;
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
let toggleDebug = false;
let lastTime = 0;

/*****************************/

let curDate = {
	day: 1,
	hour: 0,
	min: 0,
	milli: 0
};

let stock = [
	{ 
		type: "food",
		value: 10
	},
	{	
		type: "water",
		value: 5
	}
];

/*****************************/

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

    frameRate(60);

    lastTime = Date.now();
}

function displayDate() {
	stroke(0);
	fill(0);
	rect(5,5,130+10*Math.floor(Math.log10(curDate.day)),30);
	fill(220,8,18);
	textSize(20);
	textAlign(LEFT, TOP);
	text(`Day ${curDate.day} - ${curDate.hour < 10 ? '0' : ''}${curDate.hour}:${curDate.min < 10 ? '0' : ''}${curDate.min}`, 10, 10);
}

function displayStock() {
	const food = stock.filter(s=>s.type==="food")[0].value || 0;
	const water = stock.filter(s=>s.type==="water")[0].value || 0;
	noStroke();
	fill(0);
	rect(300-5,750-5,80+10*Math.floor(Math.log10(food)),30);
	rect(400-5,750-5,85+10*Math.floor(Math.log10(water)),30);
	stroke(0);
	fill(22,168,194);
	textSize(20);
	textAlign(LEFT, TOP);
	text(`Food: ${food}`,300,750);
	text(`Water: ${water}`,400,750);
}

function updateGame(elapsedTime) {
	const min = 500;
	curDate.milli += elapsedTime;
	while( curDate.milli > min ) {
		curDate.milli -= min;
		curDate.min += 1;
	}
	if( curDate.min >= 60 ) {
		curDate.min -= 60;
		curDate.hour += 1;
	}
	if( curDate.hour >= 24 ) {
		curDate.hour -= 24;
		curDate.day += 1;
	}
}

function drawGame() {
	displayDate();
	displayStock();
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

function keyPressed() {
	if (key === "D") {
		toggleDebug = !toggleDebug;
	}
}