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
			text(this.item.count, this.x+ world.tileSize*world.scale - 2, this.y+2);
		}
	}
}
