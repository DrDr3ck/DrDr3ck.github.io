const uiManager = new UIManager();
const windowWidth = 1400;
const windowHeight = 900;
uiManager.loggerContainer = new LoggerContainer(830, windowHeight-100, windowWidth-1170, 100);
uiManager.loggerContainer.visible = true;

const toolManager = new ToolManager();
const jobManager = new JobManager();
const soundManager = new SoundMgr();
const spritesheet = new SpriteSheet();

const ORDERCARDS = "Order cards";
const WAIT = "Wait Opponent";
const REMOVECOUNTER = "Remove counter(s)";
const ADDCOUNTER = "Add counter(s)";
const GAMEOVER = "End of game";
let gameState = ORDERCARDS;
let removeCounter = 0;
let addCounter = 0;

const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const ip = urlParams.get('ip');
const port = urlParams.get('port') || "3000";
console.log(ip, port);

const BLUE = 0;
const RED = 1;

let userName = "AAA";

const colors = [
 {r:13,g:81,b:135},
 {r:168,g:30,b:35}
];

const GAME_LOADING_STATE = 0;
const GAME_START_STATE = 1;
const GAME_PLAY_STATE = 2;
const GAME_OVER_STATE = 3;
let curState = GAME_LOADING_STATE;

let toggleDebug = false;
let lastTime = 0;

let displayRules = false;

/////////////////////////////////////
// BOARD

class Board {
	constructor() {
        this.temples = [];
		this.dead = [];
		this.score = [0,0];
	}

	reset(b) {
		this.temples = b.temples;
		this.dead = b.dead;
		this.score = b.score;
	}
}
/////////////////////////////////////

const tileWidth = 35;
const scorePosition = [
	{X:485,Y:110}, {X:750,Y:110}, {X:485,Y:420}, {X:750,Y:420}, // temple
	{X:535,Y:740}, {X:790,Y:740}, {X:915,Y:740} // black and bonuses
 ];
const tilesPosition = [
	[
		{X:483,Y:173}, {X:541,Y:173}, {X:597,Y:173}, {X:652,Y:173},
		{X:483,Y:233}, {X:541,Y:233}, {X:597,Y:233}, {X:652,Y:233},
		{X:483,Y:293}, {X:541,Y:293}, {X:597,Y:293}, {X:652,Y:293}
	],
	[
		{X:750,Y:173}, {X:808,Y:173}, {X:865,Y:173}, {X:919,Y:173},
		{X:750,Y:233}, {X:808,Y:233}, {X:865,Y:233}, {X:919,Y:233},
		{X:750,Y:293}, {X:808,Y:293}, {X:865,Y:293}, {X:919,Y:293}
	],
	[
		{X:483,Y:480}, {X:541,Y:480}, {X:597,Y:480}, {X:652,Y:480},
		{X:483,Y:536}, {X:541,Y:536}, {X:597,Y:536}, {X:652,Y:536},
		{X:483,Y:595}, {X:541,Y:595}, {X:597,Y:595}, {X:652,Y:595}
	],
	[
		{X:750,Y:480}, {X:808,Y:480}, {X:865,Y:480}, {X:919,Y:480},
		{X:750,Y:536}, {X:808,Y:536}, {X:865,Y:536}, {X:919,Y:536},
		{X:750,Y:595}, {X:808,Y:595}, {X:865,Y:595}, {X:919,Y:595}
	],
	[   // Kingdom of Dead
		{X:475,Y:742},{X:475+62,Y:742},{X:475+62+62,Y:742},{X:475+62+62+62,Y:742},
		{X:729,Y:742},{X:729+62,Y:742},{X:729+62+62,Y:742},{X:729+62+62+62,Y:742}
	],
	[   // Points
		{X: 348, Y: 777}, // 0
		{X: 404, Y: 760}, {X: 404, Y: 711}, {X: 404, Y: 659}, {X: 404, Y: 607}, {X: 404, Y: 555}, {X: 404, Y: 503}, {X: 404, Y: 451}, 
		{X: 404, Y: 399}, {X: 404, Y: 351}, {X: 404, Y: 300}, {X: 404, Y: 249}, {X: 404, Y: 199}, {X: 404, Y: 146}, {X: 404, Y: 92}, {X: 404, Y: 40},
		{X: 454, Y: 36}, {X: 509, Y: 36}, {X: 566, Y: 36}, {X: 622, Y: 36}, {X: 675, Y: 36},
		{X: 728, Y: 36}, {X: 783, Y: 36}, {X: 837, Y: 36}, {X: 889, Y: 36}, {X: 944, Y: 36},

		{X: 993, Y: 40}, {X: 993, Y: 92}, {X: 993, Y: 146}, {X: 993, Y: 199}, {X: 993, Y: 249}, {X: 993, Y: 300}, {X: 993, Y: 351}, {X: 993, Y: 399},
		{X: 993, Y: 451}, {X: 993, Y: 503}, {X: 993, Y: 555}, {X: 993, Y: 607}, {X: 993, Y: 659}, {X: 993, Y: 711},	{X: 993, Y: 760}
	]
];

