const uiManager = new UIManager();
const windowWidth = 1680;
const windowHeight = 1000;
uiManager.loggerContainer = new LoggerContainer(1150, 700, 240, 100);
uiManager.loggerContainer.visible = true;

const toolManager = new ToolManager();
const jobManager = new JobManager();
const soundManager = new SoundMgr();
const spritesheet = new SpriteSheet();

let animations = [];

const GAME_LOADING_STATE = 0;
const GAME_START_STATE = 1;
const GAME_PLAY_STATE = 2;
const GAME_OVER_STATE = 3;
const RULES_STATE = 4;
const TUTO_STATE = 5;
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
	TYPE: "type",
	PIECE: "piece",
	CRISTAL: "cristal",
	VILLAGE: "village",
};

let map = "avenia";
let goals_cards = "avenia_goals";
let persistence = null;

const CONSTRAINT = {
	FREE: "none",
	CONSECUTIVE: "consecutive",
	ALIGNED: "aligned",
	CENTERED: "centered",
	INREGION: "in_same_region",
	ALIGNEDSAMETYPE: "aligned-same_type",
};

let overCell = null;
let overTrade = null;
let overExploration = false;
let overTreasure = false;
let overHelpButton = false;
let overCoins = false;
let overSpecialization = -1; // 0 or 1
let overSpecializedCard = -1; // 0, 1 or 2
let age = 1; // 1 to 4
let PV = 0;
let PVHistory = [];
let PVTreasure = 0;
let villageRegion = null;
let bestTradePV = 0;
let bestNbPieces = 0;

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
		"Charles",
		"Dixon",
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
		"Nuno",
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
		"Denham",
		"Verrazzano",
		"Dias",
		"Pytheas",
		"Tristao",
		"Foucauld",
		"Hornemann",
		"Tilho",
		"Monod",
	];
	const townNames = [
		"Paris",
		"Venice",
		"Hamburg",
		"Wasserbourg",
		"Mexico",
		"Delhi",
		"Lagos",
		"London",
		"Madrid",
		"Pune",
		"Xian",
		"Singapour",
	];
	let lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
	if (Math.random() > 0.5) {
		const townName = townNames[Math.floor(Math.random() * townNames.length)];
		lastName = `${lastName} di ${townName}`;
	}
	if (Math.random() < 0.3) {
		return `Sir ${firstName} ${lastName}`;
	} else {
		if (Math.random() < 0.3) {
			return `Capt ${firstName} ${lastName}`;
		}
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
}

const rulesImages = [
	{ width: 350, height: 650, name: "ruleExplication", button: null },
	{ width: 300, height: 80, name: "ruleTerrain", button: null },
	{ width: 420, height: 50, name: "ruleCapitale", button: null },
	{ width: 400, height: 55, name: "ruleRegion", button: null },
	{ width: 540, height: 335, name: "ruleTypes", button: null },
	{ width: 560, height: 460, name: "ruleVillage", button: null },
	{ width: 550, height: 320, name: "ruleTower", button: null },
	{ width: 550, height: 190, name: "rulePiece", button: null },
	{ width: 550, height: 370, name: "ruleRuins", button: null },
	{ width: 560, height: 680, name: "ruleTowns", button: null },
	{ width: 435, height: 60, name: "ruleScore", button: null },
	{ width: 660, height: 430, name: "ruleEndAge", button: null },
	{ width: 670, height: 250, name: "ruleExplorationCard", button: null },
	{ width: 675, height: 460, name: "ruleExploreMap", button: null },
	{ width: 310, height: 730, name: "ruleRules", button: null },
	{ width: 735, height: 830, name: "ruleExplorationBoard", button: null },
	{ width: 640, height: 975, name: "ruleTreasure", button: null },
	{ width: 330, height: 220, name: "ruleGoal", button: null },
	{ width: 890, height: 570, name: "ruleSpecializedCard", button: null },
	{ width: 550, height: 700, name: "ruleSoloRule", button: null },
];

// Loading images
function preload() {
	spritesheet.addSpriteSheet("cover", "./cover.png", 686, 503);
}

function musicClicked() {
	// TODO
}

const speakerStorageKey = "DrDr3ck/GuildeMarchande/Speaker";
const currentPlayKey = "DrDr3ck/GuildeMarchande/Play";

const replaySteps = JSON.parse(localStorage.getItem(currentPlayKey));

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
		1, 2, 3, 4, 5, 6, 7, 8, 10, 11, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23,
		24, 25, 26, 27,
	];
	// [9, 12, 28];
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
	resizeCanvas(windowWidth, windowHeight);
	initBoard(map);
	computeRegions();
	if (map === "avenia") {
		computeTerres();
	}
	cubes = [];
	initGoalsAndTreasures();

	curState = GAME_PLAY_STATE;
	uiManager.setUI([speakerButton, fullScreenButton, helpButton, backButton]);
	uiManager.addLogger("A vous de jouer!");
	// replay ?
	replay(true);
}

function replay(doIt, replayKey = currentPlayKey) {
	const steps = JSON.parse(localStorage.getItem(replayKey));
	if (doIt && steps && map === steps.map && seed === steps.seed) {
		persistence = new Persistence(
			steps ? steps.map : map,
			steps ? steps.seed : seed
		);
		if (steps) {
			persistence.replay(steps.steps);
		}
	} else {
		persistence = new Persistence(map, seed);
	}
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
	} else if (constraint === CONSTRAINT.INREGION) {
		if (
			checkInSameRegionCubes(
				curCubes.filter((cube) => cube.type !== CARD.VILLAGE)
			)
		) {
			return "ok";
		} else {
			return "Tout n'est pas dans la même région";
		}
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
	} else if (constraint === CONSTRAINT.ALIGNEDSAMETYPE) {
		if (
			!checkAlignedCubes(curCubes.filter((cube) => cube.type !== CARD.VILLAGE))
		) {
			return "Des cubes ne sont pas bien alignés";
		} else if (
			!checkSameTypeCubes(curCubes.filter((cube) => cube.type !== CARD.VILLAGE))
		) {
			return "Des cubes ne sont pas du même type";
		} else {
			return "ok";
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
	if (centeredCubes.length <= 1) {
		return true;
	}
	const firstCell = centeredCubes.shift();
	const cells = getRing(firstCell.x, firstCell.y);
	return centeredCubes.every(
		(cube) => cells.findIndex((cell) => sameCells(cell, cube)) >= 0
	);
}

function checkInSameRegionCubes(sameRegionCubes) {
	const bcell = board[sameRegionCubes[0].x][sameRegionCubes[0].y];
	if (![CARD.SAND, CARD.GRASSLAND, CARD.MOUNTAIN].includes(bcell.type)) {
		return false;
	}
	const regionIndex = findRegionIndex(
		sameRegionCubes[0].x,
		sameRegionCubes[0].y
	);
	if (regionIndex === -1) {
		return false;
	}
	return sameRegionCubes.every(
		(cube) => findRegionIndex(cube.x, cube.y) === regionIndex
	);
}

function checkConsecutiveCubes(consecutiveCubes) {
	if (consecutiveCubes.length <= 1) {
		return true;
	}
	for (let i = 1; i < consecutiveCubes.length; i++) {
		const curCell = consecutiveCubes[i];
		const ring = getRing(curCell.x, curCell.y);
		const prevCell = consecutiveCubes[i - 1];
		if (!ring.some((rcell) => sameCells(rcell, prevCell))) {
			return false;
		}
	}
	return true;
}

function checkSameTypeCubes(sameTypeCubes) {
	const bcell = board[sameTypeCubes[0].x][sameTypeCubes[0].y];
	if (![CARD.SAND, CARD.GRASSLAND, CARD.MOUNTAIN].includes(bcell.type)) {
		return false;
	}
	const curType = bcell.type;
	return sameTypeCubes.every((cube) => {
		const bcell = board[cube.x][cube.y];
		return bcell.type === curType;
	});
}

function checkAlignedCubes(alignedCubes) {
	if (alignedCubes.length <= 1) {
		return true;
	}
	let lowerCell = alignedCubes[0];
	let upperCell = alignedCubes[alignedCubes.length - 1];
	if (upperCell.x < lowerCell.x) {
		const tmpCell = lowerCell;
		lowerCell = upperCell;
		upperCell = tmpCell;
	} else if (upperCell.x === lowerCell.x && upperCell.y < lowerCell.y) {
		const tmpCell = lowerCell;
		lowerCell = upperCell;
		upperCell = tmpCell;
	}
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

function explorationBoardCardPosition(explorationCardIndex) {
	const cardsX = [1181, 1279, 1379, 1478, 1580, 1225, 1329, 1433, 1537];
	if (explorationCardIndex <= 4) {
		return { x: cardsX[explorationCardIndex], y: 66 };
	} else {
		return { x: cardsX[explorationCardIndex], y: 237 };
	}
}

function validateClicked(force = false) {
	if (curState === TUTO_STATE) {
		return;
	}
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
			addPV("village", age);
		}
		const cell = board[cube.x][cube.y];
		if (cell.type === CARD.TOWER) {
			addPV("tour", towerPV.shift());
		}
		if (!cell.bonus) {
			return;
		}
		if (cell.bonus.type === "piece") {
			addPV("piece", cell.bonus.nb * pieceBonus);
			if (cell.bonus.nb > bestNbPieces) {
				bestNbPieces = cell.bonus.nb;
			}
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
					// animation tresor
					if (!persistenceMode) {
						const bcell = board[cube.x][cube.y];
						const tresorCard = new AnimatedImage(
							"tresor_cards",
							treasureIndex,
							bcell.center.x,
							bcell.center.y,
							0.2
						);
						animations.push(tresorCard);
						tresorCard.startAnimation(
							{ x: 1150, y: 820 },
							5 - animations.length * 0.45,
							0.65
						);
					}
				}
				ruins.push({ x: cube.x, y: cube.y });
			}
		}
		if (cell.bonus.type === "cristal") {
			// check if cube is a known cristal
			if (!cristals.some((cristal) => sameCells(cristal, cube))) {
				// add cristal PV + all other cristal PVs
				let cristalPV = cell.bonus.nb;
				cristals.forEach((cristal) => {
					const bcell = board[cristal.x][cristal.y];
					cristalPV += bcell.bonus.nb;
				});
				// add cristal as known cristal
				cristals.push({ x: cube.x, y: cube.y });
				addPV("cristal", cristalPV);
			}
		}
	});
	setTresorBonus(1);
	setPieceBonus(1);
	// nettoyer cubes et constraint
	if (cubes.length > 0) {
		persistence.addStep(cubes);
	}
	cubes = [];
	constraint = CONSTRAINT.FREE;
	// passer à la carte exploration suivante
	validateButton.enabled = false;
	validateForceButton.enabled = true;
	if (treasureCubes === 0) {
		playState = EXPLORATION_STATE;
		uiManager.setUI([speakerButton, fullScreenButton, helpButton, backButton]);
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
	if (getConnectedTrades().length >= 1) {
		playState = TRADE_STATE;
	}
	checkGoals();
	// compter les points de tresors
	countPVTreasure();

	soundManager.playSound("validate");

	if (playState === EXPLORATION_STATE) {
		if (!persistenceMode) {
			newExplorationCard();
		}
	}
}

