const world = {
	map: null,
	width: 2400,
	height: 400,
	teams: [],
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

function getNextPlayer(teamIndex) {
	const team = world.teams[teamIndex];
	const playerIndex = team.indexOf(world.players[teamIndex].bot);
	for (let i = 0; i < team.length; i++) {
		const curIndex = (i + playerIndex + 1) % team.length;
		if (!team[curIndex].bDead) {
			return team[curIndex];
		}
	}
	// TODO; gameover ?
	return world.players[teamIndex].bot;
}

const PI = 3.141592;

class Entity {
	constructor(x, y) {
		this.x = x;
		this.y = y;
		this.velX = 0;
		this.velY = 0;
		this.accX = 0;
		this.accY = 0;
		this.stable = false;
		this.radius = 18;
		this.nBounceBeforeDeath = -1;
		this.bDead = false;
		this.explode = false;

		this.friction = 0.2;
	}

	draw(dx, dy) {
		ellipse(this.x - dx, this.y - dy, this.radius * 2, this.radius * 2);
	}

	update(elapsedTime) {
		if (this.stable) return;
		this.accY = 2.0; // gravity
		// update velocity
		this.velX += this.accX * elapsedTime;
		this.velY += this.accY * elapsedTime;
		// update position
		const fPotentialX = this.x + this.velX * elapsedTime;
		const fPotentialY = this.y + this.velY * elapsedTime;
		// reset acceleration
		this.accX = 0;
		this.accY = 0;
		this.stable = false;

		// collision with map
		const angle = atan2(this.velY, this.velX);
		let fResponseX = 0;
		let fResponseY = 0;
		let bCollision = false;

		for (let r = angle - PI / 2.0; r < angle + PI / 2.0; r += PI / 8.0) {
			// Calculate test point on circumference of circle
			let fTestPosX = this.radius * cos(r) + fPotentialX;
			let fTestPosY = this.radius * sin(r) + fPotentialY;

			// Constrain to test within map boundary
			if (fTestPosX >= world.width) fTestPosX = world.width - 1;
			if (fTestPosY >= world.height) fTestPosY = world.height - 1;
			if (fTestPosX < 0) fTestPosX = 0;
			if (fTestPosY < 0) fTestPosY = 0;

			// Test if any points on semicircle intersect with terrain
			if (world.map[Math.floor(fTestPosX)][Math.floor(fTestPosY)] !== 0) {
				// Accumulate collision points to give an escape response vector
				// Effectively, normal to the areas of contact
				fResponseX += fPotentialX - fTestPosX;
				fResponseY += fPotentialY - fTestPosY;
				bCollision = true;
			}
		}

		// Calculate magnitudes of response and velocity vectors
		const fMagVelocity = sqrt(this.velX * this.velX + this.velY * this.velY);
		const fMagResponse = sqrt(fResponseX * fResponseX + fResponseY * fResponseY);

		// Collision occurred
		if (bCollision) {
			// Force object to be stable, this stops the object penetrating the terrain
			if (fMagVelocity < 1) this.stable = true;

			// Calculate reflection vector of objects velocity vector, using response vector as normal
			const dot = this.velX * (fResponseX / fMagResponse) + this.velY * (fResponseY / fMagResponse);

			// Use friction coefficient to dampen response (approximating energy loss)
			this.velX = this.friction * (-2.0 * dot * (fResponseX / fMagResponse) + this.velX);
			this.velY = this.friction * (-2.0 * dot * (fResponseY / fMagResponse) + this.velY);

			//Some objects will "die" after several bounces
			if (this.nBounceBeforeDeath > 0) {
				// BOOM
				this.nBounceBeforeDeath--;
				this.bDead = this.nBounceBeforeDeath == 0;

				// If object died, work out what to do next
				if (this.bDead && this.explode) {
					// Shockwave other entities in range
					entities.filter((entity) => entity !== this).forEach((entity) => {
						const dx = entity.x - this.x;
						const dy = entity.y - this.y;
						const dist = Math.max(0.0001, sqrt(dx * dx + dy * dy));

						if (dist < entity.radius * 2) {
							entity.velX = dx / dist * entity.radius;
							entity.velY = dy / dist * entity.radius;
							entity.stable = false;
							entity.life = 0; //Math.max(0,entity.life-25);
						}
					});

					// create a hole
					const holeSize = 80;
					for (let i = 0; i < holeSize; i++) {
						for (let j = 0; j < holeSize; j++) {
							const dx = this.x - holeSize / 2 + i - this.x;
							const dy = this.y - holeSize / 2 + j - this.y;
							const dist = Math.max(0.0001, sqrt(dx * dx + dy * dy));
							if (dist < holeSize / 2) {
								const mapX = Math.min(world.width - 1, Math.max(0, floor(this.x - dx)));
								const mapY = Math.min(world.height - 1, Math.max(0, floor(this.y - dy)));
								world.map[mapX][mapY] = 0;
							}
						}
					}

					// check to which player belongs this missile
					if (world.players[0].cameraTracking === this) {
						world.players[0].bot = getNextPlayer(0);
						world.players[0].cameraTracking = world.players[0].bot;
					} else if (world.players[1].cameraTracking === this) {
						world.players[1].bot = getNextPlayer(1);
						world.players[1].cameraTracking = world.players[1].bot;
					}

					for (let i = 0; i < 20; i++) entities.push(new Debris(this.x, this.y));
				}
			}
		} else {
			// No collision so update objects position
			this.x = fPotentialX;
			this.y = fPotentialY;
		}

		// Turn off movement when tiny
		//if (fMagVelocity < 0.5) this.stable = true;
	}
}

const YELLOW = 1;
const RED = 2;

class Bot extends Entity {
	constructor(x, y, radius, team) {
		super(x, y);
		this.radius = radius;
		this.shootAngle = 0;
		this.team = team;
		this.life = 100;
	}

	draw(dx, dy) {
		if (this.team === YELLOW) {
			fill(250, 250, 120);
		}
		if (this.team === RED) {
            fill(250, 120, 120);
		}
		if (this.life > 0) {
			super.draw(dx, dy);
			fill(50, 250, 50, 128);
			rect(this.x - dx - this.radius, this.y - dy + 5 + this.radius, this.radius * 2 * this.life / 100, 3);
		} else {
			// draw a grave ?
			fill(250, 250, 250);
			rect(this.x - 3 - dx, this.y - this.radius - dy, 6, this.radius * 2);
			rect(this.x - dx - this.radius + 5, this.y - 10 - dy, this.radius * 2 - 10, 5);
		}
	}
}

class Debris extends Entity {
	constructor(x, y) {
		super(x, y);
		this.velX = 10.0 * Math.cos(Math.random() * 2.0 * PI);
		this.velY = 10.0 * Math.sin(Math.random() * 2.0 * PI);
		this.radius = 2.0;
		this.friction = 0.8;
		this.nBounceBeforeDeath = 5; // After 5 bounces, dispose
	}

	draw(dx, dy) {
		fill(120, 250, 120);
		super.draw(dx, dy);
	}
}

class Missile extends Entity {
	constructor(x, y, vx, vy) {
		super(x, y);
		this.radius = 3;
		this.velX = vx;
		this.velY = vy;
		this.friction = 0.5;
		this.nBounceBeforeDeath = 1;
		this.explode = true;
	}

	draw(dx, dy) {
		fill(200, 200, 200);
		super.draw(dx, dy);
	}
}

const userLang = navigator.language || navigator.userLanguage; // "en-US"

let entities = [];

entities.push(new Bot(550, 50, 16, YELLOW));
entities.push(new Bot(2050, 50, 16, RED));
entities.push(new Bot(700, 50, 16, YELLOW));
entities.push(new Bot(1900, 50, 16, RED));
entities.push(new Bot(250, 50, 16, YELLOW));
entities.push(new Bot(2250, 50, 16, RED));

world.players[0].bot = entities[0];
world.players[1].bot = entities[1];
world.players[0].cameraTracking = world.players[0].bot;
world.players[1].cameraTracking = world.players[1].bot;

world.teams.push([ entities[0], entities[2], entities[4] ]);
world.teams.push([ entities[1], entities[3], entities[5] ]);

// reverse default shoot angle for team 2
world.teams[1].forEach((member) => (member.shootAngle = -PI));

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

function drawShootAngle(player, dx = 0, dy = 0) {
	const cx = player.x - dx + 8.0 * cos(player.shootAngle);
	const cy = player.y - dy + 8.0 * sin(player.shootAngle);
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

function drawFireBar(fire, player, dx, dy) {
	for (let i = 0; i < 11 * fire.fEnergyLevel; i++) {
		line(player.x - 5 - dx, player.y - 12 - dy, player.x - 5 + i - dx, player.y - 12 - dy);
	}
}

function fireMissile(player, fire) {
	// Get Weapon Origin
	const ox = player.x;
	const oy = player.y;

	// Get Weapon Direction
	const dx = cos(player.shootAngle);
	const dy = sin(player.shootAngle);

	// create Missile
	const missileStrength = 60.0 * fire.fEnergyLevel;
	const m = new Missile(ox, oy, dx * missileStrength, dy * missileStrength);
	entities.push(m);

	// Reset flags involved with firing weapon
	fire.bFireWeapon = false;
	fire.fEnergyLevel = 0.0;
	fire.bEnergising = false;

	return m;
}

function jump(player) {
	const a = player.shootAngle;
	player.velX = 6.0 * cos(a);
	player.velY = 12.0 * sin(a);
	player.stable = false;
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

function canPlay(playerIndex) {
	return (
		world.players[playerIndex].bot.stable &&
		world.players[playerIndex].bot === world.players[playerIndex].cameraTracking
	);
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
	fill(0);
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
}

function gameIsStable(index) {
	let stable = true;
	entities.forEach((entity) => {
		stable &= entity.stable;
	});
	return stable;
}

const FPS = 60;

function setup() {
	canvas = createCanvas(1200, 850);
	canvas.parent('canvas');

	frameRate(FPS);

	world.map = createMap();
}

function draw() {
	const elapsedTime = 0.3;
	if (canPlay(0)) {
		// player 1 left
		if (keyIsDown(81) || keyIsDown(65)) {
			// q or a
			world.players[0].bot.shootAngle -= 1 * elapsedTime / 10;
		}
		// player 1 right
		if (keyIsDown(68)) {
			world.players[0].bot.shootAngle += 1 * elapsedTime / 10;
		}
		// player 1 fire
		if (keyIsDown(83)) {
			holdingFire(world.players[0].fire, elapsedTime);
		}
		if (world.players[0].fire.bFireWeapon) {
			const m = fireMissile(world.players[0].bot, world.players[0].fire);
			world.players[0].cameraTracking = m;
		}
	}

	if (canPlay(1)) {
		// player 2 left
		if (keyIsDown(100)) {
			world.players[1].bot.shootAngle -= 1 * elapsedTime / 10;
		}
		// player 2 right
		if (keyIsDown(102)) {
			world.players[1].bot.shootAngle += 1 * elapsedTime / 10;
		}
		// player 2 fire
		if (keyIsDown(101)) {
			holdingFire(world.players[1].fire, elapsedTime);
		}
		if (world.players[1].fire.bFireWeapon) {
			const m = fireMissile(world.players[1].bot, world.players[1].fire);
			world.players[1].cameraTracking = m;
		}
	}

	let cameraPosX1 = 0;
	let cameraPosY1 = 0;

	let cameraPosX2 = 0;
	let cameraPosY2 = 0;

	if (world.players[0].cameraTracking !== null) {
		cameraPosX1 = world.players[0].cameraTracking.x - width / 2;
		cameraPosY1 = world.players[0].cameraTracking.y - height / 2;
		//fCameraPosXTarget = pCameraTrackingObject->px - ScreenWidth() / 2;
		//fCameraPosYTarget = pCameraTrackingObject->py - ScreenHeight() / 2;
		//fCameraPosX += (fCameraPosXTarget - fCameraPosX) * 5.0f * fElapsedTime;
		//fCameraPosY += (fCameraPosYTarget - fCameraPosY) * 5.0f * fElapsedTime;
	}

	if (world.players[1].cameraTracking !== null) {
		cameraPosX2 = world.players[1].cameraTracking.x - width / 2;
		cameraPosY2 = world.players[1].cameraTracking.y - height / 2;
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

	// draw objects
	drawObjects(cameraPosX1, cameraPosY1);
	drawObjects(cameraPosX2, cameraPosY2 - secondCameraPixelOffset);

	// draw shootangle
	drawShootAngle(world.players[0].bot, cameraPosX1, cameraPosY1);
	drawShootAngle(world.players[1].bot, cameraPosX2, cameraPosY2 - secondCameraPixelOffset);

	// Draws an Energy Bar, indicating how much energy should the weapon be fired with
	push();
	strokeWeight(3);
	stroke(250, 100, 100);
	drawFireBar(world.players[0].fire, world.players[0].bot, cameraPosX1, cameraPosY1);
	stroke(100, 250, 100);
	drawFireBar(world.players[1].fire, world.players[1].bot, cameraPosX2, cameraPosY2 - secondCameraPixelOffset);
	pop();

	// text for help
	drawHelp(secondCameraPixelOffset);

	if (gameIsStable(0)) {
		fill(250, 100, 100);
		rect(10, 10, 10, 10);
	}
	if (gameIsStable(1)) {
		fill(250, 100, 100);
		rect(width - 20, secondCameraPixelOffset + 10, 10, 10);
	}

	// TODO: memory leak
	entities = entities.filter((entity) => !entity.bDead);
}

function keyPressed() {
	if (canPlay(0)) {
		if (key === 'z' || key === 'w') {
			jump(world.players[0].bot);
		}
		if (key === 's') {
			// start firing
			startFire(world.players[0].fire);
		}
	}
	if (canPlay(1)) {
		if (key === '8') {
			jump(world.players[1].bot);
		}
		if (key === '5') {
			// start firing
			startFire(world.players[1].fire);
		}
	}
	console.log('Keycode for ', key, ':', keyCode);
}

function keyReleased() {
	if (canPlay(0)) {
		if (key === 's') {
			fire(world.players[0].fire);
		}
	}
	if (canPlay(1)) {
		if (key === '5') {
			fire(world.players[1].fire);
		}
	}
}
