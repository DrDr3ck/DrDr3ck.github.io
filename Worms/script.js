const YELLOW = 0;
const RED = 1;
const PI = 3.141592;

let boomSong = null;
const initSongVolume = 0.3;
let songVolume = initSongVolume;

const world = {
	map: null,
	width: 2400,
	height: 400,
	teams: [ [], [] ],
	players: []
};

for (let i = 0; i < 2; i++) {
	world.players.push({
		bot: null,
		cameraTracking: null,
		fire: {
			bEnergising: true,
			bFireWeapon: false,
			fEnergyLevel: 0.0
		}
	});
}

function getData() {
	const data = {
		volume: songVolume
	};
	return data;
}

const storageKey = "WORMS";

function doSave() {
	const data = JSON.stringify(getData());
	if( data && data !== "null" ) {
		localStorage.setItem(storageKey, data);
		console.log("saving ",data);
	}
}

function loadData() {
	const storage = localStorage.getItem(storageKey);
	const initialData = getData();
	let data = initialData;
	if( storage ) {
		data = JSON.parse(storage) || initialData;
	}
	songVolume = data.volume;
}

function getNextPlayer(teamIndex) {
	const team = world.teams[teamIndex];
	const playerIndex = team.indexOf(world.players[teamIndex].bot);
	for (let i = 0; i < team.length; i++) {
		const curIndex = (i + playerIndex + 1) % team.length;
		if (team[curIndex].life > 0) {
			return team[curIndex];
		}
	}
	// gameover
	return null;
}

const userLang = navigator.language || navigator.userLanguage; // "en-US"

let entities = [];

function createBot(x, y, teamIndex) {
	if (teamIndex === YELLOW) {
		const bot = new Bot(x, y, 16, YELLOW);
		entities.push(bot);
		world.teams[0].push(bot);
	} else {
		const bot = new Bot(x, y, 16, RED);
		entities.push(bot);
		world.teams[1].push(bot);
	}
}

createBot(350, 50, YELLOW);
createBot(2050, 50, RED);
createBot(500, 50, YELLOW);
createBot(1900, 50, RED);
createBot(200, 50, YELLOW);
createBot(2200, 50, RED);

world.players[YELLOW].bot = entities[0];
world.players[RED].bot = entities[1];
world.players[YELLOW].cameraTracking = world.players[YELLOW].bot;
world.players[RED].cameraTracking = world.players[RED].bot;

// reverse default shoot angle for team 2
world.teams[1].forEach((member) => (member.shootAngle = -PI));

function checkPlayerTracking(playerIndex) {
	if (world.players[playerIndex].cameraTracking !== world.players[playerIndex].bot) {
		world.players[playerIndex].bot = getNextPlayer(playerIndex);
		world.players[playerIndex].cameraTracking = world.players[playerIndex].bot;
	}
}

function getMapColorIndex(currentDepth, beginDepth) {
	if (currentDepth <= beginDepth) {
		return 0;
	}
	if (currentDepth <= beginDepth + 5) {
		return 1;
	}
	if (currentDepth <= beginDepth + 55) {
		return 2;
	}
	if (currentDepth <= beginDepth + 255) {
		return 3;
	}
	return 4;
}

function createMap() {
	const map = [];
	for (let i = 0; i < world.width; i++) {
		const column = [];
		const maxLand = world.height - noise(i * 0.003) * world.height * 0.75;
		for (let j = 0; j < world.height; j++) {
			column.push(getMapColorIndex(j, maxLand));
		}
		map.push(column);
	}
	return map;
}

function drawShootAngle(bot, dx = 0, dy = 0) {
	if (!bot) return;
	const cx = bot.x - dx + 8.0 * cos(bot.shootAngle);
	const cy = bot.y - dy + 8.0 * sin(bot.shootAngle);
	fill(0);
	ellipse(cx, cy, 4, 4);
}

function getMapColor(mapValue) {
	switch (mapValue) {
		case 0:
			return { r: 0, g: 0, b: 128 };
		case 1:
			return { r: 0, g: 128, b: 0 };
		case 2:
			return { r: 139, g: 69, b: 19 };
		case 3:
			return { r: 128, g: 128, b: 128 };
		case 4:
			return { r: 255, g: 0, b: 0 };
		default:
			return { r: 0, g: 0, b: 0 };
	}
}

