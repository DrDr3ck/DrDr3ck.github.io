const uiManager = new UIManager();
const windowWidth = 1400;
const windowHeight = 800;
uiManager.loggerContainer = new LoggerContainer(50, windowHeight-100, 240, 100);
uiManager.loggerContainer.visible = true;

const toolManager = new ToolManager();
const jobManager = new JobManager();
const soundManager = new SoundMgr();
const spritesheet = new SpriteSheet();

const ANIM_FIGHT = 0;
const ANIM_HEART = 1;
const ANIM_ENERGY = 2;

const GAME_LOADING_STATE = 0;
const GAME_START_STATE = 1;
const GAME_PLAY_STATE = 2;
const GAME_OVER_STATE = 3;
let curState = GAME_LOADING_STATE;
let toggleDebug = false;
let lastTime = 0;

let board = null;

const diceButtons = [];

function preload() {
	spritesheet.addSpriteSheet('rules', './resources/rules.jpg', 692, 305);
}

function musicClicked() {
	// TODO
}

class BDiceButton extends BImageButton {
	constructor(x, y, img, callback) {
		super(x, y, img, callback);
		this.value = 0;
		this.used = false;
	}

	setValue(value) {
		this.value = value;
		this.img = spritesheet.getImage('dice', value);
	}

	doDraw() {		
		super.doDraw();
	}

	click() {
		if( this.used ) {
			this.used = false;
			this.y -= 100;
		} else {
			this.used = true;
			this.y += 100;
		}
	}
}

class SettingsDialog extends Dialog {
	constructor(x, y, w, h) {
		super(x, y, w, h);

		// close button
		this.components.push(new BFloatingButton(w - 80, 80, '\u2716', () => {
            uiManager.setDialog(null);
            delete this;
        }));
	}

	doDraw() {
		super.doDraw();
	}
}

const speakerStorageKey = 'DrDr3ck/KingOfTokyo/Speaker';
function speakerClicked() {
	speakerButton.checked = !speakerButton.checked;
	soundManager.mute(!speakerButton.checked);
	localStorage.setItem(speakerStorageKey, speakerButton.checked?"on":"off");
}

function startClicked() {
	const diceX = 647-249;
	const diceY = 100;
	for( let i=0; i < 6; i++ ) {
		diceButtons.push(new BDiceButton(diceX+75*i, diceY, spritesheet.getImage('dice', 0), ()=>{
			diceButtons[i].click();
		}));
	}
	curState = GAME_PLAY_STATE;
	uiManager.setUI([ speakerButton, rulesButton, roleDiceButton, enemyResolveButton, ...diceButtons, settingsButton, resolveButton ]);
	diceButtons.forEach(d=>{
		d.visible = false;
		d.used = false;
	});
	resolveButton.visible = false;
	enemyResolveButton.visible = false;
	nextMonster();
	uiManager.addLogger("Start game");
}

function nextMonster() {
	board.nextTurn();
	resolveButton.visible = false;
	enemyResolveButton.visible =false;
	roleDiceButton.enabled = true;
	if( board.monsters.some(m=>m.victory >= 20) ) {
		curState = GAME_OVER_STATE;
		roleDiceButton.visible = false;
	}
	
}

const resolveTurn = () => {
	resolveButton.visible = false;
	enemyResolveButton.visible =false;
	const result = board.resolve(resolveDice(board.curMonster().isEnemy() ? 2 : 3));
	resolveMonster(result);
}

