class UIManager {
	constructor() {
		this.components = [];
		this.currentUI = [];
	}

	setUI(components) {
		this.currentUI.forEach((c) => (c.visible = false));
		this.currentUI = components;
		this.currentUI.forEach((c) => (c.visible = true));
	}

	processInput() {
		let over = false;
		this.components.forEach((c) => {
			c.over = c.mouseOver(mouseX, mouseY);
			over = over || (c.over && c.isClickable());
		});
		if (over) {
			cursor('pointer');
		} else {
			cursor('default');
		}
	}

	mouseClicked() {
		let overComponent = null;
		this.components.forEach((c) => {
			if (!c.visible) {
				return;
			}
			if (c.over) {
				overComponent = c;
				return;
			}
		});
		if (overComponent && overComponent.enabled) {
			overComponent.clicked();
		}
	}

	update(elapsedTime) {
		this.components.forEach((c) => {
			c.update(elapsedTime);
		});
	}
}

function drawText(string, x, y, enabled = true) {
	if (enabled) {
		fill(198, 255, 244);
	} else {
		fill(128, 198, 128);
	}
	text(string, x, y + 4);
}

class UIComponent {
	constructor(x, y, width, height) {
		this.x = x;
		this.y = y;
		this.w = width;
		this.h = height;
		this.over = false;
		this.enabled = true;
		this.visible = false;
		manager.components.push(this);
	}

	mouseOver(mx, my) {
		if (!this.enabled || !this.visible) {
			return false;
		}
		if (mx > this.x + this.w) return false;
		if (mx < this.x) return false;
		if (my > this.y + this.h) return false;
		if (my < this.y) return false;
		return true;
	}

	update(elapsedTime) {
		// virtual pure ?
	}

	clicked() {
		// virtual pure ?
	}

	isClickable() {
		return false;
	}
}

class BButtonBase extends UIComponent {
	// pure virtual
	constructor(x, y, w, h) {
		super(x, y, w, h);
	}

	clicked() {
		super.clicked();
	}

	isClickable() {
		return this.enabled && this.visible;
	}
}

class BButtonTextBase extends BButtonBase {
	// pure virtual
	constructor(x, y, w, h, text, callback) {
		super(x, y, w, h);
		this.text = text;
		this.callback = callback;
	}

	clicked() {
		super.clicked();
		this.callback();
	}

	mouseOver(mx, my) {
		if (!this.enabled || !this.visible) {
			return false;
		}
		if (mx > this.x + this.w) return false;
		if (mx < this.x) return false;
		if (my < this.y - this.h) return false;
		if (my > this.y) return false;
		return true;
	}
}

class BButton extends BButtonTextBase {
	constructor(x, y, text, callback) {
		const textSize = 60;
		super(x, y, 400, textSize * 1.2, text, callback);
		this.textSize = textSize;
	}

	draw() {
		if (!this.visible) {
			return;
		}
		push();
		textAlign(CENTER, CENTER);
		rectMode(CENTER);
		textSize(this.textSize);
		let fRadius = 5;
		let lRadius = 15;
		let extend = 0;
		if (this.over) {
			stroke(188, 255, 219);
			fRadius = 15;
			lRadius = 5;
			strokeWeight(4);
			extend = 12;
		} else {
			stroke(29, 105, 62);
			strokeWeight(2);
		}
		if (this.enabled) {
			fill(9, 47, 18);
		} else {
			fill(47, 67, 47);
		}

		rect(this.x + this.w / 2, this.y - this.h / 2, this.w, this.h + extend, fRadius, lRadius);
		if (this.over) {
			stroke(188, 255, 219);
			strokeWeight(2);
		} else {
			noStroke();
		}
		drawText(this.text, this.x + this.w / 2, this.y - this.h / 2, this.enabled);
		pop();
	}
}

class BFloatingButton extends BButtonTextBase {
	constructor(x, y, text, callback) {
		const textSize = 60;
		super(x, y, textSize * 1.2, textSize * 1.2, text, callback);
		this.textSize = textSize;
	}

	draw() {
		if (!this.visible) {
			return;
		}
		push();
		textAlign(CENTER, CENTER);
		textSize(this.textSize);
		let extend = 0;
		if (this.over) {
			stroke(188, 255, 219);
			strokeWeight(4);
			extend = 12;
		} else {
			stroke(29, 105, 62);
			strokeWeight(2);
		}
		fill(9, 47, 18);

		ellipse(this.x + this.w / 2, this.y - this.h / 2, this.w + extend, this.h + extend);
		if (this.over) {
			stroke(188, 255, 219);
			strokeWeight(2);
		} else {
			noStroke();
		}
		drawText(this.text, this.x + this.w / 2, this.y - this.h / 2);
		pop();
	}
}

class BMenu extends BButtonBase {
	constructor(x, y, img, nbColumns) {
		super(x, y, 100, 100);
		this.img = img;
		this.open = false;
		this.children = [];
		this.nbColumns = nbColumns;
		this.dialogX = 30;
		this.dialogY = this.prepareItems(0);
	}

	prepareItems(nb) {
		this.dialogY = 520 - Math.floor(nb / this.nbColumns) * 110;
	}

	draw() {
		if (!this.visible) {
			return;
		}
		push();
		fill(9, 47, 18);
		if (this.over) {
			stroke(188, 255, 219);
			strokeWeight(4);
		} else {
			stroke(29, 105, 62);
			strokeWeight(2);
		}
		rect(this.x, this.y, this.w, this.h, 5);

		if (this.open) {
			stroke(188, 255, 219);
			strokeWeight(2);
			// display a dialog to draw childrens
			rect(
				this.dialogX,
				this.dialogY,
				this.nbColumns * 110 + 10,
				Math.ceil(this.children.length / this.nbColumns) * 110 + 10
			);
		}
		pop();
	}

	getNextX() {
		return this.dialogX + (this.children.length % this.nbColumns) * 110 + 10;
	}

	getNextY() {
		return this.dialogY + Math.floor(this.children.length / this.nbColumns) * 110 + 10;
	}

	openMenu() {
		//this.children.forEach((c) => (c.visible = true));
		manager.currentUI.push(...this.children);
		this.open = true;
	}

	closeMenu() {
		//this.children.forEach((c) => (c.visible = false));
		manager.currentUI = manager.currentUI.filter(c => !this.children.includes(c));
		this.open = false;
	}

	clicked() {
		super.clicked();
		if (this.open) {
			this.closeMenu();
		} else {
			this.openMenu();
		}
	}

	addItem(img, callback) {
		this.children.push(new BMenuItem(this, img, callback));
	}
}

class BMenuItem extends BButtonBase {
	constructor(menu, img, callback) {
		let x = menu.getNextX();
		let y = menu.getNextY();
		super(x, y, 100, 100);
		this.img = img;
		this.callback = callback;
		this.visible = true;
		this.menu = menu;
	}
	draw() {
		if (!this.visible) {
			return;
		}
		push();
		fill(9, 47, 18);
		if (this.over) {
			stroke(188, 255, 219);
			strokeWeight(4);
		} else {
			stroke(29, 105, 62);
			strokeWeight(2);
		}
		rect(this.x, this.y, this.w, this.h, 5);
		pop();
	}

	clicked() {
		super.clicked();
		this.menu.closeMenu();
	}
}
