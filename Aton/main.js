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
const GAMEOVER = "End of game";
let gameState = CHOOSECARD;

const GAME_LOADING_STATE = 0;
const GAME_START_STATE = 1;
const GAME_PLAY_STATE = 2;
const GAME_OVER_STATE = 3;
let curState = GAME_LOADING_STATE;

let toggleDebug = false;
let lastTime = 0;

let displayRules = false;

let board = null;

function preload() {
	spritesheet.addSpriteSheet('cover', './cover.jpg', 349, 424);
}

function musicClicked() {
	// TODO
}

const speakerStorageKey = 'DrDr3ck/Aton/Speaker';

function speakerClicked() {
	speakerButton.checked = !speakerButton.checked;
	soundManager.mute(!speakerButton.checked);

	localStorage.setItem(speakerStorageKey, speakerButton.checked?"on":"off");
}

function startClicked() {
	curState = GAME_PLAY_STATE;
	uiManager.setUI([ speakerButton, rulesButton ]);
	uiManager.addLogger("Start game");
	//board.startTurn();
}

const speakerButton = new BFloatingSwitchButton(windowWidth - 70 - 10 - 70, 70, '\uD83D\uDD0A', speakerClicked);
const musicButton = new BFloatingSwitchButton(windowWidth - 70, 70, '\uD83C\uDFB6', musicClicked);
const startButton = new BButton(80, windowHeight - 50 - 200, "START", startClicked);

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
	const menu = [ speakerButton, startButton, rulesButton ];
	uiManager.setUI(menu);
}

function setup() {
    initUI();
	canvas = createCanvas(windowWidth, windowHeight);
    canvas.parent('canvas');

	spritesheet.addSpriteSheet('cards', './cards.jpg', 165, 260);
	spritesheet.addSpriteSheet('verso', './verso.png', 165, 260);
	spritesheet.addSpriteSheet('board', './board.jpg', 799, 796);

    frameRate(20);

    lastTime = Date.now();
}

function updateGame(elapsedTime) {

}

function drawGame() {
	spritesheet.drawSprite("board", 0, 300, 2);

	push();
	translate(1140+240,45);
	rotate(PI/2);
	spritesheet.drawSprite("verso", 0, 0, 0);
	translate(190, 0);
	spritesheet.drawSprite("verso", 0, 0, 0);
	translate(190, 0);
	spritesheet.drawSprite("cards", 3, 0, 0);
	translate(190, 0);
	spritesheet.drawSprite("cards", 1, 0, 0);
	pop();

	push();
	translate(270,45);
	rotate(PI/2);
	spritesheet.drawSprite("cards", 4, 0, 0);
	translate(190, 0);
	spritesheet.drawSprite("cards", 5, 0, 0);
	translate(190, 0);
	spritesheet.drawSprite("cards", 6, 0, 0);
	translate(190, 0);
	spritesheet.drawSprite("cards", 7, 0, 0);
	pop();
}

function initGame() {
	// shuffle cards
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
		//board = new Board();
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
		spritesheet.drawSprite("cover", 0, 640, 190);
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
	toolManager.mouseClicked();
	uiManager.mouseClicked();

	/*
	if( gameState === CHOOSECARD ) {
		board.curCardClickedIndex = cardClicked();
		if(
			board.curCardClickedIndex >= 0 &&
			board.curCardClickedIndex <= 3-board.lastChosenCardIndex &&
			board.curCardClickedIndex !== board.brunoCardClickedIndex
		) {
			board.brunoCardClickedIndex = board.curCardClickedIndex === 2 ? 3 : 2;
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
	} else if( gameState === PLACECARD ) {
		const tilePosition = tileClicked();
		if( tilePosition && board.tryPlaceCard(tilePosition) ) {
			board.placeCardOnTile(tilePosition);
			soundManager.playSound('place_pawn');
			nextTurn();
		}
	}
	*/

	return false;
}

function keyPressed() {
	if (key === "D") {
		toggleDebug = !toggleDebug;
	}
}