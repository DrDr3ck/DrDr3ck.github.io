class BSlotButton extends BImageButton {
	constructor(x, y, img, callback) {
		super(x, y, img, callback);
		this.item = null;
	}

	setItem(img) {
		this.item = img;
	}

	isAvailable() {
		return !this.item;
	}

	doDraw() {
		super.doDraw();
		if (this.item) {
			image(this.item.img, this.x + 8, this.y + 8, 48, 48);
			textSize(16);
			textAlign(RIGHT, TOP);
			fill(0);
			text(this.item.count, this.x + world.tileSize * world.scale - 2, this.y + 2);
		}
	}
}

class BShopButton extends BImageButton {
	constructor(x, y, img, price, occurrence, callback) {
		super(x, y, img, callback);
		this.w = 75;
		this.h = 75;
		this.price = price;
		this.occurrence = occurrence;
	}

	doDraw() {
		super.doDraw();
		// draw a rect and image
		fill(150, 111, 51);
		stroke(0);
		rect(this.x, this.y, this.w, this.h, 5);
		image(this.img, this.x + (this.w - 48) / 2, this.y + 5, 48, 48);
		// draw occurrence and price
		fill(0);
		noStroke();
		spritesheet.drawSprite('farm_money', 0, this.x + this.w - 20, this.y + this.h - 20);
		textSize(12);
		textAlign(RIGHT, TOP);
		text(this.price, this.x + this.w - 25, this.y + this.h - 16);
		textAlign(LEFT, TOP);
		text(this.occurrence, this.x + 5, this.y + 5);
	}
}
