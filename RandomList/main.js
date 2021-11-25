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
	{ word: "Psychomotricité", def: "Intégration des fonctions motrices et psychiques résultant de la maturation du système nerveux."},
	{ word: "Fonctions psychomotrices :",
	def: "Fonctions mentales spécifiques au contrôle sur les événements, à la fois moteur et psychologique au niveau du corps."},
	{ word: "Citer les fonctions du bilan psychomoteur :",
	def: "Acte de participation au diagnostic médical, Photos des compétences, Dédramatisation où amplification d'un signal d'alerte, Première rencontre et base de l'Alliance thérapeutique."},
	{ word: "Étape du bilan psychomoteur (5) :",
	def: "Adresse, entretien, examen, synthèse des résultats, restitution."},
	{ word: "Citer les 7 items vu en bilan psychomoteur :",
	def: "Tonus, latéralité, schéma corporel, équilibre, coordination, structuration spatiale, structuration temporelle."},
	{ word: "Calcul du Z-score :",
	def: "Z score = note – moyenne / par écart-type."},
	{ word: "Quelles sont les normes des personnes ? Notes standard et Z score ?",
	def: "Percentiles. 50e, 15e, 5e. <br>\
	Note standard. 10. 7. 5. <br>\
	Z score : 1 a - 1  écart-type, -1  a -2 écarts-type, Plus de - 2."},
	{ word: "Définir la tonicité.",
	def: "Possibilité de recrutement et de modulation du tonus afin de communiquer."},
	{ word: "Définir le tonus de fond :",
	def: "Contraction isométrique minimum. Qui permet de maintenir le sentiment d'unité. Et de globalité du corps."},
	{ word: "Définir le tonus de soutien :",
	def: "Permer de se sentir en équilibre dans une posture stable = Maintien de l'axe "},
	{ word: "Définir le tonus d'action :",
	def: "Prépare, orientent et soutient le mouvement."},
	{ word: "Comment tester le tonus de fond ?",
	def: "Par le ballant."},
	{ word: "Comment tester le tonus de soutien ?",
	def: "Par la résistance à la poussée."},
	{ word: "Comment tester le tonus d'action ?",
	def: "Par la mise en évidence des syncinésies."},
	{ word: "Quelles sont les caractéristiques À observer lors de syncinésies ?",
	def: "Leur localisation, l'intensité, la nature (= Imitation/diffusion) et la différence droite-gauche."},
	{ word: "Quels sont les 3 axes du schéma corporel ? Puis citer une épreuve par axe.",
	def: "Connaissance des parties du corps (Épreuve de Berges Et Lezine vocabulaire) <br>\
	Représentation du corps (Dessin du bonhomme.) <br>\
	Organisation gnoso-Praxique (EMG)"},
	{ word: "Définir Gnosie :",
	def: "Faculté d’interpréter une sensation en la confortant à des souvenirs anciens."},
	{ word: "Définir Praxie :",
	def: "Ensemble des fonctions de coordination et d’adaptation des mouvements volontaires dans le but d’accomplir une tâche donnée."},
	{ word: "Définir l’ambilatéralité.",
	def: "Préférences de certaines activités avec une main et d'autres avec l’autre"},
	{ word: "Définir la dyslatéralité.",
	def: "Discordance entre latéralité tonique et d'utilisation + Maladresse "},
	{ word: "Âge de la Latéralité.",
	def: "3/4 ans."},
	{ word: "Ambidextrie possible jusqu'à.",
	def: "6/7 ans."},
	{ word: "Motricité globale.",
	def: "Contrôle de l'ensemble du corps (Réponse motrice.) en mouvement."},
	{ word: "Citez les 4 sous items de la motricité globale.",
	def: "Équilibre statique, équilibre dynamique. Dissociation. Coordination dynamique générale."},
	{ word: "Citer les 4 composantes du bilan Charlop Atwell ? ",
	def: "Coordination, membre supérieur /Membres inférieurs, Coordination 2 actions simultanées, Équilibre dynamique, Équilibre statique."},
	{ word: "Définir la motricité fine.",
	def: "Activité motrice sans déplacement du centre de gravité."},
	{ word: "Le geste adroit doit être :",
	def: "Adapté, précis, planifié, rapide, économique."},
	{ word: "Citer les différentes composantes de la motricité fine.",
	def: "Déliement digital, Habilité manuelle (uni et bi) Coordination oculo manuelle dans les gestes fins, Précision visuo motrice, Motricité faciale. "},
	{ word: "Quelles sont les 3 composantes de l'évaluation du temps ?",
	def: "Connaissance et utilisation du vocabulaire. Sériation (action sur images à remettre dans l’ordre) Structuration spatiale"},
	{ word: "Définir la structuration spatiale ?",
	def: "Exploration de l’espace par le mouvement (int ou ext), la perception des rapports spatiaux entre les objets et la possibilité de s’y adapter "},
	{ word: "Définir l’orientation spatiale ? ",
	def: "Associer à la perception = recueillir et discriminer les infos sensorielles "},
	{ word: "Définir l’organisation spatiale ?",
	def: "Associer à l’abstraction et au raisonnement = imagerie mentale, capacité a se décentrer"}];

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
