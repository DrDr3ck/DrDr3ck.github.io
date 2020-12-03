class EntityBase {
	constructor(speed) {
		this.x = getRandomIntInclusive(810, 900);
        this.speed = speed; // pixels per frame
	}

	update(elapsedTime) {
		this.x -= this.speed;
	}
}

class Mountain extends EntityBase {
    constructor(speed) {
        super(speed);
        this.height = getRandomIntInclusive(150, 500);
        this.x = 800+this.height;
        const redBlue = getRandomIntInclusive(216, 238);
        this.color = [redBlue,getRandomIntInclusive(130, 191),redBlue];
    }
    
    draw() {
		fill(this.color[0],this.color[1],this.color[2]);
		triangle(this.x-this.height,windowHeight, this.x-this.height/2, windowHeight-this.height, this.x,windowHeight);
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
		return { x: this.x, y: height - margin - 120, width: 5, height: 50 };
	}
}