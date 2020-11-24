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
				c.mouseOver(mouseX - this.currentDialog.x, mouseY - this.currentDialog.y);
				over = over || (c.over && c.isClickable());
			});
		} else {
			this.currentUI.forEach((c) => {
				c.mouseOver(mouseX, mouseY);
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
				const curComponent = c.getOver();
				if (curComponent) {
					overComponent = curComponent;
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

	getOver() {
		if (this.over) {
			return this;
		}
		return null;
	}

	draw() {
		if (this.visible) {
			push();
			this.doDraw();
			pop();
		}
	}

	mouseOver(mx, my) {
		this.over = false;
		if (!this.enabled || !this.visible) {
			return false;
		}
		if (mx > this.x + this.w) return false;
		if (mx < this.x) return false;
		if (my > this.y + this.h) return false;
		if (my < this.y) return false;
		this.over = true;
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

class UIContainer extends UIComponent {
	constructor(x, y, w, h) {
		super(x, y, w, h);
		this.components = [];
	}

	mouseOver(mx, my) {
		this.over = false;
		this.clickable = false;
		this.components.forEach((c) => {
			c.mouseOver(mx, my);
			if (c.over) {
				this.over = true;
				this.clickable = true; //c.isClickable();
			}
		});
		return this.over;
	}

	getOver() {
		if (this.over) {
			return this;
		}
		return null;
	}

	doDraw() {
		this.components.forEach((c) => c.draw());
	}

	update(elapsedTime) {
		this.components.forEach((c) => c.update(elapsedTime));
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
		this.over = false;
		if (!this.enabled || !this.visible) {
			return false;
		}
		if (mx > this.x + this.w) return false;
		if (mx < this.x) return false;
		if (my < this.y - this.h) return false;
		if (my > this.y) return false;
		this.over = true;
		return true;
	}
}

class BButton extends BButtonTextBase {
	constructor(x, y, text, callback) {
		const textSize = 60;
		super(x, y, 400, textSize * 1.2, text, callback);
		this.textSize = textSize;
	}

	doDraw() {
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

	doDraw() {
		let extend = 0;
		if (this.over) {
			stroke(188, 255, 219);
			strokeWeight(Math.ceil(this.textSize / 15));
			extend = Math.ceil(this.textSize / 5);
		} else {
			stroke(29, 105, 62);
			strokeWeight(Math.ceil(this.textSize / 30));
		}
		fill(9, 47, 18);

		ellipse(this.x + this.w / 2, this.y - this.h / 2, this.w + extend, this.h + extend);
		if (this.over) {
			stroke(188, 255, 219);
			strokeWeight(Math.ceil(this.textSize / 30));
		} else {
			noStroke();
		}
		textAlign(CENTER, CENTER);
		textSize(this.textSize);
		drawText(this.text, this.x + this.w / 2, this.y - this.h / 2);
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

	doDraw() {
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

	doDraw() {
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

	doDraw() {
		stroke(29, 105, 62);
		fill(9, 47, 18);
		strokeWeight(2);
		if (this.over) {
			stroke(188, 255, 219);
			strokeWeight(4);
		}
		rect(this.x, this.y, this.w, this.h, 5);
		noStroke();
		drawText(this.title, this.x + this.w / 2, this.y + 8);
		drawText(this.count, this.x + this.w / 2, this.y + this.h - 8);
	}

	clicked() {
		super.clicked();
		this.callback();
	}
}

class BItemSelector extends UIContainer {
	constructor(x, y, nbCols, nbRows) {
		super(x, y, 0, 0);
		this.nbCols = nbCols;
		this.nbRows = nbRows;
		this.margin = 10;
		this.itemSize = 80;
		this.w = nbCols * (this.itemSize + this.margin) + this.margin + this.margin * 2; // space for "-/+"
		this.h = nbRows * (this.itemSize + this.margin) + this.margin;
		this.maxRows = 1;
		this.curRow = 0;
		this.minus = new BFloatingButton(this.x + this.w - this.margin, this.y + this.margin * 2, '-', () => {
			this.curRow--;
			this.checkNavigators();
		});
		this.minus.setTextSize(12);
		this.minus.visible = true;
		this.plus = new BFloatingButton(this.x + this.w - this.margin, this.y + this.h - this.margin * 2, '+', () => {
			this.curRow++;
			this.checkNavigators();
		});
		this.plus.setTextSize(12);
		this.plus.visible = true;
		this.checkNavigators();

		this.clickable = false;
	}

	getOver() {
		if (this.over) {
			if (this.plus.over) {
				return this.plus;
			}
			if (this.minus.over) {
				return this.minus;
			}
			return this;
		}
		return null;
	}

	computeNextItemPosition() {
		const x = this.x + this.margin + (this.components.length % this.nbCols) * (this.itemSize + this.margin);
		const y = this.y + this.margin;
		return { x: x, y: y };
	}

	mouseOver(mx, my) {
		this.over = super.mouseOver(mx, my);
		if (!this.over) {
			if (this.plus.mouseOver(mx, my) || this.minus.mouseOver(mx, my)) {
				this.over = true;
				this.clickable = true;
			}
		}
		return this.over;
	}

	isClickable() {
		return this.clickable;
	}

	checkNavigators() {
		this.minus.enabled = this.curRow > 0;
		this.plus.enabled = this.curRow + 1 < this.maxRows;
		const iStart = this.curRow * this.nbCols;
		const iStop = Math.min(iStart + this.nbCols, this.components.length);
		for (let i = 0; i < this.components.length; i++) {
			const visibility = i >= iStart && i < iStop;
			this.components[i].visible = visibility;
		}
	}

	addItem(item) {
		const position = this.computeNextItemPosition();
		this.components.push(item);
		item.x = position.x;
		item.y = position.y;
		item.w = this.itemSize;
		item.h = this.itemSize;
		this.maxRows = Math.ceil(this.components.length / this.nbCols);
	}

	doDraw() {
		stroke(29, 105, 62);
		strokeWeight(2);
		rect(this.x, this.y, this.w, this.h, 5);
		textSize(12);
		textAlign(CENTER);
		const iStart = this.curRow * this.nbCols;
		const iStop = Math.min(iStart + this.nbCols, this.components.length);
		for (let i = iStart; i < iStop; i++) {
			this.components[i].visible = true;
			this.components[i].doDraw();
		}
		this.minus.draw();
		this.plus.draw();
	}
}

class BCraft extends UIComponent {
	constructor(x, y) {
		const craftSize = 80;
		super(x, y, (craftSize+10)*3+10, craftSize+20);
		this.recipe = [];
		this.craftSize = craftSize;
	}

	setRecipe(recipe) {
		this.recipe = recipe;
	}

	doDraw() {
		stroke(29, 105, 62);
		strokeWeight(2);
		rect(this.x, this.y, this.w, this.h, 5);
		let x = this.x+10;
		const y = this.y+10;
		textSize(12);
		textAlign(CENTER);
		this.recipe.forEach(
			item=>{
				rect(x,y,this.craftSize, this.craftSize,5);
				push();
				noStroke();
				drawText(item.name,x + this.craftSize / 2, y + 8);
				drawText(item.count, x + this.craftSize / 2, y + this.craftSize - 8);
				pop();
				x += this.craftSize + 10;
			}
		);
	}
}

class Dialog extends UIContainer {
	constructor(x, y, w, h) {
		super(x, y, w, h);
		this.totalPopupAnimationTime = 600;
		this.popupAnimation = this.totalPopupAnimationTime;
		this.startX = x;
		this.startY = y;
	}

	doDraw() {
		stroke(29, 105, 62);
		strokeWeight(2);
		fill(9, 47, 18);
		const percent = 1 - Math.max(this.popupAnimation, 0) / this.totalPopupAnimationTime;
		background(10, 10, 10, percent * 160);
		if (this.popupAnimation === 0) {
			translate(this.x, this.y);
			rect(0, 0, this.w, this.h, 5);
			this.components.forEach((c) => c.draw());
		} else {
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

	doDraw() {
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
