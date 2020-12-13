class SpriteSheet {
	constructor() {
		this.sheets = {};
	}

	/**
	 * Adds a sprite sheet to the dictionary
	 * @param {*} name name of the sprite sheet
	 * @param {*} image image
	 * @param {*} width width of one sprite
	 * @param {*} height height of one sprite
	 */
	addSpriteSheet(name, image, width, height) {
		this.sheets[name] = { width: width, height: height, image: image };
	}

	drawSprite(sheetname, index, x, y) {
		const sheet = this.sheets[sheetname];
		image(sheet.image.get(sheet.width * index, 0, sheet.width, sheet.height), x, y, sheet.width, sheet.height);
	}
}

class Sprite {
	constructor(x, y) {
		this.position = { x: x, y: y };
		this.animations = {};
		this.state = null;
		this.indexMax = 0;
		this.index = 0;
		this.speed = 0.1;
		this.scale = 1;
	}

	addAnimation(name, sheetname, frameArray, frameSec, loop) {
		let animations = [];
		const sheet = spritesheet.sheets[sheetname];
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
	}

	draw() {
		if (!this.state) return;
		const index = this.index >= 0 ? Math.floor(this.index) % this.indexMax : Math.floor(-this.index) % this.indexMax;
		image(
			this.animations[this.state][index],
			this.position.x,
			this.position.y,
			this.width * this.scale,
			this.height * this.scale
		);
	}
}
