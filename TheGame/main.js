const uiManager = new UIManager();
const windowWidth = 1460;
const windowHeight = 800;
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

function preload() {
    spritesheet.addSpriteSheet('cards', './cards.png', cardWidth, cardHeight);
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

const nextButton = new BButton(130, 580, "END TURN", ()=>{
	// put cards from talon...
	cards.forEach((c,i) => {
		if( c < 0 && talon.length > 0 ) {
			cards[i] = talon.shift();
		}
	});
	cardTurn = 0;
	nextButton.enabled = false;
	if( talon.length === 0 ) {
		nextButton.visible = false;
	}
});
nextButton.setTextSize(45);

const resetButton = new BButton(130, 580, "Reset", ()=>{
	initGame();
});
resetButton.setTextSize(45);

function initUI() {
    speakerButton.setTextSize(50);
	musicButton.setTextSize(50);
	musicButton.enabled = false;
	musicButton.checked = false;
	const menu = [nextButton, resetButton]; // speakerButton, musicButton ];
	uiManager.setUI(menu);
	nextButton.enabled = false;
	resetButton.visible = false;
}

function setup() {
    initUI();
	canvas = createCanvas(windowWidth, windowHeight);
    canvas.parent('canvas');

    frameRate(60);

    lastTime = Date.now();
}

function updateGame(elapsedTime) {

}

function drawGame() {
    spritesheet.drawSprite('cards', 1, 100, 100);
    spritesheet.drawSprite('cards', 1, 100+320, 100);
    spritesheet.drawSprite('cards', 2, 100+320*2, 100);
    spritesheet.drawSprite('cards', 2, 100+320*3, 100);
	
	noStroke();
	fill(250);
	textAlign(CENTER, TOP);
	text("100",370,100);
	text("99",1010,100);
	textAlign(CENTER, BOTTOM);
	text("2",370,440);
	text("1",1010,440);

	stroke(1);
	strokeWeight(10);

	line(370,200,370,340);
	line(350,320,370,340);
	line(390,320,370,340);

	line(1010,200,1010,340);
	line(990,220,1010,200);
	line(1030,220,1010,200);

	const deltaY = [1,5,0,4,7,2,5,3];
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

	drawCard(1400, 340, "");
	noStroke();
	fill(250);
	textAlign(LEFT, BOTTOM);
	text(talon.length,1400,320);

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
	if (curState === GAME_PLAY_STATE) {
		updateGame(elapsedTime);
	}
	drawGame();

    uiManager.draw();
	if (toolManager.currentTool) {
		toolManager.currentTool.draw();
	}
    jobManager.draw();
    
    lastTime = currentTime;
}

function mouseClicked() {
	toolManager.mouseClicked();
	uiManager.mouseClicked();
	console.log(mouseX, mouseY);
	return false;
}

let clickedCard = null;

function mousePressed() {
	// if player already clicks a card, do nothing
	if( clickedCard !== null ) {
		return;
	}
	// check which card is clicked (if any)
	const Y = windowHeight-100;
	for( let i=cards.length-1; i>= 0; i--) {
		const X = 100+150*i;
		if( cards[i] > 0 && between(X, mouseX, X+cardWidth) && mouseY >= Y ) {
			clickedCard = cards[i];
			uiManager.addLogger(`card ${clickedCard} has been selected`)
			return;
		}
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

function canPlay() {
	if( talon.length === 0 && cards.filter(c=>c>0).length === 0 ) {
		return false;
	}
	return true;
}

function putCardOnStack(card, stack) {
	stack.push(card);
	removeCardFromHand(card);
	cardTurn++;
	if( cardTurn > 1 ) {
		nextButton.enabled = true;
	}
	resetButton.visible = !canPlay();
}

function mouseReleased() {
	if( !clickedCard ) return;
	const stackIndex = getStack(mouseX, mouseY);
	if( stackIndex !== -1 ) {
		const stack = stacks[stackIndex];
		if( stack.length === 0 ) {
			putCardOnStack(clickedCard, stack);
		} else {
			const topCard = stack[stack.length-1];
			// can this card be put on this stack ?
			if( stackIndex <= 1 ) { // 100 to 2
				if( clickedCard < topCard || clickedCard === topCard+10) {
					putCardOnStack(clickedCard, stack);
				}
			} else { // 1 to 99
				if( clickedCard > topCard || clickedCard === topCard-10) {
					putCardOnStack(clickedCard, stack);
				}
			}
		}
	}
	clickedCard = null;
}

/* Randomize array in-place using Durstenfeld shuffle algorithm */
function shuffleArray(array) {
	const generator = Math.random;
	const randomInt = (i) => {
        return Math.floor(generator() * i);
    }
	for (var i = array.length - 1; i > 0; i--) {
		var j = randomInt(i + 1);
		var temp = array[i];
		array[i] = array[j];
		array[j] = temp;
	}
}