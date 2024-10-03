const uiManager = new UIManager();
const windowWidth = 1400;
const windowHeight = 900;
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

const COLOR = {
	CARPE: "carpe",
	LIEVRE: "lievre",
	ROSSIGNOL: "rossignol",
	CERF: "cerf",
	PAPILLON: "papillon",
	CRAPAUD: "crapaud",
};

const ROLE = {
	MURDER: "murder",
	PROTECT: "protect",
	NOBLE: "noble",
	SPY: "spy",
	CITIZEN: "citizen",
};

let cards = [];

let missions = [];

const board = {
	lightCards: [], // light cards
	darkCards: [], // dark cards
	players: [],
};

function addRole(color, role, nb, index) {
	for (let i = 0; i < nb; i++) {
		cards.push({ color, role, index });
	}
}

function addFamily(color, index) {
	addRole(color, ROLE.MURDER, 2, index);
	addRole(color, ROLE.PROTECT, 3, index + 1);
	addRole(color, ROLE.NOBLE, 4, index + 2);
	addRole(color, ROLE.SPY, 2, index + 3);
	addRole(color, ROLE.CITIZEN, 4, index + 4);
}

function addCards() {
	let index = 0;
	addFamily(COLOR.CARPE, index);
	addFamily(COLOR.LIEVRE, index + 5);
	addFamily(COLOR.ROSSIGNOL, index + 10);
	addFamily(COLOR.CERF, index + 15);
	addFamily(COLOR.PAPILLON, index + 20);
	addFamily(COLOR.CRAPAUD, index + 25);
}

function addMissions() {
	missions.push({ color: "blue", type: COLOR.PAPILLON, index: 0 });
	missions.push({ color: "blue", type: COLOR.CRAPAUD, index: 1 });
	missions.push({ color: "blue", type: COLOR.ROSSIGNOL, index: 2 });
	missions.push({ color: "blue", type: COLOR.LIEVRE, index: 3 });
	missions.push({ color: "blue", type: COLOR.CERF, index: 4 });
	missions.push({ color: "blue", type: COLOR.CARPE, index: 5 });
	missions.push({ color: "blue", type: "2", index: 6 });
	missions.push({ color: "blue", type: "3", index: 7 });
	missions.push({ color: "blue", type: "5", index: 8 });
	missions.push({ color: "blue", type: "1", index: 9 });

	missions.push({ color: "white", type: COLOR.PAPILLON, index: 12 });
	missions.push({ color: "white", type: COLOR.CRAPAUD, index: 13 });
	missions.push({ color: "white", type: COLOR.ROSSIGNOL, index: 14 });
	missions.push({ color: "white", type: COLOR.LIEVRE, index: 15 });
	missions.push({ color: "white", type: COLOR.CERF, index: 16 });
	missions.push({ color: "white", type: COLOR.CARPE, index: 17 });
	missions.push({ color: "white", type: ROLE.PROTECT, index: 18 });
	missions.push({ color: "white", type: ROLE.NOBLE, index: 19 });
	missions.push({ color: "white", type: ROLE.SPY, index: 20 });
	missions.push({ color: "white", type: ROLE.MURDER, index: 21 });
}

const GAME_LOADING_STATE = 0;
const GAME_START_STATE = 1;
const GAME_PLAY_STATE = 2;
const GAME_OVER_STATE = 3;
let curState = GAME_LOADING_STATE;
let toggleDebug = false;
let lastTime = 0;

function preload() {}

function musicClicked() {
	// TODO
}

const speakerStorageKey = "DrDr3ck/GameEngine/Speaker";
function speakerClicked() {
	speakerButton.checked = !speakerButton.checked;
	soundManager.mute(!speakerButton.checked);
	localStorage.setItem(speakerStorageKey, speakerButton.checked ? "on" : "off");
}

// type is player name or light or dark
function dropCard(dropCard, type) {
	if (type === "light") {
		let position = 0;
		const isSpy = dropCard.role === ROLE.SPY;
		board.lightCards.forEach((positionCard) => {
			const card = positionCard.card;
			if (isSpy) {
				if (card.role === ROLE.SPY) {
					position += 1;
				}
			} else {
				if (card.role !== ROLE.SPY && card.color === dropCard.color) {
					position += 1;
				}
			}
		});
		console.log("position:", position);
		board.lightCards.push({ card: dropCard, position });
	} else if (type === "dark") {
		let position = 0;
		const isSpy = dropCard.role === ROLE.SPY;
		board.darkCards.forEach((positionCard) => {
			const card = positionCard.card;
			if (isSpy) {
				if (card.role === ROLE.SPY) {
					position += 1;
				}
			} else {
				if (card.color === dropCard.color) {
					position += 1;
				}
			}
		});
		console.log("position:", position);
		board.darkCards.push({ card: dropCard, position });
	}
}