function getConnectedTowns() {
	const allTowns = [];
	const towns = ageExploration.filter((cell) => {
		const bcell = board[cell.x][cell.y];
		return bcell.bonus?.type === "trade";
	});
	const isCellInExploration = (rcell) => {
		return ageExploration.some((exploration) => sameCells(exploration, rcell));
	};
	towns.forEach((curTown) => {
		const path = [{ x: curTown.x, y: curTown.y }];
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
				}
			});
			pathIndex++;
		}
		allTowns.push(path);
	});
	return allTowns;
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

function getTypedCells(type) {
	return ageExploration.filter((exploration) => exploration.type === type);
}

function getVillages() {
	return getTypedCells(CARD.VILLAGE);
}

function getTowers() {
	return getTypedCells(CARD.TOWER);
}

function getAllCristals() {
	return [
		{ x: 9, y: 1 },
		{ x: 14, y: 2 },
		{ x: 13, y: 8 },
		{ x: 19, y: 13 },
	];
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
	if (curState === TUTO_STATE) {
		return;
	}
	for (let i = 0; i < cubes.length; i++) {
		undoCube(i);
	}
	cubes = cubes.filter((cube) => cube.type !== CARD.VILLAGE);
	playState = CUBE_STATE;
}

const speakerButton = new BFloatingSwitchButton(
	windowWidth - 70,
	70,
	"\uD83D\uDD0A",
	speakerClicked
);
const musicButton = new BFloatingSwitchButton(
	windowWidth - 70 - 10 - 70,
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
const backButton = new BButton(20, 40, "Menu", () => {
	newGame();
});
helpButton.previewCheck = false;

const fullScreenButton = new BFloatingSwitchButton(
	windowWidth - 70 - 10 - 70,
	70,
	"\u26F6",
	() => {
		if (document.fullscreenElement) {
			document.exitFullscreen();
			fullScreenButton.checked = false;
			//resizeCanvas(windowWidth, windowHeight);
		} else {
			document.documentElement.requestFullscreen();
			fullScreenButton.checked = true;
			//resizeCanvas(window.screen.availWidth, window.screen.availHeight);
		}
	}
);
fullScreenButton.checked = document.fullscreenElement;

const createRuleButton = (x, y, str) => {
	const ruleButton = new BFloatingSwitchButton(x, y, str, () => {});
	ruleButton.previewCheck = false;
	ruleButton.setTextSize(50);
	return ruleButton;
};
const ruleExplicationButton = createRuleButton(74, 88, "1");
rulesImages[0].button = ruleExplicationButton;
const ruleTerrainButton = createRuleButton(300, 430, "2");
rulesImages[1].button = ruleTerrainButton;
const ruleCapitaleButton = createRuleButton(450, 470, "3");
rulesImages[2].button = ruleCapitaleButton;
const ruleRegionButton = createRuleButton(1035, 255, "4");
rulesImages[3].button = ruleRegionButton;
const ruleTypesButton = createRuleButton(420, 675, "5");
rulesImages[4].button = ruleTypesButton;
const ruleVillageButton = createRuleButton(410, 260, "5a");
rulesImages[5].button = ruleVillageButton;
const ruleTowerButton = createRuleButton(120, 305, "5b");
rulesImages[6].button = ruleTowerButton;
const rulePieceButton = createRuleButton(275, 530, "5c");
rulesImages[7].button = rulePieceButton;
const ruleRuinsButton = createRuleButton(350, 785, "5d");
rulesImages[8].button = ruleRuinsButton;
const ruleTownsButton = createRuleButton(160, 540, "5e");
rulesImages[9].button = ruleTownsButton;
const ruleScoreButton = createRuleButton(110, 845, "6");
rulesImages[10].button = ruleScoreButton;
const ruleEndAgeButton = createRuleButton(5, 940, "7");
rulesImages[11].button = ruleEndAgeButton;
const ruleExplorationCardButton = createRuleButton(1210, 560, "8");
rulesImages[12].button = ruleExplorationCardButton;
const ruleExploreMapButton = createRuleButton(1035, 125, "9");
rulesImages[13].button = ruleExploreMapButton;
const ruleRulesButton = createRuleButton(1140, 125, "10");
rulesImages[14].button = ruleRulesButton;
const ruleExplorationBoardButton = createRuleButton(1390, 170, "11");
rulesImages[15].button = ruleExplorationBoardButton;
const ruleTreasureButton = createRuleButton(1250, 925, "12");
rulesImages[16].button = ruleTreasureButton;
const ruleGoalButton = createRuleButton(1550, 725, "13");
rulesImages[17].button = ruleGoalButton;
const ruleSpecializedCardButton = createRuleButton(15, 480, "14");
rulesImages[18].button = ruleSpecializedCardButton;
const ruleSoloRuleButton = createRuleButton(550, 930, "15");
rulesImages[19].button = ruleSoloRuleButton;

function resetSeed() {
	seed = getRandomName().replaceAll(" ", "_");
}
function newGame() {
	document.location.href = getUrl(true);
}
function rulesClicked() {
	window.open(`${getUrl(true)}/index.html?rules`, "_blank");
}
function tutoClicked() {
	window.open(`${getUrl(true)}/index.html?tuto`, "_blank");
}

function continueClicked() {
	map = replaySteps.map;
	seed = replaySteps.seed;
	initMap(map);
	document.location.href = getUrl();
}

const newGameButton = new BButton(1200, 300, "Nouvelle Partie", newGame);
newGameButton.w = 450;
const closeButton = new BButton(500, 90, "J'ai tout lu!", () => {
	window.close();
});
const resetSeedButton = new BButton(1400, 300, "Reset seed", resetSeed);
const rulesButton = new BButton(140, 120, "Règles", rulesClicked);
const tutoButton = new BButton(140, 220, "Tutoriel", tutoClicked);
const continueButton = new BButton(140, 320, "Continue", continueClicked);

const aveniaButton = new BButton(
	10,
	windowHeight - 420,
	"AVENIA",
	startAveniaClicked
);

const aghonButton = new BButton(
	1270,
	windowHeight - 420,
	"AGHON",
	startAghonClicked
);

const cnidariaButton = new BButton(
	10,
	windowHeight - 330,
	"CNIDARIA",
	startCnidariaClicked
);

const kazanButton = new BButton(
	1270,
	windowHeight - 330,
	"KAZAN",
	startKazanClicked
);

const validateButton = new BButton(1147, 677, "Valider", validateClicked);
validateButton.setTextSize(30);
validateButton.w = 180;
const undoButton = new BButton(940, 70, "Annuler", undoClicked);
undoButton.setTextSize(30);
undoButton.w = 180;
const validateForceButton = new BButton(950, 980, "Fin de Tour", () => {
	validateClicked(true);
});
validateForceButton.setTextSize(30);
validateForceButton.w = 180;

let persistenceMode = false;

class Persistence {
	constructor(mapName, seed) {
		this.map = mapName;
		this.seed = seed;
		this.steps = [];
	}

	replay(steps) {
		persistenceMode = true;
		steps.forEach((step) => {
			if (step.type === "exploration") {
				newExplorationCard();
				return;
			}
			if (step.type === "speciality") {
				// 4. add cube to play
				prepareCube2Play(specialityArray[step.cardIndex]);
				chooseSpecialityCard(step.cardIndex);
				// 3. change state to CUBE_STATE
				playState = CUBE_STATE;
			}
			if (step.type === "trade") {
				chooseTrade(step.tradeCell);
				validateClicked(true);
			}
			if (step.type === "cubes") {
				step.cubes.forEach((cube) => {
					if (cube.type === "village") {
						addNewVillage(cube.x, cube.y);
					} else {
						addCube(cube.x, cube.y, true);
					}
				});
				validateClicked(true);
			}
		});
		persistenceMode = false;
	}

	saveReplay(replayKey = currentPlayKey) {
		if (curState === TUTO_STATE) {
			return;
		}
		const jsonReplay = JSON.stringify({
			map: this.map,
			seed: this.seed,
			steps: this.steps,
		});
		localStorage.setItem(replayKey, jsonReplay);
	}

	newExplorationCard() {
		this.steps.push({ type: "exploration" });
		this.saveReplay();
	}

	chooseSpecialityCard(cardIndex) {
		this.steps.push({ type: "speciality", cardIndex: cardIndex });
		this.saveReplay();
	}

	chooseTrade(tradeCell) {
		this.steps.push({ type: "trade", tradeCell: tradeCell });
		this.saveReplay();
	}

	addStep(stepCubes) {
		this.steps.push({ type: "cubes", cubes: [...stepCubes] });
		this.saveReplay();
	}
}

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
	1, 2, 3, 4, 5, 6, 7, 8, 10, 11, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23,
	24, 25, 26, 27,
];
// [ 9, 12, 18];

let tresorArray = [
	0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2,
	3, 3, 5, 5, 6, 6, 7, 7, 8, 8, 8, 8, 8, 8,
];

let tresors = [];

let regions = [];

let terres = [];

let ruins = [];

let cristals = [];

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

function checkType(cell, types, withTowerOrCristal = false) {
	if (types[0] === CARD.JOKER) {
		return true;
	}
	if (types[0] === CARD.TYPE) {
		return true;
	}
	if (
		withTowerOrCristal &&
		(cell.type === CARD.TOWER || cell.type === CARD.CRISTAL)
	) {
		return true;
	}
	return types.includes(cell.type);
}

