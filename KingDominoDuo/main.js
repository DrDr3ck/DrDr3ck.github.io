const uiManager = new UIManager();
const windowWidth = 1800;
const windowHeight = 1100;
uiManager.loggerContainer = new LoggerContainer(1170, windowHeight-100, windowWidth-1170, 100);
uiManager.loggerContainer.visible = true;

const toolManager = new ToolManager();
const jobManager = new JobManager();
const soundManager = new SoundMgr();
const spritesheet = new SpriteSheet();

const CHOOSECARD = "Choose a card";
const WAITCARD = "Waiting other player";
const PLACECARD = "Place the card";
const GAMEOVER = "End of game";
let gameState = CHOOSECARD;

let userName = "AAA";

let playerIndex = 0;

const cardX = 1100;

const GAME_LOADING_STATE = 0;
const GAME_START_STATE = 1;
const GAME_PLAY_STATE = 2;
const GAME_OVER_STATE = 3;
let curState = GAME_LOADING_STATE;

let toggleDebug = false;
let lastTime = 0;

const tileSize = 150;

let displayRules = false;

let board = null;

let overCardIndex = null;

function preload() {
	spritesheet.addSpriteSheet('back', './back.png', 300, tileSize);
	spritesheet.addSpriteSheet('meeple', './meeple.png', tileSize, tileSize);
	spritesheet.addSpriteSheet('rules', './rules.png', 418, 404);
}

function musicClicked() {
	// TODO
}

const speakerStorageKey = 'DrDr3ck/KingDomino/Speaker';

function speakerClicked() {
	speakerButton.checked = !speakerButton.checked;
	soundManager.mute(!speakerButton.checked);

	localStorage.setItem(speakerStorageKey, speakerButton.checked?"on":"off");
}

function startClicked() {
	curState = GAME_PLAY_STATE;
	uiManager.setUI([ speakerButton, rulesButton ]);
}

const storageKeyUserName = 'DrDr3ck/KingDominoDuo/UserName';

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
const startButton = new BButton(80, windowHeight - 50 - 100, "START", startClicked);

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

	spritesheet.addSpriteSheet('players', './players.png', tileSize, tileSize);
	spritesheet.addSpriteSheet('tiles', './tiles.png', tileSize, tileSize);

	soundManager.addSound('place_pawn', './place_pawn.mp3', 1.);
	soundManager.addSound('place_tile', './place_tile.wav', 1.);
	soundManager.addSound('cannot_place_tile', './cannot_place_tile.wav', 1.);

	// Start the socket connection
	socket = io.connect('http://localhost:3000');

	const localUserName = localStorage.getItem(storageKeyUserName);
	if( localUserName ) {
		userName = localUserName;
	}

	socket.on('getPlayerIndex', index => {
		uiManager.addLogger(`Your player index is ${index}`);
		playerIndex = index;
		if( index === 1 ) {
			startButton.enabled = true;
			gameState = WAITCARD;
		}
	});

	socket.on('allConnected', (curCards) => {
		startButton.enabled = true;
		board.setCards(curCards);
		uiManager.addLogger(`ask board for ${playerIndex}`);
		socket.emit('getBoard', {playerIndex: playerIndex});
	});

	socket.on('cards', (curCards) => {
		board.setCards(curCards);
		// which player should play ?
		// should current player place a card ?
		if( gameState === CHOOSECARD ) {
			// is a card placable ?
			for( let i=0; i < 4; i++ ) {
				const curCard = curCards[i];
				if( curCard.meeple === null && curCard.desc !== null ) {
					gameState = PLACECARD;
					board.curCardClickedIndex = i;
					break;
				}
			}
			if( gameState === CHOOSECARD ) {
				// which meeple is the next one ?
				for( let i=0; i < 4; i++ ) {
					if( curCards[i].meeple !== null ) {
						const curMeeple = curCards[i].meeple;
						gameState = (curMeeple === playerIndex ) ? CHOOSECARD : WAITCARD;
						break;
					}
				}
			}
		} else {
			// check if other player must place a card
			// is a card placable ?
			gameState = CHOOSECARD;
			for( let i=0; i < 4; i++ ) {
				const curCard = curCards[i];
				if( curCard.meeple === null && curCard.desc !== null ) {
					gameState = WAITCARD;
					break;
				}
			}
			if( gameState === CHOOSECARD ) {
				// which meeple is the next one ?
				for( let i=0; i < 4; i++ ) {
					if( curCards[i].meeple !== null ) {
						const curMeeple = curCards[i].meeple;
						gameState = (curMeeple === playerIndex ) ? CHOOSECARD : WAITCARD;
						break;
					}
				}
			}
		}
	});

	socket.on('board', (tiles)=>{
		uiManager.addLogger(`board of ${playerIndex}`);
		board.tiles = tiles;
	});

    frameRate(20);

    lastTime = Date.now();
}

