class World {
	constructor(sizeX, sizeY) {
        this.size = { X: sizeX, Y: sizeY };
		this.holes = [];
		this.player = null;
		this.animals = [];
		this.selectedTile = null;
		this.food = 0;
		this.level = 1;

		this.nextTileLevel = {X: 4, Y: 0};
	}

	draw() {
		// tiles
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
		// exit
		const x = this.nextTileLevel.X * tileSize;
		const y = this.nextTileLevel.Y * tileSize;
		stroke(0);
		fill(20, 180, 80);
		rect(x+2,y+2,tileSize-4, tileSize-4);
		// entities
		this.animals.forEach(animal=>animal.draw());
		this.player.draw();
	}

	update(elapsedTime) {
		this.player.update(elapsedTime);
		this.animals.forEach(animal=>animal.update(elapsedTime));
	}

	mouseMoved(mx,my) {
		this.selectedTile = this.getTile(mx,my);
	}

    getIndex(tileX, tileY) {
        return tileX + tileY * this.size.X;
	}
	getTile(x,y) {
		const X = Math.floor(x/tileSize);
		const Y = Math.floor(y/tileSize);
		if( X < 0 || X >= this.size.X) {
			return null;
		}
		if( Y < 0 || Y >= this.size.Y) {
			return null;
		}
		return {X ,Y };
	}

	isFree(tileX, tileY) {
		if (tileX < 0 || tileY < 0 || tileX >= this.size.X || tileY >= this.size.Y) {
			return false;
		}
		return !this.holes.includes(this.getIndex(tileX, tileY));
	}

	move() {
		// move all animals
		this.animals.forEach(animal=>animal.move());
	}

	hurt(tileX, tileY, damage) {
		this.animals.forEach(animal=> {
			if( animal.tilePosition.X === tileX && animal.tilePosition.Y === tileY ) {
				animal.hurt(damage);
			}
		});
	}

	nextLevel() {
		this.level++;
		this.animals = [];
		this.player.setTileX(playerStart.X);
		this.player.setTileY(playerStart.Y);
	}
}

class Entity extends Sprite {
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

class Player extends Entity {
	constructor(tileX, tileY) {
		super(tileX, tileY);
		this.addAnimation('idle', 'player01', [ 0, 1, 2, 3 ], FPS, true);
		this.addAnimation('up', 'player01', [ 4, 5, 6, 7 ], FPS, true);
	}

	getDamage() {
		return 5;
	}
}

class Animal extends Entity {
	constructor(name, tileX, tileY) {
		super(tileX, tileY);
		this.addAnimation('idle', name, [ 0, 1, 2, 3 ], FPS, true);
		this.addAnimation('dead', name, [ 4 ], FPS, true);
		this.life = 5;
	}

	move() {
		if( this.life === 0 ) {
			// animal dead: cannot move
			return;
		}
		// randomly move this animal
		const dx = getRandomIntInclusive(-1,1);
		const dy = dx === 0 ? getRandomIntInclusive(-1,1) : 0;
		if( world.isFree(this.tilePosition.X+dx, this.tilePosition.Y+dy) ) {
			this.setTileX(this.tilePosition.X+dx);
			this.setTileY(this.tilePosition.Y+dy);
		}
	}

	hurt(damage) {
		if( this.life === 0 ) {
			return;
		}
		this.life = Math.max(0, this.life-damage);
		if( this.life === 0 ) {
			// animal is dead, add food to player
			world.food += 50;
			this.playAnimation("dead");
			playSound(animalDeathSound);
			if( !firstBlood ) {
				firstBlood = true;
				uiManager.addLogger('Each kill gains food');
			}
		}
	}
}
