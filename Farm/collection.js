class CollectionGain {
	constructor(name) {
		this.name = name;
	}
}

class CollectionCard {
	constructor(type, count, img = null) {
		this.type = type;
		this.count = count;
		this.img = img;
	}

	draw(X, Y) {
		if (!this.img) {
			this.img = spritesheet.getImage('seed_vegetable', getSpriteIndex(this.type, 'seed'));
		}
		const width = 75;
		fill(150, 111, 51);
		stroke(0);
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

	addCard(type, count, img=null) {
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
		[ 'hoe', 'pickaxe', 'shovel', 'basket' ].forEach((tool,i) => {
			collection.addCard(tool, 1, spritesheet.getImage('farm_tools', i) );
		});
		this.collections.push(collection);

		collection = new Collection('navet', 'navet_farm_bot');
		[ 1, 2, 5, 10 ].forEach((i) => collection.addCard('navet', i));
		this.collections.push(collection);
		collection = new Collection('carotte', 'carotte_farm_bot');
		[ 1, 2, 5, 10 ].forEach((i) => collection.addCard('carotte', i));
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
			})
		);
		this.components.push(
			new BFloatingButton(w - 80, h - 10, '>', () => {
				this.curPage = Math.min(this.maxPage, this.curPage + 1);
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

		// get first collection to display
		this.drawCollection(this.manager.collections[0], 0);
		this.drawCollection(this.manager.collections[1], 1);
		this.drawCollection(this.manager.collections[2], 2);
	}

	drawCollection(collection, row) {
		collection.cards.forEach((card, column) => {
			const X = 10 + column * 80;
			const Y = 110 + row * 80;
			card.draw(X, Y);
		});
		// gain
		fill(150, 111, 51);
		stroke(0);
		rect(10 + 80 * 5, 110 + row * 80, 75, 75, 15);
	}

	popup() {
		if (this.visible) {
			uiManager.setDialog(null);
		} else {
			uiManager.setDialog(this);
		}
	}
}
