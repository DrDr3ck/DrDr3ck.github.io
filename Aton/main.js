const uiManager = new UIManager();
const windowWidth = 1400;
const windowHeight = 900;
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

const BLUE = 0;
const RED = 1;

const colors = [
 {r:127,g:167,b:202},
 {r:236,g:155,b:95}
];

const GAME_LOADING_STATE = 0;
const GAME_START_STATE = 1;
const GAME_PLAY_STATE = 2;
const GAME_OVER_STATE = 3;
let curState = GAME_LOADING_STATE;

let toggleDebug = false;
let lastTime = 0;

let displayRules = false;

const tileWidth = 35;
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
const cards = [1,1,1,1,1,1,1,1,1,2,2,2,2,2,2,2,2,2,3,3,3,3,3,3,3,3,3,4,4,4,4,4,4,4,4,4];
let board = null;
let playerIndex = 0; // BLUE or RED

const cardsPosition = [
	[
		{X:10, Y:45, width: 260, height:165}, {X:10, Y:45+190, width: 260, height:165},
		{X:10, Y:45+190+190, width: 260, height:165}, {X:10, Y:45+190+190+190, width: 260, height:165}
	],
	[
		{X:1130, Y:45, width: 260, height:165}, {X:1130, Y:45+190, width: 260, height:165},
		{X:1130, Y:45+190+190, width: 260, height:165}, {X:1130, Y:45+190+190+190, width: 260, height:165}
	]
]

const curCards = [
	[],[] // #0 for player BLUE and #1 for player RED
];

let overCardIdx = -1;
let selectedCardIdx = -1;

const points = [0,0];

function preload() {
	spritesheet.addSpriteSheet('cover', './cover.jpg', 450, 635);
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
const startButton = new BButton(680, windowHeight - 50 - 200, "START", startClicked);

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

	spritesheet.addSpriteSheet('cards', './cards.png', 260, 165);
	spritesheet.addSpriteSheet('verso', './verso.png', 260, 165);
	spritesheet.addSpriteSheet('board', './board.jpg', 799, 796);

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
			case 1:
				return 1; 
			case 2:
				return 3;
			case 3:
				return 5;
		}
		return 7;
	}
}

function drawCard(color, index, position) {
	const cardPosition = position ? position : cardsPosition[color][index];
	if( curCards[color][index].visible ) {
		if( (color === playerIndex && index !== selectedCardIdx) || position ) {
			spritesheet.drawSprite("cards", cardIndex(color,curCards[color][index].value), cardPosition.X, cardPosition.Y);
		}
	} else {
		spritesheet.drawSprite("verso", color, cardPosition.X, cardPosition.Y);
	}
	if( index === overCardIdx && color === playerIndex ) {
		rect(cardPosition.X, cardPosition.Y, cardPosition.width, cardPosition.height, 20);
	}
}

function drawPoints() {
	push();
	strokeWeight(1);
	stroke(0);
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
		arc(bluePointTile.X, bluePointTile.Y, tileWidth/2, tileWidth/2, 0, PI, CHORD);
	} else {
		ellipse(bluePointTile.X, bluePointTile.Y, tileWidth/2);
	}
	pop();
}

function drawGame() {
	spritesheet.drawSprite("board", 0, 300, 2);

	push();
	noFill();
	strokeWeight(3);
	stroke(0);
	// RED
	drawCard(RED, 0);
	drawCard(RED, 1);
	drawCard(RED, 2);
	drawCard(RED, 3);

	// BLUE
	drawCard(BLUE, 0);
	drawCard(BLUE, 1);
	drawCard(BLUE, 2);
	drawCard(BLUE, 3);

	drawPoints();

	if( selectedCardIdx !== -1 ) {
		drawCard(playerIndex, selectedCardIdx, {X: mouseX, Y: mouseY, width: 260, height: 165});
	}
	pop();

	// DEBUG: tile position
	/*
	fill(colors[BLUE].r, colors[BLUE].g, colors[BLUE].b);
	strokeWeight(1);
	stroke(0);
	tilesPosition[0].forEach(tile=>ellipse(tile.X, tile.Y, tileWidth));
	tilesPosition[1].forEach(tile=>ellipse(tile.X, tile.Y, tileWidth));
	tilesPosition[2].forEach(tile=>ellipse(tile.X, tile.Y, tileWidth));
	tilesPosition[3].forEach(tile=>ellipse(tile.X, tile.Y, tileWidth));
	tilesPosition[4].forEach(tile=>ellipse(tile.X, tile.Y, tileWidth));
	tilesPosition[5].forEach(tile=>arc(tile.X, tile.Y, tileWidth/2, tileWidth/2, PI, 2*PI, CHORD));
	fill(colors[RED].r, colors[RED].g, colors[RED].b);
	tilesPosition[5].forEach(tile=>arc(tile.X, tile.Y, tileWidth/2, tileWidth/2, 0, PI, CHORD));
	*/
}

function initGame() {
	// shuffle cards
	shuffleArray(cards);

	// TODO: server
	curCards[0].push({value: cards.pop(), visible: true});
	curCards[0].push({value: cards.pop(), visible: true});
	curCards[0].push({value: cards.pop(), visible: true});
	curCards[0].push({value: cards.pop(), visible: true});
	curCards[1].push({value: cards.pop(), visible: false});
	curCards[1].push({value: cards.pop(), visible: false});
	curCards[1].push({value: cards.pop(), visible: false});
	curCards[1].push({value: cards.pop(), visible: false});
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
		spritesheet.drawSprite("cover", 0, 90, 100);
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
}

const between = (min, value, max) => {
	return value >= min && value <= max;
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
		cardsPosition[playerIndex].forEach((card,index)=>{
			if( mouseOverCard(card) ) {
				overCardIdx = index;
			}
		});
	} else {
		cardsPosition[playerIndex].forEach((card,index)=>{
			if( index !== selectedCardIdx && mouseOverCard(card) ) {
				// switch cards
				const curCard = curCards[playerIndex][selectedCardIdx];
				curCards[playerIndex].splice(selectedCardIdx, 1);
				curCards[playerIndex].splice(index, 0, curCard);
				/*
				
				curCards[playerIndex][selectedCardIdx] = curCards[playerIndex][index];
				curCards[playerIndex][index] = curCard;
				*/
				selectedCardIdx = index;
			}
		});
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
	if( overCardIdx !== -1 ) {
		selectedCardIdx = overCardIdx;
		overCardIdx = -1;
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

/* Randomize array in-place using Durstenfeld shuffle algorithm */
const shuffleArray = (array) => {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i+1))
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
}