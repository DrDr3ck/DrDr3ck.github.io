class Category {
	constructor(name) {
		this.name = name;
		this.countedItems = [];
	}

	getCountedItem(itemName) {
		const idx = this.countedItems.findIndex((item) => item.name === itemName);
		if (idx === -1) {
			throw `no counted item for ${itemName} of category ${this.name}`;
		}
		return this.countedItems[idx];
	}

	createItem(name, img, count = 0) {
		const item = new CountedItem(name, this.name, img);
		item.count = count;
		this.countedItems.push(item);
	}

	addItem(name, nb) {
		// find item
		const idx = this.countedItems.findIndex((item) => item.name === name);
		if (idx === -1) {
			throw `Item ${item} does not exist on this category ${this.name}`;
		}
		this.countedItems[idx].count += nb;
	}

	removeItem(name, nb) {
		// find item
		const idx = this.countedItems.findIndex((item) => item.name === name);
		if (idx === -1) {
			throw `Item ${item} does not exist on this category ${this.name}`;
		}
		if (this.countedItems[idx].count < nb) {
			return false;
		}
		this.countedItems[idx].count -= nb;
		return true;
	}
}

class Inventory {
	constructor() {
		this.popupTime = 255;
		this.visible = false;
		this.categories = [];
		this.tabButtons = [
			new BSlotButton(120, 120, spritesheet.getImage('farm_ui', 2), () => {
				this.currentTabIndex = 0;
			}),
			new BSlotButton(120 + 70, 120, spritesheet.getImage('farm_ui', 3), () => {
				this.currentTabIndex = 1;
			}),
			new BSlotButton(120 + 70 * 2, 120, spritesheet.getImage('farm_ui', 4), () => {
				this.currentTabIndex = 2;
			})
		];
		const closeDialogButton = new BFloatingButton(windowWidth - 150, 160, '\u2716', () => {
			this.popup();
		});
		closeDialogButton.setTextSize(32);
		this.tabButtons.push(closeDialogButton);
		this.currentTabIndex = 0;
		this.tabButtons.forEach((tab) => (tab.visible = false));
	}

	draw() {
		push();
		stroke(12);
		strokeWeight(1);
		fill(128, 255 - this.popupTime);
		translate(100, 90);
		rect(0, 0, windowWidth - 200, windowHeight - 200);
		fill(128, 128, 100);
		rect(15, 25, windowWidth - 200 - 100, 74);

		const tileSize = world.tileSize * world.scale;
		textSize(16);
		textAlign(RIGHT, TOP);
		imageMode(CENTER);
		this.categories[this.currentTabIndex].countedItems.forEach((item, i) => {
			const x = 20 + 70 * i;
			const y = 120;
			fill(128, 128, 100);
			rect(x, y, tileSize, tileSize);
			image(item.img, x + tileSize / 2, y + tileSize / 2, 48, 48, 0, 0);
			fill(0);
			text(item.count, x + tileSize - 2, y + 2);
		});

		this.popupTime = max(0, this.popupTime - 16);
		pop();
	}

	createCategory(name) {
		const category = new Category(name);
		this.categories.push(category);
		return category;
	}

	getCategory(categoryName) {
		const idx = this.categories.findIndex((cat) => cat.name === categoryName);
		if (idx === -1) {
			throw `no category for ${categoryName}`;
		}
		return this.categories[idx];
	}

	createItem(itemName, categoryName, count = 0) {
		// find category or create it
		let idx = this.categories.findIndex((cat) => cat.name === categoryName);
		const category = idx === -1 ? this.createCategory(categoryName) : this.categories[idx];
		idx = category.countedItems.findIndex((item) => item.name === itemName);
		if (idx !== -1) {
			throw `Item ${itemName} already created in category ${categoryName}`;
		}
		const img = spritesheet.getImage(
			categoryName === 'tool' ? 'farm_tools' : 'seed_vegetable',
			getSpriteIndex(itemName, categoryName)
		);
		category.createItem(itemName, img, count);
	}

	getCountedItem(itemName, categoryName) {
		const category = this.getCategory(categoryName);
		return category.getCountedItem(itemName);
	}

	popup() {
		if (this.visible) {
			// hide buttons
			this.tabButtons.forEach((tab) => (tab.visible = false));
			this.popupTime = 0;
			this.visible = false;
		} else {
			// show buttons
			this.tabButtons.forEach((tab) => (tab.visible = true));
			this.popupTime = 255;
			this.visible = true;
		}
	}
}

const fillInventory = (inventory) => {
	let categoryName = 'seed';
	inventory.createCategory(categoryName);
	inventory.createItem('navet', categoryName, 15);
	inventory.createItem('carotte', categoryName, 5);
	inventory.createItem('tomate', categoryName, 5);
	categoryName = 'vegetable';
	inventory.createCategory(categoryName);
	inventory.createItem('navet', categoryName);
	inventory.createItem('carotte', categoryName);
	inventory.createItem('tomate', categoryName);
	categoryName = 'tool';
	inventory.createCategory(categoryName);
	inventory.createItem('hoe', categoryName, 1);
	inventory.createItem('pickaxe', categoryName, 1);
	inventory.createItem('shovel', categoryName, 1);
};

class World {
	constructor() {
		this.chunks = [ new Chunk(0) ];
		this.scale = 2;
		this.tileSize = 32;
		this.archive = {};

		this.player = new Entity(0, 0);
		this.player.scale = this.scale;

		this.items = []; // TODO: per chunk ?

		this.mouseTilePosition = null;

		this.inventory = new Inventory();
		fillInventory(this.inventory);
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

		const scaledTileSize = this.tileSize * this.scale;
		this.chunks.forEach((chunk) => {
			// TODO: check if this chunk needs to be displayed according to position of the chunk in the camera
			const iChunk = chunk.id * chunk.width * this.scale * this.tileSize;
			for (let i = 0; i < chunk.width; i++) {
				for (let j = 0; j < chunk.height; j++) {
					if (chunk.tiles[i][j] !== -1) {
						spritesheet.drawScaledSprite(
							'farm_tile',
							chunk.tiles[i][j],
							i * scaledTileSize + iChunk,
							j * scaledTileSize,
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
						rect(i * scaledTileSize + iChunk, j * scaledTileSize, scaledTileSize, scaledTileSize);
					}
				}
			}
		});

		this.mouseTilePosition = this.getTilePosition(
			mouseX + world.player.position.x - 9 * scaledTileSize,
			mouseY + 32 - 7 * scaledTileSize
		);

		if (toggleDebug) {
			noFill();
			stroke(0);
			strokeWeight(1);
			rect(
				this.mouseTilePosition.column * scaledTileSize,
				this.mouseTilePosition.row * scaledTileSize,
				scaledTileSize,
				scaledTileSize
			);
			text(JSON.stringify(this.mouseTilePosition), 0, -100);
		}

		this.items.forEach((item) => item.draw());

		if (toggleDebug) {
			ellipse(this.player.position.x, this.player.position.y, 2);
			text(`${this.player.position.x}-${width / 2 - this.tileSize * world.scale / 2}`, 0, -150);
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

/****************************************************************************/

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
		return plant[0].name;
	}

	removePlantAt(column, row) {
		this.plants = this.plants.filter((plant) => plant.column !== column || plant.row !== row);
	}

	update(elapsedTime) {
		// update time for plants
		this.plants.forEach((plant) => plant.update(elapsedTime, this));
	}
}
