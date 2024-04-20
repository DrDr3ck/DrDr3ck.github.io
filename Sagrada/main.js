const uiManager = new UIManager();
const windowWidth = 1400;
const windowHeight = 800;
uiManager.loggerContainer = new LoggerContainer(
	windowWidth - 300,
	windowHeight - 100,
	240,
	100
);
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

let score = [];
let curDices = [];
let dices = [];
const colors = [
	{ r: 73, g: 195, b: 201 },
	{ r: 161, g: 75, b: 162 },
	{ r: 59, g: 177, b: 116 },
	{ r: 235, g: 58, b: 39 },
	{ r: 239, g: 211, b: 69 },
];

const BLUE = 0;
const PURPLE = 1;
const GREEN = 2;
const RED = 3;
const YELLOW = 4;

let overTileIndex = -1;
let overDiceIndex = -1;
let selectedDiceIndex = -1;

let availableTiles = [];

const tileSize = 60;
const boardTiles = [];
for (let j = 0; j < 4; j++) {
	for (let i = 0; i < 5; i++) {
		boardTiles.push({
			X: 87 + 89 * i,
			Y: 300 + 89 * j,
			constraint: null,
			dice: null,
		});
	}
}

function setConstraints() {
	boardTiles[1].constraint = { value: 4 };
	boardTiles[3].constraint = { color: YELLOW };
	boardTiles[4].constraint = { value: 6 };
	boardTiles[5].constraint = { color: RED };
	boardTiles[7].constraint = { value: 2 };
	boardTiles[12].constraint = { color: RED };
	boardTiles[13].constraint = { color: PURPLE };
	boardTiles[14].constraint = { value: 3 };
	boardTiles[15].constraint = { color: BLUE };
	boardTiles[16].constraint = { color: YELLOW };
}

setConstraints();

class Dice {
	constructor(X, Y, color, value) {
		this.color = color;
		this.value = value;
		this.position = { x: X, y: Y };
		this.size = 50;
	}

	setPosition(X, Y) {
		this.position = { x: X, y: Y };
	}

	isOverDice(X, Y) {
		if (
			X >= this.position.x &&
			X <= this.position.x + this.size &&
			Y >= this.position.y &&
			Y <= this.position.y + this.size
		) {
			return true;
		}
		return false;
	}
}

function preload() {}

function musicClicked() {}

const speakerStorageKey = "DrDr3ck/GameEngine/Speaker";
function speakerClicked() {
	speakerButton.checked = !speakerButton.checked;
	soundManager.mute(!speakerButton.checked);
	localStorage.setItem(speakerStorageKey, speakerButton.checked ? "on" : "off");
}

function startClicked() {
	curState = GAME_PLAY_STATE;
	uiManager.setUI([speakerButton, musicButton]);
	uiManager.addLogger("Start game");
	roleDices();
}

const speakerButton = new BFloatingSwitchButton(
	windowWidth - 70 - 10 - 70,
	70,
	"\uD83D\uDD0A",
	speakerClicked
);
const musicButton = new BFloatingSwitchButton(
	windowWidth - 70,
	70,
	"\uD83C\uDFB6",
	musicClicked
);
const startButton = new BButton(
	80,
	windowHeight - 50 - 200,
	"START",
	startClicked
);

function initUI() {
	speakerButton.setTextSize(50);
	musicButton.setTextSize(50);
	musicButton.enabled = false;
	musicButton.checked = false;
	const isSpeakerOn = localStorage.getItem(speakerStorageKey);
	if (isSpeakerOn === "off") {
		speakerButton.checked = false;
		soundManager.mute(true);
	}
	const menu = [speakerButton, startButton, musicButton];
	uiManager.setUI(menu);
}

/* Randomize array in-place using Durstenfeld shuffle algorithm */
const shuffleArray = (array) => {
	for (var i = array.length - 1; i > 0; i--) {
		var j = Math.floor(Math.random() * (i + 1));
		var temp = array[i];
		array[i] = array[j];
		array[j] = temp;
	}
};

