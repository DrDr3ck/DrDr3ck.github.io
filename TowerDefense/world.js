class World {
	constructor() {
		this.init();
		this.towerWidth = 100;
		this.towerHeight = 100;
		this.groundLevel = height - 100;
		this.groundsLevel = [];

		this.towerX = width / 2 - this.towerWidth / 2;
		this.towerY = this.groundLevel - this.towerHeight;
	}

	init() {
		this.maxLife = 100;
		this.life = this.maxLife;
		this.bulletSpeed = 1.2;
		this.bulletReloadTime = 500;
		this.enemies = [];
		this.bullets = [];
		this.munitions = [];
		this.maxBullets = 5;
		this.wave = 0;
		this.gold = 0;
	}

	initWave() {
		this.wave++;
		this.munitions = [];
		for (let i = 0; i < width; i++) {
			this.groundsLevel[i] = this.groundLevel;
		}
		world.enemies = [
			new GroundEnemy(-10, 0.5, 16),
			new GroundEnemy(-20, 0.1, 16),
			new GroundEnemy(-120, 0.1, 16),
			new GroundEnemy(-130, 0.1, 16),
			new GroundEnemy(-140, 0.1, 16),
			new GroundEnemy(-150, 0.2, 10),
			new GroundEnemy(-160, 0.2, 10),
			new GroundEnemy(width + 10, -0.08, 24),
			new GroundEnemy(width + 50, -0.08, 24),
			new GroundEnemy(width + 90, -0.08, 24)
		];
		soundManager.playSound('new_wave');
	}

	upgradeTower() {
		this.gold -= upgradeTowerGold;
		this.towerHeight += 10;
		this.maxLife = this.towerHeight;
		this.life = this.maxLife;
		this.towerY = this.groundLevel - this.towerHeight;
		this.maxBullets++;
		this.bulletReloadTime *= 0.95;
		this.bulletSpeed *= 1.05;
		uiManager.addLogger('Tower upgraded');
		this.displayHelp(1000);
	}

	displayHelp(time = 0) {
		helpButton.enabled = false;
		uiManager.addLogger(`Max life set to ${this.maxLife}`, time);
		uiManager.addLogger(`Max bullets set to ${this.maxBullets}`, time + 1000);
		setTimeout(() => {
			helpButton.enabled = true;
		}, time + 2000);
	}

	hitTower(hitValue) {
		this.life = Math.max(0, this.life - hitValue);
	}

	getFireYPosition(x) {
		let r = 0;
		if (x > this.towerX + this.towerWidth) {
			r = map(x, this.towerX + this.towerWidth, width, 5, 1);
		} else if (x < this.towerX) {
			r = map(x, 0, this.towerX, 1, 5);
		}
		r = Math.max(0.2, Math.floor(r) * 0.2);
		return this.towerY + this.towerHeight * r;
	}

	fireBullet(toX, toY) {
		if (this.bullets.length >= this.maxBullets) {
			return;
		}
		if (toX > this.towerX + this.towerWidth) {
			this.bullets.push(
				new Bullet(
					{ X: this.towerX + this.towerWidth, Y: this.getFireYPosition(toX) },
					{ X: toX, Y: toY },
					this.bulletSpeed
				)
			);
		} else if (toX < this.towerX) {
			this.bullets.push(
				new Bullet({ X: this.towerX, Y: this.getFireYPosition(toX) }, { X: toX, Y: toY }, this.bulletSpeed)
			);
		} else {
			return;
		}
		soundManager.playSound('bow', random(0.8, 1.2));
	}

	draw() {
		image(underGroundImg, 0, this.groundLevel);

		// draw tower
		fill(150);
		rect(this.towerX, this.towerY, this.towerWidth, this.towerHeight);
		line(0, this.groundLevel, width, this.groundLevel);
		const yFire = this.getFireYPosition(mouseX);
		if (mouseX > this.towerX + this.towerWidth) {
			arc(this.towerX + this.towerWidth, yFire, 10, 10, HALF_PI, PI + HALF_PI);
		} else if (mouseX < this.towerX) {
			arc(this.towerX, yFire, 10, 10, PI + HALF_PI, HALF_PI);
		}

		// life of tower
		fill(150, 0, 0);
		rect(this.towerX, this.groundLevel + 10, 100, 5);
		fill(0, 150, 0);
		rect(this.towerX, this.groundLevel + 10, 100 * (this.life / this.maxLife), 5);

		// draw enemies
		this.enemies.forEach((enemy) => enemy.draw());
		// draw bullets
		fill(0);
		this.bullets.forEach((bullet) => bullet.draw());
		// draw munitions
		this.munitions.forEach((munition) => {
			ellipse(munition.X, munition.Y, 2);
		});

		// text
		push();
		textSize(30);
		fill(150);
		textAlign(LEFT);
		text(`Wave: ${this.wave > 0 ? this.wave : 1}`, 100, 100);
		textAlign(RIGHT);
		text(`Enemies left: ${this.enemies.length}`, width - 100, 100);
		textAlign(CENTER);
		text(`Gold: ${this.gold}`, width / 2, 50);
		pop();
	}

	getGroundLevel(x) {
		if (x < 0 || x >= width) {
			return this.groundLevel;
		}
		return this.groundsLevel[Math.round(x)];
	}

	/**
	 * Returns true if the bullet touches the ground
	 * @param {*} bullet 
	 */
	touchGround(bullet) {
		if (bullet.x < 0 || bullet.x >= width) {
			return true;
		}
		return bullet.y > this.groundsLevel[Math.round(bullet.x)];
	}

	/**
	 * Checks if ground level of x+dx is 'lower' that the one of x
	 * @param {*} x 
	 * @param {*} dx 
	 */
	checkGroundLevel(x, dx) {
		if (x < 0 || x >= width) {
			return false;
		}
		return this.groundsLevel[x + dx] > this.groundsLevel[x];
	}

	addMunitionOnGround(x) {
		if (this.checkGroundLevel(x, -1)) {
			this.addMunitionOnGround(x - 1);
		} else if (this.checkGroundLevel(x, +1)) {
			this.addMunitionOnGround(x + 1);
		} else {
			this.groundsLevel[x] = this.groundsLevel[x] - 1;
			this.munitions.push({ X: x, Y: this.groundsLevel[x] });
		}
	}

	update(elapsedTime) {
		// update bullets
		this.bullets.forEach((bullet) => {
			bullet.update(elapsedTime);
			// TODO: check if a bullet touches an enemy
			this.enemies.forEach((enemy) => {
				if (enemy.hit(bullet.x, bullet.y)) {
					enemy.moveBack();
					enemy.life--;
					bullet.y = height * 2; // move bullet far away below the window
					soundManager.playSound('arrow_damage');
				}
			});
		});
		// remove bullets on the ground
		for (let i = this.bullets.length - 1; i >= 0; i--) {
			if (this.touchGround(this.bullets[i])) {
				if (this.bullets[i].y < height) {
					// add munition on ground
					this.addMunitionOnGround(Math.round(this.bullets[i].x));
				}
				this.bullets.splice(i, 1);
			}
		}
		if (this.enemies.length === 0) {
			return;
		}
		// remove dead enemies
		for (let i = this.enemies.length - 1; i >= 0; i--) {
			if (this.enemies[i].life <= 0) {
				this.gold += this.enemies[i].gold;
				this.enemies.splice(i, 1);
				soundManager.playSound('argh', random(0.5, 1.5));
			}
		}
		if (this.enemies.length === 0) {
			//prepare to next wave
			nextButton.visible = true;
		}
		// update enemies
		this.enemies.forEach((enemy) => {
			enemy.update(elapsedTime);
			if (enemy.x + enemy.size > width / 2 - this.towerWidth / 2 && enemy.x < width / 2 + this.towerWidth / 2) {
				this.hitTower(enemy.damage);
				enemy.life = 0;
			}
		});
	}
}

