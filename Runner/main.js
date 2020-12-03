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

let ranDistance = 0;
let bestRanDistance = 0;
let diamond = 0;

const continueValue = 10;

function startClicked() {
	curState = GAME_PLAY_STATE;
	uiManager.setUI([]);
	sprite.playAnimation('walk');
	deco = [];
	ranDistance = 0;
	uiManager.addLogger("Press SPACE to jump");
	//uiManager.addLogger("Or click mouse button");
}

function continueClicked() {
	curState = GAME_PLAY_STATE;
	uiManager.setUI([]);
	sprite.playAnimation('walk');
	deco = [];
	if (diamond >= continueValue) {
		diamond -= continueValue;
		doSave();
	} else {
		ranDistance = 0;
	}
}

const startButton = new BButton(200, 200, 'START', startClicked);
const continueButton = new BButton(200, 300, `CONTINUE (-${continueValue}◈)`, continueClicked);
startButton.setTextSize(40);
continueButton.setTextSize(40);
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

let velocitySlider = null;

function setup() {
	loadData();

	canvas = createCanvas(800, 600);
	canvas.parent('canvas');

	frameRate(60);

	//velocitySlider = createSlider(-30,-10,-15);

	sprite = new Sprite(50, height - margin - 54);
	sprite.addAnimation('idle', [ 0, 1, 2, 3 ], 60, true);
	sprite.addAnimation('walk', [ 0, 1, 2, 3, 4, 5 ], 60, true);

	uiManager.addLogger('Run in the forest, run !!');
	lastTime = Date.now();
}

function getData() {
	const data = {
		diamond: diamond,
		distance: Math.max(ranDistance, bestRanDistance),
		volume: 0
	};
	return data;
}

const storageKey = 'RuNNeR';

function doSave() {
	const data = JSON.stringify(getData());
	if (data && data !== 'null') {
		localStorage.setItem(storageKey, data);
		uiManager.addLogger('Saved');
	}
}

function loadData() {
	const storage = localStorage.getItem(storageKey);
	const initialData = getData();
	let data = initialData;
	if (storage) {
		data = JSON.parse(storage) || initialData;
		for (var k in initialData) {
			if (!data[k]) {
				data[k] = initialData[k];
			}
		}
	}
	bestRanDistance = data.distance;
	diamond = data.diamond;
}

let deco = [];

function updateGame(elapsedTime) {
	deco.forEach((d) => {
		d.update(elapsedTime);
		if (sprite.collide(d.box())) {
			curState = GAME_OVER_STATE;
			sprite.playAnimation('idle');
			if (menu.length === 1) {
				menu.push(continueButton);
			}
			continueButton.enabled = diamond >= continueValue;
			uiManager.setUI(menu);
			doSave();
		}
	});
	ranDistance += 0.1;
	bestRanDistance = Math.max(bestRanDistance, ranDistance);

	deco = deco.filter((d) => d.x > 0);
	let addDeco = true;
	deco.forEach(d=> {
		if( d.x > width*0.8 ) {
			addDeco = false;
		}
	});
	if ( addDeco ) {
		if (random() > 0.7) {
			deco.push(new SmallTree(2));
		} else {
			deco.push(new Tree(5));
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
	if (curState === GAME_PLAY_STATE) {
		updateGame(elapsedTime);
	}
	drawGame();

	if (curState === GAME_START_STATE || curState === GAME_OVER_STATE) {
		background(51, 51, 51, 200);
	}

	if (ranDistance !== 0) {
		push();
		textSize(40);
		fill(180);
		textAlign(LEFT);
		text(`${Math.floor(ranDistance)} m`, 100, 100);
		textAlign(CENTER);
		text(`${diamond} ◈`, 400, 50);
		textAlign(RIGHT);
		text(`${Math.floor(bestRanDistance)} m`, width - 100, 100);
		pop();
	}

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
	if (curState === GAME_PLAY_STATE) {
		//sprite.jump();
	}
}

function keyPressed() {
	if (key === 'D') {
		toggleDebug = !toggleDebug;
	}

	if (key === ' ') {
		sprite.jump();
	}
}
