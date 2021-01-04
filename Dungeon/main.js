const uiManager = new UIManager();
const windowWidth = 1200;
const windowHeight = 800;
uiManager.loggerContainer = new LoggerContainer(windowWidth - 300, windowHeight - 100, 240, 100);
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
let musicSound = null;

function preload() {}

function musicClicked() {
	musicButton.checked = !musicButton.checked;
	if (musicButton.checked && !musicSound.isPlaying()) {
		musicSound.loop();
	} else if (!musicButton.checked && !musicSound.isPaused()) {
		musicSound.pause();
	}
}

function speakerClicked() {
	speakerButton.checked = !speakerButton.checked;
	soundManager.mute(!speakerButton.checked);
}

const speakerButton = new BFloatingButton(windowWidth - 70 - 10 - 70, 70, '\uD83D\uDD0A', speakerClicked);
const musicButton = new BFloatingButton(windowWidth - 70, 70, '\uD83C\uDFB6', musicClicked);
const helpButton = new BFloatingButton(20, 60, '\u003F', () => {
	toggleHelp = !toggleHelp;
	helpButton.checked = !helpButton.checked;
});

const slotButtons = [];

const hearts = [];

function initUI() {
	speakerButton.setTextSize(50);
	musicButton.setTextSize(50);
	musicButton.checked = false;
	musicButton.enabled = false;
	helpButton.setTextSize(30);
	helpButton.checked = false;
}

const FPS = 60;

function setup() {
	initUI();
	canvas = createCanvas(windowWidth, windowHeight);
	canvas.parent('canvas');

	frameRate(FPS);

	spritesheet.addSpriteSheet('player_ui', './resources/UIPlayer.png', 64, 64);

	spritesheet.addSpriteSheet('wall', './resources/DungeonWall.png', 32, 32);
	spritesheet.addSpriteSheet('floor', './resources/DungeonFloor.png', 32, 32);
	spritesheet.addSpriteSheet('key', './resources/DungeonKey.png', 32, 32);
	spritesheet.addSpriteSheet('potion', './resources/DungeonPotion.png', 32, 32);
	spritesheet.addSpriteSheet('player', './resources/robot48x64.png', 48, 64);
	spritesheet.addSpriteSheet('enemy', './resources/robot64x64.png', 64, 64);
	spritesheet.addSpriteSheet('weapon', './resources/DungeonWeapon.png', 48, 48);
	spritesheet.addSpriteSheet('heart', './resources/heart.png', 32, 32);

	soundManager.addSound('walk', './resources/walking.wav', 0.25);
	soundManager.addSound('laser', './resources/laser5.wav', 0.25);

	musicSound = loadSound('./resources/space_atmosphere.mp3', (sound) => {
		sound.setVolume(0.125);
		musicButton.enabled = true;
	});

	lastTime = Date.now();
}

function updateGame(elapsedTime) {
	world.update(elapsedTime);
}

let translateX = 128;
let translateY = 32;
let toggleDebug = false;
let toggleHelp = false;

function getEndOfLine(x1, y1, x2, y2) {
	const dx = x2 - x1;
	const dy = y2 - y1;
	return { x: x1 + dx * windowWidth, y: y1 + dy * windowWidth };
}

