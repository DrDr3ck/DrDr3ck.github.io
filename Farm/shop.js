class Money {
	constructor() {
		this.copper = 0;
		this.silver = 0;
		this.gold = 0;
		this.platinum = 0;
	}

	addCopper(amountCopper) {
		// 100 copper = 1 silver
		this.copper += amountCopper;
		const amountSilver = this.copper / 100;
		// 100 silver = 1 gold
		this.silver += amountSilver;
		const amountGold = this.silver / 100;
		// 100 gold = 1 platinum
		this.gold += amountGold;
		const amountPlatinum = this.gold / 100;
		// you are rich !!
		this.platinum += amountPlatinum;
	}

	draw() {
		textAlign(RIGHT, CENTER);
		textSize(24);
		fill(0);
		noStroke();
		text(this.copper, 0, 40);
		spritesheet.drawSprite('farm_money', 0, 5, 32);
		text(this.silver, 0, 20);
		spritesheet.drawSprite('farm_money', 1, 5, 12);
		text(this.gold, 0, 0);
		spritesheet.drawSprite('farm_money', 2, 5, -8);
	}
}

class CatalogItem {
	constructor(name, image, price) {
		this.name = name;
		this.image = image;
		this.price = price;
	}
}

class CatalogCategory {
	constructor(name) {
		this.name = name;
		this.items = [];
	}

	addItem(item) {
		if (!this.getItem(item.name)) {
			this.items.push(item);
		}
	}

	getItem(itemName) {
		const find = this.items.filter((c) => c.name === itemName);
		if (find.length === 1) {
			return find[0];
		}
		return null;
	}
}

class Catalog {
	constructor() {
		this.categories = [];
	}

	addCategory(category) {
		if (!this.getCategory(category.name)) {
			this.categories.push(category);
		}
	}

	getCategory(categoryName) {
		const find = this.categories.filter((c) => c.name === categoryName);
		if (find.length === 1) {
			return find[0];
		}
		return null;
	}
}

class ShopDialog extends Dialog {
	constructor(x, y, w, h) {
		super(x, y, w, h);

		this.maxColumns = 6;
		this.maxRows = 2;

		this.category = 'seed';
		this.items = world.catalog.getCategory(this.category).items;

		this.curPage = 0;
		this.maxPage = Math.floor(this.items.length / (this.maxColumns * this.maxRows));
		this.curItem = null;
		this.nbCurItems = 1;

		// close button
		this.components.push(new BFloatingButton(w - 80, 80, '\u2716', () => this.popup()));
		// +/- buttons
		const plusButton = new BFloatingButton(w - 60, 250, '+', () => {
			this.nbCurItems++;
		});
		const minusButton = new BFloatingButton(w - 120, 250, '-', () => {
			this.nbCurItems = Math.max(1, this.nbCurItems - 1);
		});
		const plusMinusTextSize = 32;
		plusButton.setTextSize(plusMinusTextSize);
		minusButton.setTextSize(plusMinusTextSize);
		this.components.push(plusButton);
		this.components.push(minusButton);
		// prev/next page
		this.components.push(
			new BFloatingButton(10, h - 10, '<', () => {
				this.curPage = Math.max(0, this.curPage - 1);
			})
		);
		this.components.push(
			new BFloatingButton(w - 80, h - 10, '>', () => {
				this.curPage = Math.min(this.maxPage, this.curPage + 1);
			})
		);
	}

	popup() {
		if (this.visible) {
			uiManager.setDialog(null);
		} else {
			uiManager.setDialog(this);
		}
	}

	doDraw() {
		super.doDraw();
		fill(255);
		stroke(0);
		textSize(32);
		textAlign(LEFT, TOP);
		text('Vente', 10, 10);

		textAlign(RIGHT, TOP);
		text(this.nbCurItems, this.w - 60, 250);

		textAlign(CENTER, TOP);
		text(`${this.curPage + 1}/${this.maxPage + 1}`, this.w / 2, this.h - 80);

		textSize(16);
		for (let row = 0; row < this.maxRows; row++) {
			for (let column = 0; column < this.maxColumns; column++) {
				fill(255);
				stroke(0);
				// get item index
				const itemIndex = row * this.maxColumns + column + this.curPage * this.maxColumns * this.maxRows;
				const X = 10 + column * 80;
				const Y = 100 + 10 + row * 100;
				if (itemIndex >= this.items.length) {
					// no valid item
					rect(X, Y, 75, 75, 10);
					continue;
				}
				const item = this.items[itemIndex];
				// draw item
				rect(X, Y, 75, 75, 5);
				image(item.image, X + (75 - 48) / 2, Y + 5, 48, 48);
				fill(0);
				stroke(255);
				text(item.price, X + 75 / 2, Y + 75 - 16 - 5);
			}
		}
	}
}
