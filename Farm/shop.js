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
		const amountSilver = floor(this.copper / 100);
		if (amountSilver > 0) {
			this.copper -= amountSilver * 100;
		}
		// 100 silver = 1 gold
		this.silver += amountSilver;
		const amountGold = floor(this.silver / 100);
		if (amountGold > 0) {
			this.silver -= amountGold * 100;
		}
		// 100 gold = 1 platinum
		this.gold += amountGold;
		const amountPlatinum = floor(this.gold / 100);
		if (amountPlatinum > 0) {
			this.gold -= amountPlatinum * 100;
		}
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
	constructor(name, image, price, occurrence) {
		this.name = name;
		this.image = image;
		this.price = price;
		this.occurrence = occurrence;
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
		this.items.forEach((item, index) => {
			const row = floor(index / this.maxColumns);
			const column = index % this.maxColumns;
			const X = 10 + column * 80;
			const Y = 100 + 10 + row * 100;
			this.components.push(
				new BShopButton(X, Y, item, () => {
					this.setCurItem(item);
				})
			);
		});

		this.sellButton = new BSellButton(540, 300, () => {
			world.money.addCopper(this.sellButton.price);
			this.curItem.occurrence -= this.nbCurItems;
			// change inventory
			world.inventory.getCountedItem(this.curItem.name, this.category).count -= this.nbCurItems;
			// reset item
			this.setCurItem(null);
		});
		this.components.push(this.sellButton);
		this.sellButton.visible = false;

		this.curPage = 0;
		this.maxPage = Math.floor(this.items.length / (this.maxColumns * this.maxRows));
		this.curItem = null;
		this.nbCurItems = 1;

		// close button
		this.components.push(new BFloatingButton(w - 80, 80, '\u2716', () => this.popup()));
		// +/- buttons
		const plusButton = new BFloatingButton(w - 60, 250, '+', () => {
			this.nbCurItems++;
			this.computeBuySellPrice();
		});
		const minusButton = new BFloatingButton(w - 120, 250, '-', () => {
			this.nbCurItems = Math.max(1, this.nbCurItems - 1);
			this.computeBuySellPrice();
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

	setCurItem(item) {
		if (this.curItem === item || !item || item.occurrence === 0) {
			this.curItem = null;
			this.sellButton.visible = false;
		} else {
			this.curItem = item;
			this.sellButton.visible = true;
			this.computeBuySellPrice();
		}
	}

	computeBuySellPrice() {
		if (this.curItem) {
			// nb cur item cannot exceed occurrence of cur item
			this.nbCurItems = min(this.nbCurItems, this.curItem.occurrence);
			this.sellButton.price = this.curItem.price * this.nbCurItems;
		}
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
		text('Shop - sell', 10, 10);

		textAlign(RIGHT, TOP);
		text(this.nbCurItems, this.w - 60, 250);

		textAlign(CENTER, TOP);
		text(`${this.curPage + 1}/${this.maxPage + 1}`, this.w / 2, this.h - 80);

		if (this.curItem) {
			const X = 10 + 40 + 7 * 80;
			const Y = 110;
			fill(150, 111, 51);
			stroke(0);
			rect(X - 7, Y, 75, 75, 5);
			image(this.curItem.image, X + 5, Y + 3, 48, 48);
		}
	}
}
