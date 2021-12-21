// coded in p5.js

let buttonNew = null;
let buttonDef = null;
let buttonChoices = [];

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

let curIndex = -1;

const list = [];
let curLines = [
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

	list.push({title: "Revision Bilan Psychomoteur Vonsensey", page: curLines});

curLines = [
	{ word: "Amyotrophie", def: "diminution du volume musculaire secondaire à une lésion du nerf périphérique, une lésion primitive de la fibre musculaire, ou encore à la non-utilisation d’un membre."},
	{
		word: "Hypertrophie", def: "augmentation du volume musculaire, par exemple hypertrophie des épaules et mollets dans certaines myopathies (dystrophies musculaires)"
	},
	{ word: "Fasciculations", def: " au repos, contractions involontaires et brèves des fibres musculaires, visibles sous la peau, sans déplacement ; localisées, généralement bénignes, elles sont observées dans des lésions nerveuses périphériques ; généralisées, elles sont plus souvent observées dans les maladies de la corne antérieure de la moelle."},
{ word: "Myokymies", def: " au repos, ce sont des contractions involontaires des fibres musculaires qui sont plus grossières, plus lentes et plus prolongées que les fasciculations. Habituellement bénignes (myokymies des paupières)."},
{ word: "Crampe", def: " contraction involontaire, intense et douloureuse intéressant tout ou partie du muscle : crampe d’effort la plus fréquente ou encore ischémique, métabolique ou idiopathique. Peut accompagner les hypertonies (pyramidales ou extrapyramidales) et révéler certaines neuropathies."},
{ word: "Clonies/Myoclonies", def: " Les myoclonies sont des contractions musculaires brèves et involontaires, avec déplacement d'un segment de muscle, d'un muscle entier ou d'un groupe de muscles."},
{ word: "Myotonie", def: " Persistance d’une forte contraction musculaire après percussion du muscle. Elle se voit dans les maladies musculaires avec myotonie (maladie de Steinert et myotonie congénitale)."},
{ word: "Signe de Babinski", def: " défini par une extension lente et majestueuse du gros orteil, parfois associée à un écartement en éventail des autres orteils. (signe d’une atteinte pyramidale)"},
{ word: "Névralgie", def: " définie par le siège de la douleur sur le trajet d’un tronc nerveux. Elle peut être continue, ou intermittente avec paroxysmes, ou encore fulgurante (survenant par accès hyper-algiques)."},
{ word: "L’hyperpathie", def: " définit une souffrance plus étendue que la zone stimulée, plus prolongée que la stimulation et parfois déclenchée par des stimuli indolores."},
{ word: "L’hyperesthésie", def: " est définie par une exagération de la sensation."},
{ word: "L’allodynie", def: " c’est une perception douloureuse de stimuli non douloureux (allodynie au tact, ou thermique)."},
{ word: "Les paresthésies", def: " sont des sensations anormales de survenue spontanée. Elles sont décrites de façon variable selon les individus : picotements, fourmillements, plus rarement sensation de chaud et froid. Habituellement elles sont décrites comme peu ou pas désagréables, mais peuvent être parfois ressenties de façon douloureuse (comme les paresthésies à type de brûlures, les causalgies). Elles traduisent généralement l’atteinte des fibres myélinisées de gros diamètre, soit centrales soit périphériques."},
{ word: "Les dysesthésies", def: "correspondent aux mêmes types de sensation mais déclenchées par l’attouchement ou le frottement des zones intéressées."},
{ word: "La pallesthésie", def: "est l’étude de la perception du diapason appliqué sur des surfaces osseuses."},
{ word: "L’astéréognosie", def: "est définie comme l’impossibilité de reconnaître les objets ; elle est le plus souvent due à des lésions cérébrales pariétales controlatérales."},
{ word: "Fonctions exécutives", def: "ensemble de processus mentaux nécessaires pour la planifcation, la résolution de problème, l’organisation, l’imagination et le fait de faire des choix"},
{ word: "L’adiadococinésie", def: "est définie par la difficulté ou l’impossibilité à effectuer rapidement des mouvements alternatifs, au mieux mise en évidence par la manœuvre des marionnettes."},
{ word: "La dyschronomètrie", def: "est définie par le retard à l’initiation et à l’arrêt du mouvement, par exemple à la manœuvre doigt-nez exécutée simultanément par les deux index."},
{ word: "Hémiplégie ou hémiparésie", def: "les membres supérieurs et inférieurs, d’un même côté, sont affectés ainsi que la face. L’hémiplégie correspond à une paralysie totale et l’hémiparésie à une paralysie incomplète."},
{ word: "Hémiplégie proportionnelle", def: "égale sur tout l’hémicorps"},
{ word: "Hémiplégie à prédominance brachio-faciale", def: "prédominant au visage et au membre supérieur"},
{ word: "Monoparésie ou monoplégie", def: "atteinte d’un membre (monoplégie crurale d’un accident ischémique dans le territoire de l’artère cérébrale antérieure)."},
{ word: "Paraplégie et paraparésie", def: "atteinte des deux membres inférieurs, par atteinte centrale (moelle) ou nerveuse périphérique."},
{ word: "Tétraplégie ou tétraparésie", def: "atteinte des quatre membres : centrale (compression médullaire cervicale), périphérique (polyradiculonévrite aiguë)."},
{ word: "L’akinésie", def: "elle désigne la raréfaction de l’activité motrice du patient. C’est un trouble de l’initiation et de l’exécution du mouvement apparent dans la motilité volontaire et automatique."},
{ word: "Le nystagmus", def: "C’est une oscillation rythmique et conjuguée des globes oculaires. Il comporte deux secousses : l’une rapide, l’autre lente. En médecine, le sens du nystagmus est défini par celui de la secousse rapide : on dit que le nystagmus « bat » de ce côté-là. Le plan dans lequel s’effectue le nystagmus peut être horizontal, vertical, rotatoire, multiple."},
{ word: "Signe de Romberg labyrinthique", def: "Le patient étant debout, yeux fermés, talons joints, on observe de façon retardée une déviation latéralisée du corps. Cette manœuvre peut être sensibilisée si le patient, les membres inférieurs tendus, place ses index en face de ceux de l’examinateur : à l’occlusion des yeux on observe une déviation lente, retardée et latéralisée des index."},
{ word: "Les dysuries désignent les difficultés à l’évacuation des urines hors de la vessie."},
{ word: "Apraxie", def: "correspond à un trouble de la réalisation du geste volontaire vers un but, en l’absence de déficit sensitivomoteur, de trouble de la coordination, de trouble de la compréhension ou de la reconnaissance, et de déficit intellectuel important."},
{ word: "Agnosies", def: "Ce sont des troubles de la reconnaissance des objets connus et familiers survenant pour une modalité sensorielle donnée, alors que les étapes de perception de cette modalité visuelle sont préservées chez un patient ne présentant ni trouble de la conscience, ou de la vigilance, ni aphasie, ni déficit intellectuel. Exemples : agnosie des visages familiers : prosopagnosie, agnosie des couleurs, etc."},
{ word: "Anosognosie", def: "Le malade n'a pas conscience de son trouble"},
{ word: "Ataxie", def: "(étymologiquement absence d'ordre). C’est une perturbation de l'équilibre et de la coordination motrice. Elle peut être décomposée en ataxie statique (station debout altérée), ataxie locomotrice (trouble de la marche), ou ataxie cinétique (lors du geste volontaire). "}
];

list.push({title: "Glossaire de la sémiologie neurologique", page: curLines});

	/*
// read file
window.onload = function(event) {
	document.getElementById('fileInput').addEventListener('change', handleFileSelect, false);
};
*/
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

let lines = null;

function initPressed(curIndex) {
	return function() {init(curIndex);}
}

function init(curIndex) {
	lines = list[curIndex].page;
	execute();
}

function execute() {
	word = 0;
	if( lines ) {
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
	} else {
		// choose a list
		let pageIndex = 0;
		for( const page of list ) {
			const button = createButton(page.title);
			buttonChoices.push( button );
			button.mousePressed( initPressed(pageIndex) );
			button.parent('button');
			pageIndex++;
		}
	}
}
