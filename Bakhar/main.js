const initSongVolume = 0.3;
let songVolume = initSongVolume;

const GAME_MENU_STATE = 0;
const GAME_START_STATE = 1;
const GAME_PLAY_STATE = 2;
const GAME_CREDIT_STATE = 3;

let toggleHelp = false;

let curState = GAME_MENU_STATE;

const tileMap = new TileMap(20, 20);

function getData() {
	const data = {
		tileMap: tileMap,
		volume: songVolume,
		help: toggleHelp
	};
	return data;
}

const storageKey = '34KH4R';

function doSave() {
	const data = JSON.stringify(getData());
	if (data && data !== 'null') {
		localStorage.setItem(storageKey, data);
		console.log('saving ', data);
	}
}

function loadData() {
	const storage = localStorage.getItem(storageKey);
	const initialData = getData();
	let data = initialData;
	if (storage) {
		data = JSON.parse(storage) || initialData;
		for (var k in initialData) {
			if (!data[k]) {
				data[k] = initialData[k];
			}
		}
	}
	songVolume = data.volume;
	toggleHelp = data.toggleHelp;
	tileMap.parseMap(data.tileMap);
}

const userLang = navigator.language || navigator.userLanguage; // "en-US"

const uiManager = new UIManager();
const toolManager = new ToolManager();
const jobManager = new JobManager();

const FPS = 60;

let tileImages = [];
let atlas = null;

function preload() {
	// Load sounds
	// load images
	tileImages.push(loadImage('./images/tiles01.png'));
	tileImages.push(loadImage('./images/tiles02.png'));
}

function setup() {
	loadData();

	canvas = createCanvas(1200, 800);
	canvas.parent('canvas');

	frameRate(FPS);

	atlas = new TileAtlas();

	if( tileMap.ni === 0 ) {
	    menuClicked();
	} else {
	    newClicked();
	}
}

function nothing() {
	console.log('does nothing');
}

function menuClicked() {
	curState = GAME_MENU_STATE;
	uiManager.setUI(menu);
}

function startClicked() {
	curState = GAME_START_STATE;
	uiManager.setUI(start);
}

function creditClicked() {
	curState = GAME_CREDIT_STATE;
	uiManager.setUI(credit);
}

function newClicked() {
	curState = GAME_PLAY_STATE;
	uiManager.setUI(game);
	if( tileMap.ni === 0 ) {
		tileMap.init(16, 10);
		tileMap.parseMap(null);
	}
}

const menu = [
	new BButton(100, 400, 'START', startClicked),
	new BButton(100, 500, 'BLOG', nothing),
	new BButton(100, 600, 'CREDIT', creditClicked)
];
menu[1].enabled = false;

const start = [
	new BButton(300, 400, 'NEW', newClicked),
	new BButton(300, 500, 'CONTINUE', nothing),
	new BButton(300, 600, 'SAVE', nothing),
	new BFloatingButton(1100, 100, '\u2716', menuClicked)
];
start[1].enabled = false;
start[2].enabled = false;

const credit = [ new BFloatingButton(1100, 100, '\u2716', menuClicked) ];

const blockMenu = new BMenu('Block', 30, 675, null, 3);
const structureMenu = new BMenu('Structure', 140, 675, null, 3);
const objectMenu = new BMenu('Object', 250, 675, null, 3);
const game = [ blockMenu, structureMenu, objectMenu ];
blockMenu.addItem('metal', null, () => {
	toolManager.setTool(new InstallBlockTool(1));
});
blockMenu.addItem('plastic', null, nothing);
blockMenu.addItem('glass', null, nothing);
blockMenu.addItem('Remove Block', null, () => {
	toolManager.setTool(new RemoveBlockTool());
});
blockMenu.prepareItems();

structureMenu.addItem('door', null, nothing);
structureMenu.addItem('lift', null, nothing);
structureMenu.addItem('gate', null, nothing);
structureMenu.prepareItems();

objectMenu.addItem('seed tray', null, nothing);
objectMenu.addItem('', null, nothing);
objectMenu.prepareItems();

let lastTime = Date.now();

function drawBackground() {
	// background
	stroke(110, 160, 130);
	strokeWeight(3);
	fill(18, 42, 27);
	rect(10, 10, width - 20, height - 20, 10);
}

function drawGameMenu() {
	stroke(110, 160, 130);
	strokeWeight(2);
	fill(18, 52, 27);
	rect(15, 665, width - 30, height - 680, 15);
}

function drawMenu() {
	drawBackground();

	// grey rectangle
	fill(51);
	noStroke();
	rect(180, 80, width - 180 - 180, 580 - 80);
}

function drawCredit() {
	drawBackground();

	textSize(32);
	drawText('Work in progress...', 100, 100);
}

function drawLoading() {
	drawBackground();
}

function drawGame() {
	drawBackground();
	drawGameMenu();
	textSize(32);
	tileMap.render();
}

function updateGame(elapsedTime) {
	jobManager.update(elapsedTime);
}

function processInput() {
	uiManager.processInput();
}

function update(elapsedTime) {
	if (curState === GAME_PLAY_STATE) {
		updateGame(elapsedTime);
	}
}

function render() {
	if (curState === GAME_MENU_STATE) {
		drawMenu();
	} else if (curState === GAME_CREDIT_STATE) {
		drawCredit();
	} else if (curState === GAME_START_STATE) {
		drawLoading();
	} else if (curState === GAME_PLAY_STATE) {
		drawGame();
	}
	strokeWeight(1);
	uiManager.currentUI.forEach((c) => {
		c.draw();
	});
	if (toolManager.currentTool) {
		toolManager.currentTool.draw();
	}
	jobManager.draw();

	if (toggleHelp) {
		push();
		textSize(10);
		const txt = `Mouse ${mouseX},${mouseY}`;
		drawText(txt, 1100, 770);
		pop();
	}
}

function draw() {
	const currentTime = Date.now();
	const elapsedTime = currentTime - lastTime;
	processInput();
	update(elapsedTime);
	render();
	lastTime = currentTime;
}

function mouseClicked() {
	toolManager.mouseClicked();
	uiManager.mouseClicked();
}

function keyPressed() {
	if (key === 'H') {
		toggleHelp = !toggleHelp;
	}

	if (key === 'S') {
		doSave();
	}

	if (keyCode === 27) {
		// ESC
		toolManager.setTool(null);
	}
}
