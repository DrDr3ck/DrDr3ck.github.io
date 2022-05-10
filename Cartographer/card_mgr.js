var Season = {
    Printemps: "Printemps",
    Ete: "Ete",
    Automne: "Automne",
    Hiver: "Hiver",
    End: "End"
}

var SeasonTime = {
    Printemps: 8,
    Ete: 8,
    Automne: 7,
    Hiver: 6,
    End: 0
};

class CardMgr {
    constructor(seed) {
        if( seed ) {
            this.generator = new Math.seedrandom(seed.toString());
        } else {
            this.generator = Math.random;
        }
        this.cards = [];
        this.embuscades = [12,13,14,15];
        this.shuffleArray(this.embuscades);

        this.seasons = {};
    }

    /* Randomize array in-place using Durstenfeld shuffle algorithm */
    shuffleArray(array) {
        for (var i = array.length - 1; i > 0; i--) {
            var j = this.randomInt(i + 1);
            var temp = array[i];
            array[i] = array[j];
            array[j] = temp;
        }
    }

    randomInt(i) {
        return Math.floor(this.generator() * i);
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
        this.shuffleArray(this.cards);

        // if ruin is before monster, move monster
        let swap = true;
        while( swap ) {
            swap = false;
            for( let i=1; i < this.cards.length; i++ ) {
                if( this.cards[i] >= 12 && this.cards[i-1] === 11 ) {
                    const tmp = this.cards[i];
                    this.cards[i] = this.cards[i-1];
                    this.cards[i-1] = tmp;
                    swap = true;
                }
            }
        }

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