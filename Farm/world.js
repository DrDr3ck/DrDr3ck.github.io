class World {
	constructor() {
		this.chunks = [ new Chunk(0) ];
		this.scale = 2;
		this.tileSize = 32;
		this.archive = {};

		this.player = new Entity(0, 0);
		this.player.scale = this.scale;
	}

	draw() {
		this.player.draw();

		this.chunks.forEach((chunk) => {
			// TODO: check if this chunk needs to be displayed according to position of the chunk in the camera
			const iChunk = chunk.id * chunk.width * this.scale * this.tileSize;
			for (let i = 0; i < chunk.width; i++) {
				for (let j = 0; j < chunk.height; j++) {
					if (chunk.tiles[i][j] !== -1) {
						spritesheet.drawScaledSprite(
							'farm_tile',
							chunk.tiles[i][j],
							i * this.tileSize * this.scale + iChunk,
							j * this.tileSize * this.scale,
							this.scale
						);
					}
					if (toggleDebug) {
						noFill();
						if (i === 0) {
							stroke(255);
						} else {
							stroke(128);
						}
						rect(
							i * this.tileSize * this.scale + iChunk,
							j * this.tileSize * this.scale,
							this.tileSize * this.scale,
							this.tileSize * this.scale
						);
					}
				}
			}
		});

		

		if (toggleDebug) {
			ellipse(this.player.position.x, this.player.position.y, 2);
			text(`${this.player.position.x}-${width / 2 - this.tileSize * world.scale / 2}`, 0, -150);
			text(JSON.stringify(this.player.debugTilePosition), 0, -100);
		}
	}

	getPlayerTilePosition() {
		return this.getTilePosition(this.player.position.x, this.player.position.y + this.tileSize * this.scale / 2 + 2);
	}

	getTilePosition(worldX, worldY) {
		const tileSize = this.tileSize * this.scale;
		return { column: Math.floor(worldX / tileSize), row: Math.floor(worldY / tileSize) };
	}

	getChunk(column, row) {
		const chunkId = Math.floor(column / this.chunks[0].width);
		const chunk = this.chunks.filter((chunk) => chunk.id === chunkId)[0];
		return chunk;
	}

	getColumnPositionInChunk(chunk, column) {
		if (column < 0) {
			column += Math.ceil(-column / chunk.width) * chunk.width;
		}
		return column % chunk.width;
	}

	isSolid(column, row) {
		// get chunk id according to column
		const chunk = this.getChunk(column, row);
		const colChunk = this.getColumnPositionInChunk(chunk, column);
		const value = chunk.tiles[colChunk][row];
		return value >= 0 && value <= 3;
	}

	update(elapsedTime) {
		// max
		const lastChunk = this.chunks[this.chunks.length - 1];
		let chunkLimit = this.tileSize * this.scale * lastChunk.width * lastChunk.id;
		// check if a new chunk needs to be added
		let curChunkLimit = world.player.position.x + width / 2;
		if (chunkLimit < curChunkLimit) {
			this.chunks.push(new Chunk(lastChunk.id + 1));
		}

		// min
		const firstChunk = this.chunks[0];
		chunkLimit = this.tileSize * this.scale * lastChunk.width * firstChunk.id;
		curChunkLimit = world.player.position.x - width / 2;
		if (chunkLimit > curChunkLimit) {
			this.chunks.unshift(new Chunk(firstChunk.id - 1));
		}

		this.player.update(elapsedTime);
	}
}

class Chunk {
	constructor(xChunk) {
		this.id = xChunk;
		this.width = 9;
		this.height = 6;
		this.tiles = [];
		for (let i = 0; i < this.width; i++) {
			const zRandom = noise((xChunk * this.width + i) * 0.1);
			const jTop = Math.round(zRandom * 4);
			const column = [];
			for (let j = 0; j < this.height; j++) {
				if (j === jTop) {
					column.push(Math.round(noise(i, j) * 4) + 4);
				} else if (j === jTop + 1) {
					column.push(0);
				} else if (j >= jTop + 2) {
					column.push(3);
				} else {
					column.push(-1);
				}
			}
			this.tiles.push(column);
		}
	}

	draw() {}

	update(elapsedTime) {}
}

const gravity = 0.1;

class Entity extends Sprite {
	constructor(x, y) {
		super(x, y);
		this.vx = 0;
		this.vy = 0;
		this.canJump = false;

		this.addAnimation('idle', 'farm_robot', [ 0, 1, 2, 3, 4, 5 ], FPS, false);
		this.addAnimation('down', 'farm_robot', [ 0 ], FPS, false);
		this.addAnimation('left', 'farm_robot', [ 6 ], FPS, false);
		this.addAnimation('right', 'farm_robot', [ 7, 8, 9, 10 ], FPS, false);
		this.addAnimation('up', 'farm_robot', [ 11 ], FPS, false);

		this.debugTilePosition = null;
	}

	execute() {
		// execute an action on the current tile
		// ex: if entity has a 'hoe' in hand, he will 'plow' the current tile if possible
		const tilePosition = world.getPlayerTilePosition();
		const chunk = world.getChunk(tilePosition.column, tilePosition.row);
		const colChunk = world.getColumnPositionInChunk(chunk, tilePosition.column);
		const rowChunk = tilePosition.row + 1;

		if (chunk.tiles[colChunk][rowChunk - 1] === 8) { // for debug only
			chunk.tiles[colChunk][rowChunk - 1] = 9; // for debug only
		} else if (chunk.tiles[colChunk][rowChunk - 1] === 9) { // for debug only
			chunk.tiles[colChunk][rowChunk - 1] = 10; // for debug only
		} else if (chunk.tiles[colChunk][rowChunk - 1] === 10) { // for debug only
			chunk.tiles[colChunk][rowChunk - 1] = 11; // for debug only
		} else if (chunk.tiles[colChunk][rowChunk] === 0) {
			chunk.tiles[colChunk][rowChunk] = 1;
			chunk.tiles[colChunk][rowChunk - 1] = -1;
		} else if (chunk.tiles[colChunk][rowChunk] === 1) {
			chunk.tiles[colChunk][rowChunk] = 2;
			chunk.tiles[colChunk][rowChunk - 1] = -1;
		} else if (chunk.tiles[colChunk][rowChunk] === 2) {
			chunk.tiles[colChunk][rowChunk - 1] = 8;
		}
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

		// check where is the entity
		const tilePosition = world.getPlayerTilePosition();
		this.debugTilePosition = tilePosition;
		if (world.isSolid(tilePosition.column, tilePosition.row + 1)) {
			// 1. if entity is on a tile, set vy to 0
			if (this.vy > 0) {
				this.vy = 0;
				this.canJump = true;
			}
		} else {
			// 2. if entity is in the air, add gravity to vy
			this.vy = Math.min(15, this.vy + gravity);
		}

		this.position.x += this.vx * speed;
		this.position.y += this.vy * speed;
		/*
		// check if entity hit a wall
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
		*/
		super.update(elapsedTime);
	}
}