function drawObjects(dx, dy) {
	entities.forEach((entity) => {
		if (entity.y > 0) entity.draw(dx, dy);
	});
}

function drawFireBar(player, dx, dy) {
	if (!player.bot) return;
	for (let i = 0; i < 11 * player.fire.fEnergyLevel; i++) {
		line(player.bot.x - 5 - dx, player.bot.y - 12 - dy, player.bot.x - 5 + i - dx, player.bot.y - 12 - dy);
	}
}

function fireMissile(player) {
	// Get Weapon Origin
	const ox = player.bot.x;
	const oy = player.bot.y;

	// Get Weapon Direction
	const dx = cos(player.bot.shootAngle);
	const dy = sin(player.bot.shootAngle);

	// create Missile
	const missileStrength = 60.0 * player.fire.fEnergyLevel;
	const m = new Missile(ox, oy, dx * missileStrength, dy * missileStrength, player.bot.team);
	entities.push(m);

	// Reset flags involved with firing weapon
	player.fire.bFireWeapon = false;
	player.fire.fEnergyLevel = 0.0;
	player.fire.bEnergising = false;

	return m;
}

function jump(bot) {
	const a = bot.shootAngle;
	bot.velX = 6.0 * cos(a);
	bot.velY = 12.0 * sin(a);
	bot.stable = false;
}

function startFire(fire) {
	fire.bEnergising = true;
	fire.bFireWeapon = false;
	fire.fEnergyLevel = 0.0;
}

function fire(fire) {
	if (fire.bEnergising) {
		fire.bFireWeapon = true;
	}
	fire.bEnergising = false;
}

function holdingFire(fire, elapsedTime) {
	if (fire.bEnergising) {
		fire.fEnergyLevel += 0.75 * elapsedTime / 10;
		if (fire.fEnergyLevel >= 1.0) {
			// If it maxes out, Fire!
			fire.fEnergyLevel = 1.0;
			fire.bFireWeapon = true;
		}
	}
}

function aiming(bot, angleDelta) {
	bot.shootAngle += angleDelta;
}

function canPlay(playerIndex) {
	if( !world.players[playerIndex].bot ) {
		return false;
	}
	return (
		world.players[playerIndex].bot.stable &&
		world.players[playerIndex].bot === world.players[playerIndex].cameraTracking
	);
}

function checkLife(playerIndex) {
	// check life for full team
	world.teams[playerIndex].forEach(
		bot=>{
			if( bot.x < 0 || bot.y > 400) {
				bot.life = 0;
			}
			if( bot.x > world.width ) {
				bot.life = 0;
			}
		}
	);
	
	if (world.players[playerIndex].bot.life === 0) {
		world.players[playerIndex].bot = getNextPlayer(playerIndex);
		world.players[playerIndex].cameraTracking = world.players[playerIndex].bot;
	}
}

function drawText(string, x, y) {
	fill(222);
	text(string, x, y);
	fill(11);
	text(string, x + 1, y);
}

function drawHelp(secondCameraPixelOffset) {
	const sizeT = 16;
	const marginT = 5;
	textSize(sizeT);
	textAlign(LEFT);
	if (userLang !== 'en-US') {
		drawText('Q-D for aiming', 10, 390);
		drawText('Z to jump', 10, 390 - sizeT - marginT);
		drawText('Hold S to fire', 10, 390 - sizeT * 2 - marginT * 2);
	} else {
		drawText('A-D for aiming', 10, 390);
		drawText('W to jump', 10, 390 - sizeT - textMargin5);
		drawText('Hold S to fire', 10, 390 - sizeT * 2 - marginT * 2);
	}
	textAlign(RIGHT);
	drawText('4-6 for aiming', 1190, 390 + secondCameraPixelOffset);
	drawText('8 to jump', 1190, 390 - sizeT - marginT + secondCameraPixelOffset);
	drawText('Hold 5 to fire', 1190, 390 - sizeT * 2 - marginT * 2 + secondCameraPixelOffset);

	textAlign(LEFT, CENTER);
	if (songVolume === 0) {
		drawText('Press m to unmute', 10, 425);
	} else {
		drawText('Press m to mute', 10, 425);
	}
}

