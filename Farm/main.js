const uiManager = new UIManager();
const windowWidth = 1200;
const windowHeight = 800;
uiManager.loggerContainer = new LoggerContainer(windowWidth-300, windowHeight-100, 240, 100);
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

let lastTime = 0;

function getData() {
	const data = {
		speaker: speakerButton.checked,
		help: helpButton.checked
	};
	return data;
}

const storageKey = 'F4RM';

function saveData() {
	const data = JSON.stringify(getData());
	if (data && data !== 'null') {
		localStorage.setItem(storageKey, data);
		console.log('saving ', data);
		uiManager.addLogger('Saved');
	}
}

function loadData() {
	const storage = localStorage.getItem(storageKey);
	const initialData = getData();
	let data = initialData;
	if (storage) {
		data = JSON.parse(storage) || initialData;
		for (var k in initialData) {
			if (data[k] == undefined) {
				data[k] = initialData[k];
			}
		}
	}
	speakerButton.checked = data.speaker;
	soundManager.mute(!speakerButton.checked);
	helpButton.checked = data.help;
}

function preload() {
}

function musicClicked() {
	// TODO
}

function speakerClicked() {
	speakerButton.checked = !speakerButton.checked;
	soundManager.mute(!speakerButton.checked);
	saveData();
}

const speakerButton = new BFloatingButton(windowWidth - 70 - 10 - 70, 70, '\uD83D\uDD0A', speakerClicked);
const musicButton = new BFloatingButton(windowWidth - 70, 70, '\uD83C\uDFB6', musicClicked);
const helpButton = new BFloatingButton(20, 60, '\u003F', () => {
	helpButton.checked = !helpButton.checked;
	saveData();
});

function initUI() {
    speakerButton.setTextSize(50);
	musicButton.setTextSize(50);
	musicButton.enabled = false;
	musicButton.checked = false;
	helpButton.setTextSize(30);
	helpButton.checked = false;
}

const FPS = 60;

function setup() {
    initUI();
	canvas = createCanvas(windowWidth, windowHeight);
    canvas.parent('canvas');

	frameRate(FPS);
	
	spritesheet.addSpriteSheet('farm_tile', './resources/farm_tile.png', 32, 32);
	spritesheet.addSpriteSheet('farm_animal', './resources/farm_animal.png', 32, 32);

    lastTime = Date.now();
}

let iStart = 0;

function updateGame(elapsedTime) {
	if( keyIsDown(LEFT_ARROW) ) {
		console.log(iStart);
		iStart -= 0.05;
	}
	if( keyIsDown(RIGHT_ARROW) ) {
		iStart += 0.05;
	}
}

// TODO: create world chunk by chunk
function drawGame() {
	push();
	const tileSize = 32;
	let scale = 2;
	translate(tileSize*0, tileSize*10);
	for( let i=Math.floor(iStart); i < Math.floor(iStart)+20; i++) {
		const zRandom = noise(i*0.1);
		const jTop = Math.round(zRandom*4);
		for( let j=0; j < 10; j++) {
			if( j === jTop ) {
				// noise between 0 and 2
				const rdm = noise(i, j);
				spritesheet.drawScaledSprite('farm_tile', Math.round(rdm*4)+4, (i-iStart)*tileSize*scale, j*tileSize*scale, scale);
			} else if( j === jTop+1 ) {
				spritesheet.drawScaledSprite('farm_tile', 0, (i-iStart)*tileSize*scale, j*tileSize*scale, scale);
			} else if( j >= jTop+2 ) {
				spritesheet.drawScaledSprite('farm_tile', 3, (i-iStart)*tileSize*scale, j*tileSize*scale, scale);
			}
		}
	}

	spritesheet.drawScaledSprite('farm_animal', 0, (11-iStart)*tileSize*scale, 1*tileSize*scale, scale);

	spritesheet.drawScaledSprite('farm_animal', 1, (15-iStart)*tileSize*scale, 2*tileSize*scale, scale);

	spritesheet.drawScaledSprite('farm_animal', 2, (8-iStart)*tileSize*scale, 2*tileSize*scale, scale);

	spritesheet.drawScaledSprite('farm_animal', 3, (2-iStart)*tileSize*scale, 2*tileSize*scale, scale);
	pop();
}

function initGame() {
	const menu = [ speakerButton, musicButton, helpButton ];
	uiManager.setUI(menu);
}

function drawLoading() {
	fill(0);
	noStroke();
	textSize(50);
	textAlign(CENTER, CENTER);
	text('Loading...', width / 2, height / 2);
	if (
		soundManager.totalLoadedSounds === soundManager.soundToLoad &&
		spritesheet.totalLoadedImages === spritesheet.totalImagesToLoad
	) {
		curState = GAME_PLAY_STATE; //GAME_START_STATE;

        // init game
        initGame();
		textAlign(LEFT, BASELINE);
		uiManager.addLogger('Game loaded');
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
	if (curState === GAME_PLAY_STATE) {
		updateGame(elapsedTime);
	}
	drawGame();

    uiManager.draw();
	if (toolManager.currentTool) {
		toolManager.currentTool.draw();
	}
    jobManager.draw();
    
    lastTime = currentTime;
}

function mouseClicked() {
	toolManager.mouseClicked();
	uiManager.mouseClicked();
}

function keyPressed() {
}