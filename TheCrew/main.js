const window_width = window.screen.width > 1280 ? 1280 : window.screen.width;
const window_height = window.screen.height > 800 ? 800 : window.screen.height;

const uiManager = new UIManager();
uiManager.loggerContainer = new LoggerContainer(
	window_width - 240,
	window_height - 300,
	240,
	100
);
uiManager.loggerContainer.visible = true;

const CardColor = {
    Fusee: "AFusee",
    Blue: "Blue",
    Green: "Green",
    Red: "Red",
    Yellow: "Yellow"
}

const toolManager = new ToolManager();
const jobManager = new JobManager();
const spritesheet = new SpriteSheet();

const GAME_START_STATE = 1;
const GAME_PLAY_STATE = 2;
const GAME_WIN_STATE = 3;
let gameState = GAME_START_STATE;
const PLAYER_PLAY = 1;
const PLAYER_COMMUNICATE = 2;
const PLAYER_SELECT_CARD = 3;
const PLAYER_WAIT = 4;
const PLAYERS_WIN = 5;
const PLAYERS_LOOSE = 6;
let playerState = PLAYER_WAIT;
let selectedPawn = null;
let moves = [];
let selectablePawns = [];
let force = false;

let clickedCard = null;

const serverApi = new ServerApi();

let toggleDebug = false;

var timer = null;

const getBoard = () => {
	console.log("refresh board");
	serverApi.getBoard(gameId, thisPlayerId, boardStep).then((b) => {
		if( b ) {
			console.log("board", b.boardStep);
			console.log("board", b);
			board = b;
			boardStep = b.boardStep;
		}
	});
}

function startClicked() {
	serverApi.startGame(gameId).then((s) => {
		if( s.status ) {
			gameState = GAME_PLAY_STATE;
			uiManager.setUI([]);
			/*/ DEBUG
			while( serverApi.getCurrentPlayerId() !== thisPlayerId ) { 
				const player = serverApi.getPlayer(serverApi.getCurrentPlayerId());
				serverApi.playCard({type: "card", card: player.cards[5]}, serverApi.currentPlayerId);
			}
			// END DEBUG */

			console.log("setInterval?");
			getBoard();
			timer = setInterval(getBoard, 5000);

		} else {
			uiManager.addLogger(`Cannot start the game`);
		}
	});
}

let gameId = 0;

function createGameClicked() {
	serverApi.createGame().then((id) => {
		gameId = id;
		uiManager.addLogger(`Game created: ${gameId}`);
	});
	
}

async function connectToGameClicked() {
	const errorMsg = await serverApi.connectPlayer(gameId, thisPlayerId);
	console.log("message", errorMsg);
	/*/ debug
	await serverApi.connectPlayer(gameId,-1);
	await serverApi.connectPlayer(gameId,-1);
	await serverApi.connectPlayer(gameId,-1);
	// end debug */
	if( errorMsg.status ) {
		uiManager.addLogger("Player connected");
		console.log("old player id:", thisPlayerId);
		thisPlayerId = errorMsg.playerId;
		console.log("new player id:", thisPlayerId);
	} else {
		uiManager.addLogger(`Error: ${errorMsg.msg}`);
	}
}

const createGameButton = new BButton(130, 280, "CREATE", createGameClicked);
createGameButton.setTextSize(45);
const connectToGameButton = new BButton(130, 380, "CONNECT", connectToGameClicked);
connectToGameButton.setTextSize(45);
const startButton = new BButton(130, 480, "START (4)", startClicked);
startButton.setTextSize(45);
startButton.visible = false;

const decomposeGameId = () => {
	const v100 = Math.floor(gameId / 100);
	const v10 = Math.floor((gameId - v100*100)/10);
	const v1 = gameId - v100*100 -v10*10;
	return {v100, v10, v1};
}

const recomposeGameId = (v100, v10, v1) => {
	return v100*100 + v10*10 + v1;
}

