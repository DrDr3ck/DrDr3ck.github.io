class EntityBase {
	constructor(speed) {
		this.x = getRandomIntInclusive(windowWidth+10, windowWidth+500);
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
		rect(this.x, height - groundLevel - 50, 25, 50);
	}

	box() {
		return { x: this.x, y: height - groundLevel - 50, width: 25, height: 50 };
	}
}

class Diamond extends EntityBase {
	constructor(speed) {
		super(speed);
	}

	draw() {
		fill(19, 39, 139);
		const size = 15;
		const dy = Math.sin(this.x/50) * 5;
		beginShape();
		vertex(this.x, height-groundLevel-size-5+dy);
		vertex(this.x+size, height-groundLevel-size-size-5+dy);
		vertex(this.x+size*2, height-groundLevel-size-5+dy);
		vertex(this.x+size, height-groundLevel+size-size-5+dy);
		endShape(CLOSE);
		fill(19, 39, 239);
		ellipse(this.x+size, height-groundLevel-size-5+dy,size*.7,size*.7);
	}

	isBonus() {
		return true;
	}

	box() {
		return { x: this.x, y: height - groundLevel - 5, width: 30, height: 30 };
	}
}

class SmallTree extends EntityBase {
	constructor(speed) {
        super(speed);
	}

	draw() {
		fill(139, 69, 19);
		rect(this.x, height - groundLevel - 120, 5, 50);
	}

	box() {
		return { x: this.x, y: height - groundLevel - 120, width: 5, height: 50 };
	}
}