/* Randomize array in-place using Durstenfeld shuffle algorithm */
function shuffleArray(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
}

var Season = {
    Printemps: "Printemps",
    Ete: "Ete",
    Automne: "Automne",
    Hiver: "Hiver"
}

class CardMgr {
    constructor() {
        this.cards = [];
        this.embuscades = [12,13,14,15];
        shuffleArray(this.embuscades);

        this.seasons = {};
    }

    init() {
        this.seasons[Season.Printemps] = this.newSeason(8);
        this.seasons[Season.Ete] = this.newSeason(8);
        this.seasons[Season.Automne] = this.newSeason(7);
        this.seasons[Season.Hiver] = this.newSeason(6);
    }

    newSeason(maxTime) {
        const times = [1,1,1,1,2,2,2,2,2,0,2,0,0,0,0,0];

        this.cards = this.cards.filter(c=>c>11); // keep embuscade if any
		this.cards.push(...[0,1,2,3,4,5,6,7,8,9,10,11,11]); // 11: 2 times (for temple)
		this.cards.push(this.embuscades.shift()); // get a new embuscade
        shuffleArray(this.cards);
        const seasonCards = [];
        while( maxTime > 0 ) {
            const curCard = this.cards.shift();
            seasonCards.push(curCard);
            maxTime -= times[curCard];
        }
        return seasonCards;
    }

    getSeason(season) {
        return this.seasons[season];
    }
}