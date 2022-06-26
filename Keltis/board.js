const colors = {
    brown: { cardIndex: 1, pileIndex: 0},
    yellow: { cardIndex: 3, pileIndex: 1},
    pink: { cardIndex: 4, pileIndex: 2},
    green: { cardIndex: 0, pileIndex: 3},
    blue: { cardIndex: 2, pileIndex: 4},
};
const colorOrder = ["brown", "yellow", "pink", "green", "blue"];
const allCards = [];
for( let i=0; i <= 10; i++ ) {
    colorOrder.forEach(c=>{
        allCards.push({color: c, value: i});
        allCards.push({color: c, value: i});
    });
}

function shuffleArray(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = this.randomInt(i + 1);
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
}

function dist(x1, y1, x2, y2) {
    return sqrt(pow(x2 - x1, 2) + pow(y2 - y1, 2));
}

function randomInt(i) {
    return Math.floor(Math.random() * i);
}

const pionPositions = {
    brown: [
        {X:373, Y:510, bonus: false},
        {X:344, Y:478, bonus: false},
        {X:313, Y:440, bonus: true},
        {X:284, Y:404, bonus: false},
        {X:259, Y:367, bonus: true},
        {X:228, Y:334, bonus: true},
        {X:195, Y:300, bonus: true},
        {X:162, Y:264, bonus: false},
        {X:130, Y:221, bonus: true},
    ],
    yellow: [
        {X:420, Y:470, bonus: false},
        {X:403, Y:428, bonus: true},
        {X:386, Y:384, bonus: false},
        {X:370, Y:342, bonus: true},
        {X:354, Y:300, bonus: false},
        {X:340, Y:256, bonus: true},
        {X:321, Y:210, bonus: true},
        {X:307, Y:165, bonus: false},
        {X:286, Y:116, bonus: true},
    ],
    pink: [
        {X: 478, Y: 458, bonus: false},
        {X: 478, Y: 410, bonus: true},
        {X: 478, Y: 363, bonus: true},
        {X: 478, Y: 315, bonus: false},
        {X: 478, Y: 265, bonus: true},
        {X: 478, Y: 222, bonus: false},
        {X: 478, Y: 175, bonus: true},
        {X: 478, Y: 127, bonus: false},
        {X: 478, Y: 77, bonus: true},
    ],
    green: [
        {X: 535, Y: 470 , bonus: false},
        {X: 548, Y: 428 , bonus: true},
        {X: 565, Y: 385 , bonus: false},
        {X: 582, Y: 342 , bonus: true},
        {X: 598, Y: 293 , bonus: true},
        {X: 616, Y: 254 , bonus: false},
        {X: 630, Y: 209 , bonus: true},
        {X: 646, Y: 169 , bonus: false},
        {X: 664, Y: 115 , bonus: true},
    ],
    blue: [
        {X: 583, Y: 515, bonus: false},
        {X: 611, Y: 478, bonus: false},
        {X: 642, Y: 443, bonus: true},
        {X: 669, Y: 410, bonus: true},
        {X: 700, Y: 374, bonus: false},
        {X: 732, Y: 338, bonus: true},
        {X: 761, Y: 302, bonus: true},
        {X: 787, Y: 269, bonus: false},
        {X: 818, Y: 229, bonus: true},
    ]
};

const bonusPositions = [];
    colorOrder.forEach(color=>{
    pionPositions[color].forEach(p=>{
        if( p.bonus ) {
            bonusPositions.push({X: p.X, Y: p.Y})
        }
    });
});

const rowPositions = [
    {X:124, Y:164},
    {X:278, Y:58},
    {X:477, Y:28},
    {X:681, Y:58},
    {X:822, Y:164},
];

class Board {
    constructor() {
        this.bonus = [0,0,1,1,1,2,2,4,4,4,4,4,4,4,4,4,3,3,3,3,3,3,3,3,3];
        this.cards = [];
        this.hand = [];
        this.discard = [];
        const pileY = 100;
        this.piles = [
            {color: "brown", cards: [], X:860, Y:pileY},
            {color: "yellow", cards: [], X:860+105, Y:pileY},
            {color: "pink", cards: [], X:860+210, Y:pileY},
            {color: "green", cards: [], X:860+315, Y:pileY},
            {color: "blue", cards: [], X:860+420, Y:pileY},
        ];
        this.selectedCardIndex = -1;
        this.chosenRowIndex = -1;
        this.chosenCardIndex = -1;
        this.discard = null;
        this.pions = [
            {color: "brown", position: -1, size: 0},
            {color: "yellow", position: -1, size: 0},
            {color: "pink", position: -1, size: 0},
            {color: "green", position: -1, size: 0},
            {color: "blue", position: -1, size: 0},
        ];
        this.points = 0;
        this.runes = 0;
        this.state = "play";
        this.smallSize = 4;
        this.bigSize = 1;
    }

