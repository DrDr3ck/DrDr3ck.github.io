function drawKeyboardHelp(keyboard, x, y, text_size) {
	textAlign(CENTER, CENTER);
	textSize(text_size);
	fill(240);
	strokeWeight(1);
	stroke(50);
	rect(x, y - 1 - 16, 16, 18);
	noStroke();
	fill(50);
	const text_align = text_size / 2;
	text(keyboard, x + text_align, y + 1 - text_align);
}

class Bullet {
	constructor(x1, y1, x2, y2) {
		this.position = { x: x1, y: y1 };
		const vector = createVector(x2 - x1, y2 - y1);
		if( vector.x === 0 ) {
			vector.x = 1;
		}
		if( vector.y === 0 ) {
			vector.y = 1;
		}
		vector.normalize();
		const speed = 4;
		this.dx = vector.x * speed;
		this.dy = vector.y * speed;

		this.damage = 1;
	}

	draw() {
		// line(this.position.x, this.position.y, this.position.x + this.dx, this.position.y + this.dy);
		const size = 16;
		ellipse(this.position.x + this.dx / 2, this.position.y + this.dy / 2, size);
	}

	update() {
		this.position.x += this.dx;
		this.position.y += this.dy;
	}
}

class TiledObject extends Sprite {
	constructor(tileX, tileY, name, frameArray) {
		super(tileX * world.tileSize, tileY * world.tileSize);
		this.addAnimation('static', name, frameArray, FPS, true);
		this.name = name;
	}

	getBox() {
		return {
			x: this.position.x,
			y: this.position.y,
			w: this.width,
			h: this.height
		};
	}
}

class Entity extends Sprite {
	constructor(x, y) {
		super(x, y);
		this.vx = 0;
		this.vy = 0;
		this.scale = 1;

		this.life = 5;
	}

	getFloorBox() {
		return {
			x: this.position.x + 8,
			y: this.position.y + this.height * 0.66,
			w: this.width - 16,
			h: this.height * 0.34
		};
	}

	getHitBox() {
		return {
			x: this.position.x + 8,
			y: this.position.y + this.height * 0.1,
			w: this.width - 16,
			h: this.height * 0.8
		};
	}

	startMove(direction) {
		if (direction.includes('down')) {
			this.vy = 1;
		}
		if (direction.includes('up')) {
			this.vy = -1;
		}
		if (direction.includes('left')) {
			this.vx = -1;
		}
		if (direction.includes('right')) {
			this.vx = 1;
		}
		if (this.state !== direction) {
			this.playAnimation(direction);
		}
	}

	stopMove() {
		this.vx = 0;
		this.vy = 0;
	}

	update(elapsedTime) {
		const speed = 3;
		// check if player hit a wall
		const box = this.getFloorBox();
		box.x += this.vx * speed;
		if (!world.hitWall(box)) {
			this.position.x += this.vx * speed;
		}
		box.x -= this.vx * speed;
		box.y += this.vy * speed;
		if (!world.hitWall(box)) {
			this.position.y += this.vy * speed;
		}
		super.update(elapsedTime);
	}
}

class Enemy extends Entity {
	constructor(x, y, spritename = 'enemy') {
		super(x, y);
		const rdm = Math.floor(random(0,7.99));
		const delta = 4 * rdm;
		this.addAnimation('idle', spritename, [ 0 + delta ], FPS, false);
		this.addAnimation('leftup', spritename, [ 2 + delta ], FPS, true);
		this.addAnimation('left', spritename, [ 2 + delta ], FPS, true);
		this.addAnimation('leftdown', spritename, [ 2 + delta ], FPS, true);
		this.addAnimation('down', spritename, [ 0 + delta ], FPS, true);
		this.addAnimation('rightdown', spritename, [ 3 + delta ], FPS, true);
		this.addAnimation('right', spritename, [ 3 + delta ], FPS, true);
		this.addAnimation('rightup', spritename, [ 3 + delta ], FPS, true);
		this.addAnimation('up', spritename, [ 1 + delta ], FPS, true);
	}
}

class Player extends Entity {
	constructor(x, y, spritename = 'player') {
		super(x, y);
		this.addAnimation('idle', spritename, [ 0, 1, 2, 3 ], FPS, false);
		this.addAnimation('leftup', spritename, [ 4 ], FPS, true);
		this.addAnimation('left', spritename, [ 4 ], FPS, true);
		this.addAnimation('leftdown', spritename, [ 4 ], FPS, true);
		this.addAnimation('down', spritename, [ 0, 1, 2, 3 ], FPS, true);
		this.addAnimation('rightdown', spritename, [ 5 ], FPS, true);
		this.addAnimation('right', spritename, [ 5 ], FPS, true);
		this.addAnimation('rightup', spritename, [ 5 ], FPS, true);
		this.addAnimation('up', spritename, [ 6 ], FPS, true);

		this.slots = []; // TODO: add item/weapon
		this.slotIndex = 0;
		this.maxSlots = 6;

		this.life = 20;
	}

