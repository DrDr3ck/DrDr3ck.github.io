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

let overNewBatimentIdx = -1;
let overNewOuvrierIdx = -1;
let overChantierIdx = -1;
let overTeamIdx = -1;
let overNextTurn = false;

let selectedTeamIdx = -1;

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
for( let i =0; i < 10; i++ ) {
	const X = 10+(230*scale+10)*i;
	const Y = windowHeight-10-scale*300;
	deck.team.push({X,Y,width:230*scale,height:300*scale});
}

const meepleSize = 150;

function preload() {
	spritesheet.addSpriteSheet('meeple', './meeple.png', meepleSize, meepleSize);
	spritesheet.addSpriteSheet('cover', './big_cover.png', 934, 1023);
}

function musicClicked() {
	// TODO
}

let socket;
let playerIndex = 0;
let currentPlayer = -1;

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
	currentPlayer = 0; // TODO

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

	soundManager.addSound('place_tile', './place_tile.mp3', 1.);
	soundManager.addSound('take_tile', './take_tile.wav', 1.);
	soundManager.addSound('cannot_place_tile', './cannot_place_tile.wav', 1.);

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
		const idx = data.idx; // batimentIdx
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
		const teamIdx = data.teamIdx; // ouvrierIdx
		const chantierIdx = data.chantierIdx; // chantierIdx
		// move ouvrier to chantier
		board.moveOuvrier(teamIdx, chantierIdx);
		// action double ?
		if( board.actions.findIndex(action=>
			action.type === "TravaillerOuvrier" && action.data.chantierIdx === chantierIdx
		) >= 0 ) {
			board.addAction("action",{});
		}
		board.addAction(type,data);
	}
	if( type === "PrendreEcus" ) {
		board.takeEcus();
		currentPlayer = 1-currentPlayer; // TODO: next player :)
		board.actions = [];
	}
}

function drawActionCounter() { 
	push();
	stroke(0);
	strokeWeight(3);
	fill(237,28,36); // Rouge
	fill(255,242,0); // Jaune
	fill(34,177,76); // Vert
	const board = boards[playerIndex];
	const redActions = board.actions.length;
	let chantierCount = 1;
	if( overChantierIdx !== -1 ) {
		// check if an action is done on the same chantier
		chantierCount = board.actions.filter(action=>
			action.type === "TravaillerOuvrier" && action.data.chantierIdx === overChantierIdx
		).length+1;
	}
	const orangeActions = redActions + (overNewBatimentIdx !== -1 || overNewOuvrierIdx !== -1 || overChantierIdx !== -1 ? chantierCount : 0);

	if( redActions > 0 ) {
		fill(237,28,36);
	} else if( orangeActions > 0 ) {
		fill(255,242,0);
	} else {
		fill(34,177,76);
	}
	ellipse(1420, 200, 40);
	if( redActions > 1 ) {
		fill(237,28,36);
	} else if( orangeActions > 1 ) {
		fill(255,242,0);
	} else {
		fill(34,177,76);
	}
	ellipse(1520, 200, 40);
	if( redActions > 2 ) {
		fill(237,28,36);
	} else if( orangeActions > 2 ) {
		fill(255,242,0);
	} else {
		fill(34,177,76);
	}
	ellipse(1620, 200, 40);

	// ecu
	textAlign(CENTER, CENTER);
	spritesheet.drawSprite("ecu", 0, 1400, 250);
	fill(180);
	text(board.ecus,1520,310);

	if( orangeActions > 3 && orangeActions > redActions ) {
		fill(255,242,0);
		const cout = redActions>=3 ? chantierCount : chantierCount-3+redActions;
		text(-5*cout, 1520, 260);
	}
	
	// couronne
	spritesheet.drawScaledSprite("couronne", 0, 1600, 250, 2);
	fill(20);
	text(board.points,1650,310);

	pop();
}

function drawTeam(team) {
	team.forEach((ouvrier, i)=> {
		if( i === selectedTeamIdx ) return;
		const X = 10+(230*scale+10)*i;
		const Y = windowHeight-10-scale*300;
		spritesheet.drawScaledSprite("ouvriers", ouvrier.index, deck.team[i].X, deck.team[i].Y, scale)
		if( overTeamIdx === i ) {
			rect(deck.team[i].X, deck.team[i].Y, deck.team[i].width, deck.team[i].height);
		}
	});
}

