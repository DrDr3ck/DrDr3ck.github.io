const cards = [];

const board = {
	cards: []
};

let triplet = [];
let allSolutions = -1;
let selected = [];

const FORME = 0;
const COLOR = 1;
const FILL = 2;
const NUMBER = 3;

const formes = [ 'rectangle', 'circle', 'triangle' ];
const colors = [ 'red', 'green', 'blue' ];
const fills = [ 'total', 'hashed', 'nofill' ];
const numbers = [ 1, 2, 3 ];

function shuffleCards() {
	for (const cardIndex in cards) {
		const swapCard = cards[cardIndex];
		const newIndex = Math.floor(random(cards.length));
		cards[cardIndex] = cards[newIndex];
		cards[newIndex] = swapCard;
	}
}

function initCards() {
	for (const forme of formes) {
		for (const color of colors) {
			for (const fill of fills) {
				for (const number of numbers) {
					cards.push({ forme, color, fill, number });
				}
			}
		}
	}
	shuffleCards();
	for (let i = 0; i < 12; i++) {
		board.cards.push(cards.pop());
	}
	console.log(board);
}

function drawItem(dx, dy, forme, fill) {
	push();
	if (fill !== 'total') {
		noFill();
	}
	if (forme === 'rectangle') {
		push();
		rectMode(CENTER);
		rect(dx, dy, 25, 25);
		if (fill === 'hashed') {
			strokeWeight(1);
			line(dx + 10, dy - 12, dx, dy + 12);
			line(dx - 2, dy - 12, dx - 12, dy + 12);
		}
		pop();
	} else if (forme === 'circle') {
		ellipse(dx, dy, 25, 25);
		if (fill === 'hashed') {
			strokeWeight(1);
			line(dx + 10, dy - 10, dx, dy + 12);
			line(dx - 2, dy - 12, dx - 10, dy + 8);
		}
	} else {
		// triangle
		triangle(dx, dy - 13, dx + 12, dy + 13, dx - 12, dy + 13);
		if (fill === 'hashed') {
			strokeWeight(1);
			line(dx + 9, dy + 2, dx, dy + 12);
			line(dx + 5, dy - 6, dx - 10, dy + 12);
		}
	}
	pop();
}

function mouseInCard(x, y, w, h) {
	if (mouseX < x) return false;
	if (mouseX > x + w) return false;
	if (mouseY < y) return false;
	if (mouseY > y + h) return false;
	return true;
}

function getCardX(i) {
	return 200 + i * 110;
}

function getCardY(j) {
	return j * 200;
}

function drawCard(cardIndex, i, j) {
	const card = board.cards[cardIndex];
	stroke(20, 20, 50);
	strokeWeight(3);
	noFill();
	const dx = getCardX(i);
	const dy = getCardY(j);
	if (mouseInCard(dx, dy, 100, 180)) {
		stroke(20, 20, 150);
	}
	if (selected.includes(cardIndex)) {
		fill(100, 100, 100);
	}
	rect(dx, dy, 100, 180, 5);

	strokeWeight(2);
	if (card.color === 'red') {
		fill(240, 60, 69);
		stroke(240, 60, 69);
	} else if (card.color === 'green') {
		fill(19, 190, 56);
		stroke(20, 170, 20);
	} else {
		// 1338BE
		fill(0, 162, 232);
		stroke(0, 162, 232);
	}

	if (card.number === 1 || card.number === 3) {
		// display item on middle
		drawItem(dx + 50, dy + 90, card.forme, card.fill);
	}
	if (card.number === 2 || card.number === 3) {
		// display top and bottom
		drawItem(dx + 50, dy + 40, card.forme, card.fill);
		drawItem(dx + 50, dy + 140, card.forme, card.fill);
	}
}

function setup() {
	canvas = createCanvas(1200, 800);
	canvas.parent('canvas');

	initCards();
}

function getCardI(index) {
	if (index < 12) {
		return index % 4;
	}
	if (index < 15) {
		return 4;
	}
	return 5;
}

function getCardJ(index) {
	if (index < 12) {
		return Math.floor(index / 4);
	}
	if (index < 15) {
		return index - 12;
	}
	return index - 15;
}

