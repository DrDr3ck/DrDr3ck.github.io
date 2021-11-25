// coded in p5.js

let buttonNew = null;
let buttonDef = null;

let word = 0;

function setup() {
	canvas = createCanvas(1, 1);
    canvas.parent('canvas');
    
    execute();
}

function draw() {
	background(255);
}

function isObject(val) {
    return val instanceof Object; 
}

function getWord(index) {
	const val = lines[index];
	if( isObject(val) ) {
		return val.word;
	}
	return val;
}

function getDefinition(index) {
	const val = lines[index];
	if( isObject(val) ) {
		return val.def;
	}
	return "pas de definition";
}

function displayWord() {
	document.getElementById('content').innerHTML = `${getWord(word)} (${word + 1}/${lines.length})`;
}

function displayButtons() {
	if( isObject(lines[word]) ) {
		buttonDef.show();
		buttonNew.hide();
	} else {
		buttonNew.show();
		buttonDef.hide();	
	}
}

function newWord() {
	word = (word + 1) % lines.length;
	displayWord();
	displayButtons();
}

function definition() {
	document.getElementById('content').innerHTML = `${getWord(word)} (${word + 1}/${lines.length})<br>${getDefinition(word)}`;
	buttonNew.show();
	buttonDef.hide();
}

let lines = [
	{word: 'Tonus', def: 'le tonus est...'},
	{word: 'Tonus musculaire', def: 'le tonus musculaire est...'},
	{word: 'Tonus actif', def: 'le tonus actif est...'},
	{word: 'Tonus fusorial', def: 'le tonus fusorial est...'},
	'3 types de tonus',
	'Proprioception',
	'Schemes',
	'Dialogue tonique ',
	'Les 3 corps du developpement psychomoteur ',
	'Dystonie ',
	'Dysharmonie tonique',
	'Paratonie ',
	'Tremblement',
	'TIC',
	'Begaiement',
	'Hyperactivite',
	'Dyspraxie',
	'Schemes tonique',
	'Somatognosie',
	'Praxis',
	'Praxie',
	'Corporeite',
	'Schema corporel',
	'Corps complexe',
	'Corps adroit',
	'Corps signifiant ',
	'Corps conscient ',
	'Semiologie ',
	'Trouble',
	'Etiologie',
	'Pathogenie',
	'Trouble psychomoteur'
];

// read file
window.onload = function(event) {
	document.getElementById('fileInput').addEventListener('change', handleFileSelect, false);
};
const handleFileSelect = (event) => {
	lines = [];
	var fileReader = new FileReader();
	fileReader.onload = function(event) {
		readFile(event.target.result);
		execute();
	};
	var file = event.target.files[0];
	fileReader.readAsText(file);
};
function readFile(text) {
	lines.push(...text.split('\n'));
	lines = lines.filter((line) => line !== '');
}

function execute() {
	word = 0;
	if (!buttonNew) {
		buttonNew = createButton('New word');
		buttonNew.hide();
		buttonNew.style('background-color', '#f39c12');
		buttonNew.mousePressed(newWord);
		buttonNew.parent('button');
	}
	if( !buttonDef) {
		buttonDef = createButton('Definition');
		buttonDef.show();
		buttonDef.style('background-color', '#28b463');
		buttonDef.mousePressed(definition);
		buttonDef.parent('button');
	}
	lines.sort((a, b) => random(-1, 1));
	displayWord();
	displayButtons();
}
