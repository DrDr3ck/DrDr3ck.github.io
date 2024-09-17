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
		name: "Mammoth Cave National Park",
		points: 2,
		cost: ["mountain", "mountain"],
	},
	{
		name: "Isle Royale National Park",
		points: 2,
		cost: ["forest", "sun", "rain"],
	},
	{
		name: "Wrangell-St Elias National Park",
		points: 4,
		cost: ["mountain", "mountain", "mountain", "rain", "rain"],
	},
	{
		name: "Acadia National Park",
		points: 3,
		cost: ["forest", "forest", "sun", "rain"],
	},
	{
		name: "Arches National Park",
		points: 3,
		cost: ["forest", "forest", "sun", "sun"],
	},
	{
		name: "Congaree National Park",
		points: 2,
		cost: ["forest", "forest"],
	},
];
const seed = new Seed(() => {
	const names = parks.map((p) => p.name);
	return names[Math.floor(Math.random() * names.length)];
});
const resetButton = seed.getResetButton(80, 80, {});

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

	lastTime = Date.now();
}

function updateGame(elapsedTime) {}

function drawPark(index, x, y) {
	fill(248, 223, 195);
	rect(x - 1, y - 1, 250 + 2, 340 + 2);
	spritesheet.drawSprite("parks", index, x, y);
	fill(138, 116, 75);
	rect(x, y + 300, 40, 40);
	fill(0);
	text(parks[index].points, x + 20, y + 320);
}

function drawGame() {
	spritesheet.drawSprite("covers", 0, 10, 10);
	spritesheet.drawSprite("covers", 1, 10, 185);

	textAlign(CENTER, CENTER);
	textSize(20);
	drawPark(0, 280, 10);
	drawPark(0, 540, 10);
	drawPark(0, 800, 10);

	spritesheet.drawScaledSprite("equipements", 0, 1060, 10, 0.8);
	spritesheet.drawScaledSprite("equipements", 0, 1060, 145, 0.8);
	spritesheet.drawScaledSprite("equipements", 0, 1060, 280, 0.8);
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
