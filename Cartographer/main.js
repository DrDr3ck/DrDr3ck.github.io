const window_width = window.screen.width > 1460 ? 1460 : window.screen.width;
const window_height = window.screen.height > 800 ? 800 : window.screen.height;

const scale = window_width < 800 ? .5 : 1;

const uiManager = new UIManager();
uiManager.loggerContainer = new LoggerContainer(
	window_width - 240,
	window_height - 300*scale,
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
const GAME_END_STATE = 4;
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

let toggleDebug = false;

let curSeasonCards = [];

/* Randomize array in-place using Durstenfeld shuffle algorithm */
function shuffleArray(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
}

function startClicked() {
    gameState = GAME_PLAY_STATE;
	uiManager.setUI([nextButton]);
	//board = new Board();
	//board.init();
	cards = [0,1,2,3,4,5,6,7,8,9,10,11,11];
	embuscades.push(...[12,13,14,15]);
	shuffleArray(embuscades);
	const curEmbuscade = embuscades.shift();
	cards.push(curEmbuscade);
	shuffleArray(cards);
	nextClicked();
}

function seasonMaxSum() {
	switch(season) {
		case PRINTEMPS:
		case ETE:
			return 8;
		case AUTOMNE:
			return 7;
		case HIVER:
		default:
			return 6;
	}
}

// add a card or switch to next season or end the party
function nextClicked() {
	delta = 0;
	if( curSum >= seasonMaxSum() ) {
		uiManager.setUI([nextButton]);
		// change season
		switch(season) {
			case PRINTEMPS:
				season = ETE;
				break;
			case ETE:
				season = AUTOMNE;
				break;
			case AUTOMNE:
				season = HIVER;
				break;
			case HIVER:
			default:
				season = END;
				break;
		}
		// reset cards
		cards = [0,1,2,3,4,5,6,7,8,9,10,11,11];
		const curEmbuscade = embuscades.shift();
		cards.push(curEmbuscade);
		shuffleArray(cards);
		curSum = 0;
		curSeasonCards = [];
	}
	const curCard = cards.shift();
	curSeasonCards.push(curCard);
	curSum += times[curCard];
	if( curSum >= seasonMaxSum() ) {
		if( season === HIVER ) {
			uiManager.setUI([]);
		} else {
			uiManager.setUI([newSeason]);
		}
	}
}

const startButton = new BButton(80, window_height - 100, "START", startClicked);
const nextButton = new BButton(window_width - 80 - 400*scale, window_height - 100, "NEXT", nextClicked);
const newSeason = new BButton(window_width/2-200*scale, window_height/2+40*scale, "SEASON", nextClicked);
startButton.setTextSize(45*scale);
startButton.w = 400*scale;
nextButton.setTextSize(45*scale);
nextButton.w = 400*scale;
newSeason.setTextSize(45*scale);
newSeason.w = 400*scale;
const menu = [startButton];
uiManager.setUI(menu);


let curSum = 0;

const PRINTEMPS = 0;
const ETE = 1;
const AUTOMNE = 2;
const HIVER = 3;
const END = -1;

let season = PRINTEMPS;

let cards = []; // cards for the current season
const times = [1,1,1,1,2,2,2,2,2,0,2,0,0,0,0,0];
const embuscades = [];

const cardHeight = 276;//Card.height;
const cardWidth = 200;//Card.width;

function preload() {
	spritesheet.addSpriteSheet('decret', './decret.png', cardWidth, cardHeight);
	spritesheet.addSpriteSheet('season', './season.png', cardWidth, cardHeight);
	spritesheet.addSpriteSheet('exploration', './exploration.png', cardWidth, cardHeight);
	spritesheet.addSpriteSheet('forest', './decret-forest.png', cardWidth, cardHeight);
	spritesheet.addSpriteSheet('zone', './decret-zone.png', cardWidth, cardHeight);
	spritesheet.addSpriteSheet('ville', './decret-ville.png', cardWidth, cardHeight);
	spritesheet.addSpriteSheet('champs', './decret-champs.png', cardWidth, cardHeight);
}

function setup() {
	canvas = createCanvas(window_width, window_height);
	canvas.parent("canvas");

	frameRate(60);

	uiManager.addLogger("Cartographer");
	uiManager.addLogger(`Screen size: ${window.screen.width.toString()}x${window.screen.height.toString()}`);
	lastTime = Date.now();
}

const types = ["forest", "zone", "ville", "champs"];
shuffleArray(types);
const occurrences = [Math.floor(Math.random() * 4), Math.floor(Math.random() * 4), Math.floor(Math.random() * 4), Math.floor(Math.random() * 4)];

function drawBoard() {
	let topY = 50*scale;
	drawDecretCard(100, topY,"A", 0, season === PRINTEMPS || season === HIVER);
	drawDecretCard(100+cardWidth*scale+20,topY,"B", 1, season === PRINTEMPS || season === ETE);
	drawDecretCard(100+(cardWidth*scale+20)*2,topY,"C", 2, season === ETE || season === AUTOMNE);
	drawDecretCard(100+(cardWidth*scale+20)*3,topY,"D", 3, season === AUTOMNE || season === HIVER);

	topY = 20;
	const seasonX = 100 + (cardWidth*scale+20)*4.5;
	if( season <= HIVER ) {
		drawSeasonCard(seasonX, topY, "hiver");
	}
	if( season <= AUTOMNE ) {
		drawSeasonCard(seasonX, topY+20, "automne");
	}
	if( season <= ETE ) {
		drawSeasonCard(seasonX, topY+40, "ete");
	}
	if( season <= PRINTEMPS ) {
		drawSeasonCard(seasonX, topY+60, "printemps");
	}
	
	if (gameState === GAME_PLAY_STATE) {
		drawDecretCard(100, topY+50*scale,types[0],occurrences[0], season === PRINTEMPS || season === HIVER);
		drawDecretCard(100+cardWidth*scale+20,topY+50*scale,types[1],occurrences[1], season === PRINTEMPS || season === ETE);
		drawDecretCard(100+(cardWidth*scale+20)*2,topY+50*scale,types[2],occurrences[2], season === ETE || season === AUTOMNE);
		drawDecretCard(100+(cardWidth*scale+20)*3,topY+50*scale,types[3],occurrences[3], season === AUTOMNE || season === HIVER);

		for( let i = 0; i < curSeasonCards.length+delta; i++ ) {
			const card = curSeasonCards[i];
			drawExplorationCard(50+50*scale*i,window_height-cardHeight*scale-20, card);	
		}
	}
}

let delta = 0;

function drawEmptyCard(X,Y) {
	strokeWeight(4);
	rect(X, Y, cardWidth*scale, cardHeight*scale, 20);
	strokeWeight(1);
}

function drawExplorationCard(X,Y, index) {
	fill(250,150,10);
	stroke(0);
	drawEmptyCard(X,Y);
	textAlign(CENTER, CENTER);
	textSize(25);
	fill(25);
	text(index.toString(), X+20,Y+20);	
	spritesheet.drawScaledSprite('exploration', index, X, Y, scale);
}

function drawSeasonCard(X,Y,title) {
	const decrets = ["printemps","ete","automne","hiver"];
	const index = decrets.indexOf(title);
	if( index >= 0 ) {
		spritesheet.drawScaledSprite('season', index, X, Y, scale);
	}
	strokeWeight(4);
	noFill();
	rect(X, Y, cardWidth*scale, cardHeight*scale, 10);
}

function drawDecretCard(X,Y,title,index,selection) {
	const decrets = ["A","B","C","D"];
	if( decrets.includes(title) ) {
		spritesheet.drawScaledSprite('decret', index, X, Y, scale);
	} else {
		spritesheet.drawScaledSprite(title, index, X, Y, scale);
	}
	if( selection ) {
		stroke(255,228,180);
	} else {
		stroke(10);
	}
	strokeWeight(4);
	noFill();
	rect(X, Y, cardWidth*scale, cardHeight*scale, 10);
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
	console.log(mouseX, mouseY);
}

function mouseReleased() {
}

function keyPressed() {
	if (key === "D") {
		toggleDebug = !toggleDebug;
	}

	if (key === "P") {
		delta = Math.max(delta-1, -curSeasonCards.length);
		nextButton.enabled = (delta === 0);
		newSeason.enabled = (delta === 0);
	}

	if (key === "N") {
		delta = Math.min(delta+1, 0);
		nextButton.enabled = (delta === 0);
		newSeason.enabled = (delta === 0);
	}
}

