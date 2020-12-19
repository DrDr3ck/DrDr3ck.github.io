const uiManager = new UIManager();
const windowWidth = 1000;
uiManager.loggerContainer = new LoggerContainer(windowWidth - 280, 520, 280, 80);
uiManager.loggerContainer.visible = true;
//uiManager.loggerContainer.drawBox = true;
uiManager.loggerContainer.maxLines = 4;

const spritesheet = new SpriteSheet();

const toolManager = new ToolManager();
const jobManager = new JobManager();
const soundManager = new SoundMgr();

const GAME_START_STATE = 1;
const GAME_PLAY_STATE = 2;
const GAME_OVER_STATE = 3;
let curState = GAME_START_STATE;

let lastTime = 0;

let world = null;

let canFire = true;

function startClicked() {
	uiManager.addLogger('Hold mouse button to fire');
	curState = GAME_PLAY_STATE;
	startButton.visible = false;
	helpButton.enabled = true;
	world.init();
	world.initWave();
}

function nextWaveClicked() {
	world.initWave();
	nextButton.visible = false;
}

function speakerClicked() {
	speakerButton.checked = !speakerButton.checked;
	soundManager.mute(!speakerButton.checked);
	saveData();
}

let startButton = null;
let helpButton = null;
let upgradeTowerButton = null;
let nextButton = null;
let speakerButton = null;

let upgradeTowerGold = 100;

let underGroundImg = null;

let toggleDebug = false;

function preload() {
	underGroundImg = loadImage('./underground.png');

	soundManager.addSound('new_wave', './new_wave.wav', 0.25);
	soundManager.addSound('bow', './bow01.wav');
	soundManager.addSound('argh', './argh.wav');
	soundManager.addSound('arrow_damage', './arrow_damage.wav');

	spritesheet.addSpriteSheet('soldat', './soldat.png', 32, 32);
	spritesheet.addSpriteSheet('flying_soldat', './flying_soldat.png', 48, 48);
}

function initUI() {
	startButton = new BButton(width / 2 - 200, 200, 'START', startClicked);
	startButton.setTextSize(40);
	upgradeTowerButton = new BFloatingButton(width / 2 - 15, height - 150, '\u2699', () => {
		world.upgradeTower();
	});
	upgradeTowerButton.setTextSize(30);

	helpButton = new BFloatingButton(width / 2 - 15, height - 30, '\u003F', () => {
		world.displayHelp();
	});
	helpButton.setTextSize(30);
	helpButton.enabled = false;

	nextButton = new BButton(width / 2 - 200, 200, 'NEXT WAVE', nextWaveClicked);

	speakerButton = new BFloatingButton(width - 70, 70, '\uD83D\uDD0A', speakerClicked);
	speakerButton.setTextSize(50);

	uiManager.setUI([ startButton, upgradeTowerButton, helpButton, nextButton, speakerButton ]);
	upgradeTowerButton.visible = false;
	nextButton.visible = false;
}

function setup() {
	canvas = createCanvas(windowWidth, 600);
	canvas.parent('canvas');

	initUI();
	loadData();

	world = new World();

	frameRate(60);

	uiManager.addLogger('How long will you survive!');
	lastTime = Date.now();
}

function getData() {
	const data = {
		speaker: speakerButton.checked
	};
	return data;
}

const storageKey = 'ToWeRDeFeNSe';

function saveData(verbose) {
	const data = JSON.stringify(getData());
	if (data && data !== 'null') {
		localStorage.setItem(storageKey, data);
		if (verbose) {
			uiManager.addLogger('Progress saved');
		}
	}
}

function loadData() {
	const storage = localStorage.getItem(storageKey);
	const initialData = getData();
	let data = initialData;
	if (storage) {
		data = JSON.parse(storage) || initialData;
		for (var k in initialData) {
			if (data[k] == undefined) {
				data[k] = initialData[k];
			}
		}
	}
	speakerButton.checked = data.speaker;
	soundManager.mute(!speakerButton.checked);
}

function updateGame(elapsedTime) {
	world.update(elapsedTime);
	upgradeTowerButton.visible = world.gold >= upgradeTowerGold && world.maxLife < 250;

	if (mouseIsPressed && canFire && !nextButton.visible && mouseY > 100 && mouseY < world.groundLevel) {
		world.fireBullet(mouseX + random(-2, 2), mouseY + random(-2, 2));
		canFire = false;
		setTimeout(() => {
			canFire = true;
		}, world.bulletReloadTime);
	}

	if (world.life <= 0) {
		curState = GAME_OVER_STATE;
		startButton.visible = true;
		helpButton.enabled = false;
		uiManager.addLogger('Tower destroyed!!');
	}
}

function drawGame() {
	world.draw();
}

function draw() {
	const currentTime = Date.now();
	const elapsedTime = currentTime - lastTime;
	background(51);

	uiManager.processInput();
	uiManager.update(elapsedTime);

	// draw game
	if (curState === GAME_PLAY_STATE) {
		updateGame(elapsedTime);
	}
	drawGame();

	if (curState !== GAME_PLAY_STATE) {
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
	/*
	if (key === ' ') {
		if (world.enemies.length === 0) {
			world.initWave();
		}
	}
	*/
	if (key === 'a') {
		const enemy = new GroundEnemy(-10, 1, 20);
		enemy.damage = 50;
		enemy.life = 50;
		world.enemies.push(enemy);
	}
	if (key === 'g') {
		world.gold += 50;
	}
	if (key === 'D') {
		toggleDebug = !toggleDebug;
	}
}
