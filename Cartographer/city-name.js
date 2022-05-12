// https://www.fantasynamegenerators.com/yourArt.php

const MASCULIN = "masculin";
const FEMININ = "feminin";

const SINGULIER = "1";
const PLURIEL = "100";

var suffixes = [
	{genre: MASCULIN, nombre: SINGULIER, name: "Neigeux"},
	{genre: FEMININ, nombre: SINGULIER, name: "Neigeuse"},
	{genre: MASCULIN, nombre: PLURIEL, name: "Neigeux"},
	{genre: FEMININ, nombre: PLURIEL, name: "Neigeuses"},
	{genre: MASCULIN, nombre: SINGULIER, name: "Brillant"},
	{genre: MASCULIN, nombre: SINGULIER, name: "Ancien"},
	{genre: FEMININ, nombre: SINGULIER, name: "Ancienne"},
	{genre: MASCULIN, nombre: PLURIEL, name: "Anciens"},
	{genre: FEMININ, nombre: PLURIEL, name: "Anciennes"},
	{genre: MASCULIN, nombre: SINGULIER, name: "Éclairé"},
	{genre: FEMININ, nombre: SINGULIER, name: "Éclairée"},
	{genre: MASCULIN, nombre: PLURIEL, name: "Éclairés"},
	{genre: FEMININ, nombre: PLURIEL, name: "Éclairées"},
	{genre: MASCULIN, nombre: SINGULIER, name: "Invisible"},
	{genre: MASCULIN, nombre: SINGULIER, name: "Diabolique"},
	{genre: FEMININ, nombre: SINGULIER, name: "Diabolique"},
	{genre: MASCULIN, nombre: PLURIEL, name: "Diaboliques"},
	{genre: FEMININ, nombre: PLURIEL, name: "Diaboliques"},
	{genre: MASCULIN, nombre: SINGULIER, name: "Brûlé"},
	{genre: FEMININ, nombre: SINGULIER, name: "Brûlée"},
	{genre: MASCULIN, nombre: PLURIEL, name: "Brûlés"},
	{genre: FEMININ, nombre: PLURIEL, name: "Brûlées"},
	{genre: MASCULIN, nombre: SINGULIER, name: "Fané"},
	{genre: FEMININ, nombre: SINGULIER, name: "Fanée"},
	{genre: MASCULIN, nombre: PLURIEL, name: "Fanés"},
	{genre: FEMININ, nombre: PLURIEL, name: "Fanées"},
	{genre: MASCULIN, nombre: SINGULIER, name: "Agité"},
	{genre: FEMININ, nombre: SINGULIER, name: "Agitée"},
	{genre: MASCULIN, nombre: PLURIEL, name: "Agités"},
	{genre: FEMININ, nombre: PLURIEL, name: "Agitées"},
	{genre: MASCULIN, nombre: SINGULIER, name: "Gelé"},
	{genre: FEMININ, nombre: SINGULIER, name: "Gelée"},
	{genre: MASCULIN, nombre: PLURIEL, name: "Gelés"},
	{genre: FEMININ, nombre: PLURIEL, name: "Gelées"},
	{genre: MASCULIN, nombre: SINGULIER, name: "Pourri"},
	{genre: FEMININ, nombre: SINGULIER, name: "Pourrie"},
	{genre: MASCULIN, nombre: SINGULIER, name: "Dentelé"},
	{genre: MASCULIN, nombre: SINGULIER, name: "Arctique"},
	{genre: MASCULIN, nombre: SINGULIER, name: "Isolé"},
	{genre: FEMININ, nombre: SINGULIER, name: "Isolée"},
	{genre: MASCULIN, nombre: PLURIEL, name: "Isolés"},
	{genre: FEMININ, nombre: PLURIEL, name: "Isolées"},
	{genre: MASCULIN, nombre: SINGULIER, name: "Blanc"},
	{genre: FEMININ, nombre: SINGULIER, name: "Blanche"},
	{genre: MASCULIN, nombre: PLURIEL, name: "Blancs"},
	{genre: FEMININ, nombre: PLURIEL, name: "Blanches"},
	{genre: MASCULIN, nombre: SINGULIER, name: "Noir"},
	{genre: FEMININ, nombre: SINGULIER, name: "Noire"},
	{genre: MASCULIN, nombre: PLURIEL, name: "Noirs"},
	{genre: FEMININ, nombre: PLURIEL, name: "Noires"},
	{genre: MASCULIN, nombre: SINGULIER, name: "Perpétuel"},
	{genre: FEMININ, nombre: SINGULIER, name: "Perpétuelle"},
	{genre: MASCULIN, nombre: PLURIEL, name: "Perpétuels"},
	{genre: FEMININ, nombre: PLURIEL, name: "Perpétuelles"},
	{genre: MASCULIN, nombre: SINGULIER, name: "Mélancolique"},
	{genre: FEMININ, nombre: SINGULIER, name: "Mélancolique"},
	{genre: MASCULIN, nombre: PLURIEL, name: "Mélancoliques"},
	{genre: FEMININ, nombre: PLURIEL, name: "Mélancoliques"},
	{name: "de Cristal"},
	{name: "du Roatou"},
	{name: "du Talet"},
	{name: "du Caseau"},
	{name: "de la Pagny"},
	{name: "de la Plainoît"},
	{name: "du Navire Coulé"},
	{name: "de Granit"},
	{name: "du Roulogne"},
	{name: "de Vulpin"},
	{name: "du Navire Brisé"},
	{name: "de Maitou"},
	{name: "de la Bounau"},
	{name: "d'Argenvers"},
	{name: "du Tally"},
	{name: "d'Oasis"},
	{name: "de Méduse"},
	{name: "de Rugissement"},
	{name: "de Vierrault"},
	{name: "des Clalliers"},
	{name: "de la Dives"},
	{name :"de l'Abîme"},
	{name: "des Courmans"},
	{name: "de la Perpibeuge"},
	{name: "de Pêcheurs"},
	{name: "de Granit"},
	{name: "de la Martissonne"},
	{name: "du Maugnane"},
	{name: "de Vinrac"},
	{name: "de la Vitrovin"}
];

