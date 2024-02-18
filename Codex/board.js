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
		this.goldenCards = [];
		this.starterCards = [];
		this.starterCard = null;
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
		this.drawObjectiveCards();
		this.drawPlayerBoard();
	}

	drawObjectiveCards() {
		spritesheet.drawScaledSprite("objective_cards", 0, 1230, 120, 0.75);
		spritesheet.drawScaledSprite("objective_cards", 5, 1230, 230, 0.75);
	}

	drawPlayerBoard() {
		if (this.starterCard) {
			console.log("starterCard");
			this.starterCard.drawVerso(480, 370, 0.75);
		}
	}

	drawResourceCards() {
		this.resourceCards[2].drawVerso(720, 10, 0.75);
		this.resourceCards[1].draw(890, 10, 0.75);
		this.resourceCards[0].draw(1060, 10, 0.75);
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
		this.resourceCards[0].draw(400, 690, 0.75);
		this.resourceCards[1].draw(570, 690, 0.75);
		this.goldenCards[0].draw(740, 690, 0.75);
	}

	addCard(color, corners, points = null, cost = null) {
		const card = new Card(color, corners);
		if (color === COLOR.GOLD) {
			this.starterCards.push(card);
			return;
		}
		if (points) {
			card.setPoints(points);
		}
		if (cost) {
			card.setCost(cost);
			this.goldenCards.push(card);
		} else {
			this.resourceCards.push(card);
		}
	}

	initCards() {
		this.resourceCards = [];
		// blue
		this.addCard(COLOR.BLUE, [
			null,
			{ value: null },
			{ value: COLOR.BLUE },
			{ value: COLOR.BLUE },
		]);
		this.addCard(
			COLOR.BLUE,
			[null, { value: null }, { value: COLOR.BLUE }, { value: null }],
			"1"
		);
		this.addCard(
			COLOR.BLUE,
			[{ value: null }, { value: COLOR.BLUE }, { value: null }, null],
			"1"
		);
		this.addCard(COLOR.BLUE, [
			{ value: null },
			{ value: COLOR.BLUE },
			null,
			{ value: COLOR.BLUE },
		]);
		this.addCard(
			COLOR.BLUE,
			[{ value: null }, null, { value: null }, { value: COLOR.BLUE }],
			"1"
		);
		this.addCard(COLOR.BLUE, [
			{ value: COLOR.GREEN },
			{ value: COLOR.BLUE },
			null,
			{ value: OBJECT.PARCHMENT },
		]);
		this.addCard(COLOR.BLUE, [
			{ value: COLOR.BLUE },
			{ value: COLOR.BLUE },
			null,
			{ value: null },
		]);
		this.addCard(COLOR.BLUE, [
			null,
			{ value: COLOR.PURPLE },
			{ value: OBJECT.INKWELL },
			{ value: COLOR.BLUE },
		]);
		this.addCard(COLOR.BLUE, [
			{ value: COLOR.BLUE },
			{ value: COLOR.BLUE },
			{ value: null },
			null,
		]);
		this.addCard(COLOR.BLUE, [
			{ value: OBJECT.FEATHER },
			null,
			{ value: COLOR.BLUE },
			{ value: COLOR.ORANGE },
		]);
		// green
		this.addCard(COLOR.GREEN, [
			{ value: COLOR.GREEN },
			{ value: null },
			{ value: COLOR.GREEN },
			null,
		]);
		this.addCard(
			COLOR.GREEN,
			[{ value: null }, { value: null }, { value: COLOR.GREEN }, null],
			"1"
		);
		this.addCard(COLOR.GREEN, [
			{ value: COLOR.ORANGE },
			{ value: COLOR.GREEN },
			null,
			{ value: OBJECT.INKWELL },
		]);
		this.addCard(COLOR.GREEN, [
			null,
			{ value: COLOR.PURPLE },
			{ value: OBJECT.FEATHER },
			{ value: COLOR.GREEN },
		]);
		this.addCard(COLOR.GREEN, [
			{ value: OBJECT.PARCHMENT },
			null,
			{ value: COLOR.GREEN },
			{ value: COLOR.BLUE },
		]);
		this.addCard(COLOR.GREEN, [
			null,
			{ value: COLOR.GREEN },
			{ value: null },
			{ value: COLOR.GREEN },
		]);
		this.addCard(COLOR.GREEN, [
			{ value: COLOR.GREEN },
			{ value: COLOR.GREEN },
			null,
			{ value: null },
		]);
		this.addCard(COLOR.GREEN, [
			{ value: null },
			null,
			{ value: COLOR.GREEN },
			{ value: COLOR.GREEN },
		]);
		this.addCard(
			COLOR.GREEN,
			[null, { value: COLOR.GREEN }, { value: null }, { value: null }],
			"1"
		);
		this.addCard(
			COLOR.GREEN,
			[{ value: null }, { value: null }, null, { value: COLOR.GREEN }],
			"1"
		);
		// purple
		this.addCard(COLOR.PURPLE, [
			{ value: COLOR.PURPLE },
			{ value: COLOR.PURPLE },
			{ value: null },
			null,
		]);
		this.addCard(COLOR.PURPLE, [
			{ value: COLOR.PURPLE },
			null,
			{ value: COLOR.PURPLE },
			{ value: null },
		]);
		this.addCard(COLOR.PURPLE, [
			null,
			{ value: null },
			{ value: COLOR.PURPLE },
			{ value: COLOR.PURPLE },
		]);
		this.addCard(COLOR.PURPLE, [
			{ value: null },
			{ value: COLOR.PURPLE },
			null,
			{ value: COLOR.PURPLE },
		]);
		this.addCard(
			COLOR.PURPLE,
			[{ value: COLOR.PURPLE }, null, { value: null }, { value: null }],
			"1"
		);
		this.addCard(
			COLOR.PURPLE,
			[null, { value: COLOR.PURPLE }, { value: null }, { value: null }],
			"1"
		);
		this.addCard(
			COLOR.PURPLE,
			[{ value: null }, { value: null }, null, { value: COLOR.PURPLE }],
			"1"
		);
		this.addCard(COLOR.PURPLE, [
			{ value: COLOR.PURPLE },
			{ value: COLOR.GREEN },
			{ value: OBJECT.INKWELL },
			null,
		]);
		this.addCard(COLOR.PURPLE, [
			null,
			{ value: OBJECT.FEATHER },
			{ value: COLOR.BLUE },
			{ value: COLOR.PURPLE },
		]);
		this.addCard(COLOR.PURPLE, [
			{ value: OBJECT.PARCHMENT },
			{ value: COLOR.PURPLE },
			null,
			{ value: COLOR.ORANGE },
		]);
		// ORANGE
		this.addCard(COLOR.ORANGE, [
			{ value: COLOR.ORANGE },
			{ value: null },
			{ value: COLOR.ORANGE },
			null,
		]);
		this.addCard(COLOR.ORANGE, [
			{ value: null },
			null,
			{ value: COLOR.ORANGE },
			{ value: COLOR.ORANGE },
		]);
		this.addCard(COLOR.ORANGE, [
			null,
			{ value: COLOR.ORANGE },
			{ value: null },
			{ value: COLOR.ORANGE },
		]);
		this.addCard(COLOR.ORANGE, [
			{ value: COLOR.ORANGE },
			{ value: COLOR.ORANGE },
			null,
			{ value: null },
		]);
		this.addCard(
			COLOR.ORANGE,
			[{ value: null }, { value: COLOR.ORANGE }, { value: null }, null],
			"1"
		);
		this.addCard(
			COLOR.ORANGE,
			[null, { value: null }, { value: COLOR.ORANGE }, { value: null }],
			"1"
		);
		this.addCard(
			COLOR.ORANGE,
			[{ value: COLOR.ORANGE }, null, { value: null }, { value: null }],
			"1"
		);
		this.addCard(COLOR.ORANGE, [
			{ value: COLOR.ORANGE },
			{ value: COLOR.PURPLE },
			{ value: OBJECT.PARCHMENT },
			null,
		]);
		this.addCard(COLOR.ORANGE, [
			null,
			{ value: OBJECT.FEATHER },
			{ value: COLOR.GREEN },
			{ value: COLOR.ORANGE },
		]);
		this.addCard(COLOR.ORANGE, [
			{ value: OBJECT.INKWELL },
			{ value: COLOR.ORANGE },
			null,
			{ value: COLOR.BLUE },
		]);

		// GOLDEN CARDS
		// orange
		this.addCard(
			COLOR.ORANGE,
			[{ value: null }, { value: OBJECT.INKWELL }, null, { value: null }],
			OBJECT.INKWELL,
			[COLOR.ORANGE, COLOR.ORANGE, COLOR.GREEN]
		);
		this.addCard(
			COLOR.ORANGE,
			[{ value: OBJECT.PARCHMENT }, { value: null }, { value: null }, null],
			OBJECT.PARCHMENT,
			[COLOR.ORANGE, COLOR.ORANGE, COLOR.PURPLE]
		);
		this.addCard(
			COLOR.ORANGE,
			[null, { value: null }, { value: null }, { value: OBJECT.FEATHER }],
			OBJECT.FEATHER,
			[COLOR.ORANGE, COLOR.ORANGE, COLOR.BLUE]
		);
		this.addCard(
			COLOR.ORANGE,
			[{ value: null }, { value: null }, { value: null }, null],
			"2",
			[COLOR.ORANGE, COLOR.ORANGE, COLOR.ORANGE, COLOR.GREEN]
		);
		this.addCard(
			COLOR.ORANGE,
			[{ value: null }, { value: null }, null, { value: null }],
			"2",
			[COLOR.ORANGE, COLOR.ORANGE, COLOR.ORANGE, COLOR.BLUE]
		);
		this.addCard(
			COLOR.ORANGE,
			[{ value: null }, null, { value: null }, { value: null }],
			"2",
			[COLOR.ORANGE, COLOR.ORANGE, COLOR.ORANGE, COLOR.PURPLE]
		);
		this.addCard(
			COLOR.ORANGE,
			[{ value: OBJECT.FEATHER }, { value: null }, null, null],
			"3",
			[COLOR.ORANGE, COLOR.ORANGE, COLOR.ORANGE]
		);
		this.addCard(
			COLOR.ORANGE,
			[null, { value: OBJECT.PARCHMENT }, null, { value: null }],
			"3",
			[COLOR.ORANGE, COLOR.ORANGE, COLOR.ORANGE]
		);
		this.addCard(
			COLOR.ORANGE,
			[{ value: null }, null, { value: OBJECT.INKWELL }, null],
			"3",
			[COLOR.ORANGE, COLOR.ORANGE, COLOR.ORANGE]
		);
		this.addCard(
			COLOR.ORANGE,
			[{ value: null }, null, { value: null }, null],
			"5",
			[COLOR.ORANGE, COLOR.ORANGE, COLOR.ORANGE, COLOR.ORANGE, COLOR.ORANGE]
		);
		// BLUE
		this.addCard(
			COLOR.BLUE,
			[{ value: null }, null, { value: OBJECT.FEATHER }, { value: null }],
			OBJECT.FEATHER,
			[COLOR.BLUE, COLOR.BLUE, COLOR.ORANGE]
		);
		this.addCard(
			COLOR.BLUE,
			[null, { value: null }, { value: null }, { value: OBJECT.PARCHMENT }],
			OBJECT.PARCHMENT,
			[COLOR.BLUE, COLOR.BLUE, COLOR.GREEN]
		);
		this.addCard(
			COLOR.BLUE,
			[{ value: OBJECT.INKWELL }, { value: null }, { value: null }, null],
			OBJECT.INKWELL,
			[COLOR.BLUE, COLOR.BLUE, COLOR.PURPLE]
		);
		this.addCard(
			COLOR.BLUE,
			[{ value: null }, null, { value: null }, { value: null }],
			"2",
			[COLOR.BLUE, COLOR.BLUE, COLOR.BLUE, COLOR.ORANGE]
		);
		this.addCard(
			COLOR.BLUE,
			[{ value: null }, { value: null }, null, { value: null }],
			"2",
			[COLOR.BLUE, COLOR.BLUE, COLOR.BLUE, COLOR.PURPLE]
		);
		this.addCard(
			COLOR.BLUE,
			[null, { value: null }, { value: null }, { value: null }],
			"2",
			[COLOR.BLUE, COLOR.BLUE, COLOR.BLUE, COLOR.GREEN]
		);
		this.addCard(
			COLOR.BLUE,
			[{ value: null }, { value: OBJECT.INKWELL }, null, null],
			"3",
			[COLOR.BLUE, COLOR.BLUE, COLOR.BLUE]
		);
		this.addCard(
			COLOR.BLUE,
			[{ value: null }, null, { value: OBJECT.PARCHMENT }, null],
			"3",
			[COLOR.BLUE, COLOR.BLUE, COLOR.BLUE]
		);
		this.addCard(
			COLOR.BLUE,
			[null, { value: null }, null, { value: OBJECT.FEATHER }],
			"3",
			[COLOR.BLUE, COLOR.BLUE, COLOR.BLUE]
		);
		this.addCard(
			COLOR.BLUE,
			[null, { value: null }, null, { value: null }],
			"5",
			[COLOR.BLUE, COLOR.BLUE, COLOR.BLUE, COLOR.BLUE, COLOR.BLUE]
		);
		// green
		this.addCard(
			COLOR.GREEN,
			[{ value: null }, { value: null }, null, null],
			"5",
			[COLOR.GREEN, COLOR.GREEN, COLOR.GREEN, COLOR.GREEN, COLOR.GREEN]
		);
		this.addCard(
			COLOR.GREEN,
			[{ value: null }, null, { value: OBJECT.FEATHER }, null],
			"3",
			[COLOR.GREEN, COLOR.GREEN, COLOR.GREEN]
		);
		this.addCard(
			COLOR.GREEN,
			[{ value: OBJECT.PARCHMENT }, { value: null }, null, null],
			"3",
			[COLOR.GREEN, COLOR.GREEN, COLOR.GREEN]
		);
		this.addCard(
			COLOR.GREEN,
			[null, { value: OBJECT.INKWELL }, null, { value: null }],
			"3",
			[COLOR.GREEN, COLOR.GREEN, COLOR.GREEN]
		);
		this.addCard(
			COLOR.GREEN,
			[{ value: null }, null, { value: null }, { value: null }],
			"2",
			[COLOR.GREEN, COLOR.GREEN, COLOR.GREEN, COLOR.ORANGE]
		);
		this.addCard(
			COLOR.GREEN,
			[null, { value: null }, { value: null }, { value: null }],
			"2",
			[COLOR.GREEN, COLOR.GREEN, COLOR.GREEN, COLOR.PURPLE]
		);
		this.addCard(
			COLOR.GREEN,
			[{ value: null }, { value: null }, { value: null }, null],
			"2",
			[COLOR.GREEN, COLOR.GREEN, COLOR.GREEN, COLOR.BLUE]
		);
		this.addCard(
			COLOR.GREEN,
			[{ value: OBJECT.FEATHER }, { value: null }, { value: null }, null],
			OBJECT.FEATHER,
			[COLOR.GREEN, COLOR.GREEN, COLOR.PURPLE]
		);
		this.addCard(
			COLOR.GREEN,
			[{ value: null }, { value: OBJECT.PARCHMENT }, null, { value: null }],
			OBJECT.PARCHMENT,
			[COLOR.GREEN, COLOR.GREEN, COLOR.ORANGE]
		);
		this.addCard(
			COLOR.GREEN,
			[{ value: null }, null, { value: OBJECT.INKWELL }, { value: null }],
			OBJECT.INKWELL,
			[COLOR.GREEN, COLOR.GREEN, COLOR.BLUE]
		);
		// PURPLE
		this.addCard(
			COLOR.PURPLE,
			[{ value: null }, { value: OBJECT.FEATHER }, null, { value: null }],
			OBJECT.FEATHER,
			[COLOR.PURPLE, COLOR.PURPLE, COLOR.GREEN]
		);
		this.addCard(
			COLOR.PURPLE,
			[{ value: null }, null, { value: OBJECT.PARCHMENT }, { value: null }],
			OBJECT.PARCHMENT,
			[COLOR.PURPLE, COLOR.PURPLE, COLOR.BLUE]
		);
		this.addCard(
			COLOR.PURPLE,
			[null, { value: null }, { value: null }, { value: OBJECT.INKWELL }],
			OBJECT.INKWELL,
			[COLOR.PURPLE, COLOR.PURPLE, COLOR.ORANGE]
		);
		this.addCard(
			COLOR.PURPLE,
			[{ value: null }, { value: null }, null, { value: null }],
			"2",
			[COLOR.PURPLE, COLOR.PURPLE, COLOR.PURPLE, COLOR.BLUE]
		);
		this.addCard(
			COLOR.PURPLE,
			[{ value: null }, { value: null }, { value: null }, null],
			"2",
			[COLOR.PURPLE, COLOR.PURPLE, COLOR.PURPLE, COLOR.GREEN]
		);
		this.addCard(
			COLOR.PURPLE,
			[{ value: null }, null, { value: null }, { value: null }],
			"2",
			[COLOR.PURPLE, COLOR.PURPLE, COLOR.PURPLE, COLOR.ORANGE]
		);
		this.addCard(
			COLOR.PURPLE,
			[null, null, { value: OBJECT.FEATHER }, { value: null }],
			"3",
			[COLOR.PURPLE, COLOR.PURPLE, COLOR.PURPLE]
		);
		this.addCard(
			COLOR.PURPLE,
			[{ value: OBJECT.INKWELL }, null, { value: null }, null],
			"3",
			[COLOR.PURPLE, COLOR.PURPLE, COLOR.PURPLE]
		);
		this.addCard(
			COLOR.PURPLE,
			[{ value: null }, { value: OBJECT.PARCHMENT }, null, null],
			"3",
			[COLOR.PURPLE, COLOR.PURPLE, COLOR.PURPLE]
		);
		this.addCard(
			COLOR.PURPLE,
			[{ value: null }, { value: null }, null, null],
			"5",
			[COLOR.PURPLE, COLOR.PURPLE, COLOR.PURPLE, COLOR.PURPLE, COLOR.PURPLE]
		);

		randomizer.shuffleArray(this.resourceCards);
		randomizer.shuffleArray(this.goldenCards);

		// STARTER
		this.addCard(COLOR.GOLD, [
			{ value: COLOR.PURPLE },
			{ value: COLOR.BLUE },
			{ value: COLOR.ORANGE },
			{ value: COLOR.GREEN },
		]);
		this.addCard(COLOR.GOLD, [
			{ value: COLOR.ORANGE },
			{ value: COLOR.BLUE },
			{ value: COLOR.GREEN },
			{ value: COLOR.PURPLE },
		]);
		this.addCard(COLOR.GOLD, [
			{ value: COLOR.GREEN },
			{ value: COLOR.BLUE },
			{ value: COLOR.ORANGE },
			{ value: COLOR.PURPLE },
		]);
		this.addCard(COLOR.GOLD, [
			{ value: COLOR.ORANGE },
			{ value: COLOR.GREEN },
			{ value: COLOR.PURPLE },
			{ value: COLOR.BLUE },
		]);
		this.addCard(COLOR.GOLD, [
			{ value: COLOR.PURPLE },
			{ value: COLOR.ORANGE },
			{ value: COLOR.GREEN },
			{ value: COLOR.BLUE },
		]);
		this.addCard(COLOR.GOLD, [
			{ value: COLOR.GREEN },
			{ value: COLOR.PURPLE },
			{ value: COLOR.BLUE },
			{ value: COLOR.ORANGE },
		]);
		this.starterCards[0].setVerso(
			[{ value: null }, { value: null }, { value: null }, { value: null }],
			[COLOR.GREEN, COLOR.ORANGE]
		);
		this.starterCards[1].setVerso(
			[{ value: null }, { value: null }, null, null],
			[COLOR.GREEN, COLOR.BLUE, COLOR.ORANGE]
		);
		this.starterCards[2].setVerso(
			[
				{ value: COLOR.BLUE },
				{ value: null },
				{ value: null },
				{ value: COLOR.ORANGE },
			],
			[COLOR.ORANGE]
		);
		this.starterCards[3].setVerso(
			[
				{ value: null },
				{ value: COLOR.GREEN },
				{ value: COLOR.PURPLE },
				{ value: null },
			],
			[COLOR.PURPLE]
		);
		this.starterCards[4].setVerso(
			[{ value: null }, { value: null }, null, null],
			[COLOR.BLUE, COLOR.PURPLE, COLOR.GREEN]
		);
		this.starterCards[5].setVerso(
			[{ value: null }, { value: null }, { value: null }, { value: null }],
			[COLOR.BLUE, COLOR.PURPLE]
		);

		randomizer.shuffleArray(this.starterCards);
		this.starterCard = this.starterCards[0];
	}
}
