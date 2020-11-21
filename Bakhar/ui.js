function expect(check, text) {
	if (!check) {
		throw text;
	}
}

class UIManager {
	constructor() {
		this.components = [];
		this.currentUI = [];
		this.currentMenu = null;
		this.currentDialog = null;
		this.loggerContainer = null;
	}

	addLogger(text) {
		if (this.loggerContainer) {
			this.loggerContainer.addText(text);
		}
	}

	setUI(components) {
		this.currentUI.forEach((c) => (c.visible = false));
		this.currentUI = [ ...components ];
		this.currentUI.forEach((c) => (c.visible = true));
		this.setMenu(null);
	}

	setDialog(dialog) {
		if (this.currentDialog) {
			this.currentDialog.visible = false;
			this.currentDialog.components.forEach((c) => (c.visible = false));
		}
		this.currentDialog = dialog;
		if (this.currentDialog) {
			this.currentDialog.visible = true;
			this.currentDialog.components.forEach((c) => (c.visible = true));
		}
	}

	setMenu(menu) {
		if (this.currentMenu) {
			this.currentMenu.closeMenu();
		}
		this.currentMenu = menu;
		if (this.currentMenu) {
			this.currentMenu.openMenu();
		}
	}

	processInput() {
		let over = false;
		if (this.currentDialog) {
			this.currentDialog.components.forEach((c) => {
				c.over = c.mouseOver(mouseX - this.currentDialog.x, mouseY - this.currentDialog.y);
				over = over || (c.over && c.isClickable());
			});
		} else {
			this.currentUI.forEach((c) => {
				c.over = c.mouseOver(mouseX, mouseY);
				over = over || (c.over && c.isClickable());
			});
		}
		if (over) {
			cursor('pointer');
		} else {
			cursor('default');
		}
	}

	draw() {
		this.currentUI.forEach((c) => {
			c.draw();
		});
		if (this.currentDialog) {
			this.currentDialog.draw();
		}
		this.loggerContainer.draw();
	}

	mouseClicked() {
		let overComponent = null;
		if (this.currentDialog) {
			this.currentDialog.components.forEach((c) => {
				if (!c.visible) {
					return;
				}
				if (c.over) {
					overComponent = c;
					return;
				}
			});
		} else {
			this.currentUI.forEach((c) => {
				if (!c.visible) {
					return;
				}
				if (c.over) {
					overComponent = c;
					return;
				}
			});
		}
		if (overComponent && overComponent.enabled) {
			toolManager.setTool(null);
			overComponent.clicked();
		}
	}