function startClicked() {
	curState = GAME_PLAY_STATE;
	uiManager.setUI([speakerButton, musicButton]);
	uiManager.addLogger("Start game");

	cards = [];
	addCards();
	shuffleArray(cards);
	missions = [];
	addMissions();
	shuffleArray(missions);

	// DEBUG
	dropCard(cards.pop(), "light");
	dropCard(cards.pop(), "light");
	dropCard(cards.pop(), "light");
	dropCard(cards.pop(), "light");
	dropCard(cards.pop(), "light");
	dropCard(cards.pop(), "light");

	dropCard(cards.pop(), "light");
	dropCard(cards.pop(), "light");
	dropCard(cards.pop(), "light");
	dropCard(cards.pop(), "light");
	dropCard(cards.pop(), "light");
	dropCard(cards.pop(), "light");

	dropCard(cards.pop(), "dark");
	dropCard(cards.pop(), "dark");
	dropCard(cards.pop(), "dark");
	dropCard(cards.pop(), "dark");
	// END DEBUG
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
	windowWidth / 2 - 200,
	windowHeight - 100,
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

function setup() {
	initUI();
	canvas = createCanvas(windowWidth, windowHeight);
	canvas.parent("canvas");

	frameRate(60);

	spritesheet.addSpriteSheet("main", "./main.png", 310, 575);
	spritesheet.addSpriteSheet("cover", "./cover.png", 260, 450);
	spritesheet.addSpriteSheet("cards", "./cards.png", 260, 450);
	// 4 nobles, 2 espions, 2 assassins, 3 gardes et 4 autres

	spritesheet.addSpriteSheet("missions", "./missions.png", 340, 230);

	spritesheet.addSpriteSheet("board", "./board.png", 2070, 560);

	lastTime = Date.now();
}

function updateGame(elapsedTime) {}

const positions = {
	papillon: 65,
	crapaud: 260,
	rossignol: 440,
	lievre: 800,
	cerf: 973,
	carpe: 1160,
};

const spyPosition = 617;

function displayCard(card, y) {
	if (card.role !== ROLE.SPY) {
		spritesheet.drawScaledSprite(
			"cards",
			card.index,
			positions[card.color],
			y,
			0.75
		);
	} else {
		spritesheet.drawScaledSprite("cover", 0, spyPosition, y, 0.75);
	}
}

function drawBoard() {
	const cards = [...board.lightCards].reverse();
	cards.forEach((card) => {
		displayCard(card.card, 160 - 60 * card.position);
	});
	spritesheet.drawScaledSprite(
		"board",
		0,
		(windowWidth - 2070 * 0.65) / 2,
		(windowHeight - 560 * 0.65) / 2,
		0.65
	);
	board.darkCards.forEach((card) => {
		displayCard(card.card, 450 + 60 * card.position);
	});
}

function drawGame() {
	drawBoard();
	/*
	spritesheet.drawScaledSprite("cards", 10, 440, 160, 0.75);
	spritesheet.drawScaledSprite("cards", 7, 800, 160, 0.75);
	spritesheet.drawScaledSprite("cards", 27, 260, 100, 0.75);
	spritesheet.drawScaledSprite("cards", 26, 260, 160, 0.75);

	//

	spritesheet.drawScaledSprite("cards", 0, 1160, 450, 0.75);
	spritesheet.drawScaledSprite("cards", 21, 65, 450, 0.75);
	spritesheet.drawScaledSprite("cards", 17, 973, 450, 0.75);
	spritesheet.drawScaledSprite("cards", 19, 973, 510, 0.75);
	spritesheet.drawScaledSprite("cards", 19, 973, 570, 0.75);

	spritesheet.drawScaledSprite("cover", 0, 617, 450, 0.75);
	*/

	// main
	spritesheet.drawScaledSprite("cards", cards[0].index, 410, 820, 0.75);
	spritesheet.drawScaledSprite("cards", cards[1].index, 610, 820, 0.75);
	spritesheet.drawScaledSprite("cards", cards[2].index, 810, 820, 0.75);
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
		spritesheet.drawSprite("main", 0, (windowWidth - 310) / 2, 20);

		spritesheet.drawSprite("missions", 11, 50, 150);
		spritesheet.drawSprite("missions", 23, windowWidth - 340 - 50, 150);
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

/* Randomize array in-place using Durstenfeld shuffle algorithm */
const shuffleArray = (array) => {
	for (var i = array.length - 1; i > 0; i--) {
		var j = Math.floor(Math.random() * (i + 1));
		var temp = array[i];
		array[i] = array[j];
		array[j] = temp;
	}
};
