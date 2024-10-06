const uiManager = new UIManager();
const windowWidth = 1600;
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

const GAME_LOADING_STATE = 0;
const GAME_START_STATE = 1;
const GAME_PLAY_STATE = 2;
const GAME_OVER_STATE = 3;
let curGameState = GAME_LOADING_STATE;
let toggleDebug = false;
let lastTime = 0;

const STATE = {
	CHOOSE_HIKER: "choose_hiker",
	MOVE_HIKER: "move_hiker",
	MOVE_RANGER: "move_ranger",
	TAKE_TOKENS_ON_CARD: "take_tokens_on_card",
	TAKE_TOKEN_FOR_RANGER: "take_token_for_ranger",
	BOTTLE_OR_PHOTO: "bottle_or_photo",
	TAKE_BOTTLE: "take_bottle",
	TAKE_PHOTO: "take_photo",
	REMOVE_PARK1: "remove_park1",
	REMOVE_PARK2: "remove_park2",
	REMOVE_PARK3: "remove_park3",
};
let curState = STATE.CHOOSE_HIKER;

let overHiker = null;
let selectedHiker = null;
let overPlace = null;
let overToken = null;
let selectedToken = null;
let curPlace = null;
let selectedEquip = null;
let selectedRanger = null;
let overBottle = false;
let overDevice = false;
let selectedBottle = null;

let move_ranger = 0;

let manche = 0;

const Color = {
	BLUE: 0,
	GREEN: 1,
	YELLOW: 2,
	RED: 3,
	GREY: 4,
};

class Hiker {
	constructor(colorIndex, isRanger, placeIndex, isSecond) {
		this.colorIndex = colorIndex;
		this.isRanger = isRanger;
		this.placeIndex = placeIndex;
		this.isSecond = isSecond;
		this.isSelected = false;
	}

	draw(x, y) {
		spritesheet.drawScaledSprite("hikers", this.colorIndex, x, y, 0.8);
	}

	getPlaceIndex() {
		if (this.placeIndex === "start") {
			return -1;
		}
		if (this.placeIndex === "end") {
			return 100;
		}
		return this.placeIndex;
	}
}

class Place {
	constructor(placeIndex, type, position) {
		this.placeIndex = placeIndex;
		this.type = type;
		this.tokens = [];
		this.hikers = [];
		this.position = position;
		this.rect = null;
	}

	draw(scale) {
		if (this.placeIndex === "start") {
			spritesheet.drawScaledSprite("start", 0, this.rect.x, this.rect.y, scale);
			return;
		}
		if (this.placeIndex === "end") {
			spritesheet.drawScaledSprite(
				"end",
				0,
				10 + 195 * scale + 166 * scale * board.places.length,
				360,
				scale
			);
		}
		const X = 10 + 195 * scale + 166 * scale * this.position;
		spritesheet.drawScaledSprite("places", this.placeIndex, X, 360, scale);

		drawSymbols(this.tokens, X + 30, 620);
	}

	drawRect() {
		noFill();
		stroke(250, 250, 50);
		rect(this.rect.x, this.rect.y, this.rect.w, this.rect.h, 10);
	}

	isOverPlace() {
		if (mouseX < this.rect.x || mouseY < this.rect.y) {
			return false;
		}
		if (
			mouseX > this.rect.x + this.rect.w ||
			mouseY > this.rect.y + this.rect.h
		) {
			return false;
		}
		return true;
	}

	isOverToken(scale) {
		const X = 10 + 195 * scale + 166 * scale * this.position + 30;
		const Y = 620;
		for (let i = 0; i < this.tokens.length; i++) {
			if (distance(mouseX, mouseY, X + 30 * i, Y) < 25 / 2) {
				return { x: X + 30 * i, y: Y, type: this.tokens[i] };
			}
		}
		return null;
	}

	removeToken(token) {
		const index = this.tokens.findIndex((curToken) => curToken === token.type);
		if (index >= 0) {
			this.tokens.splice(index, 1);
		}
	}

	resetTile() {
		if (this.type === "forest") {
			this.tokens.push("forest");
		} else if (this.type === "rain") {
			this.tokens.push("rain");
			this.tokens.push("rain");
		} else if (this.type === "sun") {
			this.tokens.push("sun");
			this.tokens.push("sun");
		} else if (this.type === "mountain") {
			this.tokens.push("mountain");
		}
	}
}

const board = {
	hikers: [],
	places: [],
	gourdes: [],
	box: [],
	equipements: [null, null, null],
	soloSun: [],
	soloRain: [],
	parks: [],
	photos: [],
	hasDevice: true,
	isFirst: true,
	hikerParks: [],
};

const distance = (x1, y1, x2, y2) => {
	return sqrt(pow(x2 - x1, 2) + pow(y2 - y1, 2));
};

function isOverHiker() {
	const { x: x0, y: y0 } = getCoords(board.hikers[0]);

	if (distance(mouseX, mouseY, x0 + 25, y0 + 30) < 25) {
		return board.hikers[0];
	}
	const { x: x1, y: y1 } = getCoords(board.hikers[1]);
	if (distance(mouseX, mouseY, x1 + 25, y1 + 30) < 25) {
		return board.hikers[1];
	}
	return null;
}

