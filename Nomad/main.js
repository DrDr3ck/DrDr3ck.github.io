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

let lastTime = 0;
let toggleDebug = false;

const tileSize = 40;
const board = new Board();

function preload() {
}

const startClicked = () => {
	curState = GAME_PLAY_STATE;
	uiManager.setUI([turnButton, nextButton, prevButton, upButton, leftButton, rightButton, downButton, workButton, waitButton, reproduceButton]);
	turnButton.enabled = false;
	uiManager.addLogger(`Start Nomad Game#${curSaveIndex}`)
}

const speakerButton = new BFloatingSwitchButton(windowWidth - 70 - 10 - 70, 70, '\uD83D\uDD0A', ()=>{
	speakerButton.checked = !speakerButton.checked;
	soundManager.mute(!speakerButton.checked);
});
const musicButton = new BFloatingSwitchButton(windowWidth - 70, 70, '\uD83C\uDFB6', ()=>{});
const startButton = new BButton(80, 80*5, "NEW GAME", ()=> {
	// find an available save index
	curSaveIndex = 1;
	while( localStorage.getItem(`Nomad/board/${curSaveIndex}`) ) {
		curSaveIndex++;
	}
	if( curSaveIndex > 9 ) {
		uiManager.addLogger("Too many saves: cannot start a new one")
		return;
	}
	startClicked();
});

const endTurn = () => {
	for( let j=0; j < board.tiles.length; j++ ) {
		const row = board.tiles[j];
		row.forEach(r=>{
			if( r.type.endsWith("-") ) {
				r.type = r.type.slice(0,-1);
			}
		});
	}
	if( board.turn % 10 === 0 ) {
		// need to eat
		board.eatFood();
	}
	board.nomads.forEach(n=>{
		// cannot move if dead :)
		if( n.health > 0 ) {
			n.hasMoved = false;
		}
	});
	board.checkBlockedNomads();
	if( board.nomads.length === 0 ) {
		turnButton.visible = false;
	}
	board.turn++;
	turnButton.enabled = false;
	if( board.turn % 10 === 0 ) {
		turnButton.text = "END OF DAY";
	} else {
		turnButton.text = "END OF TURN";
	}
	const json = board.dump();
	localStorage.setItem(`Nomad/board/${curSaveIndex}`, JSON.stringify(json));
}

const turnButton = new BButton(80, windowHeight - 50, "END OF TURN", endTurn);

const nextButton = new BFloatingButton(580, 795, '\u2AA7', () => {
	board.nextNomad(true);
	// check if "next turn" can be enabled
	turnButton.enabled = board.nomads.every(n=>n.hasMoved);
});
const prevButton = new BFloatingButton(520, 795, '\u2AA6', () => {
	board.nextNomad(false);
	// check if "next turn" can be enabled
	turnButton.enabled = board.nomads.every(n=>n.hasMoved);
});
const upButton = new BFloatingButton(700, 740, '\u2191', () => {
	board.curNomad().moveUp(board);
	// check if "next turn" can be enabled
	turnButton.enabled = board.nomads.every(n=>n.hasMoved);
});
const leftButton = new BFloatingButton(640, 795, '\u2190', () => {
	board.curNomad().moveLeft(board);
	// check if "next turn" can be enabled
	turnButton.enabled = board.nomads.every(n=>n.hasMoved);
});
const rightButton = new BFloatingButton(760, 795, '\u2192', () => {
	board.curNomad().moveRight(board);
	// check if "next turn" can be enabled
	turnButton.enabled = board.nomads.every(n=>n.hasMoved);
});
const downButton = new BFloatingButton(700, 795, '\u2193', () => {
	board.curNomad().moveDown(board);
	// check if "next turn" can be enabled
	turnButton.enabled = board.nomads.every(n=>n.hasMoved);
});
const workButton = new BFloatingButton(820, 795, 'T', () => {
	board.doTransform();
	// check if "next turn" can be enabled
	turnButton.enabled = board.nomads.every(n=>n.hasMoved);
});
const waitButton = new BFloatingButton(940, 795, 'W', () => {
	board.curNomad().hasMoved = true;
	// check if "next turn" can be enabled
	turnButton.enabled = board.nomads.every(n=>n.hasMoved);
});
const reproduceButton = new BFloatingButton(880, 795, 'R', () => {
	board.reproduce();
	// check if "next turn" can be enabled
	turnButton.enabled = board.nomads.every(n=>n.hasMoved);
});

let curSaveIndex = 1;

// checking existence of file synchronously
function fileExists(urlToFile) {
    var xhr = new XMLHttpRequest();
    xhr.open('HEAD', urlToFile, false);
    xhr.send();
     
    return xhr.status === 404;
}

function exportGame(json) {
	let fileName = `save${curSaveIndex}.json`;
	saveJSON(json, fileName);
}

function importGame(fileName) {
	loadJSON(fileName, (json)=>board.reset(json));
}

