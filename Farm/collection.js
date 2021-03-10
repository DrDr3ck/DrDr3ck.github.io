class CollectionCardBase {
	constructor(name) {
		this.name = name;
		this.owned = false;
	}
}

class CollectionGain extends CollectionCardBase {
	constructor(name) {
		super(name);
	}

	draw(X, Y) {
		fill(150, 111, 51);
		stroke(0);
		rect(X, Y, 75, 75, 15);
	}
}

class CollectionCard extends CollectionCardBase {
	constructor(name, count, img = null) {
		super(name);
		this.count = count;
		this.img = img;
	}

	draw(X, Y) {
		if (!this.img) {
			this.img = spritesheet.getImage('seed_vegetable', getSpriteIndex(this.name, 'seed'));
		}
		const width = 75;
		fill(150, 111, 51);
		if (this.owned) {
			stroke(50, 150, 50);
		} else {
			stroke(0);
		}
		rect(X, Y, width, width, 15);
		image(this.img, X + (width - 48) / 2, Y + 5, 48, 48);

		fill(0);
		noStroke();
		textSize(12);
		textAlign(LEFT, TOP);
		text(this.count, X + 5, Y + 5);
	}
}

class Collection {
	constructor(name, gain) {
		this.name = name;
		this.cards = [];
		this.gain = new CollectionGain(gain);
	}

	addCard(type, count, img = null) {
		this.cards.push(new CollectionCard(type, count, img));
	}
}

class CollectionMgr {
	constructor() {
		this.collections = [];
		this.fill();
	}

	fill() {
		// starter
		let collection = new Collection('starter', 'starter');
		[ 'hoe', 'pickaxe', 'shovel', 'basket' ].forEach((tool, i) => {
			collection.addCard(tool, 1, spritesheet.getImage('farm_tools', i));
		});
		this.collections.push(collection);

		collection = new Collection('navet', 'navet_farm_bot');
		[ 1, 2, 5, 10 ].forEach((i) => collection.addCard('navet', i));
		this.collections.push(collection);

		collection = new Collection('carotte', 'carotte_farm_bot');
		[ 1, 2, 5, 10 ].forEach((i) => collection.addCard('carotte', i));
		this.collections.push(collection);

		collection = new Collection('tomate', 'tomate_farm_bot');
		[ 1, 2, 5, 10 ].forEach((i) => collection.addCard('tomate', i));
		this.collections.push(collection);
	}
}

class CollectionDialog extends Dialog {
	constructor(x, y, w, h) {
		super(x, y, w, h);
		this.manager = new CollectionMgr();

		// close button
		this.components.push(new BFloatingButton(w - 80, 80, '\u2716', () => this.popup()));

		// prev/next page
		this.components.push(
			new BFloatingButton(10, h - 10, '<', () => {
				this.curPage = Math.max(0, this.curPage - 1);
				this.initPage();
			})
		);
		this.components.push(
			new BFloatingButton(w - 80, h - 10, '>', () => {
				this.curPage = Math.min(this.maxPage, this.curPage + 1);
				this.initPage();
			})
		);
		this.curPage = 0;
		this.maxRows = 3;
		this.maxPage = Math.floor((this.manager.collections.length - 1) / this.maxRows);
	}

	doDraw() {
		super.doDraw();
		fill(255);
		stroke(0);
		textSize(32);
		textAlign(LEFT, TOP);
		text('Collection', 10, 10);

		textAlign(CENTER, TOP);
		text(`${this.curPage + 1}/${this.maxPage + 1}`, this.w / 2, this.h - 80);
	}

	/**
	 * Initializes the page number 'this.curPage'
	 */
	initPage() {
		// clean all BCollectionCardButton (TODO: need to invalidate them instead of remove + recreate)
		this.components = this.components.filter((c) => c.constructor.name !== 'BCollectionCardButton');

		for (let i = 0; i < this.maxRows; i++) {
			const index = this.curPage * this.maxRows + i;
			if (index < this.manager.collections.length) {
				this.initCollection(this.manager.collections[index], i);
			}
		}
	}

	initCollection(collection, row) {
		collection.cards.forEach((card, column) => {
			const X = 10 + column * 80;
			const Y = 110 + row * 80;
			const button = new BCollectionCardButton(X, Y, card, () => {
				// TODO: own card
				card.owned = true;
			});
			button.visible = true;
			this.components.push(
				button
			);
		});
		// TODO: gain card
		const card = collection.gain;
		const button = new BCollectionCardButton(10 + 5 * 80, 110 + row * 80, card, () => {
			// TODO gain card
		});
		button.visible = true;
		this.components.push(
			button
		);
	}

	popup() {
		if (this.visible) {
			uiManager.setDialog(null);
		} else {
			this.initPage();
			uiManager.setDialog(this);
		}
	}
}
