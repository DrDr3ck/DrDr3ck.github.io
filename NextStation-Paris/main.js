const uiManager = new UIManager();
const windowWidth = 1500;
const windowHeight = 800;
uiManager.loggerContainer = new LoggerContainer(
	windowWidth - 500,
	windowHeight - 500,
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

let message = null;

let randomizer = null;

let useSwitch = false;
let withMonument = false;
let withMonumentBorder = false;

let stationLine = [];
const allStationLines = [];

let over = {};
let clickedStation = null;

let pencils = [COLORS.GREEN, COLORS.BLUE, COLORS.ORANGE, COLORS.PURPLE];

let round = 0;

let cardArray = [];

function getRandomStation() {
	const names = [
		"Abbesses",
		"Alexandre Dumas",
		"Alésia",
		"Alma - Marceau",
		"Anatole France",
		"Anvers",
		"Argentine",
		"Arts et Métiers",
		"Assemblée Nationale",
		"Aubervilliers - Pantin - Quatre Chemins",
		"Avenue Émile Zola",
		"Avron",
		"Balard",
		"Barbès - Rochechouart",
		"Basilique de Saint-Denis",
		"Bastille",
		"Belleville",
		"Bel-Air",
		"Bérault",
		"Bercy",
		"Billancourt",
		"Bir-Hakeim",
		"Blanche",
		"Bobigny - Pantin - Raymond Queneau",
		"Bobigny - Pablo Picasso",
		"Boissière",
		"Bolivar",
		"Bonne Nouvelle",
		"Boulogne - Jean Jaurès",
		"Boulogne - Pont de Saint-Cloud",
		"Bourse",
		"Brochant",
		"Bréguet - Sabin",
		"Buzenval",
		"Cadet",
		"Cambronne",
		"Campo-Formio",
		"Cardinal Lemoine",
		"Carrefour Pleyel",
		"Charles de Gaulle - Étoile",
		"Charles Michels",
		"Chardon-Lagache",
		"Charenton - Écoles",
		"Charonne",
		"Château d'Eau",
		"Château de Vincennes",
		"Château-Landon",
		"Château Rouge",
		"Châtelet",
		"Châtillon - Montrouge",
		"Chaussée d'Antin - La Fayette",
		"Chemin Vert",
		"Chevaleret",
		"Cité",
		"Cluny - La Sorbonne",
		"Colonel Fabien",
		"Commerce",
		"Concorde",
		"Corentin Cariou",
		"Corentin Celton",
		"Corvisart",
		"Cour Saint-Émilion",
		"Courcelles",
		"Couronnes",
		"Créteil - L'Échat",
		"Créteil - Pointe du Lac",
		"Créteil - Préfecture",
		"Créteil - Université",
		"Crimée",
		"Croix de Chavaux",
		"Dausmenil",
		"Daumesnil",
		"Denfert-Rochereau",
		"Dugommier",
		"Dupleix",
		"Duroc",
		"École Militaire",
		"École Vétérinaire de Maisons-Alfort",
		"Église d'Auteuil",
		"Église de Pantin",
		"Esplanade de La Défense",
		"Exelmans",
		"Faidherbe - Chaligny",
		"Falguière",
		"Félix Faure",
		"Filles du Calvaire",
		"Fort d'Aubervilliers",
		"Franklin D. Roosevelt",
		"Front Populaire",
		"Gabriel Péri",
		"Gaîté",
		"Gallieni",
		"Gambetta",
		"Garibaldi",
		"Gare d'Austerlitz",
		"Gare de l'Est",
		"Gare de Lyon",
		"Gare du Nord",
		"George V",
		"Glacière",
		"Goncourt",
		"Grands Boulevards",
		"Guy Môquet",
		"Havre - Caumartin",
		"Hoche",
		"Hôtel de Ville",
		"Iéna",
		"Invalides",
		"Jasmin",
		"Jaurès",
		"Javel - André Citroën",
		"Jourdain",
		"Jules Joffrin",
		"Jussieu",
		"Kléber",
		"La Chapelle",
		"La Courneuve - 8 Mai 1945",
		"La Défense",
		"La Fourche",
		"La Motte-Picquet - Grenelle",
		"La Muette",
		"La Tour-Maubourg",
		"Lamarck - Caulaincourt",
		"Laumière",
		"Le Kremlin-Bicêtre",
		"Le Peletier",
		"Ledru-Rollin",
		"Les Agnettes",
		"Les Courtilles",
		"Les Gobelins",
		"Les Halles",
		"Les Sablons",
		"Liberté",
		"Liège",
		"Louis Blanc",
		"Louise Michel",
		"Lourmel",
		"Louvre - Rivoli",
		"Mabillon",
		"Madeleine",
		"Maison Blanche",
		"Maisons-Alfort - Les Juilliottes",
		"Maisons-Alfort - Stade",
		"Malesherbes",
		"Malakoff - Plateau de Vanves",
		"Malakoff - Rue Étienne Dolet",
		"Maraîchers",
		"Marcadet - Poissonniers",
		"Marcel Sembat",
		"Marx Dormoy",
		"Maubert - Mutualité",
		"Ménilmontant",
		"Miromesnil",
		"Michel-Ange - Auteuil",
		"Michel-Ange - Molitor",
		"Michel Bizot",
		"Mirabeau",
		"Monceau",
		"Montgallet",
		"Montparnasse - Bienvenue",
		"Mouton-Duvernet",
		"Nation",
		"Nationale",
		"Notre-Dame-de-Lorette",
		"Notre-Dame-des-Champs",
		"Oberkampf",
		"Odéon",
		"Olympiades",
		"Opéra",
		"Ourcq",
		"Palais Royal - Musée du Louvre",
		"Parmentier",
		"Passy",
		"Pasteur",
		"Pelleport",
		"Pereire",
		"Père Lachaise",
		"Philippe Auguste",
		"Picpus",
		"Pierre et Marie Curie",
		"Pigalle",
		"Place d'Italie",
		"Place Monge",
		"Place des Fêtes",
		"Place de Clichy",
		"Plaisance",
		"Plaisir - Grignon",
		"Plaisir - Les Clayes",
		"Poissonnière",
		"Pont de Levallois - Bécon",
		"Pont de Neuilly",
		"Pont de Sèvres",
		"Pont Marie",
		"Pont Neuf",
		"Porte Dauphine",
		"Porte de Bagnolet",
		"Porte de Champerret",
		"Porte de Charenton",
		"Porte de Choisy",
		"Porte de Clichy",
		"Porte de Clignancourt",
		"Porte de Montreuil",
		"Porte de Pantin",
		"Porte de Saint-Cloud",
		"Porte de Vanves",
		"Porte de Versailles",
		"Porte de Vincennes",
		"Porte des Lilas",
		"Porte d'Auteuil",
		"Porte d'Ivry",
		"Porte d'Orléans",
		"Porte Maillot",
		"Porte de la Chapelle",
		"Porte de la Villette",
		"Porte de la Muette",
		"Porte des Ternes",
		"Porte d'Aubervilliers",
		"Porte de Montrouge",
		"Porte de Clignancourt",
		"Pré-Saint-Gervais",
		"Pyramides",
		"Quai de la Gare",
		"Quai de la Rapée",
		"Quatre-Septembre",
		"Rambuteau",
		"Ranelagh",
		"Raspail",
		"Réaumur - Sébastopol",
		"République",
		"Reuilly - Diderot",
		"Richard-Lenoir",
		"Richelieu - Drouot",
		"Riquet",
		"Robespierre",
		"Rome",
		"Rue de la Pompe",
		"Rue du Bac",
		"Rue Saint-Maur",
		"Sablons",
		"Saint-Ambroise",
		"Saint-Augustin",
		"Saint-Denis - Porte de Paris",
		"Saint-Denis - Université",
		"Saint-Fargeau",
		"Saint-François-Xavier",
		"Saint-Georges",
		"Saint-Germain-des-Prés",
		"Saint-Jacques",
		"Saint-Lazare",
		"Saint-Mandé",
		"Saint-Marcel",
		"Saint-Michel",
		"Saint-Ouen",
		"Saint-Paul",
		"Saint-Philippe du Roule",
		"Saint-Placide",
		"Saint-Sébastien - Froissart",
		"Saint-Sulpice",
		"Saint-Maur",
		"Sèvres - Babylone",
		"Sèvres - Lecourbe",
		"Simplon",
		"Strasbourg - Saint-Denis",
		"Sully - Morland",
		"Télégraphe",
		"Temple",
		"Ternes",
		"Tolbiac",
		"Trinité - d'Estienne d'Orves",
		"Trocadéro",
		"Tuileries",
		"Vaneau",
		"Varenne",
		"Vavin",
		"Vaugirard",
		"Vaugirard (Adolphe Chérioux)",
		"Vélizy 2",
		"Versailles Rive Gauche",
		"Villejuif - Léo Lagrange",
		"Villejuif - Louis Aragon",
		"Villejuif - Paul Vaillant-Couturier",
		"Villiers",
		"Volontaires",
		"Voltaire",
		"Wagram",
	];

	const name = names[Math.floor(Math.random() * names.length)];
	// seed = "ParisJO"; // switch0: ParisJO2024 switch1: Paris switch2: ParisJO
	// return "ParisJO";
	return name;
}

const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
let seed = urlParams.get("seed");
if (!seed) {
	seed = getRandomStation().replaceAll(" ", "_");
}

const scoreUI = {
	lines: [
		{
			districts: {
				topLeft: { x: 861, y: 513 },
				bottomRight: { x: 903, y: 550 },
			},
			stations: {
				topLeft: { x: 861, y: 570 },
				bottomRight: { x: 903, y: 607 },
			},
			monuments: {
				topLeft: { x: 861, y: 625 },
				bottomRight: { x: 903, y: 665 },
			},
		},
		{
			districts: {
				topLeft: { x: 920, y: 513 },
				bottomRight: { x: 960, y: 550 },
			},
			stations: {
				topLeft: { x: 920, y: 570 },
				bottomRight: { x: 960, y: 607 },
			},
			monuments: {
				topLeft: { x: 920, y: 625 },
				bottomRight: { x: 960, y: 665 },
			},
		},
		{
			districts: {
				topLeft: { x: 980, y: 513 },
				bottomRight: { x: 1017, y: 550 },
			},
			stations: {
				topLeft: { x: 980, y: 570 },
				bottomRight: { x: 1017, y: 607 },
			},
			monuments: {
				topLeft: { x: 980, y: 625 },
				bottomRight: { x: 1017, y: 665 },
			},
		},
		{
			districts: {
				topLeft: { x: 1036, y: 513 },
				bottomRight: { x: 1076, y: 550 },
			},
			stations: {
				topLeft: { x: 1036, y: 570 },
				bottomRight: { x: 1076, y: 607 },
			},
			monuments: {
				topLeft: { x: 1036, y: 625 },
				bottomRight: { x: 1076, y: 665 },
			},
		},
	],
	links: {
		two: { topLeft: { x: 1159, y: 513 }, bottomRight: { x: 1198, y: 550 } },
		three: { topLeft: { x: 1159, y: 570 }, bottomRight: { x: 1198, y: 607 } },
		four: { topLeft: { x: 1159, y: 625 }, bottomRight: { x: 1198, y: 665 } },
	},
	overheads: {
		one: { topLeft: { x: 1035, y: 739 }, bottomRight: { x: 1074, y: 772 } },
		two: { topLeft: { x: 1158, y: 739 }, bottomRight: { x: 1198, y: 772 } },
	},
};

function preload() {}

function musicClicked() {}

const speakerStorageKey = "DrDr3ck/GameEngine/Speaker";
function speakerClicked() {
	speakerButton.checked = !speakerButton.checked;
	soundManager.mute(!speakerButton.checked);
	localStorage.setItem(speakerStorageKey, speakerButton.checked ? "on" : "off");
}

function resetSeed() {
	seed = getRandomStation().replaceAll(" ", "_");
}

function getUrl(base = false) {
	if (base) {
		const url = document.location.toString();
		const lastIndex = url.lastIndexOf("/");
		if (lastIndex > 0) {
			return url.substring(0, lastIndex);
		}
	}
	if (document.location.toString().includes("seed=")) {
		return `${document.location.toString()}`;
	}
	if (document.location.toString().includes("index.html")) {
		return `${document.location.toString()}?seed=${seed}`;
	}
	return `${document.location.toString()}index.html?seed=${seed}`;
}

function startClicked() {
	document.location.href = getUrl();
}

function startGame() {
	curState = GAME_PLAY_STATE;
	uiManager.setUI([speakerButton, musicButton]);
	uiManager.addLogger("Start game");
	randomizer = new Randomizer(seed);
	randomizer.shuffleArray(cardArray);

	randomizer.shuffleArray(pencils);
	randomizer.shuffleArray(cards);

	startLine();
}

const speakerButton = new BFloatingSwitchButton(
	windowWidth - 70,
	70 + 10 + 70,
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
	850,
	windowHeight - 50 - 200,
	"START",
	startClicked
);
const resetSeedButton = new BButton(
	850,
	windowHeight - 50,
	"Reset seed",
	resetSeed
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
	resetSeedButton.setTextSize(32);
	resetSeedButton.w = 200;
	const menu = [speakerButton, startButton, musicButton, resetSeedButton];
	uiManager.setUI(menu);
}

function setup() {
	initUI();
	canvas = createCanvas(windowWidth, windowHeight);
	canvas.parent("canvas");

	spritesheet.addSpriteSheet("paris", "./paris.png", 770, 765);
	spritesheet.addSpriteSheet("score", "./score.png", 615, 315);
	spritesheet.addSpriteSheet("cards", "./cards.png", 325, 210);
	spritesheet.addSpriteSheet("mini", "./mini.png", 81, 81);
	spritesheet.addSpriteSheet("skip", "./skip.png", 100, 100);
	spritesheet.addSpriteSheet("switch", "./switch.png", 131, 131);
	spritesheet.addSpriteSheet("crayons", "./crayons.png", 93, 93);

	soundManager.addSound("take_card", "./take_card.mp3", 1);
	soundManager.addSound("error", "./error.wav", 1);
	soundManager.addSound("next_round", "./next_round.wav", 1);
	soundManager.addSound("validate", "./validate.wav", 1);

	frameRate(15);

	lastTime = Date.now();
}

function updateGame(elapsedTime) {}

function getX(x) {
	return (x - 1) * ((747 - 53) / 9) + 53;
}

function getY(y) {
	return (y - 1) * ((747 - 53) / 9) + 50;
}

function startLine() {
	// which color for current line ?
	switch (pencils[round]) {
		case COLORS.GREEN:
			stationLine = [getStation(stations, 3, 7)];
			break;
		case COLORS.BLUE:
			stationLine = [getStation(stations, 4, 3)];
			break;
		case COLORS.ORANGE:
			stationLine = [getStation(stations, 8, 4)];
			break;
		case COLORS.PURPLE:
			stationLine = [getStation(stations, 8, 8)];
			break;
	}
	allStationLines.push({ color: pencils[round], line: stationLine });
	// check if first card is the 'switch' !!
	if (cards[0].switch) {
		nextCard();
		useSwitch = true;
	}
	// check if first card may start with a monument (remark: it will never be used)
	if (cards[0].monument) {
		withMonument = true;
	}
}

// display district for beginner
function displayDistrict(district) {
	noFill();
	stroke(0);
	strokeWeight(2);
	if (district === 1) {
		beginShape();
		vertex(20, 23);
		vertex(80, 23);
		vertex(80, 74);
		vertex(20, 74);
		endShape(CLOSE);
	}
	if (district === 2) {
		beginShape();
		vertex(720, 26);
		vertex(777, 26);
		vertex(777, 74);
		vertex(720, 74);
		endShape(CLOSE);
	}
	if (district === 3) {
		beginShape();
		vertex(20, 713);
		vertex(84, 713);
		vertex(84, 770);
		vertex(20, 770);
		endShape(CLOSE);
	}
	if (district === 4) {
		beginShape();
		vertex(720, 428);
		vertex(777, 428);
		vertex(777, 769);
		vertex(720, 769);
		endShape(CLOSE);
	}
	if (district === 5) {
		beginShape();
		vertex(20, 92);
		vertex(100, 92);
		vertex(100, 23);
		vertex(390, 23);
		vertex(390, 153);
		vertex(20, 153);
		endShape(CLOSE);
	}
	if (district === 6) {
		beginShape();
		vertex(415, 23);
		vertex(700, 23);
		vertex(700, 92);
		vertex(770, 92);
		vertex(770, 153);
		vertex(415, 153);
		endShape(CLOSE);
	}
	if (district === 7) {
		beginShape();
		vertex(20, 175);
		vertex(390, 175);
		vertex(390, 308);
		vertex(308, 308);
		vertex(308, 383);
		vertex(20, 383);
		endShape(CLOSE);
	}
	if (district === 8) {
		beginShape();
		vertex(415, 175);
		vertex(770, 175);
		vertex(770, 383);
		vertex(493, 383);
		vertex(493, 308);
		vertex(415, 308);
		endShape(CLOSE);
	}
	if (district === 9) {
		beginShape();
		vertex(20, 408);
		vertex(312, 408);
		vertex(312, 485);
		vertex(390, 485);
		vertex(390, 615);
		vertex(20, 615);
		endShape(CLOSE);
	}
	if (district === 10) {
		beginShape();
		vertex(415, 485);
		vertex(493, 485);
		vertex(493, 410);
		vertex(773, 410);
		vertex(773, 615);
		vertex(415, 615);
		endShape(CLOSE);
	}
	if (district === 11) {
		beginShape();
		vertex(20, 638);
		vertex(390, 638);
		vertex(390, 770);
		vertex(100, 770);
		vertex(100, 693);
		vertex(20, 693);
		endShape(CLOSE);
	}
	if (district === 12) {
		beginShape();
		vertex(410, 638);
		vertex(773, 638);
		vertex(773, 693);
		vertex(695, 693);
		vertex(695, 770);
		vertex(410, 770);
		endShape(CLOSE);
	}
	if (district === 13) {
		beginShape();
		vertex(337, 331);
		vertex(463, 331);
		vertex(463, 460);
		vertex(337, 460);
		endShape(CLOSE);
	}
}

function displayOverHead(overhead) {
	noFill();
	strokeWeight(7);
	stroke(110, 160, 130, 128);
	displaySection(overhead.sections[0]);
	displaySection(overhead.sections[1]);
}

function displayOverHeads(overheadType) {
	if (!overheadType) {
		return;
	}
	const typedOverheads = getOverHeads(overheadType);
	typedOverheads.forEach((overhead) => displayOverHead(overhead));
}

function displayLinks(linkType) {
	if (!linkType) {
		return;
	}
	const links = getLinks(linkType);
	links.forEach((station) => displayStation(station, "black"));
}

function displayMonuments(monumentColor) {
	if (!monumentColor) {
		return;
	}
	const coloredLine = allStationLines.find(
		(line) => line.color == monumentColor
	);
	if (coloredLine) {
		const stations = getMonuments(coloredLine.line);
		stations.forEach((station) => displayStation(station, "black"));
	}
}

function displayStations(stationColor) {
	if (!stationColor) {
		return;
	}
	const coloredLine = allStationLines.find(
		(line) => line.color == stationColor
	);
	if (coloredLine) {
		const stations = getMaxStations(coloredLine.line);
		stations.forEach((station) => displayStation(station, "black"));
		const district = stations[0].district;
		displayDistrict(district);
	}
}

function displayDistricts(districtColor) {
	if (!districtColor) {
		return;
	}
	const coloredLine = allStationLines.find(
		(line) => line.color == districtColor
	);
	if (coloredLine) {
		const districts = getCrossedDistricts(coloredLine.line);
		districts.forEach((district) => displayDistrict(district));
	}
}

function displayStation(station, lineColor) {
	if (!station) {
		return;
	}
	stroke(110, 160, 130);
	const color = lineColor ?? station.color;
	if (color === COLORS.BLUE) {
		stroke(50, 50, 130);
	} else if (color === COLORS.ORANGE) {
		stroke(255, 127, 80);
	} else if (color === COLORS.GREEN) {
		stroke(127, 255, 80);
	} else if (color === COLORS.PURPLE) {
		stroke(127, 0, 127);
	}
	strokeWeight(5);
	if (station.monument && !lineColor) {
		fill(160, 110, 130);
	} else {
		noFill();
	}
	const X = station.district === 13 ? getX(5.5) : getX(station.position.x);
	const Y = station.district === 13 ? getY(5.5) : getY(station.position.y);
	ellipse(X, Y, station.district === 13 ? 145 : 45);
	if (!lineColor) {
		if (station.symbol === SHAPES.SQUARE) {
			square(X - 10, Y - 10, 20);
		} else if (station.symbol === SHAPES.CIRCLE) {
			ellipse(X, Y, 20);
		} else if (station.symbol === SHAPES.TRIANGLE) {
			triangle(X, Y - 10, X - 10, Y + 10, X + 10, Y + 10);
		} else if (station.symbol === SHAPES.PENTAGONE) {
			beginShape();
			vertex(X, Y - 10);
			vertex(X + 10, Y - 5);
			vertex(X + 5, Y + 10);
			vertex(X - 5, Y + 10);
			vertex(X - 10, Y - 5);
			endShape(CLOSE);
		}
		textAlign(CENTER, CENTER);
		stroke(0);
		strokeWeight(1);
		fill(0);
		textSize(15);
		//text(station.district, X, Y);
		text(`${station.position.x},${station.position.y}`, X, Y);
	}
}

function displaySection(section) {
	line(
		getX(section.stations[0].position.x),
		getY(section.stations[0].position.y),
		getX(section.stations[1].position.x),
		getY(section.stations[1].position.y)
	);
}

function displayPencil() {
	// COLORS.GREEN, COLORS.BLUE, COLORS.ORANGE, COLORS.PURPLE
	switch (pencils[round]) {
		case COLORS.GREEN:
			spritesheet.drawSprite("crayons", 0, 1200, 120);
			break;
		case COLORS.BLUE:
			spritesheet.drawSprite("crayons", 1, 1200, 120);
			break;
		case COLORS.ORANGE:
			spritesheet.drawSprite("crayons", 2, 1200, 120);
			break;
		case COLORS.PURPLE:
			spritesheet.drawSprite("crayons", 3, 1200, 120);
			break;
	}
}

function getRGBColor(color = null) {
	switch (color ?? pencils[round]) {
		case COLORS.GREEN:
			return [5, 134, 62];
		case COLORS.BLUE:
			return [0, 164, 227];
		case COLORS.ORANGE:
			return [235, 92, 43];
		case COLORS.PURPLE:
			return [146, 101, 168];
	}
}

let stations = [];
let sections = [];
let overheads = [];
let points = [];

let cards = [];
let countUnderground = 0;

function displayLines() {
	allStationLines.forEach((cur, index) =>
		displayLine(cur.color, cur.line, allStationLines.length === index + 1)
	);
}

const getSections = (line, color) => {
	const sections = [];
	line.forEach((station) => {
		for (const section of station.sections) {
			if (section.color === color && !sections.includes(section)) {
				sections.push(section);
			}
		}
	});
	return sections;
};

function displayLine(color, line, lastLine) {
	if (lastLine) {
		line.forEach((station) => displayStation(station, color));
	}
	const sections = getSections(line, color);
	strokeWeight(3);
	const colors = getRGBColor(color);
	stroke(colors[0], colors[1], colors[2]);
	sections.forEach((section) => displaySection(section));
}

function getOverHeads(num) {
	const overheadsNum = [];
	overheads.forEach((overhead) => {
		if (num === 1) {
			if (overhead.sections[0].color && !overhead.sections[1].color) {
				overheadsNum.push(overhead);
			} else if (!overhead.sections[0].color && overhead.sections[1].color) {
				overheadsNum.push(overhead);
			}
		} else {
			// num === 2
			if (
				overhead.sections[0].color &&
				overhead.sections[1].color &&
				num === 2
			) {
				overheadsNum.push(overhead);
			}
		}
	});
	return overheadsNum;
}

function countLink(station) {
	const allLines = [];
	// special case with central station !!
	let linkSections = station.sections;
	if (station.district === 13) {
		let s = getStation(stations, 5, 5);
		linkSections = s.sections;
		s = getStation(stations, 6, 5);
		linkSections.push(...s.sections);
		s = getStation(stations, 5, 6);
		linkSections.push(...s.sections);
		s = getStation(stations, 6, 6);
		linkSections.push(...s.sections);
	}
	linkSections.forEach((section) => {
		if (section.color && !allLines.includes(section.color)) {
			allLines.push(section.color);
		}
	});
	return allLines.length;
}

function getLinks(num) {
	const links = [];
	allStationLines.forEach((line) => {
		line.line.forEach((station) => {
			if (station.district === 13) {
				station = getStation(stations, 5, 5);
			}
			if (countLink(station) === num && !links.includes(station)) {
				links.push(station);
			}
		});
	});
	return links;
}

function getCrossedDistricts(stationLine) {
	const districts = [];
	stationLine.forEach((station) => {
		const district = station.district;
		if (!districts.includes(district)) {
			districts.push(district);
		}
	});
	return districts;
}
function getMaxStations(stationLine) {
	const districts = [[], [], [], [], [], [], [], [], [], [], [], [], [], []];
	stationLine.forEach((station) => {
		const district = station.district;
		// special case for district 13: only 1 station !!
		if (
			(district === 13 && districts[district].length === 0) ||
			district !== 13
		) {
			districts[district].push(station);
		}
	});
	return districts.reduce((previous, cur) => {
		if (cur.length > previous.length) {
			return cur;
		}
		return previous;
	}, []);
}

function getMonuments(stationLine) {
	const monuments = [];
	stationLine.forEach((station) => {
		if (station.monument) {
			monuments.push(station);
		}
	});
	return monuments;
}

function drawScore() {
	textAlign(CENTER, CENTER);
	strokeWeight(1);
	textSize(20);
	let total = 0;
	allStationLines.forEach((cur, index) => {
		const colors = getRGBColor(cur.color);
		stroke(colors[0], colors[1], colors[2]);
		fill(colors[0], colors[1], colors[2]);
		const districs = getCrossedDistricts(cur.line).length;
		const maxStation = getMaxStations(cur.line).length;
		const monument = getMonuments(cur.line).length;
		const Xs = [881, 939, 997, 1056];
		const X = Xs[index];
		text(districs, X, 400 + 135);
		text(maxStation, X, 455 + 135);
		text(monument, X, 510 + 135);
		total += districs * maxStation + monument * 2;
		text(districs * maxStation + monument * 2, X, 565 + 135);
	});
	// total station lines
	text(total, 1115, 700);

	// overhead
	const overhead2 = getOverHeads(1).length;
	const overhead6 = getOverHeads(2).length;
	text(overhead2, 1056, 755);
	text(overhead6, 1178, 755);

	text(overhead2 * 2 + overhead6 * 6, 1178, 700);
	total += overhead2 * 2 + overhead6 * 6;

	// links
	const link2 = getLinks(2).length;
	const link5 = getLinks(3).length;
	const link9 = getLinks(4).length;

	text(link2, 1179, 536);
	text(link5, 1179, 590);
	text(link9, 1179, 644);

	text(link2 * 2, 1243, 536);
	text(link5 * 5, 1243, 590);
	text(link9 * 9, 1243, 644);

	text(link2 * 2 + link5 * 5 + link9 * 9, 1242, 700);
	total += link2 * 2 + link5 * 5 + link9 * 9;
	// grand total
	text(total, 1280, 755);
}

function drawLine(station) {
	const X = getX(station.position.x);
	const Y = getY(station.position.y);
	const colors = getRGBColor();
	stroke(colors[0], colors[1], colors[2]);
	strokeWeight(3);
	line(X, Y, mouseX, mouseY);
}

function displayCard() {
	if (round === 4) {
		// end of game
		spritesheet.drawSprite("cards", 0, 815, 15);
		return;
	}
	spritesheet.drawSprite("cards", cards[0].index, 815, 15);
	if (cards[0].color === CARDS.UNDERGROUND && countUnderground === 4) {
		// last card for this round
		noFill();
		stroke(204, 204, 0);
		strokeWeight(8);
		rect(815, 15, 325, 210, 25);
	}
	if (useSwitch) {
		spritesheet.drawScaledSprite("switch", 0, 1080, 160, 0.8);
	}

	const indices = cards.map((c) => c.index);
	for (let i = 1; i <= 11; i++) {
		spritesheet.drawScaledSprite("mini", i, 1363, -50 + 70 * i, 0.8);
		if (!indices.includes(i) && (i !== 6 || !useSwitch)) {
			spritesheet.drawScaledSprite("mini", 0, 1363, -50 + 70 * i, 0.8);
		}
	}
}

function drawGame() {
	if (message !== null) {
		uiManager.addLogger(message);
		message = null;
	}
	spritesheet.drawSprite("paris", 0, 15, 15);
	const scoreScale = 0.9;
	spritesheet.drawScaledSprite(
		"score",
		0,
		windowWidth - 615 * scoreScale - 145,
		windowHeight - 315 * scoreScale - 15,
		scoreScale
	);
	drawScore();

	displayCard();

	if (round !== 4) {
		displayPencil();
	}

	displayLines();

	displayStation(over.station, pencils[round]);

	// for beginner
	displayDistricts(over.districts);
	displayStations(over.stations);
	displayMonuments(over.monuments);
	displayLinks(over.links);
	displayOverHeads(over.overheads);
	// end beginner

	if (clickedStation) {
		drawLine(clickedStation);
	}

	const rgb = getRGBColor();
	if (rgb) {
		noFill();
		strokeWeight(10);
		stroke(rgb[0], rgb[1], rgb[2]);
		rect(0, 0, width, height);
	}

	/*
	// debug
	stroke(80);
	strokeWeight(2);
	noFill();
	sections.forEach((element) => {
		displaySection(element);
	});
	stations.forEach((element) => {
		displayStation(element, null);
	});
	overheads.forEach((element) => {
		displayOverHead(element);
	});
	points.forEach((point) => ellipse(getX(point.x), getY(point.y), 25));
	// end debug
	*/
}

function initGame() {
	const map = buildMap();
	stations = map.stations;
	sections = map.sections;
	overheads = map.overheads;
	points = map.intersects;

	cards = getCards();

	// debug
	//startClicked();
}

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
		if (document.location.toString().includes("seed=")) {
			startGame();
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
		spritesheet.drawSprite("paris", 0, 15, 15);

		spritesheet.drawSprite("cards", 0, 815, 15);

		fill(250);
		textSize(25);
		text("Station:", 850, 620);
		textSize(15);
		text(seed.replaceAll("_", " "), 850, 660);

		text(
			"Ce jeu n'est pas sponsorisé par blue orange mais produit par un fan",
			640,
			792
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

function getBorderStations(line) {
	const border = [];
	if (withMonumentBorder) {
		// only put last station that is the monument
		border.push(line[line.length - 1]);
	} else {
		line.forEach((station) => {
			if (useSwitch || station.onBorder(pencils[round])) {
				border.push(station);
			}
		});
	}
	if (border.some((b) => b.district === 13)) {
		// add all station from district 13
		border.push(getStation(stations, 5, 5));
		border.push(getStation(stations, 6, 5));
		border.push(getStation(stations, 5, 6));
		border.push(getStation(stations, 6, 6));
	}
	return border;
}

// check if station is clickable.
// for first station, it should be a station that is at an end of the line
// for second station, it should be a station that has a section with clickedStation
// + section that is not crossing another already drawn section
// + no loop
function isClickable(station) {
	if (!clickedStation) {
		// first station
		const stations = getBorderStations(stationLine);
		if (stations.includes(station)) {
			return true;
		}
		message = "Cannot start with this station";
		return false;
	}
	// second station
	if (!station.hasSameSymbol(cards[0].symbol)) {
		message = "Wrong shape";
		return false;
	}
	// check if a section exists between the two stations
	const section = findSection(sections, clickedStation, station);
	if (!section) {
		message = "No Section between the 2 stations";
		return false;
	}
	// check if no loop
	if (station.usedBy(pencils[round])) {
		message = "No loop";
		return false;
	}
	// check if section is not already crossed by another section
	if (section.isCrossed()) {
		message = "Cannot cross an existing section";
		return false;
	}
	return true;
}

function nextRound() {
	round++;
	cards = getCards();
	countUnderground = 0;
	if (round !== 4) {
		soundManager.playSound("next_round");
		// otherwise: end of game
		randomizer.shuffleArray(cards);
		startLine();
	} else {
		soundManager.playSound("take_card");
	}
}

function nextCard() {
	useSwitch = false;
	withMonument = false;
	withMonumentBorder = false;
	if (cards[0].color === CARDS.UNDERGROUND) {
		countUnderground++;
	}
	cards.shift();
	if (cards.length === 0 || countUnderground === 5) {
		nextRound();
		return;
	}
	if (cards[0].switch) {
		nextCard();
		useSwitch = true;
		return;
	}
	soundManager.playSound("take_card");
	if (cards[0].monument) {
		withMonument = true;
		return;
	}
}

function addLine() {
	const section = findSection(sections, clickedStation, over.station);
	section.color = pencils[round];
	stationLine.push(over.station);
	clickedStation = null;
	if (withMonument && over.station.monument) {
		// keep card
		withMonument = false;
		withMonumentBorder = true;
		soundManager.playSound("validate");
		return;
	}
	nextCard();
}

function mouseClicked() {
	if (toggleDebug) {
		uiManager.addLogger(`X=${mouseX}, Y=${mouseY}`);
	}
	toolManager.mouseClicked();
	uiManager.mouseClicked();

	if (over.station) {
		console.log("an overed Station is clicked:", over.station);
		if (clickedStation !== over.station) {
			// check if station is clickable !!
			// special case if station is in district 13 !!
			if (over.station.district === 13) {
				const central = [
					over.station,
					getStation(stations, 5, 5),
					getStation(stations, 6, 5),
					getStation(stations, 5, 6),
					getStation(stations, 6, 6),
				];
				for (const station of central) {
					if (isClickable(station)) {
						over.station = station;
						break;
					}
				}
			}
			if (isClickable(over.station)) {
				if (!clickedStation) {
					clickedStation = over.station;
				} else {
					// draw line
					addLine();
				}
			} else {
				soundManager.playSound("error");
			}
		} else {
			clickedStation = null;
		}
	}

	// skip turn
	if (round !== 4 && distance(mouseX, mouseY, 1246, 169) < 40) {
		nextCard();
	}
	return false;
}

function isOverStation(station) {
	//const X = station.district === 13 ? getX(5.5) : getX(station.position.x);
	//const Y = station.district === 13 ? getY(5.5) : getY(station.position.y);
	const X = getX(station.position.x);
	const Y = getY(station.position.y);
	//return distance(X, Y, mouseX, mouseY) < (station.district === 13 ? 70 : 20);
	return distance(X, Y, mouseX, mouseY) < 20;
}

function mouseInSquare(square) {
	const between = (value, min, max) => {
		return value > min && value < max;
	};
	return (
		between(mouseX, square.topLeft.x, square.bottomRight.x) &&
		between(mouseY, square.topLeft.y, square.bottomRight.y)
	);
}

function mouseMoved() {
	over = {};
	for (const station of stations) {
		if (isOverStation(station)) {
			over.station = station;
			break;
		}
	}
	scoreUI.lines.forEach((line, index) => {
		if (mouseInSquare(line.districts)) {
			over.districts = pencils[index];
		}
		if (mouseInSquare(line.stations)) {
			over.stations = pencils[index];
		}
		if (mouseInSquare(line.monuments)) {
			over.monuments = pencils[index];
		}
	});
	if (mouseInSquare(scoreUI.links.two)) {
		over.links = 2;
	} else if (mouseInSquare(scoreUI.links.three)) {
		over.links = 3;
	} else if (mouseInSquare(scoreUI.links.four)) {
		over.links = 4;
	}
	if (mouseInSquare(scoreUI.overheads.one)) {
		over.overheads = 1;
	} else if (mouseInSquare(scoreUI.overheads.two)) {
		over.overheads = 2;
	}
}

function keyPressed() {
	if (key === "D") {
		toggleDebug = !toggleDebug;
	}
	if (keyCode === ESCAPE) {
		clickedStation = null;
	}
}
