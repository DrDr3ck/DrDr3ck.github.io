const uiManager = new UIManager();
const windowWidth = 1000;
uiManager.loggerContainer = new LoggerContainer(windowWidth - 280, 520, 280, 80);
uiManager.loggerContainer.visible = true;
//uiManager.loggerContainer.drawBox = true;
uiManager.loggerContainer.maxLines = 4;

const toolManager = new ToolManager();
const jobManager = new JobManager();
const soundManager = new sndMgr();

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

let startButton = null;
let helpButton = null;
let upgradeTowerButton = null;
let nextButton = null;

let upgradeTowerGold = 100;

let underGroundImg = null;

function preload() {
	underGroundImg = loadImage('./underground.png');

	soundManager.addSound('new_wave', loadSound('./new_wave.wav'), 0.25);
	soundManager.addSound('bow', loadSound('./bow01.wav'));
	soundManager.addSound('argh', loadSound('./argh.wav'));
	soundManager.addSound('arrow_damage', loadSound('./arrow_damage.wav'));
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

	uiManager.setUI([ startButton, upgradeTowerButton, helpButton, nextButton ]);
	upgradeTowerButton.visible = false;
	nextButton.visible = false;
}

function setup() {
	canvas = createCanvas(windowWidth, 600);
	canvas.parent('canvas');

	initUI();

	world = new World();

	frameRate(60);

	uiManager.addLogger('How long will you survive!');
	lastTime = Date.now();
}

function updateGame(elapsedTime) {
	world.update(elapsedTime);
	upgradeTowerButton.visible = world.gold >= upgradeTowerGold && world.maxLife < 250;

	if (mouseIsPressed && canFire && !nextButton.visible ) {
		world.fireBullet(mouseX + random(-2, 2), mouseY + random(-2, 2));
		canFire = false;
		setTimeout(() => {
			canFire = true;
		}, 500);
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
}
