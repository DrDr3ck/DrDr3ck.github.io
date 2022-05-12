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

var suffix = [
	"Neigeux",
	"Brillant",
	"Ancienne",
	"Éclairée",
	"Invisible",
	"du Roatou",
	"du Talet",
	"du Caseau",
	"de la Pagny",
	"de la Plainoît",
	"du Navire Coulé",
	"Diaboliques",
	"Agité",
	"de Granit",
	"de Vulpin",
	"du Navire Brisé",
	"de Maitou",
	"de la Bounau",
	"d'Argenvers",
	"du Tally",
	"d'Oasis",
	"de Méduse",
	"Pourrie",
	"de Rugissement",
	"Perpétuelle",
	"de Vierrault",
	"des Clalliers",
	"de la Dives",
	"des Courmans",
	"de la Perpibeuge",
	"de Pêcheurs",
	"Dentelé",
	"Arctique",
	"Isolé",
	"Mélancolique",
	"de Granit",
	"de la Martissonne",
	"du Maugnane",
	"de Vinrac",
	"de la Vitrovin"
];

var prefix = [
	"l'Archipel",
	"le Récif",
	"la Chaîne",
	"l'Atoll",
	"les Atolls",
	"le Mur",
	"les Murs",
	"le Canyon",
	"les Canyons",
	"le Ravin",
	"les Ravins",
	"le Promontoire",
	"les Promontoires",
	"le Havre",
	"l'Île",
	"les Îles",
	"l'Enclave",
	"la Péninsule",
	"le Gouffre",
	"le Rocher",
	"les Rochers",
	"les Abîmes",
	"l'Abîme",
	"l'Abysse",
	"les Abysses"
];

function getRandomName() {
	var pre = prefix[Math.floor(Math.random() * prefix.length)];
	var suf = suffix[Math.floor(Math.random() * suffix.length)];
	return `${pre} ${suf}`;
}

console.log(getRandomName());
