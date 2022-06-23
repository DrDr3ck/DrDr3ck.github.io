const uiManager = new UIManager();
const windowWidth = 1600;
const windowHeight = 860;
uiManager.loggerContainer = new LoggerContainer(windowWidth-300, windowHeight-100-319*.75, 240, 100);
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
let toggleDebug = false;
let lastTime = 0;
let hoverCard = -1;
const board = new Board();

function preload() {
	spritesheet.addSpriteSheet('background', './background.png', windowWidth, windowHeight);
	spritesheet.addSpriteSheet('colt_express', './colt_express.jpg', 329, 153);
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
	uiManager.setUI([ speakerButton, musicButton, plus3Button, nextButton, playButton, newTurnButton ]);
	plus3Button.enabled = false;
	playButton.visible = false;
	newTurnButton.visible = false;
	const banditName = board.bandit.name;
	uiManager.addLogger(`Start game as ${banditName[0].toUpperCase() + banditName.substring(1)}`);
	board.nextState();
}

const speakerButton = new BFloatingSwitchButton(windowWidth - 70 - 10 - 70, 70, '\uD83D\uDD0A', speakerClicked);
const musicButton = new BFloatingSwitchButton(windowWidth - 70, 70, '\uD83C\uDFB6', musicClicked);
const startButton = new BButton(80, windowHeight - 50 - 200, "START", startClicked);
const plus3Button = new BButton(35, 670, "+3", ()=>{
	board.bandit.moreCards();
	board.curBanditIndex = board.curBanditIndex + 1;
	board.nextState();
});
plus3Button.w = 170;

const nextButton = new BButton(760, 160, "NEXT", ()=>{board.nextState();});
const playButton = new BButton(760, 160, "PLAY", ()=>{board.playState();});
const newTurnButton = new BButton(760, 160, "NEW TURN", ()=>{});

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

	spritesheet.addSpriteSheet('verso_card', './verso_card.png', 223, 319);
	spritesheet.addSpriteSheet('avatars', './avatars.png', 64, 64);
	spritesheet.addSpriteSheet('marshal_avatar', './marshal_avatar.png', 64, 64);

	banditNames.forEach(name=>{
		spritesheet.addSpriteSheet(`${name}_cards`, `./${name}_cards.png`, 223, 319);
		spritesheet.addSpriteSheet(`${name}_gun`, `./${name}_gun_cards.png`, 223, 319);
		//spritesheet.addSpriteSheet(`${name}_main`, `./${name}_main_card.png`, 793, 556);
	});

	spritesheet.addSpriteSheet('verso_voyage', './verso_voyage.png', 319, 223);
	spritesheet.addSpriteSheet('voyage_items', './voyage_items.png', 84, 64);

	spritesheet.addSpriteSheet('toits', './toits.png', 300, 172);
	spritesheet.addSpriteSheet('wagons', './wagons.png', 300, 172);
	spritesheet.addSpriteSheet('butins', './butins.png', 92, 85);

    frameRate(60);

    lastTime = Date.now();
}

function updateGame(elapsedTime) {
	
}

function drawWagon(wagon,index) {
	const wagonX = 305*index;
	const wagonY = 360;
	spritesheet.drawSprite('wagons', wagon.index, 20+wagonX, wagonY);
	spritesheet.drawSprite('toits', index ===4 ? 1 : 0, 20+wagonX, wagonY-85);

	textAlign(CENTER, BOTTOM);
	textSize(32);
	if( wagon.butins[MALETTE] ) {
		spritesheet.drawSprite('butins', 0, 50+wagonX, wagonY+110);
		if( wagon.butins[MALETTE]>1) {
			fill(0);
			text(`x${wagon.butins[MALETTE]}`, 58+92/2+wagonX, 258+85);
			fill(250);
			text(`x${wagon.butins[MALETTE]}`, 60+92/2+wagonX, 260+85);
		}
	}
	if( wagon.butins[SAC] ) {
		spritesheet.drawSprite('butins', 1, 140+wagonX, wagonY+110);
		if( wagon.butins[SAC]>1 ) {
			fill(0);
			text(`x${wagon.butins[SAC]}`, 148+92/2+wagonX, wagonY+110-2+85);
			fill(250);
			text(`x${wagon.butins[SAC]}`, 150+92/2+wagonX, wagonY+110+85);
		}
	}
	if( wagon.butins[RUBIS] ) {
		spritesheet.drawSprite('butins', 2, 230+wagonX, wagonY+110);
		if( wagon.butins[RUBIS]>1 ) {
			fill(0);
			text(`x${wagon.butins[RUBIS]}`, 238+92/2+wagonX, wagonY+110-2+85);
			fill(250);
			text(`x${wagon.butins[RUBIS]}`, 240+92/2+wagonX, wagonY+110+85);
		}
	}

	// draw bandits
	wagon.bandits.forEach((b,i)=>spritesheet.drawSprite('avatars', b, 40+wagonX+70*i, wagonY+20));

	if( board.marshalIndex === index ) {
		spritesheet.drawSprite('marshal_avatar', 0, 40+wagonX+70*wagon.bandits.length, wagonY+20)
	}

}

