const tileSize = 64;

class TileAtlas {
	constructor() {
		this.image = tileImages[0];
	}

	getTile(indexI, indexJ, sizeI, sizeJ) {
		// TODO
		return image(this.image);
	}
}

class TileMap {
	constructor() {
		this.tiles = [];
		this.ni = 0;
		this.nj = 0;
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
		this.tiles[0][9].back = 1;
        this.tiles[2][9].back = 2;
        this.tiles[2][8].back = 5;

        this.tiles[4][8].back = 5;
        this.tiles[4][9].back = 4;
        this.tiles[5][9].back = 9;

        this.tiles[7][9].back = 3;
        this.tiles[8][9].back = 11;
        this.tiles[9][9].back = 11;
        this.tiles[10][9].back = 9;
	}

	render(dx, dy) {
		for (let j = 0; j < this.nj; j++) {
			for (let i = 0; i < this.ni; i++) {
				this.tiles[i][j].draw(dx, dy);
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
		this.back = backIndex;
	}

	addFront(frontIndex) {
		this.front = frontIndex;
	}

	addObject(object) {
		this.object = object;
	}

	draw(dx, dy) {
		if (this.back !== 0) {
            const indexI = ((this.back-1)%10);
            const indexJ = Math.floor((this.back-1)/10);
			image(
				atlas.image,
				this.x * tileSize + dx,
				this.y * tileSize + dy,
				tileSize,
				tileSize,
				indexI*tileSize,
				indexJ*tileSize,
				tileSize,
				tileSize
			);
		} else {
            strokeWeight(1);
		    stroke(50, 0, 0);
			noFill();
			//rect(this.x * tileSize + dx, this.y * tileSize + dy, tileSize, tileSize);
		}
	}
}
