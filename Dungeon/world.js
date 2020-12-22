const room1 = [
	'XXXXXXXX XX',
	'XX        X',
	'X         X',
	'XX   X    X',
	'X    XX   X',
	'X    XX   X',
	'X     X   X',
	'X     X   X',
	'          X',
	'X         X',
	'XXXXXXXXXXX'
];

class Player extends Sprite{
	constructor(x,y) {
		super(x,y);
		this.addAnimation('idle', 'player', [13], FPS, false);
		this.addAnimation('leftup', 'player', [0,1,2,3], FPS, true);
		this.addAnimation('left', 'player', [4,5,6,7], FPS, true);
		this.addAnimation('leftdown', 'player', [8,9,10,11], FPS, true);
		this.addAnimation('down', 'player', [12,13,14,15], FPS, true);
		this.addAnimation('rightdown', 'player', [16,17,18,19], FPS, true);
		this.addAnimation('right', 'player', [20,21,22,23], FPS, true);
		this.addAnimation('rightup', 'player', [24,25,26,27], FPS, true);
		this.addAnimation('up', 'player', [28,29,30,31], FPS, true);
		this.vx = 0;
		this.vy = 0;
	}

	startMove(direction) {
		if( direction.includes("down") ) {
			this.vy=1;
		}
		if( direction.includes("up") ) {
			this.vy=-1;
		}
		if( direction.includes("left") ) {
			this.vx=-1;
		}
		if( direction.includes("right") ) {
			this.vx=1;
		}
		if( this.state !== direction ) {
			console.log(direction);
			this.playAnimation(direction);
		}
	}

	stopMove() {
		this.vx = 0;
		this.vy = 0;
	}

	update(elapsedTime) {
		const speed = 2;
		this.position.x += this.vx * speed;
		this.position.y += this.vy * speed;
		super.update(elapsedTime);
	}
}

class World {
	constructor(tileSize) {
		this.tileSize = tileSize;
		this.tiles = [];

		this.player = new Player(96,96);

		this.initRoom(room1);
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
				tiles.push(getTileIndexFromPattern(getPattern(room, r, c)));
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
				if (tileIndex === -1) {
					rect(c * this.tileSize, r * this.tileSize, this.tileSize, this.tileSize);
				} else {
					spritesheet.drawSprite('wall', tileIndex, c * this.tileSize, r * this.tileSize);
				}
			}
		}
		this.player.draw();
	}

	update(elapsedTime) {
		this.player.update(elapsedTime);
	}
}

/**********************************************************************************/

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
	for (let i = 0; i < 3; i++) { // Y
		for (let j = 0; j < 3; j++) { // X
			if (r + i < 0 || r + i >= room.length || c + j < 0 || c + j >= room[0].length) {
				pattern[i] = pattern[i].replaceAt(j, 'X'); // out of bound
			} else if (room[r + i][c + j] === 1) {
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
	return -1;
}
