const uiManager = new UIManager();
const windowWidth = 1400;
const windowHeight = 800;
uiManager.loggerContainer = new LoggerContainer(1170, windowHeight-100, windowWidth-1170, 100);
uiManager.loggerContainer.visible = true;

const toolManager = new ToolManager();
const jobManager = new JobManager();
const soundManager = new SoundMgr();
const spritesheet = new SpriteSheet();

const CHOOSECARD = "Choose a card";
const PLACECARD = "Place the card";
const GAMEOVER = "Game Over";
let gameState = CHOOSECARD;

const GAME_LOADING_STATE = 0;
const GAME_START_STATE = 1;
const GAME_PLAY_STATE = 2;
const GAME_OVER_STATE = 3;
let curState = GAME_LOADING_STATE;

let toggleDebug = false;
let lastTime = 0;

let board = null;

function preload() {
	spritesheet.addSpriteSheet('back', './back.png', 300, 150);
	spritesheet.addSpriteSheet('meeple', './meeple.png', 150, 150);
}

function musicClicked() {
	// TODO
}

function speakerClicked() {
	speakerButton.checked = !speakerButton.checked;
	soundManager.mute(!speakerButton.checked);
}

function startClicked() {
	curState = GAME_PLAY_STATE;
	uiManager.setUI([ speakerButton, musicButton ]);
	uiManager.addLogger("Start game");
	board.startTurn();
}

const speakerButton = new BFloatingSwitchButton(windowWidth - 70 - 10 - 70, 70, '\uD83D\uDD0A', speakerClicked);
const musicButton = new BFloatingSwitchButton(windowWidth - 70, 70, '\uD83C\uDFB6', musicClicked);
const startButton = new BButton(80, windowHeight - 50 - 200, "START", startClicked);

function initUI() {
    speakerButton.setTextSize(50);
	musicButton.setTextSize(50);
	musicButton.enabled = false;
	musicButton.checked = false;
	const menu = [ speakerButton, musicButton, startButton ];
	uiManager.setUI(menu);
}

function setup() {
    initUI();
	canvas = createCanvas(windowWidth, windowHeight);
    canvas.parent('canvas');

	spritesheet.addSpriteSheet('players', './players.png', 150, 150);
	spritesheet.addSpriteSheet('tiles', './tiles.png', 150, 150);

    frameRate(60);

    lastTime = Date.now();
}

function updateGame(elapsedTime) {

}

function drawGame() {
	board.curCards.forEach(
		(card, i)=>{
			if( card.index !== board.getCurCardIndex() ) {
				const position = card.position;
				card.position = 0;
				card.draw(860,25+200*i);
				card.position = position;
			}
		}
	);

	// draw tiles
	drawTiles();

	if( board.curCardClickedIndex >= 0 ) {
		spritesheet.drawSprite("meeple", 0, 860+75, 25+200*board.curCardClickedIndex);
	} else {
		spritesheet.drawSprite("meeple", 0, 1220, 225);
	}
	if( board.brunoCardClickedIndex >= 0 ) {
		spritesheet.drawSprite("meeple", 1, 860+75, 25+200*board.brunoCardClickedIndex);
	} else {
		spritesheet.drawSprite("meeple", 1, 1220, 425);
	}

	if( gameState === PLACECARD ) {
		// Draw card on top of cursor
		const card = board.getCurCard();
		card.draw(mouseX-75, mouseY-75, false);
	}

	push();
	fill(250);
	textAlign(LEFT, BOTTOM);
	textSize(25);
	text(gameState, 1170, 175);
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
	for( let i=0; i < 5; i++ ) {
		for( let j=0; j < 5; j++ ) {
			const tile = board.tiles[i][j];
			if( tile.type === "chateau" ) {
				spritesheet.drawSprite("players", 0, 25+j*150, 25+i*150);
			} else if( tile.type === "none" ) {
				rect(25+j*150, 25+i*150,150,150);
			} else {
				spritesheet.drawSprite("tiles", getCardIndex(tile), 25+j*150, 25+i*150);
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
		spritesheet.drawSprite("meeple", 0, 1220, 225);
		spritesheet.drawSprite("meeple", 1, 1220, 425);
		spritesheet.drawSprite('back', 0, 860, 25);
		spritesheet.drawSprite('back', 0, 860, 225);
		spritesheet.drawSprite('back', 0, 860, 425);
		spritesheet.drawSprite('back', 0, 860, 625);
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
		pop();
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

function mouseClicked() {
	if( toggleDebug ) {
		uiManager.addLogger(`X=${mouseX}, Y=${mouseY}`);
	}
	toolManager.mouseClicked();
	uiManager.mouseClicked();

	if( gameState === CHOOSECARD ) {
		board.curCardClickedIndex = cardClicked();
		if( board.curCardClickedIndex >= 0 && board.curCardClickedIndex !== board.brunoCardClickedIndex ) {
			gameState = PLACECARD;
			board.brunoCardClickedIndex = board.curCardClickedIndex === 2 ? 3 : 2;
		} else {
			board.curCardClickedIndex = -1;
		}
	} else if( gameState === PLACECARD ) {
		const tilePosition = tileClicked();
		if( tilePosition && board.tryPlaceCard(tilePosition) ) {
			board.nextTurn();
			gameState = CHOOSECARD;
			if( board.curCards.length === 0 ) {
				curState = GAME_OVER_STATE;
				gameState = GAMEOVER;
			}
		}
	}

	return false;
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
			board.moveBoard(keyCode);
		}
	}
}