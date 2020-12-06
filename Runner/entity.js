class EntityBase {
	constructor(speed) {
		this.x = getRandomIntInclusive(windowWidth + 10, windowWidth + 500);
		this.y = windowHeight - groundLevel;
		this.speed = speed; // pixels per frame
	}

	isBonus() {
		return false;
	}

	update(elapsedTime) {
		this.x -= this.speed * globalSpeed;
	}
}

class Mountain extends EntityBase {
	constructor(speed) {
		super(speed);
		this.height = getRandomIntInclusive(150, 500);
		this.x = 800 + this.height;
		const redBlue = getRandomIntInclusive(216, 238);
		this.color = [ redBlue, getRandomIntInclusive(130, 191), redBlue ];
	}

	draw() {
		fill(this.color[0], this.color[1], this.color[2]);
		triangle(
			this.x - this.height,
			windowHeight,
			this.x - this.height / 2,
			windowHeight - this.height,
			this.x,
			windowHeight
		);
	}
}

class Volcano extends Mountain {
	constructor(speed) {
		super(speed);
		this.smoke = [];
	}

	draw() {
		this.addSmokeParticle();
		push();
		noStroke();
		this.smoke.forEach((particle) => {
			fill(128, 128, 128, particle.alpha);
			ellipse(this.x+particle.x, particle.y, 10);
		});
		pop();
		super.draw();
	}

	addSmokeParticle() {
		this.smoke.push({
			x: - this.height / 2,
			y: windowHeight - this.height + 10,
			vx: random(-1, 1),
			vy: random(-5, -1),
			alpha: 255
		});
	}

	update(elapsedTime) {
		super.update(elapsedTime);
		for( let i = this.smoke.length-1; i >= 0; i-- ) {
			const particle = this.smoke[i];
			particle.x += particle.vx;
			particle.y += particle.vy;
			particle.alpha -= 5;
			if (particle.y < -10 || particle.alpha <= 0 ) {
				this.smoke.splice(i,1);
			}
		}
	}
}

class Tree extends EntityBase {
	constructor(speed) {
		super(speed);
	}

	draw() {
		fill(139, 69, 19);
		rect(this.x, this.y - 50, 25, 50);
	}

	box() {
		return { x: this.x, y: this.y - 50, width: 25, height: 50 };
	}
}

class Diamond extends EntityBase {
	constructor(speed) {
		super(speed);
	}

	draw() {
		fill(239, 239, 39);
		const size = 15;
		const dy = Math.sin(this.x / 50) * 5;
		beginShape();
		vertex(this.x, this.y - size - 5 + dy);
		vertex(this.x + size, this.y - size - size - 5 + dy);
		vertex(this.x + size * 2, this.y - size - 5 + dy);
		vertex(this.x + size, this.y + size - size - 5 + dy);
		endShape(CLOSE);
		fill(139, 139, 39);
		ellipse(this.x + size, this.y - size - 5 + dy, size * 0.7, size * 0.7);
	}

	isBonus() {
		return true;
	}

	box() {
		return { x: this.x, y: this.y - 5, width: 30, height: 30 };
	}
}

class SmallTree extends EntityBase {
	constructor(speed) {
		super(speed);
	}

	draw() {
		fill(139, 69, 19);
		rect(this.x, this.y - 120, 5, 50);
	}

	box() {
		return { x: this.x, y: this.y - 120, width: 5, height: 50 };
	}
}
