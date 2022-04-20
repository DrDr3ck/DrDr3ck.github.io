const Action = {
    Stocker: "Stocker",
    Pivoter: "Pivoter",
    Retourner: "Retourner"
}

const CardType = {
    Fish: 0,
    Stone: 1,
    Wood: 2,
}

class Board {
    constructor() {
        this.cards = [];
        // current ressources
        this.ressources = [];
    }

    init() {
        for( var i = 1; i <= 3; i++ ) {
            const card = new Card(i, "Hangar à canoë");
            card.addSide([],["fish"],["fish"],["fish"],0,0);
            card.addSide([], null, ["wood","fish"],["fish", "fish"],0,1);
            card.addSide([],["wood", "fish"],null,["wood", "fish"],0,1);
            card.addSide([],null,null, ["wood", "fish", "fish"],0,2);
            this.cards.push(card);
        }

        for( var i = 4; i <= 6; i++ ) {
            const card = new Card(i, "Bois");
            card.addSide([],["wood", "fish"],null,["wood"],0,0);
            card.addSide([],null,["wood", "stone"],["wood"],1,1);
            card.addSide([],["wood", "wood", "stone", "stone"], null, ["wood", "wood"],2,2);
            card.addSide(null, null, null, [],5,3);
            this.cards.push(card);
        }

        for( var i = 7; i <= 9; i++ ) {
            const card = new Card(i, "Carrière");
            card.addSide(null,["wood", "wood"],["fish","fish"],[],0,0);
            card.addSide([],null,["wood", "wood","fish"],["stone"],0,1);
            card.addSide([],["wood", "fish", "fish"], null, ["stone"],0,1);
            card.addSide([], null, null, ["stone", "stone"],2,2);
            this.cards.push(card);
        }

        // DEBUG
        //card.side = 1;
        // END DEBUG

        
    }

    getCards() {
        return this.cards;
    }

    canPay(cout) {
        if( cout.length === 0 ) {
            return true;
        }
        return false;
    }
}

const CardState = {
    Normal: "Normal",
    Stock: "Stock"
}

class Card {
    constructor(id, name) {
        this.id = id;
        this.name = name;
        this.side = 0;
        this.actions = [];
        this.ressources = [];
        this.points = [];
        this.ranks = [];
        this.state = CardState.Normal;
    }

    addSide(stocker, pivoter, retourner, ressource, point, rank) {
        this.addActions(stocker, pivoter, retourner);
        this.addRessource(ressource);
        this.points.push(point);
        this.ranks.push(rank);
    }

    addActions(stocker, pivoter, retourner) {
        const actions = [];
        if( stocker ) {
            actions.push({type: Action.Stocker, cout: stocker});
        }
        if( pivoter ) {
            actions.push({type: Action.Pivoter, cout: pivoter});
        }
        if( retourner ) {
            actions.push({type: Action.Retourner, cout: retourner});
        }
        this.actions.push(actions);
    }

    addRessource(ressource) {  
        this.ressources.push(ressource);
    }

    getActions() {
        if( this.actions.length <= this.side ) {
            return [];
        }
        return this.actions[this.side];
    }

    getRessources() {
        if( this.ressources.length <= this.side ) {
            return [];
        }
        return this.ressources[this.side];
    }

    getPoint() {
        if( this.points.length <= this.side ) {
            return 0;
        }
        return this.points[this.side];
    }

    getRank() {
        if( this.ranks.length <= this.side ) {
            return 0;
        }
        return this.ranks[this.side];
    }
}