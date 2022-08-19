const uiManager = new UIManager();
const windowWidth = 1800;
const windowHeight = 1000;
uiManager.loggerContainer = new LoggerContainer(windowWidth-300, windowHeight-100, 240, 100);
uiManager.loggerContainer.visible = true;

const toolManager = new ToolManager();
const jobManager = new JobManager();
const soundManager = new SoundMgr();
const spritesheet = new SpriteSheet();

const soutiens = [
	["financiers"], ["generaux"], ["financiers","generaux"], ["financiers"], ["generaux"]
];

const materiauxCards = [
	0,0,0,0,0,0,
	1,1,1,1,1,
	2,2,2,2,2,
	3,3,3,3,3,3,3,
	4,4,
	5,5,5,5,5,
	6,6,6,6,6,6,6,
	7,7,7,7,7,7,
	8,8,8,8,8,8,8
];
const energieCards = [
	0,0,
	1,1,1,
	2,2,2,2,2,2,2,
	3,3,3,3,
	4,4,4,4,4,4,
	5,5,5,
	6,7,
	8,8,8,8
];
const orCards = [
	0,0,1,1,2,2,3,3,4,4,
	5,5,6,7,8,9,
	10,11,12,12,13,14,
    15,15,16,16,17,18,19
];
const scienceCards = [
	0,1,2,3,4,5,6,7,8,9,
	10,11,12,13,14,15,16,17,18,19,
	20,21,22
];
const explorationCards = [
	0,1,2,3,4,5,
	6,7,8,9,10,11,
	12,13,14,15,16
];

const cards = [];
materiauxCards.forEach(c=>cards.push({type: "materiaux", index: c}));
energieCards.forEach(c=>cards.push({type: "energie", index: c}));
orCards.forEach(c=>cards.push({type: "or", index: c}));
scienceCards.forEach(c=>cards.push({type: "science", index: c}));
explorationCards.forEach(c=>cards.push({type: "exploration", index: c}));

console.log(cards.length);

const hand = [];

const construction = [];

const empire = [];

let selectedCardIndex = -1;

let overConstructionZone = false;
let overRecycleZone = false;
let overDefausseZone = false;

let corner = {X:0,Y:0};
const spriteSize = {width: 240, height: 365};
let imageNb = 0;

const description = [
	{title: "Brise-Glace", count: 4, construction: {energy: 3, science: 1}, production: {exploration: 2}, recyclage: "exploration", type: "energy"},
	{title: "Zone Portuaire", count: 2, construction: {or: 5}, production: {pv: 2, materiaux: 2, or: 2}, recyclage: "or", bonus: {financiers: 2}, type: "or"},
	{title: "Usine de Recyclage", count: 7, construction: {materiaux: 2}, production: {materiaux: 2}, recyclage: "materiaux", type: "materiaux"},
	{title: "Centre de la Terre", count: 1, construction: {exploration: 5, generaux: 2}, production: {pv: 15}, recyclage: "exploration", type: "exploration"},
	{title: "Réseau de Transport", count: 2, construction: {materiaux: 3}, production: {pvMult: "energy"}, recyclage: "materiaux", type: "materiaux"},
	{title: "Division de Chars"},
	{title: "Tour Géante"},
	{title: "Laboratoire Secret"},
	{title: "Continent Perdu de Mu"},
	{title: "Greffes Bioniques"},
];

const GAME_LOADING_STATE = 0;
const GAME_START_STATE = 1;
const GAME_PLAY_STATE = 2;
const GAME_OVER_STATE = 3;
let curState = GAME_LOADING_STATE;
let toggleDebug = false;
let lastTime = 0;

function randomInt(i) {
	return Math.floor(Math.random() * i);
}

function shuffleArray(array) {
	for (var i = array.length - 1; i > 0; i--) {
		var j = randomInt(i + 1);
		var temp = array[i];
		array[i] = array[j];
		array[j] = temp;
	}
}

function preload() {
	spritesheet.addSpriteSheet('board', './board.png', 2196, 580);

	spritesheet.addSpriteSheet('cover', './cover.jpg', 1200, 800);
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
const startButton = new BButton(80, windowHeight - 50, "START", startClicked);

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

    frameRate(60);

	spritesheet.addSpriteSheet('empires', './empires.png', 370, 230);

	spritesheet.addSpriteSheet('verso', './verso.png', 240, 365);
	spritesheet.addSpriteSheet('materiaux', './materiaux.png', 240, 365);
	spritesheet.addSpriteSheet('energie', './energie.png', 240, 365);
	spritesheet.addSpriteSheet('or', './or.png', 240, 365);
	spritesheet.addSpriteSheet('science', './science.png', 240, 365);
	spritesheet.addSpriteSheet('exploration', './exploration.png', 240, 365);

    lastTime = Date.now();
}

