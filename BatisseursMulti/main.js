const uiManager = new UIManager();
const windowWidth = 1800;
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

const boards = [];

const meepleSize = 150;

function preload() {
	spritesheet.addSpriteSheet('meeple', './meeple.png', meepleSize, meepleSize);
}

function musicClicked() {
	// TODO
}

let socket;
let playerIndex = 0;

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

	boards.push( new Board());
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

	spritesheet.addSpriteSheet('ouvriers', './ouvriers.png', 230, 300);
	spritesheet.addSpriteSheet('batiments', './batiments.png', 325, 300);

	spritesheet.addSpriteSheet('ecu', './ecu.png', 82, 82);

	spritesheet.addSpriteSheet('next_turn', './next_turn.png', 140, 140);
	spritesheet.addSpriteSheet('couronne', './couronne.png', 80, 50);

	socket = io.connect('http://localhost:3000');

    frameRate(20);

    lastTime = Date.now();
}

function updateGame(elapsedTime) {

}

const scale = 0.55;
let points = 0;
let ecus = 10;

function emit(type, data) {
	const board = boards[playerIndex];
	// socket.emit(type, data);
	if( type === "OuvrirChantier" ) {
		
	}
	if( type === "RecruterOuvrier" ) {

	}
	if( type === "TravaillerOuvrier" ) {

	}
	if( type === "PrendreEcus" ) {

	}
}

function drawActionCounter() { 
	push();
	stroke(0);
	strokeWeight(3);
	fill(255,242,0); // Jaune
	fill(34,177,76); // Vert
	const board = boards[playerIndex];
	if( board.actions.length === 3 ) {
		fill(237,28,36); // Rouge
	}
	ellipse(1620, 200, 40);
	if( board.actions.length === 2 ) {
		fill(237,28,36);
	}
	ellipse(1520, 200, 40);
	if( board.actions.length === 1 ) {
		fill(237,28,36);
	}
	ellipse(1420, 200, 40);
	pop();
}

function drawTeam(team) {
	team.forEach((ouvrier, i)=>
		spritesheet.drawScaledSprite("ouvriers", ouvrier.index, 10+(230*scale+10)*i, windowHeight-10-scale*300, scale)
	);
}

function drawChantier() {
	push();
	stroke(0);
	strokeWeight(2);
	fill(232,212,183);
	rect(5,360-5,680,300*scale+10,5);
	rect(695,360-5,680,300*scale+10,5);
	rect(5,665-65-60,680,300*scale+10,5);
	rect(695,665-65-60,680,300*scale+10,5);

	const board = boards[playerIndex];
	if( board.chantiers[0] ) {
		const chantier = board.chantiers[0];
		spritesheet.drawScaledSprite("batiments", chantier.index, 10, 360, scale);
		/*
		spritesheet.drawScaledSprite("ouvriers", 0, 10+(325*scale+10), 360, scale);
		spritesheet.drawScaledSprite("ouvriers", 1, 10+(325*scale+10)+40, 360, scale);
		spritesheet.drawScaledSprite("ouvriers", 2, 10+(325*scale+10)+80, 360, scale);
		*/
	}
	if( board.chantiers[1] ) {
		const chantier = board.chantiers[1];
		spritesheet.drawScaledSprite("batiments", chantier.index, 700, 360, scale);
	}

	if( board.chantiers[2] ) {
		const chantier = board.chantiers[2];
		spritesheet.drawScaledSprite("batiments", chantier.index, 10, 670-65-60, scale);
	}

	if( board.chantiers[3] ) {
		const chantier = board.chantiers[3];
		spritesheet.drawScaledSprite("batiments", chantier.index, 700, 670-65-60, scale);
	}

	pop();
}

function drawMeeples() {
	push();
	stroke(0);
	noFill();
	for( let i=0; i < 4; i++ ) {
		spritesheet.drawScaledSprite("meeple", i, 1600, 400+i*meepleSize*0.8,0.8);
	}
	rect(1600, 400, meepleSize*0.8, meepleSize*0.8, 5);
	pop();
}

function drawGame() {
	for( let i=0; i < 6; i++ ) {
		spritesheet.drawScaledSprite("batiments", allChantiers[i].index, 10+(325*scale+10)*i, 10, scale);
		spritesheet.drawScaledSprite("ouvriers", allOuvriers[i].index, 10+(325*scale+10)*i, 10+315*scale, scale);
	}

	drawActionCounter();

	spritesheet.drawSprite("next_turn", 0, 1450, 15);

	textAlign(CENTER, CENTER);
	spritesheet.drawSprite("ecu", 0, 1400, 250);
	fill(180);
	text(boards[playerIndex].ecus,1520,310);
	spritesheet.drawScaledSprite("couronne", 0, 1600, 250, 2);
	fill(20);
	text(boards[playerIndex].points,1650,310);

	drawTeam(boards[playerIndex].team);
	drawChantier();

	drawMeeples();
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

	// if over an ouvrier, take it
	// if over a chantier, take it

	toolManager.mouseClicked();
	uiManager.mouseClicked();
	return false;
}

function keyPressed() {
	if (key === "D") {
		toggleDebug = !toggleDebug;
	}

	if( curState === GAME_START_STATE && key === 's' ) {
		// Start
		startClicked();
	}
}