function drawGame() {
	const banditName = board.bandit.name;
	//spritesheet.drawScaledSprite(`${banditName}_main`, 0, 10, windowHeight-556*.75, .75);
	
	spritesheet.drawScaledSprite('verso_card', 0, 226, 680, .75);

	spritesheet.drawScaledSprite(`${banditName}_gun`, 5, 32, 680, 0.75);

	board.bandit.cards.forEach((c,i) => {
		spritesheet.drawScaledSprite(`${banditName}_cards`, c, 220+120*i, windowHeight-319*0.75, 0.75);
	}); 
	if( hoverCard >= 0 ) {
		spritesheet.drawScaledSprite(`${banditName}_cards`, board.bandit.cards[hoverCard], 220+120*hoverCard, windowHeight-319*0.75, 0.75);
	}

	// draw train
	board.wagons.forEach((w,i)=>drawWagon(w,i));

	// voyage
	for( let i=0; i < board.voyages.length; i++ ) {
		spritesheet.drawSprite('verso_voyage', i===0 ? 0 : 1, 20+5*i, 35);	
	}
	const voyageItems = board.voyages[0];
	const voyageIndex = (voyage_name) => {
		if( voyage_name === "empty" ) return 0;
		if( voyage_name === "reverse" ) return 1;
		if( voyage_name === "Empty" ) return 2;
		if( voyage_name === "tunnel" ) return 3;
		if( voyage_name === "double" ) return 4;
		if( voyage_name === "Tunnel" ) return 5;
	};
	voyageItems.forEach((v,i)=>spritesheet.drawScaledSprite('voyage_items', voyageIndex(v), 25+84*i*.75, 430-350+35, .75));

	// draw turn cards
	if( board.cards.length > 0 ) {
		if( board.phase === CARD_PHASE ) {
			const lastCard = board.cards[board.cards.length-1];
			const lastBanditName = lastCard.name;
			if( lastCard.visible ) {
				spritesheet.drawScaledSprite(`${lastBanditName}_cards`, lastCard.index, 550, 25, 0.75);
			} else {
				spritesheet.drawScaledSprite("verso_card", 0, 550, 25, 0.75);
			}
		} else { // PLAY_PHASE
			const firstCard = board.cards[0];
			const firstBanditName = firstCard.name;
			spritesheet.drawScaledSprite(`${firstBanditName}_cards`, firstCard.index, 550, 25, 0.75);
		}
	}
}

function initGame() {
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
    if (curState === GAME_LOADING_STATE) {
		drawLoading();
		return;
	}

    uiManager.processInput();

    uiManager.update(elapsedTime);

    // draw game
	if( curState === GAME_START_STATE ) {
		spritesheet.drawSprite('background', 0,0,0);
		spritesheet.drawSprite('colt_express', 0,(windowWidth-329)/2,50);
	}
	if (curState === GAME_PLAY_STATE) {
		updateGame(elapsedTime);
		spritesheet.drawSprite('background', 0,0,0);
		background(51,51,51,151);
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
	if( hoverCard >= 0 && board.state === YOUR_TURN ) {
		// select this card for this turn
		board.useCard(board.bandit.name, hoverCard);
		board.nextState();
	}
	toolManager.mouseClicked();
	uiManager.mouseClicked();
	return false;
}

function mouseMoved() {
	hoverCard = -1;
	board.bandit.cards.forEach((c,i) => {
		const X = 220+120*i;
		const Y = windowHeight-319*0.75;
		const width = 223*.75;
		const height = 319*.75;
		if( mouseX > X && mouseX < X+width && mouseY > Y && mouseY < Y+height ) {
			hoverCard = i;
		}
	}); 
}

function keyPressed() {
	if (key === "D") {
		toggleDebug = !toggleDebug;
	}
}