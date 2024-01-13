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
const TRADE_STATE = "comptoir commercial";
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

let map = "avenia";
let goals_cards = "avenia_goals";

const CONSTRAINT = {
	FREE: "none",
	CONSECUTIVE: "consecutive",
	ALIGNED: "aligned",
	CENTERED: "centered",
};

let overCell = null;
let overTrade = null;
let overExploration = false;
let overTreasure = false;
let overHelpButton = false;
let overSpecialization = -1; // 0 or 1
let overSpecializedCard = -1; // 0, 1 or 2
let age = 1; // 1 to 4
let PV = 0;
let PVTreasure = 0;
let villageRegion = null;

let goals = [0, 0, 0, 0, 0, 0];
let blockGoalIndex = -1;

let pieceBonus = 1;
let tresorBonus = 1;

const towerPV = [6, 8, 10, 14];

let cubes = [];
let constraint = CONSTRAINT.FREE;

function getRandomName() {
	const firstNames = [
		"Marco",
		"Christopher",
		"Amerigo",
		"John",
		"Ferdinand",
		"Hernan",
		"Francis",
		"Walter",
		"James",
		"Francisco",
		"Vasco",
		"Giovanni",
		"Bartolomeu",
	];
	const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
	const lastNames = [
		"Polo",
		"Columbus",
		"Vespucci",
		"Cabot",
		"Magellan",
		"Cortes",
		"Drake",
		"Raleigh",
		"Cook",
		"Pizarro",
		"Gama",
		"Verrazzano",
		"Dias",
	];
	const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
	if (Math.random() < 0.3) {
		return `Sir ${firstName} ${lastName}`;
	}
	if (Math.random() > 0.8) {
		return `${firstName} da ${lastName}`;
	}
	return `${firstName} ${lastName}`;
}

const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
let seed = urlParams.get("seed");
if (!seed) {
	seed = getRandomName().replaceAll(" ", "_");
	console.log("seed:", seed);
}

