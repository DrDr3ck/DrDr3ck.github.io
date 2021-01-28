class Inventory {
	constructor() {
		this.popupTime = 255;
		this.visible = false;
	}

	draw() {
		push();
		stroke(12);
		strokeWeight(1);
		fill(128, 255-this.popupTime);
		translate(100,90);
		rect(0,0,windowWidth-200,windowHeight-200);
		this.popupTime = max(0, this.popupTime-16);
		pop();
	}

	popup() {
		if( this.visible ) {
			this.popupTime = 0;
			this.visible = false;
		} else {
			this.popupTime = 255;
			this.visible = true;
		}
	}
}

class World {
	constructor() {
		this.chunks = [ new Chunk(0) ];
		this.scale = 2;
		this.tileSize = 32;
		this.archive = {};

		this.player = new Entity(0, 0);
		this.player.scale = this.scale;

		this.items = []; // TODO: per chunk ?

		this.inventory = new Inventory();
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