function drawGame() {
	push();
	translate(translateX, translateY);
	world.draw();
	pop();

	// draw hearts
	hearts.forEach((heart) => heart.draw());

	// draw slots for player
	const maxSlotI = 3;
	for (let i = 0; i < maxSlotI; i++) {
		for (let j = 0; j < 2; j++) {
			const index = i + j * maxSlotI;
			if (index === world.player.slotIndex) {
				stroke(150, 50, 50, 150);
				noFill();
				strokeWeight(3);
				rect(800 + 68 * i - 1 + 128, 200 + 68 * j - 1 + 32, 66, 66);
			}
			if (toggleHelp) {
				push();
				const deltaX = 24;
				const deltaY = j === 0 ? -5 : 64 + 5 + 16;
				const x = 800 + 68 * i - 1 + deltaX + 128;
				const y = deltaY + 200 + 68 * j + 32;
				const text_size = 16;
				//drawKeyboardHelp(world.uiKeys[index], x, y, text_size);
				drawKeyboardHelp(index + 1, x, y, text_size);
				pop();
			}
		}
	}

	// draw bullets left
	noStroke();
	strokeWeight(1);
	fill(150, 50, 50);
	for (let i = 0; i < world.bulletsMax - world.bullets.length; i++) {
		rect(55, 255 + 40 * (world.bulletsMax - 1 - i), 15, 30);
	}

	stroke(150, 50, 50, 150);
	noFill();
	strokeWeight(3);
	rect(50, 250, 25, 40 * world.bulletsMax);
	for (let i = 1; i < world.bulletsMax; i++) {
		line(50, 250 + 40 * i, 75, 250 + 40 * i);
	}

	if (toggleHelp) {
		const text_size = 16;
		spritesheet.drawSprite('player_ui', 2, 128 + 800 + 68 * 3, 232 + 68 * 0.5);
		drawKeyboardHelp('+', 128 + 800 + 68 * 3 + 24, 232 + 32, text_size);
		drawKeyboardHelp('-', 128 + 800 + 68 * 3 + 24, 232 + 32 + 68 + 10, text_size);

		const x = 28;
		const y = 80 + 32;
		spritesheet.drawSprite('player_ui', 1, x, y);
		drawKeyboardHelp('Z', x + 25, y - 5, text_size);
		drawKeyboardHelp('S', x + 25, y - 5 + 18 + 10 + 64, text_size);
		drawKeyboardHelp('Q', x + 25 - 32 - 18, y - 5 + 64, text_size);
		drawKeyboardHelp('D', x + 25 + 32 + 18, y - 5 + 64, text_size);

		spritesheet.drawSprite('player_ui', 3, 128 + 800 + 68 * 3, 232 * 0.5);
	}

	if (toggleDebug) {
		const endOfLine = getEndOfLine(
			world.player.position.x + translateX + 24 * world.player.scale,
			world.player.position.y + translateY + 32 * world.player.scale,
			mouseX,
			mouseY
		);
		if( world.enemies.length > 0 ) {
		const box = world.enemies[0].getHitBox();
		lineRect(
			world.player.position.x + translateX + 24 * world.player.scale,
			world.player.position.y + translateY + 32 * world.player.scale,
			endOfLine.x,
			endOfLine.y,
			box.x + translateX,
			box.y + translateY,
			box.w,
			box.h
		);
		}
		strokeWeight(1);
		stroke(0);
		line(
			world.player.position.x + translateX + 24 * world.player.scale,
			world.player.position.y + translateY + 32 * world.player.scale,
			endOfLine.x,
			endOfLine.y
		);
		//rect(192+translateX+96,32+192+translateY,96,96);
	}
}

function initGame() {
	const menu = [ speakerButton, musicButton, helpButton ];
	const maxSlotI = 3;
	for (let i = 0; i < maxSlotI; i++) {
		for (let j = 0; j < 2; j++) {
			const slot = new BSlotButton(
				800 + 68 * i + translateX,
				translateY + 200 + 68 * j,
				spritesheet.getImage('player_ui', 0),
				() => {
					world.player.slotIndex = i + j * maxSlotI;
				}
			);
			slotButtons.push(slot);
			menu.push(slot);
		}
	}
	uiManager.setUI(menu);

	world = new World(32);
	//world.objects.push(new TiledObject(9, 17, 'key', [ 0, 1, 2, 3 ]));
	//world.objects.push(new TiledObject(10, 16, 'key', [ 4, 5, 6, 7 ]));

	slotButtons[0].setItem(spritesheet.getImage('weapon', 2));

	for (let i = 0; i < 5; i++) {
		const x = windowWidth / 2 - 16 - 80 + 40 * i;
		const heartSprite = new Sprite(x, 5);
		heartSprite.addAnimation('fullHearth', 'heart', [ 0 ], FPS, false);
		heartSprite.addAnimation('noHearth', 'heart', [ 4 ], FPS, false);
		heartSprite.addAnimation('halfHearth', 'heart', [ 2 ], FPS, false);
		heartSprite.addAnimation('fullHalfHearth', 'heart', [ 1 ], FPS, false);
		heartSprite.addAnimation('noHalfHearth', 'heart', [ 3 ], FPS, false);
		hearts.push(heartSprite);
	}
}

