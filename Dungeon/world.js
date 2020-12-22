class World {
	constructor(tileSize, rows, cols) {
		this.tileSize = tileSize;
		this.tiles = [];
		for (let r = 0; r < rows; r++) {
			const tiles = [];
			for (let c = 0; c < cols; c++) {
				tiles.push(-1);
			}
			this.tiles.push(tiles);
        }
        
        this.tiles[0][0] = 0;
        this.tiles[1][0] = 1;
        this.tiles[2][0] = 19;
        this.tiles[0][1] = 13;

		this.tiles[3][2] = 4;
		this.tiles[3][3] = 11;
		this.tiles[3][4] = 18;

		[ 4, 5, 6 ].forEach((i) => {
			this.tiles[i][2] = 5;
			this.tiles[i][3] = 12;
			this.tiles[i][4] = 19;
		});

		this.tiles[7][2] = 6;
		this.tiles[7][3] = 13;
		this.tiles[7][4] = 20;
	}

	draw() {
		stroke(0);
		fill(50, 150, 50);
		for (let r = 0; r < this.tiles.length; r++) {
			for (let c = 0; c < this.tiles[0].length; c++) {
				const tileIndex = this.tiles[r][c];
				if (tileIndex === -1) {
					rect(r * this.tileSize, c * this.tileSize, this.tileSize, this.tileSize);
				} else {
					spritesheet.drawSprite('wall', tileIndex, r * this.tileSize, c * this.tileSize);
				}
			}
		}
	}

	update(elapsedTime) {}
}
