class EntityBase {
	constructor(speed) {
		this.x = getRandomIntInclusive(810, 900);
		this.speed = speed; // pixels per frame
	}

	update(elapsedTime) {
		this.x -= this.speed;
	}
}

class Tree extends EntityBase {
	constructor(speed) {
		super(speed);
	}

	draw() {
		fill(139, 69, 19);
		rect(this.x, height - margin - 50, 25, 50);
	}

	box() {
		return { x: this.x, y: height - margin - 50, width: 25, height: 50 };
	}
}

class SmallTree extends EntityBase {
	constructor(speed) {
		super(speed);
	}

	draw() {
		fill(139, 69, 19);
		rect(this.x, height - margin - 120, 5, 50);
	}

	box() {
		return null; //{ x: this.x, y: height - margin - 120, width: 5, height: 50 };
	}
}