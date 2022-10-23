class Board {
    constructor() {
        this.chantiers = [];
        this.team = [allOuvriers.pop()];
        this.points = 0;
        this.ecus = 10;

        this.actions = [];
    }

    addOuvrier(ouvrier) {
        this.team.push(ouvrier);
    }

    addChantier(chantier) {
        this.chantiers.push(chantier);
    }

    workOuvrier(ouvrier, chantierName) {
        const chantier = findChantier(chantierName);
        chantier.addOuvrier(ouvrier);
    }

    takeEcus() {
        if( this.actions.length === 2 ) {
            this.ecus += 1;
        }
        if( this.actions.length === 1 ) {
            this.ecus += 3;
        }
        if( this.actions.length === 0 ) {
            this.ecus += 6;
        }
    }

    addAction(type, data) {
        this.actions.push({type, data});
    }
}

class Chantier {
    constructor(name, index, materiaux, ecus, points) {
        this.name = name;
        this.index = index;
        this.materiaux = materiaux;
        this.ecus = ecus;
        this.points = points;
        this.ouvriers = [];
    }

    addOuvrier(ouvrier) {
        this.ouvriers.push(ouvrier);
        // check if Chantier is 'terminated'
    }
}

class Ouvrier {
    constructor(name, index, materiaux, ecus) {
        this.name = name;
        this.index = index;
        this.materiaux = materiaux;
        this.ecus = ecus;
    }
}

const allOuvriers = [];
const allChantiers = [];
const allMachines = [];

function addOuvrier(name, materiaux, ecus) {
    allOuvriers.push(new Ouvrier(name, allOuvriers.length, materiaux, ecus));
}

function addChantier(name, materiaux, ecus, points) {
    allChantiers.push(new Chantier(name, allChantiers.length, materiaux, ecus, points));
}

function addMachine(name, materiauxChantier, points, materiauxOuvrier) {
    allMachines.push(
        {
            name,
            materiauxChantier,
            points,
            materiauxOuvrier
        }
    )
}

addMachine("Un four à tuiles", {pierre: 2, bois: 1}, 2, {tuile: 3});
addMachine("Un four à tuiles", {bois: 1, savoir: 1}, 1, {tuile: 2});
addMachine("Une scie circulaire", {pierre: 1, savoir: 1}, 1, {bois: 2});
addMachine("Une scie circulaire", {savoir: 2, tuile: 1}, 2, {bois: 3});
addMachine("Un instrument de mesure", {pierre: 1, bois: 1}, 1, {savoir: 2});
addMachine("Un instrument de mesure", {pierre: 1, tuile: 2}, 2, {savoir: 3});
addMachine("Une grue", {bois: 2, savoir: 1}, 2, {pierre: 3});
addMachine("Une grue", {bois: 1, tuile: 1}, 1, {pierre: 2});

// 6
addOuvrier("APPRENTI", {pierre: 1, bois: 1, savoir: 0, tuile: 0}, 2);
addOuvrier("APPRENTI", {pierre: 1, bois: 0, savoir: 1, tuile: 0}, 2);
addOuvrier("APPRENTI", {pierre: 1, bois: 0, savoir: 0, tuile: 1}, 2);
addOuvrier("APPRENTI", {pierre: 0, bois: 1, savoir: 1, tuile: 0}, 2);
addOuvrier("APPRENTI", {pierre: 0, bois: 1, savoir: 0, tuile: 1}, 2);
addOuvrier("APPRENTI", {pierre: 0, bois: 0, savoir: 1, tuile: 1}, 2);

