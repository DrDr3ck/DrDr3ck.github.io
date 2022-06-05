const uiManager = new UIManager();
const windowWidth = 1400;
const windowHeight = 800;
uiManager.loggerContainer = new LoggerContainer(50, windowHeight-100, 240, 100);
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

const diceButtons = [];

function preload() {
	spritesheet.addSpriteSheet('rules', './resources/rules.jpg', 692, 305);
}

function musicClicked() {
	// TODO
}

class BDiceButton extends BImageButton {
	constructor(x, y, img, callback) {
		super(x, y, img, callback);
		this.value = 0;
		this.used = false;
	}

	setValue(value) {
		this.value = value;
		this.img = spritesheet.getImage('dice', value);
	}

	doDraw() {		
		super.doDraw();
	}

	click() {
		if( this.used ) {
			this.used = false;
			this.y -= 100;
		} else {
			this.used = true;
			this.y += 100;
		}
	}
}

const speakerStorageKey = 'DrDr3ck/KingOfTokyo/Speaker';
function speakerClicked() {
	speakerButton.checked = !speakerButton.checked;
	soundManager.mute(!speakerButton.checked);
	localStorage.setItem(speakerStorageKey, speakerButton.checked?"on":"off");
}

function startClicked() {
	const diceX = 647-249;
	const diceY = 100;
	for( let i=0; i < 6; i++ ) {
		diceButtons.push(new BDiceButton(diceX+75*i, diceY, spritesheet.getImage('dice', 0), ()=>{
			diceButtons[i].click();
		}));
	}
	curState = GAME_PLAY_STATE;
	uiManager.setUI([ speakerButton, rulesButton, roleDiceButton, ...diceButtons ]);
	diceButtons.forEach(d=>{
		d.visible = false;
		d.used = false;
	});
	uiManager.addLogger("Start game");
}

let displayRules = false;

const speakerButton = new BFloatingSwitchButton(windowWidth - 70 - 10 - 70, 70, '\uD83D\uDD0A', speakerClicked);
const musicButton = new BFloatingSwitchButton(windowWidth - 70, 70, '\uD83C\uDFB6', musicClicked);
const startButton = new BButton(80, windowHeight - 50 - 200, "START", startClicked);
const rulesButton = new BFloatingButton(windowWidth - 70, 70, '?', ()=>{
	// display/hide rules
	displayRules = !displayRules;
	if( displayRules ) {
		rulesButton.enabled = false;
		speakerButton.enabled = false;
		startButton.visible = false;
	}
});
const roleDiceButton = new BFloatingButton(831-249, 80, '\u2685', ()=>{
	soundManager.playSound('dice-rolling');
	diceButtons.forEach(d=>{
		d.visible = true;
		if( !d.used ) {
			d.setValue(Math.floor(Math.random()*6))
		}
	});
});

function initUI() {
    speakerButton.setTextSize(50);
	rulesButton.setTextSize(50);
	musicButton.setTextSize(50);
	musicButton.enabled = false;
	musicButton.checked = false;
	const isSpeakerOn = localStorage.getItem(speakerStorageKey);
	if( isSpeakerOn === "off" ) {
		speakerButton.checked = false;
		soundManager.mute(true);
	}
	const menu = [ speakerButton, startButton, rulesButton ];
	uiManager.setUI(menu);
}

function setup() {
    initUI();
	canvas = createCanvas(windowWidth, windowHeight);
    canvas.parent('canvas');

	spritesheet.addSpriteSheet('board', './resources/board.jpg', 455, 730);
	spritesheet.addSpriteSheet('fiches', './resources/fiches.png', 435, 344);
	spritesheet.addSpriteSheet('monsters', './resources/monsters.png', 365, 350);
	spritesheet.addSpriteSheet('dice', './resources/dice.png', 73, 73);
	soundManager.addSound('dice-rolling', './resources/dice-rolling.wav', 1);

    frameRate(20);

    lastTime = Date.now();
}

function updateGame(elapsedTime) {

}

function drawGame() {
	spritesheet.drawScaledSprite('board', 0, 10, 10, 0.85);

	const monsterX = 1100-249;
	spritesheet.drawScaledSprite('fiches', 0, monsterX, 10, 0.75);
	spritesheet.drawScaledSprite('fiches', 1, monsterX, 10+344*.75+5, 0.75);
	spritesheet.drawScaledSprite('fiches', 2, monsterX, 10+344*2*.75+10, 0.75);

	// spritesheet.drawScaledSprite('monsters',0,6,130,0.75);
	textAlign(CENTER, CENTER);
	textSize(15);
	stroke(250);
	fill(51);
	text("0", 942, 30);
	text("0", 942, 292);
	text("0", 942, 554);

	stroke(51);
	fill(250);
	text("10", 1115, 250);
	text("10", 1115, 510);
	text("10", 1124, 773);
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

	if( displayRules ) {
		background(51, 51, 51, 200);
		spritesheet.drawSprite('rules', 0, windowWidth/2-692/2, windowHeight/2-305/2);
	}

    uiManager.draw();
	if (toolManager.currentTool) {
		toolManager.currentTool.draw();
	}
    jobManager.draw();
    
    lastTime = currentTime;
}

function mouseClicked() {
	if( displayRules ) {
		displayRules = !displayRules;
		rulesButton.enabled = true;
		speakerButton.enabled = true;
		startButton.visible = true;
		return;
	}
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