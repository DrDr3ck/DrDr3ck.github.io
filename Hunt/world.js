class Animation {
	constructor(time) {
		this.initialTime = time;
		this.currentTime = time;
	}
	update(elapsedTime) {
		this.currentTime = max(0, this.currentTime - elapsedTime);
	}
	draw() {
		if (this.currentTime === 0) {
			return;
		}
		push();
		this.doDraw();
		pop();
	}
}

class textAnimation extends Animation {
	constructor(text, fromPosition, toPosition, time) {
		super(time);
		this.fromPosition = fromPosition;
		this.toPosition = toPosition;
		this.text = text;
		this.alpha = 255;
	}

	doDraw() {
		const dx = this.toPosition.X - this.fromPosition.X;
		const dy = this.toPosition.Y - this.fromPosition.Y;
		const rel = 1 - this.currentTime / this.initialTime;
		noStroke();
		textSize(32);
		fill(255, 128, 0, this.alpha * (1 - rel));
		text(this.text, this.fromPosition.X + dx * rel, this.fromPosition.Y + dy * rel);
	}
}

const facing = [ 'TOP', 'RIGHT', 'BOTTOM', 'LEFT' ];

class World {
	constructor(sizeX, sizeY) {
		this.size = { X: sizeX, Y: sizeY };
		this.holes = [];
		this.player = null;
		this.playerFacing = facing[0];
		this.animals = [];
		this.selectedTile = null;
		this.food = 0;
		this.level = 1;

		this.nextTileLevel = { X: 8, Y: 0 };
	}

	nextLevel() {
		this.level++;
		this.animals = [ new Animal('sheep', 2, 2) ];
		this.player.setTileX(playerStart.X);
		this.player.setTileY(playerStart.Y);
		this.playerFacing = facing[0];
		this.player.playAnimation('idle_top');
	}

	addFood(value) {
		world.food = Math.max(0, world.food + value);
		if (value < 0) {
			allAnimations.push(new textAnimation(value, { X: width-100, Y: 150 }, { X: width-100, Y: 200 }, 1000));
		} else {
			allAnimations.push(new textAnimation(`+${value}`, { X: width-100, Y: 150 }, { X: width-100, Y: 100 }, 1000));
		}
	}

	setPlayerFacing(facingIdx) {
		this.playerFacing = facing[facingIdx];
		this.player.playAnimation(`idle_${this.playerFacing.toLowerCase()}`);
	}

	getDeltaX(facing) {
		if( facing === 'TOP') {
			return 0;
		}
		if( facing === 'BOTTOM') {
			return 0;
		}
		if( facing === 'LEFT') {
			return -1;
		}
		if( facing === 'RIGHT') {
			return 1;
		}
		return 0;
	}

	getDeltaY(facing) {
		if( facing === 'TOP') {
			return -1;
		}
		if( facing === 'BOTTOM') {
			return 1;
		}
		if( facing === 'LEFT') {
			return 0;
		}
		if( facing === 'RIGHT') {
			return 0;
		}
		return 0;
	}

	movePlayer(move) {
		if (!firstMove && (move === 'UP' || move === 'DOWN')) {
			firstMove = true;
			uiManager.addLogger('Each move costs food');
		}
		let canMove = false;
		if (move === 'UP') {
			const dx = this.getDeltaX(this.playerFacing);
			const dy = this.getDeltaY(this.playerFacing);
			if (this.isFree(this.player.tilePosition.X+dx, this.player.tilePosition.Y+dy)) {
				this.player.setTileX(this.player.tilePosition.X+dx);
				this.player.setTileY(this.player.tilePosition.Y+dy);
				canMove = true;
			}
		}
		/*
		if (move === 'DOWN' && this.isFree(this.player.tilePosition.X, this.player.tilePosition.Y + 1)) {
			this.player.setTileY(this.player.tilePosition.Y + 1);
			canMove = true;
		}
		*/
		if (move === 'LEFT') {
			const facingIdx = facing.indexOf(this.playerFacing);
			this.setPlayerFacing((facingIdx + 3) % 4);
		}
		if (move === 'RIGHT') {
			const facingIdx = facing.indexOf(this.playerFacing);
			this.setPlayerFacing((facingIdx + 1) % 4);
		}
		if (canMove) {
			this.addFood(-1);
			soundManager.playSound('move');
			this.move();
			if (this.food === 0) {
				// game over
				curState = GAME_OVER_STATE;
				soundManager.playSound('game_over');
				startButton.visible = true;
			} else {
				// check if player is on 'next level' tile
				if (
					this.player.tilePosition.X === this.nextTileLevel.X &&
					this.player.tilePosition.Y === this.nextTileLevel.Y
				) {
					soundManager.playSound('next_level');
					curState = GAME_NEXT_LEVEL_STATE;
					uiManager.addLogger('Next level!!!');
					setTimeout(function() {
						world.nextLevel();
						curState = GAME_PLAY_STATE;
					}, speakerButton.checked ? 2000 : 800);
				}
			}
		}
	}

