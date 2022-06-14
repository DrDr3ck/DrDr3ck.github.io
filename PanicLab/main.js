const uiManager = new UIManager();
const windowWidth = 1400;
const windowHeight = 800;
uiManager.loggerContainer = new LoggerContainer(windowWidth-500, windowHeight-300, 240, 100);
uiManager.loggerContainer.visible = true;

const toolManager = new ToolManager();
const jobManager = new JobManager();
const soundManager = new SoundMgr();
const spritesheet = new SpriteSheet();

let selectedCardIndex = -1;
let monsterIndex = -1;

const GAME_LOADING_STATE = 0;
const GAME_START_STATE = 1;
const GAME_PLAY_STATE = 2;
const GAME_OVER_STATE = 3;
let curState = GAME_LOADING_STATE;
let toggleDebug = false;
let lastTime = 0;

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
	uiManager.setUI([ speakerButton, musicButton, roleDiceButton ]);
	uiManager.addLogger("Start game");
}

const speakerButton = new BFloatingSwitchButton(windowWidth - 70 - 10 - 70, 70, '\uD83D\uDD0A', speakerClicked);
const musicButton = new BFloatingSwitchButton(windowWidth - 70, 70, '\uD83C\uDFB6', musicClicked);
const startButton = new BButton(250, windowHeight - 50 - 200, "START", startClicked);

const roleDiceButton = new BFloatingButton(666, 80, '\u2685', ()=>{
	board.roleDices();
	roleDiceButton.enabled = false;
	selectedCardIndex = -1;
	monsterIndex = board.getMonster();
});

const resetDice = () => {
	roleDiceButton.enabled = true;
	selectedCardIndex = -1;
	monsterIndex = -1;
}

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

	spritesheet.addSpriteSheet('cards', './cards.png', 205, 205);
	spritesheet.addSpriteSheet('dices', './dices.png', 70, 70);

    frameRate(60);

    lastTime = Date.now();
}

function updateGame(elapsedTime) {

}

let board = null;

const Y100 = 100;
const Y600 = 660;
const cardPositions = 
	[
		{X:5,Y:Y100}, {X:220-75,Y:Y100}, {X:360-75,Y:Y100}, {X:500-75,Y:Y100}, {X:640-75,Y:Y100},
		{X:780-75,Y:Y100}, {X:920-75,Y:Y100}, {X:1060-75,Y:Y100}, {X:1200-75,Y:Y100}, {X:1340-75,Y:Y100},
		{X:1340-75-10,Y:240}, {X:1340-75-20,Y:380}, {X:1340-75-30,Y:520}, {X:1200,Y:Y600}, {X:1060,Y:Y600}, {X:920,Y:Y600}, {X:780,Y:Y600}, {X:640,Y:Y600},
		{X:500,Y:Y600}, {X:360,Y:Y600}, {X:220,Y:Y600}, {X:80,Y:Y600}, {X:80-20,Y:520}, {X:80-40,Y:380}, {X:80-60,Y:240},
	]

function drawGame() {
	cardPositions.forEach((c,i)=>spritesheet.drawScaledSprite('cards', board.cards[i].cardIndex, c.X, c.Y, 0.65));

	noFill();
	stroke(0);
	strokeWeight(3);
	board.dices.forEach((d,i)=>{
		spritesheet.drawScaledSprite('dices', board.dices[i].getFace().index, 460+100*i, 380, 1)
		rect(460+100*i, 380,70, 70, 5);
	});
}

function initGame() {
	board = new Board();
	board.init();
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
		cardPositions.forEach(c=>spritesheet.drawScaledSprite('cards', 17, c.X, c.Y, 0.65));
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
	const cardWidth = 205*0.65;
	cardPositions.forEach((c,i)=>{
		if( mouseX > c.X && mouseX < c.X+cardWidth && mouseY > c.Y && mouseY < c.Y+cardWidth ) {
			uiManager.addLogger(board.cards[i].type);
			resetDice();
		}
	});
	toolManager.mouseClicked();
	uiManager.mouseClicked();
	return false;
}

function keyPressed() {
	if (key === "D") {
		toggleDebug = !toggleDebug;
	}
}