function setup() {
	initUI();
	canvas = createCanvas(windowWidth, windowHeight);
	canvas.parent("canvas");

	spritesheet.addSpriteSheet("board", "./board.png", 490, 570);
	spritesheet.addSpriteSheet("score", "./score.png", 635, 200);
	spritesheet.addSpriteSheet("cover", "./cover.png", 800, 800);

	frameRate(60);

	for (let i = 0; i < 5; i++) {
		for (let j = 0; j < 18; j++) {
			dices.push(new Dice(0, 0, colors[i], (j % 6) + 1));
		}
	}

	shuffleArray(dices);

	console.log(dices);

	lastTime = Date.now();
}

function roleDices() {
	curDices = [];
	curDices.push(dices.pop());
	curDices[0].setPosition(800, 400);
	curDices.push(dices.pop());
	curDices[1].setPosition(880, 400);
	curDices.push(dices.pop());
	curDices[2].setPosition(960, 400);
	curDices.push(dices.pop());
	curDices[3].setPosition(1040, 400);
}

function updateGame(elapsedTime) {}

function drawDice(X, Y, dice) {
	fill(dice.color.r, dice.color.g, dice.color.b);
	rect(X, Y, dice.size, dice.size, 3);
	fill(0);
	stroke(0);
	strokeWeight(2);
	textSize(40);
	textAlign(CENTER, CENTER);
	text(dice.value.toString(), X + dice.size / 2, Y + dice.size / 2);
}

function drawDices() {
	curDices.forEach((dice, i) => {
		if (i !== selectedDiceIndex) {
			stroke(i === overDiceIndex ? 255 : 0);
			strokeWeight(2);
			drawDice(dice.position.x, dice.position.y, dice);
		}
	});

	if (selectedDiceIndex !== -1) {
		const dice = curDices[selectedDiceIndex];
		drawDice(mouseX - dice.size / 2, mouseY - dice.size / 2, dice);
	}
}

function drawBoard() {
	spritesheet.drawSprite("board", 0, 50, 100);
	boardTiles.forEach((tile, i) => {
		if (tile.constraint) {
			if (tile.constraint.color !== undefined) {
				const curColor = colors[tile.constraint.color];
				fill(curColor.r, curColor.g, curColor.b);
				stroke(0);
				strokeWeight(4);
				rect(tile.X, tile.Y, tileSize + 2, tileSize + 2, 3);
				strokeWeight(2);
			}
			if (tile.constraint.value) {
				fill(0);
				stroke(0);
				strokeWeight(2);
				textSize(40);
				textAlign(CENTER, CENTER);
				text(
					tile.constraint.value.toString(),
					tile.X + tileSize / 2,
					tile.Y + tileSize / 2
				);
			}
		}
		if (tile.dice) {
			stroke(0);
			drawDice(
				tile.X + (tileSize - tile.dice.size / 2) - tileSize / 2,
				tile.Y + (tileSize - tile.dice.size / 2) - tileSize / 2,
				tile.dice
			);
		}
	});
}

function drawGame() {
	spritesheet.drawSprite("score", 0, 590, 100);
	drawBoard();
	drawDices();

	if (overTileIndex !== -1) {
		const tile = boardTiles[overTileIndex];
		noFill();
		if (availableTiles.indexOf(overTileIndex) >= 0) {
			stroke(250);
		} else {
			stroke(250, 50, 50);
		}
		rect(tile.X, tile.Y, tileSize, tileSize, 3);
	}
}

function initGame() {}

