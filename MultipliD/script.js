const board = {
	cards: [],
	cards2: []
};

function shuffleCards(cards) {
	for (const cardIndex in cards) {
		const swapCard = cards[cardIndex];
		const newIndex = Math.floor(random(cards.length));
		cards[cardIndex] = cards[newIndex];
		cards[newIndex] = swapCard;
	}
}

function initCards() {
	const cards = [];
	for (let i=2; i <= 9; i++ ) {
		for (let j=2; j <= 9; j++ ) {
			if( !cards.includes(i*j) ) {
				cards.push(i*j);
			}
		}
	}

	const val10 = [5,6,7,8,9];
	shuffleCards(val10);
	const val11 = [2,3,4,5,6,7,8,9];
	shuffleCards(val11);
	for(let i=0; i <4; i++ ) {
		cards.push(10*val10[i]);
		cards.push(11*val11[i]);
	}

	console.log(cards);
	shuffleCards(cards);
	if( board.cards2.length === 0 ) {
		for (let i=0; i < 36; i++ ) {
			board.cards2.push(cards[i]);
		}
	} else {
		for (let i=0; i < 36; i++ ) {
			board.cards.push(cards[i]);
		}
	}
	
	console.log(board);
}

function drawCard(cardIndex, i, j, bcards) {
	const card = bcards === 0 ? board.cards[cardIndex] : board.cards2[cardIndex];
	stroke(20, 20, 50);
	strokeWeight(3);
	noFill();
	const dx = 10 + i * 130;
	const dy = 10 + j * 130;
	rect(dx + bcards*130*7, dy, 125, 125, 5);

	strokeWeight(1);
	stroke(20, 20, 50);
	fill(10);

	textSize(25);
	textAlign(CENTER, CENTER);
	text(card, dx + bcards*130*7 +65, dy+65);
}

function setup() {
	canvas = createCanvas(1700, 800);
	canvas.parent('canvas');

	initCards();
	initCards();
}

function draw() {
	background(255);

	let cardIndex = 0;
	for( let i=0; i < 6; i++ ) {
		for( let j=0; j < 6; j++ ) {
			drawCard(cardIndex, i, j, 0);
			drawCard(cardIndex, i, j, 1);
			cardIndex = cardIndex + 1;
		}
	}

	textSize(16);
	noStroke();
	fill(98, 55, 44);
	//text("Press 'G' to get a new grid", 500, 10);

}

function mousePressed() {
	// does nothing	
}

function keyPressed() {
	if (key === 'G') {
		// create a new grid
		board.cards = [];
		board.cards2 = [];
		initCards();
		initCards();
	}
	if( key === 's' ) {
		saveCanvas("Multiple-D", "jpg");
		board.cards = [];
		board.cards2 = [];
		initCards();
		initCards();
	}
}