// TODO: server
let curBoard = new Board();
let playerIndex = 0; // BLUE or RED

const cardsPosition = [
	[
		{X:10, Y:45, width: 260, height:165}, {X:10, Y:45+190, width: 260, height:165},
		{X:10, Y:45+190+190, width: 260, height:165}, {X:10, Y:45+190+190+190, width: 260, height:165}
	],
	[
		{X:1130, Y:45+190+190+190, width: 260, height:165},
		{X:1130, Y:45+190+190, width: 260, height:165},
		{X:1130, Y:45+190, width: 260, height:165},
		{X:1130, Y:45, width: 260, height:165}
	]
]

let curCards = [
	[],[] // #0 for player BLUE and #1 for player RED
];

let overCardIdx = -1;
let selectedCardIdx = -1;
let overNextTurn = false;
let overTileIdx = null;

function preload() {
	spritesheet.addSpriteSheet('cover', './cover.jpg', 450, 635);
}

function musicClicked() {
	// TODO
}

const speakerStorageKey = 'DrDr3ck/Aton/Speaker';
const storageKeyUserName = 'DrDr3ck/Aton/UserName';

function speakerClicked() {
	speakerButton.checked = !speakerButton.checked;
	soundManager.mute(!speakerButton.checked);

	localStorage.setItem(speakerStorageKey, speakerButton.checked?"on":"off");
}

function startClicked() {
	curState = GAME_PLAY_STATE;
	uiManager.setUI([ speakerButton, rulesButton ]);
	uiManager.addLogger("Start game");
}

const speakerButton = new BFloatingSwitchButton(windowWidth - 70 - 10 - 70, 70, '\uD83D\uDD0A', speakerClicked);
const musicButton = new BFloatingSwitchButton(windowWidth - 70, 70, '\uD83C\uDFB6', musicClicked);
const connectButton = new BButton(80, windowHeight - 50 - 200, "CONNECT", ()=>{
	localStorage.setItem(storageKeyUserName, userName);
	connectButton.visible = false;
	upArrow1.visible = false;
	downArrow1.visible = false;
	upArrow2.visible = false;
	downArrow2.visible = false;
	upArrow3.visible = false;
	downArrow3.visible = false;
	startButton.visible = true;
	startButton.enabled = false;
	socket.emit('setSocketId', {name: userName, id: socket.id});
});
const startButton = new BButton(680, windowHeight - 50 - 200, "START", startClicked);

