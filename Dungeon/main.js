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

function preload() {}

function musicClicked() {
	// TODO
}

function speakerClicked() {
	speakerButton.checked = !speakerButton.checked;
	soundManager.mute(!speakerButton.checked);
}

const speakerButton = new BFloatingButton(windowWidth - 70 - 10 - 70, 70, '\uD83D\uDD0A', speakerClicked);
const musicButton = new BFloatingButton(windowWidth - 70, 70, '\uD83C\uDFB6', musicClicked);

function initUI() {
	speakerButton.setTextSize(50);
	musicButton.setTextSize(50);
	musicButton.enabled = false;
	musicButton.checked = false;
	const menu = [ speakerButton, musicButton ];
	uiManager.setUI(menu);
}

const FPS = 60;

function setup() {
	initUI();
	canvas = createCanvas(windowWidth, windowHeight);
	canvas.parent('canvas');

	frameRate(FPS);

	spritesheet.addSpriteSheet('wall', './DungeonWall.png', 32, 32);
	spritesheet.addSpriteSheet('floor', './DungeonFloor.png', 32, 32);
	spritesheet.addSpriteSheet('key', './DungeonKey.png', 32, 32);
	spritesheet.addSpriteSheet('player', './player48x64.png', 48, 64);
	spritesheet.addSpriteSheet('enemy', './enemy48x64.png', 48, 64);

	soundManager.addSound('walk', './walking.wav', 0.25);

	lastTime = Date.now();
}

function updateGame(elapsedTime) {
	world.update(elapsedTime);
}

const translateX = 128;
const translateY = 32;
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
	if (toggleDebug) {
		const endOfLine = getEndOfLine(
			world.player.position.x + translateX + 24 * world.player.scale,
			world.player.position.y + translateY + 32 * world.player.scale,
			mouseX,
			mouseY
		);
		const box = world.enemy.getHitBox();
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
	world = new World(32);
	world.objects.push(new TiledObject(9, 17, 'key', [ 0, 1, 2, 3 ]));
}

function drawLoading() {
	fill(0);
	noStroke();
	textSize(50);
	textAlign(CENTER, CENTER);
	text('Loading...', width / 2, height / 2);
	if (
		soundManager.maxLoadedSounds === soundManager.maxLoadingSounds &&
		spritesheet.maxLoadedImages === spritesheet.maxLoadingImages
	) {
		curState = GAME_PLAY_STATE; //GAME_START_STATE;

		// init game
		initGame();
		textAlign(LEFT, BASELINE);
		uiManager.addLogger('Game loaded');
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
	uiManager.mouseClicked();

	const worldX = mouseX - translateX;
	const worldY = mouseY - translateY;
	// TODO: if mouse out of dungeon, do not fire
	// fire bullet
	world.addBullet(new Bullet(world.player.position.x + 24, world.player.position.y + 32, worldX, worldY));
}

function keyPressed() {
	if (key === 'D') {
		toggleDebug = !toggleDebug;
	}

	if( key === '+') {
		world.curRoomIndex = (world.curRoomIndex+1) % world.rooms.length;
		world.initRoom( world.rooms[world.curRoomIndex] );
	}
	if( key === '-') {
		world.curRoomIndex = (world.curRoomIndex+world.rooms.length-1) % world.rooms.length;
		world.initRoom( world.rooms[world.curRoomIndex] );
	}
}