function updateGame(elapsedTime) {

}

function drawGame() {
	board.curCards.forEach(
		(card, i)=>{
			if( card && card.index !== board.getCurCardIndex() ) {
				const position = card.position;
				card.position = 0;
				card.draw(cardX+Math.floor(i/4)*tileSize*2.1,75+200*(i%4));
				card.position = position;
				if( overCardIndex === i ) {
					push();
					noFill();
					stroke(0);
					strokeWeight(5);
					rect(cardX+Math.floor(i/4)*tileSize*2.1,75+200*(i%4),tileSize*2,tileSize);
					pop();
				}
			}
		}
	);

	// draw meeples
	board.meeples.forEach((meeple,index)=>{
		if( meeple !== null ) {
			spritesheet.drawSprite("meeple", meeple, 1220+Math.floor(index/4)*200, 75+(index%4)*200);
		}
	});

	if( gameState === WAITCARD ) {
		fill(51,51,51,151)
		noStroke();
		rect(cardX,75,tileSize*5,tileSize*5);
	}

	// draw tiles
	drawTiles();

	if( gameState === PLACECARD ) {
		// Draw card on top of cursor
		const card = board.getCurCard();
		card.draw(mouseX-75, mouseY-75, false);
	}

	push();
	fill(250);
	textAlign(LEFT, BOTTOM);
	textSize(25);
	text(gameState, 1300, 880);

	text(board.points, 1200, 35);
	pop();
}

function initGame() {
	board.resetCards();
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
		board = new Board();
        initGame();
		textAlign(LEFT, BASELINE);
		uiManager.addLogger('Game loaded');
	}
}

function drawTiles() {
	push();
	noFill();
	stroke(0);
	for( let i=0; i < 7; i++ ) {
		for( let j=0; j < 7; j++ ) {
			const tile = board.tiles[i][j];
			if( tile.type === "chateau" ) {
				spritesheet.drawSprite("players", playerIndex, 25+j*tileSize, 25+i*tileSize);
			} else if( tile.type === "none" ) {
				rect(25+j*tileSize, 25+i*tileSize,tileSize,tileSize);
			} else {
				spritesheet.drawSprite("tiles", getCardIndex(tile), 25+j*tileSize, 25+i*tileSize);
			}
		}
	}
	pop();
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
		spritesheet.drawSprite("meeple", 0, 1420, 75);
		spritesheet.drawSprite("meeple", 1, 1420, 275);
		spritesheet.drawSprite("meeple", 0, 1420, 475);
		spritesheet.drawSprite("meeple", 1, 1420, 675);
		spritesheet.drawSprite('back', 0, cardX, 75);
		spritesheet.drawSprite('back', 0, cardX, 75+200);
		spritesheet.drawSprite('back', 0, cardX, 75+200*2);
		spritesheet.drawSprite('back', 0, cardX, 75+200*3);
		text("KingDomino Duo", 10, 10);

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
		drawTiles();
		push();
		fill(250);
		textAlign(LEFT, BOTTOM);
		textSize(25);
		text(gameState, 1170, 175);
		text(board.points, 1200, 375);
		spritesheet.drawSprite("meeple", 0, 1420, 75);
		spritesheet.drawSprite("meeple", 1, 1420, 275);
		spritesheet.drawSprite("meeple", 0, 1420, 475);
		spritesheet.drawSprite("meeple", 1, 1420, 675);
		pop();
	}

	if( displayRules ) {
		background(51, 51, 51, 200);
		spritesheet.drawSprite('rules', 0, (windowWidth-418)/2, 10);
	}

	textAlign(LEFT, TOP);
    uiManager.draw();
	if (toolManager.currentTool) {
		toolManager.currentTool.draw();
	}
    jobManager.draw();
    
    lastTime = currentTime;
}

const between = (min, value, max) => {
	return value >= min && value <= max;
}

