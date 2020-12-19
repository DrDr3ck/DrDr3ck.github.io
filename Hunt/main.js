const uiManager = new UIManager();
const windowWidth = 1200;
const windowHeight = 800;
uiManager.loggerContainer = new LoggerContainer(windowWidth-300, windowHeight-100, 240, 100);
uiManager.loggerContainer.visible = true;

const toolManager = new ToolManager();
const jobManager = new JobManager();
const soundManager = new SoundMgr();

const GAME_LOADING_STATE = 0;
const GAME_START_STATE = 1;
const GAME_PLAY_STATE = 2;
const GAME_OVER_STATE = 3;
const GAME_NEXT_LEVEL_STATE = 4;
let curState = GAME_LOADING_STATE;

const playerStart = { X: 4, Y: 9 };
let lastTime = 0;
let firstMove = false;
let firstBlood = false; // kill an animal
let firstInjury = false; // get injured by an animal or trap

const allAnimations = [];

function getRandomIntInclusive(min, max) {
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

function startClicked() {
	curState = GAME_PLAY_STATE;
	startButton.visible = false;
	uiManager.addLogger('Use <Arrows> keys to move');
	uiManager.addLogger('Press SPACE to fight');
	// reset world
	world.food = 100;
	world.player.setTileX(playerStart.X);
	world.player.setTileY(playerStart.Y);
	world.level = 1;
}

function musicClicked() {
	// TODO
}

function speakerClicked() {
	speakerButton.checked = !speakerButton.checked;
	soundManager.mute(!speakerButton.checked);
}

const startButton = new BButton((windowWidth-400)/2, 200, 'START', startClicked);
const speakerButton = new BFloatingButton(windowWidth - 70 - 10 - 70, 70, '\uD83D\uDD0A', speakerClicked);
const musicButton = new BFloatingButton(windowWidth - 70, 70, '\uD83C\uDFB6', musicClicked);

const tileSize = 60;
const world = new World(15, 10);
world.holes.push(7);
world.holes.push(23);

const spritesheet = new SpriteSheet();

function preload() {	
}

function initUI() {
	startButton.setTextSize(40);
	speakerButton.setTextSize(50);
	musicButton.setTextSize(50);
	musicButton.enabled = false;
	musicButton.checked = false;
	const menu = [ startButton, speakerButton, musicButton ];
	uiManager.setUI(menu);
}

function fight() {
	// TODO: hurt animals that are in front of the player
	// TODO: 'fight' animation
	soundManager.playSound('hit');
	const damage = world.player.getDamage();
	for (let i = -1; i <= 1; i++) {
		for (let j = -1; j <= 1; j++) {
			world.hurt(world.player.tilePosition.X + i, world.player.tilePosition.Y + j, damage);
		}
	}
}

const FPS = 60;

function setup() {
	initUI();
	canvas = createCanvas(windowWidth, windowHeight);
	canvas.parent('canvas');

	frameRate(FPS);

	spritesheet.addSpriteSheet('ground01', './misc/ground01.png', 60, 60);
	spritesheet.addSpriteSheet('player01', './misc/player01.png', 60, 60);
	spritesheet.addSpriteSheet('bush01', './misc/bush01.png', 60, 60);
	spritesheet.addSpriteSheet('sheep', './misc/sheep.png', 60, 60);
	soundManager.addSound('move', './misc/move.ogg');
	soundManager.addSound('hit', './misc/hit.wav', 0.125);
	soundManager.addSound('game_over', './misc/game_over.wav');
	soundManager.addSound('animal_death', './misc/animal_death.wav');
	soundManager.addSound('next_level', './misc/next_level.wav');

	lastTime = Date.now();
}

function drawLoading() {
	fill(0);
	noStroke();
	textSize(50);
	textAlign(CENTER, CENTER);
	text('Loading...', width / 2, height / 2);
	if (
		soundManager.maxLoadedSounds === soundManager.maxLoadingSounds &&
		spritesheet.maxLoadedImages === spritesheet.maxLoadingImages
	) {
		curState = GAME_START_STATE;

		world.player = new Player(playerStart.X, playerStart.Y);
		world.animals.push(new Animal('sheep', 2, 2));
		textAlign(LEFT, BASELINE);
		uiManager.addLogger('Survive!!! Hunt animals!');
	}
}

function drawGame() {
	push();
	translate(50, 50);
	world.draw();
	pop();
	textSize(32);
	fill(255, 128, 0);
	let textY = 150;
	text(`FOOD: ${world.food}`, width-200, textY);
	textY += 50;
	textY += 50;
	if (world.selectedTile) {
		text(`Tile ${world.selectedTile.X}/${world.selectedTile.Y}`, width-200, textY);
	}
	textY += 50;

	text(`LEVEL: ${world.level}`, 50, 45);
}

function updateGame(elapsedTime) {
	world.update(elapsedTime);
}

function removeItems(myList, fct) {
	myList.forEach((item, i) => {
		if (fct(item)) {
			allAnimations.splice(i, 1);
		}
	});
}

function draw() {
	const currentTime = Date.now();
	const elapsedTime = currentTime - lastTime;
	background(51);
	if (curState === GAME_LOADING_STATE) {
		drawLoading();
		return;
	}

	if (curState === GAME_PLAY_STATE) {
		world.mouseMoved(mouseX - 50, mouseY - 50);
	}

	uiManager.processInput();
	uiManager.update(elapsedTime);

	// draw game
	if (curState === GAME_PLAY_STATE) {
		updateGame(elapsedTime);
	}
	allAnimations.forEach((anim) => anim.update(elapsedTime));
	drawGame();
	allAnimations.forEach((anim) => anim.draw());
	removeItems(allAnimations, (item) => {
		return item.currentTime === 0;
	});

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

function mouseMoved() {}

function keyPressed() {
	if (curState !== GAME_PLAY_STATE) {
		console.log(keyCode); // for debug
		return;
	}
	if (keyCode === 38) {
		// UP
		world.movePlayer('UP');
	} else if (keyCode === 40) {
		// DOWN
		world.movePlayer('DOWN');
	} else if (keyCode === 37) {
		// LEFT
		world.movePlayer('LEFT');
	} else if (keyCode === 39) {
		// RIGHT
		world.movePlayer('RIGHT');
	} else if (keyCode === 32) {
		// SPACE
		fight();
	}
}
