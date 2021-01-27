const uiManager = new UIManager();
const windowWidth = 1200;
const windowHeight = 800;
uiManager.loggerContainer = new LoggerContainer(windowWidth - 300, windowHeight - 100, 240, 100);
uiManager.loggerContainer.visible = true;

const toolManager = new ToolManager();
const jobManager = new JobManager();
const soundManager = new SoundMgr();
const spritesheet = new SpriteSheet();

const GAME_LOADING_STATE = 0;
const GAME_START_STATE = 1;
const GAME_PLAY_STATE = 2;
const GAME_OVER_STATE = 3;
let curState = GAME_LOADING_STATE;

let toggleDebug = false;

let lastTime = 0;

let world = null;

function getData() {
	const data = {
		speaker: speakerButton.checked,
		help: helpButton.checked
	};
	return data;
}

const storageKey = 'F4RM';

function saveData() {
	const data = JSON.stringify(getData());
	if (data && data !== 'null') {
		localStorage.setItem(storageKey, data);
		console.log('saving ', data);
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
			if (data[k] == undefined) {
				data[k] = initialData[k];
			}
		}
	}
	speakerButton.checked = data.speaker;
	soundManager.mute(!speakerButton.checked);
	helpButton.checked = data.help;
}

function preload() {}

function musicClicked() {
	// TODO
}

function speakerClicked() {
	speakerButton.checked = !speakerButton.checked;
	soundManager.mute(!speakerButton.checked);
	saveData();
}

const speakerButton = new BFloatingButton(windowWidth - 70 - 10 - 70, 70, '\uD83D\uDD0A', speakerClicked);
const musicButton = new BFloatingButton(windowWidth - 70, 70, '\uD83C\uDFB6', musicClicked);
const helpButton = new BFloatingButton(20, 60, '\u003F', () => {
	helpButton.checked = !helpButton.checked;
	saveData();
});

function startClicked() {
	curState = GAME_PLAY_STATE;
	uiManager.setUI([ speakerButton, musicButton, helpButton, ...slotButtons ]);
}

const startButton = new BButton(130, 580, 'START', startClicked);
startButton.setTextSize(45);

function initUI() {
	speakerButton.setTextSize(50);
	musicButton.setTextSize(50);
	musicButton.enabled = false;
	musicButton.checked = false;
	helpButton.setTextSize(30);
	helpButton.checked = false;
}

const FPS = 60;

function setup() {
	initUI();
	loadData();
	canvas = createCanvas(windowWidth, windowHeight);
	canvas.parent('canvas');

	frameRate(FPS);

	spritesheet.addSpriteSheet('farm_tile', './resources/farm_tile.png', 32, 32);
	spritesheet.addSpriteSheet('farm_animal', './resources/farm_animal.png', 32, 32);
	spritesheet.addSpriteSheet('seed_vegetable', './resources/farm_seed_vegetable.png', 32, 32);
	spritesheet.addSpriteSheet('farm_ui', './resources/farm_ui.png', 64, 64);
	spritesheet.addSpriteSheet('farm_robot', './resources/farm_robot.png', 32, 48);

	lastTime = Date.now();
}

let azerty = true;

document.addEventListener('keydown', (event) => {
	if (event.key === 'z' && event.code === 'KeyW') {
		azerty = true;
	}
	if (event.key === 'w' && event.code === 'KeyW') {
		azerty = false;
	}
	if (event.key === 'q' && event.code === 'KeyA') {
		azerty = true;
	}
	if (event.key === 'a' && event.code === 'KeyA') {
		azerty = false;
	}

	if (event.key === 'q' && event.code === 'KeyQ') {
		azerty = false;
	}
	if (event.key === 'a' && event.code === 'KeyQ') {
		azerty = true;
	}
});

function updateGame(elapsedTime) {
	let state = 'idle';
	const right = 68;
	const left = azerty ? 81 : 65;
	const up = azerty ? 90 : 87;
	//const down = 83;
	if (keyIsDown(LEFT_ARROW) || keyIsDown(left)) {
		world.player.vx = -0.5 * world.scale;
		state = 'left';
	}
	if (keyIsDown(RIGHT_ARROW) || keyIsDown(right)) {
		world.player.vx = 0.5 * world.scale;
		state = 'right';
	}
	if ((keyIsDown(UP_ARROW) || keyIsDown(up)) && world.player.canJump) {
		world.player.vy = -1.1 * world.scale;
		world.player.canJump = false;
	}
	if (world.player.state !== state) {
		world.player.playAnimation(state);
	}
	world.update(elapsedTime);
}

// TODO: create world chunk by chunk
function drawGame() {
	push();
	const deltaX = width / 2 - world.tileSize * world.scale / 2;
	translate(deltaX - world.player.position.x, world.tileSize * 13);
	world.draw();
	/*
	spritesheet.drawScaledSprite('farm_animal', 0, 11*tileSize*scale, 1*tileSize*scale, scale);

	spritesheet.drawScaledSprite('farm_animal', 1, 15*tileSize*scale, 2*tileSize*scale, scale);

	spritesheet.drawScaledSprite('farm_animal', 2, 8*tileSize*scale, 2*tileSize*scale, scale);

	spritesheet.drawScaledSprite('farm_animal', 3, 2*tileSize*scale, 2*tileSize*scale, scale);
	
	*/
	pop();
	if (toggleDebug) {
		stroke(255);
		line(600, 0, 600, 800);
	}
	stroke(150, 50, 50, 150);
	noFill();
	strokeWeight(3);
	rect(400 + 68 * world.player.slotIndex - 1, 700 - 1, 66, 66);
}

const slotButtons = [];

function initGame() {
	const menu = [ startButton ];
	for (let i = 0; i < 6; i++) {
		const slot = new BSlotButton(400 + 68 * i, 700, spritesheet.getImage('farm_ui', 0), () => {
			world.player.updateItemInHand(i);
		});
		slotButtons.push(slot);
	}
	uiManager.setUI(menu);	

	noiseSeed(5000);
	world = new World();
	world.update(0);

	world.player.addItem(new Item('navet','seed'), 0);
	world.player.addItem(new Item('carotte','seed'), 2);
	world.player.addItem(new Item('tomate','seed'), 4);

	world.player.addItem(new Item('tomate','vegetable'), 5);
	world.player.addItem(new Item('carotte','vegetable'), 3);
	world.player.addItem(new Item('navet','vegetable'), 1);
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
	if (curState === GAME_PLAY_STATE) {
		updateGame(elapsedTime);
	}
	drawGame();

	if (curState === GAME_START_STATE) {
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

function mouseWheel(event) {
	if (event.delta > 0) {
		world.player.slotIndex = (world.player.slotIndex + slotButtons.length - 1) % slotButtons.length;
	}
	if (event.delta < 0) {
		world.player.slotIndex = (world.player.slotIndex + 1) % slotButtons.length;
	}
	//uncomment to block page scrolling
	return false;
}

function keyPressed() {
	if (key === 'D') {
		toggleDebug = !toggleDebug;
	}

	if (key === 'e' || key === 'E') {
		world.player.execute();
	}
}
