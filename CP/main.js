const isabelleContainer = document.getElementById('isabelle');
const stephaneContainer = document.getElementById('stephane');
const letterContainer = document.getElementById('letter');
const numberContainer = document.getElementById('number');
const resultContainer = document.getElementById('result');

resultContainer.innerHTML = '';

let selectedId = 'isabelle';

let card = null;

function preload() {
	card = loadJSON('card.json');
}

function setup() {
	//console.log(JSON.stringify(card, null, 4));
}

const letters = [ 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H' ];
const numbers = [ '1', '2', '3', '4', '5', '6', '7', '8' ];

let selectedLetter = '';
let selectedNumber = '';
displayLetters();
displayNumbers();

function displayLetters() {
	letterContainer.innerHTML = letters
		.map((letter) => {
			let className = 'button';
			if (letter === selectedLetter) {
				className = className.concat(' selected');
			}
			return `<button class="${className}" onclick="handleButton(this)">${letter}</button>`;
		})
		.join('');
}

function displayNumbers() {
	numberContainer.innerHTML = numbers
		.map((num) => {
			let className = 'button';
			if (num === selectedNumber) {
				className = className.concat(' selected');
			}
			return `<button class="${className}" onclick="handleButton(this)">${num}</button>`;
		})
		.join('');
}

function handleId(id) {
	selectedId = id;
	if (selectedId === 'isabelle') {
		isabelleContainer.classList.add('selected');
		stephaneContainer.classList.remove('selected');
	} else {
		isabelleContainer.classList.remove('selected');
		stephaneContainer.classList.add('selected');
	}
	displayResult();
}

function handleButton(elt) {
	const text = elt.textContent;
	if (letters.includes(text)) {
		selectedLetter = text;
		displayLetters();
	}
	if (numbers.includes(text)) {
		selectedNumber = text;
		displayNumbers();
	}
	displayResult();
}

function getResult(letter, num, id) {
	console.log(letter, num, id);
	const code = new String(card[id][letter][Number(num) - 1]);
	return [ ...code ].join(' ');
}

function displayResult() {
	if (selectedLetter && selectedNumber) {
		const code = getResult(selectedLetter, selectedNumber, selectedId);
		resultContainer.innerHTML = code;
	}
}

function encode(code, format) {
	const f = [ ...format ];
	const codeStr = typeof code === 'string' ? [ ...code ] : [ ...code.toString() ];
	while (codeStr.length < 4) {
		codeStr.unshift('0');
	}
	const elements = codeStr.map((c, i) => {
		const n = Number(c);
		if (f[i] === '+') {
			return (n + 1) % 10;
		}
		if (f[i] === '-') {
			return (n + 9) % 10;
		}
		return n;
	});
	return elements.toString().split(',').join('');
}

console.log([ 1234, 1234, 1234, 1234, 1234, 1234, 1234, 1234 ].map((c) => encode(c, '-+=-')));