function computeRectForPlaces() {
	board.start.rect = { x: 10, y: 360, w: 205 - 10, h: 640 - 360 };
}

function isOverPlace() {
	// 360 640
	if (mouseY < 360 || mouseY > 640) {
		return null;
	}
	if (mouseX < 10) {
		return null;
	}
	if (board.start.isOverPlace()) {
		return board.start;
	}
	for (let i = 0; i < board.places.length; i++) {
		if (mouseX < 205 + 166 + 166 * i) {
			return board.places[i];
		}
	}
	if (mouseX > 205 + 166 + 166 * board.places.length) {
		return board.end;
	}

	return null;
}

function isOverTokenOnCurrentPlace() {
	const scale = 1.3 - board.places.length * 0.05;
	return curPlace.isOverToken(scale);
}

function mouseInRect(x, y, w, h) {
	return mouseX > x && mouseX < x + w && mouseY > y && mouseY < y + h;
}

function isOverPhotoDevice() {
	return mouseX > 1300 && mouseX < 1420 && mouseY > 0 && mouseY < 90;
}

function isOverBottleCards() {
	return mouseX > 10 && mouseX < 270 && mouseY > 10 && mouseY < 175;
}

function isOverBox() {
	return mouseX > 1370 && mouseX < 1550 && mouseY > 100 && mouseY < 320;
}

function isOverSoloCard() {
	return mouseX > 610 && mouseX < 830 && mouseY > 740 && mouseY < 880;
}

const isRanger = true;
const isSecond = true;
board.hikers.push(new Hiker(Color.RED, !isRanger, "start", !isSecond));
board.hikers.push(new Hiker(Color.RED, !isRanger, "start", isSecond));
board.hikers.push(new Hiker(Color.GREEN, isRanger, "start", !isSecond));
board.hikers.push(new Hiker(Color.GREEN, isRanger, "start", isSecond));

function preload() {}

function musicClicked() {
	// TODO
}

const speakerStorageKey = "DrDr3ck/Parks/Speaker";
function speakerClicked() {
	speakerButton.checked = !speakerButton.checked;
	soundManager.mute(!speakerButton.checked);
	localStorage.setItem(speakerStorageKey, speakerButton.checked ? "on" : "off");
}

