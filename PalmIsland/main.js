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
const GAME_END_STATE = 4;
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

function drop1Clicked() {
	uiManager.addLogger("drop first card");
	board.dropCard(0);
	resetButtons();
}

function stock1Clicked() {
	// TODO
	uiManager.addLogger("stock first card");
	board.stockCard(0);
	resetButtons();
}

function pivot1Clicked() {
	// TODO
	uiManager.addLogger("pivot first card");
	board.pivotCard(0);
	resetButtons();
}

function return1Clicked() {
	// TODO
	uiManager.addLogger("return first card");
	board.returnCard(0);
	resetButtons();
}

function drop2Clicked() {
	uiManager.addLogger("drop second card");
	board.dropCard(1);
	resetButtons();
}

function stock2Clicked() {
	// TODO
	uiManager.addLogger("stock second card");
	board.stockCard(1);
	resetButtons();
}

function pivot2Clicked() {
	// TODO
	uiManager.addLogger("pivot second card");
	board.pivotCard(1);
	resetButtons();
}

function return2Clicked() {
	// TODO
	uiManager.addLogger("return second card");
	board.returnCard(1);
	resetButtons();
}

const drop1Button = new BFloatingButton(680, 720, "D", drop1Clicked);
drop1Button.setTextSize(45);
const stock1Button = new BFloatingButton(740, 720, "S", stock1Clicked);
stock1Button.setTextSize(45);
stock1Button.color= {r: 50, g: 180, b: 50};
const pivot1Button = new BFloatingButton(800, 720, "P", pivot1Clicked);
pivot1Button.setTextSize(45);
pivot1Button.color= {r: 220, g: 220, b: 50};
const return1Button = new BFloatingButton(860, 720, "R", return1Clicked);
return1Button.setTextSize(45);
return1Button.color= {r: 50, g: 50, b: 180};

const drop2Button = new BFloatingButton(680-250, 720, "D", drop2Clicked);
drop2Button.setTextSize(45);
const stock2Button = new BFloatingButton(740-250, 720, "S", stock2Clicked);
stock2Button.setTextSize(45);
stock2Button.color= {r: 50, g: 180, b: 50};
const pivot2Button = new BFloatingButton(800-250, 720, "P", pivot2Clicked);
pivot2Button.setTextSize(45);
pivot2Button.color= {r: 220, g: 220, b: 50};
const return2Button = new BFloatingButton(860-250, 720, "R", return2Clicked);
return2Button.setTextSize(45);
return2Button.color= {r: 50, g: 50, b: 180};

function startClicked() {
    gameState = GAME_PLAY_STATE;
	uiManager.setUI([drop1Button, stock1Button, pivot1Button, return1Button, drop2Button, stock2Button, pivot2Button, return2Button]);
	board = new Board();
	board.init();
	resetButtons();
}

function resetButtons() {
	let firstCard = board.getCards()[0];
	// if first card is the 'Tour' card and rank === 8: end of game
	if( firstCard.id === 17 && firstCard.ranks[0] === 8 ) {
		gameState = GAME_END_STATE;
		drop1Button.visible = false;
		stock1Button.visible = false;
		pivot1Button.visible = false;
		return1Button.visible = false;
		drop2Button.visible = false;
		stock2Button.visible = false;
		pivot2Button.visible = false;
		return2Button.visible = false;
		let score = 0;
		board.getCards().forEach(card => {
			score += card.getPoint();
		});
		uiManager.addLogger(`Score: ${score}`);
		board.setScore(score);
		return;
	}
	// check if first card is a stocked card
	while( firstCard.state === CardState.Stock ) {
		firstCard.state = CardState.Normal;
		uiManager.addLogger("Restore stocked card", firstCard.id);
		board.dropCard(0);
		firstCard = board.getCards()[0];
	}
	// recompute Ressources
	board.resetRessources();
	// check which buttons should be visible/disabled
	const card1 = board.getCards()[0];
	stock1Button.visible = false;
	pivot1Button.visible = false;
	return1Button.visible = false;
	card1.getActions().forEach(action=>{
		if( action.type === Action.Stocker ) {
			stock1Button.visible = board.canPay(action.cout);
		}
		if( action.type === Action.Pivoter ) {
			pivot1Button.visible = board.canPay(action.cout);
		}
		if( action.type === Action.Retourner ) {
			return1Button.visible = board.canPay(action.cout);
		}
	});
	const card2 = board.getCards()[1];
	drop2Button.visible = false;
	stock2Button.visible = false;
	pivot2Button.visible = false;
	return2Button.visible = false;
	if( card2.state === CardState.Stock || card2.id === 17  || card1.id === 17) {
		// 1. no action if card is a stocked card
		// 2. if card is the 'Turn' one, need to play the card1 first
		return;
	}
	drop2Button.visible = true;
	card2.getActions().forEach(action=>{
		if( action.type === Action.Stocker ) {
			stock2Button.visible = board.canPay(action.cout);
		}
		if( action.type === Action.Pivoter ) {
			pivot2Button.visible = board.canPay(action.cout);
		}
		if( action.type === Action.Retourner ) {
			return2Button.visible = board.canPay(action.cout);
		}
	});
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
		drawRessources();

		const cards = board.getCards();
		drawCard(cards[0], window_width/3+250, 300);
		drawCard(cards[1], window_width/3, 300);
		drawEmptyCard(window_width/3-250-4, 100-4);
		drawEmptyCard(window_width/3-250-2, 100-2);
		drawCard(cards[2], window_width/3-250, 100);
	} else if( gameState === GAME_END_STATE ) {
		// display all cards and display the score
		const cards = board.getCards();
		for( let i = 0; i < 8 ; i++ ) {
			drawCard(cards[i+1], 10+100*i, 10);
			drawCard(cards[i+9], 10+100*i, 410);
		}
	}
}