    getRowIndex(X,Y) {
        let distance = 35;
        let rowIndex = -1;
        rowPositions.forEach((r,i)=>{
            if( this.pions[i].position === 8 ) {
                return;
            }
            const curDistance = dist(r.X, r.Y, X, Y);
            if( curDistance < distance ) {
                distance = curDistance
                rowIndex = i;
            }
        });
        return rowIndex;  
    }

    getPileIndex(X,Y) {
        const pileIndex = this.piles.findIndex(p=>X >= p.X && X <= p.X+210*.5 && Y>=p.Y && Y<=p.Y+326*.5+40*Math.max(0,p.cards.length-1));
        return pileIndex;
    }

    onDiscardZone(X,Y) {
        // rect(105, 400, 210*.5, 326*.5, 5);
        if( X > 105 && X < 105+210*.5 && Y > 400 && Y < 400+326*.5 ) {
            return true;
        }
        return false;
    }

    /**
     * Checks if curCard can be drop on pile of index pileIndex
     * @param curCard card to drop
     * @param pileIndex index of pile to drop card on
     * @returns true if card is dropped on pile
     */
    dropCard(curCard, pileIndex) {
        let canPushCard = false;
        const pile = this.piles[pileIndex];
        if( pile.cards.length <= 1 ) {
            canPushCard = true;
        } else if( pile.cards.length === 2 && pile.cards[0].value === pile.cards[1].value ) {
            canPushCard = true;
        } else if( pile.cards.length >= 2 ) {
            const c0 = pile.cards[0].value;
            const c1 = pile.cards[1].value;
            if( c0 !== c1 ) {
                if( c1 > c0 && curCard.value >= c1 ) {
                    canPushCard = true;
                } else if(c1 < c0 && curCard.value <= c1) {
                    canPushCard = true;
                }
            } else if( pile.cards.length >= 3 ) {
                const c2 = pile.cards[2].value;
                if( c2 > c0 && curCard.value >= c2 ) {
                    canPushCard = true;
                } else if(c2 < c0 && curCard.value <= c2) {
                    canPushCard = true;
                }
            }
        }
        if( canPushCard ) {
            pile.cards.push( curCard );
            // move pion in the row (or choose which pion to play)
            const pion = this.pions[colors[curCard.color].pileIndex];
            if( pion.position === -1 && board.bigSize === 1 && board.smallSize > 0 ) {
                uiManager.addLogger("Choose a size!!");
                this.state = "choose";
                this.chosenRowIndex = colors[curCard.color].pileIndex;
                this.chosenCardIndex = this.selectedCardIndex;
                return;
            }
            if( pion.position === 8 ) {
                // replay another pion
                uiManager.addLogger("Choose a row!!");
                this.state = "replay";
                this.chosenCardIndex = this.selectedCardIndex;
                return;
            }
            pion.position = Math.min(8,pion.position+1);
            if( !pion.size ) {
                pion.size = board.bigSize===1 ? 2 : 1;
                if( pion.size === 1 ) {
                    board.smallSize = board.smallSize-1;		
                } else {
                    board.bigSize = 0;		
                }
            }
            // get bonus ?
            this.checkBonus(pion);
        }
        return canPushCard;
    }

    checkBonus(pion) {
        const pionPosition = pionPositions[pion.color][pion.position];
        const bonusIndex = bonusPositions.findIndex(b=>b.X === pionPosition.X && b.Y === pionPosition.Y);
        if( bonusIndex >= 0 ) {
            uiManager.addLogger("You got a bonus");
            const bonus = this.bonus[bonusIndex];
            if( bonus <= 2 ) {
                this.points = this.points + bonus + 1;
            } else if( bonus === 4 ) {
                this.bonus[bonusIndex] = -1;
                this.runes = this.runes+1;
            } else {
                uiManager.addLogger("Choose a row!!");
                this.chosenCardIndex = this.selectedCardIndex;
                this.state = "replay";
            }
        }
    }

    init() {
        shuffleArray(this.bonus);
        shuffleArray(allCards);
        this.cards = [];
        for( let i=0; i < 50; i++ ) {
            const card = allCards[i];
            this.cards.push({...card});
        }
        for( let i=0; i < 8; i++ ) {
            this.hand.push(this.cards.shift());
        }
    }
}