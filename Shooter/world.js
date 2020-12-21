const gravity = 1;

class Player {
	constructor(x, y) {
		const sprite = new Sprite(x, y);
		sprite.addAnimation('idle', 'world', [ 0 ], FPS, true);
		sprite.addAnimation('wait1', 'world', [ 8, 9, 10, 11, 12, 13, 14, 15 ], FPS, true);
		sprite.addAnimation('wait2', 'world', [ 16, 17, 18, 19, 20, 21, 22, 23 ], FPS, true);
		sprite.addAnimation('wait3', 'world', [ 24, 25, 26, 27, 28, 29, 30, 31 ], FPS, true);
		sprite.addAnimation('left', 'world', [ 32, 33, 34, 35, 36, 37, 38, 39 ], FPS, true);
		sprite.addAnimation('right', 'world', [ 40, 41, 42, 43, 44, 45, 46, 47 ], FPS, true);
		sprite.speed = 0.4;
		this.sprite = sprite;

		this.vx = 0;
		this.vy = 0;
		this.inMove = true;
	}

	draw() {
		this.sprite.draw();
	}

	update(elapsedTime) {
		this.sprite.update(elapsedTime);
		const previousBox = this.sprite.getBox();
		this.sprite.position.y += this.vy;
		this.sprite.position.x += this.vx;
		const nextBox = this.sprite.getBox();
		// check if new position is colliding a wall
		world.walls.forEach((wall) => {
			if (wall.collide(nextBox)) {
				const correction = world.computePenetration(wall, previousBox, nextBox);
				this.sprite.position.x += correction.dx;
				this.sprite.position.y += correction.dy;
				this.inMove = correction.dx !== 0;
			}
		});
		world.platforms.forEach((platform) => {
			if (platform.collide(nextBox)) {
				if (this.vy >= 0 && -this.sprite.position.y + platform.y >= this.sprite.height * 0.75 - this.vy) {
					this.sprite.position.y = platform.y - this.sprite.height;
					this.vy = 0; // no more falling
					this.inMove = false;
				}
			}
		});
		this.vy = Math.min(15, this.vy + gravity);
	}
}

class Wall {
	constructor(x, y, w, h) {
		this.x = x;
		this.y = y;
		this.w = w;
		this.h = h;

		this.top = y;
		this.bottom = y + h;
		this.left = x;
		this.right = x + w;
	}

	draw() {
		push();
		fill(150, 50, 50);
		rect(this.x, this.y, this.w, this.h);
		pop();
	}

	getBox() {
		return {
			x: this.x,
			y: this.y,
			w: this.w,
			h: this.h,
			top: this.y,
			bottom: this.y + this.h,
			left: this.x,
			right: this.x + this.w
		};
	}

	collide(rect2) {
		if (!rect2) {
			return false;
		}
		const rect1 = this.getBox();
		if (
			rect1.x < rect2.x + rect2.w &&
			rect1.x + rect1.w > rect2.x &&
			rect1.y < rect2.y + rect2.h &&
			rect1.h + rect1.y > rect2.y
		) {
			return true;
		}
		return false;
	}

	// collision: https://katyscode.wordpress.com/2013/01/18/2d-platform-games-collision-detection-for-dummies/
}

class Platform extends Wall {
	constructor(x, y, w, h) {
		super(x, y, w, h);
	}

	draw() {
		push();
		fill(50, 150, 50);
		rect(this.x, this.y, this.w, this.h);
		pop();
	}
}

class World {
	constructor() {
		this.player1 = new Player(50, 150);
		this.player2 = new Player(windowWidth - 50 - 32, 150);
		this.walls = [
            new Wall(-100, windowHeight - 50, windowWidth + 200, 100),
            new Wall(-100, - 50, windowWidth + 200, 130),
            new Wall(-20, -100, 22, windowHeight + 200),
            new Wall(windowWidth-2, -100, 22, windowHeight + 200)
		];
		this.platforms = [];
	}

	// Calcule la distance de pénétration du `nextBox` dans le `wall` donné.
	computePenetration(wall, previousBox, nextBox) {
		let dx_correction = 0;
		let dy_correction = 0;
		if (previousBox.bottom <= wall.top && wall.top < nextBox.bottom) dy_correction = wall.top - nextBox.bottom;
		else if (previousBox.top >= wall.bottom && wall.bottom > nextBox.top) dy_correction = wall.bottom - nextBox.top;
		if (previousBox.right <= wall.left && wall.left < nextBox.right) dx_correction = wall.left - nextBox.right;
		else if (previousBox.left >= wall.right && wall.right > nextBox.left) dx_correction = wall.right - nextBox.left;
		return { dx: dx_correction, dy: dy_correction };
	}

	draw() {
		this.walls.forEach((wall) => wall.draw());
		this.platforms.forEach((platform) => platform.draw());
		this.player1.draw();
		this.player2.draw();
	}

	update(elapsedTime) {
		this.player1.update(elapsedTime);
		this.player2.update(elapsedTime);
	}
}
