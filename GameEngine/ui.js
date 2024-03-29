class UIManager {
	constructor() {
		this.components = [];
		this.currentUI = [];
		this.currentMenu = null;
		this.currentDialog = null;
		this.loggerContainer = null;
		this.animations = [];
	}

	addLogger(text, time = 0) {
		if (this.loggerContainer) {
			if (time === 0) {
				this.loggerContainer.addText(text);
			} else {
				setTimeout(() => {
					this.loggerContainer.addText(text);
				}, time);
			}
		}
	}

	setUI(components) {
		this.currentUI.forEach((c) => (c.visible = false));
		this.currentUI = [...components];
		this.currentUI.forEach((c) => (c.visible = true));
		this.setMenu(null);
	}

	addAnimations(animations) {
		this.animations.push(animations);
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
				c.mouseOver(
					mouseX - this.currentDialog.x,
					mouseY - this.currentDialog.y
				);
				over = over || (c.over && c.isClickable());
			});
		} else {
			this.currentUI.forEach((c) => {
				c.mouseOver(mouseX, mouseY);
				over = over || (c.over && c.isClickable());
			});
		}
		if (over) {
			cursor("pointer");
		} else {
			if (toolManager && toolManager.currentTool) {
				cursor(CROSS);
			} else {
				cursor("default");
			}
		}
	}

	drawLogger() {
		push();
		textAlign(LEFT, BOTTOM);
		this.loggerContainer.draw();
		pop();
	}

	draw(drawLogger = true) {
		this.currentUI.forEach((c) => {
			c.draw();
		});
		this.animations.forEach((animations) =>
			animations.forEach((animation) => animation.draw())
		);
		if (this.currentDialog) {
			this.currentDialog.draw();
		}
		if (drawLogger) {
			this.drawLogger();
		}
	}

	mouseClicked() {
		let overComponent = null;
		if (this.currentDialog) {
			this.currentDialog.components.forEach((c) => {
				if (!c.visible) {
					return true;
				}
				const curComponent = c.getOver();
				if (curComponent) {
					overComponent = curComponent;
					return true;
				}
			});
		} else {
			this.currentUI.forEach((c) => {
				if (!c.visible) {
					return true;
				}
				if (c.over) {
					overComponent = c;
					return true;
				}
			});
		}
		if (overComponent && overComponent.enabled) {
			if (toolManager) {
				toolManager.setTool(null);
			}
			overComponent.clicked();
			return true;
		}
		return false;
	}

	touchStarted() {
		return this.mouseClicked();
	}

	update(elapsedTime) {
		this.components.forEach((c) => {
			c.update(elapsedTime);
		});
		if (this.animations.length > 0) {
			let animations = this.animations[0];
			animations = animations.filter((animation) => animation.time > 0);
			animations.forEach((animation) => animation.update(elapsedTime));
			if (animations.length === 0) {
				this.animations.shift();
			}
		}
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
		this.scale = 1;
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
		if (mx > this.x + this.w * this.scale) return false;
		if (mx < this.x) return false;
		if (my > this.y + this.h * this.scale) return false;
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

class BInteractiveButtonBase extends BButtonBase {
	constructor(x, y, w, h, callback) {
		super(x, y, w, h);
		this.callback = callback;
	}

	clicked() {
		super.clicked();
		this.callback();
	}
}

class BButtonTextBase extends BInteractiveButtonBase {
	// pure virtual
	constructor(x, y, w, h, text, callback) {
		super(x, y, w, h, callback);
		this.text = text;
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
		super(x, y, 0, 0, text, callback);
		this.setTextSize(60);
	}

	setTextSize(textSize) {
		this.textSize = textSize;
		this.w = 400;
		this.h = textSize * 1.2;
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

		rect(
			this.x + this.w / 2,
			this.y - this.h / 2,
			this.w,
			this.h + extend,
			fRadius,
			lRadius
		);
		if (this.over) {
			stroke(188, 255, 219);
			strokeWeight(2);
		} else {
			noStroke();
		}
		const deltaY = this.textSize < 30 ? 4 : 0;
		drawText(
			this.text,
			this.x + this.w / 2,
			this.y - this.h / 2 - deltaY,
			this.enabled
		);
	}
}

class BFloatingButton extends BButtonTextBase {
	constructor(x, y, text, callback) {
		const textSize = 60;
		super(x, y, textSize * 1.2, textSize * 1.2, text, callback);
		this.textSize = textSize;
		this.checked = true;
		this.previewCheck = false;
		this.color = { r: 9, g: 47, b: 18 };
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
		const factor = this.enabled ? 1 : 1.5;
		fill(this.color.r * factor, this.color.g * factor, this.color.b * factor);
		ellipse(
			this.x + this.w / 2,
			this.y - this.h / 2,
			this.w + extend,
			this.h + extend
		);

		push();
		if (this.over) {
			stroke(188, 255, 219);
			strokeWeight(Math.ceil(this.textSize / 30));
		} else {
			noStroke();
		}
		textAlign(CENTER, CENTER);
		textSize(this.textSize);
		drawText(this.text, this.x + this.w / 2, this.y - this.h / 2);
		pop();

		if (this.previewCheck) {
			if (this.over) {
				if (this.checked) {
					line(this.x + 6, this.y - this.h, this.x + this.w - 6, this.y);
				}
			} else {
				if (!this.checked) {
					line(this.x + 6, this.y - this.h, this.x + this.w - 6, this.y);
				}
			}
		}
	}
}

class BFloatingSwitchButton extends BFloatingButton {
	constructor(x, y, text, callback) {
		super(x, y, text, callback);
		this.previewCheck = true;
	}
}

class BImageButton extends BInteractiveButtonBase {
	constructor(x, y, img, callback) {
		super(x, y, img.width, img.height, callback);
		this.img = img;
		this.scale = 1;
	}

	doDraw() {
		push();
		if (this.over) {
			tint(255, 200);
		}
		if (this.scale === 1) {
			image(this.img, this.x, this.y, this.w, this.h);
		} else {
			image(
				this.img,
				this.x,
				this.y,
				this.w * this.scale,
				this.h * this.scale,
				0,
				0,
				this.w,
				this.h
			);
		}
		pop();
	}
}

class BImageBorderButton extends BImageButton {
	constructor(x, y, img, callback) {
		super(x, y, img, callback);
		this.color = { r: 9, g: 47, b: 18 };
	}

	doDraw() {
		let extend = 0;
		push();
		if (this.over) {
			stroke(188, 255, 219);
			strokeWeight(3);
			extend = 16;
		} else {
			stroke(29, 105, 62);
			strokeWeight(1);
		}
		const factor = this.enabled ? 1 : 1.5;
		fill(this.color.r * factor, this.color.g * factor, this.color.b * factor);
		rect(
			this.x - extend / 2,
			this.y - extend / 2,
			this.w + extend,
			this.h + extend,
			5
		);
		pop();
		super.doDraw();
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
		uiManager.currentUI = uiManager.currentUI.filter(
			(c) => !this.children.includes(c)
		);
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

class BMenuItem extends BInteractiveButtonBase {
	constructor(menu, title, img, callback) {
		super(0, 0, 100, 100, callback);
		this.title = title;
		this.img = img;
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
		this.w =
			nbCols * (this.itemSize + this.margin) + this.margin + this.margin * 2; // space for "-/+"
		this.h = nbRows * (this.itemSize + this.margin) + this.margin;
		this.maxRows = 1;
		this.curRow = 0;
		this.minus = new BFloatingButton(
			this.x + this.w - this.margin,
			this.y + this.margin * 2,
			"-",
			() => {
				this.curRow--;
				this.checkNavigators();
			}
		);
		this.minus.setTextSize(12);
		this.minus.visible = true;
		this.plus = new BFloatingButton(
			this.x + this.w - this.margin,
			this.y + this.h - this.margin * 2,
			"+",
			() => {
				this.curRow++;
				this.checkNavigators();
			}
		);
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
		const x =
			this.x +
			this.margin +
			(this.components.length % this.nbCols) * (this.itemSize + this.margin);
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
			this.components[i].doDraw();
		}
		this.minus.draw();
		this.plus.draw();
	}
}

class Dialog extends UIContainer {
	constructor(x, y, w, h) {
		super(x, y, w, h);
		this.totalPopupAnimationTime = 600;
		this.popupAnimation = this.totalPopupAnimationTime;
		this.startX = x;
		this.startY = y;
		this.transparency = 160;
	}

	doDraw() {
		stroke(29, 105, 62);
		strokeWeight(2);
		fill(9, 47, 18);
		const percent =
			1 - Math.max(this.popupAnimation, 0) / this.totalPopupAnimationTime;
		background(10, 10, 10, percent * this.transparency);
		if (this.popupAnimation === 0) {
			translate(this.x, this.y);
			rect(0, 0, this.w, this.h, 5);
			this.components.forEach((c) => c.draw());
		} else {
			const x = this.startX - (this.startX - this.x) * percent;
			const y = this.startY - (this.startY - this.y) * percent;
			rect(
				x + this.w / 2 - (this.w * percent) / 2,
				y + this.h / 2 - (this.h * percent) / 2,
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
		this.drawBox = false;
		this.maxLines = 5;
		this.textSize = 16;
	}

	addText(text) {
		this.loggers.push(new Logger(text, 15000));
	}

	doDraw() {
		noStroke();
		textSize(this.textSize);
		translate(this.x, this.y);
		if (this.drawBox) {
			push();
			stroke(0);
			strokeWeight(2);
			noFill();
			rect(0, 0, this.w, this.h);
			pop();
		}
		const x = 0;
		// only display the 5 last messages
		const maxLogger = Math.min(this.maxLines, this.loggers.length);
		const minLogger = Math.max(0, this.loggers.length - this.maxLines);
		let y = this.h - 10 - maxLogger * this.textSize + 2;
		for (let i = minLogger; i < this.loggers.length; i++) {
			const logger = this.loggers[i];
			if (y > this.h) return;
			logger.draw(x, y);
			y += this.textSize + 2;
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

function dist(x1, y1, x2, y2) {
	return sqrt(pow(x2 - x1, 2) + pow(y2 - y1, 2));
}

class Animation {
	constructor(src, dst, speed, callback = null) {
		this.sourcePosition = src;
		this.destinationPosition = dst;
		this.speed = speed; // nb pixels per sec.
		this.x = src.X;
		this.y = src.Y;
		const distance = dist(src.X, src.Y, dst.X, dst.Y);
		this.originTime = 100 * (distance / this.speed);
		this.time = this.originTime;
		this.callback = callback;
	}

	update(elapsedTime) {
		this.time = Math.max(0, this.time - elapsedTime);
		const coef = this.time === 0 ? 0 : this.time / this.originTime;
		this.x =
			this.sourcePosition.X +
			(this.destinationPosition.X - this.sourcePosition.X) * (1 - coef);
		this.y =
			this.sourcePosition.Y +
			(this.destinationPosition.Y - this.sourcePosition.Y) * (1 - coef);
		if (this.time === 0 && this.callback) {
			this.callback();
			this.callback = null;
		}
	}

	draw() {
		push();
		this.doDraw();
		pop();
	}
}

class MoveAnimation extends Animation {
	constructor(src, dst, speed, img, callback) {
		super(src, dst, speed, callback);
		this.img = img;
		this.w = img.width;
		this.h = img.height;
		this.scale = 1;
	}

	doDraw() {
		if (this.scale === 1) {
			image(this.img, this.x, this.y, this.w, this.h);
		} else {
			image(
				this.img,
				this.x,
				this.y,
				this.w * this.scale,
				this.h * this.scale,
				0,
				0,
				this.w,
				this.h
			);
		}
	}
}

function test() {}

test();
