class UIManager {
	constructor() {
		this.components = [];
		this.currentUI = [];
		this.currentMenu = null;
	}

	setUI(components) {
		this.currentUI.forEach((c) => (c.visible = false));
		this.currentUI = components;
		this.currentUI.forEach((c) => (c.visible = true));
		this.setMenu(null);
	}

	setMenu(menu) {
		if( this.currentMenu ) {
			this.currentMenu.closeMenu();
		}
		this.currentMenu = menu;
		if( this.currentMenu ) {
		    this.currentMenu.openMenu();
		}
	}

	processInput() {
		let over = false;
		this.currentUI.forEach((c) => {
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
	constructor(title, x, y, img, nbColumns) {
		super(x, y, 100, 100);
		this.title = title;
		this.img = img;
		this.open = false;
		this.children = [];
		this.nbColumns = nbColumns;
		this.dialogX = x;
		this.dialogY = 0;
	}

	prepareItems() {
		this.dialogY = 630 - Math.ceil(this.children.length / this.nbColumns) * 110;
		for( let i=0; i < this.children.length; i++ ) {
			const child = this.children[i];
			child.x = this.getNextX(i);
			child.y = this.getNextY(i);
		}
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

		if( this.title && this.over ) {
			textSize(12);
			textAlign(CENTER, CENTER);
			noStroke();
			drawText(this.title, this.x+this.w/2, this.y+this.h-12);
		}

		if (this.open) {
			fill(9, 67, 18);
			stroke(188, 255, 219);
			strokeWeight(2);
			// display a dialog to draw childrens
			const nbRows = Math.ceil(this.children.length / this.nbColumns);
			console.log(nbRows);
			rect(
				this.dialogX,
				this.dialogY,
				Math.min(this.nbColumns,this.children.length) * 110 + 10,
				nbRows * 110 + 10
			);
		}
		pop();
	}

	getNextX(childIndex) {
		return this.dialogX + (childIndex % this.nbColumns) * 110 + 10;
	}

	getNextY(childIndex) {
		return this.dialogY + Math.floor(childIndex / this.nbColumns) * 110 + 10;
	}

	openMenu() {
		this.children.forEach(c => c.visible=true);
		manager.currentUI.push(...this.children);
		this.open = true;
		console.log(manager.currentUI.length);
	}

	closeMenu() {
		this.children.forEach(c => c.visible=false);
		manager.currentUI = manager.currentUI.filter(c => !this.children.includes(c));
		this.open = false;
		console.log(manager.currentUI.length);
	}

	clicked() {
		super.clicked();
		if (this.open) {
			manager.setMenu(null);
		} else {
			manager.setMenu(this);
		}
	}

	addItem(title, img, callback) {
		this.children.push(new BMenuItem(this, title, img, callback));
	}
}

class BMenuItem extends BButtonBase {
	constructor(menu, title, img, callback) {
		super(0, 0, 100, 100);
		this.title = title;
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

		if( this.title ) {
			textSize(12);
			textAlign(CENTER, CENTER);
			noStroke();
			drawText(this.title, this.x+this.w/2, this.y+this.h-12);
		}
		pop();
	}

	clicked() {
		super.clicked();
		manager.setMenu(null);
	}
}
