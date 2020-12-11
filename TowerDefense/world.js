class World {
	constructor() {
		this.init();
		this.towerWidth = 100;
		this.towerHeight = 300;
		this.groundLevel = height-100;

		this.towerX = width / 2 - this.towerWidth / 2;
		this.towerY = this.groundLevel - this.towerHeight;
	}

	init() {
		this.life = 100;
		this.maxLife = this.life;
		this.enemies = [];
		this.bullets = [];
		this.wave = 0;
	}

	initWave() {
		this.wave++;
		world.enemies = [ new GroundEnemy(-10, 0.1, 5), new GroundEnemy(-20, 0.1, 5), new GroundEnemy(width + 10, -0.08, 8) ];
	}

	hitTower(hitValue) {
		this.life = Math.max(0, this.life - hitValue);
	}

	fireBullet(toX, toY) {
		if (toX > this.towerX + this.towerWidth) {
			this.bullets.push(new Bullet({ X: this.towerX + this.towerWidth, Y: this.towerY }, { X: toX, Y: toY }, 2));
		} else if (toX < this.towerX) {
			this.bullets.push(new Bullet({ X: this.towerX, Y: this.towerY }, { X: toX, Y: toY }, 2));
		}
	}

	draw() {
		fill(150);
		rect(this.towerX, this.towerY, this.towerWidth, this.towerHeight);
		line(0, this.groundLevel, width, this.groundLevel);

		// life of tower
		fill(150, 0, 0);
		rect(this.towerX, this.groundLevel + 10, this.towerWidth, 5);
		fill(0, 150, 0);
		rect(this.towerX, this.groundLevel + 10, this.towerWidth * (this.life / this.maxLife), 5);

		// draw enemies
		this.enemies.forEach((enemy) => enemy.draw());
		// draw bullets
		this.bullets.forEach((bullet) => bullet.draw());

		// text
		push();
		textSize(30);
		fill(150);
		text(`Wave: ${this.wave|1}`,100,100);
		text(`Enemies left: ${this.enemies.length}`,500,100);
		pop();
	}

	update(elapsedTime) {
		// update bullets
		this.bullets.forEach((bullet) => {
			bullet.update(elapsedTime);
			// TODO: check if a bullet touches an enemy
			this.enemies.forEach((enemy) => {
				if( enemy.hit(bullet.x, bullet.y) ) {
					enemy.life--;
					bullet.y = width*2; // move bullet far away below the window
				}
			});
		});
		// remove bullets on the ground
		for (let i = this.bullets.length - 1; i >= 0; i--) {
			if (this.bullets[i].y > this.groundLevel) {
				this.bullets.splice(i, 1);
			}
		}
		if( this.enemies.length === 0 ) {
			return;
		}
		// remove dead enemies
		for (let i = this.enemies.length - 1; i >= 0; i--) {
			if (this.enemies[i].life <= 0) {
				this.enemies.splice(i, 1);
			}
		}
		if( this.enemies.length === 0 ) {
			//prepare to next wave
			uiManager.addLogger("Press SPACE for next wave")
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

class Enemy {
	constructor(x, y, speed, size) {
		this.x = x;
		this.y = y;
		this.speed = speed;
		this.size = size;
		this.life = 2;
		this.damage = 2;
	}

	draw() {
		fill(150, 50, 50);
		rect(this.x, this.y, this.size, this.size * 2);
	}

	update(elapsedTime) {
		this.x += this.speed;
	}

	hit(x,y) {
		if( x < this.x || x > this.x+this.size ) {
			return false;
		}
		if( y < this.y || y > this.y+this.size*2 ) {
			return false;
		}
		return true;
	}
}

class GroundEnemy extends Enemy {
	constructor(x,speed, size) {
		super(x,world.groundLevel - size * 2,speed,size);
	}
}

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
		fill(0);
		ellipse(this.x, this.y, 2);
	}

	update(elapsedTime) {
		this.x += this.dx;
		this.y += this.dy;
	}
}
