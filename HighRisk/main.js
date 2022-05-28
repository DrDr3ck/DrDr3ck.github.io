const uiManager = new UIManager();
const windowWidth = 1400;
const windowHeight = 800;
uiManager.loggerContainer = new LoggerContainer(windowWidth-300, windowHeight-120, 240, 100);
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
let curPlayerIndex = 0;
let toggleDebug = false;

const players = [];
const dices = [{state: "hidden", value: 0}, {state: "hidden", value: 0}, {state: "hidden", value: 0}, {state: "hidden", value: 0}, {state: "hidden", value: 0}, {state: "hidden", value: 0}];
const tiles = [
	{name: "Camp de base", maxPlayers: 9, index: 0},
	{name: "Bivouac", maxPlayers: 9, index: 1},
	{name: "Bivouac", maxPlayers: 9, index: 2},
	{name: "Falaise", maxPlayers: 1, index: 3},
	{name: "Falaise", maxPlayers: 1, index: 4},
	{name: "Falaise", maxPlayers: 1, index: 5},
	{name: "Bivouac", maxPlayers: 9, index: 6},
	{name: "Falaise", maxPlayers: 1, index: 7},
	{name: "Falaise", maxPlayers: 1, index: 8},
	{name: "Falaise", maxPlayers: 1, index: 9},
	{name: "Sommet", maxPlayers: 9, index: 10},
];

let lastTime = 0;

const diceFace = ["danger", "ascension", "danger", "danger", "ascension", "meteo"];
const randomDice = () => {
    return Math.floor(Math.random() * 6);
}

function preload() {
	spritesheet.addSpriteSheet('board', './board.png', 598, 795);
}

function musicClicked() {
	// TODO
}

function speakerClicked() {
	speakerButton.checked = !speakerButton.checked;
	soundManager.mute(!speakerButton.checked);
}

let rules = false;
const rulesButton = new BFloatingButton(windowWidth - 80, 70, '?', ()=>{
	// display/hide rules
	rules = !rules;
	rulesButton.enabled = false;
});

function roleDices() {
	soundManager.playSound('dice-rolling');
	const dangerBefore = dices.filter(d=>diceFace[d.value] === "danger").length;
	for( let i=0; i < dices.length; i++ ) {
		if( diceFace[dices[i].value] === "danger" ) {
			dices[i].value = randomDice();
			dices[i].state = "played";
		}
	}
	const dangerAfter = dices.filter(d=>diceFace[d.value] === "danger").length;
	if( dangerAfter > 0 && dangerAfter === dangerBefore ) {
		uiManager.addLogger("Chute");
		roleDicesButton.enabled = false;
		reposButton.text = "CHUTE";
	}

	reposButton.visible = true;
	reposButton.enabled = true;
}

function freeTile(x,y) {
	for( let i=0; i < positions.length; i++ ) {
		const row = positions[i];
		for( let j=0; j < row.length; j++ ) {
			const position = row[j];
			if( position.x === x && position.y === y ) {
				position.state = "free";
				return;
			}
		}
	}
}

function getFreeAlpinistPositionOnTile(tile) {
	const row = positions[tile];
	for( let i=0; i < row.length; i++ ) {
		if( row[i].state === "free" ) {
			return i;
		}
	}
	return 0;
}

function getNbAlpinistsOnTile(tile) {
	let nbAlpinistsOnTile = 0;
	players.forEach(p=>p.alpinists.forEach(a=>{
		if( a.tile === tile ) {
			nbAlpinistsOnTile++;
		}
	}));
	return nbAlpinistsOnTile;
}

function isTileOccupied(tile) {
	const nbAlpinistsOnTile = getNbAlpinistsOnTile(tile);
	const maxAlpinists = positions[tile].length;
	return nbAlpinistsOnTile > maxAlpinists;
}

function getAlpinistOnTile(tile) {
	for( const player of players ) {
		for( const alpinist of player.alpinists ) {
			if( alpinist.tile === tile ) {
				return alpinist;
			}
		}
	}
}

function moveAlpinist(alpinist, newTile) {
	let oldAlpinist = null;
	if( positions[newTile].length === 1 ) {
		// should we slide down an alpinist ?
		oldAlpinist = getAlpinistOnTile(newTile);
		if( oldAlpinist ) {
			// move it down
			oldAlpinist.tile = oldAlpinist.tile-1;
			while( isTileOccupied(oldAlpinist.tile) ) {
				oldAlpinist.tile = oldAlpinist.tile-1;
			}
		}
	}

	alpinist.tile = newTile;
	doMoveAlpinist(alpinist, true);
	if( oldAlpinist ) {
		doMoveAlpinist(oldAlpinist, false);
	}
}

