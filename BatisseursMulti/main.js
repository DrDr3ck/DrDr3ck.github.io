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

let overNewChantierIdx = -1;
let overNewOuvrierIdx = -1;
let overNextTurn = false;

const scale = 0.55;

const boards = [];
const deck = {
	batiments: [],
	ouvriers: [],
	chantiers: [
		{X:5,Y:355,width:680,height:300*scale+10,radius:5},
		{X:695,Y:355,width:680,height:300*scale+10,radius:5},
		{X:5,Y:540,width:680,height:300*scale+10,radius:5},
		{X:695,Y:540,width:680,height:300*scale+10,radius:5}
	],
	team: []
};

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

	boards.push( new Board() );

	for( let i=0; i < 6; i++ ) {
		deck.batiments.push({chantier: allChantiers.pop(), X: 10+(325*scale+10)*i, Y: 10, width:325*scale, height: 300*scale});
		deck.ouvriers.push({ouvrier: allOuvriers.pop(), X: 10+(325*scale+10)*i, Y: 10+315*scale, width:230*scale, height: 300*scale});
	}
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

const distance = (x1, y1, x2, y2) => {
	return sqrt(pow(x2 - x1, 2) + pow(y2 - y1, 2));
}

const between = (min, value, max) => {
	return value >= min && value <= max;
}

const inRectangle = (topLeft, bottomRight) => {
	return between(topLeft.X,mouseX,bottomRight.X) && between(topLeft.Y,mouseY,bottomRight.Y);
}

const inCard = (card) => {
	return inRectangle({X: card.X, Y: card.Y},{X: card.X+card.width, Y: card.Y+card.height});
}

let points = 0;
let ecus = 10;

function emit(type, data) {
	const board = boards[playerIndex];
	// socket.emit(type, data);
	if( type === "OuvrirChantier" ) {
		const idx = data.idx; // chantierIdx
		const chantier = deck.batiments[idx].chantier;
		board.addChantier(chantier);
		deck.batiments[idx].chantier = allChantiers.pop();
		board.addAction(type,data);
	}
	if( type === "RecruterOuvrier" ) {
		const idx = data.idx; // ouvrierIdx
		const ouvrier = deck.ouvriers[idx].ouvrier;
		board.addOuvrier(ouvrier);
		deck.ouvriers[idx].ouvrier = allOuvriers.pop();
		board.addAction(type,data);
	}
	if( type === "TravaillerOuvrier" ) {
		board.addAction(type,data);
	}
	if( type === "PrendreEcus" ) {
		board.takeEcus();
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
	deck.chantiers.forEach(card=>{
		rect(card.X,card.Y,card.width,card.height,card.radius);
	});

	const board = boards[playerIndex];
	for( let i=0; i < 4; i++ ) {
		if( board.chantiers[i] ) {
			const chantier = board.chantiers[i];
			const card = {X: deck.chantiers[i].X+5, Y: deck.chantiers[i].Y+5 };
			spritesheet.drawScaledSprite("batiments", chantier.index, card.X, card.Y, scale);
		}	
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
	push();
	stroke(0,162,232);
	strokeWeight(2);
	noFill();
	deck.batiments.forEach((card,index)=>{
		spritesheet.drawScaledSprite("batiments", card.chantier.index, card.X, card.Y, scale);
		if( overNewChantierIdx === index ) {
			rect(card.X, card.Y, card.width, card.height);
		}
	});
	deck.ouvriers.forEach((card,index)=>{
		spritesheet.drawScaledSprite("ouvriers", card.ouvrier.index, card.X, card.Y, scale);
		if( overNewOuvrierIdx === index ) {
			rect(card.X, card.Y, card.width, card.height);
		}
	});

	// turn
	spritesheet.drawSprite("next_turn", 0, 1450, 15);
	if( overNextTurn ) {
		ellipse(1450+70, 15+70, 130);
	}
	pop();

	// actions
	drawActionCounter();

	// ecu et couronne
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

function mouseMoved() {
	overNewChantierIdx = -1;
	overNewOuvrierIdx = -1;
	overNextTurn = false;

	deck.batiments.forEach((card,index)=>{
		if( inCard(card) ) {
			overNewChantierIdx = index;
		}
	});
	deck.ouvriers.forEach((card,index)=>{
		if( inCard(card) ) {
			overNewOuvrierIdx = index;
		}
	});
	if( distance(mouseX, mouseY, 1450+70, 15+70) <= 70 ) {
		overNextTurn = true;
	}
}

function mouseClicked() {
	if( toggleDebug ) {
		uiManager.addLogger(`X=${mouseX}, Y=${mouseY}`);
	}

	// if over a chantier, take it: OuvrirChantier
	if( overNewChantierIdx !== -1 ) {
		emit("OuvrirChantier", {playerId: 0, idx: overNewChantierIdx});
	}
	// if over an ouvrier, take it: RecruterOuvrier
	if( overNewOuvrierIdx !== -1 ) {
		emit("RecruterOuvrier", {playerId: 0, idx: overNewOuvrierIdx});
	}
	// next turn
	if( overNextTurn ) {
		emit("PrendreEcus", {});
	}

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