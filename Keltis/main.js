const uiManager = new UIManager();
const windowWidth = 1400;
const windowHeight = 800;
uiManager.loggerContainer = new LoggerContainer(870, 10, 240, 100);
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

let board = new Board();

function preload() {
	spritesheet.addSpriteSheet('board', './board.png', 1007, 777);
	spritesheet.addSpriteSheet('cards', './cards.png', 630/3, 652/2);
}

function musicClicked() {
	// TODO
}

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

	spritesheet.addSpriteSheet('bonus', './bonus.png', 94, 94);

    frameRate(60);

    lastTime = Date.now();
}

function updateGame(elapsedTime) {

}

function drawCard(card, X, Y) {
	if( !card ) return;
	spritesheet.drawScaledSprite('cards', colors[card.color].cardIndex, X, Y, .75);
	text(card.value, X+35, Y+22);
}

const cardX = 10;
const cardY = windowHeight-150;
const cardDeltaX = 155;
const cardWidth = 210*.75;
const cardHeight = 326*.75;

function drawGame() {
	spritesheet.drawScaledSprite('board', 0, 100, 10, 0.75);
	spritesheet.drawScaledSprite('cards', 5, 745, 400, 0.5);
	stroke(0);
	noFill();
	rect(745, 400, 630/3*.5, 652/2*.5, 5);
	fill(250);
	text(`x ${board.cards.length}`, 780, 550);

	board.hand.forEach((c,i)=>{
		if( i === board.selectedCardIndex ) {
			return;
		}
		if( i === board.chosenCardIndex ) {
			return;
		}
		drawCard(c, cardX + cardDeltaX*i, cardY);
	});

	board.piles.forEach(p=>{
		if( p.cards.length === 0) {
			spritesheet.drawScaledSprite('cards', 5, p.X, p.Y, 0.5);
		} else {
			p.cards.forEach((c,j)=>{
				spritesheet.drawScaledSprite('cards', colors[c.color].cardIndex, p.X, p.Y+j*40, 0.5);
				text(c.value, p.X+20, p.Y+20+j*40);
			});
		}
	});
	if( board.discard ) {
		spritesheet.drawScaledSprite('cards', colors[board.discard.color].cardIndex, 105, 400, 0.5);
		text(board.discard.value, 105+20, 400+20);
	}
	if( board.selectedCardIndex >= 0 ) {
		const selectedCard = board.hand[board.selectedCardIndex];
		const pile = board.piles[ colors[selectedCard.color].pileIndex ];
		stroke(250);
		noFill();
		rect(pile.X, pile.Y, 210*.5, 326*.5+40*Math.max(0,pile.cards.length-1), 5);

		rect(105, 400, 210*.5, 326*.5, 5);
		spritesheet.drawScaledSprite('cards', colors[selectedCard.color].cardIndex, mouseX-cardWidth/2, mouseY-25, 0.75);
		stroke(0);
		fill(250);
		text(selectedCard.value, mouseX+20-cardWidth/2, mouseY+20-25);
	}

	// draw bonus
	board.bonus.forEach((b,i)=>{
		if( b === -1 ) return;
		const position = bonusPositions[i];
		spritesheet.drawScaledSprite('bonus', b, position.X-94*.2, position.Y-94*.2, 0.4);
	});

	// draw pions
	board.pions.forEach(p=>{
		if( p.position === -1 ) {
			return; // nothing to draw
		}
		const position = pionPositions[p.color][p.position];
		fill(250);
		stroke(0);
		ellipse(position.X, position.Y, p.size===1 ? 25 : 35, p.size===1 ? 25 : 35);
	});

	if( board.smallSize ) {
		ellipse(435, 530, 25, 25);
		if( board.smallSize > 1 ) {
			text(`x ${board.smallSize}`, 435, 560);
		}
	}
	if( board.bigSize ) {
		ellipse(515, 540, 35, 35);
	}

	// draw points
	text(board.points, 40, 291);
	spritesheet.drawScaledSprite('bonus', 4, 10, 340, 0.4);
	text(`x ${board.runes}`, 70, 358);

	if( board.state === "replay" ) {
		rowPositions.forEach((p,i)=>{
			if( board.pions[i].position < 8 ) {
				ellipse(p.X, p.Y, 25, 25);
			}
		});
	}
}