function startClicked() {
	curGameState = GAME_PLAY_STATE;
	uiManager.setUI([
		speakerButton,
		plusBottleButton,
		minusBottleButton,
		plusParkButton,
		minusParkButton,
	]);
	plusBottleButton.setTextSize(35);
	minusBottleButton.setTextSize(35);
	plusParkButton.setTextSize(35);
	minusParkButton.setTextSize(35);
	uiManager.addLogger("Start game");

	shuffleArray(parks);
	shuffleArray(morePlaces);
	shuffleArray(gourdes);
	shuffleArray(saisons);
	shuffleArray(equipements);
	shuffleArray(rangers);

	places.push(morePlaces.pop());
	shuffleArray(places);

	board.parks.push(parks.pop());
	board.parks.push(parks.pop());
	board.parks.push(parks.pop());

	board.start = new Place("start", "start", 0);
	board.places = places.map((lieu, i) => {
		return new Place(lieu.index, lieu.name, i);
	});
	board.end = new Place("end", "end", board.places.length);
	computeRectForPlaces();

	board.gourdes.push(gourdes.pop());
	// place token on places according to season card
	const saison = saisons[manche];
	for (let i = 1; i < board.places.length; i++) {
		const symbol = saison.meteo[(i - 1) % saison.meteo.length];
		board.places[i].tokens.push(symbol);
	}

	// put hikers and rangers on first tile
	board.hikers.forEach((hiker) => (hiker.placeIndex = "start"));

	curState = STATE.CHOOSE_HIKER;
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
const startButton = new BButton(
	80,
	windowHeight - 50 - 200,
	"START",
	startClicked
);

const plusBottleButton = new BFloatingButton(10, 720, "<", () => {
	const g = board.gourdes.shift();
	board.gourdes.push(g);
});
const minusBottleButton = new BFloatingButton(225, 720, ">", () => {
	const g = board.gourdes.pop();
	board.gourdes.unshift(g);
});

const plusParkButton = new BFloatingButton(1260, 720, "<", () => {});
const minusParkButton = new BFloatingButton(225 + 1250, 720, ">", () => {});

const parks = [
	{
		name: "Isle Royale National Park",
		points: 2,
		cost: ["forest", "sun", "rain"],
		index: 0,
	},
	{
		name: "Mammoth Cave National Park",
		points: 2,
		cost: ["mountain", "mountain"],
		index: 1,
	},
	{
		name: "Wrangell-St Elias National Park",
		points: 4,
		cost: ["mountain", "mountain", "mountain", "rain", "rain"],
		index: 2,
	},
	{
		name: "Acadia National Park",
		points: 3,
		cost: ["forest", "forest", "sun", "rain"],
		index: 3,
	},
	{
		name: "Arches National Park",
		points: 3,
		cost: ["forest", "forest", "sun", "sun"],
		index: 4,
	},
	{
		name: "Congaree National Park",
		points: 2,
		cost: ["forest", "forest"],
		index: 5,
	},
	{
		name: "Gates of the Arctic National Park",
		points: 5,
		cost: ["mountain", "mountain", "mountain", "rain", "rain", "rain", "rain"],
		index: 6,
	},
	{
		name: "Carlsbad Caverns National Park",
		points: 2,
		cost: ["mountain", "sun", "rain"],
		index: 7,
	},
	{
		name: "Great Basin National Park",
		points: 3,
		cost: ["forest", "mountain", "mountain"],
		index: 8,
	},
	{
		name: "Kings Canyon National Park",
		points: 3,
		cost: ["forest", "forest", "mountain"],
		index: 9,
	},
	{
		name: "Great Smoky Mountains National Park",
		points: 4,
		cost: ["forest", "forest", "forest", "mountain"],
		index: 10,
	},
	{
		name: "Saquaro National Park",
		points: 2,
		cost: ["forest", "sun", "sun"],
		index: 11,
	},
	{
		name: "Glacier Bay National Park",
		points: 3,
		cost: ["forest", "mountain", "rain", "rain"],
		index: 12,
	},
	{
		name: "Denali National Park",
		points: 4,
		cost: ["mountain", "mountain", "mountain", "mountain"],
		index: 13,
	},
	{
		name: "National Park of American Samoa",
		points: 4,
		cost: ["forest", "forest", "sun", "sun", "rain", "rain"],
		index: 14,
	},
	{
		name: "Sequoia National Park",
		points: 4,
		cost: ["forest", "forest", "forest", "forest"],
		index: 15,
	},
	{
		name: "Rocky Mountain National Park",
		points: 4,
		cost: ["mountain", "mountain", "sun", "sun", "rain", "rain"],
		index: 16,
	},
	{
		name: "Shenandoah National Park",
		points: 2,
		cost: ["forest", "mountain"],
		index: 17,
	},
	{
		name: "Bryce Canyon National Park",
		points: 4,
		cost: ["forest", "mountain", "mountain", "mountain"],
		index: 18,
	},
	{
		name: "Virgin Islands National Park",
		points: 5,
		cost: ["forest", "forest", "forest", "rain", "rain", "rain", "rain"],
		index: 19,
	},
	{
		name: "Grand Canyon National Park",
		points: 3,
		cost: ["mountain", "mountain", "sun", "rain"],
		index: 20,
	},
	{
		name: "Channel Islands National Park",
		points: 2,
		cost: ["mountain", "rain", "rain"],
		index: 21,
	},
	{
		name: "Grand Canyon National Park",
		points: 4,
		cost: ["mountain", "mountain", "sun", "rain", "rain", "rain"],
		index: 22,
	},
	{
		name: "Biscayne National Park",
		points: 3,
		cost: ["forest", "forest", "rain", "rain"],
		index: 23,
	},
	{
		name: "Arches National Park",
		points: 2,
		cost: ["mountain", "sun", "sun"],
		index: 24,
	},
	{
		name: "Mesa Verde National Park",
		points: 3,
		cost: ["forest", "mountain", "sun", "sun"],
		index: 25,
	},
	{
		name: "Black Canyon National Park",
		points: 3,
		cost: ["mountain", "mountain", "rain", "rain"],
		index: 26,
	},
	{
		name: "Haleakala National Park",
		points: 4,
		cost: ["forest", "mountain", "rain", "rain", "rain", "rain"],
		index: 27,
	},
	{
		name: "Tortugas National Park",
		points: 2,
		cost: ["rain", "rain", "rain", "rain"],
		index: 28,
	},
	{
		name: "Yellowstone National Park",
		points: 5,
		cost: ["forest", "forest", "forest", "sun", "sun", "sun", "sun"],
		index: 29,
	},
	{
		name: "Guadelupe Mountains National Park",
		points: 3,
		cost: ["mountain", "mountain", "sun", "sun"],
		index: 30,
	},
	{
		name: "Yosemite National Park",
		points: 4,
		cost: ["forest", "forest", "forest", "rain", "rain"],
		index: 31,
	},
	{
		name: "Capitol Reef National Park",
		points: 4,
		cost: ["forest", "forest", "forest", "sun", "sun"],
		index: 32,
	},
	{
		name: "Cuyahoga Valley National Park",
		points: 2,
		cost: ["forest", "rain", "rain"],
		index: 33,
	},
	{
		name: "Mount Rainier National Park",
		points: 3,
		cost: ["mountain", "mountain", "mountain"],
		index: 34,
	},
	{
		name: "Badlands National Park",
		points: 4,
		cost: ["mountain", "mountain", "sun", "sun", "sun", "sun"],
		index: 35,
	},
	{
		name: "Zion National Park",
		points: 4,
		cost: ["forest", "mountain", "sun", "sun", "sun", "sun"],
		index: 36,
	},
	{
		name: "Gateway Arch National Park",
		points: 2,
		cost: ["sun", "sun", "sun", "sun"],
		index: 37,
	},
	{
		name: "Great Sand Dunes National Park",
		points: 4,
		cost: ["mountain", "mountain", "mountain", "sun", "sun"],
		index: 38,
	},
	{
		name: "Kenai Fjords National Park",
		points: 4,
		cost: ["forest", "forest", "rain", "rain", "rain", "rain"],
		index: 39,
	},
	{
		name: "Big Bend National Park",
		points: 4,
		cost: ["mountain", "mountain", "sun", "sun", "sun", "rain"],
		index: 40,
	},
	{
		name: "North Cascades National Park",
		points: 4,
		cost: ["mountain", "mountain", "rain", "rain", "rain", "rain"],
		index: 41,
	},
];
const seed = new Seed(() => {
	const names = parks.map((p) => p.name);
	return names[Math.floor(Math.random() * names.length)];
});
const resetButton = seed.getResetButton(80, 80, {});

const places = [
	{ index: 0, name: "forest" },
	{ index: 1, name: "rain" },
	{ index: 2, name: "sun" },
	{ index: 3, name: "mountain" },
	{ index: 4, name: "gourde ou photo" },
];

const morePlaces = [
	{ index: 5, name: "animal" },
	{ index: 6, name: "park ou equipement" },
	{ index: 7, name: "copie" },
	{ index: 8, name: "echange" },
];

const gourdes = [
	{ index: 0, name: "forest", empty: true },
	{ index: 1, name: "mountain", empty: true },
	{ index: 2, name: "sun x2", empty: true },
	{ index: 3, name: "exchange x2", empty: true },
	{ index: 4, name: "animal or park", empty: true },
	{ index: 0, name: "forest", empty: true },
	{ index: 1, name: "mountain", empty: true },
	{ index: 2, name: "sun x2", empty: true },
	{ index: 3, name: "exchange x2", empty: true },
	{ index: 4, name: "animal or park", empty: true },
	{ index: 0, name: "forest", empty: true },
	{ index: 1, name: "mountain", empty: true },
	{ index: 2, name: "sun x2", empty: true },
	{ index: 3, name: "exchange x2", empty: true },
	{ index: 4, name: "animal or park", empty: true },
];

const saisons = [
	{ index: 0, name: "recifs", meteo: ["rain", "rain", "sun"] },
	{ index: 1, name: "neiges", meteo: ["sun", "rain", "rain"] },
	{ index: 2, name: "étoiles filantes", meteo: ["sun", "rain", "sun"] },
	{ index: 3, name: "splendeurs", meteo: ["rain", "sun"] },
	{ index: 4, name: "pierres", meteo: ["rain", "sun", "sun"] },
];

const equipements = [
	{ index: 0, name: "plan parcours sun", cost: 1 },
	{ index: 1, name: "sac couchage forest", cost: 2 },
	{ index: 2, name: "journal forest", cost: 3 },
	{ index: 2, name: "journal forest", cost: 3 },
	{ index: 2, name: "journal forest", cost: 3 },
	{ index: 3, name: "journal mountain", cost: 3 },
	{ index: 3, name: "journal mountain", cost: 3 },
	{ index: 3, name: "journal mountain", cost: 3 },
	{ index: 4, name: "filtre a eau forest", cost: 2 },
	{ index: 5, name: "equipement de pluie mountain", cost: 3 },
	{ index: 6, name: "tente", cost: 3 },
	{ index: 7, name: "sac couchage mountain", cost: 2 },
	{ index: 8, name: "lampe torche", cost: 1 },
	{ index: 9, name: "pass park", cost: 2 },
	{ index: 10, name: "plan parcours rain", cost: 1 },
	{ index: 11, name: "filtre a eau mountain", cost: 2 },
];

const rangers = [
	{ index: 1, name: "vague de chaleur" },
	{ index: 2, name: "crue eclair" },
	{ index: 3, name: "terrain dangereux" },
	{ index: 4, name: "brouillard epais" },
	{ index: 5, name: "vents violents" },
	{ index: 6, name: "fermeture gouvernementale" },
	{ index: 7, name: "heure de fermeture" },
	{ index: 8, name: "periode de grand froid" },
];

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
	const menu = [speakerButton, startButton, resetButton];
	uiManager.setUI(menu);
}