function draw() {
	background(80);

	for (const cardIndex in board.cards) {
		const i = getCardI(cardIndex);
		const j = getCardJ(cardIndex);
		if (!triplet.includes(parseInt(cardIndex))) {
			drawCard(cardIndex, i, j);
		}
	}

	textSize(16);
	noStroke();
	fill(198, 255, 244);
	text(`${cards.length} cards left`, 100, 200);
	if (triplet.length === 3) {
		text('Solution:', 100, 100);
		text(`Card: ${triplet[0]}`, 100, 120);
		text(`Card: ${triplet[1]}`, 100, 140);
		text(`Card: ${triplet[2]}`, 100, 160);

		text("Press 'n' to get next cards", 700, 100);

		push();
		drawCard(triplet[0], 5, 1);
		drawCard(triplet[1], 6, 1);
		drawCard(triplet[2], 7, 1);
		pop();
	} else {
		text("Press 's' to get a set", 700, 100);
		if (allSolutions === -1) {
			text("Press 'p' to known how many sets", 700, 200);
		} else {
			if (allSolutions === 0) {
				text('There is no set', 700, 200);
			} else if (allSolutions === 1) {
				text('There is 1 set', 700, 200);
			} else {
				text(`There are ${allSolutions} sets`, 700, 200);
			}
		}
	}
}

function mousePressed() {
	// check if mouse is over a card
	for (const cardIndex in board.cards) {
		const i = getCardI(cardIndex);
		const j = getCardJ(cardIndex);
		const dx = getCardX(i);
		const dy = getCardY(j);
		if (mouseInCard(dx, dy, 100, 180)) {
			if (selected.includes(cardIndex)) {
				selected = selected.filter((c) => c !== cardIndex);
			} else if (selected.length < 3) {
				selected.push(cardIndex);
				if (selected.length === 3) {
					if (
						checkTriplet(
							board.cards[parseInt(selected[0])],
							board.cards[parseInt(selected[1])],
							board.cards[parseInt(selected[2])]
						)
					) {
						triplet = selected;
						selected = [];
					}
				}
			}
		}
	}
}

function checkState(curTriplet, state) {
	if (curTriplet[0][state] === curTriplet[1][state] && curTriplet[1][state] === curTriplet[2][state]) {
		return true;
	}
	if (
		curTriplet[0][state] !== curTriplet[1][state] &&
		curTriplet[1][state] !== curTriplet[2][state] &&
		curTriplet[2][state] !== curTriplet[0][state]
	) {
		return true;
	}
	return false;
}

function checkTriplet(curTriplet) {
	return (
		checkState(curTriplet, 'forme') &&
		checkState(curTriplet, 'color') &&
		checkState(curTriplet, 'fill') &&
		checkState(curTriplet, 'number')
	);
}

function findSolution() {
	for (let i = 0; i < board.cards.length; i++) {
		for (let j = i + 1; j < board.cards.length; j++) {
			for (let k = j + 1; k < board.cards.length; k++) {
				if (checkTriplet([ board.cards[i], board.cards[j], board.cards[k] ])) {
					return [ i, j, k ];
				}
			}
		}
	}
	return [];
}

function hasSolutions() {
	let solution = 0;
	for (let i = 0; i < board.cards.length; i++) {
		for (let j = i + 1; j < board.cards.length; j++) {
			for (let k = j + 1; k < board.cards.length; k++) {
				const curTriplet = [ board.cards[i], board.cards[j], board.cards[k] ];
				if (
					checkState(curTriplet, 'forme') &&
					checkState(curTriplet, 'color') &&
					checkState(curTriplet, 'fill') &&
					checkState(curTriplet, 'number')
				) {
					solution++;
				}
			}
		}
	}
	return solution;
}

function keyPressed() {
	if (key === 's') {
		// find a solution
		triplet = findSolution();
	}
	if (key === 'n') {
		if (triplet.length === 3 && cards.length >= 3) {
			board.cards[triplet[0]] = cards.pop();
			board.cards[triplet[1]] = cards.pop();
			board.cards[triplet[2]] = cards.pop();
			triplet = [];
			allSolutions = -1;
		}
	}
	if (key === 'p' && allSolutions === -1) {
		allSolutions = hasSolutions();
	}
}
