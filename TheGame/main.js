const uiManager = new UIManager();
const windowWidth = 1460;
const windowHeight = 700;
uiManager.loggerContainer = new LoggerContainer(windowWidth-300, windowHeight-300, 240, 100);
uiManager.loggerContainer.visible = true;

const cardWidth = 220;
const cardHeight = 340;

const toolManager = new ToolManager();
const jobManager = new JobManager();
const soundManager = new SoundMgr();
const spritesheet = new SpriteSheet();

const GAME_LOADING_STATE = 0;
const GAME_START_STATE = 1;
const GAME_PLAY_STATE = 2;
const GAME_OVER_STATE = 3;
let curState = GAME_LOADING_STATE;

let lastTime = 0;

let talon = [];
let cards = [];
let stacks = [[],[],[],[]];
let cardTurn = 0;

let rules = false;

function preload() {
	spritesheet.addSpriteSheet('sort', './sort.png', 50, 50);
}

function musicClicked() {
	// TODO
}

function speakerClicked() {
	speakerButton.checked = !speakerButton.checked;
	soundManager.mute(!speakerButton.checked);
}

const speakerButton = new BFloatingSwitchButton(windowWidth - 70 - 10 - 70, 70, '\uD83D\uDD0A', speakerClicked);
const musicButton = new BFloatingSwitchButton(windowWidth - 70, 70, '\uD83C\uDFB6', musicClicked);
let sortButton = null;

const rulesButton = new BFloatingButton(windowWidth - 80, 80, '?', ()=>{
	// display/hide rules
	rules = !rules;
	if( rules ) {
		sortButton.enabled = false;
		rulesButton.enabled = false;
	}
});

const sortCards = () => {
	cards = cards.sort((a,b)=>a-b);
}

const nextButton = new BFloatingButton(1320, 540, "+", ()=>{
	// put cards from talon...
	cards.forEach((c,i) => {
		if( c < 0 && talon.length > 0 ) {
			cards[i] = talon.shift();
		}
	});
	cardTurn = 0;
	nextButton.enabled = false;
	nextButton.visible = false;
	if( talon.length === 0 ) {
		nextButton.visible = false;
	}
	resetButton.visible = !canPlay();
	deltaY = [randomInt(5),randomInt(8),randomInt(5),randomInt(5),randomInt(7),randomInt(5),randomInt(5),randomInt(9)];
	sortCards();
});

const resetButton = new BButton(130, 580, "Reset", ()=>{
	initGame();
	resetButton.visible = false;
	nextButton.visible = true;
});
resetButton.setTextSize(45);

function initUI() {
    speakerButton.setTextSize(50);
	musicButton.setTextSize(50);
	musicButton.enabled = false;
	musicButton.checked = false;
	sortButton = new BImageBorderButton( windowWidth - 70,  windowHeight - 70, spritesheet.getImage('sort', 0), sortCards);
	const menu = [nextButton, resetButton, sortButton, rulesButton]; // speakerButton, musicButton ];
	uiManager.setUI(menu);
	nextButton.enabled = false;
	nextButton.visible = false;
	resetButton.visible = false;
}

function setup() {
    initUI();
	canvas = createCanvas(windowWidth, windowHeight);
    canvas.parent('canvas');

    frameRate(60);

	spritesheet.addSpriteSheet('cards', './cards.png', cardWidth, cardHeight);
	spritesheet.addSpriteSheet('rules1', './rules1.png', 460, 317);
	spritesheet.addSpriteSheet('rules2', './rules2.png', 459, 224);

    lastTime = Date.now();
}

let deltaY = [1,5,0,4,7,2,5,3];

function drawGame() {
    spritesheet.drawSprite('cards', 2, 100, 100);
    spritesheet.drawSprite('cards', 2, 100+320, 100);
    spritesheet.drawSprite('cards', 1, 100+320*2, 100);
    spritesheet.drawSprite('cards', 1, 100+320*3, 100);
	
	noStroke();
	fill(250);
	textAlign(CENTER, TOP);
	text("100",1010,100);
	text("99",370,100);
	textAlign(CENTER, BOTTOM);
	text("2",1010,440);
	text("1",370,440);

	stroke(1);
	strokeWeight(10);

	line(1010,200,1010,340);
	line(990,320,1010,340);
	line(1030,320,1010,340);

	line(370,200,370,340);
	line(350,220,370,200);
	line(390,220,370,200);

	textSize(50);
	strokeWeight(2);
	cards.forEach( (c,i) => {
		if( c === clickedCard || c < 0 ) {
			return;
		}
		const X = 100+150*i;
		const Y = windowHeight-100 + deltaY[i];
		drawCard(X,Y,c);
	});

	stacks.forEach( (s,i) => {
		if( s.length === 0 ) {
			return;
		}
		const stackX = 100+320*i;
		const stackY = 100;
		drawCard(stackX, stackY, s[s.length-1]);
	});
	
	// draw talon
	if( talon.length > 0 ) {
		drawCard(1400, 240, "");
		noStroke();
		fill(250);
		textAlign(LEFT, BOTTOM);
		text(talon.length,1400,220);
	}

	if( resetButton.visible ) {
		textAlign(CENTER, BOTTOM);
		text("End of Game", windowWidth/2, 520);
		textAlign(CENTER, TOP);
		text(`(${talon.length + cards.filter(c=>c>0).length} points)`, windowWidth/2, 530);
	}

	if( clickedCard ) {
		drawCard(mouseX-cardWidth/2,mouseY-50,clickedCard);
	}
}

function drawCard(X,Y,value) {
	spritesheet.drawSprite('cards', 0, X, Y);
	noFill();
	stroke(250);
	rect(X, Y,220,340,5);
	noStroke();
	fill(250);
	textAlign(LEFT, TOP);
	text(value, X+10, Y+10);
	textAlign(RIGHT, TOP);
	text(value, X+220-10, Y+10);
}