function setup() {
	initUI();
	canvas = createCanvas(windowWidth, windowHeight);
	canvas.parent("canvas");

	frameRate(60);

	spritesheet.addSpriteSheet("covers", "./covers.png", 260, 165);
	spritesheet.addSpriteSheet("gourdes", "./gourdes.png", 260, 165);
	spritesheet.addSpriteSheet("saisons", "./saisons.png", 260, 165);
	spritesheet.addSpriteSheet("parks", "./parks.png", 250, 300);
	spritesheet.addSpriteSheet("equipements", "./equipements.png", 255, 160);
	spritesheet.addSpriteSheet("photo_device", "./photo_device.png", 160, 130);
	spritesheet.addSpriteSheet("first_token", "./first_token.png", 80, 70);

	spritesheet.addSpriteSheet("hikers", "./hikers.png", 66, 80);
	spritesheet.addSpriteSheet("rangers", "./rangers.png", 300, 200);
	spritesheet.addSpriteSheet("cursor", "./cursor.png", 40, 40);

	spritesheet.addSpriteSheet("start", "./start.png", 222, 283);
	spritesheet.addSpriteSheet("places", "./places.png", 193, 283);
	spritesheet.addSpriteSheet("end", "./end.png", 250, 283);

	lastTime = Date.now();
}

