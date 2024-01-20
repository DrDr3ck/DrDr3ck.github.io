class SpriteSheet {
	constructor() {
		this.sheets = {};
		this.totalImagesToLoad = 0;
		this.totalLoadedImages = 0;
	}

	/**
	 * Adds a sprite sheet to the dictionary
	 * @param {*} name name of the sprite sheet
	 * @param {*} filename filename image
	 * @param {*} width width of one sprite
	 * @param {*} height height of one sprite
	 */
	addSpriteSheet(name, filename, width, height) {
		loadImage(filename, (image) => {
			this.sheets[name] = {
				width: width,
				height: height,
				image: image,
				subimages: {},
			};
			this.totalLoadedImages++;
		});
		this.totalImagesToLoad++;
	}

	drawSprite(sheetname, index, x, y) {
		const sheet = this.sheets[sheetname];
		image(this.getImage(sheetname, index), x, y, sheet.width, sheet.height);
	}

	drawScaledSprite(sheetname, index, x, y, scale = 1) {
		const sheet = this.sheets[sheetname];
		image(
			this.getImage(sheetname, index),
			x,
			y,
			sheet.width * scale,
			sheet.height * scale,
			0,
			0,
			sheet.width,
			sheet.height
		);
	}

	getImage(sheetname, index) {
		const sheet = this.sheets[sheetname];
		if (!sheet.subimages[index]) {
			const tileX = index % (sheet.image.width / sheet.width);
			const tileY = Math.floor(index / (sheet.image.width / sheet.width));
			sheet.subimages[index] = sheet.image.get(
				tileX * sheet.width,
				tileY * sheet.height,
				sheet.width,
				sheet.height
			);
		}
		return sheet.subimages[index];
	}
}

class AnimatedImage {
	constructor(imageName, imageIndex, x, y, scale, fct) {
		this.position = { x: x, y: y };
		this.endPosition = { x: x, y: y };
		this.delta = { dx: 0, dy: 0 };
		this.state = null;
		this.indexMax = 0;
		this.index = 0;
		this.speed = 1;
		this.scale = scale;
		this.finalScale = scale;
		this.imageName = imageName;
		this.imageIndex = imageIndex;
		this.fct = fct;
	}

	/**
	 * Starts the animation
	 * @param endPosition final position of the Image
	 * @param speed in pixel per second
	 */
	startAnimation(endPosition, speed, finalScale = 0) {
		this.endPosition = endPosition;
		this.delta.x = endPosition.x - this.position.x;
		this.delta.y = endPosition.y - this.position.y;
		this.speed = speed;

		const distance = (x1, y1, x2, y2) => {
			return sqrt(pow(x2 - x1, 2) + pow(y2 - y1, 2));
		};
		const dist = distance(
			this.position.x,
			this.position.y,
			endPosition.x,
			endPosition.y
		);
		this.indexMax = dist / speed;
		this.index = 0;
		if (finalScale !== 0) {
			this.finalScale = finalScale;
		}
	}

	update(elapsedTime) {
		this.index = this.index + this.speed;
		if (this.index >= this.indexMax) {
			this.index = this.indexMax;
			if (this.fct) {
				this.fct();
			}
		}
	}

	draw() {
		if (this.indexMax === 0) {
			return;
		}
		const factor = this.index / this.indexMax;
		const X = this.position.x + this.delta.x * factor;
		const Y = this.position.y + this.delta.y * factor;
		const scale = this.scale + (this.finalScale - this.scale) * factor;
		spritesheet.drawScaledSprite(this.imageName, this.imageIndex, X, Y, scale);
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
		if (!sheet) {
			console.log(`Error: the sheetname '${sheetname}' does not exist`);
			return;
		}
		this.width = sheet.width;
		this.height = sheet.height;
		for (const frame of frameArray) {
			const x = (this.width * frame) % sheet.image.width;
			const y =
				Math.floor((this.width * frame) / sheet.image.width) * this.height;
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
		const index =
			this.index >= 0
				? Math.floor(this.index) % this.indexMax
				: Math.floor(-this.index) % this.indexMax;
		image(
			this.animations[this.state][index],
			this.position.x,
			this.position.y,
			this.width * this.scale,
			this.height * this.scale
		);
	}

	getBox() {
		return {
			x: this.position.x,
			y: this.position.y,
			w: this.width,
			h: this.height,
			top: this.position.y,
			bottom: this.position.y + this.height,
			left: this.position.x,
			right: this.position.x + this.width,
		};
	}
}