const resolveMonster = (result) => {
	const monsterX = 910;
	const monsterY = [35, 310, 570];
	const curMonster = board.curMonster();
	if( result.energy > 0 ) {
		uiManager.addAnimations([
			new MoveAnimation(
				{X:610, Y:180},
				{X:monsterX+1223-910, Y:monsterY[board.curMonsterIndex]+200},
				75,
				spritesheet.getImage('animation_dice', ANIM_ENERGY),
				()=>{
					curMonster.addEnergy(result.energy);
					soundManager.playSound('energy');
				 }
			)]
		);
	}
	if( result.health > 0 && !curMonster.inTokyo && curMonster.health < curMonster.maxHealth ) {
		uiManager.addAnimations([
			new MoveAnimation(
				{X:610, Y:180},
				{X:monsterX+1115-910, Y:monsterY[board.curMonsterIndex]+210},
				75,
				spritesheet.getImage('animation_dice', ANIM_HEART),
				()=>{
					curMonster.addEnergy(result.health);
					soundManager.playSound('health');
				 }
			)]
		);
	}
	if( result.fight > 0 ) {
		const fightAnimations = [];
		console.log(curMonster.name, "is fighting")
		if( curMonster.inTokyo !== board.prevMonster().inTokyo) {
			fightAnimations.push(
				new MoveAnimation(
					curMonster.inTokyo ? {X:160, Y:220} : {X:monsterX, Y:monsterY[board.curMonsterIndex]},
					board.prevMonster() ? {X:160, Y:220} : {X:monsterX+1115-910, Y:monsterY[(board.curMonsterIndex+2)%3]+210},
					75,
					spritesheet.getImage('animation_dice', ANIM_FIGHT),
					()=>{
						console.log("Fight with", board.prevMonster().name);
						board.prevMonster().addDamage(result.fight);
						soundManager.playSound('fight');
					 }
				)
			);
		}
		if( curMonster.inTokyo !== board.nextMonster().inTokyo) {
			fightAnimations.push(
				new MoveAnimation(
					curMonster.inTokyo ? {X:160, Y:220} : {X:monsterX, Y:monsterY[board.curMonsterIndex]},
					board.nextMonster().inTokyo ? {X:160, Y:220} : {X:monsterX+1115-910, Y:monsterY[(board.curMonsterIndex+1)%3]+210},
					75,
					spritesheet.getImage('animation_dice', ANIM_FIGHT),
					()=>{
						console.log("Fight with", board.nextMonster().name);
						board.nextMonster().addDamage(result.fight);
						soundManager.playSound('fight');
					}
				)
			);
		}
		if( fightAnimations.length > 0 ) {
			uiManager.addAnimations(fightAnimations);
		}
	}
	// TODO: animation for victory ?
	curMonster.addVictory(result.victory.value, result.victory.count);
	if( board.moveMonster() ) {
		const animation = new MoveAnimation(
			{X:monsterX, Y:monsterY[board.curMonsterIndex]},
			{X:16, Y:89},
			75,
			spritesheet.getImage('monsters', board.curMonsterIndex),
			()=>{
				console.log("move monster");
				soundManager.playSound('roar');
				board.curMonster().moveIn();
				nextMonster();
				diceButtons.forEach(d=>{
					d.visible = false;
					if( d.used ) {
						d.click();
					}
				});
				if( board.askMoveOut ) {
					// ask player if he want to move out of Tokyo
				}
			}
		);
		animation.scale = 0.75;
		uiManager.addAnimations([animation]);
	} else {
		const animation = new MoveAnimation(
			{X:-500,Y:-500},{X:-450,Y:-450},100,
			spritesheet.getImage('animation_dice', ANIM_FIGHT), // empty animation would be better
			()=>{
				console.log("empty animation");
				nextMonster();
				diceButtons.forEach(d=>{
					d.visible = false;
					if( d.used ) {
						d.click();
					}
				});
				if( board.askMoveOut ) {
					// ask player if he want to move out of Tokyo
				}
			}
		);
		uiManager.addAnimations([animation]);
	}
}

let displayRules = false;

const speakerButton = new BFloatingSwitchButton(windowWidth - 70 - 70, 70, '\uD83D\uDD0A', speakerClicked);
const musicButton = new BFloatingSwitchButton(windowWidth - 70, 70, '\uD83C\uDFB6', musicClicked);
const settingsButton = new BFloatingButton(windowWidth - 70 - 70 - 70, 70, '\u273C', ()=>{
	const dialog = new SettingsDialog(800, 50, 560, 400);
    uiManager.setDialog(dialog);
});
const startButton = new BButton(430, windowHeight-10, "START", startClicked);
const rulesButton = new BFloatingButton(windowWidth - 70, 70, '?', ()=>{
	// display/hide rules
	displayRules = !displayRules;
	if( displayRules ) {
		rulesButton.enabled = false;
		speakerButton.enabled = false;
		startButton.visible = false;
	}
});
const enemyResolveButton = new BFloatingButton(831-249 + 80, 80, '\u2B8A', resolveTurn);
const roleDiceButton = new BFloatingButton(831-249, 80, '\u2685', ()=>{
	soundManager.playSound('dice-rolling');
	diceButtons.forEach(d=>{
		d.visible = true;
		if( !d.used ) {
			d.setValue(Math.floor(Math.random()*6))
		}
	});
	resolveButton.visible = !board.curMonster().isEnemy();
	enemyResolveButton.visible = board.curMonster().isEnemy();
	board.role = board.role-1;
	if( board.role === 0 ) {
		roleDiceButton.enabled = false;
	}
	if( board.curMonster().isEnemy() ) {
		const result = resolveDice();
		diceButtons.forEach(d=>{
			if( d.value === 3 || d.value === 5 ) {
				d.click();
			}
			if( d.value+1 === result.victoryValue && result.victoryCount >= 2 ) {
				d.click();
			}
			if( d.value === 4 && !board.curMonster().inTokyo ) {
				d.click();
			}
		});
	}
});

