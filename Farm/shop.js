class Money {
	constructor() {
		this.copper = 0;
		this.silver = 0;
		this.gold = 0;
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

class ShopDialog extends Dialog {
	constructor(x, y, w, h) {
		super(x, y, w, h);
		this.category = 'seed';
		this.curPage = 0;
		this.maxPage = 2; // TODO: depend of the items in a category
		this.curItem = null;
		this.nbCurItems = 1;

		this.components.push(new BFloatingButton(w - 80, 80, '\u2716', () => this.popup()));

		this.components.push(new BFloatingButton(w - 80, 180, '+', () => {
			this.nbCurItems++;
		}));
		this.components.push(new BFloatingButton(w - 180, 180, '-', () => {
			this.nbCurItems = Math.max(1, this.nbCurItems-1);
		}));

		this.components.push(new BFloatingButton(10, h-10, '<', () => {
			this.curPage = Math.max(0, this.curPage-1);
		}));
		this.components.push(new BFloatingButton(w - 80, h-10, '>', () => {
			this.curPage = Math.min(this.maxPage, this.curPage+1);
		}
			));
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
		text('Achat', 10, 10);

		text(this.nbCurItems, this.w-80,180);

		text(`${this.curPage+1}/${this.maxPage+1}`, this.w/2,this.h-80);
	}
}