function drawChantier() {
	push();
	strokeWeight(2);
	fill(232,212,183);
	deck.chantiers.forEach((card,index)=>{
		if( overChantierIdx === index ) {
			stroke(0,162,232);
		} else {
			stroke(0);
		}
		rect(card.X,card.Y,card.width,card.height,card.radius);
	});

	const board = boards[playerIndex];
	for( let i=0; i < 4; i++ ) {
		if( board.chantiers[i] ) {
			const chantier = board.chantiers[i];
			const card = {X: deck.chantiers[i].X+5, Y: deck.chantiers[i].Y+5 };
			spritesheet.drawScaledSprite("batiments", chantier.index, card.X, card.Y, scale);
			chantier.ouvriers.forEach((ouvrier, index)=>{
				spritesheet.drawScaledSprite("ouvriers", ouvrier.index, card.X+185+40*index, card.Y, scale);
			});
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
	rect(1600, 400+currentPlayer*meepleSize*0.8, meepleSize*0.8, meepleSize*0.8, 5);
	pop();
}

function drawGame() {
	const board = boards[playerIndex];
	push();
	stroke(0,162,232);
	strokeWeight(2);
	noFill();
	deck.batiments.forEach((card,index)=>{
		spritesheet.drawScaledSprite("batiments", card.chantier.index, card.X, card.Y, scale);
		if( overNewBatimentIdx === index ) {
			rect(card.X, card.Y, card.width, card.height);
		}
	});
	deck.ouvriers.forEach((card,index)=>{
		spritesheet.drawScaledSprite("ouvriers", card.ouvrier.index, card.X, card.Y, scale);
		if( overNewOuvrierIdx === index ) {
			rect(card.X, card.Y, card.width, card.height);
		}
	});
	drawTeam(board.team);

	// turn
	spritesheet.drawSprite("next_turn", 0, 1450, 15);
	if( overNextTurn ) {
		ellipse(1450+70, 15+70, 130);
	}
	pop();

	// actions
	drawActionCounter();

	drawChantier();

	drawMeeples();

	if( playerIndex !== currentPlayer ) {
		push();
		fill(150);
		stroke(0);
		textSize(30);
		textAlign(LEFT, TOP);
		text("Wait for your turn", 1150, 10);
		pop();
	}

	if( selectedTeamIdx !== -1 ) {
		spritesheet.drawScaledSprite("ouvriers", board.team[selectedTeamIdx].index, mouseX-230*scale/2, mouseY-300*scale/3, scale)
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
		spritesheet.drawScaledSprite("cover", 0,600,10, 0.8);
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
	overNewBatimentIdx = -1;
	overNewOuvrierIdx = -1;
	overChantierIdx = -1;
	overTeamIdx = -1;
	overNextTurn = false;

	if( playerIndex !== currentPlayer ) {
		return;
	}

	const board = boards[playerIndex];

	deck.batiments.forEach((card,index)=>{
		if( inCard(card) ) {
			overNewBatimentIdx = index;
		}
	});
	deck.ouvriers.forEach((card,index)=>{
		if( inCard(card) ) {
			overNewOuvrierIdx = index;
		}
	});
	if( selectedTeamIdx !== -1 ) {
		deck.chantiers.forEach((card,index)=>{
			if( inCard(card) && board.chantiers[index] ) {
				overChantierIdx = index;
			}
		});
	}
	if( board ) {
		const team = board.team;
		team.forEach((ouvrier,index)=>{
			const card = deck.team[index];
			if( inCard(card) && board.ecus >= ouvrier.ecus ) {
				overTeamIdx = index;
			}
		});
	}

	if( distance(mouseX, mouseY, 1450+70, 15+70) <= 70 ) {
		overNextTurn = true;
	}
}

function mouseClicked() {
	if( toggleDebug ) {
		uiManager.addLogger(`X=${mouseX}, Y=${mouseY}`);
	}

	// if over a chantier, take it: OuvrirChantier
	if( overNewBatimentIdx !== -1 ) {
		emit("OuvrirChantier", {playerId: 0, idx: overNewBatimentIdx});
		soundManager.playSound('take_tile');
	}
	// if over an ouvrier, take it: RecruterOuvrier
	if( overNewOuvrierIdx !== -1 ) {
		emit("RecruterOuvrier", {playerId: 0, idx: overNewOuvrierIdx});
		soundManager.playSound('take_tile');
	}
	// if team over chantier, place it: "TravaillerOuvrier"
	if( selectedTeamIdx !== -1 && overChantierIdx !== -1 ) {
		emit("TravaillerOuvrier", {playerId: 0, teamIdx: selectedTeamIdx, chantierIdx: overChantierIdx});
		selectedTeamIdx = -1;
		overChantierIdx = -1;
		soundManager.playSound('take_tile');
	}
	if( selectedTeamIdx !== -1 ) {
		selectedTeamIdx = -1;
		return;
	}
	// if over a team, drag it:
	if( overTeamIdx !== -1 ) {
		selectedTeamIdx = overTeamIdx;	
		soundManager.playSound('place_tile');
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

	// debug
	if( toggleDebug ) {
		if (key === "+") {
			boards[playerIndex].ecus += 1;
		}
		if (key === "-") {
			boards[playerIndex].ecus -= 1;
		}
		if(key === "N") {
			// next turn
			boards[playerIndex].actions = [];
		}
		if(key == "C") {
			currentPlayer = 1-currentPlayer;
		}
	}
	// end debug

	if( curState === GAME_START_STATE && key === 's' ) {
		// Start
		startClicked();
	}
}