function drawRessources() {
	const X = 180;
	const Y = 100;
	const cards = board.getCards();
	const Yrl = [170, 155, 120];
	const stockedCards = [];
	cards.forEach(card=>{
		if( card.state === CardState.Stock ) {
			stockedCards.push(card);
		}
	});
	let indexRessource = stockedCards.length-1;
	const cardGap = 80;
	stockedCards.reverse().forEach(card=>{
		const ressources = card.getRessources();
		const Yr = Yrl[ressources.length-1];
		// draw ressource
		strokeWeight(1);
		fill(50,50,150);
		const delta = card.selected ? 10 : 0;
		if( delta > 0 ) {
			stroke(150);
		} else {
			stroke(0);
		}
		rect(X+indexRessource*cardGap, Y - delta, cardHeight, cardWidth, 20);
		ressources.forEach((ressource,i)=>{
			drawRessourceSprite(X+cardHeight-60+indexRessource*cardGap,Yr+60*i - delta,ressource,1/4);
		});
		// draw card id
		stroke(1);
		textAlign(CENTER, CENTER);
		textSize(15);
		fill(155);
		text(card.id.toString(), X+indexRessource*cardGap + cardHeight - 20, Y+10 - delta);

		indexRessource--;
	});
}

function drawRessourceSprite(X,Y,type, scale) {
	if( type === "fish" ) {
		spritesheet.drawScaledSprite('icons', CardType.Fish, X, Y, scale);
	} else if( type === "wood" ) {
		spritesheet.drawScaledSprite('icons', CardType.Wood, X, Y, scale);
	} else if( type === "stone" ) {
		spritesheet.drawScaledSprite('icons', CardType.Stone, X, Y, scale);
	}
}

const cardHeight = 340;
const cardWidth = 240;

function drawEmptyCard(X, Y, isStockedCard=false) {
	if( isStockedCard ) {
		stroke(150,10,10);
		strokeWeight(3);
	} else {
		stroke(0);
		strokeWeight(1);
	}
	fill(50,50,150);
	rect(X, Y, cardWidth, cardHeight, 20);
	fill(150);
	stroke(0);
	strokeWeight(1);
	ellipse(X+cardWidth/2, Y+cardHeight/4, 160, 40);
}

function drawCard(card, X, Y) {
	drawEmptyCard(X,Y,card.state === CardState.Stock);

	stroke(1);
	textAlign(CENTER, CENTER);
	textSize(15);
	fill(255);
	text(card.name, X+cardWidth/2,Y+cardHeight/4);	
	fill(155);
	text(card.id.toString(), X + 15, Y+15);

	const ressources = card.getRessources();
	if( ressources.length > 0 ) {
		// draw ressource
		const delta = 420;
		const Xrl = [520-delta, 490-delta, 460-delta];
		const Xr = Xrl[ressources.length-1];
		ressources.forEach((ressource,i) => {
			drawRessourceSprite(X+Xr+i*60, Y + 10, ressource, 1/4);
		});
	}
	const point = card.getPoint();
	if( point > 0 ) {
		fill(205,205,15);
		text(point.toString(), X + 15, Y+15+30);
	}
	const rank = card.getRank();
	if( rank > 0 ) {
		fill(255);
		text(rank.toString(), X + cardWidth - 15, Y+15+30);
	}
	const actions = card.getActions();
	actions.forEach((action,i) => {
		if( board.canPay(action.cout) ) {
			stroke(200);
			strokeWeight(2);
 		} else {
			stroke(0);
			strokeWeight(1);
		}
		if( action.type === Action.Stocker ) {
			fill(50,180,50);
			ellipse(X+20, Y+cardHeight/3 + 20 + i*30, 20, 20);
		} else if( action.type === Action.Pivoter ) {
			fill(220,220,50);
			ellipse(X+20, Y+cardHeight/3 + 20 + i*30, 20, 20);
		} else if( action.type === Action.Retourner ) {
			fill(50,50,180);
			ellipse(X+20, Y+cardHeight/3 + 20 + i*30, 20, 20);
		}
		stroke(0);
		if( action.cout.length === 0 ) {
			fill(255);
			text("Gratuit", X+20 + 40, Y+cardHeight/3 + 20 + i*30);	
		} else {
			action.cout.forEach((cout,j)=> {
				drawRessourceSprite(X+20 + 20 +j*40, Y+cardHeight/3 + i*30, cout, 1/6);
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
	if (key === "R") {
		console.log(board.ressources);
	}
	if (key === "S") {
		const card = board.cards[debugCurCard];
		if( card.side < 3 ) {
			card.side = card.side + 1;
		} else {
			card.side = 0;
		}
	}

	if( key === "T") {
		const actions = board.cards[0].getActions();
		actions.forEach((action,i) => {
		  board.canPay(action.cout, true);
		});
	}
}

