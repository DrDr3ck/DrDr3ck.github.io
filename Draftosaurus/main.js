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
const ROLEDICE = 0;
const CHOOSEDINO = 1;
const CHOOSEENCLOS = 2;
const REMOVEDINO = 3;
let gameState = ROLEDICE;
let toggleDebug = false;
let lastTime = 0;

let diceFace = -1; // foret, caillou, toilettes, cafeteria, vide, T-rex

const enclosAreas = [
	[{X:85,Y:75}, {X:315,Y:245}], // foret similaire
	[{X:510,Y:120}, {X:610,Y:195}], // roi de la jungle
	[{X:100,Y:310}, {X:260,Y:465}],  // le trio des bois
	[{X:485,Y:335}, {X:700,Y:480}], // la plaine de differences
	[{X:140,Y:530}, {X:300,Y:685}], // la prairie des amoureux
	[{X:585,Y:520}, {X:710,Y:625}], // l ile du solitaire
	[{X:355,Y:530}, {X:535,Y:700}], // riviere
];
const enclosDinosPositions = [
	[{X:103,Y:153}, {X:130,Y:153}, {X:170,Y:153},{X:207,Y:153}, {X:246,Y:153}, {X:285,Y:153}], // foret similaire
	[{X:554,Y:129}], // roi de la jungle
	[{X:125,Y:330},{X:167,Y:330},{X:222,Y:330},{X:125,Y:395},{X:125,Y:395},{X:125,Y:395},], // le trio des bois
	[{X:479,Y:388}, {X:512,Y:388}, {X:558,Y:388},{X:595,Y:388}, {X:632,Y:388}, {X:671,Y:388}], // la plaine de differences
	[
		{X:150,Y:545}, {X:190,Y:545}, {X:222,Y:545}, {X:245,Y:545},
		{X:150,Y:605}, {X:190,Y:605}, {X:222,Y:605}, {X:245,Y:605}
	], // la prairie des amoureux
	[{X:630,Y:530}], // l ile du solitaire
	[
		{X:360,Y:535}, {X:390,Y:535}, {X:420,Y:535}, {X:450,Y:535}, {X:480,Y:535},
		{X:360,Y:605}, {X:390,Y:605}, {X:420,Y:605}, {X:450,Y:605}, {X:480,Y:605},
	],
];

const enclosDinos = [
	[],[],[],[],[],[],[]
];

let enclosHighlighted = [];

const dinos = [0,0,0,0,0,0,1,1,1,1,1,1,2,2,2,2,2,2,3,3,3,3,3,3,4,4,4,4,4,4,5,5,5,5,5,5];

const defausse = [];

const TRexIndex = 2;

let chosenDinoIndex = -1;
let chosenEnclos = -1;

const dinoColors = [
	{r:244,g:196,b:12},{r:117,g:170,b:62},{r:224,g:25,b:18},
	{r:204,g:104,b:153},{r:65,g:152,b:161},{r:233,g:80,b:23}
];

