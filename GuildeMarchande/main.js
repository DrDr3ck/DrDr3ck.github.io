const uiManager = new UIManager();
const windowWidth = 1700;
const windowHeight = 1000;
uiManager.loggerContainer = new LoggerContainer(windowWidth-550, windowHeight-100, 240, 100);
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
let toggleDebug = true;
let lastTime = 0;

// TODO: seed

function preload() {
	spritesheet.addSpriteSheet('cover', './cover.png', 630, 460);
	spritesheet.addSpriteSheet('avenia', './avenia.png', 1680, 1405);
	spritesheet.addSpriteSheet('exploration', './exploration.png', 840, 588);
	spritesheet.addSpriteSheet('exploration_cards', './exploration_cards.png', 260, 400);
	spritesheet.addSpriteSheet('speciality_cards', './speciality_cards.png', 260, 400);
	spritesheet.addSpriteSheet('goals', './goals.png', 520, 370);
	spritesheet.addSpriteSheet('PV', './PV.png', 136, 141);
}

function musicClicked() {
	// TODO
}

const speakerStorageKey = 'DrDr3ck/GuildeMarchande/Speaker';
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
const startButton = new BButton(140, windowHeight - 120, "AVENIA", startClicked);

const board = [];

/* Randomize array in-place using Durstenfeld shuffle algorithm */
const shuffleArray = (array) => {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i+1))
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
}

const goalArray = [0,1,2,3,4,5];
shuffleArray(goalArray);

const ageCards = [0,1,2,3,4,5];
shuffleArray(ageCards);

let ageExploration = [{type: "cube", x:9, y:6}];

function addCube(x,y) {
	ageExploration.push({type: "cube", x: x, y: y});
}
function transformCubeToVillage(x,y) {
	const index = ageExploration.findIndex(cell=>cell.x === x && cell.y===y);
	if( index >= 0 ) {
		ageExploration[index].type = "village";
	}
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
	canvas = createCanvas(windowWidth, windowHeight);
    canvas.parent('canvas');

    frameRate(10);

	initBoard();

    lastTime = Date.now();

	//debug
	addCube(8,7);
	addCube(7,7);
	addCube(7,8);
	transformCubeToVillage(7,8);
}

function updateGame(elapsedTime) {

}

const boardx = 50;
const boardy = 25;

function debugDrawCase(x,y,type, row, column) {
	/*
	beginShape();
	vertex(x+dx, y+31+24+dy);
	vertex(x-15+dx, y+31+dy);
	vertex(x+dx, y+dy);
	vertex(x+33+dx, y+dy);
	vertex(x+33+15+dx, y+31+dy);
	vertex(x+33+dx, y+31+24+dy);
	endShape(CLOSE);
	*/
	noFill();
	if( type === "mountain") {
		fill(216,166,112);
	} else if( type === "sea") {
		fill(176,171,138);
	} else if( type === "sand") {
		fill(227,202,144);
	} else if( type === "grassland") {
		fill(176,161,87);
	} else if( type === "tower") {
		fill(224,201,188);
	} else if( type === "capital") {
		fill(200,200,200);
	} else {
		return;
	}
	stroke(1);
	ellipse(x+boardx,y+boardy,45); // 45 de rayon
	noStroke();
	fill(0);
	text(`${row}/${column}`, x+boardx-12, y+boardy);
}

function debugDrawBoard() {
	stroke(0);
	/*
	debugDrawCase(206,119);
	debugDrawCase(395,225);
	debugDrawCase(443,199);
	debugDrawCase(488,172);
	debugDrawCase(675,121);
	*/
	textSize(12);
	board.forEach((column,x)=>column.forEach((cell,y)=>debugDrawCase(cell.center.x, cell.center.y, cell.type, x, y)));

	// couvrir les cartes explorations deja jouées
	spritesheet.drawScaledSprite("exploration_cards", 0, 1180, 90-25, 0.325);

	//fill(200,200,200,75);
	//rect(1395,87,1517-1395,160-87);
}

function displayCube(x,y) {
	stroke(0);
	fill(250,100,100);
	const cell = board[x][y];
	console.log("display cube", cell);
	rect(cell.center.x+boardx-10, cell.center.y+boardy-10, 20, 20);
}