function initGame() {
	talon = [];
    for( let i=2; i <= 99; i++ ) {
        talon.push(i);
    }
	shuffleArray(talon);
	cards = [];
	for( let i=0; i < 8; i++ ) {
		cards.push( talon.shift() );
	}
	sortCards();
	stacks = [[],[],[],[]];
	cardTurn = 0;
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
		uiManager.addLogger('The Game');
		//uiManager.addLogger('Press S to sort');
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
	drawGame();

	if( rules ) {
		background(51, 51, 51, 200);
		spritesheet.drawSprite('rules1', 0, windowWidth/2-460/2, 110);
		spritesheet.drawSprite('rules2', 0, windowWidth/2-460/2, 110+317);
	}

	textAlign(LEFT, TOP);
    uiManager.draw();

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
	console.log(mouseX, mouseY);
	return false;
}

let clickedCard = null;

function getCardIndex(X,Y,negativ=false) {
	const cardY = windowHeight-100;
	for( let i=cards.length-1; i>= 0; i--) {
		const cardX = 100+150*i;
		if( (negativ || cards[i] > 0) && between(cardX, X, cardX+cardWidth) && Y >= cardY ) {
			return i;
		}
	}
	return -1;
}

function mousePressed() {
	if( rules ) {
		return;
	}
	// if player already clicks a card, do nothing
	if( clickedCard !== null ) {
		return;
	}
	// check which card is clicked (if any)
	const cardIndex = getCardIndex(mouseX, mouseY);
	if( cardIndex === -1 ) {
		return;
	}
	if( cards[cardIndex] > 0 ) {
		clickedCard = cards[cardIndex];
		//uiManager.addLogger(`card ${clickedCard} has been selected`)
	}
}

function between(min, value, max) {
	return value >= min && value <= max;
}

function getStack(X,Y) {
	// 100+320, 100
	for( i=0; i < 4; i++) {
		const stackX = 100+320*i;
		const stackY = 100;
		if( between(stackX, X, stackX+cardWidth) && between(stackY, Y, stackY+cardHeight) ) {
			return i;
		}
	}
	return -1;
}

function removeCardFromHand(card) {
	const cardIndex = cards.indexOf(card);
	cards[cardIndex] = -cards[cardIndex];	
}

function canBePlayed(card) {
	for( let stackIndex = 0; stackIndex < stacks.length; stackIndex++ ) {
		const stack = stacks[stackIndex];
		if( stack.length === 0 ) {
			console.log("a stack is empty");
			return true;
		}
		const topCard = stack[stack.length-1];
		// can this card be put on this stack ?
		if( stackIndex > 1 ) { // 100 to 2
			if( card < topCard || card === topCard+10) {
				console.log(`card ${card} can be put on stack ${stackIndex}`);
				return true;
			}
		} else { // 1 to 99
			if( card > topCard || card === topCard-10) {
				console.log(`card ${card} can be put on stack ${stackIndex}`);
				return true;
			}
		}
	}
	return false;
}

function canPlay() {
	const availableCards = cards.filter(c=>c>0);
	if( talon.length === 0 && availableCards.length === 0 ) {
		console.log("no more cards");
		return false;
	}
	if( talon.length > 0 && availableCards.length <= 6 ) {
		console.log("can click on 'end turn'");
		return true; // can click on 'End Turn' ?
	}
	if( talon.length === 0 ) {
		// check if one availableCards can be played
		return availableCards.some(c=>canBePlayed(c));
	}
	return availableCards.some(c=>canBePlayed(c));
}

function putCardOnStack(card, stack) {
	stack.push(card);
	removeCardFromHand(card);
	cardTurn++;
	if( cardTurn > 1 ) {
		nextButton.enabled = true;
		nextButton.visible = true;
		//uiManager.addLogger('Press + for more cards');
	}
	resetButton.visible = !canPlay();
}

function mouseReleased() {
	if( rules ) {
		rules = !rules;
		sortButton.enabled = true;
		rulesButton.enabled = true;
	}
	if( !clickedCard ) return;
	const stackIndex = getStack(mouseX, mouseY);
	if( stackIndex !== -1 ) {
		const stack = stacks[stackIndex];
		if( stack.length === 0 ) {
			putCardOnStack(clickedCard, stack);
		} else {
			const topCard = stack[stack.length-1];
			// can this card be put on this stack ?
			if( stackIndex > 1 ) { // 100 to 2
				if( clickedCard < topCard || clickedCard === topCard+10) {
					putCardOnStack(clickedCard, stack);
				}
			} else { // 1 to 99
				if( clickedCard > topCard || clickedCard === topCard-10) {
					putCardOnStack(clickedCard, stack);
				}
			}
		}
	} else {
		// moving card in the hand ?
		const cardIndex = getCardIndex(mouseX, mouseY, true);
		if( cardIndex >= 0 ) {
			const clickedCardIndex = cards.indexOf(clickedCard);
			console.log("move card from", clickedCardIndex, "to", cardIndex);
			const cardValue = cards[clickedCardIndex];
			cards = cards.filter(c=>c!==cardValue);
			cards.splice(cardIndex, 0, cardValue);
		}

	}
	clickedCard = null;
}

const generator = Math.random;
const randomInt = (i) => {
	return Math.floor(generator() * i);
}

/* Randomize array in-place using Durstenfeld shuffle algorithm */
function shuffleArray(array) {
	for (var i = array.length - 1; i > 0; i--) {
		var j = randomInt(i + 1);
		var temp = array[i];
		array[i] = array[j];
		array[j] = temp;
	}
}