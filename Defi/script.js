const cases = ["+","-"];

const max = 10;

let rows = [];

let allRows = [];

let total = 0;

let maxTotal = 0;
let maxIndex = 0;

const allTotal = [];

let occurrences = [];

function initMaxRow(initRow = []) {
	rows = [];
	if( initRow.length === 0 ) {
		const maxRow = [];
		for (let i = 0; i < max; i++) {
			const r = random(1);
			if( r < 0.5 ) {
				maxRow.push("-");
			} else {
				maxRow.push("+");
			}
		}
		rows.push(maxRow);
	} else {
		rows.push([...initRow]);
	}
}

function computeNextRow(curRow) {
	const nextRow = [];
	for( let i=1; i < curRow.length; i++ ) {
		if( curRow[i-1] === curRow[i] ) {
			nextRow.push("+");
		} else {
			nextRow.push("-");
		}
	}
	return nextRow;
}

function computeRows() {
	while( rows[rows.length-1].length !== 1 ) {
		const nextRow = computeNextRow(rows[rows.length-1]);
		rows.push(nextRow);
	}
}

function countMinus(index = 0) {
	total = 0;
	for( const row of rows ) {
		for( const c of row ) {
			if( c === "-" ) {
				total = total + 1;
			}
		}
	}
	allTotal.push(total);
	if( total > maxTotal ) {
		maxTotal = total;
		maxIndex = index;
	}
}

function getOccurrenceCounts(arr) {
	let counts = {};
  
	for (let i = 0; i < arr.length; i++) {
	  let num = arr[i];
	  counts[num] = counts[num] ? counts[num] + 1 : 1;
	}
  
	return counts;
  }

function setup() {
	canvas = createCanvas(1200, 800);
	canvas.parent('canvas');

	const maxRows = 2**max;
	for (let i = 0; i < maxRows; i++) {
		let binary = i.toString(2).padStart(max, '0');
		allRows.push(binary.split("").map((char) => {
			if (char === "0") {
			  return "-";
			} else if (char === "1") {
			  return "+";
			}
		  })
		);
	}

	for( let i = 0; i < allRows.length; i++ ) {
		initMaxRow(allRows[i]);
		computeRows();
		countMinus(i);
	}

	allTotal.sort();

	occurrences = getOccurrenceCounts(allTotal);

	console.log(occurrences);

	rows = [allRows[maxIndex]];
	computeRows();
}

function displayRows() {
	const X = 100;
	const Y = 150;
	let dx = 0;
	let dxx = 0;
	let dy = 600-60;
	for( const row of rows ) {
		for( const c of row ) {
			if( c === "+" ) {
				fill(50,250,50);
			} else {
				fill(250,50,50);
			}
			ellipse(X+dx, Y+dy, 40);
			dx = dx + 60;
		}
		dy = dy-60;
		dxx = dxx + 30;
		dx = dxx;
	}
}

function draw() {
	background(80);

	textSize(16);
	noStroke();
	fill(198, 255, 244);
	text("Defi", 100, 100);

	text(maxTotal, 500,100);

	stroke(1);
	displayRows(maxIndex);
}

function mousePressed() {
}

function keyPressed() {
	if (key === 's') {
	}
}
