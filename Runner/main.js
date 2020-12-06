const uiManager = new UIManager();
uiManager.loggerContainer = new LoggerContainer(600, 500, 240, 100);
uiManager.loggerContainer.visible = true;

const credit = "https://twitter.com/ScissorMarks";

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

let globalSpeed = 1;
const date = new Date();
let hour = date.getHours();

const continueValue = 10;

function startClicked() {
	curState = GAME_PLAY_STATE;
	uiManager.setUI([]);
	sprite.playAnimation('walk');
	entities = [];
	ranDistance = 0;
	uiManager.addLogger('Press SPACE to jump');
	//uiManager.addLogger("Or click mouse button");
}

function continueClicked() {
	curState = GAME_PLAY_STATE;
	uiManager.setUI([]);
	sprite.playAnimation('walk');
	entities = [];
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

function getRandomIntInclusive(min, max) {
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

const spritesheet = new SpriteSheet();

function preload() {
	spritesheet.addSpriteSheet('idle', loadImage('./idle.png'), 60, 60);
	spritesheet.addSpriteSheet('walk', loadImage('./walk.png'), 60, 60);
	spritesheet.addSpriteSheet('dino', loadImage('./dino01.png'), 24, 24);
}

let sprite = null;

let velocitySlider = null;

const groundLevel = screen.height > 400 ? 100 : 60;
let windowHeight = screen.height > 600 ? 600 : 360;
let windowWidth = 800;

function getGroundLevel(x) {
	return groundLevel;
}

function setup() {
	loadData();

	canvas = createCanvas(windowWidth, windowHeight);
	canvas.parent('canvas');

	frameRate(60);

	//velocitySlider = createSlider(-30,-10,-15);

	sprite = new Sprite(50, height - getGroundLevel(50) - 54);
	sprite.addAnimation('idle', 'idle', [ 0, 1, 2, 3 ], 60, true);
	sprite.addAnimation('walk', 'walk', [ 0, 1, 2, 3, 4, 5 ], 60, true);
	sprite.scale = 1;

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

let entities = [];
let deco = [];

deco.push(new Mountain(0.5));
deco[0].x = 150;
deco.push(new Mountain(0.5));
deco[1].x = 300;
deco.push(new Mountain(0.5));
deco[2].x = 600;
deco.push(new Mountain(0.5));

function updateGame(elapsedTime) {
	entities.forEach((d) => {
		d.update(elapsedTime);
		if (sprite.collide(d.box())) {
			if (d.isBonus()) {
				diamond++;
				d.x = -100;
			} else {
				curState = GAME_OVER_STATE;
				sprite.playAnimation('idle');
				if (menu.length === 1) {
					menu.push(continueButton);
				}
				continueButton.enabled = diamond >= continueValue;
				uiManager.setUI(menu);
				doSave();
			}
		}
	});
	ranDistance += 0.1;
	bestRanDistance = Math.max(bestRanDistance, ranDistance);

	globalSpeed = 1 + 0.1 * Math.floor(ranDistance / 100);

	entities = entities.filter((d) => d.x > -20);
	let addEntity = true;
	entities.forEach((d) => {
		if (d.x > width * 0.8) {
			addEntity = false;
		}
	});
	if (addEntity) {
		if (random() < 0.7) {
			entities.push(new Tree(5));
		} else {
			const r = random();
			if (r < 0.7) {
				entities.push(new Diamond(5));
			} else if (r < 0.85) {
				const diamond1 = new Diamond(5);
				const diamond2 = new Diamond(5);
				const diamond3 = new Diamond(5);
				diamond2.x = diamond1.x + 75;
				diamond2.y -= 150;
				diamond3.x = diamond2.x + 75;
				entities.push(diamond1);
				entities.push(diamond2);
				entities.push(diamond3);
			} else {
				const diamond1 = new Diamond(5);
				const diamond2 = new Diamond(5);
				const diamond3 = new Diamond(5);
				diamond2.x = diamond1.x + 75;
				diamond1.y -= 150;
				diamond3.y -= 150;
				diamond3.x = diamond2.x + 75;
				entities.push(diamond1);
				entities.push(diamond2);
				entities.push(diamond3);
			}
		}
	}

	deco.forEach((d) => {
		d.update(elapsedTime);
	});
	deco = deco.filter((d) => d.x > 0);
	if (deco[deco.length - 1].x < width) {
		deco.push(new Mountain(0.5));
		deco.push(new Mountain(0.5));
		deco[deco.length - 1].x += deco[deco.length - 1].height * 0.7;
	}
}

function getSkyColor(hour) {
	if (hour < 4) {
		return [ 29, 55, 80 ];
	} else if (hour < 8) {
		return [ 70, 143, 175 ];
	} else if (hour < 12) {
		return [ 173, 241, 216];
	} else if (hour < 16) {
		return [ 147, 230, 248 ];
	} else if (hour < 20) {
		return [ 255, 202, 160 ];
	} else if (hour < 24) {
		return [ 117, 138, 193 ];
	}
}

function skyColor(hour) {
	const c1 = getSkyColor(hour);
	if( hour%4 < 3 ) {
		return c1;
	}
	const from = color(c1[0], c1[1], c1[2]);
	const c2 = getSkyColor((hour+4)%24);
	const to = color(c2[0], c2[1], c2[2]);
	const sky = lerpColor(from, to, (hour%4)-3);
	return sky;
}

function sunPosition(hour) {
	const summerHour = (hour+1)%24;
	let x = 0;
	let dy = 150;
	if (summerHour < 8 || summerHour > 20) {
		const nightHour = summerHour < 8 ? summerHour + 24 : summerHour;
		x = map(nightHour, 20, 32, -50, windowWidth+50);
		dy = 200;
	} else {
		x = map(summerHour, 8, 20, -50, windowWidth+50);
	}
	const y = Math.cos((x + 110) / 200) * 100 + dy;
	return { x, y };
}

function sunColor(hour) {
	if (hour < 8-1 || hour > 20-1) {
		fill(190);
	} else {
		fill(255, 231, 0);
	}
}

function drawSun() {
	noStroke();
	sunColor(hour);
	sun = sunPosition(hour);
	ellipse(sun.x, sun.y, 50, 50);
}

function drawGround() {
	stroke(0);
	fill(50, 150, 50);
	rect(0, height - groundLevel, width, groundLevel);
}

function drawGame() {
	strokeWeight(1);
	// sun
	drawSun();

	stroke(50);
	deco.forEach((d) => d.draw());

	// draw ground
	drawGround();

	entities.forEach((d) => d.draw());
	sprite.draw();

	// sunshine ?
	//background(255,231,0,25);
}

function drawSky(hour) {
	const sky = skyColor(hour);
	background(sky);//[0], sky[1], sky[2]);
}

function draw() {
	const currentTime = Date.now();
	const elapsedTime = currentTime - lastTime;
	// sky color
	drawSky(hour);

	uiManager.processInput();
	uiManager.update(elapsedTime);
	sprite.update(elapsedTime);

	// draw game
	if (curState === GAME_PLAY_STATE) {
		updateGame(elapsedTime);
		hour += 0.01;
		hour = hour % 24;
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

	if (toggleDebug) {
		push();
		stroke(51);
		textSize(50);
		text(hour, 500, 200);
		pop();
	}
}

function mouseClicked() {
	if (curState === GAME_PLAY_STATE && mouseY > height - groundLevel) {
		sprite.jump();
	}
	toolManager.mouseClicked();
	uiManager.mouseClicked();
}

function keyPressed() {
	if (key === 'D') {
		toggleDebug = !toggleDebug;
	}

	if (key === ' ') {
		sprite.jump();
	}

	if (key === 'H') {
		hour += 4;
		hour = hour % 24;
	}
}
