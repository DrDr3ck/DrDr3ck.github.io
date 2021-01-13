// Trello: https://trello.com/b/v36swcyX/dungeon

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
let menuImage = null;

function preload() {
	menuImage = loadImage('./resources/menu.png');
}

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
	saveData();
}

const speakerButton = new BFloatingButton(windowWidth - 70 - 10 - 70, 70, '\uD83D\uDD0A', speakerClicked);
const musicButton = new BFloatingButton(windowWidth - 70, 70, '\uD83C\uDFB6', musicClicked);
const helpButton = new BFloatingButton(20, 60, '\u003F', () => {
	helpButton.checked = !helpButton.checked;
	saveData();
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
	loadData();
	canvas = createCanvas(windowWidth, windowHeight);
	canvas.parent('canvas');

	frameRate(FPS);

	spritesheet.addSpriteSheet('player_ui', './resources/UIPlayer.png', 64, 64);

	spritesheet.addSpriteSheet('wall', './resources/DungeonWall.png', 32, 32);
	spritesheet.addSpriteSheet('floor', './resources/DungeonFloor.png', 32, 32);
	spritesheet.addSpriteSheet('key', './resources/DungeonKey.png', 32, 32);
	spritesheet.addSpriteSheet('potion', './resources/DungeonPotion.png', 32, 32);
	spritesheet.addSpriteSheet('chest', './resources/DungeonChest.png', 64, 32);
	spritesheet.addSpriteSheet('player', './resources/robot48x64.png', 48, 64);
	spritesheet.addSpriteSheet('enemy', './resources/robot64x64.png', 64, 64);
	spritesheet.addSpriteSheet('weapon', './resources/DungeonWeapon.png', 48, 48);
	spritesheet.addSpriteSheet('heart', './resources/heart.png', 32, 32);

	spritesheet.addSpriteSheet('life', './resources/life.png', 32, 32);

	soundManager.addSound('walk', './resources/walking.wav', 0.25);
	soundManager.addSound('laser', './resources/laser5.wav', 0.25);
	soundManager.addSound('laserEnemy', './resources/laser6.wav', 0.25);
	soundManager.addSound('hit', './resources/hit.wav', 0.052);
	soundManager.addSound('kill', './resources/kill.mp3', 0.125);
	soundManager.addSound('healing', './resources/healing.wav', 0.25);
	soundManager.addSound('open_chest', './resources/open_chest.wav', 0.25);
	soundManager.addSound('pick_up', './resources/pick_up.wav', 0.125);
	soundManager.addSound('next_level', './resources/next_level.wav', 0.125);
	soundManager.addSound('game_over', './resources/game_over.wav', 0.25);

	musicSound = loadSound('./resources/space_atmosphere.mp3', (sound) => {
		sound.setVolume(0.125);
		musicButton.enabled = true;
	});

	lastTime = Date.now();
}

function updateGame(elapsedTime) {
	world.update(elapsedTime);
	if (mouseIsPressed && world.player.gun && world.player.timeBeforeFiring === 0) {
		const worldX = mouseX - translateX;
		const worldY = mouseY - translateY;
		const tile = world.getTilePosition(worldX, worldY);
		if (toggleDebug) {
			console.log('tile position:', tile.X, tile.Y);
		}
		if (tile.X >= 0 && tile.Y >= 0) {
			// fire bullet
			world.addBullet(
				world.player.gun.fireBullet(world.player.position.x + 24, world.player.position.y + 40, worldX, worldY)
			);
			world.player.timeBeforeFiring = world.player.gun.frequency;
		}
	}
}

let translateX = 128;
let translateY = 32;
let toggleDebug = false;

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
			if (helpButton.checked) {
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

	// draw stuff of current slot
	// draw item stuff
	if (world.player.curSlot().id !== -1) {
		push();
		fill(128, 128, 28, 50);
		rect(928, 400, 200, 200, 5);
		textAlign(LEFT, TOP);
		textSize(15);
		fill(0);
		noStroke();
		const delta = 4;
		const object = world.player.curSlot().object;
		if (object.type === 'key') {
			text("It's a key!!", 928 + delta, 400 + delta);
		} else if (object.type === 'weapon') {
			const dps = Math.round(10000 * object.damage / object.frequency);
			text(`DPS: ${dps / 10}`, 928 + delta, 400 + delta);
			const speed = Math.round(10000/(32*16/object.speed))/10;
			text(`Speed: ${speed} tiles / sec`, 928 + delta, 400 + delta + 15 + delta);
			text(`Frequency: ${Math.round(10000/object.frequency)/10} bullets / sec`, 928 + delta, 400 + delta + 2*(15 + delta));
			text(`Damage: ${object.damage} PV`, 928 + delta, 400 + delta + 3*(15 + delta));
			text(`Range: ${Math.round(10*object.rangePixel/32)/10} tiles`, 928 + delta, 400 + delta + 4*(15 + delta));
		}
		pop();
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

	if (helpButton.checked) {
		const text_size = 16;
		spritesheet.drawSprite('player_ui', 2, 128 + 800 + 68 * 3, 232 + 68 * 0.5);
		drawKeyboardHelp('+', 128 + 800 + 68 * 3 + 24, 232 + 32, text_size);
		drawKeyboardHelp('-', 128 + 800 + 68 * 3 + 24, 232 + 32 + 68 + 10, text_size);

		const x = 32;
		const y = 90;
		spritesheet.drawSprite('player_ui', 1, x, y);
		drawKeyboardHelp(world.azerty ? 'Z' : 'Q', x + 25, y - 5, text_size);
		drawKeyboardHelp('S', x + 25, y - 5 + 18 + 10 + 64, text_size);
		drawKeyboardHelp(world.azerty ? 'Q' : 'A', x + 25 - 32 - 18, y - 5 + 64, text_size);
		drawKeyboardHelp('D', x + 25 + 32 + 18, y - 5 + 64, text_size);

		spritesheet.drawSprite('player_ui', 3, x, y + 64 + 25);
	}

	if (toggleDebug) {
		const endOfLine = getEndOfLine(
			world.player.position.x + translateX + 24 * world.player.scale,
			world.player.position.y + translateY + 32 * world.player.scale,
			mouseX,
			mouseY
		);
		if (world.curRoom.enemies.entities.length > 0) {
			const box = world.curRoom.enemies.entities[0].getHitBox();
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

function resetGame() {
	if (world.player.life === 0) {
		world = new World(32);
		world.updateHeart(world.player.life);
	}
}

const standardWeapon = weaponGenerator(true); //new Weapon(4, 1, 256, 500);
const uziWeapon = new Weapon(8, 2, 128, 250);
const bazookaWeapon = new Weapon(4, 4, 1024, 1000);

function initGame() {
	const menu = [ speakerButton, musicButton, helpButton ];
	const maxSlotI = 3;
	for (let j = 0; j < 2; j++) {
		for (let i = 0; i < maxSlotI; i++) {
			const slot = new BSlotButton(
				800 + 68 * i + translateX,
				translateY + 200 + 68 * j,
				spritesheet.getImage('player_ui', 0),
				() => {
					world.player.slotIndex = i + j * maxSlotI;
					world.player.updateGun();
				}
			);
			slotButtons.push(slot);
			menu.push(slot);
		}
	}
	uiManager.setUI(menu);

	world = new World(32);
	if (world.curRoomIndex === 1 && world.curRoom.objects.entities.length === 0) {
		world.curRoom.objects.entities.push(
			new TiledObject(2, 2, 'chest', [ 0 ], (object, player) => {
				if (object.state !== 'open') {
					if (player.removeKey()) {
						soundManager.playSound('open_chest');
						object.playAnimation('open');
						const newGun = weaponGenerator();
						player.addItem(newGun, Math.round(random(2, 8)));
					}
				}
			})
		);
		world.curRoom.objects.entities.push(
			new TiledObject(7, 7, 'key', [ 0, 1, 2, 3 ], (object, player) => {
				if (player.addItem(new Item('key'), 0)) {
					object.position.x = 10000;
					soundManager.playSound('pick_up');
					world.curRoom.removeObjectOccurrence('key');
				}
			})
		);
		world.curRoom.objects.entities[0].addAnimation('open', 'chest', [ 1 ], FPS, false);
	}
	world.player.addItem(standardWeapon, 2);
	world.player.addItem(uziWeapon, 5);
	world.player.addItem(bazookaWeapon, 8);

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
		curState = GAME_START_STATE;
		initGame();
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

	if (curState === GAME_START_STATE) {
		image(menuImage, width / 2 - menuImage.width / 2, height / 2 - menuImage.height / 2);
	}

	lastTime = currentTime;
}

function mouseClicked() {
	toolManager.mouseClicked();
	const uiClicked = uiManager.mouseClicked();
	if (curState === GAME_START_STATE) {
		return;
	}

	if (toggleDebug) {
		console.log('mouse position: ', mouseX, mouseY);
	}
}

document.addEventListener('keydown', (event) => {
	/*
	if (event.key === 'a' && event.code === 'KeyQ') {
		world.azerty = true;
	}
	*/
	if (event.key === 'z' && event.code === 'KeyW') {
		world.azerty = true;
	}
	if (event.key === 'w' && event.code === 'KeyW') {
		world.azerty = false;
	}
	if (event.key === 'q' && event.code === 'KeyA') {
		world.azerty = true;
	}
	if (event.key === 'a' && event.code === 'KeyA') {
		world.azerty = false;
	}

	if (event.key === 'q' && event.code === 'KeyQ') {
		world.azerty = false;
	}
	if (event.key === 'a' && event.code === 'KeyQ') {
		world.azerty = true;
	}
});

function getData() {
	const data = {
		speaker: speakerButton.checked,
		help: helpButton.checked
	};
	return data;
}

const storageKey = 'DrDr3ck/DUNG30N';

function saveData() {
	const data = JSON.stringify(getData());
	if (data && data !== 'null') {
		localStorage.setItem(storageKey, data);
		console.log('saving ', data);
		uiManager.addLogger('Saved');
	}
}

function loadData() {
	const storage = localStorage.getItem(storageKey);
	const initialData = getData();
	let data = initialData;
	if (storage) {
		data = JSON.parse(storage) || initialData;
		for (var k in initialData) {
			if (data[k] == undefined) {
				data[k] = initialData[k];
			}
		}
	}
	helpButton.checked = data.help;
	speakerButton.checked = data.speaker;
	soundManager.mute(!speakerButton.checked);
}

function mouseWheel(event) {
	if (event.delta > 0) {
		world.player.prevSlot();
	}
	if (event.delta < 0) {
		world.player.nextSlot();
	}
	//uncomment to block page scrolling
	return false;
}

function keyPressed() {
	if (curState === GAME_START_STATE) {
		if ((world.azerty && (key === 'a' || key === 'A')) || (!world.azerty && (key === 'q' || key === 'Q'))) {
			// init game
			resetGame();
			textAlign(LEFT, BASELINE);
			uiManager.addLogger('Defeat the Dungeon!!!');
			soundManager.playSound('next_level', 0.75);
			curState = GAME_PLAY_STATE;
		}
		return;
	}
	if (toggleDebug) {
		console.log('key:', key);
		console.log('keyCode:', keyCode);
	}
	if (key === 'D') {
		toggleDebug = !toggleDebug;
	}

	if (key === 't') {
		const calculator = new PathCalculator(world.tiles);
		const path = calculator.findPath({ X: 2, Y: 2 }, { X: 5, Y: 7 });
		console.log(path);
	}

	if (keyCode === 88) {
		// x
		// drop the current item
		world.player.dropItem();
	}

	if (keyCode === 109) {
		// -
		world.player.prevSlot();
	}
	if (keyCode === 107) {
		// +
		world.player.nextSlot();
	}
	for (let i = 0; i < world.player.maxSlots; i++) {
		if (keyCode === 49 + i) {
			world.player.slotIndex = i;
			world.player.updateGun();
		}
	}
}