function drawLoading() {
	fill(0);
	noStroke();
	textSize(50);
	textAlign(CENTER, CENTER);
	text('Loading...', width / 2, height / 2);
	fill(50, 50, 150);
	const total = soundManager.soundToLoad + spritesheet.totalImagesToLoad;
	const current = soundManager.totalLoadedSounds + spritesheet.totalLoadedImages;
	rect(width / 4, height / 4 * 3, current / total * width / 2, height / 10);
	stroke(0);
	noFill();
	rect(width / 4, height / 4 * 3, width / 2, height / 10);
	if (
		soundManager.totalLoadedSounds === soundManager.soundToLoad &&
		spritesheet.totalLoadedImages === spritesheet.totalImagesToLoad
	) {
		curState = GAME_PLAY_STATE; //GAME_START_STATE;

		// init game
		initGame();
		textAlign(LEFT, BASELINE);
		uiManager.addLogger('Defeat the Dungeon!!!');
	}
}

function draw() {
	const currentTime = Date.now();
	const elapsedTime = currentTime - lastTime;
	background(129, 144, 160);
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
	if (toggleDebug) {
		text(elapsedTime, 10, 50);

		text(world.player.position.x, 10, 100);
		text(world.player.position.y, 10, 150);
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
	const uiClicked = uiManager.mouseClicked();

	if (!uiClicked) {
		const worldX = mouseX - translateX;
		const worldY = mouseY - translateY;
		const tile = world.getTilePosition(worldX, worldY);
		if (toggleDebug) {
			console.log('tile position:', tile.X, tile.Y);
		}
		if (tile.X >= 0 && tile.Y >= 0) {
			// fire bullet
			world.addBullet(new Bullet(world.player.position.x + 24, world.player.position.y + 32, worldX, worldY));
		}
	}

	if (toggleDebug) {
		console.log('mouse position: ', mouseX, mouseY);
	}
}

document.addEventListener('keydown',(event)=>{
	if( event.key === 'z' && event.code === "KeyW" ) {
		world.azerty = true;
	}
	if( event.key === 'w' && event.code === "KeyW" ) {
		world.azerty = false;
	}
	if( event.key === 'q' && event.code === "KeyA" ) {
		world.azerty = true;
	}
	if( event.key === 'a' && event.code === "KeyA" ) {
		world.azerty = false;
	}
});

function keyPressed() {
	if( toggleDebug){
		console.log("key:", key);
		console.log("keyCode:", keyCode);
	}
	if (key === 'D') {
		toggleDebug = !toggleDebug;
	}

	if (keyCode === 109 ) { // -
		world.player.prevSlot();
	}
	if (keyCode === 107) { // +
		world.player.nextSlot();
	}
	for (let i = 0; i < world.player.maxSlots; i++) {
		if (keyCode === 49+i) {
			world.player.slotIndex = i;
		}
	}

	// t for test
	if (key === 't') {
		// fire an enemy bullet
		if (world.enemies.length >= 1) {
			const enemy = world.enemies[0];
			world.enemyBullets.push(
				new Bullet(
					enemy.position.x + 24,
					enemy.position.y + 32,
					world.player.position.x+24,
					world.player.position.y+32
				)
			);
		}
	}

	let redrawHeart = false;
	if (key === '+') {
		world.player.life = Math.min(world.player.life + 1, 20);
		redrawHeart = true;
	}
	if (key === '-') {
		world.player.life = Math.max(world.player.life - 1, 0);
		redrawHeart = true;
	}

	if (redrawHeart) {
		world.updateHeart(world.player.life);
	}
}
