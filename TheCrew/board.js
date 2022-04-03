const CardColor = {
    Fusee: "AFusee",
    Blue: "Blue",
    Green: "Green",
    Red: "Red",
    Yellow: "Yellow"
}

/**
 * Orders cards
 * @param cards cards to order
 * @returns ordered cards
 */
 function orderCards(cards) {
	cards.sort((a,b) => a.value > b.value);
	cards.sort((a,b) => a.color > b.color);
	return cards;
}

class Board {
    constructor(maxPlayer) {
        this.cards = [];
        this.maxPlayer = maxPlayer;
    }

    /**
     * Initializes the list of cards (+shuffle)
     */
    init() {
        this.cards = [];
        for( let i = 0 ; i < 9; i++) {
            this.addCard(CardColor.Blue, i+1);
            this.addCard(CardColor.Red, i+1);
            this.addCard(CardColor.Yellow, i+1);
            // pas de cartes vertes si 3 joueurs uniquement
            if( this.maxPlayer != 3 ) {
                this.addCard(CardColor.Green, i+1);
            }
        }
        for( let i = 0 ; i < 3; i++) {
            this.addCard(CardColor.Fusee, i+1);
        }
        // pas de Fusee 4 si 3 joueurs uniquement
        if( this.maxPlayer != 3 ) {
            this.addCard(CardColor.Fusee, 4);
        }
        this.cards.sort((a, b) => 0.5 - Math.random());
        this.cards.sort((a, b) => 0.5 - Math.random());
        this.cards.sort((a, b) => 0.5 - Math.random());
    }

    /**
     * Distributes cards to the given number of players
     * @param playerId id of player
     * @return array with cards for each player
     */
    distribute(playerId) {
        const maxCards = this.cards.length / this.maxPlayer;
        let cards = this.cards.slice(maxCards*playerId, maxCards*playerId+maxCards);
        cards = orderCards(cards);
        return cards;
    }

    /**
     * Adds given card to list of cards
     * @param color color of the card
     * @param value value of the card
     */
    addCard(color, value) {
        this.cards.push({color: color, value: value});
    }
}