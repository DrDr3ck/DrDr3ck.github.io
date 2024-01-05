const uiManager = new UIManager();
const windowWidth = 1700;
const windowHeight = 1000;
uiManager.loggerContainer = new LoggerContainer(1150, 700, 240, 100);
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
const EXPLORATION_STATE = "exploration"; // click on the exploration card to reveal it.
const CUBE_STATE = "cube"; // poser des cubes
const VILLAGE_STATE = "village"; // transformer un cube en village
const SPECIALIZED_STATE = "specialites"; // choisir une carte spécialité parmi 2
const SPECIALIZED_CARD_STATE = "quelle specialite ?"; // choisir une des 3 cartes spécialités
let playState = EXPLORATION_STATE;
let toggleDebug = false;
let lastTime = 0;

const CARD = {
	MOUNTAIN: "mountain",
	SAND: "sand",
	GRASSLAND: "grassland",
	SEA: "sea",
	JOKER: "joker",
	CAPITAL: "capital",
	TOWER: "tower",
	VILLAGE: "village",
};

let overCell = null;
let overExploration = false;
let overTreasure = false;
let overHelpButton = false;
let overSpecialization = -1; // 0 or 1
let overSpecializedCard = -1; // 0, 1 or 2
let age = 1; // 1 to 4
let PV = 0;
let PVTreasure = 0;
let villageRegion = null;

const towerPV = [6, 8, 10, 14];

let cubes = [];
let constraint = "none";

const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
let seed = urlParams.get("seed");
// TODO: seed
if (!seed) {
	seed = "Avenia"; //getRandomName().replaceAll(' ', '_');
}

function preload() {
	spritesheet.addSpriteSheet("cover", "./cover.png", 686, 503);
	spritesheet.addSpriteSheet("avenia", "./avenia.png", 1680, 1405);
	spritesheet.addSpriteSheet("exploration", "./exploration.png", 840, 588);
	spritesheet.addSpriteSheet(
		"exploration_cards",
		"./exploration_cards.png",
		260,
		400
	);
	spritesheet.addSpriteSheet(
		"speciality_cards",
		"./speciality_cards.png",
		260,
		400
	);
	spritesheet.addSpriteSheet("tresor_cards", "./tresor_cards.png", 400, 260);
	spritesheet.addSpriteSheet("comptoirs", "./comptoirs.png", 100, 100);
	spritesheet.addSpriteSheet("goals", "./goals.png", 520, 370);
	spritesheet.addSpriteSheet("coffre_pion", "./coffre_pion.png", 80, 90);
	spritesheet.addSpriteSheet("PV", "./PV.png", 136, 141);
	spritesheet.addSpriteSheet("solo_rules", "./solo_rules.png", 550, 700);
}

function musicClicked() {
	// TODO
}

const speakerStorageKey = "DrDr3ck/GuildeMarchande/Speaker";
function speakerClicked() {
	speakerButton.checked = !speakerButton.checked;
	soundManager.mute(!speakerButton.checked);
	localStorage.setItem(speakerStorageKey, speakerButton.checked ? "on" : "off");
}

function startClicked() {
	curState = GAME_PLAY_STATE;
	uiManager.setUI([speakerButton, musicButton, ruleButton]);
	uiManager.addLogger("A vous de jouer!");
}

function validateClicked() {
	// TODO: verifier si les conditions sont bonnes ?
	// TODO: compter les points (comptoirs) remark: mettre les cubes tresors avant
	// TODO: verifier si un objectif est atteint
	let treasureCubes = 0;
	cubes.forEach((cube) => {
		if (cube.type === CARD.VILLAGE) {
			transformCubeToVillage(cube.position.x, cube.position.y);
			PV += age;
		}
		const cell = board[cube.position.x][cube.position.y];
		if (cell.type === CARD.TOWER) {
			PV += towerPV.shift();
		}
		if (!cell.bonus) {
			return;
		}
		if (cell.bonus.type === "piece") {
			PV += cell.bonus.nb;
		}
		if (cell.bonus.type === "tresor") {
			// check if cube is a known ruin
			// otherwise, pick a treasure card
			if (
				!ruines.some(
					(rcell) => rcell.x === cube.position.x && rcell.y === cube.position.y
				)
			) {
				// piocher un tresor
				const treasureIndex = tresorArray.shift();
				tresors.push(treasureIndex);
				if (treasureIndex === 0) {
					treasureCubes += 1;
				}
				ruines.push({ x: cube.position.x, y: cube.position.y });
			}
		}
	});
	// nettoyer cubes et constraint
	cubes = [];
	constraint = "none";
	// passer à la carte exploration suivante
	validateButton.enabled = false;
	if (treasureCubes === 0) {
		playState = EXPLORATION_STATE;
		uiManager.setUI([speakerButton, musicButton, ruleButton]);
	} else {
		if (treasureCubes === 1) {
			uiManager.addLogger("Vous avez un cube trésors à placer");
		} else {
			uiManager.addLogger("Vous avez des cubes trésors à placer");
		}
		for (let i = 0; i < treasureCubes; i++) {
			cubes.push({ type: "joker", position: { x: 0, y: 0 } });
		}
		return;
	}
	checkGoals();
	// compter les points de tresors
	countPVTreasure();
}

function getVillages() {
	return ageExploration.filter(
		(exploration) => exploration.type === CARD.VILLAGE
	);
}

function getTowers() {
	return ageExploration.filter(
		(exploration) => exploration.type === CARD.TOWER
	);
}

function countPVTreasure() {
	let amphore = 0;
	PVTreasure = 0;
	console.log("ageExploration:", ageExploration);
	tresors.forEach((t) => {
		if (t === 1) {
			// amphore
			amphore += 1;
		} else if (t === 2) {
			// 2 pieces
			PVTreasure += 2;
		} else if (t === 3) {
			// mountain village
			const villages = getVillages();
			villages.forEach((village) => {
				const cell = board[village.x][village.y];
				if (cell.type === CARD.MOUNTAIN) {
					PVTreasure += 1;
				}
			});
		} else if (t === 5) {
			// sand village
			const villages = getVillages();
			villages.forEach((village) => {
				const cell = board[village.x][village.y];
				if (cell.type === CARD.SAND) {
					PVTreasure += 1;
				}
			});
		} else if (t === 6) {
			// grassland village
			const villages = getVillages();
			villages.forEach((village) => {
				const cell = board[village.x][village.y];
				if (cell.type === CARD.GRASSLAND) {
					PVTreasure += 1;
				}
			});
		} else if (t === 7) {
			// villages
			const villages = ageExploration.filter(
				(exploration) => exploration.type === CARD.VILLAGE
			);
			PVTreasure += Math.floor(villages.length / 2);
		} else if (t === 8) {
			// tower
			PVTreasure += ageExploration.filter(
				(exploration) => exploration.type === CARD.TOWER
			).length;
		}
	});
	amphorePV = [0, 1, 4, 9, 16, 20, 24, 28, 32, 36, 40];
	PVTreasure += amphorePV[amphore];
}