function preload() {
	spritesheet.addSpriteSheet("cover", "./cover.png", 686, 503);
	spritesheet.addSpriteSheet("avenia", "./avenia.png", 1680, 1405);
	spritesheet.addSpriteSheet("aghon", "./aghon.png", 1680, 1405);
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
	spritesheet.addSpriteSheet("avenia_goals", "./avenia_goals.png", 520, 370);
	spritesheet.addSpriteSheet("aghon_goals", "./aghon_goals.png", 520, 370);
	spritesheet.addSpriteSheet("kazan_goals", "./kazan_goals.png", 520, 370);
	//spritesheet.addSpriteSheet("goals", "./goals.png", 520, 370);
	spritesheet.addSpriteSheet("coffre_pion", "./coffre_pion.png", 80, 90);
	spritesheet.addSpriteSheet("PV", "./PV.png", 136, 141);
	spritesheet.addSpriteSheet("solo_rules", "./solo_rules.png", 550, 700);
	spritesheet.addSpriteSheet("solo_pions", "./solo_pions.png", 72, 72);
	spritesheet.addSpriteSheet("scores", "./scores.png", 126, 80);
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

function getUrl(base = false) {
	if (base) {
		const url = document.location.toString();
		const lastIndex = url.lastIndexOf("/");
		if (lastIndex > 0) {
			return url.substring(0, lastIndex);
		}
	}
	if (
		document.location.toString().includes("seed=") &&
		document.location.toString().includes("map=")
	) {
		return `${document.location.toString()}`;
	}
	if (document.location.toString().includes("seed=")) {
		return `${document.location.toString()}&map=${map}`;
	}
	if (document.location.toString().includes("map=")) {
		return `${document.location.toString()}&seed=${seed}`;
	}
	if (document.location.toString().includes("index.html")) {
		return `${document.location.toString()}?map=${map}&seed=${seed}`;
	}
	return `${document.location.toString()}index.html?map=${map}&seed=${seed}`;
}

function initMap(mapName) {
	map = mapName;
	goals_cards = `${mapName}_goals`;
	randomizer = new Randomizer(seed);

	goalArray = [0, 1, 2, 3, 4, 5];
	randomizer.shuffleArray(goalArray);
	goalArray = goalArray.splice(-3); // remove 3 last goals

	ageCards = [0, 1, 2, 3, 4, 5];
	randomizer.shuffleArray(ageCards);
	ageCards.unshift(9);

	specialityArray = [
		1, 2, 3, 4, 5, 13, 14, 15, 18, 19, 20, 21, 23, 24, 25, 26, 27,
	];
	// [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28];
	randomizer.shuffleArray(specialityArray);

	tresorArray = [
		0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2,
		2, 3, 3, 5, 5, 6, 6, 7, 7, 8, 8, 8, 8, 8, 8,
	];
	randomizer.shuffleArray(tresorArray);
}

function startAveniaClicked() {
	initMap("avenia");
	document.location.href = getUrl();
}

function startAghonClicked() {
	initMap("aghon");
	document.location.href = getUrl();
}

function startCnidariaClicked() {
	initMap("cnidaria");
	document.location.href = getUrl();
}

function startKazanClicked() {
	initMap("kazan");
	document.location.href = getUrl();
}

function startClicked() {
	initBoard(map);
	computeRegions();
	cubes = [];
	initGoalsAndTreasures();

	curState = GAME_PLAY_STATE;
	uiManager.setUI([speakerButton, musicButton, helpButton]);
	uiManager.addLogger("A vous de jouer!");
	soundManager.playSound("new_age");
}

function setPieceBonus(bonus) {
	pieceBonus = bonus;
}

function setTresorBonus(bonus) {
	tresorBonus = bonus;
}

const sameCells = (c1, c2) => {
	return c1.x === c2.x && c1.y === c2.y;
};

const findExplorationCell = (cell) => {
	const index = ageExploration.findIndex((explo) => sameCells(explo, cell));
	return ageExploration[index];
};

function checkCubes(curCubes) {
	const isCellInExploration = (rcell) => {
		return ageExploration.some((exploration) => sameCells(exploration, rcell));
	};
	let isolatedCube = false;
	curCubes.forEach((cube) => {
		const getRegion = (cell) => {
			const exploration = findExplorationCell(cell);
			const allCells = [{ x: exploration.x, y: exploration.y, type: "cube" }];
			let allCellsIndex = 0;
			const isCellInPath = (rcell) => {
				return allCells.some((pcell) => sameCells(pcell, rcell));
			};
			while (allCellsIndex < allCells.length) {
				const cell = allCells[allCellsIndex];
				const ring = getRing(cell.x, cell.y);
				ring.forEach((rcell) => {
					if (isCellInExploration(rcell) && !isCellInPath(rcell)) {
						const curExploration = findExplorationCell(rcell);
						allCells.push({
							x: rcell.x,
							y: rcell.y,
							type: curExploration.type,
						});
					}
				});
				allCellsIndex++;
			}
			return allCells;
		};
		if (cube.type === CARD.VILLAGE) {
			return;
		}
		const region = getRegion({ x: cube.x, y: cube.y });
		if (
			!region.some(
				(reg) => reg.type === CARD.CAPITAL || reg.type === CARD.VILLAGE
			)
		) {
			isolatedCube = true;
		}
	});
	if (isolatedCube) {
		return "Un cube est isolé";
	}
	if (constraint === CONSTRAINT.FREE) {
		return "ok";
	} else if (constraint === CONSTRAINT.CONSECUTIVE) {
		if (
			checkConsecutiveCubes(
				curCubes.filter((cube) => cube.type !== CARD.VILLAGE)
			)
		) {
			return "ok";
		} else {
			return "Le chemin est interrompu";
		}
	} else if (constraint === CONSTRAINT.ALIGNED) {
		if (
			checkAlignedCubes(curCubes.filter((cube) => cube.type !== CARD.VILLAGE))
		) {
			return "ok";
		} else {
			return "Des cubes ne sont pas bien alignés";
		}
	} else if (constraint === CONSTRAINT.CENTERED) {
		if (
			checkCenteredCubes(curCubes.filter((cube) => cube.type !== CARD.VILLAGE))
		) {
			return "ok";
		} else {
			return "Des cubes ne sont pas adjacents";
		}
	}
	return "ok";
}

function nextCell(cell, direction) {
	let next = null;
	if (direction === "NE") {
		if (cell.x % 2 === 0) {
			next = { x: cell.x + 1, y: cell.y - 1 };
		} else {
			next = { x: cell.x + 1, y: cell.y };
		}
	} else {
		// direction  === SE
		if (cell.x % 2 === 0) {
			next = { x: cell.x + 1, y: cell.y };
		} else {
			next = { x: cell.x + 1, y: cell.y + 1 };
		}
	}
	next.type = board[next.x][next.y].type;
	return next;
}

function getAllCells(direction, firstCell, lastCell) {
	const cells = [firstCell];
	let curCell = nextCell(cells[cells.length - 1], direction);
	while (
		curCell.type !== null &&
		(curCell.x !== lastCell.x || curCell.y !== lastCell.y)
	) {
		cells.push(curCell);
		curCell = nextCell(cells[cells.length - 1], direction);
	}
	if (curCell.type !== null) {
		cells.push(lastCell);
	}
	return cells;
}

function checkCenteredCubes(centeredCubes) {
	const firstCell = centeredCubes.shift();
	const cells = getRing(firstCell.x, firstCell.y);
	return centeredCubes.every(
		(cube) => cells.findIndex((cell) => sameCells(cell, cube)) >= 0
	);
}

function checkConsecutiveCubes(consecutiveCubes) {
	const path = [consecutiveCubes[0]];
	const isCellInPath = (rcell) => {
		return path.some((pcell) => sameCells(pcell, rcell));
	};
	const isCellInCubes = (rcell) => {
		return consecutiveCubes.some((pcell) => sameCells(pcell, rcell));
	};
	let pathIndex = 0;
	while (pathIndex < path.length) {
		const cell = path[pathIndex];
		const ring = getRing(cell.x, cell.y);
		ring.forEach((rcell) => {
			if (isCellInCubes(rcell) && !isCellInPath(rcell)) {
				path.push({ x: rcell.x, y: rcell.y });
			}
		});
		pathIndex++;
	}
	return path.length === consecutiveCubes.length;
}

function checkAlignedCubes(alignedCubes) {
	let lowerCell = alignedCubes[0];
	alignedCubes.forEach((cube) => {
		if (cube.x < lowerCell.x) {
			lowerCell = cube;
		} else if (cube.x === lowerCell.x && cube.y < lowerCell.y) {
			lowerCell = cube;
		}
	});
	let upperCell = alignedCubes[0];
	alignedCubes.forEach((cube) => {
		if (cube.x > upperCell.x) {
			upperCell = cube;
		} else if (cube.x === upperCell.x && cube.y > upperCell.y) {
			upperCell = cube;
		}
	});
	// case 1: aligned vertically
	if (lowerCell.x === upperCell.x) {
		for (let y = lowerCell.y; y <= upperCell.y; y++) {
			if (
				alignedCubes.findIndex(
					(cube) => cube.x === lowerCell.x && cube.y === y
				) < 0
			) {
				return false;
			}
		}
		return alignedCubes.every((cube) => cube.x === lowerCell.x);
	}
	// case 2: aligned North-East
	if (
		lowerCell.y > upperCell.y ||
		(lowerCell.y === upperCell.y &&
			lowerCell.x % 2 === 1 &&
			lowerCell.x < upperCell.x)
	) {
		const cells = getAllCells("NE", lowerCell, upperCell);
		if (cells.length !== alignedCubes.length) {
			return false;
		}
		return alignedCubes.every(
			(cube) => cells.findIndex((cell) => sameCells(cell, cube)) >= 0
		);
	}
	// case 3: aligned South-East
	if (
		lowerCell.y < upperCell.y ||
		(lowerCell.y === upperCell.y &&
			lowerCell.x % 2 === 0 &&
			lowerCell.x < upperCell.x)
	) {
		const cells = getAllCells("SE", lowerCell, upperCell);
		if (cells.length !== alignedCubes.length) {
			return false;
		}
		return alignedCubes.every(
			(cube) => cells.findIndex((cell) => sameCells(cell, cube)) >= 0
		);
	}
	// strange case...
	return false;
}

function validateClicked(force = false) {
	const curCubes = force
		? cubes.filter((cube) => cube.x !== 0 || cube.y !== 0)
		: cubes;
	const condition = checkCubes(curCubes);
	if (condition !== "ok") {
		uiManager.addLogger(condition);
		return;
	}
	let treasureCubes = 0;
	curCubes.forEach((cube) => {
		if (cube.type === CARD.VILLAGE) {
			transformCubeToVillage(cube.x, cube.y);
			uiManager.addLogger(`village: + ${age} PV`);
			PV += age;
		}
		const cell = board[cube.x][cube.y];
		if (cell.type === CARD.TOWER) {
			uiManager.addLogger(`tower: + ${towerPV[0]} PV`);
			PV += towerPV.shift();
		}
		if (!cell.bonus) {
			return;
		}
		if (cell.bonus.type === "piece") {
			uiManager.addLogger(`piece: + ${cell.bonus.nb * pieceBonus} PV`);
			PV += cell.bonus.nb * pieceBonus;
		}
		if (cell.bonus.type === "tresor") {
			// check if cube is a known ruin
			// otherwise, pick a treasure card
			if (!ruins.some((rcell) => sameCells(rcell, cube))) {
				// piocher un tresor
				for (let t = 0; t < tresorBonus; t++) {
					const treasureIndex = tresorArray.shift();
					tresors.push(treasureIndex);
					if (treasureIndex === 0) {
						treasureCubes += 1;
					}
				}
				ruins.push({ x: cube.x, y: cube.y });
			}
		}
	});
	setTresorBonus(1);
	setPieceBonus(1);
	// nettoyer cubes et constraint
	cubes = [];
	constraint = CONSTRAINT.FREE;
	// passer à la carte exploration suivante
	validateButton.enabled = false;
	validateForceButton.enabled = true;
	if (treasureCubes === 0) {
		playState = EXPLORATION_STATE;
		uiManager.setUI([speakerButton, musicButton, helpButton]);
	} else {
		if (treasureCubes === 1) {
			uiManager.addLogger("Vous avez un cube trésors à placer");
		} else {
			uiManager.addLogger("Vous avez des cubes trésors à placer");
		}
		for (let i = 0; i < treasureCubes; i++) {
			cubes.push({ type: "joker", x: 0, y: 0 });
		}
		soundManager.playSound("new_cube");
		return;
	}
	// tester les comptoirs
	connectedTrades = getConnectedTrades();
	if (connectedTrades.length >= 1) {
		playState = TRADE_STATE;
	}
	checkGoals();
	// compter les points de tresors
	countPVTreasure();

	soundManager.playSound("validate");

	if (playState === EXPLORATION_STATE) {
		newExplorationCard();
	}
}

/**
 * Checks if at least two trades are connected
 * @returns list of connected trades
 */
function getConnectedTrades() {
	const allTrades = [];
	const isKnownTrade = (cell) => {
		return knownTrades.findIndex((t) => sameCells(t, cell)) >= 0;
	};
	const isTrade = (cell) => {
		const bcell = board[cell.x][cell.y];
		return bcell.bonus && bcell.bonus.type === "trade";
	};
	const trades = ageExploration.filter((cell) => {
		if (isKnownTrade(cell)) {
			// this trade has already been used
			return false;
		}
		if (isTrade(cell)) {
			return true;
		}
		return false;
	});
	if (trades.length < 2) {
		return [];
	}
	const isCellInExploration = (rcell) => {
		return ageExploration.some((exploration) => sameCells(exploration, rcell));
	};
	// check if trades[0] is connected to trades[1]
	trades.forEach((curTrade) => {
		const path = [{ x: curTrade.x, y: curTrade.y }];
		const isCellInPath = (rcell) => {
			return path.some((pcell) => sameCells(pcell, rcell));
		};
		let pathIndex = 0;
		while (pathIndex < path.length) {
			const cell = path[pathIndex];
			const ring = getRing(cell.x, cell.y);
			ring.forEach((rcell) => {
				if (isCellInExploration(rcell) && !isCellInPath(rcell)) {
					path.push({ x: rcell.x, y: rcell.y });
					if (isTrade(rcell) && !isKnownTrade(rcell)) {
						pathIndex = 1000;
					}
				}
			});
			pathIndex++;
		}
		trades.forEach((otherTrade) => {
			if (sameCells(curTrade, otherTrade)) {
				// Same trade
				return;
			}
			if (path.length > 1 && path.some((cell) => sameCells(cell, otherTrade))) {
				allTrades.push([curTrade, otherTrade]);
			}
		});
	});
	return allTrades;
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
const helpButton = new BFloatingSwitchButton(
	windowWidth - 70 - 20 - 140,
	70,
	"\u003F",
	() => {
		// ruleButton.checked = !ruleButton.checked;
	}
);
helpButton.previewCheck = false;

function resetSeed() {
	seed = getRandomName().replaceAll(" ", "_");
}
function newGame() {
	document.location.href = getUrl(true);
}
const newGameButton = new BButton(640, 300, "Nouvelle Partie", newGame);
newGameButton.w = 450;
const resetSeedButton = new BButton(1400, 300, "Reset", resetSeed);
const aveniaButton = new BButton(
	140,
	windowHeight - 120,
	"AVENIA",
	startAveniaClicked
);

const aghonButton = new BButton(
	1070,
	windowHeight - 120,
	"AGHON",
	startAghonClicked
);

const cnidariaButton = new BButton(
	140,
	windowHeight - 30,
	"CNIDARIA",
	startCnidariaClicked
);

const kazanButton = new BButton(
	1070,
	windowHeight - 30,
	"KAZAN",
	startKazanClicked
);

const validateButton = new BButton(1147, 677, "Valider", validateClicked);
validateButton.setTextSize(30);
validateButton.w = 180;
const undoButton = new BButton(530, 80, "Annuler", undoClicked);
const validateForceButton = new BButton(805, 980, "Fin de Tour", () => {
	validateClicked(true);
});
validateForceButton.setTextSize(30);
validateForceButton.w = 180;

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

let randomizer = null;

let board = [];

let goalArray = [0, 1, 2, 3, 4, 5];

let ageCards = [0, 1, 2, 3, 4, 5];

let specialityArray = [
	1, 2, 3, 4, 5, 13, 14, 15, 18, 19, 20, 21, 23, 24, 25, 26, 27,
];
// [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28];

let tresorArray = [
	0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2,
	3, 3, 5, 5, 6, 6, 7, 7, 8, 8, 8, 8, 8, 8,
];

let tresors = [];

let regions = [];

let ruins = [];

let knownTrades = [];

let connectedTrades = [];

const specialityCards = []; // 3 cards

let ageExploration = [];

let exploredCards = [6, 7, 8];

function removeCubes() {
	ageExploration = ageExploration.filter((cell) => cell.type !== "cube");
}

function undoCube(cubeIndex) {
	const x = cubes[cubeIndex].x;
	const y = cubes[cubeIndex].y;
	cubes[cubeIndex].x = 0;
	cubes[cubeIndex].y = 0;
	ageExploration = ageExploration.filter(
		(cell) => cell.x !== x || cell.y !== y
	);
	validateButton.enabled = false;
	validateForceButton.enabled = true;
}

function checkType(cell, types, withTower = false) {
	if (types[0] === CARD.JOKER) {
		return true;
	}
	if (withTower && cell.type === CARD.TOWER) {
		return true;
	}
	return types.includes(cell.type);
}

function addCube(x, y) {
	// check if cube not already added
	if (
		ageExploration.findIndex((cell) => sameCells(cell, { x: x, y: y })) >= 0
	) {
		return false;
	}
	const cell = board[x][y];
	// TODO: constraint
	// if aligned/centered and first cube, should explore type of first playable cube
	if (
		cubes.filter((c) => c.x !== 0 && c.y !== 0).length === 0 &&
		[CONSTRAINT.CENTERED, CONSTRAINT.ALIGNED].includes(constraint)
	) {
		// first cube
		if (!checkType(cell, cubes[0].type.split("|"))) {
			return false;
		}
		// check that first cube is next to an existing cube
		const ring = getRing(x, y);
		if (
			!ring.some(
				(r) => ageExploration.findIndex((explo) => sameCells(explo, r)) >= 0
			)
		) {
			return false;
		}
	}
	const cubeIndex = cubes.findIndex(
		(c) => checkType(cell, c.type.split("|"), true) && c.x === 0
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
	cubes[cubeIndex].x = x;
	cubes[cubeIndex].y = y;
	// check if all cubes have been put on board
	if (cubes.every((cube) => cube.x !== 0)) {
		validateButton.enabled = true;
		validateForceButton.enabled = false;
	}
	return true;
}

function transformCubeToVillage(x, y) {
	const index = ageExploration.findIndex((cell) =>
		sameCells(cell, { x: x, y: y })
	);
	if (index >= 0) {
		ageExploration[index].type = CARD.VILLAGE;
	}
}

function initUI() {
	speakerButton.setTextSize(50);
	musicButton.setTextSize(50);
	helpButton.setTextSize(50);
	musicButton.enabled = false;
	musicButton.checked = false;
	helpButton.checked = false;
	const isSpeakerOn = localStorage.getItem(speakerStorageKey);
	if (isSpeakerOn === "off") {
		speakerButton.checked = false;
		soundManager.mute(true);
	}
	aghonButton.enabled = false;
	cnidariaButton.enabled = false;
	kazanButton.enabled = false;
	resetSeedButton.setTextSize(35);
	resetSeedButton.w = 200;
	const menu = [
		speakerButton,
		resetSeedButton,
		aveniaButton,
		cnidariaButton,
		kazanButton,
		aghonButton,
		musicButton,
		helpButton,
	];
	uiManager.setUI(menu);
}

function setup() {
	initUI();
	canvas = createCanvas(windowWidth, windowHeight);
	canvas.parent("canvas");

	soundManager.addSound("take_card", "./take_card.mp3", 1);
	soundManager.addSound("place_cube", "./place_cube.wav", 1);
	soundManager.addSound("validate", "./validate.wav", 1);
	soundManager.addSound("new_cube", "./new_cube.wav", 1);
	soundManager.addSound("new_age", "./new_age.wav", 0.25);

	frameRate(10);

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

function drawTrade(x, y) {
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
	rect(1520 + 100 * column, 530 + 190 * row, 20, 20);
}

function drawGoalPion(column, row) {
	if (row === 0 && column === 0) {
		spritesheet.drawScaledSprite("solo_pions", 0, 1500, 510, 1);
	} else if (row === 0 && column === 1) {
		spritesheet.drawScaledSprite("solo_pions", 1, 1605, 510, 1);
	} else if (row === 1 && column === 0) {
		spritesheet.drawScaledSprite("solo_pions", 2, 1500, 700, 1);
	} else if (row === 1 && column === 1) {
		spritesheet.drawScaledSprite("solo_pions", 3, 1605, 700, 1);
	} else if (row === 2 && column === 0) {
		spritesheet.drawScaledSprite("solo_pions", 4, 1500, 890, 1);
	}
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
	fill(240, 230, 180);
	if (alternative) {
		fill(250, 150, 150);
	}
	const cell = board[x][y];
	rect(cell.center.x + boardx - 10, cell.center.y + boardy - 25, 20, 50);
}

function drawAgeExploration() {
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
		const bcell = board[cube.x][cube.y];
		if (cube.type === CARD.VILLAGE) {
			drawVillage(cube.x, cube.y, true);
		} else {
			drawCube(cube.x, cube.y, true);
		}
		if (bcell.type === CARD.TOWER) {
			drawTower(cube.x, cube.y, true);
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

function drawGoals() {
	if (blockGoalIndex >= 0) {
		drawGoalPion(0, 0);
	}
	if (blockGoalIndex >= 1) {
		drawGoalPion(1, 0);
		drawGoalPion(0, 1);
	}
	if (blockGoalIndex >= 2) {
		drawGoalPion(1, 1);
		drawGoalPion(0, 2);
	}

	goalArray.forEach((goal, index) => {
		if (goals[goal] === 0) {
			return;
		} else if (goals[goal] === 10) {
			drawGoalCube(0, index);
		} else if (goals[goal] === 5) {
			drawGoalCube(1, index);
		} else if (goals[goal] === 1) {
			drawGoalCube(1.2, index - 0.5);
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
	const result = doReachGoal(index);
	if (result) {
		uiManager.addLogger(`goal: + ${result} PV`);
	}
}

function doReachGoal(index) {
	// add point accordingly
	if (goals[index] === 0) {
		// check with solo mode
		goals[index] = 10;
		return 10;
	} else if (goals[index] === -10) {
		goals[index] = 5;
		return 5;
	} else if (goals[index] === -5) {
		goals[index] = 1;
	}
	return 0;
}

function blockGoal() {
	if (age === 2) {
		const index = goalArray[0];
		// block first goal
		if (goals[index] === 0) {
			goals[index] = -10;
		}
		blockGoalIndex = 0;
	}
	if (age === 3) {
		let index = goalArray[0];
		if (goals[index] === -10) {
			goals[index] = -5;
		}
		index = goalArray[1];
		if (goals[index] === 0) {
			goals[index] = -10;
		}
		blockGoalIndex = 1;
	}
	if (age === 4) {
		let index = goalArray[1];
		if (goals[index] === -10) {
			goals[index] = -5;
		}
		index = goalArray[2];
		if (goals[index] === 0) {
			goals[index] = -10;
		}
		blockGoalIndex = 2;
	}
}

function getBorderRuins() {
	return ruins.filter((ruin) => {
		const ring = getRing(ruin.x, ruin.y);
		const border = ring.some((cell) => {
			const bcell = board[cell.x][cell.y];
			return !bcell.type;
		});
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
	// placez 2 comptoirs sur des villes 3+
	let trades3 = 0;
	knownTrades.forEach((cell) => {
		const bcell = board[cell.x][cell.y];
		if (bcell.bonus.nb >= 3) {
			trades3 += 1;
		}
	});
	if (trades3 >= 2) {
		reachGoal(2);
	}
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
	spritesheet.drawScaledSprite(map, 0, boardx, boardy, 0.65);
	spritesheet.drawScaledSprite("exploration", 0, 1150, boardy, 0.65);
	if (toggleDebug) {
		debugDrawBoard();
	} else {
		// ruines
		ruins.forEach((ruin) => drawCoffre(ruin.x, ruin.y));
		// comptoir commercial
		knownTrades.forEach((trade) => drawTrade(trade.x, trade.y));
		drawAgeExploration();
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
		rect(1150, 415, 1320 - 1150, 676 - 415, 15);
		if (overExploration) {
			stroke(25);
			rect(1150, 415, 1320 - 1150, 676 - 415, 15);
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

	if (playState === TRADE_STATE) {
		connectedTrades.forEach((trades) => {
			trades.forEach((trade) => {
				const cell = board[trade.x][trade.y];
				noFill();
				strokeWeight(4);
				stroke(250, 100, 100);
				ellipse(cell.center.x + boardx, cell.center.y + boardy, 40);
			});
		});
		if (overTrade) {
			const cell = board[overTrade.x][overTrade.y];
			noFill();
			strokeWeight(4);
			stroke(250);
			ellipse(cell.center.x + boardx, cell.center.y + boardy, 45);
		}
	}

	// goals
	spritesheet.drawScaledSprite(goals_cards, goalArray[0], 1435, 440 - 25, 0.5);
	spritesheet.drawScaledSprite(goals_cards, goalArray[1], 1435, 630 - 25, 0.5);
	spritesheet.drawScaledSprite(goals_cards, goalArray[2], 1435, 820 - 25, 0.5);
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
	if (age <= 4) {
		if (playState === EXPLORATION_STATE) {
			text("Cliquez sur la carte d'exploration (bord rouge)", 200, 980);
		} else if (playState === CUBE_STATE) {
			text("Posez des cubes", 200, 980);
		} else if (playState === VILLAGE_STATE) {
			text("Placez un village dans la région", 200, 980);
		} else if (playState === SPECIALIZED_STATE) {
			text("Choisissez une carte spécialité", 200, 980);
		} else if (playState === TRADE_STATE) {
			text(
				"Cliquez sur une ville pour la transformer en comptoir commercial",
				200,
				980
			);
		}
	}
	if (age < 5) {
		text(`Age ${age}`, 10, 980);
	} else {
		text(
			`Fin du jeu: ${PV + PVTreasure} PV et ${
				goals.filter((g) => g > 0).length
			} objectifs sur 3`,
			10,
			980
		);
		drawScore();
	}

	if (overHelpButton) {
		spritesheet.drawSprite("solo_rules", 0, (windowWidth - 550) / 2, 50);
	}
}

function drawScore() {
	const score = goals.filter((g) => g > 0).length < 3 ? 0 : PV + PVTreasure;
	noFill();
	strokeWeight(5);
	stroke(50, 205, 50);
	if (score < 90) {
		stroke(205, 50, 50);
	}
	spritesheet.drawSprite("scores", 0, 786, 80);
	rect(786, 80, 126, 80, 5);
	if (score < 120) {
		stroke(205, 50, 50);
	}
	spritesheet.drawSprite("scores", 1, 786, 380);
	rect(786, 380, 126, 80, 5);
	if (score < 150) {
		stroke(205, 50, 50);
	}
	spritesheet.drawSprite("scores", 2, 786, 680);
	rect(786, 680, 126, 80, 5);
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

		if (
			document.location.toString().includes("seed=") &&
			document.location.toString().includes("map=")
		) {
			console.log(document.location.toString());
			console.log("seed:", seed);
			map = urlParams.get("map");
			initMap(map);
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
			(windowWidth - 686 * 1.5) / 2,
			50,
			1.5
		);
		noStroke();
		fill(250);
		textSize(15);
		text(seed.replaceAll("_", " "), 1400, 350);
		if (overHelpButton) {
			spritesheet.drawSprite("solo_rules", 0, (windowWidth - 550) / 2, 50);
		}
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
		cubes.push({ type: type, x: 0, y: 0 });
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
			soundManager.playSound("new_age");
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
			// end of game - add points from treasure !
			uiManager.setUI([speakerButton, musicButton, helpButton, newGameButton]);
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
			setConstraint(CONSTRAINT.FREE);
		} else if (ageCards[0] === 1) {
			// add 2 sand
			addCube2Play(CARD.SAND, 2);
			setConstraint(CONSTRAINT.FREE);
		} else if (ageCards[0] === 2) {
			// add 2 grassland
			addCube2Play(CARD.GRASSLAND, 2);
			setConstraint(CONSTRAINT.FREE);
		} else if (ageCards[0] === 3) {
			// add 2 consecutive cells
			addCube2Play(CARD.JOKER, 2);
			setConstraint(CONSTRAINT.ALIGNED); // pour 2 cubes consecutive === aligned
		} else if (ageCards[0] === 4) {
			// add 3 aligned sea cells
			addCube2Play(CARD.SEA, 3);
			setConstraint(CONSTRAINT.ALIGNED);
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
				blockGoal();
			} else {
				prepareCube2Play(specialityCards[1]);
			}
		} else if (ageCards[0] === 7) {
			// III
			if (age === 3) {
				// player needs to choose a specialized card between two
				playState = SPECIALIZED_STATE;
				blockGoal();
			} else {
				prepareCube2Play(specialityCards[2]);
			}
		} else if (ageCards[0] === 8) {
			// I/II/III
			playState = SPECIALIZED_CARD_STATE;
			blockGoal();
		}
	}
	if (playState === CUBE_STATE) {
		addValidateButton();
	}
}

function addValidateButton() {
	validateButton.enabled = false;
	validateForceButton.enabled = true;
	undoButton.enabled = true;
	uiManager.setUI([
		validateButton,
		validateForceButton,
		undoButton,
		speakerButton,
		musicButton,
		helpButton,
	]);
}

function prepareCube2Play(specialityCardIndex) {
	setConstraint(CONSTRAINT.FREE);
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
	if (specialityCardIndex === 5) {
		setPieceBonus(3);
		addCube2Play(CARD.SAND, 4);
	}
	if (specialityCardIndex === 13) {
		setConstraint(CONSTRAINT.CENTERED);
		addCube2Play(CARD.MOUNTAIN, 1);
		addCube2Play(CARD.JOKER, 5);
	}
	if (specialityCardIndex === 14) {
		setConstraint(CONSTRAINT.CONSECUTIVE);
		addCube2Play(`${CARD.GRASSLAND}|${CARD.SEA}`, 5);
	}
	if (specialityCardIndex === 15) {
		setConstraint(CONSTRAINT.CONSECUTIVE);
		addCube2Play(`${CARD.SAND}|${CARD.SEA}`, 5);
	}
	if (specialityCardIndex === 18) {
		addCube2Play(CARD.SEA, 4);
		setTresorBonus(2);
	}
	if (specialityCardIndex === 19) {
		setConstraint(CONSTRAINT.CONSECUTIVE);
		addCube2Play(`${CARD.MOUNTAIN}|${CARD.SEA}`, 4);
	}
	if (specialityCardIndex === 20) {
		addCube2Play(CARD.SEA, 5);
	}
	if (specialityCardIndex === 21) {
		setConstraint(CONSTRAINT.CENTERED);
		addCube2Play(CARD.GRASSLAND, 1);
		addCube2Play(CARD.JOKER, 5);
	}
	if (specialityCardIndex === 23) {
		setConstraint(CONSTRAINT.CENTERED);
		addCube2Play(CARD.SEA, 1);
		addCube2Play(CARD.JOKER, 5);
	}
	if (specialityCardIndex === 24) {
		addCube2Play(CARD.SEA, 1);
		addCube2Play(CARD.SAND, 4);
	}
	if (specialityCardIndex === 25) {
		addCube2Play(CARD.SEA, 1);
		addCube2Play(CARD.GRASSLAND, 4);
	}
	if (specialityCardIndex === 26) {
		setPieceBonus(3);
		addCube2Play(CARD.GRASSLAND, 4);
	}
	if (specialityCardIndex === 27) {
		setConstraint(CONSTRAINT.CENTERED);
		addCube2Play(CARD.SAND, 1);
		addCube2Play(CARD.JOKER, 5);
	}
}

function findRegion(x, y) {
	const regionIndex = regions.findIndex((region) => {
		if (region.cells.some((cell) => sameCells(cell, { x: x, y: y }))) {
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
		soundManager.playSound("take_card");
		newExplorationCard();
		overExploration = false;
	}
	if (playState === CUBE_STATE && overCell) {
		// check also if we can put a cube on this cell
		if (addCube(overCell.x, overCell.y)) {
			soundManager.playSound("place_cube");
			// check if player needs to place a village
			// 1. find region
			const region = findRegion(overCell.x, overCell.y);
			if (region) {
				// 2. check if region is full
				const isFull = region.cells.every((cell) =>
					ageExploration.some((exploration) => sameCells(cell, exploration))
				);
				if (isFull) {
					// 3. check if region already contains a village
					const hasVillage = region.cells.some((cell) => {
						const cellIndex = ageExploration.findIndex((exploration) =>
							sameCells(cell, exploration)
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
						validateForceButton.enabled = false;
						villageRegion = region;
						soundManager.playSound("new_cube");
					}
				}
			}
		}
	} else if (playState === VILLAGE_STATE && overCell) {
		// add new village
		cubes.push({
			type: CARD.VILLAGE,
			x: overCell.x,
			y: overCell.y,
		});
		soundManager.playSound("place_cube");
		playState = CUBE_STATE;
		// check if all cubes have been put on board
		if (cubes.every((cube) => cube.x !== 0)) {
			validateButton.enabled = true;
			validateForceButton.enabled = false;
		}
	}
	if (playState === TRADE_STATE && overTrade) {
		// transform town as trade
		knownTrades.push(overTrade);
		// find which trades is the best
		let bestPV = 0;
		connectedTrades.forEach((trades) => {
			if (!trades.some((trade) => sameCells(trade, overTrade))) {
				return;
			}
			const bTrade1 = board[trades[0].x][trades[0].y];
			const bTrade2 = board[trades[1].x][trades[1].y];
			const PVTrade = bTrade1.bonus.nb * bTrade2.bonus.nb;
			if (PVTrade > bestPV) {
				bestPV = PVTrade;
			}
		});
		uiManager.addLogger(`trade: + ${bestPV} PV`);
		PV += bestPV;
		validateClicked();
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
			if (cube.x === 0) {
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
	overTrade = null;
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
	if (playState === TRADE_STATE) {
		connectedTrades.forEach((trades) => {
			trades.forEach((cell) => {
				const bcell = board[cell.x][cell.y];
				if (isOverCell(bcell.center.x + boardx, bcell.center.y + boardy)) {
					overTrade = { x: cell.x, y: cell.y };
					return;
				}
			});
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
	regions = [];
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

function initGoalsAndTreasures() {
	goals = [0, 0, 0, 0, 0, 0];
	blockGoalIndex = -1;
	tresors = [];
	ruins = [];
	knownTrades = [];
	connectedTrades = [];
}

function initBoard(map = "avenia") {
	board = [];
	age = 1;
	PV = 0;
	PVTreasure = 0;
	if (map === "avenia") {
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
		board[5][3].bonus = { type: "trade", nb: 3 };
		board[1][6].bonus = { type: "trade", nb: 3 };
		board[8][4].bonus = { type: "trade", nb: 3 };
		board[12][2].bonus = { type: "trade", nb: 3 };
		board[12][5].bonus = { type: "trade", nb: 2 };
		board[5][11].bonus = { type: "trade", nb: 3 };
		board[17][2].bonus = { type: "trade", nb: 3 };
		board[17][7].bonus = { type: "trade", nb: 3 };
		board[9][8].bonus = { type: "trade", nb: 2 };
		board[11][12].bonus = { type: "trade", nb: 4 };
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

		ageExploration = [{ type: CARD.CAPITAL, x: 9, y: 6 }];

		exploredCards = [6, 7, 8];
	}
}

function expect(check, text) {
	if (!check) {
		throw text;
	}
}

function expectLength(array, expected, text) {
	if (array.length !== expected) {
		throw `${text}: got ${array.length} instead of ${expected}`;
	}
}

/**
 * Test utilities
 */
function test() {
	initBoard();
	computeRegions();
	initGoalsAndTreasures();
	expectLength(regions, 30, "error in computeRegions");

	expectLength(findRegion(17, 5).cells, 5, "error in findRegion");

	addCube2Play(CARD.GRASSLAND, 4);
	addCube2Play(CARD.SAND, 2);
	addCube(12, 5);
	addCube(12, 6);
	addCube(12, 7);
	transformCubeToVillage(12, 7);
	addCube(10, 8);
	addCube(9, 8);
	addCube(11, 7);
	expectLength(ageExploration, 7, "error in addCube");
	expect(findExplorationCell({ x: 12, y: 5 }), "error in findExplorationCell");

	expectLength(getConnectedTrades(), 2, "error in getConnectedTrades");

	expectLength(getVillages(), 1, "error in getVillages");

	removeCubes();
	expectLength(ageExploration, 2, "error in removeCubes");
	cubes = [];

	prepareCube2Play(2); // 2 mountain and 3 grassland
	expectLength(cubes, 5, "error in prepareCube2Play");

	doReachGoal(2);
	age = 2;
	blockGoal();

	// ruins
	ruins = [
		{ x: 18, y: 5 },
		{ x: 14, y: 3 },
		{ x: 8, y: 2 },
	];
	expectLength(getBorderRuins(), 2, "error in getBorderRuins");

	const cell = board[17][6];
	expect(checkType(cell, [CARD.GRASSLAND]), "error in checkType 1");
	expect(!checkType(cell, [CARD.SAND]), "error in checkType 2");
	expect(checkType(cell, [CARD.SAND, CARD.GRASSLAND]), "error in checkType 3");
	const tower = board[18][1];
	expect(checkType(tower, [CARD.SEA], true), "error in checkType 4");
	expect(!checkType(tower, [CARD.SEA]), "error in checkType 5");

	expectLength(
		getAllCells("NE", { x: 9, y: 10 }, { x: 14, y: 8 }),
		6,
		"error in getAllCells"
	);

	expect(
		checkAlignedCubes([
			{ x: 9, y: 7 },
			{ x: 10, y: 7 },
		]),
		"error in checkAlignedCubes 1"
	);
	expect(
		checkAlignedCubes([
			{ x: 10, y: 12 },
			{ x: 11, y: 12 },
		]),
		"error in checkAlignedCubes 2"
	);
	expect(
		checkAlignedCubes([
			{ x: 11, y: 9 },
			{ x: 12, y: 9 },
			{ x: 13, y: 8 },
		]),
		"error in checkAlignedCubes 3"
	);
	expect(
		checkAlignedCubes([
			{ x: 6, y: 7 },
			{ x: 6, y: 9 },
			{ x: 6, y: 8 },
		]),
		"error in checkAlignedCubes 4"
	);
	expect(
		!checkAlignedCubes([
			{ x: 8, y: 6 },
			{ x: 9, y: 5 },
			{ x: 11, y: 4 },
		]),
		"error in checkAlignedCubes 5"
	);

	expect(
		!checkConsecutiveCubes([
			{ x: 12, y: 5 },
			{ x: 12, y: 6 },
			{ x: 13, y: 5 },
			{ x: 14, y: 7 },
			{ x: 14, y: 8 },
		]),
		"error in checkConsecutiveCubes 1"
	);

	expect(
		checkConsecutiveCubes([
			{ x: 12, y: 5 },
			{ x: 12, y: 6 },
			{ x: 13, y: 5 },
			{ x: 14, y: 6 },
			{ x: 15, y: 6 },
		]),
		"error in checkConsecutiveCubes 2"
	);

	expect(
		checkCenteredCubes([
			{ x: 12, y: 5 },
			{ x: 11, y: 4 },
			{ x: 12, y: 4 },
			{ x: 13, y: 4 },
			{ x: 13, y: 5 },
		]),
		"error in checkCenteredCubes 1"
	);

	expect(
		!checkCenteredCubes([
			{ x: 12, y: 5 },
			{ x: 13, y: 6 },
		]),
		"error in checkCenteredCubes 2"
	);
}

test();
