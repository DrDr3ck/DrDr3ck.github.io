const uiManager = new UIManager();
const windowWidth = 1460;
const windowHeight = 900;
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

let board = [];

let players = [];

function preload() {
}

function initUI() {
 	const menu = [ ];
	uiManager.setUI(menu);
}

function setup() {
    initUI();
	canvas = createCanvas(windowWidth, windowHeight);
    canvas.parent('canvas');

    frameRate(60);

	spritesheet.addSpriteSheet('timeline', './timeline.png', 1020, 225);
	spritesheet.addSpriteSheet('cartes', './cartes.png', 255, 250);
	spritesheet.addSpriteSheet('personnage', './personnage.png', 1170, 830);
	spritesheet.addSpriteSheet('actions', './actions.png', 134, 134);
	spritesheet.addSpriteSheet('avatars', './avatars.png', 134, 134);

    lastTime = Date.now();
}

function updateGame(elapsedTime) {

}

function drawGame() {
	const timeScale = 0.85;
	spritesheet.drawScaledSprite('timeline', 0, windowWidth/2-1020*timeScale/2, windowHeight - 225*timeScale - 10, timeScale);

	const X = 415;
	const Y = 30;
	for( let j=0; j < 5; j++ ) {
		for( let i=0; i < 5; i++ ) {
			spritesheet.drawScaledSprite('cartes', board[i][j].card, X+125*i, Y+125*j, 0.5);
		}
	}

	players.forEach(p=>{
		const X = 415+125*2 + p.x;
		const Y = 30+125*2 + p.y;
		stroke(0);
		fill(p.color.r,p.color.g,p.color.b);
		ellipse(X,Y,30,30);
	});

	spritesheet.drawSprite('avatars', 0, 20, 20);
	spritesheet.drawSprite('avatars', 1, windowWidth - 20 - 134, 20);
	spritesheet.drawSprite('avatars', 2, windowWidth - 20 - 134, 650-134);
	spritesheet.drawSprite('avatars', 3, 20, 650-134);

	const actionScale = 0.75;
	spritesheet.drawScaledSprite('actions', 0, 10, 20+134+10, actionScale);
	spritesheet.drawScaledSprite('actions', 1, 10+134*actionScale, 20+134+10, actionScale);
	spritesheet.drawScaledSprite('actions', 2, 10+2*134*actionScale, 20+134+10, actionScale);
	spritesheet.drawScaledSprite('actions', 3, 10+3*134*actionScale, 20+134+10, actionScale);

	spritesheet.drawScaledSprite('actions', 0, 10, 650-134-10-134*actionScale, actionScale);
	spritesheet.drawScaledSprite('actions', 1, 10+134*actionScale, 650-134-10-134*actionScale, actionScale);
	spritesheet.drawScaledSprite('actions', 2, 10+2*134*actionScale, 650-134-10-134*actionScale, actionScale);
	spritesheet.drawScaledSprite('actions', 3, 10+3*134*actionScale, 650-134-10-134*actionScale, actionScale);

	spritesheet.drawScaledSprite('actions', 0, windowWidth - 10 -134*actionScale, 20+134+10, actionScale);
	spritesheet.drawScaledSprite('actions', 1, windowWidth - 10 -2*134*actionScale, 20+134+10, actionScale);
	spritesheet.drawScaledSprite('actions', 2, windowWidth - 10 -3*134*actionScale, 20+134+10, actionScale);
	spritesheet.drawScaledSprite('actions', 3, windowWidth - 10 -4*134*actionScale, 20+134+10, actionScale);

	spritesheet.drawScaledSprite('actions', 0, windowWidth - 10 -134*actionScale, 650-134-10-134*actionScale, actionScale);
	spritesheet.drawScaledSprite('actions', 1, windowWidth - 10 -2*134*actionScale, 650-134-10-134*actionScale, actionScale);
	spritesheet.drawScaledSprite('actions', 2, windowWidth - 10 -3*134*actionScale, 650-134-10-134*actionScale, actionScale);
	spritesheet.drawScaledSprite('actions', 3, windowWidth - 10 -4*134*actionScale, 650-134-10-134*actionScale, actionScale);

	if( clickedCardValue > 0 ) {
		spritesheet.drawSprite('cartes', clickedCardValue, 1090, 150);
	}
}

function initGame() {
	board.push([{card: 0}, {card: 0}, {card: 0}, {card: 0}, {card: 0}]);
	board.push([{card: 0}, {card: 0}, {card: 0}, {card: 0}, {card: 0}]);
	board.push([{card: 0}, {card: 0}, {card: 1}, {card: 0}, {card: 0}]);
	board.push([{card: 0}, {card: 0}, {card: 0}, {card: 0}, {card: 0}]);
	board.push([{card: 0}, {card: 0}, {card: 0}, {card: 0}, {card: 2}]);

	players.push(
		{name: "Jennifer", id: 0, color: {r:191,g:148,b:45}, x: 255/2-25, y: 25}
	);
	players.push(
		{name: "Jack", id: 1, color: {r:101,g:118,b:143}, x: 25, y: 25}
	);
	players.push(
		{name: "Jack", id: 2, color: {r:124,g:135,b:67}, x: 255/2-25, y: 250/2-25}
	);
	players.push(
		{name: "Jack", id: 3, color: {r:151,g:115,b:148}, x: 25, y: 250/2-25}
	);
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

let clickedCardValue = -1;

function getClickedCard(curX,curY) {
	const between = (min, value, max) => {
		return value >= min && value <= max;
	}

	const X = 430;
	const Y = 30;
	for( let j=0; j < 5; j++ ) {
		for( let i=0; i < 5; i++ ) {
			if( between(X+125*i, curX, X+125*i+125) && between(Y+125*j, curY, Y+125*j+125) ) {
				return board[i][j].card;
			}
		}
	}
	return -1;
}

function mouseClicked() {
	uiManager.addLogger(`mouseX: ${mouseX}`);
	uiManager.addLogger(`mouseY: ${mouseY}`);
	toolManager.mouseClicked();
	uiManager.mouseClicked();

	clickedCardValue = getClickedCard(mouseX, mouseY);

	return false;
}