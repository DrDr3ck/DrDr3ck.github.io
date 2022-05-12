// https://www.fantasynamegenerators.com/yourArt.php

/*
Poignan
Auberluire
Haguelet
Maugnan
Antomomble
Bormart
Péritou
Martirgues
Belrac
Aurilimar
Bourlimar
Carcalliers
Soicourt
Aurirac
Coloville
Aubermur
Chollon
Martimasse
Montnesse
Bourmomble
Argenvin
Vagnan
Villeurtou
Soission
Lippe
Nanlun
Fréppe
Beauluçon
Argenseau
Chanoît
Puzon
Vierteaux
Martilon
Bourbeuge
Plaiteaux
Mariville
Besanbagne
Béssion
Valès
Chally
Drathune
Roallac
Borbagne
Bornin
Maully
Plaissy
Angoumasse
Perpillac
Borlet
Pasier
Montris
Argenluire
Levasir
Nanmart
Martibagne
Roaville
Levaves
Rounoît
Montyonne
Carcassion
bellvault
castlehand
limehaven
maplehorn
timberbreak
honeywell
wildebreak
sandfair
summermond
lostbreak
grimewatch
falseford
silverreach
houndmount
hollowfort
cursecairn
baybreach
angelvalley
bouldermere
sandpass
blindshade
lagoonward
wildward
hazelbay
bellshire
gloomgate
frostrun
embermaw
ebonscar
baygrove
dogyard
castlebourne
timberbreak
starfell
ragesummit
falsehand
knighttown
autumnfort
thornwick
swamphaven


The Clay Cliffs
The Pinetree Ravine
The Distant Cliff
The Bellowing Fjords
The Bellowing Fjords
The Faraway Wall
Rothely Cliffs
Bordtois Cliff
Eatogan Crag
Westrath Cliffs

 mom Hill
grurk Hill
rowlob Square
limot District
splotteos Vale
South hafisp
kiafop Yard
Lower South yicaint
jedutmus Side
East bruwonwic Road

Vault of Oblivion
Borough of Desertion
Cove of Shadows
Town of the Damned
Borough of Water
The Cracking Village
The Obsidian River
The Cracking Temple
The Remnant Town
The Sleeping Reef

le Havre Neigeux
l'Archipel Brillant
la Péninsule Ancienne
l'Île Éclairée
la Péninsule Invisible
l'Île du Roatou
l'Île du Talet
le Récif du Caseau
la Chaîne de la Pagny
l'Atoll de la Plainoît

le Mur du Navire Coulé
les Canyons Diaboliques
le Ravin Agité
les Abîmes de Granit
les Promontoires de Vulpin
les Murs du Navire Brisé
l'Abysse de Maitou
le Promontoire de la Bounau
le Gouffre d'Argenvers
les Murs du Tally

la Péninsule d'Oasis
l'Île de Méduse
l'Île Pourrie
l'Île de Rugissement
l'Enclave Perpétuelle
le Havre de Vierrault
l'Île des Clalliers
l'Île de la Dives
l'Enclave des Courmans
la Péninsule de la Perpibeuge

le Gouffre de Pêcheurs
le Rocher Dentelé
l'Abysse Arctique
le Rocher Isolé
le Rocher Mélancolique
le Promontoire de Granit
les Abîmes de la Martissonne
l'Abysse du Maugnane
l'Abysse de Vinrac
l'Abîme de la Vitrovin
*/

const MASCULIN = "masculin";
const FEMININ = "feminin";

const SINGULIER = "1";
const PLURIEL = "100";

// <a href="mailto:nom@adresse?subject=Titre&body=copie ton image ici en faisant CTRL+V">ici</a>

// Ecartee Precaire Malveillante Etroit Troublante Nue Impossible Monotone Corrompue Effrayante Ardents Obscure Sauvage

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
	{name: "Mélancolique"},
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
	{name: "Perpétuelle"},
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
	if( pre.nombre > 1 && Math.random() > 0.3 ) {
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