const ButtonPlus100 = new BFloatingButton(
	window_width/2 + 70 - 10,
	280,
	'+',
	() => {
		const val = decomposeGameId();
		if( val.v100 === 9 ) {
			gameId = recomposeGameId(1,val.v10, val.v1);
		} else {
			gameId = recomposeGameId(val.v100+1,val.v10, val.v1);
		}
	}
);
const ButtonPlus10 = new BFloatingButton(
	window_width/2 + 70 - 10 + 100,
	280,
	'+',
	() => {
		const val = decomposeGameId();
		if( val.v10 === 9 ) {
			gameId = recomposeGameId(val.v100,0, val.v1);
		} else {
			gameId = recomposeGameId(val.v100,val.v10+1, val.v1);
		}
	}
);
const ButtonPlus1 = new BFloatingButton(
	window_width/2 + 70 - 10 + 200,
	280,
	'+',
	() => {
		const val = decomposeGameId();
		if( val.v1 === 9 ) {
			gameId = recomposeGameId(val.v100,val.v10, 0);
		} else {
			gameId = recomposeGameId(val.v100,val.v10, val.v1+1);
		}
	}
);

const ButtonMoins100 = new BFloatingButton(
	window_width/2 + 70 - 10,
	480,
	"-",
	() => {
		const val = decomposeGameId();
		if( val.v100 <= 1 ) {
			gameId = recomposeGameId(9,val.v10, val.v1);
		} else {
			gameId = recomposeGameId(val.v100-1,val.v10, val.v1);
		}
	}
);

const ButtonMoins10 = new BFloatingButton(
	window_width/2 + 70 - 10 + 100,
	480,
	"-",
	() => {
		const val = decomposeGameId();
		if( val.v10 === 0 ) {
			gameId = recomposeGameId(val.v100,9, val.v1);
		} else {
			gameId = recomposeGameId(val.v100,val.v10-1, val.v1);
		}
	}
);

const ButtonMoins1 = new BFloatingButton(
	window_width/2 + 70 - 10 + 200,
	480,
	"-",
	() => {
		const val = decomposeGameId();
		if( val.v1 === 0 ) {
			gameId = recomposeGameId(val.v100,val.v10, 9);
		} else {
			gameId = recomposeGameId(val.v100,val.v10, val.v1-1);
		}
	}
);

const menu = [createGameButton, connectToGameButton, startButton, ButtonPlus100, ButtonPlus10, ButtonPlus1, ButtonMoins100, ButtonMoins10, ButtonMoins1];
uiManager.setUI(menu);

let lastTime = 0;

let board = null;
let boardStep = -1;

function setup() {
	canvas = createCanvas(window_width, window_height);
	canvas.parent("canvas");

	frameRate(60);

	spritesheet.addSpriteSheet('captain', './captain.png', 50, 50);
	spritesheet.addSpriteSheet('token', './token.png', 50, 50);

	uiManager.addLogger("The Crew");
	uiManager.addLogger("No players connected");
	uiManager.addLogger(`Screen size: ${window.screen.width.toString()}x${window.screen.height.toString()}`);
	lastTime = Date.now();
}

let thisPlayerId = -1;

function drawBoard() {
	if (gameState === GAME_PLAY_STATE) {
		if( board ) {
			const isPlaying = drawCards(thisPlayerId);
			drawAllPlayers();
			drawPlayedCards();

			noFill();
			stroke(0);
			const cardHeight = 80;
			const cardWidth = window_width / 12;
			const X = window_width/2;
			const Y = window_height/2;
			rect(X, Y, cardWidth, cardHeight*2);

			if( isPlaying ) {
				noFill();
				stroke(200,200,50);
				strokeWeight(4);
				rect(0,0,window_width,window_height);
			}
		} else {
			textSize(24);
			strokeWeight(2);
			textAlign(CENTER, CENTER);
			fill(200);
			text("Loading...", window_width/2,window_height/3);	
		}
	} else {
		// display gameId
		const val = decomposeGameId();
		textSize(64);
		strokeWeight(2);
		textAlign(CENTER, CENTER);
		fill(250);
		text(val.v100.toString(), window_width/2 + 70 + 25, 340);	
		text(val.v10.toString(), window_width/2 + 70 + 25 + 100, 340);	
		text(val.v1.toString(), window_width/2 + 70 + 25 + 200, 340);	
	}
}