function displayVillage(x,y) {
	strokeWeight(1);
	stroke(0);
	fill(250,100,100);
	const cell = board[x][y];
	console.log("display cube", cell);
	beginShape();
	const X = cell.center.x+boardx;
	const Y = cell.center.y+boardy+10;
	vertex(X-20,Y);
	vertex(X-20,Y-20);
	vertex(X+20,Y-20);
	vertex(X+20,Y);
	vertex(X+10,Y);
	vertex(X+10,Y-5);
	vertex(X-10,Y-5);
	vertex(X-10,Y);
	vertex(X-20,Y);
	endShape();
}

function displayAgeExploration() {
	ageExploration.forEach(cell=> {
		if( cell.type === "cube") {
			displayCube(cell.x, cell.y)
		} else if( cell.type === "village") {
			displayVillage(cell.x, cell.y)
		}
	});
}


function drawGame() {
	spritesheet.drawScaledSprite("avenia", 0, boardx, boardy, 0.65);
	spritesheet.drawScaledSprite("exploration", 0, 1150, boardy, 0.65);
	if( toggleDebug ) {
	    debugDrawBoard();
	} else {
		displayAgeExploration();
	}
	spritesheet.drawScaledSprite("exploration_cards", ageCards[0], 1150, 440-25, 1);

	// afficher cards specialites
	spritesheet.drawScaledSprite("speciality_cards", 0, 10-100, 120-25, 0.5);
	spritesheet.drawScaledSprite("speciality_cards", 0, 10-100, 380-25, 0.5);
	spritesheet.drawScaledSprite("speciality_cards", 0, 10-100, 640-25, 0.5);

	// goals
	spritesheet.drawScaledSprite("goals", goalArray[0], 1435, 440-25, 0.5);
	spritesheet.drawScaledSprite("goals", goalArray[1], 1435, 630-25, 0.5);
	spritesheet.drawScaledSprite("goals", goalArray[2], 1435, 820-25, 0.5);

	// points de victoire
	spritesheet.drawSprite("PV", 0, 1300, 850);
	noStroke();
	fill(250);
	textSize(25);
	text("0 x ", 1300, 870);
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
		spritesheet.drawScaledSprite("cover", 0, (windowWidth-630*1.5)/2, 50, 1.5);
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
	toolManager.mouseClicked();
	uiManager.mouseClicked();
	return false;
}

function keyPressed() {
	if (key === "D") {
		toggleDebug = !toggleDebug;
	}
}