// 12
addOuvrier("MANOEUVRE", {pierre: 2, bois: 1, savoir: 0, tuile: 0}, 3);
addOuvrier("MANOEUVRE", {pierre: 2, bois: 0, savoir: 1, tuile: 0}, 3);
addOuvrier("MANOEUVRE", {pierre: 2, bois: 0, savoir: 0, tuile: 1}, 3);
addOuvrier("MANOEUVRE", {pierre: 1, bois: 2, savoir: 0, tuile: 0}, 3);
addOuvrier("MANOEUVRE", {pierre: 1, bois: 0, savoir: 2, tuile: 0}, 3);
addOuvrier("MANOEUVRE", {pierre: 1, bois: 0, savoir: 0, tuile: 2}, 3);
addOuvrier("MANOEUVRE", {pierre: 0, bois: 2, savoir: 1, tuile: 0}, 3);
addOuvrier("MANOEUVRE", {pierre: 0, bois: 2, savoir: 0, tuile: 1}, 3);
addOuvrier("MANOEUVRE", {pierre: 0, bois: 1, savoir: 2, tuile: 0}, 3);
addOuvrier("MANOEUVRE", {pierre: 0, bois: 1, savoir: 0, tuile: 2}, 3);
addOuvrier("MANOEUVRE", {pierre: 0, bois: 0, savoir: 2, tuile: 1}, 3);
addOuvrier("MANOEUVRE", {pierre: 0, bois: 0, savoir: 1, tuile: 2}, 3);

// 16
addOuvrier("COMPAGNON", {pierre: 3, bois: 1, savoir: 0, tuile: 0}, 4);
addOuvrier("COMPAGNON", {pierre: 2, bois: 2, savoir: 0, tuile: 0}, 4);
addOuvrier("COMPAGNON", {pierre: 2, bois: 1, savoir: 1, tuile: 0}, 4);
addOuvrier("COMPAGNON", {pierre: 2, bois: 0, savoir: 2, tuile: 0}, 4);
addOuvrier("COMPAGNON", {pierre: 2, bois: 0, savoir: 0, tuile: 2}, 4);
addOuvrier("COMPAGNON", {pierre: 1, bois: 2, savoir: 0, tuile: 1}, 4);
addOuvrier("COMPAGNON", {pierre: 1, bois: 1, savoir: 1, tuile: 1}, 4);
addOuvrier("COMPAGNON", {pierre: 1, bois: 1, savoir: 1, tuile: 1}, 4);
addOuvrier("COMPAGNON", {pierre: 1, bois: 0, savoir: 3, tuile: 0}, 4);
addOuvrier("COMPAGNON", {pierre: 1, bois: 0, savoir: 2, tuile: 1}, 4);

addOuvrier("COMPAGNON", {pierre: 0, bois: 3, savoir: 0, tuile: 1}, 4);
addOuvrier("COMPAGNON", {pierre: 0, bois: 2, savoir: 2, tuile: 0}, 4);
addOuvrier("COMPAGNON", {pierre: 0, bois: 2, savoir: 0, tuile: 2}, 4);
addOuvrier("COMPAGNON", {pierre: 0, bois: 1, savoir: 1, tuile: 2}, 4);
addOuvrier("COMPAGNON", {pierre: 0, bois: 0, savoir: 2, tuile: 2}, 4);
addOuvrier("COMPAGNON", {pierre: 0, bois: 0, savoir: 1, tuile: 3}, 4);

// 8
addOuvrier("MAITRE", {pierre: 3, bois: 2, savoir: 0, tuile: 0}, 5);
addOuvrier("MAITRE", {pierre: 3, bois: 0, savoir: 0, tuile: 2}, 5);
addOuvrier("MAITRE", {pierre: 2, bois: 3, savoir: 0, tuile: 0}, 5);
addOuvrier("MAITRE", {pierre: 2, bois: 0, savoir: 0, tuile: 3}, 5);
addOuvrier("MAITRE", {pierre: 0, bois: 3, savoir: 2, tuile: 0}, 5);
addOuvrier("MAITRE", {pierre: 0, bois: 2, savoir: 3, tuile: 0}, 5);
addOuvrier("MAITRE", {pierre: 0, bois: 0, savoir: 3, tuile: 2}, 5);
addOuvrier("MAITRE", {pierre: 0, bois: 0, savoir: 2, tuile: 3}, 5);

