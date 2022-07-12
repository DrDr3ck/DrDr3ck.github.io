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

let diceFace = randomInt(6);

const dinos = [0,0,0,0,0,0,1,1,1,1,1,1,2,2,2,2,2,2,3,3,3,3,3,3,4,4,4,4,4,4,5,5,5,5,5,5];

function preload() {
	spritesheet.addSpriteSheet('cover', './cover.png', 692, 550);
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

function randomInt(i) {
	return Math.floor(Math.random() * i);
}

function shuffleArray(array) {
	for (var i = array.length - 1; i > 0; i--) {
		var j = randomInt(i + 1);
		var temp = array[i];
		array[i] = array[j];
		array[j] = temp;
	}
}

function startClicked() {
	curState = GAME_PLAY_STATE;
	uiManager.setUI([ speakerButton, ruleButton, roleDiceButton ]);
	uiManager.addLogger("Start game");
	roleDiceButton.enabled = false;
}

const speakerButton = new BFloatingSwitchButton(windowWidth - 70 - 10 - 70, 70, '\uD83D\uDD0A', speakerClicked);
const musicButton = new BFloatingSwitchButton(windowWidth - 70, 70, '\uD83C\uDFB6', musicClicked);
const startButton = new BButton(80, windowHeight - 50 - 200, "START", startClicked);
const ruleButton = new BFloatingSwitchButton(windowWidth - 70, 70, '\u003F', () => {
	ruleButton.checked = !ruleButton.checked;
});
const roleDiceButton = new BFloatingButton(1000, 250, '\u2685', ()=>{
	soundManager.playSound('dice-rolling');
	diceFace = randomInt(6);
});

function initUI() {
    speakerButton.setTextSize(50);
	musicButton.setTextSize(50);
	ruleButton.setTextSize(50);
	ruleButton.checked = false;
	musicButton.enabled = false;
	musicButton.checked = false;
	const isSpeakerOn = localStorage.getItem(speakerStorageKey);
	if( isSpeakerOn === "off" ) {
		speakerButton.checked = false;
		soundManager.mute(true);
	}
	const menu = [ speakerButton, startButton, ruleButton ];
	uiManager.setUI(menu);
}

function setup() {
    initUI();
	canvas = createCanvas(windowWidth, windowHeight);
    canvas.parent('canvas');

	spritesheet.addSpriteSheet('board', './board.png', 691, 684);
	spritesheet.addSpriteSheet('rules', './rules.png', 730, 732);
	spritesheet.addSpriteSheet('dice', './dice.png', 36, 36);
	spritesheet.addSpriteSheet('dino', './dino.png', 150, 100);
	spritesheet.addSpriteSheet('enclos', './enclos.png', 599, 503);

	soundManager.addSound('dice-rolling', './dice-rolling.wav', 1);

    frameRate(60);

	shuffleArray(dinos);

    lastTime = Date.now();
}

function updateGame(elapsedTime) {

}

function drawGame() {
	spritesheet.drawSprite('board', 0, (windowHeight-684)/2, (windowHeight-684)/2);

	spritesheet.drawScaledSprite('dice', diceFace, 1100, 190, 1.5);

	spritesheet.drawSprite('dino', dinos[0], 860, 400);
	spritesheet.drawSprite('dino', dinos[1], 860+160, 400);
	spritesheet.drawSprite('dino', dinos[2], 860+320, 400);

	spritesheet.drawScaledSprite('dino', dinos[0], 770, 720, 0.25);
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
		spritesheet.drawSprite('cover', 0, (windowWidth-692)/2, (windowHeight-550)/2);
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

	if( ruleButton.checked ) {
		background(51, 51, 51, 200);
		spritesheet.drawSprite('rules', 0, (windowWidth-730)/2, (windowHeight-732)/2);
	}
    
    lastTime = currentTime;
}

function mouseClicked() {
	if( toggleDebug ) {
		uiManager.addLogger(`X=${mouseX}, Y=${mouseY}`);
	}
	if( ruleButton.checked ) {
		ruleButton.checked = false;
	} else {
		toolManager.mouseClicked();
		uiManager.mouseClicked();
	}
	return false;
}

function keyPressed() {
	if (key === "D") {
		toggleDebug = !toggleDebug;
	}
}