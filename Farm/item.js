class Item {
	constructor(name, category) {
		this.name = name;
		this.category = category;
	}
}

class CountedItem extends Item {
	constructor(name, category, img) {
		super(name, category);
		this.count = 0;
		this.img = img;
	}
}

class DroppedItem extends Item {
	constructor(name, category, position, vector) {
		super(name, category);
		this.img = spritesheet.getImage('seed_vegetable', getSpriteIndex(name, category));

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
	if (category == 'seed') {
		if (type === 'navet') {
			return 0;
		} else if (type === 'carotte') {
			return 2;
		} else if (type === 'tomate') {
			return 4;
		}
	} else if (category === 'vegetable') {
		if (type === 'navet') {
			return 1;
		} else if (type === 'carotte') {
			return 3;
		} else if (type === 'tomate') {
			return 5;
		}
	} else if (category === 'tool') {
		if (type === 'hoe') {
			return 0;
		} else if (type === 'pickaxe') {
			return 1;
		} else if (type === 'shovel') {
			return 2;
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
	constructor(name, column, row) {
		super(name, 'plant');
		this.column = column;
		this.row = row;
		this.indices = getSpriteIndices(name);
		this.time = 200; // in milliseconds
	}

	update(elapsedTime, chunk) {
		this.time = Math.max(0, this.time - elapsedTime);
		// if time to grow, change sprite in chunk
		if (this.time <= 0) {
			const plantIndex = chunk.tiles[this.column][this.row];
			const idx = this.indices.find((i) => i === plantIndex);
			if (idx >= 0) {
				chunk.tiles[this.column][this.row] = plantIndex + 1;
				this.time = 200;
			}
		}
	}
}

const distTile = (tilePosition1, tilePosition2) => {
	const deltaX = Math.abs(tilePosition1.column - tilePosition2.column);
	const deltaY = Math.abs(tilePosition1.row - tilePosition2.row);
	return Math.max(deltaX, deltaY);
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

		this.slotIndex = 0;
		this.slots = slotButtons.map(() => {
			return { item: null };
		});
	}

	dropSlotItem() {
		const item = this.slots[this.slotIndex].item;
		if (!item) {
			// nothing to do: no item on this slot
			return;
		}
		if (item.count === 0) {
			return;
		}
		world.items.push(new DroppedItem(item.name, item.category, this.position, { x: random(3) - 1, y: -random(2) }));
		item.count--;
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
		// put pickedItems in inventory
		pickedItems.forEach((item) => {
			const countedItem = world.inventory.getCountedItem(item.name, item.category);
			if (!countedItem) {
				throw `no items named ${item.name} from category ${item.category} in inventory`;
			}
			if (this.hasFreeSlot() && !this.hasSlotForItem(countedItem)) {
				// try to put item in a slot
				world.player.addItemInSlots(countedItem);
			}
			countedItem.count++;
		});
		// remove pickedItems from list of items on the ground
		world.items = world.items.filter(
			(item) => dist(item.x, item.y, playerGroundPosition.x, playerGroundPosition.y) >= maxDistance
		);
	}

	hasSlotForItem(item) {
		const slotIndex = this.slots.findIndex((slot) => {
			return slot.item === item;
		});
		return slotIndex >= 0;
	}

	hasFreeSlot() {
		const slotIndex = this.slots.findIndex((slot) => slot.item === null);
		return slotIndex >= 0;
	}

	/**
	 * Adds given item in a free slot if possible
	 */
	addItemInSlots(item) {
		const slotIndex = this.slots.findIndex((slot) => slot.item === null);
		if (slotIndex < 0) {
			return;
		}
		this.slots[slotIndex] = { item };
		slotButtons[slotIndex].setItem(item);
	}

	getBox() {
		return { x: this.position.x + 10, y: this.position.y, w: 32 * 2 - 20, h: 48 * 2 };
	}

	execute( tilePosition ) {
		// execute an action on the current tile
		// ex: if entity has a 'hoe' in hand, he will 'plow' the current tile if possible
		const box = this.getBox();
		const playerTilePosition = world.getTilePosition(box.x + box.w / 2, box.y + box.h / 2);
		// check if given tile position is next to player tile position
		if( distTile(playerTilePosition, tilePosition) > 2) {
			return;
		}
		const chunk = world.getChunk(tilePosition.column, tilePosition.row);
		const colChunk = world.getColumnPositionInChunk(chunk, tilePosition.column);
		const rowChunk = tilePosition.row + 1;

		const item = this.slots[this.slotIndex].item;

		if (item && item.category === 'vegetable' && item.count > 0) {
			// check if player is carrying a vegetable
			item.count--;
			// transform seed into vegetable
			world.items.push(
				new DroppedItem(item.name, 'seed', world.player.position, { x: random(3) - 1, y: -random(3) })
			);
			if (random(1) > 0.8) {
				// two seeds !!
				world.items.push(
					new DroppedItem(item.name, 'seed', world.player.position, { x: random(3) - 1, y: -random(3) })
				);
			}
		} else if (item && item.category === 'tool' && item.name === 'shovel' && item.count > 0) {
			if (chunk.tiles[colChunk][rowChunk] === 0 || chunk.tiles[colChunk][rowChunk] === 1) {
				chunk.tiles[colChunk][rowChunk - 1] = -1;
				chunk.tiles[colChunk][rowChunk] = -1;
				chunk.tiles[colChunk][rowChunk + 1] = 1;
			}
		} else if (item && item.category === 'tool' && item.name === 'hoe' && item.count > 0) {
			if (chunk.tiles[colChunk][rowChunk] === 0) {
				chunk.tiles[colChunk][rowChunk] = 1;
				chunk.tiles[colChunk][rowChunk - 1] = 8;
			} else if (chunk.tiles[colChunk][rowChunk] === 1) {
				chunk.tiles[colChunk][rowChunk] = 2;
				chunk.tiles[colChunk][rowChunk - 1] = 8;
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
					world.items.push(
						new DroppedItem(type, 'vegetable', worldPosition, { x: random(3) - 1, y: -random(3) })
					);
				}
			}
		} else if (item && item.category === 'seed' && item.count > 0) {
			// check if player is carrying a seed
			// check if seed count > 0
			if (chunk.tiles[colChunk][rowChunk] === 2 && chunk.tiles[colChunk][rowChunk - 1] < 9) {
				// add a plant to chunk
				chunk.addPlant(item.name, colChunk, rowChunk - 1);
				item.count--;
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
			image(slotButtons[this.slotIndex].item.img, this.position.x + 16, this.position.y - 32 - 16);
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

class Money {
	constructor() {
		this.copper = 0;
		this.silver = 0;
		this.gold = 0;
	}

	draw() {
		textAlign(RIGHT, CENTER);
		textSize(24);
		fill(0);
		noStroke();
		text(this.copper, 0, 40);
		spritesheet.drawSprite('farm_money', 0, 5,32);
		text(this.silver, 0, 20);
		spritesheet.drawSprite('farm_money', 1, 5,12);
		text(this.gold, 0, 0);
		spritesheet.drawSprite('farm_money', 2, 5,-8);
	}
}