// 6 ecus
addChantier("La hutte de paille", {pierre: 1, tuile: 1}, 6, 1);
addChantier("Le lavoir", {bois: 1, tuile: 2}, 6, 1);
addChantier("La cabane perchée", {bois: 2, savoir: 1}, 6, 1);
addChantier("Le pont couvert", {bois: 1, savoir: 2}, 6, 1);
addChantier("Le pont en pierre", {pierre: 2, savoir: 1}, 6, 1);
// 8 ecus
addChantier("La tonnelle", {pierre: 1, tuile: 1}, 8, 0);
addChantier("La cabane", {bois: 1, savoir: 1}, 8, 0);
// 10 ecus
addChantier("La maison urbaine", {pierre: 2, savoir: 2, tuile: 1}, 10, 2);
addChantier("La chaumière", {bois: 2, savoir: 1, tuile: 2}, 10, 2);
addChantier("La maison rurale", {pierre: 1, bois: 2, savoir: 1, tuile: 1}, 10, 2);
addChantier("La maisonnette", {pierre: 2, bois: 1, tuile: 2}, 10, 2);
// 12 ecus
addChantier("Le silo à grains", {bois: 2, savoir: 3, tuile: 1}, 12, 3);
addChantier("L'auberge'", {pierre: 2, bois: 1, savoir: 1, tuile: 2}, 12, 3);
addChantier("Le relais rural", {bois: 3, savoir: 1, tuile: 2}, 12, 3);
addChantier("L'étable", {bois: 1, savoir: 2, tuile: 3}, 12, 3);
addChantier("La porcherie", {bois: 2, savoir: 2, tuile: 2}, 12, 3);
// 14 ecus
addChantier("La forge", {pierre: 2, bois: 2, tuile: 3}, 14, 3);
addChantier("Le mouline à vent", {pierre: 3, savoir: 3, tuile: 1}, 14, 3);
addChantier("L'écurie'", {bois: 3, savoir: 1, tuile: 3}, 14, 3);
addChantier("Le mouline à eau", {bois: 2, savoir: 3, tuile: 2}, 14, 3);
// 16 ecus
addChantier("L'hotel)", {pierre: 3, savoir: 3, tuile: 1}, 16, 4);
addChantier("La ferme)", {pierre: 4, bois: 2, tuile: 2}, 16, 4);
addChantier("La taverne)", {pierre: 1, bois: 3, savoir: 1, tuile: 3}, 16, 4);
addChantier("Le relais postal)", {pierre: 3, bois: 1, savoir: 2, tuile: 2}, 16, 4);
addChantier("Les halles)", {bois: 3, savoir: 2, tuile: 3}, 16, 4);
addChantier("La maison bourgeoise)", {pierre: 2, bois: 2, savoir: 2, tuile: 2}, 16, 4);
// 18 ecus
addChantier("Le cloitre)", {pierre: 4, bois: 2, savoir: 4}, 18, 5);
addChantier("L'église)", {pierre: 4, savoir: 2, tuile: 4}, 18, 5);
addChantier("La tour de guet)", {pierre: 3, bois: 3, savoir: 2, tuile: 2}, 18, 5);
addChantier("L'abbaye')", {pierre: 4, bois: 3, savoir: 2, tuile: 1}, 18, 5);
addChantier("La chapelle)", {pierre: 3, bois: 2, savoir: 2, tuile: 3}, 18, 5);
// 20 ecus
addChantier("La cathédrale)", {pierre: 5, bois: 4, savoir: 4, tuile: 4}, 20, 8);
addChantier("Le chateau fort)", {pierre: 5, bois: 3, savoir: 5, tuile: 3}, 20, 7);
addChantier("L'aqueduc')", {pierre: 5, bois: 2, savoir: 5}, 20, 6);

/* Randomize array in-place using Durstenfeld shuffle algorithm */
const shuffleArray = (array) => {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i+1))
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
}

shuffleArray(allOuvriers);
shuffleArray(allChantiers);