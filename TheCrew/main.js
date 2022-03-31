const window_width = 1280;
const window_height = 800;

const uiManager = new UIManager();
uiManager.loggerContainer = new LoggerContainer(
	window_width - 240,
	window_height - 200,
	240,
	100
);
uiManager.loggerContainer.visible = true;

const toolManager = new ToolManager();
const jobManager = new JobManager();

const GAME_START_STATE = 1;
const GAME_PLAY_STATE = 2;
const GAME_WIN_STATE = 3;
let curState = GAME_START_STATE;
const PLAYER_CHOOSE = 1;
const PLAYER_SELECTED = 2;
const PLAYER_MOVE = 3;
const PLAYER_WIN = 4;
let curPlayer = -1;
let gameState = 0;
let selectedPawn = null;
let moves = [];
let selectablePawns = [];
let force = false;

let toggleDebug = false;

function startClicked() {
	curState = GAME_PLAY_STATE;
	uiManager.setUI([]);
	initBoard();
	nextPlayer();
}

const startButton = new BButton(130, 580, "START (4)", startClicked);
startButton.setTextSize(45);
const menu = [startButton];
uiManager.setUI(menu);

let lastTime = 0;

let board = null;

let players = [];

function setup() {
	canvas = createCanvas(window_width, window_height);
	canvas.parent("canvas");

	frameRate(60);

	uiManager.addLogger("The Crew");
	uiManager.addLogger("4 players connected");
	lastTime = Date.now();
}

const tileSize = 48;

let maxPlayers = 4; // TODO: need to 'connect' players

function orderCards(cards) {
	cards.sort((a,b) => a.value > b.value);
	cards.sort((a,b) => a.color > b.color);
	return cards;
}

function initBoard() {
	board = new Board(maxPlayers);
	board.init();
	for (var i = 0; i < maxPlayers; i++) {
		let cards = board.distribute(i);
		// TODO: order cards
		cards = orderCards(cards);
		players.push({ playerId: i, cards: cards });
	}
	console.log(players);
}

function nextPlayer() {
	curPlayer += 1;
	if (curPlayer == maxPlayers) {
		curPlayer = 0;
	}
	uiManager.addLogger(`Player #${curPlayer} is playing`);
}

function drawBoard() {
	if (players.length > 0) {
		drawCards(0);
		drawAllPlayers();
		drawPlayedCards();

		if( curPlayer == 0 ) {
			noFill();
			stroke(200,200,50);
			strokeWeight(4);
			rect(0,0,window_width,window_height);
		}
	}
}

/**
 * Draws card for given player
 * @param playerId id of player
 */
function drawCards(playerId) {
	for (var i = 0; i < players[playerId].cards.length; i++) {
		drawCard(players[playerId].cards[i], i);
	}
}

function drawCard(card, position) {
	stroke(0);
	textSize(24);
	strokeWeight(2);
	if( card.color == "Blue") {
		fill(50,50,150,150);
	} else if( card.color == "Red") {
		fill(150,50,50,150);
	} else if( card.color == "Green") {
		fill(50,150,50,150);
	} else if( card.color == "Yellow") {
		fill(180,180,40,200);
	} else { // Fusee
		fill(100,100,100);
	}
	const cardHeight = 80;
	const cardWidth = window_width / 12;
	const X = 10+(20+cardWidth)*position;
	const Y = window_height-cardHeight;
	rect(X, Y, cardWidth, cardHeight*2);
	fill(150);
	ellipse(X+cardWidth/2, Y+cardHeight/3, 70, 40);

	strokeWeight(1);
	textAlign(CENTER, CENTER);
	fill(0);
	text(card.value.toString(), X+cardWidth/2,Y+cardHeight/3);	
}

/**
 * Draws 'avatar' of each player around the table
 */
function drawAllPlayers() {
	fill(150,50,50);
	strokeWeight(1);
	const playerWidth = window_width/maxPlayers; 
	
	for( var i = 1; i < maxPlayers; i++) {
		if( curPlayer == i ) {
			stroke(200,200,50);
		} else {
			stroke(0);
		}
		ellipse(playerWidth*i, 0, 100,100);
	}
}

/**
 * Draws cards played in the middle of the table
 */
function drawPlayedCards() {
	// Set colors
	fill(204, 101, 192, 127);
	stroke(127, 63, 120);
	ellipse(640, 340, 80, 80);
}

function draw() {
	const currentTime = Date.now();
	const elapsedTime = currentTime - lastTime;
	background(51);

	uiManager.processInput();
	uiManager.update(elapsedTime);

	drawBoard();

	if (curState === GAME_START_STATE || curState === GAME_WIN_STATE) {
		background(51, 51, 51, 200);
	}

	uiManager.draw();

	if (gameState === PLAYER_WIN) {
		push();
		textAlign(CENTER, CENTER);
		textSize(50);
		text(`${curPlayer === 1 ? "Black" : "White"} wins!`, width / 2, height / 2);
		pop();
	}

	if (curState === GAME_PLAY_STATE) {
		if (toolManager.currentTool) {
			toolManager.currentTool.draw();
		}
		jobManager.draw();
	}

	lastTime = currentTime;
}

function mouseClicked() {
	toolManager.mouseClicked();
	uiManager.mouseClicked();

	/*
	if (gameState === PLAYER_CHOOSE) {
		selectPawn(getTileXFromMouse(), getTileYFromMouse());
	} else if (gameState === PLAYER_SELECTED) {
		deselectSelectedPawn(getTileXFromMouse(), getTileYFromMouse());
		movePawn(getTileXFromMouse(), getTileYFromMouse());
	}
	*/
	return false;
}

function keyPressed() {
	if (key === "D") {
		toggleDebug = !toggleDebug;
	}
	if (key === "N") {
		nextPlayer();
	}
}
