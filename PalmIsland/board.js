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
        this.score = 0;
        this.selection = [];
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

        let card = new Card(10, "Marché");
        card.addSide(["wood","OR","fish"],["wood", "wood"],["fish","fish"],["stone"],0,0);
        card.addSide(["wood"],null,["wood","stone"],["fish", "stone"],0,1);
        card.addSide(["fish"],["fish","stone"], null,["wood", "stone"],0,1);
        card.addSide(["fish", "OR", "wood", "OR","stone"],null, null,["wood", "fish", "stone"],0,2);
        this.cards.push(card);

        card = new Card(11, "Maison du Commerce");
        card.addSide(["wood","wood","OR","fish","fish"],["fish"],["wood"],["wood","fish"],0,0);
        card.addSide(["stone","stone","OR","fish","fish"],null,["wood", "fish"],["wood","wood","wood"],0,1);
        card.addSide(["stone","stone","OR","wood","wood"],["wood", "fish"],null,["fish","fish","fish"],0,1);
        card.addSide(["fish","fish","OR","wood","wood"],["stone"],["stone"],["stone","stone","stone"],0,2);
        this.cards.push(card);

        card = new Card(12, "Fabricant d'outils");
        card.addSide(null,["wood", "fish"],["wood","fish","stone","stone"],[],0,0);
        card.addSide(null,null,null,[],4,3);
        card.addSide([],["wood", "fish", "stone"],null,["wood","fish"],0,1);
        card.addSide([],null,["wood","wood", "fish","fish", "stone", "stone"],["wood", "fish", "stone"],0,2);
        this.cards.push(card);

        for( var i = 13; i <= 14; i++ ) {
            const card = new Card(i, "Logement");
            card.addSide(null,["wood", "fish"],null,[],0,0);
            card.addSide(null,null,["wood", "fish", "stone"],[],1,1);
            card.addSide(null,null,null,[],6,3);
            card.addSide(null,["wood","wood", "fish","fish", "stone", "stone"],null,[],3,2);
            this.cards.push(card);
        }

        for( var i = 15; i <= 16; i++ ) {
            const card = new Card(i, "Temple");
            card.addSide(null,["wood", "fish", "stone", "stone"],null,[],0,0);
            card.addSide(null,null,["wood","wood", "fish","fish", "stone", "stone", "stone"],[],3,1);
            card.addSide(null,null,null,[],10,3);
            card.addSide(null,["wood","wood","wood", "fish","fish","fish", "stone", "stone", "stone", "stone"],null,[],6,2);
            this.cards.push(card);
        }

        // Shuffle
        for( var i = 0; i < 10 ; i++ ) {
            this.cards.sort((a, b) => 0.5 - Math.random());
        }

        // last card is the 'turn' card
        card = new Card(17, "Tour");
        card.addSide(null,null,null,[],0,1); // rank 1 => tour 1
        this.cards.push(card);
    }

    setScore(score) {
        this.score = score;
    }

    getCards() {
        return this.cards;
    }

    resetRessources() {
        this.ressources = [];
        this.cards.filter(card=>card.state === CardState.Stock).forEach(card=> {
            const ressources = card.getRessources();
            this.ressources.push(...ressources);
        });
        console.log("Ressources:", this.ressources);
    }

    resetSelection() {
        this.selection = [];
        this.cards.filter(card=>card.selected).forEach(card=> {
            const ressources = card.getRessources();
            this.selection.push(...ressources);
        });
        console.log("Selection:", this.selection);
    }

    pay() {
        console.log("pay for cards", this.cards);
        this.cards.forEach(card=>{
            if( card.selected ) {
                card.unselect();
            }
        });
        this.resetSelection();
    }

    canPay(cout, verbose=false) {
        if( cout.length === 0 ) {
            return true;
        }
        const pay = {wood: 0, fish: 0, stone: 0};
        // count number of wood/fish/stone acquired
        this.selection.forEach(r=>{
            if( verbose ) { console.log("r",r); };
            if( pay[r] != null ) {
                pay[r] = pay[r]+1;
            }
        });
        if( verbose ) {
            console.log("selection", pay);
        }

        return this.checkPay(pay, cout, verbose);
    }

    mayPay(cout, verbose=false) {
        if( cout.length === 0 ) {
            return true;
        }
        const pay = {wood: 0, fish: 0, stone: 0};
        // count number of wood/fish/stone acquired
        this.ressources.forEach(r=>{
            if( verbose ) { console.log("r",r); };
            if( pay[r] != null ) {
                pay[r] = pay[r]+1;
            }
        });
        if( verbose ) {
            console.log("ressources", pay);
        }

        return this.checkPay(pay, cout, verbose);
    }

    checkPay(pay, cout, verbose=false) {
        // special case if cout has a 'OR' item
        const payCount = cout.filter(c=>c==="OR").length;
        if( payCount === 0 ) {
            // count number of wood/fish/stone needed
            cout.forEach(c=>{
                if( pay[c] != null ) {
                    pay[c] = pay[c]-1;
                }
            });
            if( verbose ) {
                console.log("pay", pay);
            }
        } else if( payCount === 1 ) {
            const clonedPay = {...pay};
            const splitIndex = cout.indexOf("OR");
            // check with clonedPay
            for( let i = splitIndex+1; i < cout.length; i++ ) {
                const c = cout[i];
                if( clonedPay[c] != null ) {
                    clonedPay[c] = clonedPay[c]-1;
                }
            }
            if( clonedPay.wood >= 0 && clonedPay.fish >= 0 && clonedPay.stone >= 0 ) {
                return true;
            }
            for( let i = 0; i < splitIndex; i++ ) {
                const c = cout[i];
                if( pay[c] != null ) {
                    pay[c] = pay[c]-1;
                }
            }
        } else if( payCount === 2 ) {
            let clonedPay = {...pay};
            const splitIndex = cout.indexOf("OR");
            // check with clonedPay
            for( let i = 0; i < splitIndex; i++ ) {
                const c = cout[i];
                if( clonedPay[c] != null ) {
                    clonedPay[c] = clonedPay[c]-1;
                }
            }
            if( clonedPay.wood >= 0 && clonedPay.fish >= 0 && clonedPay.stone >= 0 ) {
                return true;
            }
            const splitIndex2 = cout.indexOf("OR",splitIndex+1);
            clonedPay = {...pay};
            // check with clonedPay (again)
            for( let i = splitIndex+1; i < splitIndex2; i++ ) {
                const c = cout[i];
                if( clonedPay[c] != null ) {
                    clonedPay[c] = clonedPay[c]-1;
                }
            }
            if( clonedPay.wood >= 0 && clonedPay.fish >= 0 && clonedPay.stone >= 0 ) {
                return true;
            }
            for( let i = splitIndex2+1; i < cout.length; i++ ) {
                const c = cout[i];
                if( pay[c] != null ) {
                    pay[c] = pay[c]-1;
                }
            }
        }

        if( pay.wood < 0 || pay.fish < 0 || pay.stone < 0 ) {
            return false;
        }
        return true;
    }

    dropCard(index) {
        const card = this.cards[index];
        if( card.id === 17 && index !== 0 ) {
            // cannot drop 'tour' card if index is not 0
            return;
        }
        if( index === 1 ) {
            if( this.cards[0].id === 17 ) {
                // cannot drop this card, first drop the 'Tour' one !!
                return;
            }
        }
        // if drop card is the 'Tour' card, increase its rank        
        if( card.id === 17 ) {
            card.ranks[card.side] = card.ranks[card.side] + 1;
        }
        // drop card at the end
        this.cards.push(this.cards.splice(index, 1)[0]);
    }

    overredCard(X,Y) {
        // check if cursor is over a 'ressource' card
        const stockedCards = this.cards.filter(card=>card.state === CardState.Stock);
        for( let indexRessource = 0 ; indexRessource < stockedCards.length; indexRessource++ ) {
            const card = stockedCards[indexRessource];
		    const cardPosition = board.getRessourceCardPosition(indexRessource);
            if( mouseX > cardPosition.X+Card.height-70 && mouseX < cardPosition.X+Card.height &&
                mouseY > cardPosition.Y && mouseY < cardPosition.Y+Card.width
            ) {
                console.log("hit");
                return card;
            }
        }
        return null;
    }

    getRessourceCardPosition(index) {
        const cardGap = 80;
        const X = 180;
	    const Y = 100;
        return {X: X+index*cardGap, Y: Y};
    }

    /**
     * Selects/Unselects this card to pay ressources
     * @param card selected card
     */
    select(card) {
        card.selected = !card.selected;
        this.resetSelection();
    }

    stockCard(index) {
        // utiliser les ressources
        const card = this.cards[index];
        const action = card.getAction(Action.Stocker);
        console.log("action", action);
        if( !action ) return; // Error
        if( !this.canPay(action.cout, true) ) {
            // cannot pay: do nothing
            console.log("cannot pay");
            return;
        }
        this.pay();
        // TODO: cannot have more than 4 cards !!!
        // stocker la card
        card.state = CardState.Stock;
        this.dropCard(index);
    }

    pivotCard(index) {
        const card = this.cards[index];
        const action = card.getAction(Action.Pivoter);
        if( !action ) return;// Error
        if( !this.canPay(action.cout, true) ) {
            // cannot pay: do nothing
            return;
        }
        this.pay();
        if( card.side === 0 ) {
            card.side = 1;
        } else if( card.side === 1 ) {
            card.side = 0;
        } else if( card.side === 2 ) {
            card.side = 3;
        } else if( card.side === 3 ) {
            card.side = 2;
        }
        this.dropCard(index);
    }

    returnCard(index) {
        const card = this.cards[index];
        const action = card.getAction(Action.Retourner);
        if( !action ) return;// Error
        if( !this.canPay(action.cout, true) ) {
            // cannot pay: do nothing
            return;
        }
        this.pay();
        if( card.side === 0 ) {
            card.side = 2;
        } else if( card.side === 2 ) {
            card.side = 0;
        } else if( card.side === 1 ) {
            card.side = 3;
        } else if( card.side === 3 ) {
            card.side = 1;
        }
        this.dropCard(index);
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
        this.selected = false;
    }

    static height = 340;
    static width = 240;

    unselect() {
        console.log("unselect card", this.id);
        this.selected = false;
        this.state = CardState.Normal;
    }

    addSide(stocker, pivoter, retourner, ressource, point, rank) {
        this.addActions(stocker, pivoter, retourner);
        this.addRessource(ressource);
        this.points.push(point);
        this.ranks.push(rank);
    }

    getAction(actionType) {
        const actions = this.getActions();
        const filteredActions = actions.filter(action=>action.type === actionType);
        if( filteredActions.length !== 1 ) {
            return null; // error
        }
        return filteredActions[0];
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