function updateGame(elapsedTime) {}

function drawPark(index, x, y) {
	if (!board.parks[index]) {
		return;
	}
	textAlign(CENTER, CENTER);
	textSize(20);
	fill(248, 223, 195);
	rect(x - 1, y - 1, 250 + 2, 340 + 2);
	spritesheet.drawSprite("parks", board.parks[index].index, x, y);
	fill(138, 116, 75);
	rect(x, y + 300, 40, 40);
	fill(0);
	text(board.parks[index].points, x + 20, y + 320);
	textAlign(CENTER, TOP);
	textSize(15);
	fill(0);
	text(board.parks[index].name, x + 250 / 2 + 2, y + 5 + 2);
	fill(250);
	text(board.parks[index].name, x + 250 / 2, y + 5);
	drawSymbols(
		board.parks[index].cost,
		x + 250 / 2 - (board.parks[index].cost.length / 2) * 30 + 34,
		y + 320
	);
}

function drawSymbol(symbol, x, y) {
	if (symbol === "mountain") {
		fill(238, 34, 16);
	} else if (symbol === "forest") {
		fill(148, 154, 48);
	} else if (symbol === "sun") {
		fill(247, 196, 60);
	} else if (symbol === "rain") {
		fill(78, 116, 218);
	} else if (symbol === "animal") {
		fill(91, 60, 17);
	}
	ellipse(x, y, 25, 25);
}

function drawSymbols(symbols, x, y) {
	symbols.forEach((symbol) => {
		drawSymbol(symbol, x, y);
		x += 30;
	});
}

function drawPlaces() {
	const scale = 1.3 - board.places.length * 0.05;

	board.start.draw(scale);
	board.places.forEach((place) => place.draw(scale));
	board.end.draw(scale);
}

function getCoords(hiker) {
	let x = 0;
	const y = hiker.isRanger ? 460 : 380;
	if (hiker.placeIndex === "start") {
		x = 30;
	} else if (hiker.placeIndex === "end") {
		x = 1310;
	} else {
		const scale = 1.3 - board.places.length * 0.05;
		x = 235 + hiker.placeIndex * 166 * scale;
	}

	return { x: hiker.isSecond ? x + 80 : x, y };
}

function isEqualRanger(hiker, ranger) {
	if (!ranger) {
		return false;
	}
	return (
		hiker.colorIndex === ranger.colorIndex && hiker.isSecond == ranger.isSecond
	);
}

function drawHikers() {
	board.hikers.forEach((hiker) => {
		if (!hiker.isSelected && !isEqualRanger(hiker, selectedRanger)) {
			const { x, y } = getCoords(hiker);
			hiker.draw(x, y);
		}
	});
	if (selectedHiker) {
		selectedHiker.draw(mouseX - 25, mouseY - 25);
	}
	if (selectedRanger) {
		selectedRanger.draw(mouseX - 25, mouseY - 25);
	}
}

function drawHelpText() {
	fill(220);
	if (curState === STATE.CHOOSE_HIKER) {
		text("Select a hiker", 715, 670);
	} else if (curState === STATE.MOVE_HIKER) {
		text("Move hiker on a place", 715, 670);
	} else if (curState === STATE.TAKE_TOKENS_ON_CARD) {
		text("Take tokens from place", 715, 670);
	} else if (curState === STATE.MOVE_RANGER) {
		if (selectedEquip) {
			text("Move equipement on rank " + selectedEquip.cost, 715, 670);
		}
		if (selectedRanger) {
			text("Move ranger from " + move_ranger + " place(s)", 715, 670);
		}
	} else if (curState === STATE.TAKE_TOKEN_FOR_RANGER) {
		text("Take token for ranger card", 715, 670);
	} else if (curState === STATE.BOTTLE_OR_PHOTO) {
		text("Choose between bottle and photo", 715, 670);
	} else if (curState === STATE.TAKE_BOTTLE) {
		text("Stack new bottle", 715, 670);
	} else if (curState === STATE.TAKE_PHOTO) {
		text("Take a photo", 715, 670);
	} else if (curState === STATE.REMOVE_PARK1) {
		text("Remove first park", 715, 670);
	} else if (curState === STATE.REMOVE_PARK2) {
		text("Remove second park", 715, 670);
	} else if (curState === STATE.REMOVE_PARK3) {
		text("Remove last park", 715, 670);
	}

	if (!curState) {
		stroke(240, 20, 20);
		text("ERROR: undefined state", 715, 670);
	}
}