function addCube(x, y, force = false) {
	const cell = board[x][y];
	if (!force) {
		// check if cube not already added
		if (
			ageExploration.findIndex((ecell) => sameCells(ecell, { x: x, y: y })) >= 0
		) {
			return false;
		}
		// check if cube is next to an already existing cube
		const ring = getRing(x, y);
		if (
			!ring.some(
				(rcell) =>
					ageExploration.findIndex((ecell) => sameCells(rcell, ecell)) >= 0
			)
		) {
			// le cube doit etre posé à coté d'un autre cube existant
			return false;
		}
		// if aligned/centered and first cube, should explore type of first playable cube
		if (
			cubes.filter((c) => c.x !== 0 && c.y !== 0).length === 0 &&
			[CONSTRAINT.CENTERED, CONSTRAINT.ALIGNED].includes(constraint)
		) {
			// first cube
			if (!checkType(cell, cubes[0].type.split("|"), true)) {
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
	fullScreenButton.setTextSize(50);
	helpButton.setTextSize(50);
	backButton.setTextSize(25);
	backButton.w = 150;
	musicButton.enabled = false;
	musicButton.checked = false;
	helpButton.checked = false;
	const isSpeakerOn = localStorage.getItem(speakerStorageKey);
	if (isSpeakerOn === "off") {
		speakerButton.checked = false;
		soundManager.mute(true);
	}
	aghonButton.enabled = true;
	cnidariaButton.enabled = true;
	kazanButton.enabled = true;
	resetSeedButton.setTextSize(32);
	resetSeedButton.w = 200;
	rulesButton.enabled = true;
	const menu = [
		speakerButton,
		resetSeedButton,
		aveniaButton,
		cnidariaButton,
		kazanButton,
		aghonButton,
		rulesButton,
		continueButton,
		tutoButton,
	];
	uiManager.setUI(menu);
	continueButton.visible = replaySteps || false;
}

function setup() {
	initUI();
	canvas = createCanvas(windowWidth, windowHeight - 145);
	canvas.parent("canvas");

	spritesheet.addSpriteSheet("cases", "./cases.png", 105, 95);
	spritesheet.addSpriteSheet("avenia", "./avenia.png", 1680, 1405);
	spritesheet.addSpriteSheet("aghon", "./aghon.png", 1680, 1405);
	spritesheet.addSpriteSheet("cnidaria", "./cnidaria.png", 1680, 1405);
	spritesheet.addSpriteSheet("kazan", "./kazan.png", 1680, 1405);
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
	spritesheet.addSpriteSheet(
		"cnidaria_goals",
		"./cnidaria_goals.png",
		520,
		370
	);
	spritesheet.addSpriteSheet("pions", "./pions.png", 80, 90);
	spritesheet.addSpriteSheet("PV", "./PV.png", 136, 141);
	spritesheet.addSpriteSheet("avenia_rules", "./avenia_rules.png", 380, 275);
	spritesheet.addSpriteSheet("aghon_rules", "./aghon_rules.png", 685, 275);
	spritesheet.addSpriteSheet("kazan_rules", "./kazan_rules.png", 675, 350);
	spritesheet.addSpriteSheet(
		"cnidaria_rules",
		"./cnidaria_rules.png",
		680,
		710
	);
	spritesheet.addSpriteSheet("solo_pions", "./solo_pions.png", 72, 72);
	spritesheet.addSpriteSheet("scores", "./scores.png", 126, 80);

	rulesImages.forEach((rule) => {
		spritesheet.addSpriteSheet(
			rule.name,
			`./${rule.name}.png`.replace("rule", "tuto"),
			rule.width,
			rule.height
		);
	});

	soundManager.addSound("take_card", "./take_card.mp3", 1);
	soundManager.addSound("place_cube", "./place_cube.wav", 1);
	soundManager.addSound("validate", "./validate.wav", 1);
	soundManager.addSound("new_cube", "./new_cube.wav", 1);
	soundManager.addSound("new_age", "./new_age.wav", 0.25);

	frameRate(15);

	lastTime = Date.now();
}

function updateGame(elapsedTime) {
	animations.forEach((animation) => animation.update(elapsedTime));
	animations = animations.filter(
		(animation) => animation.index !== animation.indexMax
	);
}

const boardx = 50;
const boardy = 25;

function debugDrawCase(x, y, type, row, column, bonus) {
	noFill();
	if (type === CARD.MOUNTAIN) {
		fill(216, 166, 112);
	} else if (type === CARD.SEA) {
		fill(176, 171, 138);
		//return;
	} else if (type === CARD.SAND) {
		fill(227, 202, 144);
	} else if (type === CARD.CRISTAL) {
		fill(227, 182, 193);
	} else if (type === CARD.GRASSLAND) {
		fill(176, 161, 87);
	} else if (type === CARD.TOWER) {
		fill(224, 201, 188);
	} else if (type === CARD.CAPITAL) {
		fill(200, 200, 200);
	} else {
		fill(100, 100, 100);
		return;
	}
	stroke(1);
	ellipse(x + boardx, y + boardy - 15, 25); // 45 de rayon
	noStroke();
	fill(0);
	text(`${row}/${column}`, x + boardx - 12, y + boardy - 15);
	if (bonus) {
		let textBonus = bonus.type;
		if (bonus.nb) {
			textBonus = `${bonus.type}x${bonus.nb}`;
		}
		if (bonus.alpha) {
			textBonus = `${bonus.type} ${bonus.alpha}`;
		}
		text(textBonus, x + boardx - 12, y + boardy + 12);
	}
}

function drawCoffre(x, y) {
	const cell = board[x][y];
	const X = cell.center.x + boardx - 25;
	const Y = cell.center.y + boardy - 25;
	spritesheet.drawScaledSprite("pions", 0, X, Y - 10, 0.65);
}

function drawCristal(x, y) {
	const cell = board[x][y];
	const X = cell.center.x + boardx - 25;
	const Y = cell.center.y + boardy - 25;
	spritesheet.drawScaledSprite("pions", 1, X, Y, 0.65);
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
	rect(1510 + 100 * column, 530 + 190 * row, 20, 20);
}

function drawGoalPion(column, row) {
	const reajustX = 15;
	if (row === 0 && column === 0) {
		spritesheet.drawScaledSprite("solo_pions", 0, 1500 - reajustX, 510, 1);
	} else if (row === 0 && column === 1) {
		spritesheet.drawScaledSprite("solo_pions", 1, 1605 - reajustX, 510, 1);
	} else if (row === 1 && column === 0) {
		spritesheet.drawScaledSprite("solo_pions", 2, 1500 - reajustX, 700, 1);
	} else if (row === 1 && column === 1) {
		spritesheet.drawScaledSprite("solo_pions", 3, 1605 - reajustX, 700, 1);
	} else if (row === 2 && column === 0) {
		spritesheet.drawScaledSprite("solo_pions", 4, 1500 - reajustX, 890, 1);
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
		if (cube.x === 0 && cube.y === 0) {
			return;
		}
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
	spritesheet.drawScaledSprite(goals_cards, goalArray[0], 1420, 440 - 25, 0.5);
	spritesheet.drawScaledSprite(goals_cards, goalArray[1], 1420, 630 - 25, 0.5);
	spritesheet.drawScaledSprite(goals_cards, goalArray[2], 1420, 820 - 25, 0.5);
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

function addPV(str, value) {
	uiManager.addLogger(`${str}: + ${value} PV`);
	PV += value;
	// add PV in last history item
	PVHistory[PVHistory.length - 1].PV.push(`${str}: + ${value}`);
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
		addPV("objectif", result);
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

function hasAllTypedRuins() {
	const typedRuins = [false, false, false];
	ruins.forEach((ruin) => {
		const ring = getRing(ruin.x, ruin.y);
		ring.forEach((cell) => {
			const bcell = board[cell.x][cell.y];
			if (bcell.type === CARD.MOUNTAIN) {
				typedRuins[0] = true;
			} else if (bcell.type === CARD.SAND) {
				typedRuins[1] = true;
			} else if (bcell.type === CARD.GRASSLAND) {
				typedRuins[2] = true;
			}
		});
	});
	return typedRuins.every((t) => t);
}

function hasVillageNextToRuin(villages) {
	return villages.some((village) => {
		const ring = getRing(village.x, village.y);
		return ring.some((cell) => {
			const bcell = board[cell.x][cell.y];
			return bcell.bonus?.type === "tresor";
		});
	});
}

/**
 * Checks if goals are reached
 */
function checkGoals() {
	const villages = getVillages();
	if (map === "avenia") {
		// explorer 3 cases ruines le long du bord de la mappe
		if (getBorderRuins().length >= 3) {
			reachGoal(0);
		}
		// decouvrez un village dans une region 5+
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
		// decouvrez villages sur les 3 terres
		let villageOnTerre = 0;
		terres.forEach((terre, index) => {
			if (
				terre.cells.filter((cell) =>
					villages.some((village) => sameCells(village, cell))
				).length > 0
			) {
				villageOnTerre++;
			}
		});
		if (villageOnTerre >= 3) {
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
	if (map === "aghon") {
		// decouvrir un village adjacent à une tour
		villages.forEach((village) => {
			const towers = getTowers();
			const ring = getRing(village.x, village.y);
			if (
				ring.some(
					(cell) => towers.findIndex((tower) => sameCells(tower, cell)) >= 0
				)
			) {
				reachGoal(0);
			}
		});
		// explorer des cases ruines adjacentes à prairie, desert et montagne
		if (hasAllTypedRuins()) {
			reachGoal(1);
		}
		// etablir une route commerciale >= 12
		if (bestTradePV >= 12) {
			reachGoal(2);
		}
		// decouvrir villages sur prairie/desert/montagne
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
		// placez comptoirs sur case prairie/desert/montagne
		const trades = [false, false, false];
		knownTrades.forEach((cell) => {
			const bcell = board[cell.x][cell.y];
			if (bcell.type === CARD.MOUNTAIN) {
				trades[0] = true;
			} else if (bcell.type === CARD.SAND) {
				trades[1] = true;
			} else if (bcell.type === CARD.GRASSLAND) {
				trades[2] = true;
			}
		});
		if (trades.every((t) => t)) {
			reachGoal(4);
		}
		// decouvrir 2 villages sur des cases montagne
		if (
			villages.filter((village) => {
				const bcell = board[village.x][village.y];
				return bcell.type === CARD.MOUNTAIN;
			}).length >= 2
		) {
			reachGoal(5);
		}
	}
	if (map === "kazan") {
		// decouvrez village adjacent à une case ruine
		if (hasVillageNextToRuin(villages)) {
			reachGoal(0);
		}
		// explorez une case avec au moins 3 pieces
		if (bestNbPieces >= 3) {
			reachGoal(1);
		}
		// explorez les cases ruines A et J
		const isRuin = (cell, alpha) => {
			const bcell = board[cell.x][cell.y];
			return bcell.bonus?.alpha === alpha;
		};
		if (
			ruins.findIndex((ruin) => isRuin(ruin, "A")) >= 0 &&
			ruins.findIndex((ruin) => isRuin(ruin, "J")) >= 0
		) {
			reachGoal(2);
		}
		// explorez les cases ruines B et D
		if (
			ruins.findIndex((ruin) => isRuin(ruin, "B")) >= 0 &&
			ruins.findIndex((ruin) => isRuin(ruin, "D")) >= 0
		) {
			reachGoal(3);
		}
		// explorer la tour nord est + case ruine C
		const towers = getTowers();
		if (
			towers.findIndex((tower) => tower.x === 17 && tower.y === 3) >= 0 &&
			ruins.findIndex((ruin) => isRuin(ruin, "C")) >= 0
		) {
			reachGoal(4);
		}
		// reliez 2 villes à 2 cases ruines avec une chaine de cube/village
		const townsPath = getConnectedTowns();
		if (
			townsPath.some((path) => {
				const townCount = path.filter((cell) => {
					const bcell = board[cell.x][cell.y];
					return bcell.bonus?.type === "trade";
				});
				const ruinCount = path.filter((cell) => {
					const bcell = board[cell.x][cell.y];
					return bcell.bonus?.type === "tresor";
				});
				return townCount.length >= 2 && ruinCount.length >= 2;
			})
		) {
			reachGoal(5);
		}
	}
	if (map === "cnidaria") {
		// decouvrez 3 villages dans le meme type de region
		const villageRegionCount = [0, 0, 0];
		villages.forEach((village) => {
			const bcell = board[village.x][village.y];
			if (bcell.type === CARD.MOUNTAIN) {
				villageRegionCount[0] += 1;
			} else if (bcell.type === CARD.SAND) {
				villageRegionCount[1] += 1;
			} else if (bcell.type === CARD.GRASSLAND) {
				villageRegionCount[2] += 1;
			}
		});
		if (villageRegionCount.some((count) => count >= 3)) {
			reachGoal(0);
		}
		// explorez 2 cases cristal
		if (cristals.length >= 2) {
			reachGoal(1);
		}
		// route commerciale 16+
		if (bestTradePV >= 16) {
			reachGoal(2);
		}
		// explorez les ruines:
		const typedRuinsCount = [0, 0, 0]; // CRT
		ruins.forEach((ruin) => {
			const bcell = board[ruin.x][ruin.y];
			if (bcell.bonus?.alpha === "C") {
				typedRuinsCount[0] += 1;
			}
			if (bcell.bonus?.alpha === "R") {
				typedRuinsCount[1] += 1;
			}
			if (bcell.bonus?.alpha === "T") {
				typedRuinsCount[2] += 1;
			}
		});
		// 1. explorez 3 cases ruines du meme type (triangle,rond,carre)
		if (typedRuinsCount.some((c) => c >= 3)) {
			reachGoal(3);
		}
		// 2. explorez 1 case ruines du chaque type (triangle,rond,carre)
		if (typedRuinsCount.every((c) => c > 0)) {
			reachGoal(4);
		}
		// decouvrez 2 villages adjacent à une case cristal
		let villageCristalCount = 0;
		villages.forEach((village) => {
			const allCristals = getAllCristals();
			const ring = getRing(village.x, village.y);
			ring.forEach((cell) => {
				if (allCristals.findIndex((cristal) => sameCells(cristal, cell)) >= 0) {
					villageCristalCount++;
				}
			});
		});
		if (villageCristalCount >= 2) {
			reachGoal(5);
		}
	}
}

function drawBoards() {
	spritesheet.drawScaledSprite(map, 0, boardx, boardy, 0.65);
	spritesheet.drawScaledSprite("exploration", 0, 1150, boardy, 0.65);
	if (toggleDebug) {
		debugDrawBoard();
	} else {
		// ruines
		ruins.forEach((ruin) => drawCoffre(ruin.x, ruin.y));
		//cristal
		cristals.forEach((cristal) => drawCristal(cristal.x, cristal.y));
		// comptoir commercial
		knownTrades.forEach((trade) => drawTrade(trade.x, trade.y));
		drawAgeExploration();
	}
	drawExploredCards();
	drawExplorationCard();
}

function drawExplorationCard() {
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
}

function drawSpecializedCards() {
	if (specialityCards.length <= 0) {
		spritesheet.drawScaledSprite(
			"speciality_cards",
			0,
			map === "cnidaria" ? -90 : -110,
			95,
			map === "cnidaria" ? 0.5 : 0.6
		);
	} else {
		spritesheet.drawScaledSprite(
			"speciality_cards",
			specialityCards[0],
			map === "cnidaria" ? -5 : 5,
			95,
			map === "cnidaria" ? 0.5 : 0.6
		);
	}
	if (specialityCards.length <= 1) {
		spritesheet.drawScaledSprite(
			"speciality_cards",
			0,
			map === "cnidaria" ? -90 : -110,
			355,
			map === "cnidaria" ? 0.5 : 0.6
		);
	} else {
		spritesheet.drawScaledSprite(
			"speciality_cards",
			specialityCards[1],
			map === "cnidaria" ? -5 : 5,
			355,
			map === "cnidaria" ? 0.5 : 0.6
		);
	}
	if (specialityCards.length <= 2) {
		spritesheet.drawScaledSprite(
			"speciality_cards",
			0,
			map === "cnidaria" ? -90 : -110,
			615,
			map === "cnidaria" ? 0.5 : 0.6
		);
	} else {
		spritesheet.drawScaledSprite(
			"speciality_cards",
			specialityCards[2],
			map === "cnidaria" ? -5 : 5,
			615,
			map === "cnidaria" ? 0.5 : 0.6
		);
	}
}

function highlightCell(cell, weight = 4) {
	const bcell = board[cell.x][cell.y];
	noFill();
	strokeWeight(weight);
	stroke(250);
	ellipse(bcell.center.x + boardx, bcell.center.y + boardy, 45); // 45 de rayon
}

function drawAge() {
	noStroke();
	fill(250);
	textSize(25);
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
}

function drawPV() {
	spritesheet.drawScaledSprite("PV", 0, 1320, 510, 0.8);
	noStroke();
	fill(250);
	textSize(25);
	text(`x ${PV + PVTreasure}`, 1360, 640);
}

function drawTreasureCard() {
	spritesheet.drawScaledSprite("tresor_cards", 9, 1150, 820, 0.65);
	noStroke();
	fill(0);
	textSize(25);
	text(`x ${tresors.length}`, 1345, 945);
}

function drawPlayableCase(cube, index) {
	const caseScale = 0.8;
	const caseIndices = [
		CARD.MOUNTAIN,
		CARD.SAND,
		CARD.GRASSLAND,
		CARD.JOKER,
		CARD.SEA,
		`${CARD.SEA}|${CARD.GRASSLAND}`,
		`${CARD.SEA}|${CARD.SAND}`,
		`${CARD.SEA}|${CARD.MOUNTAIN}`,
		CARD.TYPE,
		CARD.PIECE,
	];
	const caseIndex = caseIndices.findIndex((cur) => cur === cube.type);
	spritesheet.drawScaledSprite(
		"cases",
		caseIndex,
		275 + index * 100,
		15,
		caseScale
	);
}

function drawPlayableCubes() {
	let index = 0;
	stroke(0);
	strokeWeight(2);
	fill(250, 250, 230, 120);
	rect(260, 3, 920 - 260, 95, 5);
	let maxCase = 6;
	cubes.forEach((cube) => {
		if (cube.x === 0 && maxCase > 0) {
			drawPlayableCase(cube, index++);
			maxCase--;
		}
	});
}

function drawSpecializedCardsToChoose() {
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

function drawTrades() {
	connectedTrades = getConnectedTrades();
	connectedTrades.forEach((trades) => {
		trades.forEach((trade) => {
			const cell = board[trade.x][trade.y];
			noFill();
			strokeWeight(4);
			stroke(250, 100, 100);
			ellipse(cell.center.x + boardx, cell.center.y + boardy, 40);
		});
	});
}

function drawGame() {
	drawBoards();
	if (overCell) {
		highlightCell(overCell);
	}
	drawExplorationCard();
	if (playState === SPECIALIZED_STATE) {
		// afficher 2 cartes tirées du tableau
		drawSpecializedCardsToChoose();
	}

	// afficher cards specialites
	drawSpecializedCards();

	// choose a specialized card (I/II/III)
	if (playState === SPECIALIZED_CARD_STATE) {
		noFill();
		strokeWeight(4);
		stroke(25);
		if (overSpecializedCard === 0) {
			rect(
				map === "cnidaria" ? -5 : 5,
				95,
				map === "cnidaria" ? 130 : 155,
				map === "cnidaria" ? 200 : 238,
				15
			);
		}
		if (overSpecializedCard === 1) {
			rect(
				map === "cnidaria" ? -5 : 5,
				355,
				map === "cnidaria" ? 130 : 155,
				map === "cnidaria" ? 200 : 238,
				15
			);
		}
		if (overSpecializedCard === 2) {
			rect(
				map === "cnidaria" ? -5 : 5,
				615,
				map === "cnidaria" ? 130 : 155,
				map === "cnidaria" ? 200 : 238,
				15
			);
		}
	}

	if (
		playState === CUBE_STATE &&
		cubes.filter((c) => c.x === 0 && c.y === 0).length > 0
	) {
		drawPlayableCubes();
	}

	if (playState === VILLAGE_STATE) {
		noFill();
		strokeWeight(4);
		stroke(250, 100, 100);
		rect(51, 850, 86, 86, 5);
	}

	if (playState === TRADE_STATE) {
		drawTrades();
		if (overTrade) {
			const cell = board[overTrade.x][overTrade.y];
			noFill();
			strokeWeight(4);
			stroke(250);
			ellipse(cell.center.x + boardx, cell.center.y + boardy, 45);
		}
	}

	// goals
	drawGoals();

	// points de victoire
	drawPV();
	// tresor
	drawTreasureCard();

	// explication
	fill(250);
	if (age <= 4) {
		if (playState === EXPLORATION_STATE) {
			if (age === 1) {
				text("Cliquez sur la carte d'exploration pour commencer", 200, 980);
			} else {
				text("Cliquez sur la carte d'exploration (bord rouge)", 200, 980);
			}
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
	drawAge();
	if (overTreasure) {
		drawTreasure();
	}

	if (age === 1 && ageCards[0] === 9) {
		// toute premiere carte
		drawArrow();
	}

	if (overHelpButton) {
		spritesheet.drawSprite(`${map}_rules`, 0, (windowWidth - 550) / 2, 50);
	}

	if (overCoins) {
		drawAllPVHistory();
	}

	// draw animations
	animations.forEach((animation) => animation.draw());
}

function drawArrow() {
	fill(250, 0, 0);
	stroke(0);
	strokeWeight(3);
	beginShape();
	vertex(791, 954);
	vertex(1091, 732);
	vertex(1112, 775);
	vertex(1126, 678);
	vertex(1030, 679);
	vertex(1069, 709);
	vertex(758, 915);
	endShape(CLOSE);
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
	spritesheet.drawScaledSprite(
		"cover",
		0,
		(windowWidth - 686 * 1.5) / 2,
		50,
		1.5
	);
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
			map = urlParams.get("map");
			initMap(map);
			startClicked();
		} else if (document.location.toString().includes("rules")) {
			curState = RULES_STATE;
			resizeCanvas(windowWidth, windowHeight);
			initBoard("avenia");
			const buttons = [closeButton, fullScreenButton, speakerButton];
			rulesImages.forEach((rule) => buttons.push(rule.button));
			uiManager.setUI(buttons);
			ageExploration.push({ type: "cube", x: 7, y: 4 });
			ageExploration.push({ type: "cube", x: 8, y: 4 });
			ageExploration.push({ type: "cube", x: 9, y: 3 });
			transformCubeToVillage(7, 4);
		} else if (document.location.toString().includes("tuto")) {
			curState = TUTO_STATE;
			resizeCanvas(windowWidth, windowHeight);
			initMap("avenia");
			initBoard("avenia");
			initGoalsAndTreasures();
			backButton.enabled = false;
			persistence = new Persistence("avenia", "noSeed");
			ageCards = [9, 2, 3, 5, 4, 1, 0];
			const buttons = [fullScreenButton, speakerButton];
			uiManager.setUI(buttons);
		}
	}
}

const guidedTour = new GuidedTour();
guidedTour.addStep({
	draw: () => {
		const image = rulesImages[0];
		const imageX = (windowWidth - image.width) / 2;
		const imageY = (windowHeight - image.height) / 2;
		spritesheet.drawSprite(image.name, 0, imageX, imageY);
		noFill();
		stroke(0);
		strokeWeight(5);
		rect(imageX - 2, imageY - 2, image.width + 4, image.height + 4, 15);

		noStroke();
		fill(250);
		text(
			"Clique gauche avec la souris pour avancer dans le tutoriel",
			200,
			980
		);
	},
});
guidedTour.addStep({
	draw: () => {
		drawArrow();
		noStroke();
		fill(250);
		text("Revele une carte exploration en cliquant dessus", 200, 980);
	},
});
guidedTour.addStep({
	initStep: () => {
		newExplorationCard();
	},
	draw: () => {
		noStroke();
		fill(250);
		text("Place des cubes sur la carte", 200, 980);

		stroke(0);
		strokeWeight(5);
		text("Deux cubes prairies doivent être placés sur la carte", 380, 180);
		text("Le premier doit être connecté à la capitale", 380, 230);
		text("Clique sur le cercle blanc pour placer le premier cube", 380, 280);
		highlightCell({ x: 9, y: 7 });
		drawPlayableCubes();
	},
});
guidedTour.addStep({
	initStep: () => {
		addCube(9, 7);
	},
	draw: () => {
		noStroke();
		fill(250);
		text("Place des cubes", 200, 980);

		stroke(0);
		strokeWeight(5);
		text(
			"Un cube doit toujours être placé à côté de la capitale ou d'un cube existant",
			380,
			180
		);
		text("Clique sur le cercle blanc pour placer le deuxième cube", 380, 230);
		highlightCell({ x: 8, y: 8 });
		drawPlayableCubes();
	},
});
guidedTour.addStep({
	initStep: () => {
		addCube(8, 8);
	},
	draw: () => {
		noStroke();
		fill(250);
		text("Valide tes placements", 200, 980);

		stroke(0);
		strokeWeight(5);
		text("Clique sur Valider pour valider ton placement", 380, 180);
		text(
			"Au cours d'une partie, tu peux aussi cliquer sur Annuler pour replacer tes cubes différemment",
			380,
			230
		);
		text(
			"Remarque: un cube te rapportera un point de victoire car placé sur une case pièce",
			380,
			280
		);
		drawPlayableCubes();
	},
	finalizeStep: () => {
		undoButton.visible = false;
	},
});

guidedTour.addStep({
	initStep: () => {
		addPV("piece", 1);
		newExplorationCard();
	},
	draw: () => {
		noStroke();
		fill(250);
		text("Place des cubes", 200, 980);

		stroke(0);
		strokeWeight(5);
		text(
			"Pour cette carte, deux cubes doivent être placés de manière contigues",
			380,
			180
		);
		text("Ils peuvent être placés à plusieurs endroits", 380, 230);
		text("Clique sur la case montagne pour placer le premier cube", 635, 460);
		highlightCell({ x: 10, y: 7 }, 8);
		highlightCell({ x: 10, y: 8 });
		highlightCell({ x: 9, y: 8 });
		highlightCell({ x: 10, y: 6 });
		highlightCell({ x: 9, y: 5 });
		highlightCell({ x: 8, y: 6 });
		highlightCell({ x: 8, y: 7 });
		highlightCell({ x: 7, y: 7 });
		highlightCell({ x: 7, y: 8 });
		highlightCell({ x: 8, y: 9 });
		drawPlayableCubes();
	},
});

guidedTour.addStep({
	initStep: () => {
		addCube(10, 7);
	},
	draw: () => {
		noStroke();
		fill(250);
		text("Place des cubes", 200, 980);

		stroke(0);
		strokeWeight(5);
		text("Le deuxième cube doit être placé à côté du premier", 380, 180);
		text("Il peut être placé à plusieurs endroits", 380, 230);
		text("Clique sur la case montagne pour placer le premier cube", 680, 410);
		highlightCell({ x: 10, y: 6 });
		highlightCell({ x: 10, y: 8 });
		highlightCell({ x: 11, y: 6 }, 8);
		highlightCell({ x: 11, y: 7 });
		drawPlayableCubes();
	},
});

guidedTour.addStep({
	initStep: () => {
		addCube(11, 6);
	},
	draw: () => {
		noStroke();
		fill(250);
		text("Place un village", 200, 980);

		stroke(0);
		strokeWeight(5);
		text("Une région vient d'être complétée", 380, 180);
		text(
			"Un village doit être placé sur une des cases 'vides' de la région",
			380,
			230
		);
		text("Une case vide est une case sans pièce, ni ville", 380, 280);
		text("Place une ville sur le cercle blanc", 380, 330);
		highlightCell({ x: 11, y: 6 });
	},
});

guidedTour.addStep({
	initStep: () => {
		addNewVillage(11, 6);
	},
	draw: () => {
		noStroke();
		fill(250);
		text("Valide tes placements", 200, 980);

		stroke(0);
		strokeWeight(5);
		text("Clique sur Valider pour valider ton placement", 380, 180);
		text("Un point de village te sera donné comme point de victoire", 380, 230);
	},
	finalizeStep: () => {
		transformCubeToVillage(11, 6);
		addPV("village", 1);
	},
});

guidedTour.addStep({
	initStep: () => {
		newExplorationCard();
		validateButton.visible = false;
		specialityArray[0] = 6;
		specialityArray[1] = 2;
	},
	draw: () => {
		noStroke();
		fill(250);
		text("Choisis une carte", 200, 980);

		stroke(0);
		strokeWeight(5);
		text(
			"Cette carte t'impose de choisir parmi 2 cartes spécialités",
			360,
			180
		);
		text("Clique sur la deuxième carte", 360, 230);

		drawSpecializedCardsToChoose();
	},
	finalizeStep: () => {
		validateButton.visible = true;
		prepareCube2Play(specialityArray[1]);
		chooseSpecialityCard(1);
	},
});

guidedTour.addStep({
	draw: () => {
		noStroke();
		fill(250);
		text("Place des cubes", 200, 980);

		stroke(0);
		strokeWeight(5);
		text(
			"Trois prairies et deux montagnes doivent être placés dans n'importe quel ordre",
			360,
			180
		);
		text("Cinq emplacements ont été choisi pour vous", 360, 230);
		text("Remarque: deux villages vont être rajoutés", 360, 280);

		highlightCell({ x: 10, y: 8 }, 8);
		highlightCell({ x: 12, y: 6 });
		highlightCell({ x: 12, y: 5 });
		highlightCell({ x: 13, y: 6 });
		highlightCell({ x: 13, y: 7 }, 8);

		drawPlayableCubes();
	},
	finalizeStep: () => {
		addCube(10, 8);
		addNewVillage(10, 8);
		addCube(12, 6);
		addCube(12, 5);
		addCube(13, 6);
		addCube(13, 7);
		addNewVillage(13, 7);
	},
});

guidedTour.addStep({
	draw: () => {
		noStroke();
		fill(250);
		text("Valide tes placements", 200, 980);

		stroke(0);
		strokeWeight(5);
		text("Clique sur Valider pour valider ton placement", 380, 180);
	},
	finalizeStep: () => {
		addPV("village", 1);
		addPV("village", 1);
		transformCubeToVillage(10, 8);
		transformCubeToVillage(13, 7);
	},
});

guidedTour.addStep({
	initStep: () => {
		newExplorationCard();
	},
	draw: () => {
		noStroke();
		fill(250);
		text("Place des cubes", 200, 980);

		stroke(0);
		strokeWeight(5);
		text("Trois cases 'mer' doivent être placées en ligne", 380, 180);
		text("Une ruine va être explorée", 380, 230);
		text("Une carte trésor va être dévoilée", 380, 280);

		highlightCell({ x: 13, y: 8 });
		highlightCell({ x: 14, y: 8 });
		highlightCell({ x: 15, y: 7 }, 8);

		drawPlayableCubes();
	},
	finalizeStep: () => {
		addCube(13, 8);
		addCube(14, 8);
		addCube(15, 7);
	},
});

guidedTour.addStep({
	draw: () => {
		noStroke();
		fill(250);
		text("Valide tes placements", 200, 980);

		stroke(0);
		strokeWeight(5);
		text("Clique sur Valider pour valider ton placement", 380, 180);
	},
	finalizeStep: () => {
		// Add treasure
		tresors.push(1);
		ruins.push({ x: 15, y: 7 });
		newExplorationCard();
	},
});

guidedTour.addStep({
	draw: () => {
		noStroke();
		fill(250);
		text("Clique pour passer à l'étape suivante", 200, 980);

		stroke(0);
		strokeWeight(5);
		text(
			"Place ton curseur sur la carte trésor pour voir tous tes trésors",
			380,
			230
		);
	},
});

guidedTour.addStep({
	draw: () => {
		noStroke();
		fill(250);
		text("Place des cubes", 200, 980);

		stroke(0);
		strokeWeight(5);
		text("Deux cubes désert doivent être placés", 380, 180);

		highlightCell({ x: 9, y: 8 });
		highlightCell({ x: 11, y: 5 });

		drawPlayableCubes();
	},
	finalizeStep: () => {
		addCube(9, 8);
		addCube(11, 5);
	},
});

guidedTour.addStep({
	initStep: () => {
		validateButton.visible = false;
	},
	draw: () => {
		noStroke();
		fill(250);
		text(
			"Cliquez sur une ville pour la transformer en comptoir commercial",
			200,
			980
		);

		stroke(0);
		strokeWeight(5);
		text(
			"Deux villes sont reliées par un chemin continu de cubes/village",
			380,
			180
		);
		text(
			"Clique sur la ville désert pour la transformer en comptoir commercial",
			380,
			230
		);
		text("2 x 2 points de victoire seront rajoutés au score", 380, 280);
		text(
			"La ville avec le comptoir commercial ne pourra plus être utilisée pour de futurs points de victoire",
			380,
			330
		);

		drawTrades();
	},
	finalizeStep: () => {
		chooseTrade({ x: 9, y: 8 });
		newExplorationCard();
		validateButton.visible = true;
	},
});

guidedTour.addStep({
	draw: () => {
		noStroke();
		fill(250);
		text("Place des cubes", 200, 980);

		stroke(0);
		strokeWeight(5);
		text("Un cube montagne doit être placés", 380, 180);

		highlightCell({ x: 8, y: 7 });

		drawPlayableCubes();
	},
	finalizeStep: () => {
		addCube(8, 7);
		addPV("piece", 1);
	},
});

guidedTour.addStep({
	draw: () => {
		noStroke();
		fill(250);
		text("Valide tes placements", 200, 980);

		stroke(0);
		strokeWeight(5);
		text("Clique sur Valider pour valider ton placement", 380, 180);
		text("Remarque: c'est la dernière carte de cet age", 380, 230);
		text(
			"Tous les cubes seront retirés, seuls capitale et villages resteront",
			380,
			280
		);
	},
	finalizeStep: () => {
		newExplorationCard();
	},
});

guidedTour.addStep({
	initStep: () => {
		closeButton.text = "Je veux jouer!";
		const buttons = [closeButton, fullScreenButton, speakerButton];
		uiManager.setUI(buttons);
	},
	draw: () => {
		noStroke();
		fill(250);
		text("Tu as fini le tutoriel", 200, 980);

		stroke(0);
		strokeWeight(5);
		text(
			"Les trois cartes objectifs doivent être validées pour gagner",
			380,
			180
		);
		text(
			"Un minimum de 90 points est exigé pour gagner en mode 'facile'",
			380,
			230
		);
		text("Tu as tout compris, tu peux aller jouer", 380, 280);
	},
});

function drawTuto() {
	drawBoards();
	drawExplorationCard();
	drawSpecializedCards();
	drawGoals();
	drawAge();
	if (overTreasure) {
		drawTreasure();
	}
	drawPV();
	drawTreasureCard();

	// draw animations
	animations.forEach((animation) => animation.draw());

	guidedTour.draw();
}

function drawRules() {
	drawBoards();
	drawSpecializedCards();
	drawGoals();
	drawAge();
	drawPV();
	drawTreasureCard();

	const drawImage = (image) => {
		const imageX = (windowWidth - image.width) / 2;
		const imageY = (windowHeight - image.height) / 2;
		spritesheet.drawSprite(image.name, 0, imageX, imageY);
		noFill();
		stroke(0);
		strokeWeight(5);
		rect(imageX - 2, imageY - 2, image.width + 4, image.height + 4, 15);
	};

	const ruleIndex = rulesImages.findIndex((image) => image.button.over == true);
	if (ruleIndex >= 0) {
		const ruleImage = rulesImages[ruleIndex];
		drawImage(ruleImage);
		rulesImages.forEach((rule, idx) => {
			if (ruleIndex !== idx && ruleIndex !== idx - 1) {
				rule.button.visible = false;
			}
		});
		closeButton.visible = false;
	} else {
		rulesImages.forEach((rule) => {
			rule.button.visible = true;
		});
		closeButton.visible = true;
		return;
	}

	if (ruleTerrainButton.over === true) {
		highlightCell({ x: 4, y: 4 });
		highlightCell({ x: 7, y: 5 });
		highlightCell({ x: 2, y: 7 });
		highlightCell({ x: 5, y: 7 });
		line(330, 400, 321, 324);
		line(330, 400, 441, 387);
		line(330, 400, 358, 469);
		line(330, 400, 248, 454);
	}

	if (ruleCapitaleButton.over === true) {
		highlightCell({ x: 9, y: 6 });
		line(480, 440, 534, 427);
	}

	if (ruleRegionButton.over === true) {
		highlightCell({ x: 15, y: 3 });
		highlightCell({ x: 16, y: 3 });
		highlightCell({ x: 17, y: 2 });
		line(1062, 228, 902, 250);
	}

	if (ruleTypesButton.over === true) {
		highlightCell({ x: 8, y: 7 });
		highlightCell({ x: 5, y: 7 });
		highlightCell({ x: 5, y: 11 });
		highlightCell({ x: 3, y: 11 });
		highlightCell({ x: 7, y: 12 });
	}

	if (ruleVillageButton.over === true) {
		highlightCell({ x: 7, y: 4 });
		rect(185, 854, 618 - 185, 935 - 854, 15);
		line(440, 230, 455, 308);
		line(440, 230, 358, 855);
	}

	if (ruleTowerButton.over === true) {
		highlightCell({ x: 2, y: 2 });
		rect(782, 854, 1133 - 782, 935 - 854, 15);
		line(143, 276, 228, 217);
		line(143, 276, 787, 860);
	}

	if (rulePieceButton.over === true) {
		highlightCell({ x: 2, y: 9 });
		line(306, 500, 246, 557);
	}

	if (ruleRuinsButton.over === true) {
		highlightCell({ x: 7, y: 12 });
		line(381, 756, 440, 760);
	}

	if (ruleTownsButton.over === true) {
		highlightCell({ x: 1, y: 6 });
		line(191, 512, 181, 457);
	}

	if (ruleScoreButton.over === true) {
		noFill();
		strokeWeight(4);
		stroke(250);
		rect(185, 854, 618 - 185, 935 - 854, 15);
		rect(782, 854, 1133 - 782, 935 - 854, 15);
		line(139, 814, 189, 860);
		line(139, 814, 786, 859);
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
	if (curState === RULES_STATE) {
		drawRules();
	}
	if (curState === TUTO_STATE) {
		updateGame(elapsedTime);
		drawTuto();
	}

	uiManager.processInput();

	uiManager.update(elapsedTime);

	uiManager.drawLogger();

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
		textSize(25);
		text("Explorateur:", 1400, 175);
		textSize(15);
		text(seed.replaceAll("_", " "), 1400, 220);
	}
	if (curState === GAME_PLAY_STATE) {
		updateGame(elapsedTime);
		drawGame();
	}

	uiManager.draw(false);
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
	persistence.newExplorationCard();
	if (cubes.length > 0) {
		persistence.addStep(cubes);
	}
	cubes = [];
	if (ageCards[0] !== 9 && ageCards.length > 1) {
		const cardIndex = ageCards[0];
		if (!persistenceMode) {
			const animatedCard = new AnimatedImage(
				"exploration_cards",
				ageCards[0],
				1150,
				440 - 25,
				0.65,
				() => {
					// put card on exploration board
					exploredCards.push(cardIndex);
				}
			);
			animations.push(animatedCard);
			const finalPosition = explorationBoardCardPosition(ageCards[0]);
			animatedCard.startAnimation(finalPosition, 8, 0.325);
		} else {
			exploredCards.push(cardIndex);
		}
	}
	ageCards.shift();
	if (ageCards.length === 0) {
		// new Age
		age += 1;
		if (age < 5) {
			if (!persistenceMode && curState !== TUTO_STATE) {
				uiManager.addLogger("Nouvel age");
				soundManager.playSound("new_age");
			}
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
			uiManager.setUI([
				speakerButton,
				fullScreenButton,
				helpButton,
				newGameButton,
				backButton,
			]);
		}
		// remove all cubes
		removeCubes();
		return;
	} else {
		PVHistory.push({ age: age, cardIndex: ageCards[0], PV: [] });
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

function drawPVHistory(ageHistory, rowPixel) {
	if (ageHistory.length === 0) {
		return;
	}
	ageHistory.forEach((history, index) => {
		spritesheet.drawScaledSprite(
			"exploration_cards",
			history.cardIndex,
			52 + 150 * index,
			rowPixel,
			0.45
		);
		history.PV.forEach((value, textIndex) => {
			text(value, 55 + 10 + 150 * index, rowPixel + 25 + 15 + 20 * textIndex);
		});
	});
}
function drawPVTreasure() {
	spritesheet.drawScaledSprite("tresor_cards", 4, 500, 26, 0.4);
	text(`+ ${PVTreasure}`, 500 + 10, 25 + 20);
}
function drawAllPVHistory() {
	noStroke();
	fill(0);
	textSize(15);
	drawPVHistory(
		PVHistory.filter((history) => history.age === 1),
		135
	);
	drawPVHistory(
		PVHistory.filter((history) => history.age === 2),
		335
	);
	drawPVHistory(
		PVHistory.filter((history) => history.age === 3),
		535
	);
	drawPVHistory(
		PVHistory.filter((history) => history.age === 4),
		735
	);
	drawPVTreasure();
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
		fullScreenButton,
		helpButton,
		backButton,
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
	if (specialityCardIndex === 6) {
		setConstraint(CONSTRAINT.ALIGNED);
		addCube2Play(CARD.SAND, 1);
		addCube2Play(CARD.JOKER, 3);
	}
	if (specialityCardIndex === 7) {
		setConstraint(CONSTRAINT.ALIGNED);
		addCube2Play(CARD.GRASSLAND, 1);
		addCube2Play(CARD.JOKER, 3);
	}
	if (specialityCardIndex === 8) {
		setConstraint(CONSTRAINT.ALIGNED);
		addCube2Play(CARD.SEA, 1);
		addCube2Play(CARD.JOKER, 3);
	}
	if (specialityCardIndex === 10) {
		setConstraint(CONSTRAINT.ALIGNED);
		addCube2Play(CARD.SEA, 20);
	}
	if (specialityCardIndex === 11) {
		setConstraint(CONSTRAINT.ALIGNEDSAMETYPE);
		addCube2Play(CARD.TYPE, 20);
	}
	if (specialityCardIndex === 13) {
		setConstraint(CONSTRAINT.CENTERED);
		addCube2Play(CARD.MOUNTAIN, 1);
		addCube2Play(CARD.JOKER, 5);
	}
	if (specialityCardIndex === 14) {
		setConstraint(CONSTRAINT.CONSECUTIVE);
		addCube2Play(`${CARD.SEA}|${CARD.GRASSLAND}`, 5);
	}
	if (specialityCardIndex === 15) {
		setConstraint(CONSTRAINT.CONSECUTIVE);
		addCube2Play(`${CARD.SEA}|${CARD.SAND}`, 5);
	}
	if (specialityCardIndex === 16) {
		setPieceBonus(2);
		addCube2Play(CARD.MOUNTAIN, 3);
	}
	if (specialityCardIndex === 17) {
		setConstraint(CONSTRAINT.ALIGNED);
		addCube2Play(CARD.MOUNTAIN, 1);
		addCube2Play(CARD.JOKER, 3);
	}
	if (specialityCardIndex === 18) {
		addCube2Play(CARD.SEA, 4);
		setTresorBonus(2);
	}
	if (specialityCardIndex === 19) {
		setConstraint(CONSTRAINT.CONSECUTIVE);
		addCube2Play(`${CARD.SEA}|${CARD.MOUNTAIN}`, 4);
	}
	if (specialityCardIndex === 20) {
		addCube2Play(CARD.SEA, 5);
	}
	if (specialityCardIndex === 21) {
		setConstraint(CONSTRAINT.CENTERED);
		addCube2Play(CARD.GRASSLAND, 1);
		addCube2Play(CARD.JOKER, 5);
	}
	if (specialityCardIndex === 22) {
		setConstraint(CONSTRAINT.INREGION);
		addCube2Play(CARD.TYPE, 4);
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

function findRegionIndex(x, y) {
	const regionIndex = regions.findIndex((region) => {
		if (region.cells.some((cell) => sameCells(cell, { x: x, y: y }))) {
			return true;
		}
		return false;
	});
	return regionIndex;
}

function findRegion(x, y) {
	const regionIndex = findRegionIndex(x, y);
	if (regionIndex >= 0) {
		return regions[regionIndex];
	}
	return null;
}

function addNewVillage(x, y) {
	cubes.push({
		type: CARD.VILLAGE,
		x: x,
		y: y,
	});
}

function mouseClicked() {
	if (toggleDebug) {
		uiManager.addLogger(`X=${mouseX}, Y=${mouseY}`);
	}
	toolManager.mouseClicked();
	uiManager.mouseClicked();
	if (curState === RULES_STATE) {
		return;
	}
	if (curState === TUTO_STATE) {
		guidedTour.nextStep();
		return;
	}
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
					// 4. check if village can be put (need a cell without bonus)
					const canVillage = region.cells.some((cell) => {
						const bcell = board[cell.x][cell.y];
						return !bcell.bonus;
					});
					if (!hasVillage && canVillage) {
						// 5. change state
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
		addNewVillage(overCell.x, overCell.y);
		soundManager.playSound("place_cube");
		playState = CUBE_STATE;
		// check if all cubes have been put on board
		validateForceButton.enabled = true;
		if (cubes.every((cube) => cube.x !== 0)) {
			validateButton.enabled = true;
			validateForceButton.enabled = false;
		}
	}
	if (playState === TRADE_STATE && overTrade) {
		chooseTrade(overTrade);
		validateClicked();
	}
	if (playState === SPECIALIZED_STATE && overSpecialization !== -1) {
		// 1. set animation
		const specializationIndex = overSpecialization;
		const specializedCard = new AnimatedImage(
			"speciality_cards",
			specialityArray[overSpecialization],
			997,
			overSpecialization === 0 ? 100 : 467,
			0.8,
			() => {
				// 2. choose specialized card
				chooseSpecialityCard(specializationIndex);
			}
		);
		animations.push(specializedCard);
		const cardY = [95, 355, 615];
		specializedCard.startAnimation(
			{ x: map === "cnidaria" ? -5 : 5, y: cardY[specialityCards.length] },
			8,
			map === "cnidaria" ? 0.5 : 0.6
		);
		// 3. change state to CUBE_STATE
		playState = CUBE_STATE;
		// 4. add cube to play
		prepareCube2Play(specialityArray[overSpecialization]);
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

function chooseSpecialityCard(specialityCardIndex) {
	// 1. put specialized card in the current Age
	specialityCards.push(specialityArray[specialityCardIndex]);
	// 2. remove the 2 cards from the list of specialized cards
	specialityArray.shift();
	specialityArray.shift();

	persistence.chooseSpecialityCard(specialityCardIndex);
}

function chooseTrade(tradeCell) {
	connectedTrades = getConnectedTrades();
	// transform town as trade
	knownTrades.push(tradeCell);
	// find which trades is the best
	let bestPV = 0;
	connectedTrades.forEach((trades) => {
		if (!trades.some((trade) => sameCells(trade, tradeCell))) {
			return;
		}
		const bTrade1 = board[trades[0].x][trades[0].y];
		const bTrade2 = board[trades[1].x][trades[1].y];
		const PVTrade = bTrade1.bonus.nb * bTrade2.bonus.nb;
		if (PVTrade > bestPV) {
			bestPV = PVTrade;
		}
		if (bestPV > bestTradePV) {
			bestTradePV = bestPV;
		}
	});
	addPV("commerce", bestPV);

	persistence.chooseTrade(tradeCell);
}

function keyPressed() {
	if (key === "D") {
		toggleDebug = !toggleDebug;
	}
	/*
	if (key === "R") {
		replay(true, "DrDr3ck/GuildeMarchande/RePlay");
	}
	if (key === "S") {
		persistence.saveReplay("DrDr3ck/GuildeMarchande/RePlay");
	}
	*/
	console.log("keyCode", keyCode);
	// SPACE
	if (curState === TUTO_STATE && keyCode === 32) {
		guidedTour.nextStep();
	}
	if (curState === TUTO_STATE && keyCode === BACKSPACE) {
		// guidedTour.prevStep();
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
	overCoins = distance(1372, 569, mouseX, mouseY) < 40;
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
		connectedTrades = getConnectedTrades();
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

function computeTerres() {
	terres = [];
	// create an 2D array of cells:
	// true if cell is still free and not associated to a region
	const freeCells = [];
	for (let i = 0; i < 24; i++) {
		const columns = [];
		for (let j = 0; j < 15; j++) {
			columns.push(true);
		}
		freeCells.push(columns);
	}
	const getTerre = (x, y) => {
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
				if ([CARD.SAND, CARD.GRASSLAND, CARD.MOUNTAIN].includes(bcell.type)) {
					// add cell and mark it
					cells.push({ x: cell.x, y: cell.y });
					freeCells[cell.x][cell.y] = false;
				}
			});
			curIndex += 1;
		}
		return cells;
	};
	for (let i = 0; i < 24; i++) {
		for (let j = 0; j < 15; j++) {
			const cell = board[i][j];
			if (
				cell.type === null ||
				[CARD.SEA, CARD.TOWER, CARD.CAPITAL].includes(cell.type)
			) {
				continue;
			}
			if (!freeCells[i][j]) {
				// cell already associated to a terre
				continue;
			}
			// new terre
			const terre = { type: cell.type, cells: getTerre(i, j) };
			terres.push(terre);
		}
	}
}

function computeRegions() {
	regions = [];
	// create an 2D array of cells:
	// true if cell is still free and not associated to a region
	const freeCells = [];
	for (let i = 0; i < 24; i++) {
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
	for (let i = 0; i < 24; i++) {
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
	cristals = [];
	knownTrades = [];
	connectedTrades = [];
}

function initBoard(map = "avenia") {
	cubes = [];
	const setTresors = (tresorCoords, alpha = "ABCDEFGHIJ") => {
		for (let i = 0; i < tresorCoords.length - 1; i += 2) {
			board[tresorCoords[i]][tresorCoords[i + 1]].bonus = {
				type: "tresor",
				alpha: alpha[i / 2],
			};
		}
	};
	const setTrade = (x, y, nb) => {
		board[x][y].bonus = { type: "trade", nb: nb };
	};
	const setPieces = (pieceCoords, nb) => {
		for (let i = 0; i < pieceCoords.length - 1; i += 2) {
			board[pieceCoords[i]][pieceCoords[i + 1]].bonus = {
				type: "piece",
				nb: nb,
			};
		}
	};
	const setBoardRegion = (regionCoords, type) => {
		for (let i = 0; i < regionCoords.length - 1; i += 2) {
			board[regionCoords[i]][regionCoords[i + 1]].type = type;
		}
	};
	const setNullCells = (nullCoords) => {
		for (let i = 0; i < nullCoords.length - 1; i += 2) {
			board[nullCoords[i]][nullCoords[i + 1]].type = null;
		}
	};
	board = [];
	age = 1;
	PV = 0;
	PVHistory = [];
	PVTreasure = 0;
	blockGoalIndex = 0;
	let dx = 179 - 46.5 * 2;
	let dy = 169 - 54 * 2;
	if (map === "cnidaria") {
		dx -= 94;
		dy -= 55;
	}
	for (let i = 0; i < 24; i++) {
		const column = [];
		for (let j = 0; j < 15; j++) {
			column.push({
				center: { x: dx, y: dy + 54 * j + (i % 2) * 24 },
				type:
					i === 0 || i >= 19 || j === 0 || j === 14 || j === 13
						? null
						: CARD.SEA,
			});
		}
		dx += 46.5;
		dy += 0.2;
		board.push(column);
	}
	if (map === "avenia") {
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
	if (map === "kazan") {
		setNullCells([
			1, 1, 1, 2, 1, 9, 1, 10, 1, 11, 1, 12, 2, 1, 2, 2, 2, 10, 2, 11, 2, 12, 3,
			10, 3, 11, 3, 12, 4, 1, 4, 11, 4, 12, 5, 11, 5, 12, 6, 12, 7, 12, 8, 12,
			9, 11, 9, 12, 10, 12, 11, 11, 11, 12, 12, 12, 13, 11, 13, 12, 14, 12, 15,
			11, 15, 12, 16, 11, 16, 12, 17, 10, 17, 11, 17, 12, 18, 11, 18, 12, 16, 1,
			17, 1, 18, 1, 18, 2,
		]);
		setNullCells([
			6, 4, 6, 5, 7, 3, 7, 4, 7, 5, 12, 4, 12, 5, 13, 4, 13, 5, 13, 6, 14, 5,
			14, 6, 14, 7, 15, 6, 15, 7, 15, 8,
		]);
		setBoardRegion(
			[
				1, 3, 1, 4, 1, 5, 2, 3, 4, 10, 5, 9, 5, 10, 6, 11, 6, 8, 7, 8, 8, 8, 10,
				11, 11, 10, 12, 10, 11, 5, 11, 6, 12, 6, 12, 1, 12, 2, 13, 1, 14, 1, 14,
				4, 15, 4, 15, 5, 16, 6, 16, 7,
			],
			CARD.MOUNTAIN
		);
		setBoardRegion(
			[
				2, 4, 2, 5, 2, 6, 3, 3, 3, 4, 3, 7, 3, 8, 4, 7, 5, 7, 6, 6, 7, 6, 8, 6,
				9, 6, 10, 6, 7, 10, 8, 10, 8, 11, 9, 10, 12, 11, 13, 10, 14, 11, 15, 10,
				14, 2, 15, 1, 15, 2, 16, 3, 16, 5, 17, 5, 17, 6, 17, 7, 18, 6, 18, 7, 8,
				3, 9, 2, 10, 2, 10, 3, 11, 8, 11, 9, 12, 8, 13, 8, 9, 3,
			],
			CARD.GRASSLAND
		);
		setBoardRegion(
			[
				1, 8, 2, 8, 2, 9, 3, 9, 4, 9, 4, 8, 5, 8, 5, 6, 6, 7, 7, 7, 8, 7, 9, 7,
				3, 2, 4, 2, 5, 1, 6, 1, 6, 2, 7, 1, 8, 4, 8, 5, 9, 4, 9, 5, 11, 7, 12,
				7, 13, 7, 14, 8, 14, 9, 16, 2, 17, 2, 18, 3, 18, 4, 19, 3, 19, 4,
			],
			CARD.SAND
		);
		setBoardRegion([19, 5, 19, 6, 19, 7, 19, 8], CARD.SEA);
		setTrade(3, 4, 5);
		setTrade(7, 1, 3);
		setTrade(6, 7, 2);
		setTrade(8, 4, 2);
		setTrade(9, 10, 2);
		setTrade(13, 1, 3);
		setTrade(13, 10, 3);
		setTrade(19, 4, 4);
		setTrade(17, 6, 2);

		setTresors([
			1, 7, 6, 10, 7, 2, 10, 1, 10, 10, 11, 2, 11, 4, 15, 1, 18, 5, 19, 8,
		]);

		setPieces(
			[
				1, 5, 2, 3, 2, 8, 2, 9, 3, 7, 4, 8, 5, 1, 5, 9, 7, 7, 7, 8, 7, 6, 8, 6,
				9, 4, 11, 7, 13, 7, 13, 8, 14, 4, 15, 2, 16, 2, 16, 3, 12, 6,
			],
			1
		);
		setPieces(
			[
				1, 4, 2, 4, 5, 10, 6, 1, 8, 11, 11, 10, 14, 11, 16, 6, 16, 7, 18, 3, 18,
				6,
			],
			2
		);
		setPieces([10, 2, 15, 4, 15, 5], 3);
		setPieces([1, 3], 4);

		board[3][1].type = CARD.TOWER;
		board[17][3].type = CARD.TOWER;
		board[7][11].type = CARD.TOWER;
		board[18][10].type = CARD.TOWER;

		board[10][7].type = CARD.CAPITAL;
		ageExploration = [{ type: CARD.CAPITAL, x: 10, y: 7 }];

		exploredCards = [6, 7, 8];
	}
	if (map === "aghon") {
		board[1][1].type = null;
		board[2][1].type = null;
		board[2][2].type = null;
		board[1][2].type = null;
		board[4][1].type = null;
		board[1][9].type = null;
		board[1][10].type = null;
		board[1][11].type = null;
		board[1][12].type = null;
		board[2][10].type = null;
		board[2][11].type = null;
		board[2][12].type = null;
		board[3][11].type = null;
		board[3][12].type = null;
		board[4][11].type = null;
		board[4][12].type = null;
		board[5][11].type = null;
		board[5][12].type = null;
		board[6][12].type = null;
		board[7][11].type = null;
		board[7][12].type = null;
		board[8][12].type = null;
		board[9][11].type = null;
		board[9][12].type = null;
		board[10][12].type = null;
		board[11][11].type = null;
		board[11][12].type = null;
		board[12][12].type = null;
		board[13][11].type = null;
		board[13][12].type = null;
		board[14][12].type = null;
		board[15][11].type = null;
		board[15][12].type = null;
		board[16][11].type = null;
		board[16][12].type = null;
		board[17][11].type = null;
		board[17][12].type = null;
		board[18][10].type = null;
		board[18][12].type = null;
		board[18][11].type = null;
		board[16][1].type = null;
		board[18][1].type = null;
		board[18][2].type = null;

		board[19][7].type = CARD.SEA;
		board[19][8].type = CARD.SEA;

		setTresors([5, 1, 1, 7, 6, 10, 8, 8, 8, 4, 10, 1, 16, 3, 19, 7, 14, 11]);

		setTrade(5, 3, 3);
		setTrade(2, 9, 4);
		setTrade(6, 7, 2);
		setTrade(7, 10, 2);
		setTrade(8, 3, 2);
		setTrade(12, 1, 2);
		setTrade(13, 3, 3);
		setTrade(11, 10, 3);
		setTrade(18, 5, 4);

		setPieces(
			[
				4, 2, 5, 4, 7, 1, 7, 2, 3, 8, 8, 5, 4, 10, 5, 9, 5, 10, 9, 9, 10, 2, 10,
				4, 11, 3, 11, 6, 11, 9, 12, 2, 13, 5, 13, 10, 14, 1, 15, 1, 15, 5, 16,
				5, 17, 3, 17, 6, 17, 7, 19, 3, 19, 6,
			],
			1
		);
		setPieces(
			[
				1, 4, 1, 6, 1, 8, 2, 3, 3, 4, 8, 1, 14, 2, 13, 8, 15, 9, 16, 9, 17, 5,
				19, 5, 18, 3,
			],
			2
		);
		setPieces([1, 3, 3, 3], 3);

		setBoardRegion([3, 2, 4, 2, 5, 2, 5, 3, 5, 4], CARD.SAND);
		setBoardRegion([10, 2, 11, 1, 11, 2, 12, 1, 13, 1, 14, 1], CARD.SAND);
		setBoardRegion([17, 3, 18, 4, 19, 3], CARD.SAND);
		setBoardRegion([19, 6, 18, 7, 17, 7, 18, 8], CARD.SAND);
		setBoardRegion([15, 4, 15, 5, 15, 6], CARD.SAND);
		setBoardRegion([5, 6, 5, 7, 6, 7], CARD.SAND);
		setBoardRegion([8, 5, 9, 5, 9, 6, 8, 7], CARD.SAND);
		setBoardRegion([9, 9, 10, 10, 11, 9, 11, 10, 12, 11, 13, 10], CARD.SAND);

		setBoardRegion(
			[1, 6, 2, 6, 2, 7, 16, 5, 16, 6, 17, 6, 18, 6],
			CARD.GRASSLAND
		);
		setBoardRegion([7, 1, 7, 2, 7, 3, 8, 1, 8, 2, 8, 3, 7, 9], CARD.GRASSLAND);
		setBoardRegion([5, 9, 5, 10, 6, 11, 7, 10, 8, 11], CARD.GRASSLAND);
		setBoardRegion([11, 6, 12, 6, 12, 7, 13, 5], CARD.GRASSLAND);
		setBoardRegion(
			[11, 3, 11, 4, 12, 3, 13, 3, 14, 3, 15, 1, 16, 2, 17, 2, 18, 3],
			CARD.GRASSLAND
		);

		setBoardRegion(
			[1, 3, 1, 4, 1, 8, 2, 3, 2, 4, 2, 9, 3, 3, 3, 4, 3, 8, 3, 9, 4, 10],
			CARD.MOUNTAIN
		);
		setBoardRegion(
			[
				10, 3, 10, 4, 10, 5, 11, 5, 12, 2, 13, 2, 14, 2, 13, 8, 14, 8, 14, 9,
				15, 9, 16, 9, 17, 4, 17, 5, 18, 5, 19, 4, 19, 5,
			],
			CARD.MOUNTAIN
		);

		board[3][1].type = CARD.TOWER;
		board[17][1].type = CARD.TOWER;
		board[3][10].type = CARD.TOWER;
		board[17][10].type = CARD.TOWER;

		board[10][6].type = CARD.CAPITAL;
		ageExploration = [{ type: CARD.CAPITAL, x: 10, y: 6 }];

		exploredCards = [6, 7, 8];
	}
	if (map === "cnidaria") {
		setNullCells([
			1, 1, 1, 2, 1, 3, 1, 4, 1, 5, 1, 6, 1, 7, 1, 8, 1, 9, 1, 10, 1, 11, 1, 12,
			2, 1, 2, 2, 2, 4, 2, 5, 2, 6, 2, 7, 2, 8, 2, 9, 2, 10, 2, 11, 2, 12, 3,
			10, 3, 11, 3, 12, 4, 11, 4, 1, 4, 12, 5, 10, 5, 11, 5, 12, 6, 12, 6, 1, 7,
			1, 8, 1, 10, 1, 12, 1, 12, 2, 13, 1, 14, 1, 15, 1, 16, 1, 17, 1, 18, 1,
			18, 2, 12, 3, 12, 4, 7, 12, 9, 12, 11, 12, 13, 11, 14, 11, 14, 12, 15, 11,
			16, 11, 17, 11, 16, 12, 17, 12,
		]);

		setBoardRegion(
			[
				4, 2, 4, 3, 5, 2, 3, 6, 3, 7, 4, 6, 5, 6, 5, 7, 6, 11, 7, 9, 7, 10, 7,
				11, 9, 8, 10, 8, 11, 7, 11, 8, 14, 7, 15, 6, 15, 7, 16, 5, 17, 4, 18, 3,
				18, 4, 18, 5, 19, 9, 19, 10, 20, 11, 21, 11,
			],
			CARD.MOUNTAIN
		);
		setBoardRegion(
			[
				3, 1, 3, 2, 3, 3, 3, 5, 4, 5, 5, 5, 4, 9, 4, 10, 5, 1, 5, 8, 5, 9, 6, 2,
				6, 3, 8, 10, 8, 11, 9, 2, 9, 3, 9, 6, 9, 10, 10, 2, 10, 6, 10, 9, 11, 1,
				11, 9, 12, 8, 12, 9, 15, 3, 16, 3, 16, 4, 17, 2, 17, 3, 18, 12, 18, 13,
				19, 12, 20, 13, 21, 13, 19, 4, 19, 5, 19, 6, 20, 6, 20, 8, 20, 9, 20,
				10, 21, 9, 11, 5, 12, 6,
			],
			CARD.SAND
		);
		setBoardRegion(
			[
				3, 4, 4, 4, 5, 3, 4, 7, 4, 8, 3, 8, 3, 9, 7, 2, 7, 3, 8, 2, 8, 3, 8, 4,
				8, 6, 8, 7, 8, 8, 8, 12, 9, 7, 9, 11, 10, 12, 11, 11, 10, 7, 11, 6, 13,
				2, 13, 3, 14, 3, 15, 2, 16, 2, 14, 8, 15, 8, 14, 9, 13, 7, 19, 3, 20, 4,
				20, 5, 21, 4, 21, 5, 18, 9, 18, 10, 18, 11, 19, 11, 20, 12, 21, 12,
			],
			CARD.GRASSLAND
		);

		setTrade(8, 3, 4);
		setTrade(5, 8, 4);
		setTrade(14, 3, 4);
		setTrade(18, 12, 5);
		setTrade(11, 6, 2);
		setTrade(13, 7, 2);

		setPieces(
			[
				3, 4, 4, 5, 5, 6, 7, 2, 7, 9, 8, 2, 8, 6, 8, 8, 9, 11, 10, 9, 11, 3, 11,
				5, 11, 7, 11, 9, 13, 2, 13, 10, 14, 7, 14, 8, 16, 4, 19, 3, 19, 6, 18,
				11,
			],
			1
		);
		setPieces(
			[
				3, 1, 3, 6, 3, 7, 3, 8, 3, 9, 4, 2, 4, 10, 5, 1, 7, 10, 9, 8, 11, 1, 10,
				12, 14, 5, 17, 4, 18, 5, 20, 6, 20, 8, 20, 11, 21, 11, 18, 13, 18, 9,
			],
			2
		);

		setTresors(
			[5, 4, 7, 11, 10, 3, 13, 12, 14, 13, 15, 10, 17, 2, 19, 7, 21, 4, 21, 13],
			"CRRCTCTRRT"
		);

		board[19][8].type = CARD.SEA;
		board[14][13].type = CARD.SEA;
		board[19][7].type = CARD.SEA;

		board[9][1].type = CARD.CRISTAL;
		board[9][1].bonus = { type: CARD.CRISTAL, nb: 3 };
		board[14][2].type = CARD.CRISTAL;
		board[14][2].bonus = { type: CARD.CRISTAL, nb: 2 };
		board[13][8].type = CARD.CRISTAL;
		board[13][8].bonus = { type: CARD.CRISTAL, nb: 1 };
		board[19][13].type = CARD.CRISTAL;
		board[19][13].bonus = { type: CARD.CRISTAL, nb: 4 };

		board[2][3].type = CARD.TOWER;
		board[19][2].type = CARD.TOWER;
		board[22][10].type = CARD.TOWER;
		board[15][12].type = CARD.TOWER;

		board[12][7].type = CARD.CAPITAL;
		ageExploration = [{ type: CARD.CAPITAL, x: 12, y: 7 }];

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

	computeTerres();
	expectLength(terres, 6, "error in computeTerres");

	ageExploration[0].x = 11;
	ageExploration[0].y = 5;
	setConstraint(CONSTRAINT.FREE);
	addCube2Play(CARD.GRASSLAND, 4);
	addCube2Play(CARD.SAND, 2);
	addCube(12, 5);
	addCube(12, 6);
	addCube(12, 7);
	transformCubeToVillage(12, 7);
	addCube(11, 7);
	addCube(10, 8);
	addCube(9, 8);
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
		!checkConsecutiveCubes([
			{ x: 12, y: 5 },
			{ x: 12, y: 6 },
			{ x: 15, y: 6 },
			{ x: 13, y: 5 },
			{ x: 14, y: 6 },
		]),
		"error in checkConsecutiveCubes 3"
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

	expect(hasAllTypedRuins(), "error in hasAllTypedRuins 1");
	ruins = [
		{ x: 18, y: 5 },
		{ x: 8, y: 2 },
	];
	expect(!hasAllTypedRuins(), "error in hasAllTypedRuins 2");

	expect(
		!hasVillageNextToRuin(getVillages()),
		"error in hasVillageNextToRuin 1"
	);
	ageExploration[0].x = 6;
	ageExploration[0].y = 3;
	addCube(7, 2);
	transformCubeToVillage(7, 2);
	expect(
		hasVillageNextToRuin(getVillages()),
		"error in hasVillageNextToRuin 2"
	);
}

test();