const upArrow1 = new BFloatingButton(80, 180, '\u2191', ()=>{
	if( userName[0] === 'A' ) {
		userName = `Z${userName.substring(1)}`;
	} else {
		const v = userName.charCodeAt(0);
		userName = `${String.fromCharCode(v-1)}${userName.substring(1)}`;
	}
});
const downArrow1 = new BFloatingButton(80, 380, '\u2193', ()=>{
	if( userName[0] === 'Z' ) {
		userName = `A${userName.substring(1)}`;
	} else {
		const v = userName.charCodeAt(0);
		userName = `${String.fromCharCode(v+1)}${userName.substring(1)}`;
	}
});
const upArrow2 = new BFloatingButton(80+120, 180, '\u2191', ()=>{
	if( userName[1] === 'A' ) {
		userName = `${userName.substring(0, 1)}Z${userName.substring(2)}`;
	} else {
		const v = userName.charCodeAt(1);
		userName = `${userName.substring(0, 1)}${String.fromCharCode(v-1)}${userName.substring(2)}`;
	}
});
const downArrow2 = new BFloatingButton(80+120, 380, '\u2193', ()=>{
	if( userName[1] === 'Z' ) {
		userName = `${userName.substring(0, 1)}A${userName.substring(2)}`;
	} else {
		const v = userName.charCodeAt(1);
		userName = `${userName.substring(0, 1)}${String.fromCharCode(v+1)}${userName.substring(2)}`;
	}
});
const upArrow3 = new BFloatingButton(80+120*2, 180, '\u2191', ()=>{
	if( userName[2] === 'A' ) {
		userName = `${userName.substring(0, 2)}Z}`;
	} else {
		const v = userName.charCodeAt(2);
		userName = `${userName.substring(0, 2)}${String.fromCharCode(v-1)}`;
	}
});
const downArrow3 = new BFloatingButton(80+120*2, 380, '\u2193', ()=>{
	if( userName[2] === 'Z' ) {
		userName = `${userName.substring(0, 2)}A`;
	} else {
		const v = userName.charCodeAt(2);
		userName = `${userName.substring(0, 2)}${String.fromCharCode(v+1)}`;
	}
});

const rulesButton = new BFloatingButton(windowWidth - 70, 70, '?', ()=>{
	// display/hide rules
	displayRules = !displayRules;
	if( displayRules ) {
		rulesButton.enabled = false;
		speakerButton.enabled = false;
		startButton.visible = false;
	}
});

function initUI() {
	speakerButton.setTextSize(50);
	rulesButton.setTextSize(50);
	musicButton.enabled = false;
	musicButton.checked = false;
	const isSpeakerOn = localStorage.getItem(speakerStorageKey);
	if( isSpeakerOn === "off" ) {
		speakerButton.checked = false;
		soundManager.mute(true);
	}
	const menu = [ speakerButton, connectButton, startButton, rulesButton, upArrow1, downArrow1, upArrow2, downArrow2, upArrow3, downArrow3 ];
	uiManager.setUI(menu);
	startButton.visible = false;
}

let socket;

function setup() {
    initUI();
	canvas = createCanvas(windowWidth, windowHeight);
    canvas.parent('canvas');

	spritesheet.addSpriteSheet('cards', './cards.png', 260, 165);
	spritesheet.addSpriteSheet('verso', './verso.png', 260, 165);
	spritesheet.addSpriteSheet('board', './board.jpg', 799, 796);
	spritesheet.addSpriteSheet('next_turn', './next_turn.png', 140, 140);
	spritesheet.addSpriteSheet('black_tile', './black_tile.png', 49, 51);
	spritesheet.addSpriteSheet('bonus_tile', './bonus_tile.png', 49, 51);

	// Start the socket connection
	if( ip ) {
		console.log(`connect with ${ip}:${port}`)
		socket = io.connect(`${ip}:${port}`);
	} else {
		console.log("localhost:3000");
		socket = io.connect("http://localhost:3000");
	}
	

	const localUserName = localStorage.getItem(storageKeyUserName);
	if( localUserName ) {
		userName = localUserName;
	}

	socket.on("error", (err) => {
		console.log(`connect_error due to ${err.message}`);
	  });

	socket.on('getPlayerIndex', index => {
		playerIndex = index;
	});

	socket.on('allConnected', () => {
		startButton.enabled = true;
	});

	socket.on('boards', ({board, cards, players, messages})=>{
		curBoard.reset(board);
		curCards = cards;
		gameState = players[playerIndex].gameState;
		removeCounter = players[playerIndex].remove;
		addCounter = players[playerIndex].add;
		if( messages && messages.length > 0 ) {
			messages.forEach(m=>uiManager.addLogger(m));
		}
	});

    frameRate(20);

    lastTime = Date.now();
}