	update(elapsedTime) {
		this.components.forEach((c) => {
			c.update(elapsedTime);
		});
		if (this.currentDialog) {
			this.currentDialog.update(elapsedTime);
		}
		this.loggerContainer.update(elapsedTime);
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
		uiManager.components.push(this);
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

	setTextSize(size) {
		this.w = size * 1.2;
		this.h = size * 1.2;
		this.textSize = size;
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

	// callback
	clickMenu() {
		if (this.open) {
			uiManager.setMenu(null);
		} else {
			uiManager.setMenu(this);
		}
	}

	prepareItems() {
		this.dialogY = 630 - Math.ceil(this.children.length / this.nbColumns) * 110;
		for (let i = 0; i < this.children.length; i++) {
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

		if (this.title && this.over) {
			textSize(12);
			textAlign(CENTER, CENTER);
			noStroke();
			drawText(this.title, this.x + this.w / 2, this.y + this.h - 12);
		}

		if (this.open) {
			fill(9, 67, 18);
			stroke(188, 255, 219);
			strokeWeight(2);
			// display a dialog to draw childrens
			const nbRows = Math.ceil(this.children.length / this.nbColumns);
			rect(
				this.dialogX,
				this.dialogY,
				Math.min(this.nbColumns, this.children.length) * 110 + 10,
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
		this.children.forEach((c) => (c.visible = true));
		const index = uiManager.currentUI.indexOf(this);
		if (index >= 0) {
			uiManager.currentUI.slice(index, 1);
			uiManager.currentUI.push(this);
		}
		uiManager.currentUI.push(...this.children);
		this.open = true;
	}

	closeMenu() {
		this.children.forEach((c) => (c.visible = false));
		uiManager.currentUI = uiManager.currentUI.filter((c) => !this.children.includes(c));
		this.open = false;
	}

	clicked() {
		super.clicked();
		this.clickMenu();
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

		if (this.title) {
			textSize(12);
			textAlign(CENTER, CENTER);
			noStroke();
			drawText(this.title, this.x + this.w / 2, this.y + this.h - 12);
		}
		pop();
	}

	clicked() {
		super.clicked();
		this.callback();
		uiManager.setMenu(null);
	}
}

class BItem extends UIComponent {
	constructor(title) {
		super(0, 0, 0, 0);
		this.title = title;
		this.count = 0;
	}

	draw() {
		push();
		const over = this.mouseOver(mouseX - 100, mouseY - 100);
		stroke(29, 105, 62);
		fill(9, 47, 18);
		strokeWeight(2);
		if (over) {
			stroke(188, 255, 219);
			strokeWeight(4);
		}
		rect(this.x, this.y, this.w, this.h, 5);
		noStroke();
		drawText(this.title, this.x + this.w / 2, this.y + 8);
		drawText(this.count, this.x + this.w / 2, this.y + this.h - 8);
		pop();
	}

	clicked() {
		super.clicked();
		this.callback();
	}
}

class BItemSelector extends UIComponent {
	constructor(x, y, nbCols, nbRows) {
		super(x, y, 0, 0);
		this.items = [];
		this.nbCols = nbCols;
		this.nbRows = nbRows;
		this.margin = 10;
		this.itemSize = 80;
		this.w = nbCols * (this.itemSize + this.margin) + this.margin + this.margin * 2; // space for "-/+"
		this.h = nbRows * (this.itemSize + this.margin) + this.margin;
		this.maxRows = 1;
		this.curRow = 0;
	}

	computeNextItemPosition() {
		const x = this.x + this.margin + this.items.length * (this.itemSize + this.margin);
		const y = this.y + this.margin;
		return { x: x, y: y };
	}

	addItem(item) {
		const position = this.computeNextItemPosition();
		this.items.push(item);
		item.x = position.x;
		item.y = position.y;
		item.w = this.itemSize;
		item.h = this.itemSize;
		this.maxRows = Math.ceil(this.items.length / this.nbCols);
		
	}

	draw() {
		if (!this.visible) {
			return;
		}
		push();
		stroke(29, 105, 62);
		strokeWeight(2);
		rect(this.x, this.y, this.w, this.h, 5);
		textSize(12);
		textAlign(CENTER);
		const iStart = 0;
		const iStop = Math.min(3,this.items.length);
		for( let i = iStart; i < iStop; i++ ) {
			this.items[i].draw();
		}
		drawText('-', this.x + this.w - 10, this.y + this.margin * 2, this.curRow > 0);
		drawText('+', this.x + this.w - 10, this.y + this.h - this.margin * 2, this.curRow+1 < this.maxRows);
		pop();
	}
}

class Dialog extends UIComponent {
	constructor(x, y, w, h) {
		super(x, y, w, h);
		this.components = [];
		this.totalPopupAnimationTime = 600;
		this.popupAnimation = this.totalPopupAnimationTime;
		this.startX = x;
		this.startY = y;
	}

	draw() {
		if (!this.visible) return;
		push();
		stroke(29, 105, 62);
		strokeWeight(2);
		fill(9, 47, 18);
		if (this.popupAnimation === 0) {
			translate(this.x, this.y);
			rect(0, 0, this.w, this.h, 5);
			this.components.forEach((c) => c.draw());
		} else {
			const percent = 1 - Math.max(this.popupAnimation, 0) / this.totalPopupAnimationTime;
			const x = this.startX - (this.startX - this.x) * percent;
			const y = this.startY - (this.startY - this.y) * percent;
			rect(
				x + this.w / 2 - this.w * percent / 2,
				y + this.h / 2 - this.h * percent / 2,
				this.w * percent,
				this.h * percent,
				5
			);
		}
		pop();
	}

	update(elapsedTime) {
		this.popupAnimation = Math.max(0, this.popupAnimation - elapsedTime);
	}
}

class LoggerContainer extends UIComponent {
	constructor(x, y, w, h) {
		super(x, y, w, h);
		this.loggers = [];
	}

	addText(text) {
		this.loggers.push(new Logger(text, 15000));
	}

	draw() {
		if (!this.visible) return;
		push();
		textSize(16);
		translate(this.x, this.y);
		/*
		stroke(128);
		noFill();
		rect(0, 0, this.w, this.h);
		*/
		const x = 0;
		// only display the 5 last messages
		const maxLogger = Math.min(5, this.loggers.length);
		const minLogger = Math.max(0, this.loggers.length - 5);
		let y = this.h + 10 - maxLogger * 20;
		for (let i = minLogger; i < this.loggers.length; i++) {
			const logger = this.loggers[i];
			if (y > this.h) return;
			logger.draw(x, y);
			y += 20;
		}
		pop();
	}

	update(elapsedTime) {
		this.loggers.forEach((logger) => {
			logger.time -= elapsedTime;
			logger.animation -= elapsedTime;
		});
		this.loggers = this.loggers.filter((logger) => logger.time > 0);
	}
}

class Logger {
	constructor(text, time) {
		this.text = text;
		const millisecondPerLetter = 150;
		this.totalAnimationTime = text.length * millisecondPerLetter;
		this.animation = this.totalAnimationTime;
		this.time = time + this.totalAnimationTime;
	}

	draw(x, y) {
		const percent = 1 - Math.max(this.animation, 0) / this.totalAnimationTime;
		const nbLetters = Math.round(this.text.length * percent);
		const text = this.text.slice(0, nbLetters);
		drawText(text, x, y);
	}
}

function test() {}

test();