function addAdjectif(adjectif) {
	return [
		{genre: MASCULIN, nombre: SINGULIER, name: adjectif},
		{genre: FEMININ, nombre: SINGULIER, name: `${adjectif}e`},
		{genre: MASCULIN, nombre: PLURIEL, name: `${adjectif}s`},
		{genre: FEMININ, nombre: PLURIEL, name: `${adjectif}es`}
	];
}

function addAdjectifNeutre(adjectif) {
	return [
		{genre: MASCULIN, nombre: SINGULIER, name: adjectif},
		{genre: FEMININ, nombre: SINGULIER, name: `${adjectif}`},
		{genre: MASCULIN, nombre: PLURIEL, name: `${adjectif}s`},
		{genre: FEMININ, nombre: PLURIEL, name: `${adjectif}s`}
	];
}

suffixes.push(...addAdjectif("Ecarté"));
suffixes.push(...addAdjectif("Malveillant"));
suffixes.push(...addAdjectif("Etroit"));
suffixes.push(...addAdjectif("Troublant"));
suffixes.push(...addAdjectif("Nu"));
suffixes.push(...addAdjectif("Corrompu"));
suffixes.push(...addAdjectif("Effrayant"));
suffixes.push(...addAdjectif("Ardent"));
suffixes.push(...addAdjectif("Obscur"));
suffixes.push(...addAdjectifNeutre("Sauvage"));
suffixes.push(...addAdjectifNeutre("Monotone"));
suffixes.push(...addAdjectifNeutre("Impossible"));
suffixes.push(...addAdjectifNeutre("Précaire"));

