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
		spritesheet.drawSprite('farm_money', 0, 5,32);
		text(this.silver, 0, 20);
		spritesheet.drawSprite('farm_money', 1, 5,12);
		text(this.gold, 0, 0);
		spritesheet.drawSprite('farm_money', 2, 5,-8);
	}
}

class ShopDialog extends Dialog {
    constructor(x,y,w,h) {
		super(x,y,w,h);
    }
}