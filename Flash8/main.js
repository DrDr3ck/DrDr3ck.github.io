const uiManager = new UIManager();
const windowWidth = 1400;
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
let toggleDebug = false;
let lastTime = 0;

const VIDE=0;
const ROUGE=1;
const VIOLET=2;
const VERT=3;
const JAUNE=4;
const BLEU=5;

const directions = [
	[1,3],
	[0,2,4],
	[1,5],
	[0,4,6],
];

const board = [1,2,3,4,0,4,5,5,5];

let overCell = -1;

function preload() {
}

function musicClicked() {
	// TODO
}

const speakerStorageKey = 'DrDr3ck/Flash8/Speaker';
function speakerClicked() {
	speakerButton.checked = !speakerButton.checked;
	soundManager.mute(!speakerButton.checked);
	localStorage.setItem(speakerStorageKey, speakerButton.checked?"on":"off");
}

function startClicked() {
	curState = GAME_PLAY_STATE;
	uiManager.setUI([ speakerButton, musicButton ]);
	uiManager.addLogger("Start game");
}

const speakerButton = new BFloatingSwitchButton(windowWidth - 70 - 10 - 70, 70, '\uD83D\uDD0A', speakerClicked);
const musicButton = new BFloatingSwitchButton(windowWidth - 70, 70, '\uD83C\uDFB6', musicClicked);
const startButton = new BButton(80, windowHeight - 50 - 200, "START", startClicked);

function initUI() {
    speakerButton.setTextSize(50);
	musicButton.setTextSize(50);
	musicButton.enabled = false;
	musicButton.checked = false;
	const isSpeakerOn = localStorage.getItem(speakerStorageKey);
	if( isSpeakerOn === "off" ) {
		speakerButton.checked = false;
		soundManager.mute(true);
	}
	const menu = [ speakerButton, startButton, musicButton ];
	uiManager.setUI(menu);
}

function setup() {
    initUI();
	canvas = createCanvas(windowWidth, windowHeight);
    canvas.parent('canvas');

	spritesheet.addSpriteSheet('electron', './electrons.png', 180, 180);

    frameRate(60);

    lastTime = Date.now();
}

function updateGame(elapsedTime) {

}

function clickElectron(electronIndex) {
	const blankIndex = board.indexOf(0);
	if( blankIndex >= 0 ) {
		board[blankIndex] = board[electronIndex];
		board[electronIndex] = 0;
	}
}

function drawElectron(electron, X, Y) {
	spritesheet.drawSprite('electron', electron-1, X*180+80, Y*180+180);
}

function drawGame() {
	// draw electrons
	board.forEach((electron, index)=> {
		if( electron ) {
			const X = floor(index/3);
			const Y = index%3;
			drawElectron(electron, X, Y)
			if( index === overCell ) {
				noFill();
				stroke(0);
				rect(X*180+80, Y*180+180, 180, 180);
			}
		}
	});
}

function initGame() {

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
		curState = GAME_START_STATE;

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
	if( curState === GAME_START_STATE ) {
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

function mouseMoved() {
	overCell = -1;
	board.forEach((electron,i)=>{
		const X = floor(i/3)*180+80;
		const Y = (i%3)*180+180;
		if( mouseX >= X && mouseY >= Y && mouseX <= X+180 && mouseY <= Y+180) {
			overCell = i;
		}
	});
}

function mouseClicked() {
	if( toggleDebug ) {
		uiManager.addLogger(`X=${mouseX}, Y=${mouseY}`);
	}

	if( overCell >= 0 ) {
		// you clicked on an electron: move it to blank cell.
		clickElectron(overCell);
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