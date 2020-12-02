class SpriteSheet {
	constructor() {
		this.sheets = {};
	}

	addSpriteSheet(name, image, width, height) {
		this.sheets[name] = { width: width, height: height, image: image };
	}
}

const gravity = 2;

class Sprite {
	constructor(x, y) {
		this.position = { x: x, y: y };
		this.ground = y;
		this.animations = {};
		this.state = null;
		this.indexMax = 0;
		this.index = 0;
		this.speed = 0.1;
		this.vy = 0;
	}

	addAnimation(name, frameArray, frameSec, loop) {
		let animations = [];
		const sheet = spritesheet.sheets[name];
		this.width = sheet.width;
		this.height = sheet.height;
		for (const frame of frameArray) {
			const x = this.width * frame;
			const y = 0;
			animations.push(sheet.image.get(x, y, this.width, this.height));
		}
		this.animations[name] = animations;
		if (!this.state) {
			this.playAnimation(name);
		}
	}

	playAnimation(name) {
		this.state = name;
		this.indexMax = this.animations[name].length;
		this.index = 0;
	}

	update(elapsedTime) {
		this.index = this.index + this.speed;
		this.position.y = Math.min(this.ground, this.position.y + this.vy);
		this.vy = this.vy + gravity;
	}

	draw() {
		if (!this.state) return;
		const index = Math.floor(this.index) % this.indexMax;
        image(this.animations[this.state][index], this.position.x, this.position.y, this.width, this.height);
        /*
        push();
        noFill();
        stroke(128);
        rect(this.position.x+10, this.position.y, this.width-22, this.height);
        pop();
        */
	}

	jump() {
		if (this.position.y === this.ground) {
			this.vy = -28;
		}
	}

	collide(rect2) {
        const rect1 = {x: this.position.x+10, y: this.position.y, width: this.width-22, height: this.height};
		if (
			rect1.x < rect2.x + rect2.width &&
			rect1.x + rect1.width > rect2.x &&
			rect1.y < rect2.y + rect2.height &&
			rect1.height + rect1.y > rect2.y
		) {
			return true;
		}
		return false;
	}
}