function doMoveAlpinist(alpinist, free) {
	// change position: move alpinist
	const alpinistPosition = getFreeAlpinistPositionOnTile(alpinist.tile);
	const position = positions[alpinist.tile][alpinistPosition];
	const oldX = alpinist.button.x;
	const oldY = alpinist.button.y;
	alpinist.button.x = position.x;
	alpinist.button.y = position.y;
	position.state = "occupied";
	if( free ) {
		freeTile(oldX, oldY);
	}
}

function prepareNextPlayer() {
	dices.forEach(d=>{d.state = "hidden";d.value=0;});
	roleDicesButton.enabled = true;
	reposButton.visible = false;

	players[curPlayerIndex].alpinists.forEach(a=>a.button.enabled = false);
}

function reposPlayer(playerIndex, alpinistIndex) {
	// how many dices ?
	const ascension = dices.filter(d=>diceFace[d.value] === "ascension").length;
	const meteo = dices.filter(d=>diceFace[d.value] === "meteo").length;

	uiManager.addLogger(`ascension ${ascension}`);
	uiManager.addLogger(`player ${players[playerIndex].color}`);
	uiManager.addLogger(`alpinist ${alpinistIndex}`);
	const alpinist = players[playerIndex].alpinists[alpinistIndex];

	moveAlpinist(alpinist, Math.min(alpinist.tile+ascension,10));
	
	nextPlayer(ascension + meteo < 6);
}

function nextPlayer(next) {
	prepareNextPlayer();
	if( next ) {
		curPlayerIndex = (curPlayerIndex+1) % players.length;
	}
}

const roleDicesButton = new BButton(80, 200, "LANCER", ()=>{roleDices();});
const reposButton = new BButton(80, windowHeight - 30, "REPOS", ()=>{
	roleDicesButton.enabled = false;
	reposButton.enabled = false;
	if( reposButton.text === "CHUTE" ) {
		// TODO
		// get higher alpinist
		const alpinists = players[curPlayerIndex].alpinists;
		let higherAlpinistsIndex = -1;
		alpinists.forEach((a,i)=>{
			if( a.tile === 10) return;
			if( higherAlpinistsIndex === -1 || a.tile > alpinists[higherAlpinistsIndex].tile ) {
				higherAlpinistsIndex = i;
			}
		});
		if( alpinists[higherAlpinistsIndex].tile > 0 ) {
			// get second higher alpinist
			alpinists[higherAlpinistsIndex].tile = 0;
			secondHigherAlpinistsIndex = -1;
			alpinists.forEach((a,i)=>{
				if( a.tile === 10) return;
				if( secondHigherAlpinistsIndex === -1 ||  a.tile > alpinists[secondHigherAlpinistsIndex].tile ) {
					secondHigherAlpinistsIndex = i;
				}
			});
			if( alpinists[secondHigherAlpinistsIndex].tile > 0 ) {
				// move higher alpinist just below second alpinist
				moveAlpinist(alpinists[higherAlpinistsIndex], alpinists[secondHigherAlpinistsIndex].tile-1);
			} else {
				moveAlpinist(alpinists[higherAlpinistsIndex], 0);
			}
		}
		nextPlayer(true);
	} else {
		// enable all alpinists of cur player
		players[curPlayerIndex].alpinists.forEach(a=>a.button.enabled = true);
	}
	reposButton.text = "REPOS";
});

const playerButtons = [];

const scale = 0.65;

function startClicked() {
	curState = GAME_PLAY_STATE;
	playerButtons.forEach(p=>p.scale = scale);
	uiManager.setUI([roleDicesButton, reposButton, speakerButton, rulesButton, ...playerButtons]);
	reposButton.visible = false;
	playerButtons.forEach(p=>p.enabled = false);
}

const speakerButton = new BFloatingSwitchButton(windowWidth - 70 - 10 - 70, 70, '\uD83D\uDD0A', speakerClicked);
const musicButton = new BFloatingSwitchButton(windowWidth - 70, 70, '\uD83C\uDFB6', musicClicked);

const twoPlayersButtons = new BButton(80, windowHeight - 50 - 200, "2 Players", ()=>{initGame(2);});
const threePlayersButtons = new BButton(80, windowHeight - 50 - 100, "3 Players", ()=>{initGame(3);});
const fourPlayersButtons = new BButton(80, windowHeight - 50, "4 Players", ()=>{initGame(4);});

function initUI() {
    speakerButton.setTextSize(50);
	musicButton.setTextSize(50);
	rulesButton.setTextSize(50);
	musicButton.enabled = false;
	musicButton.checked = false;
	const menu = [twoPlayersButtons, threePlayersButtons, fourPlayersButtons, speakerButton, rulesButton ];
	uiManager.setUI(menu);
}

