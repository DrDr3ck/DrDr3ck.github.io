const uiManager = new UIManager();
const windowWidth = 1570;
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
let curState = GAME_LOADING_STATE;
let toggleDebug = false;
let lastTime = 0;

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
	curState = GAME_PLAY_STATE;
	uiManager.setUI([speakerButton]);
	uiManager.addLogger("Start game");

	shuffleArray(parks);
	shuffleArray(lieux);
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
];
const seed = new Seed(() => {
	const names = parks.map((p) => p.name);
	return names[Math.floor(Math.random() * names.length)];
});
const resetButton = seed.getResetButton(80, 80, {});

const lieux = [
	{ index: 0, name: "forest" },
	{ index: 1, name: "rain" },
	{ index: 2, name: "sun" },
	{ index: 3, name: "mountain" },
	{ index: 4, name: "gourde ou photo" },
	{ index: 5, name: "animal" },
	//{ index: 6, name: "park ou equipement" },
	//{ index: 7, name: "copie" },
	//{ index: 8, name: "echange" },
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
	spritesheet.addSpriteSheet("parks", "./parks.png", 250, 300);
	spritesheet.addSpriteSheet("equipements", "./equipements.png", 255, 160);

	spritesheet.addSpriteSheet("start", "./start.png", 222, 283);
	spritesheet.addSpriteSheet("lieux", "./lieux.png", 193, 283);
	spritesheet.addSpriteSheet("end", "./end.png", 250, 283);

	lastTime = Date.now();
}

function updateGame(elapsedTime) {}

function drawPark(index, x, y) {
	textAlign(CENTER, CENTER);
	textSize(20);
	fill(248, 223, 195);
	rect(x - 1, y - 1, 250 + 2, 340 + 2);
	spritesheet.drawSprite("parks", parks[index].index, x, y);
	fill(138, 116, 75);
	rect(x, y + 300, 40, 40);
	fill(0);
	text(parks[index].points, x + 20, y + 320);
	textAlign(CENTER, TOP);
	textSize(15);
	fill(0);
	text(parks[index].name, x + 250 / 2 + 2, y + 5 + 2);
	fill(250);
	text(parks[index].name, x + 250 / 2, y + 5);
	drawSymbols(parks[index].cost, x, y + 320);
}

function drawSymbols(symbols, x, y) {
	let X = x + 250 / 2 - (symbols.length / 2) * 30 + 34;
	symbols.forEach((symbol) => {
		if (symbol === "mountain") {
			fill(238, 34, 16);
		} else if (symbol === "forest") {
			fill(148, 154, 48);
		} else if (symbol === "sun") {
			fill(247, 196, 60);
		} else if (symbol === "rain") {
			fill(78, 116, 218);
		}
		ellipse(X, y, 25, 25);
		X += 30;
	});
}

function drawLieux() {
	const scale = 1.3 - lieux.length * 0.05;
	spritesheet.drawScaledSprite("start", 0, 10, 360, scale);

	for (let i = 0; i < lieux.length; i++) {
		spritesheet.drawScaledSprite(
			"lieux",
			lieux[i].index,
			10 + 195 * scale + 166 * scale * i,
			360,
			scale
		);
	}

	spritesheet.drawScaledSprite(
		"end",
		0,
		10 + 195 * scale + 166 * scale * lieux.length,
		360,
		scale
	);
}

function drawGame() {
	spritesheet.drawSprite("covers", 0, 10, 10);
	spritesheet.drawSprite("covers", 1, 10, 185);

	textAlign(CENTER, CENTER);
	textSize(20);
	drawPark(0, 280, 10);
	drawPark(1, 540, 10);
	drawPark(2, 800, 10);

	// equipements
	spritesheet.drawScaledSprite("covers", 2, 1060, 10, 0.7);
	drawSymbols(["sun"], 1120, 70);
	spritesheet.drawScaledSprite("covers", 2, 1060, 125, 0.7);
	drawSymbols(["sun", "sun"], 1135, 180);
	spritesheet.drawScaledSprite("equipements", 0, 1060, 240, 0.7);
	drawSymbols(["sun", "sun", "sun"], 1150, 290);

	drawLieux();
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
		seed.render(100, 160, { label: "Seed", color: 220 });
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
