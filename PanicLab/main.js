const uiManager = new UIManager();
const windowWidth = 1400;
const windowHeight = 800;
uiManager.loggerContainer = new LoggerContainer(windowWidth-500, windowHeight-300, 240, 100);
uiManager.loggerContainer.visible = true;

const toolManager = new ToolManager();
const jobManager = new JobManager();
const soundManager = new SoundMgr();
const spritesheet = new SpriteSheet();

let selectedCardIndex = -1;
let monsterIndex = -1;

const GAME_LOADING_STATE = 0;
const GAME_START_STATE = 1;
const GAME_PLAY_STATE = 2;
const GAME_OVER_STATE = 3;
let curState = GAME_LOADING_STATE;
let toggleDebug = false;
let lastTime = 0;

function preload() {
}

function musicClicked() {
	// TODO
}

const speakerStorageKey = 'DrDr3ck/GameEngine/Speaker';
function speakerClicked() {
	speakerButton.checked = !speakerButton.checked;
	soundManager.mute(!speakerButton.checked);
	localStorage.setItem(speakerStorageKey, speakerButton.checked?"on":"off");
}

function startClicked() {
	curState = GAME_PLAY_STATE;
	uiManager.setUI([ speakerButton, musicButton, roleDiceButton ]);
	uiManager.addLogger("Start game");
}

const speakerButton = new BFloatingSwitchButton(windowWidth - 70 - 10 - 70, 70, '\uD83D\uDD0A', speakerClicked);
const musicButton = new BFloatingSwitchButton(windowWidth - 70, 70, '\uD83C\uDFB6', musicClicked);
const startButton = new BButton(250, windowHeight - 50 - 200, "START", startClicked);

const roleDiceButton = new BFloatingButton(666, 80, '\u2685', ()=>{
	board.roleDices();
	roleDiceButton.enabled = false;
	selectedCardIndex = -1;
	monsterIndex = board.getMonster();
});

const resetDice = () => {
	roleDiceButton.enabled = true;
}

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
	angleMode(DEGREES);
	canvas = createCanvas(windowWidth, windowHeight);
    canvas.parent('canvas');

	spritesheet.addSpriteSheet('cards', './cards.png', 205, 205);
	spritesheet.addSpriteSheet('dices', './dices.png', 70, 70);

	soundManager.addSound('dice-rolling', './dice-rolling.wav', 1);
	soundManager.addSound('loose', './loose.wav', 1);
	soundManager.addSound('win', './win.wav', 1);

    frameRate(60);

    lastTime = Date.now();
}

function updateGame(elapsedTime) {
	if( flashDown ) {
        flash-=2;
    } else {
        flash+=2;
    }
    if( flash < 150 ) {
        flashDown = false;
    }
    if( flash > 250 ) {
        flashDown = true;
    }
}

let board = null;

const Y100 = 100;
const Y600 = 660;
const cardPositions = 
	[
		{X:5,Y:Y100}, {X:220-75,Y:Y100}, {X:360-75,Y:Y100}, {X:500-75,Y:Y100}, {X:640-75,Y:Y100},
		{X:780-75,Y:Y100}, {X:920-75,Y:Y100}, {X:1060-75,Y:Y100}, {X:1200-75,Y:Y100}, {X:1340-75,Y:Y100},

		{X:1340+40+20-12,Y:240}, {X:1340+20+40-22,Y:380}, {X:1340+20+40-32,Y:520}, // 90

		{X:1200+133,Y:Y600+133}, {X:1060+133,Y:Y600+133}, {X:920+133,Y:Y600+133}, {X:780+133,Y:Y600+133}, {X:640+133,Y:Y600+133}, // 180
		{X:500+133,Y:Y600+133}, {X:360+133,Y:Y600+133}, {X:220+133,Y:Y600+133}, {X:80+133,Y:Y600+133},
		
		{X:80-20,Y:520+133}, {X:80-40,Y:380+133}, {X:80-60,Y:240+133}, // 270
	];
const nonRotatedCardPositions = 
	[
		{X:5,Y:Y100}, {X:220-75,Y:Y100}, {X:360-75,Y:Y100}, {X:500-75,Y:Y100}, {X:640-75,Y:Y100},
		{X:780-75,Y:Y100}, {X:920-75,Y:Y100}, {X:1060-75,Y:Y100}, {X:1200-75,Y:Y100}, {X:1340-75,Y:Y100},
		{X:1340-75-10,Y:240}, {X:1340-75-20,Y:380}, {X:1340-75-30,Y:520}, {X:1200,Y:Y600}, {X:1060,Y:Y600}, {X:920,Y:Y600}, {X:780,Y:Y600}, {X:640,Y:Y600},
		{X:500,Y:Y600}, {X:360,Y:Y600}, {X:220,Y:Y600}, {X:80,Y:Y600}, {X:80-20,Y:520}, {X:80-40,Y:380}, {X:80-60,Y:240},
	];

let flash = 250;
let flashDown = true;	

function drawGame() {
	cardPositions.forEach((c,i)=>{
		push();
		translate(c.X, c.Y);
		if( i >= 10 && i <= 12 ) {
			rotate(90);
		} else if( i >= 13 && i <= 21 ) {
			rotate(180);
		} else if( i >= 22 && i <= 24 ) {
			rotate(270);
		}
		spritesheet.drawScaledSprite('cards', board.cards[i].cardIndex, 0, 0, 0.65)
		pop();
	});

	noFill();
	stroke(0);
	strokeWeight(3);
	board.dices.forEach((d,i)=>{
		spritesheet.drawScaledSprite('dices', board.dices[i].getFace().index, 460+100*i, 380, 1)
		rect(460+100*i, 380,70, 70, 5);
	});

	if( selectedCardIndex !== -1 && monsterIndex !== -1 ) {
		strokeWeight(8);
		const select = nonRotatedCardPositions[selectedCardIndex];
		stroke(255,228,180,flash);
		rect(select.X-3, select.Y-3, 205*0.65+6, 205*0.65+6, 12);

		const monster = nonRotatedCardPositions[monsterIndex];
		stroke(255,80,80,flash);
		rect(monster.X-3, monster.Y-3, 205*0.65+6, 205*0.65+6, 12);
	}
}

function initGame() {
	board = new Board();
	board.init();
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
		cardPositions.forEach((c,i)=>{
			push();
			translate(c.X, c.Y);
			if( i >= 10 && i <= 12 ) {
				rotate(90);
			} else if( i >= 13 && i <= 21 ) {
				rotate(180);
			} else if( i >= 22 && i <= 24 ) {
				rotate(270);
			}
			spritesheet.drawScaledSprite('cards', 17, 0, 0, 0.65)
			pop();
		});
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
	if( toggleDebug ) {
		uiManager.addLogger(`X=${mouseX}, Y=${mouseY}`);
	}
	if( selectedCardIndex === -1 ) {
		const cardWidth = 205*0.65;
		nonRotatedCardPositions.forEach((c,i)=>{
			if( mouseX > c.X && mouseX < c.X+cardWidth && mouseY > c.Y && mouseY < c.Y+cardWidth ) {
				//uiManager.addLogger(board.cards[i].type);
				selectedCardIndex = i;
				if( monsterIndex === selectedCardIndex ) {
					uiManager.addLogger("You win !!");
					soundManager.playSound('win');
				} else {
					uiManager.addLogger("You loose !!");
					soundManager.playSound('loose');
				}
				resetDice();
			}
		});
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