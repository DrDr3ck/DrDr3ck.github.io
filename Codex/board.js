class Board {
	constructor() {
		this.tyborResources = {
			orange: [
				new Card(
					COLOR.ORANGE,
					[{ value: null }, { value: null }, { value: null }, { value: null }],
					[COLOR.ORANGE]
				),
			],
			blue: [
				new Card(
					COLOR.BLUE,
					[{ value: null }, { value: null }, { value: null }, { value: null }],
					[COLOR.BLUE]
				),
			],
			purple: [
				new Card(
					COLOR.PURPLE,
					[{ value: null }, { value: null }, { value: null }, { value: null }],
					[COLOR.PURPLE]
				),
			],
			green: [
				new Card(
					COLOR.GREEN,
					[{ value: null }, { value: null }, { value: null }, { value: null }],
					[COLOR.GREEN]
				),
			],
		};
		this.tyborPoints = 0;

		this.resourceCards = [];
		this.goldCards = [];
	}

	draw() {
		noStroke();
		textSize(15);
		textAlign(CENTER, CENTER);
		fill(250);
		text(`Tybor Kwelein: ${this.tyborPoints} points`, 100, 20);
		const scale = 0.5;
		this.tyborResources.orange[0].draw(100, 50, scale);
		this.tyborResources.blue[0].draw(100 + 250 * scale, 50, scale);
		this.tyborResources.purple[0].draw(100 + 500 * scale, 50, scale);
		this.tyborResources.green[0].draw(100 + 750 * scale, 50, scale);

		this.drawResourceCards();
		this.drawGoldCards();
		this.drawPlayerCards();
	}

	drawResourceCards() {
		// TODO
		spritesheet.drawScaledSprite("verso_cards", 0, 720, 10, 0.75);
		spritesheet.drawScaledSprite("background_cards", 1, 890, 10, 0.75);
		spritesheet.drawScaledSprite("background_cards", 3, 1060, 10, 0.75);
	}

	drawGoldCards() {
		// TODO
		spritesheet.drawScaledSprite("verso_cards", 2, 720, 120, 0.75);
		spritesheet.drawScaledSprite("background_cards", 2, 890, 120, 0.75);
		spritesheet.drawScaledSprite("background_cards", 0, 1060, 120, 0.75);
		noFill();
		stroke(250, 250, 0);
		strokeWeight(4);
		rect(720, 120, 210 * 0.75, 140 * 0.75, 5);
		rect(890, 120, 210 * 0.75, 140 * 0.75, 5);
		rect(1060, 120, 210 * 0.75, 140 * 0.75, 5);
	}

	drawPlayerCards() {
		// TODO
		spritesheet.drawScaledSprite("verso_cards", 2, 400, 690, 0.75);
		spritesheet.drawScaledSprite("verso_cards", 0, 570, 690, 0.75);
		spritesheet.drawScaledSprite("verso_cards", 2, 740, 690, 0.75);
	}
}