	currentGun() {
		return slotButtons[this.slotIndex].item; // todo: for now, use directly the button
	}

	nextSlot() {
		this.slotIndex = (this.slotIndex + 1) % this.maxSlots;
	}

	prevSlot() {
		this.slotIndex = (this.slotIndex + this.maxSlots - 1) % this.maxSlots;
	}
}

class World {
	constructor(tileSize) {
		this.tileSize = tileSize;
		this.tiles = [];
		this.doors = [];

		this.azerty = true;

		this.player = new Player(96 - 8, 96);
		this.enemies = [];
		this.objects = [];
		this.enemyBullets = [];
		this.bullets = [];
		this.bulletsMax = 5;

		this.uiKeys = [ '&', 'é', '"', "'", '(', '-' ];

		this.level = 0;
		// TODO: home made first level for tuto
		this.rooms = MazeGenerator.createLevel(9);
		this.curRoomIndex = 0;
		this.initRoom(this.rooms[this.curRoomIndex]);
	}

	getFreeTile() {
		const maxRows = this.tiles.length;
		const maxCols = this.tiles[0].length;
		let row = 0;
		let column = 0;
		while (this.tiles[row][column] !== -1) {
			row = Math.floor(random(0, maxRows));
			column = Math.floor(random(0, maxCols));
		}
		return { X: column, Y: row };
	}

	getTilePosition(worldX, worldY) {
		const tile = { X: -1, Y: -1 };
		tile.X = Math.floor(worldX / this.tileSize);
		tile.Y = Math.floor(worldY / this.tileSize);
		if (tile.X >= this.tiles[0].length) {
			tile.X = -1;
		}
		if (tile.Y >= this.tiles.length) {
			tile.Y = -1;
		}
		return tile;
	}

	addBullet(bullet) {
		if (this.bullets.length < this.bulletsMax) {
			this.bullets.push(bullet);
			soundManager.playSound('laser');
		}
	}

	getBoxFromTinyTile(tinyTilePosition) {
		return {
			x: tinyTilePosition.j * 64,
			y: tinyTilePosition.i * 64,
			w: 64,
			h: 64
		};
	}

	initRoom(tinyRoom) {
		if (toggleDebug) {
			uiManager.addLogger(`Moving to room ${tinyRoom.id}`);
		}
		const asciiRoom = tinyRoom.ascii;
		this.curRoomIndex = tinyRoom.id;
		const room = [];
		for (let r = 0; r < asciiRoom.length; r++) {
			const tiles = [];
			for (let c = 0; c < asciiRoom[0].length; c++) {
				if (asciiRoom[r][c] === 'X') {
					tiles.push(1);
					tiles.push(1);
				} else {
					tiles.push(-1);
					tiles.push(-1);
				}
			}
			room.push(tiles);
			room.push(tiles);
		}
		this.tiles = [];
		this.doors = tinyRoom.doors;
		const hasLDoor = this.doors.some((door) => door.from.i === 5 && door.from.j === 8);
		for (let r = 0; r < room.length; r++) {
			const tiles = [];
			for (let c = 0; c < room[0].length; c++) {
				if (room[r][c] === -1 && (r === 0 || r === room.length - 1 || c === 0 || c === room[0].length - 1)) {
					tiles.push(-10); // Exit
				} else if (hasLDoor && r === 11 && c >= 16 && c <= 17) {
					tiles.push(-10); // Exit
				} else if (hasLDoor && r === 12 && c >= 15 && c <= 18) {
					tiles.push(12); // Below Exit
				} else {
					tiles.push(getTileIndexFromPattern(getPattern(room, r, c)));
				}
			}
			this.tiles.push(tiles);
		}

		translateX = 128;
		translateY = 32;
		if (this.tiles.length === 10) {
			translateY += 3 * 64;
		}
		if (this.tiles[0].length === 10) {
			translateX += 3 * 64;
		}

		this.bullets = [];
		this.enemyBullets = [];
		this.enemies = [];
		this.objects = [];
		this.exitBox = null;
		if (this.curRoomIndex !== 1) {
			let freeTilePosition = this.getFreeTile();
			this.enemies.push(
				new Enemy(freeTilePosition.X * this.tileSize - 16, freeTilePosition.Y * this.tileSize - 40, 'enemy')
			);
			freeTilePosition = this.getFreeTile();
			this.objects.push(new TiledObject(freeTilePosition.X, freeTilePosition.Y, 'potion', [ 0, 1, 2, 3 ]));
		}
		if (this.curRoomIndex === 9) {
			// Exit
			const freeTilePosition = this.getFreeTile();
			this.exitBox = {
				x: freeTilePosition.X * this.tileSize,
				y: freeTilePosition.Y * this.tileSize,
				w: this.tileSize,
				h: this.tileSize
			};
		}
	}