function setup() {
    initUI();
	canvas = createCanvas(windowWidth, windowHeight);
    canvas.parent('canvas');

	spritesheet.addSpriteSheet('dice', './dice.png', 52, 52);
	spritesheet.addSpriteSheet('players', './players.png', 67, 67);
	spritesheet.addSpriteSheet('regle', './regle.png', 417, 654);
	soundManager.addSound('dice-rolling', './dice-rolling.wav', 1);

    frameRate(20);

    lastTime = Date.now();
}

function updateGame(elapsedTime) {

}

function drawGame() {
	textAlign(LEFT, TOP);
	text(players[curPlayerIndex].color,10,10);

	drawDices();
}

function drawDices() {
	dices.forEach((d,i)=>{
		if( d.state === "hidden" ) return;
		const diceX = diceFace[d.value] === "danger" ? 50 : 320;
		spritesheet.drawSprite('dice', d.value, diceX, 250+75*i);
	});	
}

const positions = [
	[
		{x:510, y:630, state: "free"}, {x:555, y:630, state: "free"}, {x:600, y:630, state: "free"}, {x:510, y:675, state: "free"},
		{x:555, y:675, state: "free"}, {x:600, y:675, state: "free"}, {x:510, y:720, state: "free"}, {x:555, y:720, state: "free"}, {x:600, y:720, state: "free"}
	],
	[
		{x:730, y:650, state: "free"},{x:765, y:650, state: "free"},{x:800, y:650, state: "free"},{x:835, y:650, state: "free"},
		{x:730, y:700, state: "free"},{x:765, y:700, state: "free"},{x:800, y:700, state: "free"},{x:835, y:700, state: "free"},{x:870, y:700, state: "free"}
	],
	[
		{x:830, y:540, state: "free"},{x:865, y:540, state: "free"},{x:900, y:540, state: "free"},{x:935, y:540, state: "free"},
		{x:830, y:590, state: "free"},{x:865, y:590, state: "free"},{x:900, y:590, state: "free"},{x:935, y:590, state: "free"},{x:970, y:590, state: "free"}
	],
	[{x:998, y:527, state: "free"}],
	[{x:900, y:472, state: "free"}],
	[{x:814, y:417, state: "free"}],
	[
		{x:630, y:340, state: "free"},{x:665, y:340, state: "free"},{x:700, y:340, state: "free"},{x:735, y:340, state: "free"},
		{x:630, y:380, state: "free"},{x:665, y:380, state: "free"},{x:700, y:380, state: "free"},{x:735, y:380, state: "free"},{x:770, y:380, state: "free"}
	],
	[{x:783, y:272, state: "free"}],
	[{x:893, y:256, state: "free"}],
	[{x:952, y:191, state: "free"}],
	[
		{x:862, y:60, state: "free"},{x:882, y:60, state: "free"},{x:902, y:60, state: "free"},{x:922, y:60, state: "free"},
		{x:862, y:130, state: "free"},{x:882, y:130, state: "free"},{x:902, y:130, state: "free"},{x:922, y:130, state: "free"},{x:942, y:130, state: "free"}
	],
];

function initGame(nbPlayers) {
	let curP = 0;
	const colors = ["red","blue", "yellow","green"];
	for( let i=0; i < nbPlayers; i++ ) {
		const curPlayer = {color: colors[i], colorIndex: i, alpinists: []};
		for( let j=0; j < 6-nbPlayers; j++ ) {
			const position = positions[0][curP];
			const playerButton = new BImageButton(position.x, position.y, spritesheet.getImage('players', i), ()=>{
				reposPlayer(i, j);
			});
			playerButtons.push(playerButton);
			curPlayer.alpinists.push({tile: 0, button: playerButton});
			curP++;
		}
		players.push(curPlayer);
	}
	startClicked();
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

	const X=500;
	const Y=2;
	spritesheet.drawSprite('board', 0, X, Y);

    // draw game
	if (curState === GAME_PLAY_STATE) {
		updateGame(elapsedTime);
		drawGame();
	} 

    uiManager.draw();
	if (toolManager.currentTool) {
		toolManager.currentTool.draw();
	}
    jobManager.draw();

	if( rules ) {
		background(51, 51, 51, 200);
		const ruleX = 70;
		spritesheet.drawSprite('regle', 0, ruleX, 110);
		spritesheet.drawSprite('regle', 1, ruleX+420, 110);
		spritesheet.drawSprite('regle', 2, ruleX+420*2, 110);
	}
    
    lastTime = currentTime;
}

function mousePressed() {
	
}

function mouseClicked() {
	if( toggleDebug ) {
		uiManager.addLogger(`X=${mouseX}, Y=${mouseY}`);
	}
	if( rules ) {
		rules = false;
		rulesButton.enabled = true;
	} else {
		toolManager.mouseClicked();
		uiManager.mouseClicked();
	}
	
	return false;
}

function keyPressed() {
	if (key === "D") {
		toggleDebug = !toggleDebug;
	}
}