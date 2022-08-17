const uiManager = new UIManager();
const windowWidth = 1800;
const windowHeight = 1000;
uiManager.loggerContainer = new LoggerContainer(windowWidth-300, windowHeight-100, 240, 100);
uiManager.loggerContainer.visible = true;

const toolManager = new ToolManager();
const jobManager = new JobManager();
const soundManager = new SoundMgr();
const spritesheet = new SpriteSheet();

const soutiens = [
	["financiers"], ["generaux"], ["financiers","generaux"], ["financiers"], ["generaux"]
];

const cards = [0,0,0,0,1,1,2,2,2,2,2,2,2,3,4,4,5,5,5,5,5,5,5,6,7,7,8,9];

const hand = [];

const empire = [];

const description = [
	{title: "Brise-Glace", count: 4, construction: {energy: 3, science: 1}, production: {exploration: 2}, recyclage: "exploration", type: "energy"},
	{title: "Zone Portuaire", count: 2, construction: {or: 5}, production: {pv: 2, materiaux: 2, or: 2}, recyclage: "or", bonus: {financiers: 2}, type: "or"},
	{title: "Usine de Recyclage", count: 7, construction: {materiaux: 2}, production: {materiaux: 2}, recyclage: "materiaux", type: "materiaux"},
	{title: "Centre de la Terre", count: 1, construction: {exploration: 5, generaux: 2}, production: {pv: 15}, recyclage: "exploration", type: "exploration"},
	{title: "Réseau de Transport", count: 2, construction: {materiaux: 3}, production: {pvMult: "energy"}, recyclage: "materiaux", type: "materiaux"},
	{title: "Division de Chars"},
	{title: "Tour Géante"},
	{title: "Laboratoire Secret"},
	{title: "Continent Perdu de Mu"},
	{title: "Greffes Bioniques"},
]

const GAME_LOADING_STATE = 0;
const GAME_START_STATE = 1;
const GAME_PLAY_STATE = 2;
const GAME_OVER_STATE = 3;
let curState = GAME_LOADING_STATE;
let toggleDebug = false;
let lastTime = 0;

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

function preload() {
	spritesheet.addSpriteSheet('board', './board.png', 2196, 580);
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

	spritesheet.addSpriteSheet('verso', './verso.png', 245, 375);
	spritesheet.addSpriteSheet('cards', './cards.png', 240, 365);
	spritesheet.addSpriteSheet('empires', './empires.png', 379, 245);

    lastTime = Date.now();
}

function updateGame(elapsedTime) {

}

function drawGame() {
	spritesheet.drawScaledSprite('board', 0, 150, 0, 0.7);
	spritesheet.drawScaledSprite('verso', 0, 1600, 610, 0.7);

	hand.forEach((c,i)=>spritesheet.drawScaledSprite('cards', c, 350+190*i, 730, 0.7));
	
	spritesheet.drawScaledSprite('empires', 0, 5, 810, 0.7);

	noFill();
	stroke(0);
	rect(295, 420, 1300, 280, 25);

	spritesheet.drawScaledSprite('cards', 0, 295+190*0+10, 420+10, 0.7);
}

function fillHand() {
	for( let i = 0; i < 5; i++ ) {
		hand.push( cards.pop() );
	}
}

function initGame() {
	shuffleArray(cards);
	fillHand();
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