	draw() {
		stroke(0);
		fill(50, 150, 50);
		for (let r = 0; r < this.tiles.length; r++) {
			for (let c = 0; c < this.tiles[0].length; c++) {
				const tileIndex = this.tiles[r][c];
				if (tileIndex <= -1) {
					//rect(c * this.tileSize, r * this.tileSize, this.tileSize, this.tileSize);
					const rdm = noise(r, c, this.curRoomIndex);
					const wallIndex = rdm > 0.5 ? Math.floor(2 * (rdm - 0.5) * 8) : 1;
					spritesheet.drawSprite('floor', wallIndex, c * this.tileSize, r * this.tileSize);
				} else {
					spritesheet.drawSprite('wall', tileIndex, c * this.tileSize, r * this.tileSize);
				}
			}
		}
		this.objects.forEach((object) => object.draw());

		if (this.exitBox) {
			noStroke();
			fill(50);
			rect(this.exitBox.x, this.exitBox.y, this.exitBox.w, this.exitBox.h);
		}

		this.player.draw();

		this.enemies.forEach((enemy) => enemy.draw());
		strokeWeight(1);
		stroke(0);
		fill(255);
		this.bullets.forEach((bullet) => bullet.draw());
		this.enemyBullets.forEach((bullet) => bullet.draw());
		if (toggleDebug) {
			let box = this.player.getHitBox();
			noFill();
			rect(box.x, box.y, box.w, box.h);
			box = this.player.getFloorBox();
			noFill();
			rect(box.x, box.y, box.w, box.h);
		}
	}

	collide(rect1, rect2) {
		if (!rect1 || !rect2) {
			return false;
		}
		if (
			rect1.x < rect2.x + rect2.w &&
			rect1.x + rect1.w > rect2.x &&
			rect1.y < rect2.y + rect2.h &&
			rect1.h + rect1.y > rect2.y
		) {
			return true;
		}
		return false;
	}

	contains(box, position) {
		if (!box || !position) {
			return false;
		}
		if (position.x >= box.x && position.x <= box.x + box.w && position.y >= box.y && position.y <= box.y + box.h) {
			return true;
		}
		return false;
	}

	hitWall(box) {
		for (let r = 0; r < this.tiles.length; r++) {
			for (let c = 0; c < this.tiles[0].length; c++) {
				const tileIndex = this.tiles[r][c];
				if (tileIndex >= 0) {
					if (
						this.collide(box, {
							x: c * this.tileSize,
							y: r * this.tileSize,
							w: this.tileSize,
							h: this.tileSize
						})
					) {
						return true;
					}
				}
			}
		}
		return false;
	}

	hitDoor(box) {
		for (let r = 0; r < this.tiles.length; r++) {
			for (let c = 0; c < this.tiles[0].length; c++) {
				const tileIndex = this.tiles[r][c];
				if (tileIndex === -10) {
					if (
						this.collide(box, {
							x: c * this.tileSize,
							y: r * this.tileSize,
							w: this.tileSize,
							h: this.tileSize
						})
					) {
						return true;
					}
				}
			}
		}
		return false;
	}

	updateHeart(life) {
		for (let i = 0; i < 5; i++) {
			const limit = i * 4 + 4;
			if (limit <= life) {
				hearts[i].playAnimation('fullHearth');
			} else if (limit - life >= 4) {
				hearts[i].playAnimation('noHearth');
			} else {
				const idx = limit - life;
				if (idx === 1) {
					hearts[i].playAnimation('fullHalfHearth');
				} else if (idx === 3) {
					hearts[i].playAnimation('noHalfHearth');
				} else {
					hearts[i].playAnimation('halfHearth');
				}
			}
		}
	}