function drawLoading() {
	fill(0);
	noStroke();
	textSize(50);
	textAlign(CENTER, CENTER);
	text("Loading...", width / 2, height / 2);
	if (
		soundManager.totalLoadedSounds === soundManager.soundToLoad &&
		spritesheet.totalLoadedImages === spritesheet.totalImagesToLoad
	) {
		curState = GAME_START_STATE;

		// init game
		initGame();
		textAlign(LEFT, BASELINE);
		uiManager.addLogger("Game loaded");
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
	if (curState === GAME_START_STATE) {
		spritesheet.drawSprite("cover", 0, (windowWidth - 800) / 2, 0);
	}
	if (curState === GAME_PLAY_STATE) {
		updateGame(elapsedTime);
		drawGame();
	}

	uiManager.draw();
	if (toolManager.currentTool) {
		toolManager.currentTool.draw();
	}
	jobManager.draw();

	lastTime = currentTime;
}

function getNeighborTiles(i, j) {
	if (i > 0 && i < 4 && j > 0 && j < 3) {
		return [
			{ i: i - 1, j: j - 1 },
			{ i: i, j: j - 1 },
			{ i: i + 1, j: j - 1 },
			{ i: i + 1, j: j },
			{ i: i - 1, j: j },
			{ i: i - 1, j: j + 1 },
			{ i: i, j: j + 1 },
			{ i: i + 1, j: j + 1 },
		];
	}
	return [];
}

function prepareBoardTiles(dice) {
	const hasDice = boardTiles.some((tile) => tile.dice);
	if (!hasDice) {
		availableTiles = [];
		for (let j = 0; j < 4; j++) {
			for (let i = 0; i < 5; i++) {
				const curIndex = i + j * 5;
				if (i === 0 || i === 4 || j === 0 || j === 3) {
					availableTiles.push(curIndex);
				}
			}
		}
		return;
	} else {
		availableTiles = [];
		for (let j = 0; j < 4; j++) {
			for (let i = 0; i < 5; i++) {
				const curIndex = i + j * 5;
				const curTile = boardTiles[curIndex];
				const neighbor = getNeighborTiles(i, j);
				if (
					neighbor.every((n) => {
						const nCurIndex = n.i + n.j * 5;
						return boardTiles[nCurIndex].dice !== null;
					})
				) {
					continue;
				}
				if (curTile.dice === null) {
					if (curTile.constraint?.color) {
						const curColor = colors[curTile.constraint.color];
						if (curColor !== dice.color) {
							continue;
						}
					} else if (curTile.constraint?.value) {
						if (curTile.constraint.value !== dice.value) {
							continue;
						}
					}
				}
				availableTiles.push(curIndex);
			}
		}
	}
}

function checkOverDice() {
	overDiceIndex = -1;
	curDices.forEach((dice, i) => {
		if (dice.isOverDice(mouseX, mouseY)) {
			overDiceIndex = i;
		}
	});
}

function checkOverBoardTile() {
	overTileIndex = -1;
	boardTiles.forEach((tile, i) => {
		if (
			mouseX > tile.X &&
			mouseX < tile.X + tileSize &&
			mouseY > tile.Y &&
			mouseY < tile.Y + tileSize
		) {
			overTileIndex = i;
		}
	});
}

function mouseMoved() {
	if (selectedDiceIndex === -1) {
		checkOverDice();
	} else {
		checkOverBoardTile();
	}
}

function canPutDice(dice, tileIndex) {
	// TODO: can put dice on this tile ?
	if (availableTiles.indexOf(tileIndex) >= 0) {
		return true;
	}
	return false;
}

function mousePressed() {
	if (selectedDiceIndex != -1 && overTileIndex !== -1) {
		if (canPutDice(curDices[overDiceIndex], overTileIndex)) {
			boardTiles[overTileIndex].dice = curDices[overDiceIndex];
			curDices.splice(overDiceIndex, 1);
			overDiceIndex = -1;
			selectedDiceIndex = -1;
			overTileIndex = -1;
		} else {
			return;
		}
	}
	if (overDiceIndex !== -1 && selectedDiceIndex == -1) {
		selectedDiceIndex = overDiceIndex;
		// compute available tiles
		prepareBoardTiles(curDices[selectedDiceIndex]);
	} else {
		selectedDiceIndex = -1;
		checkOverDice();
	}
}

function mouseClicked() {
	if (toggleDebug) {
		uiManager.addLogger(`X=${mouseX}, Y=${mouseY}`);
	}
	toolManager.mouseClicked();
	uiManager.mouseClicked();
	return false;
}

function keyPressed() {
	if (key === "D") {
		toggleDebug = !toggleDebug;
	}
}