function initBoard() {
	let dx = 179-46.5*2;
	let dy = 169-54*2;
	for( let i=0; i < 20; i++) {
		const column = [];
		for( let j=0; j<15; j++ ) {
			column.push({center: {x: dx, y: dy+54*j+(i%2)*24}, type: i===0||i===19||j===0||j===14||j===13 ? null : "sea"})
		}
		dx+=46.5;
		dy+=0.2;
		board.push(column);
	}
	board[1][1].type = null;
	board[1][2].type = null;
	board[1][3].type = null;
	board[1][4].type = null;
	board[1][5].type = null;
	board[2][1].type = null;
	board[4][1].type = null;
	board[6][1].type = null;
	board[8][1].type = null;
	board[12][1].type = null;
	board[14][1].type = null;
	board[16][1].type = null;
	board[18][1].type = null;
	board[1][10].type = null;
	board[1][11].type = null;
	board[1][12].type = null;
	board[2][11].type = null;
	board[2][12].type = null;
	board[3][12].type = null;
	board[4][12].type = null;
	board[5][12].type = null;
	board[6][12].type = null;
	board[15][12].type = null;
	board[16][12].type = null;
	board[17][11].type = null;
	board[17][12].type = null;
	board[18][11].type = null;
	board[18][12].type = null;
	board[2][2].type = "tower";
	board[18][1].type = "tower";
	board[3][11].type = "tower";
	board[14][12].type = "tower";
	board[9][6].type = "capital";
	board[2][6].type = "grassland";
	board[2][7].type = "grassland";
	board[2][8].type = "grassland";
	board[3][7].type = "grassland";
	board[3][3].type = "grassland";
	board[4][4].type = "grassland";
	board[5][3].type = "grassland";
	board[6][3].type = "grassland";
	board[7][2].type = "grassland";
	board[9][1].type = "grassland";
	board[10][2].type = "grassland";
	board[11][2].type = "grassland";
	board[12][3].type = "grassland";
	board[8][8].type = "grassland";
	board[9][7].type = "grassland";
	board[10][8].type = "grassland";
	board[2][10].type = "grassland";
	board[3][10].type = "grassland";
	board[4][11].type = "grassland";
	board[5][11].type = "grassland";
	board[6][11].type = "grassland";
	board[12][5].type = "grassland";
	board[12][6].type = "grassland";
	board[12][7].type = "grassland";
	board[13][5].type = "grassland";
	board[17][1].type = "grassland";
	board[18][2].type = "grassland";
	board[18][3].type = "grassland";
	board[18][4].type = "grassland";
	board[16][9].type = "grassland";
	board[17][6].type = "grassland";
	board[17][7].type = "grassland";
	board[17][8].type = "grassland";
	board[18][7].type = "grassland";
	board[18][8].type = "grassland";
	board[11][10].type = "grassland";
	board[12][10].type = "grassland";
	board[12][11].type = "grassland";
	board[13][9].type = "grassland";
	board[13][10].type = "grassland";
	board[14][10].type = "grassland";
	board[9][11].type = "sand";
	board[9][12].type = "sand";
	board[10][12].type = "sand";
	board[10][13].type = "sand";
	board[10][5].type = "sand";
	board[10][6].type = "sand";
	board[11][5].type = "sand";
	board[15][5].type = "sand";
	board[16][5].type = "sand";
	board[16][6].type = "sand";
	board[17][5].type = "sand";
	board[18][6].type = "sand";
	board[15][9].type = "sand";
	board[15][10].type = "sand";
	board[16][10].type = "sand";
	board[17][9].type = "sand";
	board[8][10].type = "sand";
	board[9][8].type = "sand";
	board[9][9].type = "sand";
	board[7][4].type = "sand";
	board[8][4].type = "sand";
	board[9][3].type = "sand";
	board[2][9].type = "sand";
	board[3][8].type = "sand";
	board[3][9].type = "sand";
	board[4][8].type = "sand";
	board[5][7].type = "sand";
	board[11][7].type = "sand";
	board[11][8].type = "sand";
	board[12][8].type = "sand";
	board[10][1].type = "sand";
	board[11][1].type = "sand";
	board[12][2].type = "sand";
	board[13][1].type = "sand";
	board[13][2].type = "sand";
	board[15][3].type = "sand";
	board[16][3].type = "sand";
	board[17][2].type = "sand";
	board[7][4].type = "sand";
	board[1][6].type = "mountain";
	board[1][7].type = "mountain";
	board[1][8].type = "mountain";
	board[1][9].type = "mountain";
	board[3][1].type = "mountain";
	board[3][2].type = "mountain";
	board[4][2].type = "mountain";
	board[4][3].type = "mountain";
	board[5][2].type = "mountain";
	board[4][10].type = "mountain";
	board[5][9].type = "mountain";
	board[5][10].type = "mountain";
	board[6][5].type = "mountain";
	board[6][6].type = "mountain";
	board[7][7].type = "mountain";
	board[7][8].type = "mountain";
	board[8][7].type = "mountain";
	board[10][7].type = "mountain";
	board[11][6].type = "mountain";
	board[11][11].type = "mountain";
	board[11][12].type = "mountain";
	board[12][12].type = "mountain";
	board[13][12].type = "mountain";
	board[13][6].type = "mountain";
	board[13][7].type = "mountain";
	board[14][2].type = "mountain";
	board[15][1].type = "mountain";
	board[15][2].type = "mountain";
	board[16][2].type = "mountain";
	board[14][9].type = "mountain";
	board[15][8].type = "mountain";
	board[16][7].type = "mountain";
	board[16][8].type = "mountain";
	board[16][11].type = "mountain";
	board[17][10].type = "mountain";
	board[18][10].type = "mountain";
	board[18][9].type = "mountain";
}