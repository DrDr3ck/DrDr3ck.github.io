class World {
	constructor() {
		this.chunks = [ new Chunk(0) ];
		this.scale = 2;
		this.tileSize = 32;
		this.archive = {};

		this.player = new Entity(0, 0);
		this.player.scale = this.scale;

		this.items = []; // TODO: per chunk ?
	}

	draw() {
		this.player.draw();

		if (toggleDebug) {
			rect(this.player.position.x, this.player.position.y, 32 * this.scale, 48 * this.scale);
			this.collidedTiles.forEach((collideTile) => {
				if (collideTile.solid) {
					if (collideTile.collide) {
						fill(255, 0, 0);
					} else {
						fill(255);
					}
				} else {
					fill(255, 128);
				}
				rect(collideTile.x, collideTile.y, collideTile.w, collideTile.h);
			});
		}

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

		this.items.forEach((item) => item.draw());

		if (toggleDebug) {
			ellipse(this.player.position.x, this.player.position.y, 2);
			text(`${this.player.position.x}-${width / 2 - this.tileSize * world.scale / 2}`, 0, -150);
			text(JSON.stringify(this.player.debugTilePosition), 0, -100);
		}
	}

	getPlayerTilePosition() {
		return this.getTilePosition(
			this.player.position.x + this.tileSize * this.scale / 2,
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

	collide(rect1, rect2) {
		if (!rect1 || !rect2) {
			return false;
		}
		if (rect1.x >= rect2.x + rect2.w) {
			return false;
		}
		if (rect2.x >= rect1.x + rect1.w) {
			return false;
		}
		if (rect1.y >= rect2.y + rect2.h) {
			return false;
		}
		if (rect2.y >= rect1.y + rect1.h) {
			return false;
		}
		return true;
	}

	hitWall(box) {
		this.collidedTiles = [];
		const tilePosition = this.getTilePosition(box.x + box.w / 2, box.y + box.h / 2);
		for (let r = tilePosition.row - 1; r <= tilePosition.row + 2; r++) {
			for (let c = tilePosition.column - 1; c <= tilePosition.column + 2; c++) {
				if (this.isSolid(c, r)) {
					if (
						this.collide(box, {
							x: c * this.tileSize * this.scale,
							y: r * this.tileSize * this.scale,
							w: this.tileSize * this.scale,
							h: this.tileSize * this.scale
						})
					) {
						this.collidedTiles.push({
							x: c * this.tileSize * this.scale,
							y: r * this.tileSize * this.scale,
							w: this.tileSize * this.scale,
							h: this.tileSize * this.scale,
							solid: true,
							collide: true
						});
						return true;
					} else {
						this.collidedTiles.push({
							x: c * this.tileSize * this.scale,
							y: r * this.tileSize * this.scale,
							w: this.tileSize * this.scale,
							h: this.tileSize * this.scale,
							solid: true,
							collide: false
						});
					}
				} else {
					this.collidedTiles.push({
						x: c * this.tileSize * this.scale,
						y: r * this.tileSize * this.scale,
						w: this.tileSize * this.scale,
						h: this.tileSize * this.scale,
						solid: false,
						collide: false
					});
				}
			}
		}
		return false;
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

		this.items.forEach((item) => item.update(elapsedTime));

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

	getPlantType(column, row) {
		const plant = this.plants.filter((plant) => plant.column === column && plant.row === row);
		if (plant.length === 0) {
			return null;
		}
		return plant[0].type;
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

class DroppedItem extends Item {
	constructor(type, category, position, vector) {
		super(type, category);
		this.img = spritesheet.getImage('seed_vegetable', getSpriteIndex(type, category));
		
		this.vx = vector.x;
		this.vy = vector.y;
		this.x = position.x;
		this.y = position.y;
	}

	draw() {
		image(this.img, this.x, this.y);
		if (toggleDebug) {
			rect(this.x, this.y, world.tileSize, world.tileSize);
		}
	}

	getBox() {
		return {
			x: this.x,
			y: this.y,
			w: world.tileSize,
			h: world.tileSize
		};
	}

	update(elapsedTime) {
		this.vy = Math.min(15, this.vy + gravity);
		// check if item hit the ground
		const box = this.getBox();
		box.x += this.vx;
		if (!world.hitWall(box)) {
			this.x += this.vx;
		} else {
			this.vx = -this.vx / 3;
		}
		box.x -= this.vx;
		box.y += this.vy;
		if (!world.hitWall(box)) {
			this.y += this.vy;
		} else {
			this.vy = -this.vy / 3;
			if (Math.abs(this.vy) <= 0.1) {
				this.vy = 0;
				this.vx = 0;
			}
		}
	}
}

const getSpriteIndex = (type, category) => {
	if (type === 'navet') {
		if (category == 'seed') {
			return 0;
		} else {
			return 1;
		}
	} else if (type === 'carotte') {
		if (category == 'seed') {
			return 2;
		} else {
			return 3;
		}
	} else if (type === 'tomate') {
		if (category == 'seed') {
			return 4;
		} else {
			return 5;
		}
	}
	throw `cannot getSpriteIndex for ${type},${category}`;
};

const getSpriteIndices = (type) => {
	if (type === 'navet') {
		return [ 9, 10, 11 ]; // 12
	} else if (type === 'carotte') {
		return [ 13, 14, 15 ]; // 16
	} else if (type === 'tomate') {
		return [ 17, 18, 19, 20, 21, 22, 23 ]; // 24
	}
	throw `cannot getSpriteIndices for ${type}`;
};

class Plant extends Item {
	constructor(type, column, row) {
		super(type, 'plant');
		this.column = column;
		this.row = row;
		this.indices = getSpriteIndices(type);
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

	dropSlotItem() {
		const item = this.slots[this.slotIndex].item;
		if (!item) {
			// nothing to do: no item on this slot
			return;
		}

		world.items.push(new DroppedItem(item.type, item.category, this.position, { x: random(3) - 1, y: -random(2) }));
	}

	/**
	 * Picks all items that are on the floor (next to the player)
	 */
	pickUpItems() {
		function dist(x1, y1, x2, y2) {
			return sqrt(pow(x2 - x1, 2) + pow(y2 - y1, 2));
		}
		const playerGroundPosition = {
			x: world.player.position.x + world.player.width * world.scale / 2,
			y: world.player.position.y + world.player.height * world.scale * 0.8
		};
		const maxDistance = world.tileSize * world.scale;
		const pickedItems = world.items.filter(
			(item) => dist(item.x, item.y, playerGroundPosition.x, playerGroundPosition.y) < maxDistance
		);
		// TODO: put pickedItems in inventory
		world.items = world.items.filter(
			(item) => dist(item.x, item.y, playerGroundPosition.x, playerGroundPosition.y) >= maxDistance
		);
	}

	/**
	 * Adds given item in a free slot if possible
	 */
	addItemInSlots(item, itemSpriteIndex) {
		const slotIndex = this.slots.findIndex((slot) => slot.item === null);
		if (slotIndex < 0) {
			return;
		}
		this.slots[slotIndex] = { item };
		slotButtons[slotIndex].setItem(spritesheet.getImage('seed_vegetable', itemSpriteIndex));
	}

	getBox() {
		return { x: this.position.x, y: this.position.y, w: 32 * 2, h: 48 * 2 };
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
			if (item && item.category === 'seed') {
				// add a plant to chunk
				chunk.addPlant(item.type, colChunk, rowChunk - 1);
			}
		} else if (
			chunk.tiles[colChunk][rowChunk] === 2 &&
			[ 12, 16, 24 ].includes(chunk.tiles[colChunk][rowChunk - 1])
		) {
			// harvest a plant
			chunk.tiles[colChunk][rowChunk] = 1;
			chunk.tiles[colChunk][rowChunk - 1] = 8;
			const type = chunk.getPlantType(colChunk, rowChunk - 1);
			chunk.removePlantAt(colChunk, rowChunk - 1);
			// drop items: seed + plant
			if (type) {
				const iChunk = chunk.id * chunk.width * world.scale * world.tileSize;
				const worldPosition = {
					x: iChunk + colChunk * world.tileSize * world.scale,
					y: (rowChunk - 1) * world.tileSize * world.scale + world.tileSize
				};
				world.items.push(new DroppedItem(type, 'seed', worldPosition, { x: random(3) - 1, y: -random(3) }));
				if (random(1) > 0.9) {
					// two seeds !!
					world.items.push(new DroppedItem(type, 'seed', worldPosition, { x: random(3) - 1, y: -random(3) }));
				}
				world.items.push(
					new DroppedItem(type, 'vegetable', worldPosition, { x: random(3) - 1, y: -random(3) })
				);
			}
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
		this.vy = Math.min(15, this.vy + gravity);

		// check if entity hit a solid tile
		const box = this.getBox();
		box.x += this.vx * speed;
		if (!world.hitWall(box)) {
			this.position.x += this.vx * speed;
		}
		box.x -= this.vx * speed;
		box.y += this.vy * speed;
		if (!world.hitWall(box)) {
			this.position.y += this.vy * speed;
		} else {
			this.vy /= 2;
			this.canJump = true;
		}
		this.vx = 0;

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
