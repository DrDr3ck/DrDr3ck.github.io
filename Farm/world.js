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
		return this.getTilePosition(
			this.player.position.x,
			this.player.position.y + this.tileSize * this.scale / 2 + 2
		);
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
		// check if a new chunk needs to be added
		// max
		const lastChunk = this.chunks[this.chunks.length - 1];
		let chunkLimit = this.tileSize * this.scale * lastChunk.width * lastChunk.id;

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

		this.chunks.forEach((chunk) => chunk.update(elapsedTime));

		// update player
		this.player.update(elapsedTime);
	}
}

class Chunk {
	constructor(xChunk) {
		this.id = xChunk;
		this.width = 9;
		this.height = 6;
		this.tiles = [];
		this.plants = [];
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

	addPlant(name, column, row) {
		const plant = new Plant(name, column, row);
		this.tiles[column][row] = plant.indices[0]; // planting a seed
		this.plants.push(plant);
	}

	removePlantAt(column, row) {
		this.plants = this.plants.filter((plant) => plant.column !== column || plant.row !== row);
	}

	update(elapsedTime) {
		// update time for plants
		this.plants.forEach((plant) => plant.update(elapsedTime, this));
	}
}

class Item {
	constructor(type, category) {
		this.type = type;
		this.category = category;
	}
}

class Plant extends Item {
	constructor(type, column, row) {
		super(type, 'plant');
		this.column = column;
		this.row = row;
		if (type === 'navet') {
			this.indices = [ 9, 10, 11 ]; // 12
		} else if (type === 'carotte') {
			this.indices = [ 13, 14, 15 ]; // 16
		} else if (type === 'tomate') {
			this.indices = [ 17, 18, 19, 20, 21, 22, 23 ]; // 24
		}
		this.time = 2000; // in milliseconds
	}

	update(elapsedTime, chunk) {
		this.time = Math.max(0, this.time - elapsedTime);
		// if time to grow, change sprite in chunk
		if (this.time <= 0) {
			const plantIndex = chunk.tiles[this.column][this.row];
			const idx = this.indices.find((i) => i === plantIndex);
			if (idx >= 0) {
				chunk.tiles[this.column][this.row] = plantIndex + 1;
				this.time = 2000;
			}
		}
	}
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

		this.slotIndex = 0;
		this.slots = [ { item: null }, { item: null }, { item: null }, { item: null }, { item: null }, { item: null } ];
	}

	addItem(item, index) {
		// TODO: find free item ?
		const slotIndex = this.slots.findIndex((slot) => slot.item === null);
		if (slotIndex < 0) {
			return;
		}
		this.slots[slotIndex] = { item };
		slotButtons[slotIndex].setItem(spritesheet.getImage('seed_vegetable', index));
	}

	execute() {
		// execute an action on the current tile
		// ex: if entity has a 'hoe' in hand, he will 'plow' the current tile if possible
		const tilePosition = world.getPlayerTilePosition();
		const chunk = world.getChunk(tilePosition.column, tilePosition.row);
		const colChunk = world.getColumnPositionInChunk(chunk, tilePosition.column);
		const rowChunk = tilePosition.row + 1;

		if (chunk.tiles[colChunk][rowChunk] === 0) {
			chunk.tiles[colChunk][rowChunk] = 1;
			chunk.tiles[colChunk][rowChunk - 1] = 8;
		} else if (chunk.tiles[colChunk][rowChunk] === 1) {
			chunk.tiles[colChunk][rowChunk] = 2;
			chunk.tiles[colChunk][rowChunk - 1] = 8;
		} else if (chunk.tiles[colChunk][rowChunk] === 2 && chunk.tiles[colChunk][rowChunk - 1] < 9) {
			// check if player is carrying a seed
			const item = this.slots[this.slotIndex].item;
			console.log(JSON.stringify(item));
			if (item && item.category === 'seed') {
				// add a plant to chunk
				chunk.addPlant(item.type, colChunk, rowChunk - 1);
			}
		} else if (
			chunk.tiles[colChunk][rowChunk] === 2 &&
			([12,16,24].includes(chunk.tiles[colChunk][rowChunk - 1]))
		) {
			// harvest a plant
			chunk.tiles[colChunk][rowChunk] = 1;
			chunk.tiles[colChunk][rowChunk - 1] = 8;
			chunk.removePlantAt(colChunk, rowChunk - 1);
		}
	}

	updateItemInHand(index) {
		this.slotIndex = index;
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

	draw() {
		super.draw();
		// draw selected item on top of entity if any
		if (slotButtons[this.slotIndex].item !== null) {
			fill(200, 200, 200, 128);
			stroke(0);
			strokeWeight(1);
			ellipse(this.position.x + 32, this.position.y - 32, 40, 40);
			image(slotButtons[this.slotIndex].item, this.position.x + 16, this.position.y - 32 - 16);
		}
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

class BSlotButton extends BImageButton {
	constructor(x, y, img, callback) {
		super(x, y, img, callback);
		this.item = null;
	}

	setItem(img) {
		this.item = img;
	}

	isAvailable() {
		return !this.item;
	}

	doDraw() {
		super.doDraw();
		if (this.item) {
			image(this.item, this.x + 8, this.y + 8, 48, 48);
		}
	}
}