function resolveDice(maxDice=2) {
	const values = diceButtons.map(d=>d.value);
	const victory1 = values.filter(v=>v===0).length;
	const victory2 = values.filter(v=>v===1).length;
	const victory3 = values.filter(v=>v===2).length;
	let victoryValue = 0;
	if( victory1 >= maxDice ) {
		victoryValue = 1;
	}
	if( victory2 >= maxDice && victory2>victory1 ) {
		victoryValue = 2;
	}
	if( victory3 >= maxDice && victory3+1>=victory1 ) {
		victoryValue = 3;
	}
	return { 		
		fight: values.filter(v=>v===3).length,
		health: values.filter(v=>v===4).length,
		energy: values.filter(v=>v===5).length,
		victoryValue: victoryValue,
		victoryCount: victoryValue===1 ? victory1 : (victoryValue===2 ? victory2 : victory3)
	};
}

const resolveButton = new BButton(430, windowHeight-10, "RESOLVE", resolveTurn);

function initUI() {
    speakerButton.setTextSize(50);
	rulesButton.setTextSize(50);
	musicButton.setTextSize(50);
	settingsButton.setTextSize(50);
	musicButton.enabled = false;
	musicButton.checked = false;
	const isSpeakerOn = localStorage.getItem(speakerStorageKey);
	if( isSpeakerOn === "off" ) {
		speakerButton.checked = false;
		soundManager.mute(true);
	}
	const menu = [ speakerButton, startButton, rulesButton, settingsButton ];
	uiManager.setUI(menu);
}

function setup() {
    initUI();
	canvas = createCanvas(windowWidth, windowHeight);
    canvas.parent('canvas');

	spritesheet.addSpriteSheet('board', './resources/board.jpg', 455, 440);
	spritesheet.addSpriteSheet('fiches', './resources/fiches.png', 435, 344);
	spritesheet.addSpriteSheet('monsters', './resources/monsters.png', 365, 350);
	spritesheet.addSpriteSheet('dead', './resources/dead.png', 225, 225);
	spritesheet.addSpriteSheet('dice', './resources/dice.png', 73, 73);
	spritesheet.addSpriteSheet('animation_dice', './resources/animation_dice.png', 73, 73);
	spritesheet.addSpriteSheet('energy', './resources/energy.png', 372, 425);
	soundManager.addSound('dice-rolling', './resources/dice-rolling.wav', 1);
	soundManager.addSound('roar', './resources/roar.wav', 0.05);
	soundManager.addSound('fight', './resources/fight.wav', 0.95);
	soundManager.addSound('health', './resources/health.wav', 0.95);
	soundManager.addSound('energy', './resources/energy.wav', 0.55);

    frameRate(60);

    lastTime = Date.now();
}

let randomMonsterY = 0;
let gameTime = 500;

function updateGame(elapsedTime) {
	gameTime = gameTime - elapsedTime;
	if( gameTime < 0 ) {
		randomMonsterY = Math.random()*5;
		randomMonsterX = Math.random()*6 - 3;
		gameTime = 500;
	}
}

