const window_width = window.screen.width > 1280 ? 1280 : window.screen.width;
const window_height = window.screen.height > 800 ? 800 : window.screen.height;

const uiManager = new UIManager();
uiManager.loggerContainer = new LoggerContainer(
	window_width - 240,
	window_height - 300,
	240,
	100
);
uiManager.loggerContainer.visible = true;

const toolManager = new ToolManager();
const jobManager = new JobManager();
const spritesheet = new SpriteSheet();

const GAME_START_STATE = 1;
const GAME_PLAY_STATE = 2;
const GAME_WIN_STATE = 3;
let gameState = GAME_START_STATE;
const PLAYER_PLAY = 1;
const PLAYER_COMMUNICATE = 2;
const PLAYER_SELECT_CARD = 3;
const PLAYER_WAIT = 4;
const PLAYERS_WIN = 5;
const PLAYERS_LOOSE = 6;
let playerState = PLAYER_WAIT;
let selectedPawn = null;
let moves = [];
let selectablePawns = [];
let force = false;

let clickedCard = null;

let toggleDebug = false;

function startClicked() {
    gameState = GAME_PLAY_STATE;
	uiManager.setUI([]);
	board = new Board();
	board.init();
}

const startButton = new BButton(130, 480, "START", startClicked);
startButton.setTextSize(45);
startButton.visible = false;
const menu = [startButton];
uiManager.setUI(menu);

let lastTime = 0;

let board = null;

function setup() {
	canvas = createCanvas(window_width, window_height);
	canvas.parent("canvas");

	frameRate(60);

	//spritesheet.addSpriteSheet('cards', './cards.png', 50, 50);
	spritesheet.addSpriteSheet('icons', './icons.png', 200, 200);

	uiManager.addLogger("Palm Island");
	uiManager.addLogger(`Screen size: ${window.screen.width.toString()}x${window.screen.height.toString()}`);
	lastTime = Date.now();
}

let debugCurCard = 0;

function drawBoard() {
	if (gameState === GAME_PLAY_STATE) {
		const cards = board.getCards();
		drawCard(cards[debugCurCard], window_width/3, 300);
	}
}

function drawCard(card, X, Y) {
	const cardHeight = 340;
	const cardWidth = 240;
	fill(50,50,150,150);
	rect(X, Y, cardWidth, cardHeight, 20);
	fill(150);
	stroke(0);
	ellipse(X+cardWidth/2, Y+cardHeight/4, 160, 40);

	stroke(1);
	textAlign(CENTER, CENTER);
	textSize(15);
	fill(255);
	text(card.name, X+cardWidth/2,Y+cardHeight/4);	
	text(card.id.toString(), X + 15, Y+15);

	const ressources = card.getRessources();
	if( ressources.length > 0 ) {
		// draw ressource
		const Xrl = [520, 490, 460];
		const Xr = Xrl[ressources.length-1];
		ressources.forEach((ressource,i) => {
			if( ressource === "fish" ) {
				spritesheet.drawScaledSprite('icons', CardType.Fish, Xr+i*60, Y + 10, 1/4);
			} else if( ressource === "wood" ) {
				spritesheet.drawScaledSprite('icons', CardType.Wood, Xr+i*60, Y + 10, 1/4);
			} else if( ressource === "stone" ) {
				spritesheet.drawScaledSprite('icons', CardType.Stone, Xr+i*60, Y + 10, 1/4);
			}
		});
	}
	const point = card.getPoint();
	if( point > 0 ) {
		text(point.toString(), X + 15, Y+15+30);
	}
	const rank = card.getRank();
	if( rank > 0 ) {
		text(rank.toString(), X + cardWidth - 15, Y+15+30);
	}
	const actions = card.getActions();
	actions.forEach((action,i) => {
		if( board.canPay(action.cout) ) {
			stroke(200,200,50);
 		} else {
			stroke(0);
		}
		if( action.type === Action.Stocker ) {
			fill(50,180,50);
			ellipse(X+cardWidth/4, Y+cardHeight/3 + 20 + i*30, 20, 20);
		} else if( action.type === Action.Pivoter ) {
			fill(180,180,50);
			ellipse(X+cardWidth/4, Y+cardHeight/3 + 20 + i*30, 20, 20);
		} else if( action.type === Action.Retourner ) {
			fill(50,50,180);
			ellipse(X+cardWidth/4, Y+cardHeight/3 + 20 + i*30, 20, 20);
		}
		if( action.cout.length === 0 ) {
			stroke(0);
			fill(255);
			text("Gratuit", X+cardWidth/4 + 40, Y+cardHeight/3 + 20 + i*30);	
		} else {
			action.cout.forEach((cout,j)=> {
				if( cout === "fish" ) {
					spritesheet.drawScaledSprite('icons', CardType.Fish, X+cardWidth/4 + 20 +j*40, Y+cardHeight/3 + i*30, 1/6);
				} else if( cout === "wood" ) {
					spritesheet.drawScaledSprite('icons', CardType.Wood, X+cardWidth/4 + 20 +j*40, Y+cardHeight/3 + i*30, 1/6);
				} else if( cout === "stone" ) {
					spritesheet.drawScaledSprite('icons', CardType.Stone, X+cardWidth/4 + 20 +j*40, Y+cardHeight/3 + i*30, 1/6);
				}
			});
		}
	});


}

function draw() {
	const currentTime = Date.now();
	const elapsedTime = currentTime - lastTime;
	background(51);

	uiManager.processInput();
	uiManager.update(elapsedTime);

	drawBoard();

	if (gameState === GAME_START_STATE || gameState === GAME_WIN_STATE) {
		background(51, 51, 51, 200);
	}

	uiManager.draw();

	if (playerState === PLAYERS_WIN) {
		push();
		textAlign(CENTER, CENTER);
		textSize(50);
		text("You win!", width / 2, height / 2);
		pop();
	} else if( playerState === PLAYERS_LOOSE ) { // TODO: no cards for anyone!!
		push();
		textAlign(CENTER, CENTER);
		textSize(50);
		text("You loose!", width / 2, height / 2);
		pop();
	}

	if (gameState === GAME_PLAY_STATE) {
		if (toolManager.currentTool) {
			toolManager.currentTool.draw();
		}
		jobManager.draw();
	}

	lastTime = currentTime;
}

function mouseClicked() {
	toolManager.mouseClicked();
	uiManager.mouseClicked();
	return false;
}

function mousePressed() {
	console.log(mouseX, mouseY);
}

function mouseReleased() {
}

function keyPressed() {
	if (key === "D") {
		toggleDebug = !toggleDebug;
	}
	if (key === "N") {
		debugCurCard = (debugCurCard+1) % board.cards.length;
	}
	if (key === "S") {
		const card = board.cards[debugCurCard];
		if( card.side < 3 ) {
			card.side = card.side + 1;
		} else {
			card.side = 0;
		}
	}
}