/**
 * Checks if curCard is selectable for the current fold
 * @param fold current fold
 * @param playerCards cards of current Player
 * @param curCard current Card
 * @returns true if curCard is selectable for the current fold
 */
function isCardSelectable(fold, playerCards, curCard) {
	let selectable = false;
	// check if card can be played or not
	if( board.fold.length == 0 ) { // no card in the fold, player is starting a new turn
		selectable = true;
	} else {
		// check the color of the first card and check if player has cards of the same color
		const foldColor = board.fold[0].card.color;
		const nbCardsSameColor = board.cards.filter(c=>c.color === foldColor).length;
		// if player has no card with same color, all cards are selectable
		if( nbCardsSameColor == 0 || curCard.color === foldColor ) {
			selectable = true;
		}
	}
	return selectable;
}

/**
 * Draws card for given player
 * @param playerId id of player
 */
function drawCards(playerId) {
	if( board ) {
		const isPlaying = board.currentPlayerId === playerId;
		const cardHeight = 80;
		const cardWidth = window_width / 12;
		for (var i = 0; i < board.cards.length; i++) {
			let selectable = false;
			const curCard = board.cards[i];
			if( isPlaying ) {
				selectable = isCardSelectable(board.fold, board.cards, curCard);
			}
			const X = 10+(20+cardWidth)*i;
			const Y = window_height-cardHeight;
			if( !clickedCard || clickedCard.color !== curCard.color || clickedCard.value !== curCard.value ) {
				drawCard(curCard, {X, Y, cardWidth, cardHeight}, selectable);
			}
		}

		if( clickedCard !== null ) {
			drawCard(clickedCard, {X:mouseX-cardWidth/2, Y: mouseY-20, cardWidth, cardHeight}, true);
		}

		return isPlaying;
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
	const cardHeight = position.cardHeight;
	const cardWidth = position.cardWidth;
	const X = position.X;
	const Y = position.Y;
	rect(X, Y, cardWidth, cardHeight*2);
	fill(150);
	stroke(0);
	ellipse(X+cardWidth/2, Y+cardHeight/3, 70, 40);

	strokeWeight(1);
	textAlign(CENTER, CENTER);
	fill(0);
	text(card.value.toString(), X+cardWidth/2,Y+cardHeight/3);	
}

const getRelativePlayerId = (index) => {
	return (index + thisPlayerId)%4;
}

/**
 * Draws 'avatar' of each player around the table
 */
function drawAllPlayers() {
	if( !board ) { return;}
	const maxPlayers = board.maxPlayers;
	fill(150,50,50);
	strokeWeight(1);
	const playerWidth = window_width/maxPlayers; 
	
	for( var i = 1; i < maxPlayers; i++) {
		const relativeI = getRelativePlayerId(i);
		if( board.currentPlayerId == relativeI ) {
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
			const relativeI = (i-thisPlayerId+board.maxPlayers)%board.maxPlayers;
			spritesheet.drawSprite('token', 0, playerWidth*relativeI-40 -25, 100 - 25);
		}
	}

	// draw 'captain'
	fill(150,150,50);
	if( board.captain ) {
		// display captain at the bottom right
		spritesheet.drawSprite('captain', 0, 180 + 25, window_height-120 - 25);
	}
	for( var i = 0; i < board.otherPlayers.length ; i++) {
		if( board.otherPlayers[i].captain ) {
			// display captain next to the avatar
			spritesheet.drawSprite('captain', 0, playerWidth*(1+i)+40 -25, 100 - 25);
		}
	}

	// draw 'missions' to choose
	board.allMissions.forEach(mission=>drawMission(mission));

	// draw chosen 'missions'
	board.missions.forEach(mission=>drawMission(mission));
	for( var i = 0; i < board.otherPlayers.length ; i++) {
		board.otherPlayers[i].missions.forEach(mission=>drawMission(mission));
	}
}

function drawMission(mission) {
	const cardHeight = 60;
	const cardWidth = window_width / 18;
	const Xs = [window_width/2, window_width/4-cardWidth*2, window_width/2-cardWidth*2, window_width/4*3-cardWidth*2];
	const Ys = [window_height/4*3, 20,20,20];
	// get position of mission according to playerId
	let relativePlayerId = mission.playerId;
	if( thisPlayerId !== mission.playerId ) {
		relativePlayerId = (mission.playerId - thisPlayerId + board.maxPlayers)%board.maxPlayers;
	}

	const X = Xs[relativePlayerId];
	const Y = Ys[relativePlayerId];
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
 * Draws cards played in the middle of the table
 */
function drawPlayedCards() {
	if( board ) {
		board.fold.forEach((f, i) =>
			drawPlayedCard(f.card, f.playerId, i===0)
		);
	}
}

/**
 * Draws card at the middle of the board
 * @param card card to draw
 * @param playerId id of the player (enable to determine position of the card)
 * @param firstCard true if first card of the fold
 */
function drawPlayedCard(card, playerId, firstCard) {
	const Xs = [window_width/2, window_width/4, window_width/2, window_width/4*3];
	const Ys = [window_height/2, window_height/5, window_height/5, window_height/5];
	setCardColor(firstCard, card.color);

	// get position of foldcard according to playerId
	let relativePlayerId = 0;
	if( thisPlayerId !== playerId ) {
		relativePlayerId = (playerId - thisPlayerId + board.maxPlayers)%board.maxPlayers;
	}

	const cardHeight = 80;
	const cardWidth = window_width / 12;
	const X = Xs[relativePlayerId];
	const Y = Ys[relativePlayerId];
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

	if (gameState === GAME_START_STATE || gameState === GAME_WIN_STATE) {
		background(51, 51, 51, 200);
	}

	uiManager.draw();

	if (playerState === PLAYERS_WIN) {
		push();
		textAlign(CENTER, CENTER);
		textSize(50);
		text("You win!", width / 2, height / 2);
		pop();
	} else if( playerState === PLAYERS_LOOSE ) { // TODO: no cards for anyone!!
		push();
		textAlign(CENTER, CENTER);
		textSize(50);
		text("You loose!", width / 2, height / 2);
		pop();
	}

	if (gameState === GAME_PLAY_STATE) {
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
	return false;
}

function mousePressed() {
	if( !board ) { return; }
	// for now, do not interact if user is not the one that is playing
	if( board.currentPlayerId !== thisPlayerId ) {
		return;
	}
	// if player already clicks a card, do nothing
	if( clickedCard !== null ) {
		return;
	}
	// check which card is clicked (if any)
	const cardHeight = 80;
	const cardWidth = window_width / 12;
	//const player = serverApi.getPlayer(thisPlayerId);
	const Y = window_height-cardHeight;
	for( const cardIndex in board.cards) { //player.cards ) {
		const X = 10+(20+cardWidth)*cardIndex;
		if( between(X, mouseX, X+cardWidth) && mouseY >= Y ) {
			if( isCardSelectable(board.fold, board.cards, board.cards[cardIndex]) ) { //player.cards[cardIndex]) ) {
				clickedCard = board.cards[cardIndex]; //player.cards[cardIndex];
			}
			return;
		}
	}
}

function mouseDragged() {
	if( !board ) { return; }
	if( clickedCard === null ) {
		return;
	}
}

function between(min, value, max) {
	return value >= min && value <= max;
}

function mouseReleased() {
	if( !board ) { return; }
	if( clickedCard && between(640, mouseX, 745) && between(400, mouseY, 560) ) {
		// play card
		serverApi.playCard("card", clickedCard, thisPlayerId).then(()=>{
			clickedCard = null;
			getBoard();
		})
	}
}

async function fetchAsync (url) {
	let response = await fetch(url);
	let data = await response.json();
	return data;
  }

function keyPressed() {
	if (key === "D") {
		toggleDebug = !toggleDebug;
	}
	/* DEBUG
	if( key === "N") {
		if( serverApi.currentPlayerId !== thisPlayerId ) {
			const player = serverApi.getPlayer(serverApi.currentPlayerId);
			const randomIndex = Math.floor(Math.random() * player.cards.length);
			const winnerId = serverApi.playCard({type: "card", card: player.cards[randomIndex]}, serverApi.currentPlayerId);
			if( winnerId !== -1) {
				uiManager.addLogger(`${winnerId} wins this turn`);
			}
		}
	}
	*/
}

