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

class BButton extends UIComponent {
	constructor(x, y, text, callback) {
		const textSize = 60;
		super(x, y, 400, textSize * 1.2);
		this.text = text;
		this.textSize = textSize;
		this.callback = callback;
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

	clicked() {
		super.clicked();
		this.callback();
	}

	isClickable() {
		return this.enabled && this.visible;
	}
}

class BFloatingButton extends UIComponent {
	constructor(x, y, text, callback) {
		const textSize = 60;
		super(x, y, textSize * 1.2, textSize * 1.2);
		this.text = text;
		this.textSize = textSize;
		this.callback = callback;
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

	clicked() {
		super.clicked();
		this.callback();
	}

	isClickable() {
		return this.enabled && this.visible;
	}
}

class BMenuButton extends UIComponent {
	constructor(x, y, img, callback) {
		super(x, y, 100, 100);
		this.img = img;
		this.callback = callback;
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
		this.callback();
	}

	isClickable() {
		return this.enabled && this.visible;
	}
}