function initUI() {
    speakerButton.setTextSize(50);
	musicButton.setTextSize(50);
	startButton.setTextSize(45);
	turnButton.setTextSize(45);
	nextButton.setTextSize(45);
	prevButton.setTextSize(45);
	upButton.setTextSize(45);
	leftButton.setTextSize(45);
	rightButton.setTextSize(45);
	downButton.setTextSize(45);
	workButton.setTextSize(45);
	waitButton.setTextSize(45);
	reproduceButton.setTextSize(45);
	musicButton.enabled = false;
	musicButton.checked = false;
	const gameButtons = [];
	const deleteButtons = [];
	for( let i=1; i <= 9; i++ ) {
		gameButtons.push(
			new BButton(windowWidth - 80 - 800, 80*i, `GAME ${i}`, ()=>{
				const boardString = localStorage.getItem(`Nomad/board/${i}`);
				board.reset(JSON.parse(boardString));
				curSaveIndex = i;
				console.log(board);
				startClicked();
			})
		);
		gameButtons[gameButtons.length-1].enabled = localStorage.getItem(`Nomad/board/${i}`);
		gameButtons[gameButtons.length-1].setTextSize(45);
		deleteButtons.push(new BFloatingButton(windowWidth - 80 - 350, 80*i+10, '\u2169', ()=>{
			localStorage.removeItem(`Nomad/board/${i}`);
			gameButtons[i-1].enabled = false;
			deleteButtons[i-1].visible = false;
		}));
		deleteButtons[gameButtons.length-1].enabled = gameButtons[gameButtons.length-1].enabled;
	}
	const menu = [ startButton, ...gameButtons, ...deleteButtons ]; //, speakerButton, musicButton ];
	uiManager.setUI(menu);
	deleteButtons.forEach(b=>b.visible = b.enabled);
}

function setup() {
    initUI();
	canvas = createCanvas(windowWidth, windowHeight);
    canvas.parent('canvas');

    frameRate(60);

    lastTime = Date.now();
}

function updateGame(elapsedTime) {
}

const tileX = 30;
const tileY = 80;

function drawGame() {
	
	stroke(51);
	// draw tiles
	for( let j=0; j < board.tiles.length; j++ ) {
		const row = board.tiles[j];
		row.forEach((r,i)=>{
			fill(r.color.r,r.color.g,r.color.b);
			rect(tileX+tileSize*i, tileY+tileSize*j, tileSize, tileSize);
		});
	}

	fill(170,135,130);
	stroke(151);
	board.nomads.forEach(nomad=>{
		ellipse(tileX+tileSize*nomad.position.x+tileSize/2,tileY+tileSize*nomad.position.y+tileSize/2,tileSize/2,tileSize/2);
	});

	// TURN
	fill(250);
	textSize(15);
	textAlign(LEFT, TOP);
	text(`Turn ${board.turn}`, 1240, 30);

	// RESSOURCES
	text(`plank: ${board.ressources.plank}, brick: ${board.ressources.brick}, food: ${board.ressources.food}`, 30, 20);

	if( board.nomads.length > 0 ) {
		// CUR TILE
		// TILE TYPE
		const curTile = board.curTile();
		text( curTile.type, 1240, 60);

		const nomad = board.curNomad();
		if( nomad.hasMoved ) {
			stroke(230,100,20);
		} else {
			stroke(250,210,10);
		}
		noFill();
		rect(tileX+tileSize*nomad.position.x, tileY+tileSize*nomad.position.y, tileSize, tileSize);
	}
}

function initGame() {
	noiseSeed( Math.random()*5000 );
	board.initTiles(30,15);
	board.addNomad({x:15,y:7});
	board.addNomad({x:16,y:8});
	board.addNomad({x:14,y:8});
	console.log(board);
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
		drawGame();
		if( board.nomads.length === 0 ) {
			text("GAME OVER", 10, 10);
		}
	}

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
	if( toggleDebug ) {
		uiManager.addLogger(`X: ${Math.round(mouseX)}, Y: ${Math.round(mouseY)}`);
	}
	// check if clicked is selecting a nomad
	board.selectNomad(Math.floor((mouseX-tileX)/tileSize), Math.floor((mouseY-tileY)/tileSize));
	return false;
}

function keyPressed() {
	if (key === "D") {
		toggleDebug = !toggleDebug;
	}
	if( board.nomads.length === 0 ) {
		return;
	}
	if (key === "n") {
		// next nomad
		board.nextNomad(true);
	}
	if (key === "p") {
		// previous nomad
		board.nextNomad(false);
	}
	if (key === "t") {
		// transform field
		board.doTransform();
	}
	if (key === "r") {
		// previous nomad
		board.reproduce();
	}
	if (key === "w") {
		// nomad is waiting
		board.curNomad().hasMoved = true;
	}
	if( key === "N" && turnButton.enabled ) {
		endTurn();
	}
	if (keyCode === UP_ARROW) {
		board.curNomad().moveUp(board);
	} else if (keyCode === DOWN_ARROW) {
		board.curNomad().moveDown(board);
	} else if (keyCode === LEFT_ARROW) {
		board.curNomad().moveLeft(board);
	} else if (keyCode === RIGHT_ARROW) {
		board.curNomad().moveRight(board);
	}
	// check if "next turn" can be enabled
	turnButton.enabled = board.nomads.every(n=>n.hasMoved);
}