function initGame() {
	board.init();
	textSize(25);

	// uiManager.addLogger(`bonusPositions ${bonusPositions.length}`);
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
		textAlign(CENTER, CENTER);
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
		spritesheet.drawSprite('board', 0, 0, 0);
		spritesheet.drawSprite('cards', 5, 1100, 280);
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

function chooseSize(size) {
	const pion = board.pions[board.chosenRowIndex];
	pion.position = Math.min(8,pion.position+1);
	pion.size = size;
	board.state = "play";
	if( board.cards.length > 0 ) {
		const newCard = board.cards.shift();
		board.hand[board.chosenCardIndex] = newCard;
	} else {
		board.hand[board.chosenCardIndex] = null;
	}
	board.chosenCardIndex = -1;
	board.chosenRowIndex = -1;
	if( size === 1 ) {
		board.smallSize = board.smallSize-1;		
	} else {
		board.bigSize = 0;		
	}
}

function replayOnRow(rowIndex) {
	const pion = board.pions[rowIndex];
	if( pion.position === -1 && board.bigSize === 1 && board.smallSize > 0 ) {
		board.state = "choose";
		board.chosenRowIndex = rowIndex;
		return;
	}
	pion.position = Math.min(8,pion.position+1);
	if( !pion.size ) {
		pion.size = board.bigSize===1 ? 2 : 1;
	}
	board.state = "play";
	if( board.cards.length > 0 ) {
		const newCard = board.cards.shift();
		board.hand[board.chosenCardIndex] = newCard;
	} else {
		board.hand[board.chosenCardIndex] = null;
	}
	board.chosenCardIndex = -1;
	board.checkBonus(pion);
}

function mousePressed() {
	if( board.state === "choose" ) {
		// choose a 'pion' for the current row
		if( mouseX < 477 ) {
			// size 1
			chooseSize(1);
		} else {
			// size 2
			chooseSize(2);
		}
	} else if( board.state === "replay" ) {
		// choose a 'pion' in a row
		const rowIndex = board.getRowIndex(mouseX, mouseY);
		if( rowIndex >= 0 ) {
			replayOnRow(rowIndex);
		}
	} else if( board.state === "play" ) {	
		if( board.selectedCardIndex === -1 ) {
			board.hand.forEach((c,i)=>{
				if( c && mouseX > cardX+cardDeltaX*i && mouseX < cardX+cardDeltaX*i+cardWidth && mouseY > cardY && mouseY < cardY+cardHeight ) {
					board.selectedCardIndex = i;
				}
			});
		}
	}
}
function mouseReleased() {
	if( board.selectedCardIndex === -1 ) {
		return;
	}
	// check if card is drop on a 'pile'
	const curCard = board.hand[board.selectedCardIndex];
	const pileIndex = board.getPileIndex(mouseX, mouseY);
	if( pileIndex >= 0 && pileIndex === colors[curCard.color].pileIndex ) {
		// drop card ?
		if( board.dropCard(curCard, pileIndex) ) {
			uiManager.addLogger("dropped");
			// remove card and take another one
			if( board.cards.length > 0 ) {
				const newCard = board.cards.shift();
				board.hand[board.selectedCardIndex] = newCard;
			} else {
				board.hand[board.selectedCardIndex] = null;
			}
		}
	}
	if( board.onDiscardZone(mouseX,mouseY) ) {
		// discard card and get a new one
		board.discard = curCard;
		if( board.cards.length > 0 ) {
			const newCard = board.cards.shift();
			board.hand[board.selectedCardIndex] = newCard;
		} else {
			board.hand[board.selectedCardIndex] = null;
		}
	}
	board.selectedCardIndex = -1;
}

function mouseClicked() {
	if( toggleDebug ) {
		uiManager.addLogger(`X=${mouseX}, Y=${mouseY}`);
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