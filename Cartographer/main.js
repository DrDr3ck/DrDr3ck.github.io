const window_width = window.screen.width > 1460 ? 1460 : window.screen.width;
const window_height = window.screen.height > 800 ? 800 : window.screen.height;

const uiManager = new UIManager();
uiManager.loggerContainer = new LoggerContainer(
	window_width - 240,
	window_height - 300,
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

const startButton = new BButton(130, window_height/2, "START", startClicked);
startButton.setTextSize(45);
startButton.visible = false;
const menu = [startButton];
uiManager.setUI(menu);

let lastTime = 0;

let board = null;

const cardHeight = 276;//Card.height;
const cardWidth = 200;//Card.width;

function setup() {
	canvas = createCanvas(window_width, window_height);
	canvas.parent("canvas");

	frameRate(60);

	spritesheet.addSpriteSheet('decret', './decret.png', cardWidth, cardHeight);
	//spritesheet.addSpriteSheet('icons', './icons.png', 200, 200);

	uiManager.addLogger("Cartographer");
	uiManager.addLogger(`Screen size: ${window.screen.width.toString()}x${window.screen.height.toString()}`);
	lastTime = Date.now();
}

let debugCurCard = 0;

function drawBoard() {
	const topY = 50;
	if (gameState === GAME_PLAY_STATE) {
		drawDecretCard(100,topY,"A", true);
		drawDecretCard(100+cardWidth+20,topY,"B", true);
		drawDecretCard(100+(cardWidth+20)*2,topY,"C", false);
		drawDecretCard(100+(cardWidth+20)*3,topY,"D", false);

		drawSeasonCard(1150, topY, "D A","Hiver", 6);
		drawSeasonCard(1150, topY+20, "C D","Automne", 7);
		drawSeasonCard(1150, topY+40, "B C","Ete", 8);
		drawSeasonCard(1150, topY+60, "A B","Printemps", 8);

		//debug
		drawExplorationCard(200,topY+cardHeight+50, 2);
		drawExplorationCard(200+50,topY+cardHeight+50, 1);
		//end debug
	}
}

function drawEmptyCard(X,Y) {
	strokeWeight(4);
	rect(X, Y, cardWidth, cardHeight, 20);
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

function drawSeasonCard(X,Y,title1,title2,sum) {
	if( title1 === "AB") {
		spritesheet.drawScaledSprite('AB', 0, X, Y, 1);
		return;
	}
	fill(50,50,150);
	stroke(0);
	drawEmptyCard(X,Y);

	textAlign(CENTER, CENTER);
	textSize(55);
	fill(255);
	text(title1, X+cardWidth/2,Y+cardHeight/4);	
	textSize(30);
	text(title2, X+cardWidth/2,Y+3*cardHeight/4);	
	textSize(25);
	text(sum.toString(), X+cardWidth-20,Y+20);	
}

function drawDecretCard(X,Y,title,selection) {
	if( title === "D") {
		spritesheet.drawScaledSprite('decret', 3, X, Y, 1);
	}
	if( title === "C") {
		spritesheet.drawScaledSprite('decret', 2, X, Y, 1);
	}
	if( title === "B") {
		spritesheet.drawScaledSprite('decret', 1, X, Y, 1);
	}
	if( title === "A") {
		spritesheet.drawScaledSprite('decret', 0, X, Y, 1);
	}
	if( selection ) {
		stroke(255,228,180);
	} else {
		stroke(10);
	}
	strokeWeight(4);
	noFill();
	rect(X, Y, cardWidth, cardHeight, 20);
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