function preload() {
	spritesheet.addSpriteSheet('cover', './cover.png', 692, 550);
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

function randomInt(i) {
	return Math.floor(Math.random() * i);
}

function shuffleArray(array) {
	for (var i = array.length - 1; i > 0; i--) {
		var j = randomInt(i + 1);
		var temp = array[i];
		array[i] = array[j];
		array[j] = temp;
	}
}

function startClicked() {
	curState = GAME_PLAY_STATE;
	uiManager.setUI([ speakerButton, ruleButton, roleDiceButton ]);
	uiManager.addLogger("Start game");
	roleDiceButton.enabled = true;
}

const speakerButton = new BFloatingSwitchButton(windowWidth - 70 - 10 - 70, 70, '\uD83D\uDD0A', speakerClicked);
const musicButton = new BFloatingSwitchButton(windowWidth - 70, 70, '\uD83C\uDFB6', musicClicked);
const startButton = new BButton(80, windowHeight - 50 - 200, "START", startClicked);
const ruleButton = new BFloatingSwitchButton(windowWidth - 70, 70, '\u003F', () => {
	ruleButton.checked = !ruleButton.checked;
});
const roleDiceButton = new BFloatingButton(1000, 250, '\u2685', ()=>{
	soundManager.playSound('dice-rolling');
	diceFace = randomInt(6);
	findEnclosToHighlight();
	roleDiceButton.enabled = false;
	gameState = CHOOSEDINO;
});

function findEnclosToHighlight() {
	// according to diceFace, find enclos where player can put a dinosaurus
	switch(diceFace) {
		case 0: // foret
			enclosHighlighted = [0,1,2,6];
			break;
		case 1: // caillou
			enclosHighlighted = [3,4,5,6];
			break;
		case 2: // toilettes
			enclosHighlighted = [1,3,5,6];
			break;
		case 3: //  cafeteria
			enclosHighlighted = [0,2,4,6];
			break;
		case 4: // vide
			enclosHighlighted = enclosDinos.map((e,i)=>e.length === 0 ? i : -1).filter(f=>f>=0);
			enclosHighlighted.push(6);
			break;
		case 5: // T-rex
			enclosHighlighted = enclosDinos.map((e,i)=>e.includes(TRexIndex) ? -1 : i).filter(f=>f>=0);
			enclosHighlighted.push(6);
			break;
	}
}

function initUI() {
    speakerButton.setTextSize(50);
	musicButton.setTextSize(50);
	ruleButton.setTextSize(50);
	ruleButton.checked = false;
	musicButton.enabled = false;
	musicButton.checked = false;
	const isSpeakerOn = localStorage.getItem(speakerStorageKey);
	if( isSpeakerOn === "off" ) {
		speakerButton.checked = false;
		soundManager.mute(true);
	}
	const menu = [ speakerButton, startButton, ruleButton ];
	uiManager.setUI(menu);
}

function setup() {
    initUI();
	canvas = createCanvas(windowWidth, windowHeight);
    canvas.parent('canvas');

	spritesheet.addSpriteSheet('board', './board.png', 691, 684);
	spritesheet.addSpriteSheet('rules', './rules.png', 730, 732);
	spritesheet.addSpriteSheet('dice', './dice.png', 36, 36);
	spritesheet.addSpriteSheet('dino', './dino.png', 150, 100);
	spritesheet.addSpriteSheet('enclos', './enclos.png', 599, 503);

	soundManager.addSound('dice-rolling', './dice-rolling.wav', 1);

    frameRate(60);

	shuffleArray(dinos);

    lastTime = Date.now();
}

function updateGame(elapsedTime) {

}

function drawDinoInEnclos(index) {
	const curDinos = enclosDinos[index];
	if( curDinos.length === 0 ) {
		return;
	}
	stroke(0);
	const positions = enclosDinosPositions[index];
	curDinos.forEach((curDinoIndex,i)=>{
		const p = positions[i];
		const color = dinoColors[curDinoIndex];
		fill(color.r, color.g, color.b);
		rect(p.X, p.Y, 25, 40);
	});
}

function drawDino(dinoIndex, X, Y) {
	spritesheet.drawSprite('dino', dinos[dinoIndex], X, Y);
	stroke(0);
	noFill();
	rect(X,Y,150,100);
}

function drawGame() {
	spritesheet.drawSprite('board', 0, (windowHeight-684)/2, (windowHeight-684)/2);

	if( diceFace !== -1 ) {
		spritesheet.drawScaledSprite('dice', diceFace, 1100, 190, 1.5);
	}

	[0,1,2].forEach(i=>{
		if( chosenDinoIndex !== i ) {
			drawDino(i,860+160*i,400);
		}
	});
	if( chosenDinoIndex >= 0 && gameState !== REMOVEDINO ) {
		drawDino(chosenDinoIndex, mouseX-150/2, mouseY-100/2);
	}

	// defausse
	defausse.forEach((d,i)=>{
		spritesheet.drawScaledSprite('dino', d, 770+30*i, 720, 0.25);
	});

	// draw dinosaurus in 'enclos'
	for( let i=0; i < enclosDinos.length; i++ ) {
		drawDinoInEnclos(i);
	}

	if( enclosHighlighted.length > 0 ) {
		enclosHighlighted.forEach(e=>{
			const enclosArea = enclosAreas[e];
			stroke(0);
			fill(128,128,128,128);
			rect(enclosArea[0].X, enclosArea[0].Y, enclosArea[1].X-enclosArea[0].X, enclosArea[1].Y-enclosArea[0].Y);
		});
	}
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
		spritesheet.drawSprite('cover', 0, (windowWidth-692)/2, (windowHeight-550)/2);
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

	if( ruleButton.checked ) {
		background(51, 51, 51, 200);
		spritesheet.drawSprite('rules', 0, (windowWidth-730)/2, (windowHeight-732)/2);
	}
    
    lastTime = currentTime;
}

function mouseClicked() {
	if( toggleDebug ) {
		uiManager.addLogger(`X=${mouseX}, Y=${mouseY}`);
	}
	if( ruleButton.checked ) {
		ruleButton.checked = false;
	} else {
		toolManager.mouseClicked();
		uiManager.mouseClicked();
	}

	if( gameState == REMOVEDINO ) {
		if( mouseY < 400 || mouseY > 400+100 ) {
			return false;
		}
		// check if player has click on a dino
		if( mouseX > 860 && mouseX < 860+150 && chosenDinoIndex !== 0) {
			removeDino(0);
		} else if( mouseX > 860+160 && mouseX < 860+150+160 && chosenDinoIndex !== 1) {
			removeDino(1);
		} else if( mouseX > 860+320 && mouseX < 860+150+320 && chosenDinoIndex !== 2) {
			removeDino(2);
		}
	}

	return false;
}

function removeDino(index) { // 0, 1 or 2
	// move dino in defausse
	defausse.push(dinos[index]);
	// remove dino from list of dinos
	if( chosenDinoIndex > index ) {
		dinos.splice(chosenDinoIndex, 1);
		dinos.splice(index, 1);
	} else {
		dinos.splice(index, 1);
		dinos.splice(chosenDinoIndex, 1);
	}
	// select 2 other dinos
	gameState = ROLEDICE;
	roleDiceButton.enabled = true;
	chosenDinoIndex = -1;
	diceFace = -1;
}

function addDinoInEnclos() {
	// chosenEnclos, chosenDinoIndex
	enclosDinos[chosenEnclos].push(dinos[chosenDinoIndex]);
	enclosHighlighted = [];
}

function mousePressed() {
	if( gameState == CHOOSEDINO ) {
		if( mouseY < 400 || mouseY > 400+100 ) {
			chosenDinoIndex = -1;
			return false;
		}
		// check if player has click on a dino
		if( mouseX > 860 && mouseX < 860+150 ) {
			chosenDinoIndex = 0;
			gameState = CHOOSEENCLOS;
		} else if( mouseX > 860+160 && mouseX < 860+150+160 ) {
			chosenDinoIndex = 1;
			gameState = CHOOSEENCLOS;
		} else if( mouseX > 860+320 && mouseX < 860+150+320 ) {
			chosenDinoIndex = 2;
			gameState = CHOOSEENCLOS;
		}
	}
}

function mouseReleased() {
	if( gameState == CHOOSEENCLOS ) {
		// check if player is over an enclos
		for( let i=0; i < enclosHighlighted.length; i++ ) {
			const enclosIndex = enclosHighlighted[i];
			const enclosArea = enclosAreas[enclosIndex];
			if(
				mouseX > enclosArea[0].X && mouseX < enclosArea[1].X &&
				mouseY > enclosArea[0].Y && mouseY < enclosArea[1].Y
			) {
				chosenEnclos = enclosIndex;
				addDinoInEnclos();
				gameState = REMOVEDINO;
			}
		}
		if( gameState == CHOOSEENCLOS ) {
			chosenDinoIndex = -1;
			gameState = CHOOSEDINO;
		}
	}
}

function keyPressed() {
	if (key === "D") {
		toggleDebug = !toggleDebug;
	}
}