var prefixes = [
	{genre: MASCULIN, nombre: SINGULIER, name:"l'Archipel"},
	{genre: MASCULIN, nombre: PLURIEL, name:"les Archipels"},
	{genre: MASCULIN, nombre: SINGULIER, name:"le Récif"},
	{genre: MASCULIN, nombre: PLURIEL, name:"les Récifs"},
	{genre: FEMININ, nombre: SINGULIER, name:"la Chaîne"},
	{genre: MASCULIN, nombre: SINGULIER, name:"l'Atoll"},
	{genre: MASCULIN, nombre: PLURIEL, name:"les Atolls"},
	{genre: MASCULIN, nombre: SINGULIER, name:"le Mur"},
	{genre: MASCULIN, nombre: PLURIEL, name:"les Murs"},
	{genre: MASCULIN, nombre: SINGULIER, name:"le Canyon"},
	{genre: MASCULIN, nombre: PLURIEL, name:"les Canyons"},
	{genre: MASCULIN, nombre: SINGULIER, name:"le Ravin"},
	{genre: MASCULIN, nombre: PLURIEL, name:"les Ravins"},
	{genre: MASCULIN, nombre: SINGULIER, name:"le Promontoire"},
	{genre: MASCULIN, nombre: PLURIEL, name:"les Promontoires"},
	{genre: MASCULIN, nombre: SINGULIER, name:"le Havre"},
	{genre: FEMININ, nombre: SINGULIER, name:"l'Île"},
	{genre: FEMININ, nombre: PLURIEL, name:"les Îles"},
	{genre: FEMININ, nombre: SINGULIER, name:"la Friche"},
	{genre: FEMININ, nombre: PLURIEL, name:"les Friches"},
	{genre: FEMININ, nombre: SINGULIER, name:"la Steppe"},
	{genre: FEMININ, nombre: PLURIEL, name:"les Steppes"},
	{genre: FEMININ, nombre: SINGULIER, name:"la Savane"},
	{genre: FEMININ, nombre: PLURIEL, name:"les Savanes"},
	{genre: FEMININ, nombre: SINGULIER, name:"la Frontière"},
	{genre: FEMININ, nombre: PLURIEL, name:"les Frontières"},
	{genre: FEMININ, nombre: SINGULIER, name:"l'Enclave"},
	{genre: FEMININ, nombre: SINGULIER, name:"la Péninsule"},
	{genre: MASCULIN, nombre: SINGULIER, name:"le Gouffre"},
	{genre: MASCULIN, nombre: PLURIEL, name:"les Gouffres"},
	{genre: MASCULIN, nombre: SINGULIER, name:"le Rocher"},
	{genre: MASCULIN, nombre: PLURIEL, name:"les Rochers"},
	{genre: MASCULIN, nombre: SINGULIER, name:"le Désert"},
	{genre: MASCULIN, nombre: PLURIEL, name:"les Déserts"},
	{genre: MASCULIN, nombre: SINGULIER, name:"le Champ"},
	{genre: MASCULIN, nombre: PLURIEL, name:"les Champs"},
	{genre: MASCULIN, nombre: PLURIEL, name:"les Abîmes"},
	{genre: MASCULIN, nombre: SINGULIER, name:"l'Abîme"},
	{genre: MASCULIN, nombre: SINGULIER, name:"l'Abysse"},
	{genre: MASCULIN, nombre: PLURIEL, name:"les Abysses"},
	{genre: MASCULIN, nombre: SINGULIER, name:"le Refuge"},
	{genre: MASCULIN, nombre: PLURIEL, name:"les Refuges"},
];

// Friche Etendue Region Prairie Landes Arriere-Pays Terrain Domaine 

function getRandomName() {
	var pre = prefixes[Math.floor(Math.random() * prefixes.length)];
	var filteredSuffix = suffixes.filter(s=>(s.genre === pre.genre && s.nombre === pre.nombre) || !s.genre);
	var prefix = pre.name;
	if( pre.nombre == PLURIEL && Math.random() > 0.3 ) {
		// add a number between 'les' and the word
		const size = [
			"Deux", "Trois", "Quatre", "Cinq", "Six", "Sept", "Huit", "Neuf",
			"Dix-Huit", "Trente-Cinq", "Soixante-Quinze", "Vingt-Trois",
			"Cents", "Six Cent Soixante Six", "Mille", "Six Milles"
		];
		const s = size[Math.floor(Math.random() * size.length)];
		const words = pre.name.split(" "); 
		words.splice(1,0,s);
		prefix = words.join(" ");
	}
	if( pre.nombre === SINGULIER && Math.random() > 0.3 ) {
		const words = pre.name.split(" ");
		if( words[0] === "le" ) {
			const adjs = ["Grand", "Magnifique", "Dernier", "Vieux", "Premier", "Second", "Petit", "Minuscule"];
			const adj = adjs[Math.floor(Math.random() * adjs.length)];
			words.splice(1,0,adj);
			prefix = words.join(" ");
		} else if( words[0] === "la" ) {
			const adjs = ["Grande", "Belle", "Dernière", "Vieille", "Première", "Seconde", "Petite", "Minuscule"];
			const adj = adjs[Math.floor(Math.random() * adjs.length)];
			words.splice(1,0,adj);
			prefix = words.join(" ");
		}
	}
	var suf = filteredSuffix[Math.floor(Math.random() * filteredSuffix.length)];
	return `${prefix} ${suf.name}`;
}


const names= [];
for(let i=0; i < 100; i++) {
	const name = getRandomName();
	if( !names.includes(name) ) {
		names.push(name);
	} else {
		console.log("duplicate: ", name);
	}
}

console.log(names);