function undoClicked() {
	for (let i = 0; i < cubes.length; i++) {
		undoCube(i);
	}
	cubes = cubes.filter((cube) => cube.type !== CARD.VILLAGE);
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
const ruleButton = new BFloatingSwitchButton(
	windowWidth - 70 - 20 - 140,
	70,
	"\u003F",
	() => {
		// ruleButton.checked = !ruleButton.checked;
	}
);
const startButton = new BButton(
	140,
	windowHeight - 120,
	"AVENIA",
	startClicked
);

const validateButton = new BButton(
	630,
	windowHeight - 5,
	"Valider",
	validateClicked
);
const undoButton = new BButton(530, 80, "Undo", undoClicked);

class Randomizer {
	constructor(seed) {
		if (seed) {
			this.generator = new Math.seedrandom(seed.toString());
		} else {
			this.generator = Math.random;
		}
	}

	/* Randomize array in-place using Durstenfeld shuffle algorithm */
	shuffleArray(array) {
		for (var i = array.length - 1; i > 0; i--) {
			var j = this.randomInt(i + 1);
			var temp = array[i];
			array[i] = array[j];
			array[j] = temp;
		}
	}

	randomInt(i) {
		return Math.floor(this.generator() * i);
	}
}

const randomizer = new Randomizer(seed);

const board = [];

let goalArray = [0, 1, 2, 3, 4, 5];
randomizer.shuffleArray(goalArray);
goalArray = goalArray.splice(-3); // remove 3 last goals

const ageCards = [0, 1, 2, 3, 4, 5];
randomizer.shuffleArray(ageCards);
ageCards.unshift(9);

const specialityArray = [1, 2, 3, 4, 20, 24, 25]; // [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28];
randomizer.shuffleArray(specialityArray);

const tresorArray = [
	0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2,
	3, 3, 5, 5, 6, 6, 7, 7, 8, 8, 8, 8, 8, 8,
];
randomizer.shuffleArray(tresorArray);

const tresors = [];

const regions = [];

const ruines = [];

const boarderRuins = [];

const specialityCards = []; // 3 cards

let ageExploration = [{ type: CARD.CAPITAL, x: 9, y: 6 }];

let exploredCards = [6, 7, 8];

function removeCubes() {
	ageExploration = ageExploration.filter((cell) => cell.type !== "cube");
}

function undoCube(cubeIndex) {
	const x = cubes[cubeIndex].position.x;
	const y = cubes[cubeIndex].position.y;
	cubes[cubeIndex].position.x = 0;
	cubes[cubeIndex].position.y = 0;
	ageExploration = ageExploration.filter(
		(cell) => cell.x !== x || cell.y !== y
	);
	validateButton.enabled = false;
}

function addCube(x, y) {
	/* check if cube can be undo
	const undoCubeIndex = cubes.findIndex(cube=>cube.position.x === x && cube.position.y === y);
	if( undoCubeIndex >= 0 ) {
		// undo cube
		undoCube(undoCubeIndex);
		return;
	}*/
	// check if cube not already added
	if (ageExploration.findIndex((cell) => cell.x === x && cell.y === y) >= 0) {
		return false;
	}
	const cell = board[x][y];
	// check if cube can be pushed
	// TODO: constraint
	const cubeIndex = cubes.findIndex(
		(c) =>
			(c.type === CARD.JOKER ||
				c.type === cell.type ||
				cell.type === CARD.TOWER) &&
			c.position.x === 0
	);
	if (cubeIndex === -1) {
		// pas de cube dispo pour ce type
		return false;
	}
	if (cell.type === CARD.TOWER) {
		ageExploration.push({ type: CARD.TOWER, x: x, y: y });
	} else {
		ageExploration.push({ type: "cube", x: x, y: y });
	}
	cubes[cubeIndex].position.x = x;
	cubes[cubeIndex].position.y = y;
	// check if all cubes have been put on board
	if (cubes.every((cube) => cube.position.x !== 0)) {
		validateButton.enabled = true;
	}
	return true;
}

function transformCubeToVillage(x, y) {
	const index = ageExploration.findIndex(
		(cell) => cell.x === x && cell.y === y
	);
	if (index >= 0) {
		ageExploration[index].type = CARD.VILLAGE;
	}
}

function initUI() {
	speakerButton.setTextSize(50);
	musicButton.setTextSize(50);
	ruleButton.setTextSize(50);
	musicButton.enabled = false;
	musicButton.checked = false;
	ruleButton.checked = false;
	const isSpeakerOn = localStorage.getItem(speakerStorageKey);
	if (isSpeakerOn === "off") {
		speakerButton.checked = false;
		soundManager.mute(true);
	}
	const menu = [speakerButton, startButton, musicButton, ruleButton];
	uiManager.setUI(menu);
}

function setup() {
	initUI();
	canvas = createCanvas(windowWidth, windowHeight);
	canvas.parent("canvas");

	frameRate(10);

	initBoard();
	computeRegions();

	lastTime = Date.now();
}

function updateGame(elapsedTime) {}

const boardx = 50;
const boardy = 25;

function debugDrawCase(x, y, type, row, column, bonus) {
	noFill();
	if (type === CARD.MOUNTAIN) {
		fill(216, 166, 112);
	} else if (type === CARD.SEA) {
		fill(176, 171, 138);
	} else if (type === CARD.SAND) {
		fill(227, 202, 144);
	} else if (type === CARD.GRASSLAND) {
		fill(176, 161, 87);
	} else if (type === CARD.TOWER) {
		fill(224, 201, 188);
	} else if (type === CARD.CAPITAL) {
		fill(200, 200, 200);
	} else {
		return;
	}
	stroke(1);
	ellipse(x + boardx, y + boardy, 25); // 45 de rayon
	noStroke();
	fill(0);
	text(`${row}/${column}`, x + boardx - 12, y + boardy);
	if (bonus) {
		text(bonus.type, x + boardx - 12, y + boardy + 12);
	}
}

function drawCoffre(x, y) {
	const cell = board[x][y];
	const X = cell.center.x + boardx - 25;
	const Y = cell.center.y + boardy - 25;
	spritesheet.drawScaledSprite("coffre_pion", 0, X, Y, 0.65);
}

function drawComptoir(x, y) {
	const cell = board[x][y];
	const type = cell.type;
	let typeIndex = 0;
	if (type === CARD.MOUNTAIN) {
		typeIndex = 1;
	} else if (type === CARD.GRASSLAND) {
		typeIndex = 2;
	}
	spritesheet.drawScaledSprite(
		"comptoirs",
		typeIndex,
		cell.center.x + boardx - 27,
		cell.center.y + boardy - 27,
		0.56
	);
}

function debugDrawBoard() {
	stroke(0);
	strokeWeight(1);
	textSize(12);
	board.forEach((column, x) =>
		column.forEach((cell, y) =>
			debugDrawCase(cell.center.x, cell.center.y, cell.type, x, y, cell.bonus)
		)
	);
	// teste comptoir
	/*
	drawComptoir(12, 2);
	drawComptoir(12, 5);
	drawComptoir(11, 12);
	*/
}

function drawCube(x, y, alternative = false) {
	stroke(0);
	fill(250, 100, 100);
	if (alternative) {
		fill(250, 150, 150);
	}
	const cell = board[x][y];
	rect(cell.center.x + boardx - 10, cell.center.y + boardy - 10, 20, 20);
}

function drawGoalCube(column, row) {
	stroke(0);
	strokeWeight(1);
	fill(250, 100, 100);
	rect(1520 + 1000 * column, 530 + 190 * row, 20, 20);
}

function drawVillage(x, y, alternative = false) {
	strokeWeight(1);
	stroke(0);
	fill(250, 100, 100);
	if (alternative) {
		fill(250, 150, 150);
	}
	const cell = board[x][y];
	beginShape();
	const X = cell.center.x + boardx;
	const Y = cell.center.y + boardy + 10;
	vertex(X - 20, Y);
	vertex(X - 20, Y - 15);
	vertex(X - 15, Y - 20);
	vertex(X + 15, Y - 20);
	vertex(X + 20, Y - 15);
	vertex(X + 20, Y);
	vertex(X, Y);
	vertex(X, Y - 5);
	vertex(X - 10, Y - 5);
	vertex(X - 10, Y);
	vertex(X - 20, Y);
	endShape();
}

function drawTower(x, y, alternative = false) {
	strokeWeight(1);
	stroke(0);
	fill(250, 100, 100);
	if (alternative) {
		fill(250, 150, 150);
	}
	const cell = board[x][y];
	rect(cell.center.x + boardx - 10, cell.center.y + boardy - 25, 20, 50);
}

function displayAgeExploration() {
	ageExploration.forEach((cell) => {
		if (cell.type === "cube") {
			drawCube(cell.x, cell.y);
		} else if (cell.type === CARD.VILLAGE || cell.type === CARD.CAPITAL) {
			drawVillage(cell.x, cell.y);
		} else if (cell.type === CARD.TOWER) {
			drawTower(cell.x, cell.y);
		}
	});
	cubes.forEach((cube) => {
		const bcell = board[cube.position.x][cube.position.y];
		if (cube.type === CARD.VILLAGE) {
			drawVillage(cube.position.x, cube.position.y, true);
		} else {
			drawCube(cube.position.x, cube.position.y, true);
		}
		if (bcell.type === CARD.TOWER) {
			drawTower(cube.position.x, cube.position.y, true);
		}
	});
}

function drawExploredCards() {
	// couvrir les cartes explorations deja jouées
	if (exploredCards.includes(0)) {
		spritesheet.drawScaledSprite("exploration_cards", 0, 1180, 90 - 25, 0.325);
	}
	if (exploredCards.includes(1)) {
		spritesheet.drawScaledSprite("exploration_cards", 1, 1280, 90 - 25, 0.325);
	}
	if (exploredCards.includes(2)) {
		spritesheet.drawScaledSprite("exploration_cards", 2, 1380, 90 - 25, 0.325);
	}
	if (exploredCards.includes(3)) {
		spritesheet.drawScaledSprite("exploration_cards", 3, 1480, 90 - 25, 0.325);
	}
	if (exploredCards.includes(4)) {
		spritesheet.drawScaledSprite("exploration_cards", 4, 1580, 90 - 25, 0.325);
	}
	if (exploredCards.includes(5)) {
		spritesheet.drawScaledSprite("exploration_cards", 5, 1225, 238, 0.325);
	}
	if (exploredCards.includes(6)) {
		spritesheet.drawScaledSprite("exploration_cards", 6, 1328, 238, 0.325);
	}
	if (exploredCards.includes(7)) {
		spritesheet.drawScaledSprite("exploration_cards", 7, 1433, 238, 0.325);
	}
	if (exploredCards.includes(8)) {
		spritesheet.drawScaledSprite("exploration_cards", 8, 1537, 238, 0.325);
	}
}

function drawTreasure() {
	if (tresors.length === 0) {
		stroke(0);
		fill(176, 171, 138);
		rect(525, 340, 930 - 525, 440 - 340, 15);
		noStroke();
		fill(250);
		textSize(25);
		text("Pas de trésor pour le moment", 570, 400);
	} else {
		stroke(0);
		fill(176, 171, 138);
		rect(235, 65, 1065 - 235, 900 - 65, 15);
		spritesheet.drawScaledSprite("tresor_cards", 0, 270, 100, 0.65);
		spritesheet.drawScaledSprite("tresor_cards", 1, 780, 100, 0.65);
		spritesheet.drawScaledSprite("tresor_cards", 2, 270, 300, 0.65);
		spritesheet.drawScaledSprite("tresor_cards", 3, 780, 300, 0.65);
		spritesheet.drawScaledSprite("tresor_cards", 5, 270, 500, 0.65);
		spritesheet.drawScaledSprite("tresor_cards", 6, 780, 500, 0.65);
		spritesheet.drawScaledSprite("tresor_cards", 7, 270, 700, 0.65);
		spritesheet.drawScaledSprite("tresor_cards", 8, 780, 700, 0.65);
		noStroke();
		fill(250);
		textSize(25);
		const countTreasure = (index) => {
			return tresors.filter((t) => t === index).length;
		};
		text(`x ${countTreasure(0)}`, 550, 180); // 0
		text(`${countTreasure(1)} x`, 700, 180); // 1
		text(`x ${countTreasure(2)}`, 550, 380); // 2
		text(`${countTreasure(3)} x`, 700, 380); // 3
		text(`x ${countTreasure(5)}`, 550, 580); // 5
		text(`${countTreasure(6)} x`, 700, 580); // 6
		text(`x ${countTreasure(7)}`, 550, 780); // 7
		text(`${countTreasure(8)} x`, 700, 780); // 8
	}
}

let goals = [0, 0, 0, 0, 0, 0];

function drawGoals() {
	goalArray.forEach((goal, index) => {
		if (goals[goal] === 0) {
			return;
		} else if (goals[goal] === 10) {
			drawGoalCube(0, index);
		} else if (goals[goal] === 5) {
			drawGoalCube(1, index);
		}
	});
}

/**
 * Player reaches a goal
 * @param index index of reached goal
 */
function reachGoal(index) {
	// check if goal is in list of goal of current game
	if (!goalArray.includes(index)) {
		return;
	}
	// add point accordingly
	if (goals[index] === 0) {
		// TODO: to check with solo mode
		goals[index] = 10;
		PV += 10;
	}
}

function getBorderRuins() {
	return ruines.some((ruin) => {
		const ring = getRing(ruin.x, ruin.y);
		const border = ring.some((cell) => !cell.type);
		return border;
	});
}

/**
 * Checks if goals are reached
 */
function checkGoals() {
	// explorer 3 cases ruines le long du bord de la mappe
	if (getBorderRuins().length >= 3) {
		reachGoal(0);
	}
	// decouvrez un village dans une region 5+
	const villages = getVillages();
	if (
		villages.some((village) => {
			const region = findRegion(village.x, village.y);
			return region.cells.length >= 5;
		})
	) {
		reachGoal(1);
	}
	// TODO: placez 2 comptoirs sur des villes 3+
	// decouvrez villages sur les 3 types
	const types = [false, false, false];
	villages.forEach((village) => {
		const bcell = board[village.x][village.y];
		if (bcell.type === CARD.MOUNTAIN) {
			types[0] = true;
		} else if (bcell.type === CARD.SAND) {
			types[1] = true;
		} else if (bcell.type === CARD.GRASSLAND) {
			types[2] = true;
		}
	});
	if (types.every((t) => t)) {
		reachGoal(3);
	}
	// placez 2 tours
	if (getTowers().length >= 2) {
		reachGoal(4);
	}
	// decouvrez 5 villages
	if (villages.length >= 5) {
		reachGoal(5);
	}
}

function drawGame() {
	spritesheet.drawScaledSprite("avenia", 0, boardx, boardy, 0.65);
	spritesheet.drawScaledSprite("exploration", 0, 1150, boardy, 0.65);
	if (toggleDebug) {
		debugDrawBoard();
	} else {
		// ruines
		ruines.forEach((ruin) => drawCoffre(ruin.x, ruin.y));
		displayAgeExploration();
	}
	drawExploredCards();
	if (overCell) {
		const cell = board[overCell.x][overCell.y];
		noFill();
		strokeWeight(4);
		stroke(250);
		ellipse(cell.center.x + boardx, cell.center.y + boardy, 45); // 45 de rayon
	}
	if (ageCards.length !== 0) {
		spritesheet.drawScaledSprite(
			"exploration_cards",
			ageCards[0],
			1150,
			440 - 25,
			0.65
		);
		noFill();
		strokeWeight(4);
		if (playState === EXPLORATION_STATE) {
			stroke(250, 50, 50);
		} else {
			stroke(250);
		}
		rect(1150, 415, 1320 - 1150, 674 - 415, 15);
		if (overExploration) {
			stroke(25);
			rect(1150, 415, 1320 - 1150, 674 - 415, 15);
		}
	}
	if (overTreasure) {
		drawTreasure();
	}
	if (playState === SPECIALIZED_STATE) {
		// afficher 2 cartes tirées du tableau
		noFill();
		strokeWeight(4);
		stroke(250); //stroke(184,150,109);
		spritesheet.drawScaledSprite(
			"speciality_cards",
			specialityArray[0],
			997,
			100,
			0.8
		);
		rect(997, 100, 205, 320, 15);
		spritesheet.drawScaledSprite(
			"speciality_cards",
			specialityArray[1],
			997,
			467,
			0.8
		);
		rect(997, 467, 205, 320, 15);
		stroke(25);
		if (overSpecialization === 0) {
			rect(997, 100, 205, 320, 15);
		}
		if (overSpecialization === 1) {
			rect(997, 467, 205, 320, 15);
		}
	}

	// afficher cards specialites
	if (specialityCards.length <= 0) {
		spritesheet.drawScaledSprite("speciality_cards", 0, 5 - 115, 120 - 25, 0.6);
	} else {
		spritesheet.drawScaledSprite(
			"speciality_cards",
			specialityCards[0],
			5,
			120 - 25,
			0.6
		);
	}
	if (specialityCards.length <= 1) {
		spritesheet.drawScaledSprite("speciality_cards", 0, -110, 380 - 25, 0.6);
	} else {
		spritesheet.drawScaledSprite(
			"speciality_cards",
			specialityCards[1],
			5,
			380 - 25,
			0.6
		);
	}
	if (specialityCards.length <= 2) {
		spritesheet.drawScaledSprite("speciality_cards", 0, -110, 640 - 25, 0.6);
	} else {
		spritesheet.drawScaledSprite(
			"speciality_cards",
			specialityCards[2],
			5,
			640 - 25,
			0.6
		);
	}

	// choose a specialized card (I/II/III)
	if (playState === SPECIALIZED_CARD_STATE) {
		noFill();
		strokeWeight(4);
		stroke(25);
		if (overSpecializedCard === 0) {
			rect(5, 95, 160 - 5, 333 - 95, 15);
		}
		if (overSpecializedCard === 1) {
			rect(5, 355, 160 - 5, 593 - 355, 15);
		}
		if (overSpecializedCard === 2) {
			rect(5, 615, 160 - 5, 849 - 615, 15);
		}
	}

	// goals
	spritesheet.drawScaledSprite("goals", goalArray[0], 1435, 440 - 25, 0.5);
	spritesheet.drawScaledSprite("goals", goalArray[1], 1435, 630 - 25, 0.5);
	spritesheet.drawScaledSprite("goals", goalArray[2], 1435, 820 - 25, 0.5);
	drawGoals();

	// points de victoire
	spritesheet.drawScaledSprite("PV", 0, 1330, 510, 0.8);
	noStroke();
	fill(250);
	textSize(25);
	text(`x ${PV}`, 1360, 640);
	text(`+ ${PVTreasure}`, 1360 - 2, 670);
	// tresor
	spritesheet.drawScaledSprite("tresor_cards", 9, 1150, 820, 0.65);
	fill(0);
	text(`x ${tresors.length}`, 1345, 945);

	// explication
	fill(250);
	if (playState === EXPLORATION_STATE) {
		text("Cliquez sur la carte d'exploration (bord rouge)", 200, 980);
	} else if (playState === CUBE_STATE) {
		text("Posez des cubes", 200, 980);
	} else if (playState === VILLAGE_STATE) {
		text("Placez un village dans la région", 200, 980);
	} else if (playState === SPECIALIZED_STATE) {
		text("Choisissez une carte spécialité", 200, 980);
	}
	if (age < 5) {
		text(`Age ${age}`, 10, 980);
	} else {
		text("Fin du jeu", 10, 980);
	}

	if (overHelpButton) {
		spritesheet.drawSprite(
			"solo_rules",
			0,
			(windowWidth - 550) / 2,
			(windowHeight - 700) / 2
		);
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
		uiManager.addLogger("Bienvenue");

		if (document.location.toString().includes("seed=")) {
			startClicked();
		}
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
		spritesheet.drawScaledSprite(
			"cover",
			0,
			(windowWidth - 630 * 1.5) / 2,
			50,
			1.5
		);
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

function addCube2Play(type, nb) {
	for (let i = 0; i < nb; i++) {
		cubes.push({ type: type, position: { x: 0, y: 0 } });
	}
}

function setConstraint(value) {
	constraint = value;
}

// player clicks on exploration card to reveal it.
// change playState to 'cube'
// check if it is the end of current age
function newExplorationCard() {
	cubes = [];
	if (ageCards[0] !== 9) {
		// put card on exploration board
		exploredCards.push(ageCards[0]);
	}
	ageCards.shift();
	if (ageCards.length === 0) {
		// new Age
		age += 1;
		if (age < 5) {
			uiManager.addLogger("Nouvel age");
		}
		if (age === 2) {
			for (let i = 0; i < 7; i++) {
				ageCards.push(i);
			}
			randomizer.shuffleArray(ageCards);
			ageCards.unshift(9);
			exploredCards = [7, 8];
		} else if (age === 3) {
			for (let i = 0; i < 8; i++) {
				ageCards.push(i);
			}
			randomizer.shuffleArray(ageCards);
			ageCards.unshift(9);
			exploredCards = [8];
		} else if (age === 4) {
			for (let i = 0; i < 9; i++) {
				ageCards.push(i);
			}
			randomizer.shuffleArray(ageCards);
			ageCards.unshift(9);
			exploredCards = [];
		} else if (age === 5) {
			// TODO: end of game - add points from treasure !
		}
		// remove all cubes
		removeCubes();
		return;
	}
	playState = CUBE_STATE;
	if (ageCards.length > 0) {
		if (ageCards[0] === 0) {
			// add 1 mountain
			addCube2Play(CARD.MOUNTAIN, 1);
			setConstraint("none");
		} else if (ageCards[0] === 1) {
			// add 2 sand
			addCube2Play(CARD.SAND, 2);
			setConstraint("none");
		} else if (ageCards[0] === 2) {
			// add 2 grassland
			addCube2Play(CARD.GRASSLAND, 2);
			setConstraint("none");
		} else if (ageCards[0] === 3) {
			// add 2 consecutive cells
			addCube2Play(CARD.JOKER, 2);
			setConstraint("consecutive");
		} else if (ageCards[0] === 4) {
			// add 3 aligned sea cells
			addCube2Play(CARD.SEA, 3);
			setConstraint("aligned");
		} else if (ageCards[0] === 5) {
			// I
			if (age === 1) {
				// player needs to choose a specialized card between two
				playState = SPECIALIZED_STATE;
			} else {
				prepareCube2Play(specialityCards[0]);
			}
		} else if (ageCards[0] === 6) {
			// II
			if (age === 2) {
				// player needs to choose a specialized card between two
				playState = SPECIALIZED_STATE;
			} else {
				prepareCube2Play(specialityCards[1]);
			}
		} else if (ageCards[0] === 7) {
			// III
			if (age === 3) {
				// player needs to choose a specialized card between two
				playState = SPECIALIZED_STATE;
			} else {
				prepareCube2Play(specialityCards[2]);
			}
		} else if (ageCards[0] === 8) {
			// I/II/III
			playState = SPECIALIZED_CARD_STATE;
		}
	}
	if (playState === CUBE_STATE) {
		addValidateButton();
	}
}

function addValidateButton() {
	validateButton.enabled = false;
	undoButton.enabled = true;
	uiManager.setUI([
		validateButton,
		undoButton,
		speakerButton,
		musicButton,
		ruleButton,
	]);
}

function prepareCube2Play(specialityCardIndex) {
	setConstraint("none");
	// [1,2,3,4,20,24,25]
	if (specialityCardIndex === 1) {
		addCube2Play(CARD.SEA, 2);
		addCube2Play(CARD.SAND, 1);
		addCube2Play(CARD.GRASSLAND, 1);
		addCube2Play(CARD.MOUNTAIN, 1);
	}
	if (specialityCardIndex === 2) {
		addCube2Play(CARD.GRASSLAND, 3);
		addCube2Play(CARD.MOUNTAIN, 2);
	}
	if (specialityCardIndex === 3) {
		addCube2Play(CARD.SAND, 3);
		addCube2Play(CARD.MOUNTAIN, 2);
	}
	if (specialityCardIndex === 4) {
		addCube2Play(CARD.SEA, 1);
		addCube2Play(CARD.MOUNTAIN, 3);
	}
	if (specialityCardIndex === 20) {
		addCube2Play(CARD.SEA, 5);
	}
	if (specialityCardIndex === 24) {
		addCube2Play(CARD.SEA, 1);
		addCube2Play(CARD.SAND, 4);
	}
	if (specialityCardIndex === 25) {
		addCube2Play(CARD.SEA, 1);
		addCube2Play(CARD.GRASSLAND, 4);
	}
}

function findRegion(x, y) {
	const regionIndex = regions.findIndex((region) => {
		if (region.cells.some((cell) => cell.x === x && cell.y === y)) {
			return true;
		}
		return false;
	});
	if (regionIndex >= 0) {
		return regions[regionIndex];
	}
	return null;
}

function mouseClicked() {
	if (toggleDebug) {
		uiManager.addLogger(`X=${mouseX}, Y=${mouseY}`);
	}
	toolManager.mouseClicked();
	uiManager.mouseClicked();
	// le joueur clique sur la carte d'exploration pour en découvrir une nouvelle
	if (playState === EXPLORATION_STATE && overExploration) {
		newExplorationCard();
		overExploration = false;
	}
	if (playState === CUBE_STATE && overCell) {
		// check also if we can put a cube on this cell
		if (addCube(overCell.x, overCell.y)) {
			// check if player needs to place a village
			// 1. find region
			const region = findRegion(overCell.x, overCell.y);
			if (region) {
				// 2. check if region is full
				const isFull = region.cells.every((cell) =>
					ageExploration.some(
						(exploration) =>
							cell.x === exploration.x && cell.y === exploration.y
					)
				);
				if (isFull) {
					// 3. check if region already contains a village
					const hasVillage = region.cells.some((cell) => {
						const cellIndex = ageExploration.findIndex(
							(exploration) =>
								cell.x === exploration.x && cell.y === exploration.y
						);
						if (
							cellIndex >= 0 &&
							ageExploration[cellIndex].type === CARD.VILLAGE
						) {
							return true;
						}
						return false;
					});
					if (!hasVillage) {
						// 4. change state
						playState = VILLAGE_STATE;
						validateButton.enabled = false;
						villageRegion = region;
					}
				}
			}
		}
	} else if (playState === VILLAGE_STATE && overCell) {
		// add new village
		cubes.push({
			type: CARD.VILLAGE,
			position: { x: overCell.x, y: overCell.y },
		});
		playState = CUBE_STATE;
		// check if all cubes have been put on board
		if (cubes.every((cube) => cube.position.x !== 0)) {
			validateButton.enabled = true;
		}
	}
	if (playState === SPECIALIZED_STATE && overSpecialization !== -1) {
		// 1. put specialized card in the current Age
		specialityCards.push(specialityArray[overSpecialization]);
		// 2. remove the 2 cards from the list of specialized cards
		specialityArray.shift();
		specialityArray.shift();
		// 3. change state to CUBE_STATE
		playState = CUBE_STATE;
		// 4. add cube to play
		prepareCube2Play(specialityCards[specialityCards.length - 1]);
		addValidateButton();
	}
	if (playState === SPECIALIZED_CARD_STATE && overSpecializedCard !== -1) {
		// play specialized card
		playState = CUBE_STATE;
		prepareCube2Play(specialityCards[overSpecializedCard]);
		addValidateButton();
	}
	return false;
}

function keyPressed() {
	if (key === "D") {
		toggleDebug = !toggleDebug;
	}
	if (key === "t" && cubes.length > 0) {
		uiManager.addLogger(`Contrainte: ${constraint}`);
		cubes.forEach((cube) => {
			if (cube.position.x === 0) {
				uiManager.addLogger(`Cube: ${cube.type}`);
			}
		});
	}
}

const distance = (x1, y1, x2, y2) => {
	return sqrt(pow(x2 - x1, 2) + pow(y2 - y1, 2));
};

function isOverCell(X, Y) {
	return distance(X, Y, mouseX, mouseY) < 25;
}

function isOverExplorationCard() {
	if (playState !== EXPLORATION_STATE) {
		return false;
	}
	if (mouseX > 1150 && mouseY > 415 && mouseX < 1320 && mouseY < 674) {
		return true;
	}
	return false;
}

function isOverSpecializedChoice() {
	if (
		mouseX > 997 &&
		mouseY > 100 &&
		mouseX < 997 + 205 &&
		mouseY < 100 + 320
	) {
		return 0;
	}
	if (
		mouseX > 997 &&
		mouseY > 467 &&
		mouseX < 997 + 205 &&
		mouseY < 467 + 320
	) {
		return 1;
	}
	return -1;
}

function isOverSpecializedCard() {
	if (mouseX > 5 && mouseY > 95 && mouseX < 160 && mouseY < 333) {
		return 0;
	}
	if (mouseX > 5 && mouseY > 355 && mouseX < 160 && mouseY < 593) {
		return 1;
	}
	if (mouseX > 5 && mouseY > 615 && mouseX < 160 && mouseY < 849) {
		return 2;
	}
	return -1;
}

function isOverTreasure() {
	return mouseX > 1150 && mouseY > 820 && mouseX < 1400 && mouseY < 980;
}

function mouseMoved() {
	overExploration = isOverExplorationCard();
	overTreasure = isOverTreasure();
	overCell = null;
	overHelpButton = distance(1500, 40, mouseX, mouseY) < 25;
	if (playState === CUBE_STATE) {
		board.forEach((column, x) =>
			column.forEach((cell, y) => {
				if (
					cell.type &&
					isOverCell(cell.center.x + boardx, cell.center.y + boardy)
				) {
					overCell = { x: x, y: y };
					return;
				}
			})
		);
	}
	if (playState === VILLAGE_STATE && villageRegion) {
		villageRegion.cells.forEach((cell) => {
			const bcell = board[cell.x][cell.y];
			if (bcell.bonus) {
				// cannot place village on a bonus cell
				return;
			}
			if (isOverCell(bcell.center.x + boardx, bcell.center.y + boardy)) {
				overCell = { x: cell.x, y: cell.y };
				return;
			}
		});
	}
	overSpecialization = -1;
	if (playState === SPECIALIZED_STATE) {
		overSpecialization = isOverSpecializedChoice();
	}
	if (playState === SPECIALIZED_CARD_STATE) {
		overSpecializedCard = isOverSpecializedCard();
	}
}

function getRing(x, y) {
	const cells = [
		{ x: x, y: y - 1 },
		{ x: x, y: y + 1 },
	];
	if (x % 2 === 0) {
		cells.push({ x: x - 1, y: y - 1 });
		cells.push({ x: x - 1, y: y });
		cells.push({ x: x + 1, y: y - 1 });
		cells.push({ x: x + 1, y: y });
	} else {
		cells.push({ x: x - 1, y: y });
		cells.push({ x: x - 1, y: y + 1 });
		cells.push({ x: x + 1, y: y });
		cells.push({ x: x + 1, y: y + 1 });
	}
	return cells;
}

function computeRegions() {
	// create an 2D array of cells:
	// true if cell is still free and not associated to a region
	const freeCells = [];
	for (let i = 0; i < 20; i++) {
		const columns = [];
		for (let j = 0; j < 15; j++) {
			columns.push(true);
		}
		freeCells.push(columns);
	}
	const getRegion = (x, y, type) => {
		const cells = [{ x: x, y: y }];
		freeCells[x][y] = false;
		let curIndex = 0;
		while (curIndex < cells.length) {
			const ring = getRing(cells[curIndex].x, cells[curIndex].y);
			ring.forEach((cell) => {
				// check if cell is free
				if (!freeCells[cell.x][cell.y]) {
					return;
				}
				// check if cell has same type
				const bcell = board[cell.x][cell.y];
				if (bcell.type !== type) {
					return;
				}
				// add cell and mark it
				cells.push({ x: cell.x, y: cell.y });
				freeCells[cell.x][cell.y] = false;
			});
			curIndex += 1;
		}
		return cells;
	};
	for (let i = 0; i < 20; i++) {
		for (let j = 0; j < 15; j++) {
			const cell = board[i][j];
			if (
				cell.type === null ||
				[CARD.SEA, CARD.TOWER, CARD.CAPITAL].includes(cell.type)
			) {
				continue;
			}
			if (!freeCells[i][j]) {
				// cell already associated to a region
				continue;
			}
			// new region
			const region = { type: cell.type, cells: getRegion(i, j, cell.type) };
			regions.push(region);
		}
	}
}

function initBoard() {
	let dx = 179 - 46.5 * 2;
	let dy = 169 - 54 * 2;
	for (let i = 0; i < 20; i++) {
		const column = [];
		for (let j = 0; j < 15; j++) {
			column.push({
				center: { x: dx, y: dy + 54 * j + (i % 2) * 24 },
				type:
					i === 0 || i === 19 || j === 0 || j === 14 || j === 13
						? null
						: CARD.SEA,
			});
		}
		dx += 46.5;
		dy += 0.2;
		board.push(column);
	}
	board[3][1].bonus = { type: "piece", nb: 2 };
	board[3][2].bonus = { type: "piece", nb: 2 };
	board[1][7].bonus = { type: "piece", nb: 2 };
	board[1][8].bonus = { type: "piece", nb: 2 };
	board[3][7].bonus = { type: "piece", nb: 2 };
	board[5][10].bonus = { type: "piece", nb: 2 };
	board[9][1].bonus = { type: "piece", nb: 2 };
	board[10][1].bonus = { type: "piece", nb: 2 };
	board[15][1].bonus = { type: "piece", nb: 2 };
	board[18][2].bonus = { type: "piece", nb: 2 };
	board[9][12].bonus = { type: "piece", nb: 2 };
	board[13][12].bonus = { type: "piece", nb: 2 };
	board[16][10].bonus = { type: "piece", nb: 2 };
	board[17][10].bonus = { type: "piece", nb: 2 };
	board[2][9].bonus = { type: "piece", nb: 1 };
	board[3][10].bonus = { type: "piece", nb: 1 };
	board[4][11].bonus = { type: "piece", nb: 1 };
	board[6][3].bonus = { type: "piece", nb: 1 };
	board[6][6].bonus = { type: "piece", nb: 1 };
	board[8][7].bonus = { type: "piece", nb: 1 };
	board[9][7].bonus = { type: "piece", nb: 1 };
	board[11][5].bonus = { type: "piece", nb: 1 };
	board[11][7].bonus = { type: "piece", nb: 1 };
	board[12][10].bonus = { type: "piece", nb: 1 };
	board[12][12].bonus = { type: "piece", nb: 1 };
	board[13][10].bonus = { type: "piece", nb: 1 };
	board[14][2].bonus = { type: "piece", nb: 1 };
	board[15][2].bonus = { type: "piece", nb: 1 };
	board[15][8].bonus = { type: "piece", nb: 1 };
	board[16][5].bonus = { type: "piece", nb: 1 };
	board[16][8].bonus = { type: "piece", nb: 1 };
	board[16][11].bonus = { type: "piece", nb: 1 };
	board[18][3].bonus = { type: "piece", nb: 1 };
	board[18][6].bonus = { type: "piece", nb: 1 };
	board[18][7].bonus = { type: "piece", nb: 1 };
	board[18][10].bonus = { type: "piece", nb: 1 };
	board[5][1].bonus = { type: "tresor" };
	board[2][5].bonus = { type: "tresor" };
	board[6][4].bonus = { type: "tresor" };
	board[8][2].bonus = { type: "tresor" };
	board[6][9].bonus = { type: "tresor" };
	board[7][12].bonus = { type: "tresor" };
	board[15][7].bonus = { type: "tresor" };
	board[15][11].bonus = { type: "tresor" };
	board[14][3].bonus = { type: "tresor" };
	board[18][5].bonus = { type: "tresor" };
	board[5][3].bonus = { type: "comptoir", nb: 3 };
	board[1][6].bonus = { type: "comptoir", nb: 3 };
	board[8][4].bonus = { type: "comptoir", nb: 3 };
	board[12][2].bonus = { type: "comptoir", nb: 3 };
	board[12][5].bonus = { type: "comptoir", nb: 2 };
	board[5][11].bonus = { type: "comptoir", nb: 3 };
	board[17][2].bonus = { type: "comptoir", nb: 3 };
	board[17][7].bonus = { type: "comptoir", nb: 3 };
	board[9][8].bonus = { type: "comptoir", nb: 2 };
	board[11][12].bonus = { type: "comptoir", nb: 4 };
	board[1][1].type = null;
	board[1][2].type = null;
	board[1][3].type = null;
	board[1][4].type = null;
	board[1][5].type = null;
	board[2][1].type = null;
	board[4][1].type = null;
	board[6][1].type = null;
	board[8][1].type = null;
	board[12][1].type = null;
	board[14][1].type = null;
	board[16][1].type = null;
	board[18][1].type = null;
	board[1][10].type = null;
	board[1][11].type = null;
	board[1][12].type = null;
	board[2][11].type = null;
	board[2][12].type = null;
	board[3][12].type = null;
	board[4][12].type = null;
	board[5][12].type = null;
	board[6][12].type = null;
	board[15][12].type = null;
	board[16][12].type = null;
	board[17][11].type = null;
	board[17][12].type = null;
	board[18][11].type = null;
	board[18][12].type = null;
	board[2][2].type = CARD.TOWER;
	board[18][1].type = CARD.TOWER;
	board[3][11].type = CARD.TOWER;
	board[14][12].type = CARD.TOWER;
	board[9][6].type = CARD.CAPITAL;
	board[2][6].type = CARD.GRASSLAND;
	board[2][7].type = CARD.GRASSLAND;
	board[2][8].type = CARD.GRASSLAND;
	board[3][7].type = CARD.GRASSLAND;
	board[3][3].type = CARD.GRASSLAND;
	board[4][4].type = CARD.GRASSLAND;
	board[5][3].type = CARD.GRASSLAND;
	board[6][3].type = CARD.GRASSLAND;
	board[7][2].type = CARD.GRASSLAND;
	board[9][1].type = CARD.GRASSLAND;
	board[10][2].type = CARD.GRASSLAND;
	board[11][2].type = CARD.GRASSLAND;
	board[12][3].type = CARD.GRASSLAND;
	board[8][8].type = CARD.GRASSLAND;
	board[9][7].type = CARD.GRASSLAND;
	board[10][8].type = CARD.GRASSLAND;
	board[2][10].type = CARD.GRASSLAND;
	board[3][10].type = CARD.GRASSLAND;
	board[4][11].type = CARD.GRASSLAND;
	board[5][11].type = CARD.GRASSLAND;
	board[6][11].type = CARD.GRASSLAND;
	board[12][5].type = CARD.GRASSLAND;
	board[12][6].type = CARD.GRASSLAND;
	board[12][7].type = CARD.GRASSLAND;
	board[13][5].type = CARD.GRASSLAND;
	board[17][1].type = CARD.GRASSLAND;
	board[18][2].type = CARD.GRASSLAND;
	board[18][3].type = CARD.GRASSLAND;
	board[18][4].type = CARD.GRASSLAND;
	board[16][9].type = CARD.GRASSLAND;
	board[17][6].type = CARD.GRASSLAND;
	board[17][7].type = CARD.GRASSLAND;
	board[17][8].type = CARD.GRASSLAND;
	board[18][7].type = CARD.GRASSLAND;
	board[18][8].type = CARD.GRASSLAND;
	board[11][10].type = CARD.GRASSLAND;
	board[12][10].type = CARD.GRASSLAND;
	board[12][11].type = CARD.GRASSLAND;
	board[13][9].type = CARD.GRASSLAND;
	board[13][10].type = CARD.GRASSLAND;
	board[14][10].type = CARD.GRASSLAND;
	board[9][11].type = CARD.SAND;
	board[9][12].type = CARD.SAND;
	board[10][12].type = CARD.SAND;
	board[10][13].type = CARD.SAND;
	board[10][5].type = CARD.SAND;
	board[10][6].type = CARD.SAND;
	board[11][5].type = CARD.SAND;
	board[15][5].type = CARD.SAND;
	board[16][5].type = CARD.SAND;
	board[16][6].type = CARD.SAND;
	board[17][5].type = CARD.SAND;
	board[18][6].type = CARD.SAND;
	board[15][9].type = CARD.SAND;
	board[15][10].type = CARD.SAND;
	board[16][10].type = CARD.SAND;
	board[17][9].type = CARD.SAND;
	board[8][10].type = CARD.SAND;
	board[9][8].type = CARD.SAND;
	board[9][9].type = CARD.SAND;
	board[7][4].type = CARD.SAND;
	board[8][4].type = CARD.SAND;
	board[9][3].type = CARD.SAND;
	board[2][9].type = CARD.SAND;
	board[3][8].type = CARD.SAND;
	board[3][9].type = CARD.SAND;
	board[4][8].type = CARD.SAND;
	board[5][7].type = CARD.SAND;
	board[11][7].type = CARD.SAND;
	board[11][8].type = CARD.SAND;
	board[12][8].type = CARD.SAND;
	board[10][1].type = CARD.SAND;
	board[11][1].type = CARD.SAND;
	board[12][2].type = CARD.SAND;
	board[13][1].type = CARD.SAND;
	board[13][2].type = CARD.SAND;
	board[15][3].type = CARD.SAND;
	board[16][3].type = CARD.SAND;
	board[17][2].type = CARD.SAND;
	board[7][4].type = CARD.SAND;
	board[1][6].type = CARD.MOUNTAIN;
	board[1][7].type = CARD.MOUNTAIN;
	board[1][8].type = CARD.MOUNTAIN;
	board[1][9].type = CARD.MOUNTAIN;
	board[3][1].type = CARD.MOUNTAIN;
	board[3][2].type = CARD.MOUNTAIN;
	board[4][2].type = CARD.MOUNTAIN;
	board[4][3].type = CARD.MOUNTAIN;
	board[5][2].type = CARD.MOUNTAIN;
	board[4][10].type = CARD.MOUNTAIN;
	board[5][9].type = CARD.MOUNTAIN;
	board[5][10].type = CARD.MOUNTAIN;
	board[6][5].type = CARD.MOUNTAIN;
	board[6][6].type = CARD.MOUNTAIN;
	board[7][7].type = CARD.MOUNTAIN;
	board[7][8].type = CARD.MOUNTAIN;
	board[8][7].type = CARD.MOUNTAIN;
	board[10][7].type = CARD.MOUNTAIN;
	board[11][6].type = CARD.MOUNTAIN;
	board[11][11].type = CARD.MOUNTAIN;
	board[11][12].type = CARD.MOUNTAIN;
	board[12][12].type = CARD.MOUNTAIN;
	board[13][12].type = CARD.MOUNTAIN;
	board[13][6].type = CARD.MOUNTAIN;
	board[13][7].type = CARD.MOUNTAIN;
	board[14][2].type = CARD.MOUNTAIN;
	board[15][1].type = CARD.MOUNTAIN;
	board[15][2].type = CARD.MOUNTAIN;
	board[16][2].type = CARD.MOUNTAIN;
	board[14][9].type = CARD.MOUNTAIN;
	board[15][8].type = CARD.MOUNTAIN;
	board[16][7].type = CARD.MOUNTAIN;
	board[16][8].type = CARD.MOUNTAIN;
	board[16][11].type = CARD.MOUNTAIN;
	board[17][10].type = CARD.MOUNTAIN;
	board[18][10].type = CARD.MOUNTAIN;
	board[18][9].type = CARD.MOUNTAIN;
}