function drawEquipements() {
	// equipements
	if (board.equipements[0] === null) {
		spritesheet.drawScaledSprite("covers", 2, 1060, 10, 0.71);
	} else {
		spritesheet.drawScaledSprite(
			"equipements",
			board.equipements[0].index,
			1060,
			10,
			0.71
		);
	}
	if (board.equipements[1] === null) {
		spritesheet.drawScaledSprite("covers", 2, 1060, 125, 0.71);
	} else {
		spritesheet.drawScaledSprite(
			"equipements",
			board.equipements[1].index,
			1060,
			125,
			0.71
		);
	}
	if (board.equipements[2] === null) {
		spritesheet.drawScaledSprite("covers", 2, 1060, 240, 0.7);
	} else {
		spritesheet.drawScaledSprite(
			"equipements",
			board.equipements[2].index,
			1060,
			240,
			0.71
		);
	}
	drawSymbols(["sun"], 1255, 70);
	drawSymbols(["sun", "sun"], 1255, 180);
	drawSymbols(["sun", "sun", "sun"], 1255, 290);
}

function drawOver() {
	if (overHiker) {
		const { x, y } = getCoords(overHiker);
		noFill();
		stroke(250, 250, 50);
		rect(x - 5, y - 10, 60, 80, 10);

		fill(220);
		stroke(0);
		text(overHiker.placeIndex, 30, 650);
	}

	if (overPlace) {
		noFill();
		stroke(250, 250, 50);
		if (overPlace.placeIndex === "start") {
			overPlace.drawRect();
		} else if (overPlace.placeIndex === "end") {
		} else {
			rect(10 + 195 + 166 * overPlace.position, 360, 166, 280, 10);
		}

		textAlign(LEFT, TOP);
		fill(220);
		stroke(0);
		text(overPlace.position, 10, 650);
		text(overPlace.type, 10, 670);
	}

	if (overToken) {
		noFill();
		stroke(250, 250, 50);
		ellipse(overToken.x, overToken.y, 25);

		textAlign(LEFT, TOP);
		fill(220);
		stroke(0);
		text(overToken.type, 10, 650);
		text(overToken.x, 10, 670);
		text(overToken.y, 40, 670);
	}

	if (overBottle) {
		noFill();
		stroke(250, 250, 50);
		strokeWeight(3);
		rect(10, 10, 260, 165, 5);
		strokeWeight(1);
	}

	if (overDevice) {
		noFill();
		stroke(250, 250, 50);
		strokeWeight(3);
		rect(1300, 2, 1420 - 1300, 85, 5);
		strokeWeight(1);
	}
}

function drawSelection() {
	if (selectedToken) {
		drawSymbol(selectedToken.type, mouseX, mouseY);
	}

	if (selectedEquip) {
		spritesheet.drawScaledSprite(
			"equipements",
			selectedEquip.index,
			mouseX - 90,
			mouseY - 56,
			0.7
		);
	}

	if (selectedRanger) {
		// display rect where ranger was placed
		const { x, y } = getCoords(selectedRanger);
		noFill();
		stroke(250, 250, 50);
		rect(x - 5, y - 10, 60, 80, 10);
		// display ranger on cursor
		// selectedRanger.draw(mouseX - 25, mouseY - 25);
		// display place where ranger should be placed
		if (rangerPlace.placeIndex === "end") {
			// special case for "end" tile
			rect(
				10 + 195 + 166 * rangerPlace.position + 40,
				300 + 80 * move_ranger,
				200,
				75,
				10
			);
		} else {
			rect(10 + 195 + 166 * rangerPlace.position, 360, 166, 280, 10);
		}
	}

	if (selectedBottle !== null) {
		spritesheet.drawSprite(
			"gourdes",
			gourdes[selectedBottle].index,
			mouseX - 130,
			mouseY - 65
		);
	}
}

function drawPhotos() {
	spritesheet.drawScaledSprite(
		"photo_device",
		board.hasDevice ? 0 : 1,
		1300,
		0,
		0.75
	);
}

function drawFirstToken() {
	if (board.isFirst) {
		spritesheet.drawScaledSprite("first_token", 0, 1440, 10, 1);
	}
}

function drawGame() {
	spritesheet.drawSprite("covers", 0, 10, 10);
	spritesheet.drawSprite("saisons", saisons[manche].index, 10, 185);

	textAlign(CENTER, CENTER);
	textSize(20);
	stroke(0);
	drawPark(0, 280, 10);
	drawPark(1, 540, 10);
	drawPark(2, 800, 10);

	drawHelpText();

	drawEquipements();

	drawPlaces();

	drawHikers();

	drawOver();

	drawBoard();

	drawSelection();

	drawPhotos();

	drawFirstToken();

	// special case when removing parks
	if (curState && curState.startsWith("remove_park")) {
		noFill();
		stroke(248, 23, 95);
		strokeWeight(5);
		if (curState === STATE.REMOVE_PARK1) {
			rect(279, 9, 250 + 2, 340 + 2);
		} else if (curState === STATE.REMOVE_PARK2) {
			rect(539, 9, 250 + 2, 340 + 2);
		} else {
			rect(799, 9, 250 + 2, 340 + 2);
		}
		strokeWeight(1);

		// draw Bin at cursor
		spritesheet.drawSprite("cursor", 0, mouseX - 20, mouseY - 20);
	}
}

