const cards = [];

const board = {
	cards: []
};

let triplet = [];
let allSolutions = -1;

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

function drawCard(card, i, j) {
	stroke(20, 20, 50);
	strokeWeight(3);
	noFill();
	const dx = 200 + i * 110;
	const dy = j * 200;
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

function draw() {
	background(80);

	let i = 0;
	let j = 0;
	for (const cardIndex in board.cards) {
		if (!triplet.includes(parseInt(cardIndex))) {
			drawCard(board.cards[cardIndex], i, j);
		}
		i++;
		if (i === 4) {
			j++;
			i = 0;
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
		drawCard(board.cards[triplet[0]], 5, 1);
		drawCard(board.cards[triplet[1]], 6, 1);
		drawCard(board.cards[triplet[2]], 7, 1);
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

function findSolution() {
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
