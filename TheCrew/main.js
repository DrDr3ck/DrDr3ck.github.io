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
const spritesheet = new SpriteSheet();

const GAME_START_STATE = 1;
const GAME_PLAY_STATE = 2;
const GAME_WIN_STATE = 3;
let curState = GAME_START_STATE;
const PLAYER_CHOOSE = 1;
const PLAYER_SELECTED = 2;
const PLAYER_MOVE = 3;
const PLAYER_WIN = 4;
let curPlayerIdx = -1;
let gameState = 0;
let selectedPawn = null;
let moves = [];
let selectablePawns = [];
let force = false;

let missions = [];

let toggleDebug = false;

function startClicked() {
	curState = GAME_PLAY_STATE;
	uiManager.setUI([]);
	initBoard();
}

const startButton = new BButton(130, 580, "START (4)", startClicked);
startButton.setTextSize(45);
const menu = [startButton];
uiManager.setUI(menu);

let lastTime = 0;

let board = null;

let players = [];
let fold = [];

function setup() {
	canvas = createCanvas(window_width, window_height);
	canvas.parent("canvas");

	frameRate(60);

	spritesheet.addSpriteSheet('captain', './captain.png', 50, 50);
	spritesheet.addSpriteSheet('token', './token.png', 50, 50);

	uiManager.addLogger("The Crew");
	uiManager.addLogger("4 players connected");
	lastTime = Date.now();
}

const tileSize = 48;

const maxPlayers = 4; // TODO: need to 'connect' players
const thisPlayerId = 0; // TODO: need to be changed for each player

function orderCards(cards) {
	cards.sort((a,b) => a.value > b.value);
	cards.sort((a,b) => a.color > b.color);
	return cards;
}

function initBoard() {
	board = new Board(maxPlayers);
	board.init();
	let captainIdx = -1;
	for (var i = 0; i < maxPlayers; i++) {
		let cards = board.distribute(i);
		cards = orderCards(cards);
		const isCaptain = cards.find(card => card.value == maxPlayers && card.color == CardColor.Fusee)
		if( isCaptain ) {
			captainIdx = i;
		}
		players.push({ playerId: i, cards: cards, communication: { card: null, state: "green"}, captain: isCaptain });
	}
	// choose first mission
	// get a random card (not a Fusee)
	let randomCard = null;
	while( randomCard === null || randomCard.color === CardColor.Fusee ) {
		randomCard = board.cards[Math.floor((Math.random()*board.cards.length))];
	}
	missions.push({card: randomCard, rule: null, playerId: captainIdx}); // mission en dur...

	// DEBUG
	// if captain is not player 0, play a random card
	uiManager.addLogger(`Captain is ${captainIdx}`);
	curPlayerIdx = captainIdx;
	while( curPlayerIdx != 0) {
		playCard(curPlayerIdx, 3);
		nextPlayer();
	}
	console.log(players);
	// END DEBUG
}

function nextPlayer() {
	curPlayerIdx += 1;
	if (curPlayerIdx == maxPlayers) {
		curPlayerIdx = 0;
	}
	uiManager.addLogger(`Player #${curPlayerIdx} is playing`);
}