function updateGame(elapsedTime) {

}

const cardIndex = (type, value) => {
	if( type === BLUE ) {
		switch(value) {
			case 1:
				return 0; 
			case 2:
				return 2;
			case 3:
				return 4;
		}
		return 6;
	}
	if( type === RED ) {
		switch(value) {
			case 4:
				return 1; 
			case 3:
				return 3;
			case 2:
				return 5;
		}
		return 7;
	}
}

function drawCard(color, index, position) {
	const cardPosition = position ? position : cardsPosition[color][index];
	if( curCards[color][index].visible || color === playerIndex ) {
		if( index !== selectedCardIdx || position ) {
			spritesheet.drawSprite("cards", cardIndex(color,curCards[color][index].value), cardPosition.X, cardPosition.Y);
		}
	} else {
		spritesheet.drawSprite("verso", color, cardPosition.X, cardPosition.Y);
	}
	if( index === overCardIdx && color === playerIndex ) {
		rect(cardPosition.X, cardPosition.Y, cardPosition.width, cardPosition.height, 20);
	}
}

function drawScore() {
	push();
	textSize(30);
	textAlign(CENTER, CENTER);
	const scores = [{none: 0},{red: 5},{blue: 3},{blue: 6}, {red: 8}, {blue:4}, {red:6}];
	spritesheet.drawScaledSprite('black_tile',0,510,710,1.2);
	spritesheet.drawScaledSprite('bonus_tile',0,830,710,1.2);
	stroke(0);
	scores.forEach((score,index)=>{
		fill(217,185,138);
		ellipse(scorePosition[index].X, scorePosition[index].Y,35);
		if( score.blue ) {
			fill(colors[BLUE].r, colors[BLUE].g, colors[BLUE].b);
			text(score.blue, scorePosition[index].X, scorePosition[index].Y);
		} else if( score.red ) {
			fill(colors[RED].r, colors[RED].g, colors[RED].b);
			text(score.red, scorePosition[index].X, scorePosition[index].Y);
		} else { // none
			fill(180);
			text("0", scorePosition[index].X, scorePosition[index].Y);
		}
	});
	pop();
}

function drawPoints() {
	push();
	strokeWeight(1);
	stroke(0);
	const points = curBoard?.score || [0,0];
	fill(colors[BLUE].r, colors[BLUE].g, colors[BLUE].b);
	const bluePointTile = tilesPosition[5][points[BLUE]];
	if( points[0] === points[1] ) {
		arc(bluePointTile.X, bluePointTile.Y, tileWidth/2, tileWidth/2, PI, 2*PI, CHORD);
	} else {
		ellipse(bluePointTile.X, bluePointTile.Y, tileWidth/2);
	}
	fill(colors[RED].r, colors[RED].g, colors[RED].b);
	const redPointTile = tilesPosition[5][points[RED]];
	if( points[0] === points[1] ) {
		arc(redPointTile.X, redPointTile.Y, tileWidth/2, tileWidth/2, 0, PI, CHORD);
	} else {
		ellipse(redPointTile.X, redPointTile.Y, tileWidth/2);
	}
	pop();
}

function drawDead() {
	curBoard.dead.forEach((color, index)=>{
		const position = tilesPosition[4][index];
		fill(colors[color].r, colors[color].g, colors[color].b);
		ellipse(position.X, position.Y, tileWidth);
	});
}

function drawTemple(temple, position, color) {
	temple.tiles.forEach((tile, index)=>{
		if( tile.counter === color ) {
			ellipse(position[index].X, position[index].Y, tileWidth);
		}
	});
}