function gameIsStable(teamIndex) {
	let stable = true;
	entities.forEach((entity) => {
		if( entity.team === teamIndex) {
		    stable &= entity.stable;
		}
	});
	return stable;
}

const FPS = 60;

function preload() {
	boomSong = loadSound('./sounds/boom.mp3', ()=>{boomSong.setVolume(songVolume);});
}

function setup() {
	loadData();

	canvas = createCanvas(1200, 850);
	canvas.parent('canvas');

	frameRate(FPS);

	world.map = createMap();
}

function draw() {
	if (!world.players[YELLOW].bot) {
		// game over for player 1
		fill(250, 50, 50);
		textSize(128);
		textAlign(CENTER, CENTER);
		drawText('Game Over', width / 2, 200);
		drawText('You Win', width / 2, 650);
		textSize(32);
		drawText('Refresh to start (F5)', width / 2, 425);
		return;
	}
	if (!world.players[RED].bot) {
		// game over for player 2
		fill(250, 50, 50);
		textSize(128);
		textAlign(CENTER, CENTER);
		drawText('Game Over', width / 2, 650);
		drawText('You Win', width / 2, 200);
		textSize(32);
		drawText('Refresh to start (F5)', width / 2, 425);
		return;
	}

	checkLife(0);
	checkLife(1);

	const elapsedTime = 0.3;
	if (canPlay(0)) {
		// player 1 left
		if (keyIsDown(81) || keyIsDown(65)) {
			// q or a
			aiming(world.players[YELLOW].bot, -1 * elapsedTime / 10);
		}
		// player 1 right
		if (keyIsDown(68)) {
			aiming(world.players[YELLOW].bot, 1 * elapsedTime / 10);
		}
		// player 1 fire
		if (keyIsDown(83)) {
			holdingFire(world.players[YELLOW].fire, elapsedTime);
		}
		if (world.players[YELLOW].fire.bFireWeapon) {
			world.players[YELLOW].cameraTracking = fireMissile(world.players[YELLOW]);
		}
	}

	if (canPlay(1)) {
		// player 2 left
		if (keyIsDown(100)) {
			aiming(world.players[RED].bot, -1 * elapsedTime / 10);
		}
		// player 2 right
		if (keyIsDown(102)) {
			aiming(world.players[RED].bot, 1 * elapsedTime / 10);
		}
		// player 2 fire
		if (keyIsDown(101)) {
			holdingFire(world.players[RED].fire, elapsedTime);
		}
		if (world.players[RED].fire.bFireWeapon) {
			world.players[RED].cameraTracking = fireMissile(world.players[RED]);
		}
	}

	let cameraPosX1 = 0;
	let cameraPosY1 = 0;

	let cameraPosX2 = 0;
	let cameraPosY2 = 0;

	if (world.players[YELLOW].cameraTracking !== null) {
		cameraPosX1 = world.players[YELLOW].cameraTracking.x - width / 2;
		cameraPosY1 = world.players[YELLOW].cameraTracking.y - height / 2;
		//fCameraPosXTarget = pCameraTrackingObject->px - ScreenWidth() / 2;
		//fCameraPosYTarget = pCameraTrackingObject->py - ScreenHeight() / 2;
		//fCameraPosX += (fCameraPosXTarget - fCameraPosX) * 5.0f * fElapsedTime;
		//fCameraPosY += (fCameraPosYTarget - fCameraPosY) * 5.0f * fElapsedTime;
	}

	if (world.players[RED].cameraTracking !== null) {
		cameraPosX2 = world.players[RED].cameraTracking.x - width / 2;
		cameraPosY2 = world.players[RED].cameraTracking.y - height / 2;
	}

	// Clamp map boundaries
	if (cameraPosX1 < 0) cameraPosX1 = 0;
	if (cameraPosX1 >= world.width - width) cameraPosX1 = world.width - width;
	if (cameraPosY1 < 0) cameraPosY1 = 0;
	if (cameraPosY1 >= world.height - height) cameraPosY1 = world.height - 400;

	if (cameraPosX2 < 0) cameraPosX2 = 0;
	if (cameraPosX2 >= world.width - width) cameraPosX2 = world.width - width;
	if (cameraPosY2 < 0) cameraPosY2 = 0;
	if (cameraPosY2 >= world.height - height) cameraPosY2 = world.height - 400;

	// update objects
	entities.forEach((entity) => {
		entity.update(elapsedTime);
	});

	// draw map
	const secondCameraPixelOffset = 450;
	noStroke();
	const cameraDx1 = round(cameraPosX1);
	const cameraDy1 = round(cameraPosY1);
	const cameraDx2 = round(cameraPosX2);
	const cameraDy2 = round(cameraPosY2);
	loadPixels();
	for (let i = 0; i < width; i++) {
		// width of the canvas
		for (let j = 0; j < world.height; j++) {
			// height of the 'half' canvas
			let index = i + j * width;
			let color = getMapColor(world.map[i + cameraDx1][j + cameraDy1]);
			pixels[index * 4] = color.r;
			pixels[index * 4 + 1] = color.g;
			pixels[index * 4 + 2] = color.b;
			pixels[index * 4 + 3] = 255;
			color = getMapColor(world.map[i + cameraDx2][j + cameraDy2]);
			index = i + (j + secondCameraPixelOffset) * width;
			pixels[index * 4] = color.r;
			pixels[index * 4 + 1] = color.g;
			pixels[index * 4 + 2] = color.b;
			pixels[index * 4 + 3] = 255;
		}
	}
	updatePixels();
	fill(255);
	rect(0, 400, 1200, 50);

	// draw objects in the two cameras
	drawObjects(cameraPosX1, cameraPosY1);
	drawObjects(cameraPosX2, cameraPosY2 - secondCameraPixelOffset);

	// draw shootangle in the two cameras
	drawShootAngle(world.players[YELLOW].bot, cameraPosX1, cameraPosY1);
	drawShootAngle(world.players[RED].bot, cameraPosX2, cameraPosY2 - secondCameraPixelOffset);

	// Draws an Energy Bar, indicating how much energy should the weapon be fired with
	push();
	strokeWeight(3);
	stroke(250, 100, 100);
	drawFireBar(world.players[YELLOW], cameraPosX1, cameraPosY1);
	stroke(100, 250, 100);
	drawFireBar(world.players[RED], cameraPosX2, cameraPosY2 - secondCameraPixelOffset);
	pop();

	// text for help
	drawHelp(secondCameraPixelOffset);

	if (gameIsStable(YELLOW)) {
		fill(250, 100, 100);
		rect(10, 10, 10, 10);
		checkPlayerTracking(0);
	}
	if (gameIsStable(RED)) {
		fill(250, 100, 100);
		rect(width - 20, secondCameraPixelOffset + 10, 10, 10);
		checkPlayerTracking(1);
	}

	// TODO: memory leak
	entities = entities.filter((entity) => !entity.bDead);
}

function keyPressed() {
	if (canPlay(0)) {
		if (key === 'z' || key === 'w') {
			jump(world.players[YELLOW].bot);
		}
		if (key === 's') {
			// start firing
			startFire(world.players[YELLOW].fire);
		}
	}
	if (canPlay(1)) {
		if (key === '8') {
			jump(world.players[RED].bot);
		}
		if (key === '5') {
			// start firing
			startFire(world.players[RED].fire);
		}
	}
	if (key === 'm' || key == ',') {
		if (songVolume > 0) {
			songVolume = 0;
		} else {
			songVolume = initSongVolume;
		}
		if( boomSong ) {
			boomSong.setVolume(songVolume);
		}
		doSave();
	}

	console.log('Keycode for ', key, ':', keyCode);
}

function keyReleased() {
	if (canPlay(0)) {
		if (key === 's') {
			fire(world.players[YELLOW].fire);
		}
	}
	if (canPlay(1)) {
		if (key === '5') {
			fire(world.players[RED].fire);
		}
	}
}
