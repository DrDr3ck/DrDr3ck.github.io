let button = null;

let word = 0;

function setup() {
	canvas = createCanvas(1, 1);
    canvas.parent('canvas');
    
    execute();
}

function draw() {
	background(255);
}

function newWord() {
	document.getElementById('content').innerHTML = `${lines[word]} (${word + 1}/${lines.length})`;
	word = (word + 1) % lines.length;
}

let lines = [
	'Tonus',
	'Tonus musculaire',
	'Tonus actif',
	'Tonus fusorial',
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
	if (!button) {
		button = createButton('New word');
		button.mousePressed(newWord);
		button.parent('button');
	}
	lines.sort((a, b) => random(-1, 1));
	newWord();
}