function drawBoard(board) {
	push();
	strokeWeight(1);
	stroke(0);
	fill(colors[BLUE].r, colors[BLUE].g, colors[BLUE].b);
	board.temples.forEach((temple,index)=>drawTemple(temple, tilesPosition[index], BLUE));
	fill(colors[RED].r, colors[RED].g, colors[RED].b);
	board.temples.forEach((temple,index)=>drawTemple(temple, tilesPosition[index], RED));
	drawDead();
	pop();
}

function drawGame() {
	spritesheet.drawSprite("board", 0, 300, 2);

	push();
	noFill();
	strokeWeight(3);
	stroke(0);
	// RED
	drawCard(RED, 3);
	drawCard(RED, 2);
	drawCard(RED, 1);
	drawCard(RED, 0);
	if( gameState === ORDERCARDS && playerIndex === RED ) {
		spritesheet.drawScaledSprite("next_turn", 0, windowWidth-130*.75-60, 790, 0.75);
		if( overNextTurn ) {
			ellipse(windowWidth-130*.75-60+70*0.75, 790+70*0.75, 130*.75);
		}
	}

	// BLUE
	drawCard(BLUE, 0);
	drawCard(BLUE, 1);
	drawCard(BLUE, 2);
	drawCard(BLUE, 3);
	if( gameState === ORDERCARDS && playerIndex === BLUE ) {
		spritesheet.drawScaledSprite("next_turn", 0, 60, 790, 0.75);
		if( overNextTurn ) {
			ellipse(60+70*0.75, 790+70*0.75, 130*.75);
		}
	}

	if( curBoard ) {
		drawBoard(curBoard);
	}	

	if( overTileIdx ) {
		const tile = tilesPosition[overTileIdx.temple][overTileIdx.tile];
		ellipse(tile.X, tile.Y, tileWidth);
	}

	if( gameState === REMOVECOUNTER || gameState === ADDCOUNTER ) {
		push();
		const maxTemple = curCards[playerIndex][2].value;
		if( maxTemple < 4 ) {
			noStroke();
			fill(128,128,128,128);
			rect(718,384,953-718,655-384);
		}
		if( maxTemple < 3 ) {
			noStroke();
			fill(128,128,128,128);
			rect(450,384,685-450,655-384);
		}
		if( maxTemple < 2 ) {
			noStroke();
			fill(128,128,128,128);
			rect(720,78,955-720,350-78);
		}
		pop();
	}

	drawPoints();

	drawScore();

	if( selectedCardIdx !== -1 ) {
		drawCard(playerIndex, selectedCardIdx, {X: mouseX-130, Y: mouseY-80, width: 260, height: 165});
	}
	pop();

	textSize(25);
	text(gameState, 300,810);
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
		spritesheet.drawSprite("cover", 0, 650, 100);
		fill(255);
		stroke(0);
		textSize(60);
		textAlign(CENTER, CENTER);
		text(userName[0], 115, 245);
		text(userName[1], 115+120, 245);
		text(userName[2], 115+120*2, 245);
	}
	if (curState === GAME_PLAY_STATE) {
		updateGame(elapsedTime);
		drawGame();
	}
	if( curState === GAME_OVER_STATE ) {
		// TODO: who win ?
	}

	if( displayRules ) {
		background(51, 51, 51, 200);
		spritesheet.drawSprite('rules', 0, 10, 10);
	}

	textAlign(LEFT, TOP);
    uiManager.draw();
	if (toolManager.currentTool) {
		toolManager.currentTool.draw();
	}
    jobManager.draw();
    
    lastTime = currentTime;
}

function emit(type, data) {
	if( type === ORDERCARDS ) {
		socket.emit('orderCards', data);
	}
	if( type === REMOVECOUNTER ) {
		socket.emit('removeCounter', data);
	}
	if( type === ADDCOUNTER ) {
		socket.emit('addCounter', data);
	}
}

const between = (min, value, max) => {
	return value >= min && value <= max;
}

const distance = (x1, y1, x2, y2) => {
	return sqrt(pow(x2 - x1, 2) + pow(y2 - y1, 2));
}

const inRectangle = (topLeft, bottomRight) => {
	return between(topLeft.X,mouseX,bottomRight.X) && between(topLeft.Y,mouseY,bottomRight.Y);
}