function drawBoard() {
	// gourdes
	if (board.gourdes.length > 0) {
		spritesheet.drawSprite("gourdes", board.gourdes[0].index, 10, 730);
		fill(220);
		noStroke();
		textAlign(CENTER, CENTER);
		textSize(25);
		text(`x${board.gourdes.length}`, 135, 695);
	}

	// parks
	// to change whe getting parks !!
	if (board.hikerParks.length > 0) {
		fill(220);
		noStroke();
		textAlign(CENTER, CENTER);
		textSize(25);
		text(`x${board.hikerParks.length}`, 135 + 1250, 695);
	}

	// garde forestier
	spritesheet.drawScaledSprite("rangers", 0, 600, 730, 0.825);
	spritesheet.drawScaledSprite("rangers", rangers[0].index, 855, 730, 0.825);

	stroke(0);
	fill(91, 60, 17);
	rect(1370, 100, 180, 220, 10);

	board.box.forEach((token) => {
		drawSymbol(token.type, token.x, token.y);
	});

	board.soloSun.forEach((tokenType, index) => {
		drawSymbol(tokenType, 647 + 75 * index, 773);
	});

	board.soloRain.forEach((tokenType, index) => {
		drawSymbol(tokenType, 647 + 75 * index, 858);
	});
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
		curGameState = GAME_START_STATE;

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
	if (curGameState === GAME_LOADING_STATE) {
		drawLoading();
		return;
	}

	uiManager.processInput();

	uiManager.update(elapsedTime);

	// draw game
	if (curGameState === GAME_START_STATE) {
		seed.render(100, 160, { label: "Seed", color: 220 });
	}
	if (curGameState === GAME_PLAY_STATE) {
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

// TODO: check if hiker can move on this place depending of previous place + number of ranger in 'end' place
function hikerCanPlace() {
	return selectedHiker && overPlace;
}

function placeHiker() {
	selectedHiker.isSelected = false;
	selectedHiker.placeIndex = overPlace.position;

	// change state according to chosen place
	if (overPlace.placeIndex !== "end") {
		// TODO: depending of the card, take token or do a specific action
		if (overPlace.placeIndex <= 3) {
			overPlace.resetTile();
			curState = STATE.TAKE_TOKENS_ON_CARD;
		} else if (overPlace.placeIndex === 4) {
			// check first if place contains some tokens !!
			if (overPlace.tokens.length > 0) {
				curState = STATE.TAKE_TOKENS_ON_CARD;
			} else {
				curState = STATE.BOTTLE_OR_PHOTO;
			}
		} else {
			curState = STATE.ERROR;
		}
	}
	curPlace = overPlace;
	overPlace = null;
	selectedHiker = null;
}

function addTokenToBox(tokenType) {
	board.box.push({ x: mouseX, y: mouseY, type: tokenType });
	selectedToken = null;
}

function addTokenToSoloCard(tokenType) {
	if (tokenType === "sun") {
		board.soloSun.push("sun");
	} else {
		board.soloRain.push("rain");
	}
	selectedToken = null;
}

function chooseRanger() {
	let positions = [
		board.hikers[0].getPlaceIndex(),
		board.hikers[1].getPlaceIndex(),
	];
	const maxHikerPosition =
		positions[0] > positions[1] ? positions[0] : positions[1];
	positions = [
		board.hikers[2].getPlaceIndex(),
		board.hikers[3].getPlaceIndex(),
	];
	const maxRangerPosition =
		positions[0] > positions[1] ? positions[0] : positions[1];
	if (maxHikerPosition > maxRangerPosition) {
		// most in front
		return positions[0] > positions[1] ? board.hikers[2] : board.hikers[3];
	}
	// most behind
	return positions[0] < positions[1] ? board.hikers[2] : board.hikers[3];
}

function choosePlace() {
	// choose place where ranger should move
	let placeIndex = selectedRanger.getPlaceIndex() + move_ranger;
	// check if a hiker is on this place !!
	if (
		board.hikers[0].placeIndex === placeIndex ||
		board.hikers[1].placeIndex === placeIndex
	) {
		placeIndex = placeIndex + 1;
	}
	if (
		board.hikers[0].placeIndex === placeIndex ||
		board.hikers[1].placeIndex === placeIndex
	) {
		placeIndex = placeIndex + 1;
	}
	// check if place index is on the last tile
	if (placeIndex >= board.places.length) {
		return board.end;
	}
	return board.places[placeIndex];
}

function mouseClicked() {
	if (toggleDebug) {
		uiManager.addLogger(`X=${mouseX}, Y=${mouseY}`);
	}

	if (overHiker && !selectedHiker) {
		overHiker.isSelected = true;
		selectedHiker = overHiker;
		curState = STATE.MOVE_HIKER;
		overHiker = null;
	}

	if (hikerCanPlace()) {
		placeHiker();
	}

	if (overToken && !selectedToken) {
		curPlace.removeToken(overToken);
		selectedToken = overToken;
		overToken = null;
	}

	if (
		curState === STATE.BOTTLE_OR_PHOTO &&
		overBottle &&
		selectedBottle === null
	) {
		selectedBottle = gourdes.length - 1; // index of bottle to show
		curState = STATE.TAKE_BOTTLE;
		overBottle = false;
	} else if (
		curState === STATE.BOTTLE_OR_PHOTO &&
		overDevice &&
		board.box.length >= (board.hasDevice ? 1 : 2)
	) {
		curState = STATE.TAKE_PHOTO;
		overDevice = false;
	} else if (curState === STATE.TAKE_BOTTLE && selectedBottle !== null) {
		selectedBottle = null;
		curState = STATE.MOVE_RANGER;
		selectedEquip = equipements.pop();
		board.gourdes.push(gourdes.pop());
	} else if (curState === STATE.MOVE_RANGER && selectedRanger && rangerPlace) {
		// place ranger on new place
		selectedRanger.placeIndex = rangerPlace.position;
		selectedRanger = null;
		// move_ranger = 0; never reset move_ranger
		// check if ranger is on 'end' tile
		if (rangerPlace.placeIndex === "end") {
			if (move_ranger === 1) {
				// check presence of park
				if (board.parks[0]) {
					curState = STATE.REMOVE_PARK1;
				} else {
					// TODO: take firstPlace or CannotBookPlace
					curState = STATE.MOVE_HIKER;
				}
			} else if (move_ranger === 2) {
				// check presence of park
				if (board.parks[1]) {
					curState = STATE.REMOVE_PARK2;
				} else {
					// remove photo device
					board.hasDevice = false;
					curState = STATE.MOVE_HIKER;
				}
			} else {
				// check presence of park
				if (board.parks[2]) {
					curState = STATE.REMOVE_PARK3;
				} else {
					// shuffle equip 3
					reshuffleEquip3();
					curState = STATE.MOVE_HIKER;
				}
			}
		}
		// check if meteo token needs to be moved on 'Solo' card
		else if (rangerPlace.tokens.length !== 0) {
			curState = STATE.TAKE_TOKEN_FOR_RANGER;
			curPlace = rangerPlace;
		} else {
			curState = STATE.CHOOSE_HIKER;
		}
		rangerPlace = null;
	} else if (curState === STATE.MOVE_RANGER && selectedEquip) {
		// move equipement on corresponding rank
		move_ranger = selectedEquip.cost;
		board.equipements[selectedEquip.cost - 1] = { ...selectedEquip };
		selectedEquip = null;
		// which ranger to move ? most in front or most behind ?
		selectedRanger = chooseRanger();
		// where to move it ? is there a hiker on this place ?
		rangerPlace = choosePlace();
	} else if (
		curState === STATE.TAKE_TOKENS_ON_CARD &&
		selectedToken !== null &&
		isOverBox()
	) {
		addTokenToBox(selectedToken.type);
		// check if tokens on card otherwise move to next state
		if (curPlace.tokens.length === 0) {
			if (curPlace.placeIndex === 4) {
				curState = STATE.BOTTLE_OR_PHOTO;
			} else {
				curState = STATE.MOVE_RANGER;
				selectedEquip = equipements.pop();
			}
		}
	} else if (
		curState === STATE.TAKE_TOKEN_FOR_RANGER &&
		selectedToken !== null &&
		isOverSoloCard()
	) {
		addTokenToSoloCard(selectedToken.type);
		// check if tokens on card otherwise move to next state
		if (curPlace.tokens.length === 0) {
			// TODO: check if solo card is full
			curState = STATE.CHOOSE_HIKER;
		}
	} else if (curState && curState.startsWith("remove_park")) {
		if (curState === STATE.REMOVE_PARK1 && mouseInRect(280, 10, 250, 340)) {
			//TODO: take firstPlace ? cannot book ?
			board.parks[0] = null;
			curState = STATE.CHOOSE_HIKER;
		} else if (
			curState === STATE.REMOVE_PARK2 &&
			mouseInRect(540, 10, 250, 340)
		) {
			//remove photo device !!
			board.parks[1] = null;
			board.hasDevice = false;
			curState = STATE.CHOOSE_HIKER;
		} else if (
			curState === STATE.REMOVE_PARK3 &&
			mouseInRect(800, 10, 250, 340)
		) {
			// remove last park
			board.parks[2] = null;
			curState = STATE.CHOOSE_HIKER;
			// reshuffle equip 3
			reshuffleEquip3();
		}
	}

	toolManager.mouseClicked();
	uiManager.mouseClicked();
	return false;
}

function mouseMoved() {
	switch (curState) {
		case STATE.CHOOSE_HIKER:
			overHiker = isOverHiker();
			break;
		case STATE.MOVE_HIKER:
			overPlace = isOverPlace();
			break;
		case STATE.TAKE_TOKENS_ON_CARD:
		case STATE.TAKE_TOKEN_FOR_RANGER:
			overToken = isOverTokenOnCurrentPlace();
			break;
		case STATE.BOTTLE_OR_PHOTO:
			overBottle = isOverBottleCards();
			overDevice = isOverPhotoDevice();
	}
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
