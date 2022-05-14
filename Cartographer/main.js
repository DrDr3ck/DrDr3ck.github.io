const window_width = window.screen.availWidth > 1460 ? 1460 : window.screen.availWidth;
const window_height = window.screen.availHeight > 800 ? 800 : window.screen.availHeight;

let scale = window_width < 800 ? .5 : 1;

const uiManager = new UIManager();
uiManager.loggerContainer = new LoggerContainer(
	window_width - 240,
	window_height - 300*scale,
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

let curSeasonCards = [];

function startClicked() {
    gameState = GAME_PLAY_STATE;
	uiManager.setUI([nextButton]);
	//board = new Board();
	//board.init();
	cardMgr.init();
	cards = cardMgr.getSeason(Season.Printemps);
	nextClicked();
}

function seasonMaxSum() {
	switch(season) {
		case PRINTEMPS:
		case ETE:
			return 8;
		case AUTOMNE:
			return 7;
		case HIVER:
		default:
			return 6;
	}
}

function seasonName() {
	switch(season) {
		case PRINTEMPS:
			return Season.Printemps;
		case ETE:
			return Season.Ete;
		case AUTOMNE:
			return Season.Automne;
		case HIVER:
		default:
			return Season.Hiver;
	}
}

function boardClicked() {
	window.open("./board.html");
}

// add a card or switch to next season or end the party
function nextClicked() {
	delta = 0;
	if( curSum >= seasonMaxSum() ) {
		uiManager.setUI([nextButton]);
		// change season
		switch(season) {
			case PRINTEMPS:
				season = ETE;
				break;
			case ETE:
				season = AUTOMNE;
				break;
			case AUTOMNE:
				season = HIVER;
				break;
			case HIVER:
			default:
				season = END;
				break;
		}
		// reset cards
		cards = cardMgr.getSeason(seasonName(season));
		curSum = 0;
		curSeasonCards = [];
	}
	const curCard = cards.shift();
	curSeasonCards.push(curCard);
	curSum += times[curCard];
	if( curSum >= seasonMaxSum() ) {
		if( season === HIVER ) {
			uiManager.setUI([]);
		} else {
			uiManager.setUI([newSeason]);
		}
	}
}

const startButton = new BButton(80, window_height - 100, "START", startClicked);
const fullScreenButton = new BFloatingSwitchButton(window_width/2,window_height-100,"F",()=>{
	if(document.fullscreenElement) {
		document.exitFullscreen();
		fullScreenButton.checked = false;
		resizeCanvas(window_width, window_height);
		uiManager.addLogger(`Canvas size: ${window_width.toString()}x${window_height.toString()}`);
	} else {
		document.documentElement.requestFullscreen();
		fullScreenButton.checked = true;
		resizeCanvas(window.screen.availWidth, window.screen.availHeight);
		uiManager.addLogger(`Canvas size: ${window.screen.availWidth.toString()}x${window.screen.availHeight.toString()}`);
	}
});
fullScreenButton.checked = document.fullscreenElement;
const boardButton = new BButton(window_width - 80 - 400*scale, window_height - 100, "E-MAP", boardClicked);
const nextButton = new BButton(window_width - 80 - 400*scale, window_height - 100, "NEXT", nextClicked);
const newSeason = new BButton(window_width - 80 - 400*scale, window_height/2+40*scale, "SEASON", nextClicked);
fullScreenButton.setTextSize(45*scale);
startButton.setTextSize(45*scale);
startButton.w = 400*scale;
boardButton.setTextSize(45*scale);
boardButton.w = 400*scale;
nextButton.setTextSize(45*scale);
nextButton.w = 400*scale;
newSeason.setTextSize(45*scale);
newSeason.w = 400*scale;
const menu = [startButton, boardButton];
uiManager.setUI(menu);


let curSum = 0;

const PRINTEMPS = 0;
const ETE = 1;
const AUTOMNE = 2;
const HIVER = 3;
const END = -1;

let season = PRINTEMPS;

const cardMgr = new CardMgr();
let cards = []; // cards for the current season
const times = [1,1,1,1,2,2,2,2,2,0,2,0,0,0,0,0];

const cardHeight = 276;//Card.height;
const cardWidth = 200;//Card.width;

function preload() {
	spritesheet.addSpriteSheet('decret', './resources/decret.png', cardWidth, cardHeight);
	spritesheet.addSpriteSheet('season', './resources/season.png', cardWidth, cardHeight);
	spritesheet.addSpriteSheet('exploration', './resources/exploration.png', cardWidth, cardHeight);
	spritesheet.addSpriteSheet('forest', './resources/decret-forest.png', cardWidth, cardHeight);
	spritesheet.addSpriteSheet('zone', './resources/decret-zone.png', cardWidth, cardHeight);
	spritesheet.addSpriteSheet('ville', './resources/decret-ville.png', cardWidth, cardHeight);
	spritesheet.addSpriteSheet('champs', './resources/decret-champs.png', cardWidth, cardHeight);
}

function setup() {
	const canvas = createCanvas(window_width, window_height);
	canvas.parent("canvas");

	frameRate(60);

	uiManager.addLogger("Cartographer");
	uiManager.addLogger(`Screen size: ${window.screen.width.toString()}x${window.screen.height.toString()}`);
	uiManager.addLogger(`Canvas size: ${window_width.toString()}x${window_height.toString()}`);
	lastTime = Date.now();
}

const types = ["forest", "zone", "ville", "champs"];
cardMgr.shuffleArray(types);
const occurrences = [Math.floor(Math.random() * 4), Math.floor(Math.random() * 4), Math.floor(Math.random() * 4), Math.floor(Math.random() * 4)];

function drawBoard() {
	let topY = 50*scale;
	drawDecretCard(100, topY,"A", 0, season === PRINTEMPS || season === HIVER);
	drawDecretCard(100+cardWidth*scale+20,topY,"B", 1, season === PRINTEMPS || season === ETE);
	drawDecretCard(100+(cardWidth*scale+20)*2,topY,"C", 2, season === ETE || season === AUTOMNE);
	drawDecretCard(100+(cardWidth*scale+20)*3,topY,"D", 3, season === AUTOMNE || season === HIVER);

	topY = 20;
	const seasonX = 100 + (cardWidth*scale+20)*4.5;
	if( season <= HIVER ) {
		drawSeasonCard(seasonX, topY, "hiver");
	}
	if( season <= AUTOMNE ) {
		drawSeasonCard(seasonX, topY+20, "automne");
	}
	if( season <= ETE ) {
		drawSeasonCard(seasonX, topY+40, "ete");
	}
	if( season <= PRINTEMPS ) {
		drawSeasonCard(seasonX, topY+60, "printemps");
	}
	
	if (gameState === GAME_PLAY_STATE) {
		const overDecret = isMouseOverDecret();
		if( overDecret !== 0 ) {
			drawDecretCard(100, topY+50*scale,types[0],occurrences[0], season === PRINTEMPS || season === HIVER);
		}
		if( overDecret !== 1 ) {
			drawDecretCard(100+cardWidth*scale+20,topY+50*scale,types[1],occurrences[1], season === PRINTEMPS || season === ETE);
		}
		if( overDecret !== 2 ) {
			drawDecretCard(100+(cardWidth*scale+20)*2,topY+50*scale,types[2],occurrences[2], season === ETE || season === AUTOMNE);
		}
		if( overDecret !== 3 ) {
			drawDecretCard(100+(cardWidth*scale+20)*3,topY+50*scale,types[3],occurrences[3], season === AUTOMNE || season === HIVER);
		}

		let i = 0
		for( i = 0; i < curSeasonCards.length+delta; i++ ) {
			const card = curSeasonCards[i];
			drawExplorationCard(50+50*scale*i,window_height-cardHeight*scale-20, card);	
		}
		if( toggleDebug ) {
			for( let j = 0; j < cards.length ; j++,i++ ) {
				const card = cards[j];
				drawExplorationCard(50+50*scale*i,window_height-cardHeight*scale-20, card);	
			}
		}

		if( overDecret >= 0 ) {
			scale*=2;
			drawDecretCard(window_width/2-cardWidth/2*scale, topY+50*scale,types[overDecret],occurrences[overDecret], false);
			scale/=2;
		}

		if( isMouseOverExploration() ) {
			scale*=2;
			const card = curSeasonCards[curSeasonCards.length+delta-1];
			drawExplorationCard(50*scale,topY+50*scale, card);	
			scale/=2;
		}
	}
}

function isMouseOverExploration() {
	const X = 50;
	const Y = window_height-cardHeight*scale-20;
	if(
		mouseX > X && mouseX < X+cardWidth+50*scale*(curSeasonCards.length+delta-1) &&
		mouseY > Y && mouseY < Y+cardHeight*scale
	) {
		return true;
	}
	return false;
}

function isMouseOverDecret() {
	let X = 100;
	const topY = 20;
	const Y = topY+50*scale;
	if( mouseX > X && mouseX < X+cardWidth*scale && mouseY > Y && mouseY < Y+cardHeight*scale) {
		return 0;
	}
	X += cardWidth*scale+20
	if( mouseX > X && mouseX < X+cardWidth*scale && mouseY > Y && mouseY < Y+cardHeight*scale) {
		return 1;
	}
	X += cardWidth*scale+20
	if( mouseX > X && mouseX < X+cardWidth*scale && mouseY > Y && mouseY < Y+cardHeight*scale) {
		return 2;
	}
	X += cardWidth*scale+20
	if( mouseX > X && mouseX < X+cardWidth*scale && mouseY > Y && mouseY < Y+cardHeight*scale) {
		return 3;
	}
	return -1;
}

let delta = 0;

function drawEmptyCard(X,Y) {
	strokeWeight(4);
	rect(X, Y, cardWidth*scale, cardHeight*scale, 20);
	strokeWeight(1);
}

function drawExplorationCard(X,Y, index) {
	fill(250,150,10);
	stroke(0);
	drawEmptyCard(X,Y);
	textAlign(CENTER, CENTER);
	textSize(25);
	fill(25);
	text(index.toString(), X+20,Y+20);	
	spritesheet.drawScaledSprite('exploration', index, X, Y, scale);
	strokeWeight(4*scale);
	noFill();
	rect(X, Y, cardWidth*scale, cardHeight*scale, 10);
}

function drawSeasonCard(X,Y,title) {
	const decrets = ["printemps","ete","automne","hiver"];
	const index = decrets.indexOf(title);
	if( index >= 0 ) {
		spritesheet.drawScaledSprite('season', index, X, Y, scale);
	}
	strokeWeight(4);
	noFill();
	rect(X, Y, cardWidth*scale, cardHeight*scale, 10);
}

function drawDecretCard(X,Y,title,index,selection) {
	const decrets = ["A","B","C","D"];
	if( decrets.includes(title) ) {
		spritesheet.drawScaledSprite('decret', index, X, Y, scale);
	} else {
		spritesheet.drawScaledSprite(title, index, X, Y, scale);
	}
	if( selection ) {
		stroke(255,228,180);
	} else {
		stroke(10);
	}
	strokeWeight(4*scale);
	noFill();
	rect(X, Y, cardWidth*scale, cardHeight*scale, 10);
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

	if (key === "P") {
		delta = Math.max(delta-1, -curSeasonCards.length);
		nextButton.enabled = (delta === 0);
		newSeason.enabled = (delta === 0);
	}

	if (key === "N") {
		delta = Math.min(delta+1, 0);
		nextButton.enabled = (delta === 0);
		newSeason.enabled = (delta === 0);
	}
}