	update(elapsedTime) {
		const right = 68;
		const left = this.azerty ? 81 : 65 ;
		const up = this.azerty ? 90 : 87 ;
		const down = 83;
		const verticalDirection = keyIsDown(right) ? 'right' : keyIsDown(left) ? 'left' : '';
		const horizontalDirection = keyIsDown(up) ? 'up' : keyIsDown(down) ? 'down' : '';

		const move = `${verticalDirection}${horizontalDirection}` || 'idle';
		this.player.stopMove();
		if (move === 'idle') {
			soundManager.stopSound('walk');
		} else if (this.player.state === 'idle') {
			soundManager.playSound('walk', random(0.85, 1.15), true);
		}
		this.player.startMove(move);

		this.player.update(elapsedTime);

		if (this.hitDoor(this.player.getFloorBox())) {
			// need to get the door position
			this.doors.every((door) => {
				const box = this.getBoxFromTinyTile(door.from);
				if (this.collide(box, this.player.getFloorBox())) {
					this.initRoom(this.rooms[door.id - 1]);
					if (door.from.j < door.to.j) {
						this.player.position.x = door.to.j * 64 - 8;
					} else {
						this.player.position.x = door.to.j * 64 - 8 + 32;
					}

					if (door.from.i < door.to.i) {
						this.player.position.y = door.to.i * 64 - 32;
					} else {
						this.player.position.y = door.to.i * 64 - 8;
					}
					return false;
				}
				return true;
			});
		}

		this.enemies.forEach((enemy) => {
			enemy.update(elapsedTime);
			const box = enemy.getHitBox();
			this.bullets.forEach((bullet) => {
				if (this.contains(box, bullet.position)) {
					bullet.position.x = 10000; // move bullet out of world
					enemy.life = Math.max(0, enemy.life - bullet.damage);
					soundManager.playSound(enemy.life > 0 ? 'hit' : 'kill', random(0.8,1.2));
				}
			});
		});
		const playerBox = this.player.getHitBox();
		let needUpdate = false;
		this.enemyBullets.forEach((bullet) => {
			if (this.contains(playerBox, bullet.position)) {
				bullet.position.x = 10000; // move bullet out of world
				this.player.life = Math.max(0, this.player.life - bullet.damage);
				needUpdate = true;
				soundManager.playSound('hit');
			}
		});

		this.bullets.forEach((bullet) => bullet.update(elapsedTime));
		this.enemyBullets.forEach((bullet) => bullet.update(elapsedTime));
		this.objects.forEach((object) => {
			object.update(elapsedTime);
			// check if player hits the object
			if (this.collide(this.player.getFloorBox(), object.getBox())) {
				if (object.name === 'potion') {
					object.position.x = 10000;
					needUpdate = true;
					this.player.life = Math.min(20, this.player.life + 2); // TODO: need to factorize code inside 'tiledobject'
					soundManager.playSound('potion');
				}
			}
		});
		if (needUpdate) {
			this.updateHeart(this.player.life);
		}

		this.enemies = this.enemies.filter((enemy) => enemy.life > 0);

		this.bullets = this.bullets.filter((bullet) => {
			const tilePosition = world.getTilePosition(bullet.position.x, bullet.position.y);
			if (tilePosition.X >= 0 && tilePosition.Y >= 0) {
				if (world.tiles[tilePosition.Y][tilePosition.X] <= -1) {
					return true;
				}
			}
			return false;
		});
		this.enemyBullets = this.enemyBullets.filter((bullet) => {
			const tilePosition = world.getTilePosition(bullet.position.x, bullet.position.y);
			if (tilePosition.X >= 0 && tilePosition.Y >= 0) {
				if (world.tiles[tilePosition.Y][tilePosition.X] <= -1) {
					return true;
				}
			}
			return false;
		});

		// Exit
		if (this.exitBox) {
			if (this.collide(this.exitBox, this.player.getFloorBox())) {
				this.rooms = MazeGenerator.createLevel(9);
				this.level++;
				uiManager.addLogger(`Entering level ${this.level}`);
				this.curRoomIndex = 0;
				this.initRoom(this.rooms[this.curRoomIndex]);
				this.player.position.x = 96 - 8;
				this.player.position.y = 96;
			}
		}
	}
}

/**********************************************************************************/

// LINE/RECTANGLE
function lineRect(x1, y1, x2, y2, rx, ry, rw, rh) {
	// check if the line has hit any of the rectangle's sides
	// uses the Line/Line function below
	const left = lineLine(x1, y1, x2, y2, rx, ry, rx, ry + rh);
	const right = lineLine(x1, y1, x2, y2, rx + rw, ry, rx + rw, ry + rh);
	const top = lineLine(x1, y1, x2, y2, rx, ry, rx + rw, ry);
	const bottom = lineLine(x1, y1, x2, y2, rx, ry + rh, rx + rw, ry + rh);

	// if ANY of the above are true, the line
	// has hit the rectangle
	if (left || right || top || bottom) {
		return true;
	}
	return false;
}

