const uiManager = new UIManager();
uiManager.loggerContainer = new LoggerContainer(500, 500, 240, 100);
uiManager.loggerContainer.visible = true;

const toolManager = new ToolManager();
const jobManager = new JobManager();

const GAME_START_STATE = 1;
const GAME_PLAY_STATE = 2;
const GAME_OVER_STATE = 3;
let curState = GAME_START_STATE;

let lastTime = 0;
let firstMove = false;
let firstBlood = false; // kill an animal
let firstInjury = false; // get injured by an animal or trap

function startClicked() {
	food = 100;
	curState = GAME_PLAY_STATE;
	startButton.visible = false;
	uiManager.addLogger('Use <Arrows> keys to move');
	uiManager.addLogger('Press SPACE to fight');
}

const startButton = new BButton(200, 200, 'START', startClicked);

const tileSize = 60;
const world = new World(9, 7);
world.holes.push(7);
world.holes.push(23);
const player = new Player(4, 6);

let food = 0;

const spritesheet = new SpriteSheet();

function preload() {
	spritesheet.addSpriteSheet('ground01', loadImage('./ground01.png'), 60, 60);
	spritesheet.addSpriteSheet('player01', loadImage('./player01.png'), 60, 60);
}

function initUI() {
	startButton.setTextSize(40);
	const menu = [ startButton ];
	uiManager.setUI(menu);
}

function movePlayer(move) {
	if (!firstMove) {
		firstMove = true;
		uiManager.addLogger('Each move costs food');
	}
	let canMove = false;
	if (move === 'UP' && world.isFree(player.tilePosition.X, player.tilePosition.Y - 1)) {
		player.setTileY(player.tilePosition.Y - 1);
		canMove = true;
	}
	if (move === 'DOWN' && world.isFree(player.tilePosition.X, player.tilePosition.Y + 1)) {
		player.setTileY(player.tilePosition.Y + 1);
		canMove = true;
	}
	if (move === 'LEFT' && world.isFree(player.tilePosition.X - 1, player.tilePosition.Y)) {
		player.setTileX(player.tilePosition.X - 1);
		canMove = true;
	}
	if (move === 'RIGHT' && world.isFree(player.tilePosition.X + 1, player.tilePosition.Y)) {
		player.setTileX(player.tilePosition.X + 1);
		canMove = true;
	}
	if (canMove) {
		food = Math.max(0, food - 1);
		if (food === 0) {
			// game over
			curState = GAME_OVER_STATE;
			startButton.visible = true;
		}
	}
}

const FPS = 60;

function setup() {
	initUI();
	canvas = createCanvas(800, 600);
	canvas.parent('canvas');

	frameRate(FPS);

	uiManager.addLogger('Survive!!! Hunt animals!');
	lastTime = Date.now();

	player.addAnimation('idle', 'player01', [ 0, 1, 2, 3 ], FPS, true);
	player.addAnimation('up', 'player01', [ 4, 5, 6, 7 ], FPS, true);
}

function drawGame() {
	push();
	translate(50, 50);
	world.draw();
	player.draw();
	pop();
	textSize(32);
	fill(255, 128, 0);
	text(`FOOD: ${food}`, 600, 132);
}

function draw() {
	const currentTime = Date.now();
	const elapsedTime = currentTime - lastTime;
	background(51);

	uiManager.processInput();

	uiManager.update(elapsedTime);

	// draw game
	if (curState === GAME_PLAY_STATE) {
		//updateGame(elapsedTime);
	}
	drawGame();

	if (curState === GAME_START_STATE || curState === GAME_OVER_STATE) {
		background(51, 51, 51, 200);
	}

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
}

function keyPressed() {
	if (curState !== GAME_PLAY_STATE) {
		console.log(keyCode); // for debug
		return;
	}
	if (keyCode === 38) {
		// UP
		movePlayer('UP');
	} else if (keyCode === 40) {
		// DOWN
		movePlayer('DOWN');
	} else if (keyCode === 37) {
		// LEFT
		movePlayer('LEFT');
	} else if (keyCode === 39) {
		// RIGHT
		movePlayer('RIGHT');
	} else if (keyCode === 32) {
		// SPACE
	}
}
