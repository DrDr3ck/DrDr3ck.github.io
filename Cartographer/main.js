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

function startClicked() {
    gameState = GAME_PLAY_STATE;
	uiManager.setUI([]);
	//board = new Board();
	//board.init();
}

const startButton = new BButton(130, window_height - 80, "START", startClicked);
startButton.setTextSize(45);
startButton.visible = false;
const menu = [startButton];
uiManager.setUI(menu);

let lastTime = 0;

const PRINTEMPS = 0;
const ETE = 1;
const AUTOMNE = 2;
const HIVER = 3;

let season = PRINTEMPS;

let board = null;

const cardHeight = 276;//Card.height;
const cardWidth = 200;//Card.width;

function preload() {
	spritesheet.addSpriteSheet('decret', './decret.png', cardWidth, cardHeight);
	spritesheet.addSpriteSheet('season', './season.png', cardWidth, cardHeight);
}

function setup() {
	canvas = createCanvas(window_width, window_height);
	canvas.parent("canvas");

	frameRate(60);

	spritesheet.addSpriteSheet('forest', './decret-forest.png', cardWidth, cardHeight);
	spritesheet.addSpriteSheet('zone', './decret-zone.png', cardWidth, cardHeight);
	spritesheet.addSpriteSheet('ville', './decret-ville.png', cardWidth, cardHeight);
	spritesheet.addSpriteSheet('champs', './decret-champs.png', cardWidth, cardHeight);
	//spritesheet.addSpriteSheet('icons', './icons.png', 200, 200);

	uiManager.addLogger("Cartographer");
	uiManager.addLogger(`Screen size: ${window.screen.width.toString()}x${window.screen.height.toString()}`);
	lastTime = Date.now();
}

let debugCurCard = 0;

function drawBoard() {
	let topY = 50*scale;
	drawDecretCard(100, topY,"A", season === PRINTEMPS || season === HIVER);
	drawDecretCard(100+cardWidth*scale+20,topY,"B", season === PRINTEMPS || season === ETE);
	drawDecretCard(100+(cardWidth*scale+20)*2,topY,"C", season === ETE || season === AUTOMNE);
	drawDecretCard(100+(cardWidth*scale+20)*3,topY,"D", season === AUTOMNE || season === HIVER);

	topY = 25;
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
		drawDecretCard(100, topY+50*scale,"forest", season === PRINTEMPS || season === HIVER);
		drawDecretCard(100+cardWidth*scale+20,topY+50*scale,"zone", season === PRINTEMPS || season === ETE);
		drawDecretCard(100+(cardWidth*scale+20)*2,topY+50*scale,"ville", season === ETE || season === AUTOMNE);
		drawDecretCard(100+(cardWidth*scale+20)*3,topY+50*scale,"champs", season === AUTOMNE || season === HIVER);
		//debug
		drawExplorationCard(200,window_height-cardHeight*scale-20, 2);
		drawExplorationCard(200+50,window_height-cardHeight*scale-20, 1);
		//end debug
	}
}

function drawEmptyCard(X,Y) {
	strokeWeight(4);
	rect(X, Y, cardWidth*scale, cardHeight*scale, 20);
	strokeWeight(1);
}

function drawExplorationCard(X,Y, time) {
	fill(250,150,10);
	stroke(0);
	drawEmptyCard(X,Y);
	textAlign(CENTER, CENTER);
	textSize(25);
	fill(25);
	text(time.toString(), X+20,Y+20);	
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

function drawDecretCard(X,Y,title,selection) {
	const decrets = ["A","B","C","D"];
	const index = decrets.indexOf(title);
	if( index >= 0 ) {
		spritesheet.drawScaledSprite('decret', index, X, Y, scale);
	} else {
		spritesheet.drawScaledSprite(title, 0, X, Y, scale);
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
}

