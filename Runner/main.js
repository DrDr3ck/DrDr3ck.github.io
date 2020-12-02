const uiManager = new UIManager();
uiManager.loggerContainer = new LoggerContainer(600, 500, 240, 100);
uiManager.loggerContainer.visible = true;

const toolManager = new ToolManager();
const jobManager = new JobManager();

const GAME_START_STATE = 1;
const GAME_PLAY_STATE = 2;
const GAME_OVER_STATE = 3;
let curState = GAME_START_STATE;

let toggleDebug = false;

function startClicked() {
	curState = GAME_PLAY_STATE;
	uiManager.setUI([]);
	sprite.playAnimation("walk");
}

const startButton = new BButton(200, 200, 'START', startClicked);
startButton.setTextSize(45);
const menu = [ startButton ];
uiManager.setUI(menu);

let lastTime = 0;

const margin = 100;

function getRandomIntInclusive(min, max) {
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

const spritesheet = new SpriteSheet();

function preload() {
	spritesheet.addSpriteSheet('idle', loadImage('./idle.png'), 60, 60);
	spritesheet.addSpriteSheet('walk', loadImage('./walk.png'), 60, 60);
}

let sprite = null;

function setup() {
	canvas = createCanvas(800, 600);
	canvas.parent('canvas');

	frameRate(60);

	sprite = new Sprite(50, height - margin - 54);
	sprite.addAnimation('idle', [ 0, 1, 2, 3 ], 60, true);
	sprite.addAnimation('walk', [ 0, 1, 2, 3, 4, 5 ], 60, true);

	uiManager.addLogger('Run in the forest, run !!');
	lastTime = Date.now();
}

class EntityBase {
	constructor(speed) {
		this.x = getRandomIntInclusive(810, 900);
		this.speed = speed; // pixels per frame
	}

	update(elapsedTime) {
		this.x -= this.speed;
	}
}

class Tree extends EntityBase {
	constructor(speed) {
		super(speed);
	}

	draw() {
		fill(139, 69, 19);
		rect(this.x, height - margin - 100, 25, 100);
	}
}

class SmallTree extends EntityBase {
	constructor(speed) {
		super(speed);
	}

	draw() {
		fill(139, 69, 19);
		rect(this.x, height - margin - 120, 5, 50);
	}
}

let deco = [ new Tree(3), new SmallTree(1) ];

function updateGame(elapsedTime) {
	deco.forEach((d) => d.update(elapsedTime));

	deco = deco.filter((d) => d.x > 0);
	if (deco.length !== 2) {
		if (random() > 0.7) {
			deco.push(new SmallTree(1));
		} else {
			deco.push(new Tree(3));
		}
	}
}

function drawGame() {
	stroke(0);
	fill(50, 150, 50);
	rect(0, height - margin, width, margin);
	deco.forEach((d) => d.draw());

	sprite.draw();
}

function draw() {
	const currentTime = Date.now();
	const elapsedTime = currentTime - lastTime;
	background(51);

	uiManager.processInput();
	uiManager.update(elapsedTime);
	sprite.update(elapsedTime);

	// draw game
	if( curState === GAME_PLAY_STATE ) {
		updateGame(elapsedTime);
	}
	drawGame();

	if (curState === GAME_START_STATE || curState === GAME_OVER_STATE) {
		background(51, 51, 51, 200);
	}

	uiManager.draw();

	if (curState === GAME_OVER_STATE) {
		push();
		textAlign(CENTER, CENTER);
		textSize(50);
		text('Looser !!');
		pop();
	}

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
}

function keyPressed() {
	if (key === 'D') {
		toggleDebug = !toggleDebug;
	}
}