// LINE/LINE
function lineLine(x1, y1, x2, y2, x3, y3, x4, y4) {
	// calculate the direction of the lines
	const uA = ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) / ((y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1));
	const uB = ((x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)) / ((y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1));

	// if uA and uB are between 0-1, lines are colliding
	if (uA >= 0 && uA <= 1 && uB >= 0 && uB <= 1) {
		// optionally, draw a circle where the lines meet
		const intersectionX = x1 + uA * (x2 - x1);
		const intersectionY = y1 + uA * (y2 - y1);
		fill(255, 0, 0);
		noStroke();
		ellipse(intersectionX, intersectionY, 20, 20);

		return true;
	}
	return false;
}

function same(pattern1, pattern2) {
	if (pattern1.length !== pattern2.length) {
		return false;
	}
	for (let i = 0; i < pattern1.length; i++) {
		if (pattern1[i] !== pattern2[i]) {
			return false;
		}
	}
	return true;
}

String.prototype.replaceAt = function(index, replacement) {
	if (index >= this.length) {
		return this.valueOf();
	}

	return this.substring(0, index) + replacement + this.substring(index + 1);
};

function getPattern(room, r, c) {
	const pattern = [ '   ', '   ', '   ' ];
	for (let i = 0; i <= 2; i++) {
		// Y
		for (let j = 0; j <= 2; j++) {
			// X
			if (r - 1 + i < 0 || r - 1 + i >= room.length || c - 1 + j < 0 || c - 1 + j >= room[0].length) {
				pattern[i] = pattern[i].replaceAt(j, 'X'); // out of bound
			} else if (room[r - 1 + i][c - 1 + j] === 1) {
				pattern[i] = pattern[i].replaceAt(j, 'X'); // got a wall !!
			}
		}
	}
	return pattern;
}

function getTileIndexFromPattern(pattern) {
	// pattern is an array 3x3 with X for wall and ' ' for nothing
	if (pattern[1][1] !== 'X') {
		return -1;
	}
	if (same(pattern, [ 'XXX', 'XXX', 'XX ' ])) {
		return 0;
	} else if (same(pattern, [ 'XXX', 'XXX', 'X  ' ])) {
		return 1;
	} else if (same(pattern, [ 'XXX', 'XXX', '   ' ])) {
		return 19;
	} else if (same(pattern, [ 'XXX', 'XXX', '  X' ])) {
		return 2;
	} else if (same(pattern, [ 'XXX', 'XXX', ' XX' ])) {
		return 3;
	} else if (same(pattern, [ 'XXX', 'XXX', 'XXX' ])) {
		return 12;
	} else if (same(pattern, [ 'XX ', 'XXX', 'XXX' ])) {
		return 7;
	} else if (same(pattern, [ 'X  ', 'XXX', 'XXX' ])) {
		return 8;
	} else if (same(pattern, [ '   ', 'XXX', 'XXX' ])) {
		return 5;
	} else if (same(pattern, [ '  X', 'XXX', 'XXX' ])) {
		return 9;
	} else if (same(pattern, [ ' XX', 'XXX', 'XXX' ])) {
		return 10;
	} else if (same(pattern, [ '   ', ' XX', ' XX' ])) {
		return 4;
	} else if (same(pattern, [ '   ', 'XX ', 'XX ' ])) {
		return 6;
	} else if (same(pattern, [ 'XX ', 'XX ', '   ' ])) {
		return 20;
	} else if (same(pattern, [ ' XX', ' XX', '   ' ])) {
		return 18;
	} else if (same(pattern, [ 'XX ', 'XX ', 'XX ' ])) {
		return 13;
	} else if (same(pattern, [ 'XXX', 'XX ', 'XX ' ])) {
		return 13;
	} else if (same(pattern, [ 'XX ', 'XX ', 'XXX' ])) {
		return 13;
	} else if (same(pattern, [ ' XX', ' XX', ' XX' ])) {
		return 11;
	} else if (same(pattern, [ 'XXX', ' XX', ' XX' ])) {
		return 11;
	} else if (same(pattern, [ ' XX', ' XX', 'XXX' ])) {
		return 11;
	}
	console.log('unknown pattern:', pattern);
	return -1;
}