function drawGame() {
	spritesheet.drawScaledSprite('board', 0, 10, 10, 0.85);

	noFill();
	strokeWeight(3);
	stroke(255,228,180);
	const monsterX = 1100-249;
	spritesheet.drawScaledSprite('fiches', 0, monsterX, 10, 0.75);
	if( board.curMonsterIndex === 0 ) {
		rect(monsterX, 10, 435*.75, 344*.75);
	}
	if( board.monsters[0].inTokyo ) {
		spritesheet.drawScaledSprite('monsters',0,6+randomMonsterX,80+randomMonsterY,0.75);
	}
	if( board.monsters[0].isDead() ) {
		spritesheet.drawSprite('dead',0,monsterX+60, 20);
	}
	spritesheet.drawScaledSprite('fiches', 1, monsterX, 10+344*.75+5, 0.75);
	if( board.curMonsterIndex === 1 ) {
		rect(monsterX, 10+344*.75+5, 435*.75, 344*.75);
	}
	if( board.monsters[1].inTokyo ) {
		spritesheet.drawScaledSprite('monsters',1,6+randomMonsterX,80+randomMonsterY,0.75);
	}
	if( board.monsters[1].isDead() ) {
		spritesheet.drawSprite('dead',0,monsterX+60, 20+344*.75+5);
	}
	spritesheet.drawScaledSprite('fiches', 2, monsterX, 10+344*2*.75+10, 0.75);
	if( board.curMonsterIndex === 2 ) {
		rect(monsterX, 10+344*2*.75+10, 435*.75, 344*.75);
	}
	if( board.monsters[2].inTokyo ) {
		spritesheet.drawScaledSprite('monsters',2,6+randomMonsterX,80+randomMonsterY,0.75);
	}
	if( board.monsters[2].isDead() ) {
		spritesheet.drawSprite('dead',0,monsterX+60, 20+344*2*.75+10);
	}
	strokeWeight(1);

	textAlign(CENTER, CENTER);
	textSize(15);
	stroke(250);
	fill(51);
	text(board.monsters[0].victory, 942, 30);
	text(board.monsters[1].victory, 942, 292);
	text(board.monsters[2].victory, 942, 554);

	stroke(51);
	fill(250);
	text(board.monsters[0].health, 1115, 250);
	text(board.monsters[1].health, 1115, 510);
	text(board.monsters[2].health, 1124, 773);

	textSize(35);
	spritesheet.drawScaledSprite("energy", 0, 1200, 200, 0.14);
	text(`X ${board.monsters[0].energy}`, 1290, 230);
	spritesheet.drawScaledSprite("energy", 0, 1200, 200+344*.75+5, 0.14);
	text(`X ${board.monsters[1].energy}`, 1290, 230+344*.75+5);
	spritesheet.drawScaledSprite("energy", 0, 1200, 200+344*.75*2+10, 0.14);
	text(`X ${board.monsters[2].energy}`, 1290, 230+344*.75*2+10);
}

function initGame() {
	board = new Board();
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
		uiManager.addLogger('Game loaded');
	}
}

function drawBackground() {
	// background
	stroke(110, 160, 130);
	strokeWeight(3);
	fill(51);
	rect(1, 1, windowWidth-2, windowHeight-2, 10);
}

function draw() {
    const currentTime = Date.now();
	const elapsedTime = currentTime - lastTime;
    drawBackground();
    if (curState === GAME_LOADING_STATE) {
		drawLoading();
		return;
	}

	if( toggleDebug ) {
		noFill();
		stroke(250);
		rect(50, windowHeight-100, 240, 100);
	}

    uiManager.processInput();

    uiManager.update(elapsedTime);

    // draw game
	if( curState === GAME_START_STATE ) {
		updateGame(elapsedTime);
		drawGame();
	}
	if (curState === GAME_PLAY_STATE ) {
		updateGame(elapsedTime);
		drawGame();
	}
	if( curState === GAME_OVER_STATE ) {
		drawGame();
		textAlign(CENTER, CENTER);
		if( board.monsters[0].victory >= 20 ) {
			text("Player wins !!", windowWidth/2-75, windowHeight/2);
		} else {
			text("Player loses !!", windowWidth/2-75, windowHeight/2);
		}
	}

    uiManager.draw();
	if (toolManager.currentTool) {
		toolManager.currentTool.draw();
	}
    jobManager.draw();

	if( displayRules ) {
		background(51, 51, 51, 200);
		spritesheet.drawSprite('rules', 0, windowWidth/2-692/2, windowHeight/2-305/2);
	}
    
    lastTime = currentTime;
}

function mouseClicked() {
	if( displayRules ) {
		displayRules = !displayRules;
		rulesButton.enabled = true;
		speakerButton.enabled = true;
		startButton.visible = true;
		return;
	}
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