function updateGame(elapsedTime) {

}

const scale = 0.9;

function drawCard(card, X, Y) {
	if( card.type === "none" ) {
		return;
	}
	spritesheet.drawScaledSprite(card.type, card.index, X, Y, scale);
}

const handX = 350
const handDeltaX = 220;
const handY = 665;
const cardWidth = 240*scale;
const cardHeight = 365*scale;

function drawGame() {
	if( overRecycleZone ) {
		fill(150);
		stroke(150);
		rect(350, 5, 1100, 280, 55);
	}
	spritesheet.drawScaledSprite('board', 0, 350, 0, 0.5);
	
	spritesheet.drawScaledSprite('verso', 0, windowWidth-cardWidth-5, windowHeight-cardHeight-5, 0.9);
	if( overDefausseZone ) {
		stroke(250);
		strokeWeight(3);
		rect(windowWidth-cardWidth-5, windowHeight-cardHeight-5, cardWidth, cardHeight, 5);
	}

	// main
	hand.forEach((c,i)=>{
		if( i !== selectedCardIndex ) {
			drawCard(c, handX+handDeltaX*i, handY);
		}
	});
	
	spritesheet.drawScaledSprite('empires', 0, 10, 770, scale);

	
	if( overConstructionZone ) {
		fill(150);
		stroke(150);
		strokeWeight(3);
	} else {
		noFill();
		stroke(0);
		strokeWeight(1);
	}
	rect(350, 300, 1400, 360, 25);

	// en cours de construction
	construction.forEach((c,i)=>drawCard(c, 350+220*i+10, 300+15));

	// empire
	empire.forEach((c,i)=>drawCard(c, 125, 437-35*i));

	// draw selected card if any
	if( selectedCardIndex >= 0 ) {
		drawCard(hand[selectedCardIndex], mouseX-cardWidth/2, mouseY-cardHeight/2);
	}
}

function fillHand() {
	for( let i = 0; i < 5; i++ ) {
		hand.push( cards.pop() );
	}
}

function initGame() {
	shuffleArray(cards);
	fillHand();
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
		fill(250);
		stroke(0);
		textSize(75);
		text("It's a wonderful world", 300, 75);
		spritesheet.drawSprite("cover", 0, (windowWidth-1200)/2, (windowHeight-800)/2);
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

function mouseMoved() {
	overConstructionZone = false;
	overRecycleZone = false;
	overDefausseZone = false;
	if( selectedCardIndex >= 0 ) {
		if( mouseX >= 350 && mouseY >= 300 && mouseX <= 350+1400 && mouseY <= 300+360) {
			overConstructionZone = true;
		}
		if( mouseX >= 350 && mouseY >= 5 && mouseX <= 350+1100 && mouseY <= 5+280) {
			overRecycleZone = true;
		}
		if( mouseX >= windowWidth-cardWidth-5 && mouseY >= windowHeight-cardHeight-5 && mouseX <= windowWidth-5 && mouseY <= windowHeight-5 ) {
			overDefausseZone = true;
		}
	}
}

function mouseClicked() {
	if( toggleDebug ) {
		uiManager.addLogger(`X=${mouseX}, Y=${mouseY}`);
	}
	if( selectedCardIndex === -1 ) {
		hand.forEach((c,i)=>{
			if( c.type === "none" ) {
				return;
			}
			const cX = handX+handDeltaX*i;
			const cY = handY;
			if( mouseX > cX && mouseX < cX+cardWidth && mouseY > cY && mouseY < cY+cardHeight ) {
				selectedCardIndex = i;
			}
		});
	} else {
		if( overConstructionZone ) {
			const selectedCard = hand[selectedCardIndex];
			construction.push({...selectedCard});
			selectedCard.type = "none";
		}
		if( overRecycleZone ) {
			// TODO: get cube
			const selectedCard = hand[selectedCardIndex];
			selectedCard.type = "none";
		}
		if( overDefausseZone ) {
			const selectedCard = hand[selectedCardIndex];
			selectedCard.type = "none";
		}
		selectedCardIndex = -1;
	}
	toolManager.mouseClicked();
	uiManager.mouseClicked();
	return false;
}

function keyPressed() {
	if( key === "a" ) {
		// to do
		corner = {X: mouseX, Y: mouseY};
	}
	if( key === "c" ) {
		// copy image
		copy(corner.X, corner.Y, spriteSize.width, spriteSize.height, spriteSize.width*imageNb, 0, spriteSize.width, spriteSize.height);
		imageNb = imageNb + 1;
	}
	if (key === "D") {
		toggleDebug = !toggleDebug;
	}
}