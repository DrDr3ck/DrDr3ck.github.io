const tileSize = 64;

class TileAtlas {
	constructor() {
		this.back = tileImages[0];
		this.front = tileImages[1];
	}

	getTile(indexI, indexJ, sizeI, sizeJ) {
		// TODO
		return image(this.image);
	}
}

class TileMap {
	constructor(dx, dy) {
		this.tiles = [];
		this.ni = 0;
		this.nj = 0;
		this.dx = dx;
		this.dy = dy;
	}

	indexToX(i, j) {
		return this.tiles[i][j].x * tileSize + this.dx;
	}
	indexToY(i, j) {
		return this.tiles[i][j].y * tileSize + this.dy;
	}

	init(ni, nj) {
		this.ni = ni;
		this.nj = nj;
		for (let i = 0; i < ni; i++) {
			const rowTiles = [];
			for (let j = 0; j < nj; j++) {
				rowTiles.push(new Tile(i, j));
			}
			this.tiles.push(rowTiles);
		}
		this.tiles[0][9].front = 1;
		this.tiles[1][9].back = 1;
		this.tiles[2][9].front = 2;
		this.tiles[2][8].front = 5;

		this.tiles[4][8].front = 5;
		this.tiles[4][9].front = 4;
		this.tiles[5][9].front = 9;

		this.tiles[7][9].front = 3;
		this.tiles[8][9].front = 11;
		this.tiles[9][9].front = 11;
		this.tiles[10][9].front = 9;
	}

	addBlock(tileX, tileY, blockIndex) {
		const tile = this.tiles[tileX][tileY];
		if (tile.back === -1) {
			tile.addBack(blockIndex);
		} else if (tile.front === -1) {
			tile.addFront(blockIndex);
		}
	}

	removeBlock(tileX, tileY) {
		const tile = this.tiles[tileX][tileY];
		if (tile.front > 0) {
			tile.addFront(0);
		} else if( tile.back > 0 ) {
			tile.addBack(0);
		}
	}

	render() {
		for (let j = 0; j < this.nj; j++) {
			for (let i = 0; i < this.ni; i++) {
				this.tiles[i][j].draw(this.dx, this.dy);
			}
		}
	}
}

class Tile {
	constructor(x, y) {
		this.x = x;
		this.y = y;
		this.back = 0;
		this.front = 0;
		this.occupied = false;
		this.object = null;
	}

	addBack(backIndex) {
		// TODO check tile around to update them
		this.back = backIndex;
	}

	addFront(frontIndex) {
		// TODO check tile around to update them
		this.front = frontIndex;
	}

	addObject(object) {
		this.object = object;
	}

	draw(dx, dy) {
		if (this.back > 0) {
			const indexI = (this.back - 1) % 10;
			const indexJ = Math.floor((this.back - 1) / 10);
			image(
				atlas.back,
				this.x * tileSize + dx,
				this.y * tileSize + dy,
				tileSize,
				tileSize,
				indexI * tileSize,
				indexJ * tileSize,
				tileSize,
				tileSize
			);
		}
		if (this.front > 0) {
			const indexI = (this.front - 1) % 10;
			const indexJ = Math.floor((this.front - 1) / 10);
			image(
				atlas.front,
				this.x * tileSize + dx,
				this.y * tileSize + dy,
				tileSize,
				tileSize,
				indexI * tileSize,
				indexJ * tileSize,
				tileSize,
				tileSize
			);
		}
	}
}

function test() {}

test();