const mouseOverCard = (card) => {
	return inRectangle({X: card.X, Y: card.Y},{X: card.X+card.width, Y: card.Y+card.height});
}

function cardClicked() {
	const topX = 860; 
	let topY = 25;
	if( between(topX, mouseX, topX+300) && between(topY, mouseY, topY+150) ) {
		return 0;
	}
	topY += 200;
	if( between(topX, mouseX, topX+300) && between(topY, mouseY, topY+150) ) {
		return 1;
	}
	topY += 200;
	if( between(topX, mouseX, topX+300) && between(topY, mouseY, topY+150) ) {
		return 2;
	}
	topY += 200;
	if( between(topX, mouseX, topX+300) && between(topY, mouseY, topY+150) ) {
		return 3;
	}
	return -1;
}

function tileClicked() {
	const topX = 25; 
	const topY = 25;
	for( let i=0; i < 5; i++ ) {
		for( let j=0; j < 5; j++ ) {
			if( between(topX+i*150, mouseX, topX+150+i*150) && between(topY+j*150, mouseY, topY+150+j*150) ) {
				return {X: i, Y: j};
			}
		}
	}
	return null;
}

function mouseMoved() {
	overCardIdx = -1;
	if( selectedCardIdx === -1 ) {
		if( gameState === ORDERCARDS ) {
			cardsPosition[playerIndex].forEach((card,index)=>{
				if( mouseOverCard(card) ) {
					overCardIdx = index;
				}
			});
		}
	} else {
		cardsPosition[playerIndex].forEach((card,index)=>{
			if( index !== selectedCardIdx && mouseOverCard(card) ) {
				// switch cards
				const curCard = curCards[playerIndex][selectedCardIdx];
				curCards[playerIndex].splice(selectedCardIdx, 1);
				curCards[playerIndex].splice(index, 0, curCard);
				selectedCardIdx = index;
			}
		});
	}
	overNextTurn = false;
	if( gameState === ORDERCARDS ) {
		if( playerIndex === BLUE && distance(mouseX, mouseY, 60+70*0.75, 790+70*0.75) <= 70*.75 ) {
			overNextTurn = true;
		}
		if( playerIndex === RED && distance(mouseX, mouseY, windowWidth-130*.75-60+70*0.75, 790+70*0.75) <= 70*.75 ) {
			overNextTurn = true;
		}
	}
	overTileIdx = null;
	if( gameState === REMOVECOUNTER || gameState === ADDCOUNTER ) {
		const maxTemple = curCards[playerIndex][2].value;
		const color = gameState === REMOVECOUNTER && curCards[playerIndex][1].value > 2 ? 1-playerIndex : playerIndex;
		for( let i=0; i < maxTemple; i++ ) {
			tilesPosition[i].forEach((tilePosition,index)=>{
				const tileColor = curBoard.temples[i].tiles[index].counter;
				if( ((gameState === REMOVECOUNTER && tileColor === color) || (gameState === ADDCOUNTER && tileColor===null)) && distance(mouseX, mouseY, tilePosition.X, tilePosition.Y, tileWidth) < tileWidth/2 ) {
					overTileIdx = {temple: i, tile: index};
				}
			});
		}
	}
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
	if( selectedCardIdx !== -1 ) {
		selectedCardIdx = -1;
	}
	if( gameState === ORDERCARDS && overCardIdx !== -1 ) {
		selectedCardIdx = overCardIdx;
		overCardIdx = -1;
	}
	if( overNextTurn && selectedCardIdx === -1 && gameState === ORDERCARDS ) {
		emit(ORDERCARDS, {playerId: socket.id, cards: curCards[playerIndex]});
		overNextTurn = false;
		gameState = WAIT;
	}
	if( overTileIdx ) {
		emit(gameState, {playerId: socket.id, temple: overTileIdx.temple, tile: overTileIdx.tile});
		overTileIdx = null;
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

/* Randomize array in-place using Durstenfeld shuffle algorithm */
const shuffleArray = (array) => {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i+1))
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
}