class Enemy extends Sprite {
	constructor(x, y, speed, size) {
		super(x, y);
		this.speed = speed;
		this.size = size;
		this.life = 2;
		this.damage = 2;
		this.gold = 10;

		this.addAnimation('run', 'soldat', [ 0, 1, 2, 3, 4, 5, 6 ], 60, true);

		this.scale = this.size / 16;
	}

	draw() {
		if (toggleDebug) {
			fill(150, 50, 50);
			rect(this.position.x + this.size / 4, this.position.y, this.size / 2, this.size);
		}

		if (this.width) {
			super.draw();
		}
	}

	update(elapsedTime) {
		super.update(elapsedTime);
		this.position.x += this.speed;
		this.position.y = world.getGroundLevel(this.position.x + this.size / 2) - this.size;
	}

	moveBack() {
		if (this.position.x > width / 2) {
			this.position.x += 2;
		} else {
			this.position.x -= 2;
		}
	}

	hit(x, y) {
		if (x < this.position.x + this.size / 4 || x > this.position.x + this.size / 2 + this.size / 4) {
			return false;
		}
		if (y < this.position.y || y > this.position.y + this.size) {
			return false;
		}
		return true;
	}
}

class GroundEnemy extends Enemy {
	constructor(x, speed, size) {
		super(x, world.groundLevel - size * 2, speed, size);
	}
}

const gravity = 0.01;

class Bullet {
	constructor(from, to, speed) {
		this.x = from.X;
		this.y = from.Y;
		const vect = new p5.Vector(to.X - from.X, to.Y - from.Y);
		vect.normalize();
		this.dx = vect.x * speed;
		this.dy = vect.y * speed;
	}

	draw() {
		ellipse(this.x, this.y, 2);
	}

	update(elapsedTime) {
		this.x += this.dx;
		this.y += this.dy;
		this.dy += gravity;
	}
}
