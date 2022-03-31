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
            this.addCard("Blue", i+1);
            this.addCard("Red", i+1);
            this.addCard("Yellow", i+1);
            // pas de cartes vertes si 3 joueurs uniquement
            if( this.maxPlayer != 3 ) {
                this.addCard("Green", i+1);
            }
        }
        for( let i = 0 ; i < 3; i++) {
            this.addCard("AFusee", i+1);
        }
        // pas de Fusee 4 si 3 joueurs uniquement
        if( this.maxPlayer != 3 ) {
            this.addCard("AFusee", 4);
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
        return this.cards.slice(maxCards*playerId, maxCards*playerId+maxCards);
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