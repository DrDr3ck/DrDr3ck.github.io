const uiManager = new UIManager();
uiManager.loggerContainer = new LoggerContainer(500, 500, 240, 100);
uiManager.loggerContainer.visible = true;

const toolManager = new ToolManager();
const jobManager = new JobManager();

const GAME_START_STATE = 1;
const GAME_PLAY_STATE = 2;
const GAME_OVER_STATE = 3;
const GAME_NEXT_LEVEL_STATE = 4;
let curState = GAME_START_STATE;

const playerStart = { X: 4, Y: 6 };
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
}

const startButton = new BButton(200, 200, 'START', startClicked);
const speakerButton = new BFloatingButton(730 - 10 - 70, 70, '\uD83D\uDD0A', speakerClicked);
const musicButton = new BFloatingButton(730, 70, '\uD83C\uDFB6', musicClicked);

const tileSize = 60;
const world = new World(9, 7);
world.holes.push(7);
world.holes.push(23);

const spritesheet = new SpriteSheet();
let moveSound = null;
let hitSound = null;
let animalDeathSound = null;
let nextLevelSound = null;

function playSound(sound) {
	if (sound && speakerButton.checked) {
		sound.play();
	}
}

function preload() {
	spritesheet.addSpriteSheet('ground01', loadImage('./misc/ground01.png'), 60, 60);
	spritesheet.addSpriteSheet('player01', loadImage('./misc/player01.png'), 60, 60);
	spritesheet.addSpriteSheet('sheep', loadImage('./misc/sheep.png'), 60, 60);

	moveSound = loadSound('./misc/move.ogg');
	hitSound = loadSound('./misc/hit.wav');
	hitSound.setVolume(0.125);
	gameOverSound = loadSound('./misc/game_over.wav');
	animalDeathSound = loadSound('./misc/animal_death.wav');
	nextLevelSound = loadSound('./misc/next_level.wav');
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
	// hurt animals that are in front of the player
	playSound(hitSound);
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
	canvas = createCanvas(800, 600);
	canvas.parent('canvas');

	frameRate(FPS);

	uiManager.addLogger('Survive!!! Hunt animals!');
	lastTime = Date.now();

	world.player = new Player(playerStart.X, playerStart.Y);
	world.animals.push(new Animal('sheep', 2, 2));
}

function drawGame() {
	push();
	translate(50, 50);
	world.draw();
	pop();
	textSize(32);
	fill(255, 128, 0);
	let textY = 150;
	text(`FOOD: ${world.food}`, 600, textY);
	textY += 50;
	textY += 50;
	if (world.selectedTile) {
		text(`Tile ${world.selectedTile.X}/${world.selectedTile.Y}`, 600, textY);
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