function drawBoard() {
	if (players.length > 0) {
		drawCards(thisPlayerId, curPlayerIdx == thisPlayerId);
		drawAllPlayers();
		drawPlayedCards();

		if( curPlayerIdx == thisPlayerId ) {
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
 * @param isPlaying true if player is playing
 */
function drawCards(playerId, isPlaying) {
	for (var i = 0; i < players[playerId].cards.length; i++) {
		let selectable = false;
		const curCard = players[playerId].cards[i];
		// TODO: if player has no card with same color, all cards are selectable
		if( isPlaying ) {
			// TODO: check if card can be played or not
			if( fold.length == 0 ) { // no card in the fold, player is starting a new turn
				selectable = true;
			} else {
				// TODO: check the color of the first card and check if player has cards of the same color
				const foldColor = fold[0].card.color;
				const nbCardsSameColor = players[playerId].cards.filter(c=>c.color === foldColor).length;
				if( nbCardsSameColor == 0 || curCard.color === foldColor ) {
					selectable = true;
				}
			}
		}
		drawCard(curCard, i, selectable);
	}
}

const setCardColor = (normal, color) => {
	if( normal ) {
		stroke(200,200,50);
	} else {
		stroke(0);
	}
	textSize(24);
	strokeWeight(2);
	if( color == CardColor.Blue) {
		fill(50,50,150,150);
	} else if( color == CardColor.Red) {
		fill(150,50,50,150);
	} else if( color == CardColor.Green) {
		fill(50,150,50,150);
	} else if( color == CardColor.Yellow) {
		fill(180,180,40,200);
	} else { // CardColor.Fusee
		fill(100,100,100);
	}
}

function drawCard(card, position, selectable) {
	setCardColor(selectable, card.color);
	const cardHeight = 80;
	const cardWidth = window_width / 12;
	const X = 10+(20+cardWidth)*position;
	const Y = window_height-cardHeight;
	rect(X, Y, cardWidth, cardHeight*2);
	fill(150);
	stroke(0);
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
		if( curPlayerIdx == i ) {
			stroke(200,200,50);
		} else {
			stroke(0);
		}
		ellipse(playerWidth*i, 0, 100,100);
	}

	// draw 'communication' token
	for( var i = 0; i < maxPlayers; i++) {
		if( thisPlayerId == i ) {
			// display token at the bottom left
			spritesheet.drawSprite('token', 0, 100 + 25, window_height-120 - 25);
		} else {
			// display token next to the avatar
			spritesheet.drawSprite('token', 0, playerWidth*i-40 -25, 100 - 25);
		}
	}

	// draw 'captain'
	fill(150,150,50);
	for( var i = 0; i < maxPlayers; i++) {
		if( !players[i].captain ) {
			continue;
		}
		if( thisPlayerId == i ) {
			// display captain at the bottom right
			spritesheet.drawSprite('captain', 0, window_width - 100 - 25, window_height-120 - 25);
		} else {
			// display captain next to the avatar
			spritesheet.drawSprite('captain', 0, playerWidth*i+40 -25, 100 - 25);
		}
	}

	// draw 'missions'
	missions.forEach(mission=>drawMission(mission));
}

function drawMission(mission) {
	const cardHeight = 60;
	const cardWidth = window_width / 18;
	const Xs = [window_width/2, window_width/4-cardWidth*2, window_width/2-cardWidth*2, window_width/4*3-cardWidth*2];
	const Ys = [window_height/4*3, 20,20,20];
	// get position of mission according to playerId
	const X = Xs[mission.playerId];
	const Y = Ys[mission.playerId];
	// TODO: draw rule (no rule, 1, 2, 3, >, >>, >>>, last, ...)
	// draw card
	setCardColor(false, mission.card.color);
	
	rect(X,Y,cardWidth, cardHeight);
	fill(150);
	stroke(0);
	ellipse(X+cardWidth/2, Y+cardHeight/2, 60, 30);

	strokeWeight(1);
	textSize(18);
	textAlign(CENTER, CENTER);
	fill(0);
	text(mission.card.value.toString(), X+cardWidth/2,Y+cardHeight/2);	
}

/**
 * Plays given card in the fold array
 * @param playerId id of the player
 * @param cardIdx index of the card to play
 */
 function playCard(playerId, cardIdx) {
	const curPlayer = players[playerId];
	if( curPlayer.cards.length >= cardIdx+1 ) {
		fold.push({playerId, card: curPlayer.cards[cardIdx]});
		console.log(fold);
		curPlayer.cards.splice(cardIdx, 1);
		console.log(fold);
	}
}

/**
 * Draws cards played in the middle of the table
 */
function drawPlayedCards() {
	fold.forEach((f, i) =>
		drawPlayedCard(f.card, f.playerId, i===0)
	);
}

/**
 * Draws card at the middle of the board
 * @param card card to draw
 * @param playerId id of the player (enable to determine position of the card)
 * @param firstCard true if first card of the fold
 */
function drawPlayedCard(card, playerId, firstCard) {
	const Xs = [window_width/2, window_width/4, window_width/2, window_width/4*3];
	const Ys = [window_height/3*2, window_height/5, window_height/5, window_height/5];
	setCardColor(firstCard, card.color);

	const cardHeight = 80;
	const cardWidth = window_width / 12;
	const X = Xs[playerId];
	const Y = Ys[playerId];
	rect(X, Y, cardWidth, cardHeight*2);
	fill(150);
	stroke(0);
	ellipse(X+cardWidth/2, Y+cardHeight/3, 70, 40);

	strokeWeight(1);
	textAlign(CENTER, CENTER);
	fill(0);
	text(card.value.toString(), X+cardWidth/2,Y+cardHeight/3);	
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
		text("You win!", width / 2, height / 2);
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
