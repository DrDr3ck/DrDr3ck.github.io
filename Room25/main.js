const uiManager = new UIManager();
const windowWidth = 1460;
const windowHeight = 900;
uiManager.loggerContainer = new LoggerContainer(160, 510, 240, 100);
uiManager.loggerContainer.visible = true;

const toolManager = new ToolManager();
const jobManager = new JobManager();
const soundManager = new SoundMgr();
const spritesheet = new SpriteSheet();

const GAME_LOADING_STATE = 0;
const GAME_START_STATE = 1;
const GAME_PLAY_STATE = 2;
const GAME_OVER_STATE = 3;
const GAME_STOP_STATE = 4;
let curState = GAME_LOADING_STATE;

let lastTime = 0;

let board = [];

let players = [];

let turn = 0;
let curPlayerIndex = 0;

class Player {
	constructor(name, color, id, position) {
		this.name = name;
		this.color = color;
		this.id = id;
		this.position = position;
		this.actions = [];
	}

	clickAction(i) {
		if( this.id !== players[curPlayerIndex].id ) {
			uiManager.addLogger("Not the current player...")
			return;
		}
		this.actions[i].enabled = false;
		this.actions[i].img = spritesheet.getImage('avatars', this.id);
		curPlayerIndex = (curPlayerIndex+1)%4;
	}

	resetActions() {
		curPlayerIndex = 0;
		for( let i=0; i < 4; i++ ) {
			this.actions[i].enabled = true;
			this.actions[i].img = spritesheet.getImage('actions', i);
		}
	}

	getActionButtons() {
		const actionButtons = [];
		const actionScale = 0.75;
		for( let i= 0; i < 4; i++ ) {
			const X = this.position.left ? this.position.x+134*actionScale*i : this.position.x -134*actionScale*(i+1);
			const Y = this.position.top ? 20+134+10 : 650-134-10-134*actionScale;
			actionButtons.push(new BImageButton(X, Y, spritesheet.getImage('actions', i), ()=>{this.clickAction(i);}));
		}
		actionButtons.forEach(b=>b.scale = actionScale);
		this.actions = actionButtons;
		return actionButtons;
	}

	draw(playerIndex) {
		const X = this.position.x+(this.position.left?10:-10-134);
		const Y = this.position.y;
		spritesheet.drawSprite('avatars', this.id, X, Y);
		if( playerIndex === curPlayerIndex ) {
			push();
			noFill();
			stroke(255,215,0);
			strokeWeight(3);
			rect(X,Y,134,134);
			pop();
		}
	}
}

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
	spritesheet.drawScaledSprite('timeline', 0, 50, windowHeight - 225*timeScale - 10, timeScale);

	const X = 415;
	const Y = 30;
	for( let j=0; j < 5; j++ ) {
		for( let i=0; i < 5; i++ ) {
			spritesheet.drawScaledSprite('cartes', board[i][j].card, X+125*i, Y+125*j, 0.5);
		}
	}

	players.forEach((p,i)=>{
		const X = 415+125*2 + p.position.tileX;
		const Y = 30+125*2 + p.position.tileY;
		stroke(0);
		fill(p.color.r,p.color.g,p.color.b);
		ellipse(X,Y,30,30);
		p.draw(i);
		rect(250+55*(i+turn), 780, 55, 90);
		fill(250);
		textAlign(LEFT, TOP);
		text(i+1, 250+55*(i+turn)+15, 780+20);
	});

	if( clickedCardValue > 0 ) {
		spritesheet.drawSprite('cartes', clickedCardValue, 1045, 640);
	}
}

function nextTurn() {
	players.forEach(p=>p.resetActions());
	turn++;
	if( turn === 8 ) {
		curState = GAME_STOP_STATE
	}
	const p = players.shift();
	players.push(p);
}

function initGame() {
	board.push([{card: 0}, {card: 0}, {card: 0}, {card: 0}, {card: 0}]);
	board.push([{card: 0}, {card: 0}, {card: 0}, {card: 0}, {card: 0}]);
	board.push([{card: 0}, {card: 0}, {card: 1}, {card: 0}, {card: 0}]);
	board.push([{card: 0}, {card: 0}, {card: 0}, {card: 0}, {card: 0}]);
	board.push([{card: 0}, {card: 0}, {card: 0}, {card: 0}, {card: 2}]);

	players.push(new Player("Jack", {r:101,g:118,b:143}, 0, {x: 10, y: 20, left: true, top: true, tileX: 25, tileY: 25}));
	players.push(new Player("Jennifer", {r:191,g:148,b:45}, 1, {x: windowWidth - 10, y: 20, left: false, top: true, tileX: 255/2-25, tileY: 25}));
	players.push(new Player("Kevin", {r:124,g:135,b:67}, 2, {x: windowWidth - 10, y: 650-134, left: false, top: false, tileX: 255/2-25, tileY: 250/2-25}));
	players.push(new Player("Alice", {r:151,g:115,b:148}, 3, {x: 10, y: 650-134, left: true, top: false, tileX: 25, tileY: 250/2-25}));

	const menu = [ ...players[0].getActionButtons(), ...players[1].getActionButtons(), ...players[2].getActionButtons(), ...players[3].getActionButtons() ];
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
		curState = GAME_START_STATE;

        // init game
        initGame();
		textAlign(LEFT, BASELINE);
		uiManager.addLogger('Room 25 - solo');
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
	if (curState === GAME_STOP_STATE) {
		// END OF GAME
	}

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

function keyPressed() {
	if( key === "N" ) {
		nextTurn();
	}
}