function cardClicked() {
	const topX = cardX; 
	let topY = 25;
	if( between(topX, mouseX, topX+tileSize*2) && between(topY, mouseY, topY+tileSize) ) {
		return 0;
	}
	topY += 200;
	if( between(topX, mouseX, topX+tileSize*2) && between(topY, mouseY, topY+tileSize) ) {
		return 1;
	}
	topY += 200;
	if( between(topX, mouseX, topX+tileSize*2) && between(topY, mouseY, topY+tileSize) ) {
		return 2;
	}
	topY += 200;
	if( between(topX, mouseX, topX+tileSize*2) && between(topY, mouseY, topY+tileSize) ) {
		return 3;
	}
	return -1;
}

function tileClicked() {
	const topX = 25; 
	const topY = 25;
	for( let i=0; i < 7; i++ ) {
		for( let j=0; j < 7; j++ ) {
			if( between(topX+i*tileSize, mouseX, topX+tileSize+i*tileSize) && between(topY+j*tileSize, mouseY, topY+tileSize+j*tileSize) ) {
				return {X: i, Y: j};
			}
		}
	}
	return null;
}

function nextTurn() {
	board.lastChosenCardIndex = board.curCardClickedIndex;
	board.nextTurn();
	gameState = CHOOSECARD;
	if( board.curCards.length === 0 ) {
		curState = GAME_OVER_STATE;
		gameState = GAMEOVER;
	}
}

function mouseClicked() {
	if( displayRules ) {
		displayRules = !displayRules;
		rulesButton.enabled = true;
		speakerButton.enabled = true;
		return;
	}
	if( toggleDebug ) {
		uiManager.addLogger(`X=${mouseX}, Y=${mouseY}`);
	}
	toolManager.mouseClicked();
	uiManager.mouseClicked();

	if( gameState === CHOOSECARD ) {
		if( overCardIndex !== null && board.meeples[overCardIndex] === null ) {
			socket.emit('chooseCard', {playerId: socket.id, cardIndex: overCardIndex});
		}
		/*
		board.curCardClickedIndex = cardClicked();
		if(
			board.curCardClickedIndex >= 0 &&
			board.curCardClickedIndex <= 3-board.lastChosenCardIndex
		) {
			// check if card can be placed. if not, we loose the card for this turn
			if( board.canPlaceCard() ) {
				gameState = PLACECARD;
				soundManager.playSound('place_tile');
			} else {
				// cannot place this tile
				uiManager.addLogger("Cannot place this card");
				soundManager.playSound('cannot_place_tile');
				nextTurn();
			}
		} else {
			board.curCardClickedIndex = -1;
		}
		*/
	} else if( gameState === PLACECARD ) {
		const tilePosition = tileClicked();
		if( tilePosition && board.tryPlaceCard(tilePosition) ) {
			socket.emit('placeCard',
				{
					playerId: socket.id,
					cardIndex: board.curCardClickedIndex,
					position: {
						X: tilePosition.X,
						Y: tilePosition.Y,
						orientation: board.getCurCard().position
					}
			});
			board.curCardClickedIndex = -1;
			soundManager.playSound('place_pawn');
		}
	}

	return false;
}

/*
const topX = cardX; 
	let topY = 25;
	if( between(topX, mouseX, topX+tileSize*2) && between(topY, mouseY, topY+tileSize) ) {
		return 0;
	}
*/

function mouseMoved() {
	overCardIndex = null;
	if( gameState === CHOOSECARD ) {
		board.curCards.forEach(
			(card, i)=>{
				const topX = cardX+Math.floor(i/4)*tileSize*2.1;
				const topY = 75+200*(i%4);
				if( i >= 4 && card && between(topX,mouseX,topX+tileSize*2) && between(topY, mouseY, topY+tileSize) ) {
					if( board.meeples[i] === null ) {
						overCardIndex = i;
					}
				}
			}
		);
	}
}

function keyPressed() {
	if (key === "D") {
		toggleDebug = !toggleDebug;
	}

	if( key==="r" && gameState === PLACECARD ) {
		board.rotateCurCard();
	}

	if( board ) {
		if (keyCode === UP_ARROW || keyCode === DOWN_ARROW || keyCode === LEFT_ARROW || keyCode === RIGHT_ARROW) {
			socket.emit('moveBoard', {id: socket.id, move: keyCode});
			//board.moveBoard(keyCode);
		}
	}
}