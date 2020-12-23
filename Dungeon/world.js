const room1 = [
	'XXXXXXXXXXX',
	'X        XX',
	'X         X',
	'XX   X    X',
	'XX   XX   X',
	'XX   XX    ',
	'XX    X   X',
	'XXXXX X   X',
	'X         X',
	'X         X',
	'XXXXXXXXXXX'
];

const room2 = [
	'XXXXXXXXXXX',
	'X         X',
	'X         X',
	'X         X',
	'X         X',
	'          X',
	'X         X',
	'X         X',
	'X  X X X  X',
	'X    X    X',
	'XXXXXXXXXXX'
];

class Bullet {
	constructor(x1,y1,x2,y2) {
		this.position = {x:x1, y:y1};
		const vector = createVector(x2-x1, y2-y1);
		vector.normalize();
		this.dx = vector.x*32;
		this.dy = vector.y*32;
	}

	draw() {
		line(this.position.x, this.position.y, this.position.x+this.dx, this.position.y+this.dy);
	}

	update() {
		this.position.x += this.dx;
		this.position.y += this.dy;
	}
}

class TiledObject extends Sprite {
	constructor(tileX, tileY, name, frameArray) {
		super(tileX*world.tileSize, tileY*world.tileSize);
		this.addAnimation('static', name, frameArray, FPS, true);
	}
}

class Player extends Sprite {
	constructor(x, y, spritename='player') {
		super(x, y);
		this.addAnimation('idle', spritename, [ 13 ], FPS, false);
		this.addAnimation('leftup',spritename, [ 0, 1, 2, 3 ], FPS, true);
		this.addAnimation('left', spritename, [ 4, 5, 6, 7 ], FPS, true);
		this.addAnimation('leftdown', spritename, [ 8, 9, 10, 11 ], FPS, true);
		this.addAnimation('down', spritename, [ 12, 13, 14, 15 ], FPS, true);
		this.addAnimation('rightdown', spritename, [ 16, 17, 18, 19 ], FPS, true);
		this.addAnimation('right', spritename, [ 20, 21, 22, 23 ], FPS, true);
		this.addAnimation('rightup', spritename, [ 24, 25, 26, 27 ], FPS, true);
		this.addAnimation('up', spritename, [ 28, 29, 30, 31 ], FPS, true);
		this.vx = 0;
		this.vy = 0;
		this.scale = 1;
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
		const speed = 2;
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

		if (world.hitExit(this.getFloorBox())) {
			console.log('exit: switch to adjacent room');
			if( this.position.x > 100 ) {
				world.initRoom(room2);
				this.position.x = 32-8;
			} else {
				world.initRoom(room1);
				this.position.x = 32*20-8;
			}
		}
		super.update(elapsedTime);
	}
}

class World {
	constructor(tileSize) {
		this.tileSize = tileSize;
		this.tiles = [];

		this.player = new Player(96-8, 96);
		this.enemy = new Player(500, 300, "enemy");

		this.objects = [];

		this.initRoom(room1);

		this.bullets = [];
	}

	addBullet(bullet) {
		this.bullets.push(bullet);
	}

	initRoom(originalRoom) {
		const room = [];
		for (let r = 0; r < originalRoom.length; r++) {
			const tiles = [];
			for (let c = 0; c < originalRoom[0].length; c++) {
				if (originalRoom[r][c] === 'X') {
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
		for (let r = 0; r < room.length; r++) {
			const tiles = [];
			for (let c = 0; c < room[0].length; c++) {
				if (room[r][c] === -1 && (r===0||r===room.length-1||c===0||c===room[0].length-1)) {
					tiles.push(-10); // Exit
				} else {
					tiles.push(getTileIndexFromPattern(getPattern(room, r, c)));
				}
			}
			this.tiles.push(tiles);
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
					const rdm = noise(r, c);
					const wallIndex = rdm > 0.5 ? Math.floor(2 * (rdm - 0.5) * 8) : 1;
					spritesheet.drawSprite('floor', wallIndex, c * this.tileSize, r * this.tileSize);
				} else {
					spritesheet.drawSprite('wall', tileIndex, c * this.tileSize, r * this.tileSize);
				}
			}
		}
		this.objects.forEach(object=>object.draw());
		this.player.draw();
		this.enemy.draw();
		strokeWeight(2);
		stroke(255);
		this.bullets.forEach(bullet=>bullet.draw());
		if (toggleDebug) {
			const box = this.player.getHitBox();
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

	hitExit(box) {
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

	update(elapsedTime) {
		this.player.update(elapsedTime);
		this.enemy.update(elapsedTime);
		this.bullets.forEach(bullet=>bullet.update(elapsedTime));
		this.objects.forEach(object=>object.update(elapsedTime));

		this.bullets = this.bullets.filter(bullet => bullet.position.x < windowWidth && bullet.position.x > 0 && bullet.position.y > 0 && bullet.position.y < windowHeight);
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
			if (r -1 + i < 0 || r -1 + i >= room.length || c -1 + j < 0 || c -1 + j >= room[0].length) {
				pattern[i] = pattern[i].replaceAt(j, 'X'); // out of bound
			} else if (room[r -1 + i][c -1 + j] === 1) {
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
	console.log("unknown pattern:", pattern);
	return -1;
}