	draw() {
		// tiles
		for (let i = 0; i < this.size.X; i++) {
			for (let j = 0; j < this.size.Y; j++) {
				const idx = this.getIndex(i, j);
				const x = i * tileSize;
				const y = j * tileSize;
				const idxSprite = noise(idx+this.level);
				if (!this.holes.includes(idx)) {
					spritesheet.drawSprite('ground01', Math.floor(idxSprite * 10), x, y);
				} else {
					spritesheet.drawSprite('bush01', Math.floor(idxSprite * 3), x, y);
				}
			}
		}
		// exit
		const x = this.nextTileLevel.X * tileSize;
		const y = this.nextTileLevel.Y * tileSize;
		stroke(0);
		fill(20, 180, 80);
		rect(x + 2, y + 2, tileSize - 4, tileSize - 4);
		// entities
		this.animals.forEach((animal) => animal.draw());
		this.player.draw();
	}

	update(elapsedTime) {
		this.player.update(elapsedTime);
		this.animals.forEach((animal) => animal.update(elapsedTime));
	}

	mouseMoved(mx, my) {
		this.selectedTile = this.getTile(mx, my);
	}

	getIndex(tileX, tileY) {
		return tileX + tileY * this.size.X;
	}
	getTile(x, y) {
		const X = Math.floor(x / tileSize);
		const Y = Math.floor(y / tileSize);
		if (X < 0 || X >= this.size.X) {
			return null;
		}
		if (Y < 0 || Y >= this.size.Y) {
			return null;
		}
		return { X, Y };
	}

	isFree(tileX, tileY) {
		if (tileX < 0 || tileY < 0 || tileX >= this.size.X || tileY >= this.size.Y) {
			return false;
		}
		return !this.holes.includes(this.getIndex(tileX, tileY));
	}

	move() {
		// move all animals
		this.animals.forEach((animal) => animal.move());
	}

	hurt(tileX, tileY, damage) {
		this.animals.forEach((animal) => {
			if (animal.tilePosition.X === tileX && animal.tilePosition.Y === tileY) {
				animal.hurt(damage);
			}
		});
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
		this.addAnimation('idle_top', 'player01', [ 0, 1, 2, 3 ], FPS, true);
		this.addAnimation('idle_left', 'player01', [ 4, 5, 6, 7 ], FPS, true);
		this.addAnimation('idle_right', 'player01', [ 8, 9, 10, 11 ], FPS, true);
		this.addAnimation('idle_bottom', 'player01', [ 12, 13, 14, 15 ], FPS, true);
	}

	getDamage() {
		return 5;
	}
}

class Animal extends Entity {
	constructor(name, tileX, tileY) {
		super(tileX, tileY);
		this.addAnimation('idle', name, [ 0, 1 ], FPS, true);
		this.addAnimation('dead', name, [ 2 ], FPS, true);
		this.life = 5;
	}

	move() {
		if (this.life === 0) {
			// animal dead: cannot move
			return;
		}
		// randomly move this animal
		const dx = getRandomIntInclusive(-1, 1);
		const dy = dx === 0 ? getRandomIntInclusive(-1, 1) : 0;
		if (world.isFree(this.tilePosition.X + dx, this.tilePosition.Y + dy)) {
			this.setTileX(this.tilePosition.X + dx);
			this.setTileY(this.tilePosition.Y + dy);
		}
	}

	hurt(damage) {
		if (this.life === 0) {
			return;
		}
		this.life = Math.max(0, this.life - damage);
		if (this.life === 0) {
			// animal is dead, add food to player
			world.addFood(50);
			this.playAnimation('dead');
			soundManager.playSound('animal_death');
			if (!firstBlood) {
				firstBlood = true;
				uiManager.addLogger('Each kill gains food');
			}
		}
	}
}
