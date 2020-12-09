class World {
	constructor(sizeX, sizeY) {
        this.size = { X: sizeX, Y: sizeY };
        this.holes = [];
	}

	draw() {
		stroke(0);
		fill(20, 180, 80);
		for (let i = 0; i < this.size.X; i++) {
			for (let j = 0; j < this.size.Y; j++) {
				const idx = this.getIndex(i,j);
				if (!this.holes.includes(idx)) {
					const x = i * tileSize;
					const y = j * tileSize;
					spritesheet.drawSprite('ground01', (i + j) % 10, x, y);
				}
			}
		}
	}

    update() {}
    
    getIndex(tileX, tileY) {
        return tileX + tileY * this.size.X;
    }

	isFree(tileX, tileY) {
		if (tileX < 0 || tileY < 0 || tileX >= this.size.X || tileY >= this.size.Y) {
			return false;
		}
		return !this.holes.includes(this.getIndex(tileX, tileY));
	}
}

class Player extends Sprite {
	constructor(tileX, tileY) {
		super(tileX * tileSize, tileY * tileSize);
		this.tilePosition = { X: tileX, Y: tileY };
	}

	setTileX(tileX) {
		this.tilePosition.X = tileX;
		this.position.x = tileX * tileSize;
	}
	setTileY(tileY) {
		this.tilePosition.Y = tileY;
		this.position.y = tileY * tileSize;
	}
}
