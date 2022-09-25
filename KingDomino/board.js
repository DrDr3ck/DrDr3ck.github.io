const FOREST = "forest";
const WATER = "water";
const SWAMP = "swamp";
const FIELD = "field";
const MINE = "mine";
const GRASS = "grass";

/* Randomize array in-place using Durstenfeld shuffle algorithm */
const shuffleArray = (array) => {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i+1))
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
}

const getCardIndex = (tile) => {
    if( tile.type === FIELD ) {
        return tile.value;
    } else if( tile.type === WATER ) {
        return tile.value+2;
    } else if( tile.type === FOREST ) {
        return tile.value+4;
    } else if( tile.type === GRASS ) {
        return tile.value+6;
    } else if( tile.type === SWAMP ) {
        return tile.value+9;
    } else if( tile.type === MINE ) {
        return tile.value+12;
    }
    return 0;
}

class Card {
    constructor(index, tile1, tile2) {
        this.index = index;
        this.tiles = [tile1, tile2];
        this.position = 0; // from 0 to 3
    }

    draw(X,Y,showText=true) {
        stroke(0);
        noFill();
        if( this.position === 0 ) {
            spritesheet.drawSprite("tiles", getCardIndex(this.tiles[0]), X, Y);
            spritesheet.drawSprite("tiles", getCardIndex(this.tiles[1]), X+150, Y);
            rect(X,Y,300,150);
        } else if( this.position === 1 ) {
            spritesheet.drawSprite("tiles", getCardIndex(this.tiles[0]), X, Y);
            spritesheet.drawSprite("tiles", getCardIndex(this.tiles[1]), X, Y+150);
            rect(X,Y,150,300);
        } else if( this.position === 2 ) {
            spritesheet.drawSprite("tiles", getCardIndex(this.tiles[0]), X, Y);
            spritesheet.drawSprite("tiles", getCardIndex(this.tiles[1]), X-150, Y);
            rect(X-150,Y,300,150);
        } else if( this.position === 3 ) {
            spritesheet.drawSprite("tiles", getCardIndex(this.tiles[0]), X, Y);
            spritesheet.drawSprite("tiles", getCardIndex(this.tiles[1]), X, Y-150);
            rect(X,Y-150,150,300);
        }
        if( showText ) {
            fill(250);
            textAlign(CENTER, CENTER);
            text(this.index, X+150, Y+75);
        }
    }

    rotate() {
        this.position = (this.position+1)%4;
    }
}

class Board {
    constructor() {
        this.cards = [];
        this.curCards = [];
        this.turn = 0;
        this.lastChosenCardIndex = 0;
        this.curCardClickedIndex = -1;
        this.brunoCardClickedIndex = -1;
        this.playerFirst = true;

        this.tiles = [];

        this.brunoTiles = [];
        this.brunoPoints = 0;
        this.points = 0;
    }

    moveBoard(keyCode) {
        if( keyCode === UP_ARROW ) {
            // check if tiles are empty on first row
            if( this.tiles[0].every(t=>t.type === "none") ) {
                // move UP
                for( let i=1; i< 5; i++ ) {
                    this.tiles[i-1] = this.tiles[i];
                }
                this.tiles[4] = [{type: "none", value: 0}, {type: "none", value: 0}, {type: "none", value: 0}, {type: "none", value: 0}, {type: "none", value: 0}];
            }
        }
        if( keyCode === DOWN_ARROW ) {
            // check if tiles are empty on last row
            if( this.tiles[4].every(t=>t.type === "none") ) {
                // move DOWN
                for( let i=0; i< 4; i++ ) {
                    this.tiles[4-i] = this.tiles[3-i];
                }
                this.tiles[0] = [{type: "none", value: 0}, {type: "none", value: 0}, {type: "none", value: 0}, {type: "none", value: 0}, {type: "none", value: 0}];
            }
        }
        if( keyCode === LEFT_ARROW ) {
            // check if tiles are empty on first column
            if( this.tiles.every(t=>t[0].type === "none") ) {
                // move LEFT
                for( let i=1; i< 5; i++ ) {
                    this.tiles.forEach(t=>t[i-1] = t[i]);
                }
                this.tiles.forEach(t=>t[4] = {type: "none", value: 0});
            }
        }
        if( keyCode === RIGHT_ARROW ) {
            // check if tiles are empty on last column
            if( this.tiles.every(t=>t[4].type === "none") ) {
                // move RIGHT
                for( let i=0; i< 4; i++ ) {
                    this.tiles.forEach(t=>t[4-i] = t[3-i]);
                }
                this.tiles.forEach(t=>t[0] = {type: "none", value: 0});
            }
        }
    }

    resetCards() {
        this.cards = [];
        this.addCard(1, FIELD, 0, FIELD, 0);
        this.addCard(2, FIELD, 0, FIELD, 0);
        this.addCard(3, FOREST, 0, FOREST, 0);
        this.addCard(4, FOREST, 0, FOREST, 0);
        this.addCard(5, FOREST, 0, FOREST, 0);
        this.addCard(6, FOREST, 0, FOREST, 0);
        this.addCard(7, WATER, 0, WATER, 0);
        this.addCard(8, WATER, 0, WATER, 0);
        this.addCard(9, WATER, 0, WATER, 0);
        this.addCard(10, GRASS, 0, GRASS, 0);
        this.addCard(11, GRASS, 0, GRASS, 0);
        this.addCard(12, SWAMP, 0, SWAMP, 0);
        this.addCard(13, FIELD, 0, FOREST, 0);
        this.addCard(14, FIELD, 0, WATER, 0);
        this.addCard(15, FIELD, 0, GRASS, 0);
        this.addCard(16, FIELD, 0, SWAMP, 0);
        this.addCard(17, FOREST, 0, WATER, 0);
        this.addCard(18, FOREST, 0, GRASS, 0);
        this.addCard(19, FIELD, 1, FOREST, 0);
        this.addCard(20, FIELD, 1, WATER, 0);
        this.addCard(21, FIELD, 1, GRASS, 0);
        this.addCard(22, FIELD, 1, SWAMP, 0);
        this.addCard(23, FIELD, 1, MINE, 0);
        this.addCard(24, FOREST, 1, FIELD, 0);
        this.addCard(25, FOREST, 1, FIELD, 0);
        this.addCard(26, FOREST, 1, FIELD, 0);
        this.addCard(27, FOREST, 1, FIELD, 0);
        this.addCard(28, FOREST, 1, WATER, 0);
        this.addCard(29, FOREST,1, GRASS, 0);
        this.addCard(30, WATER, 1, FIELD, 0);
        this.addCard(31, WATER, 1, FIELD, 0);
        this.addCard(32, WATER, 1, FOREST, 0);
        this.addCard(33, WATER, 1, FOREST, 0);
        this.addCard(34, WATER, 1, FOREST, 0);
        this.addCard(35, WATER, 1, FOREST, 0);
        this.addCard(36, FIELD, 0, GRASS, 1);
        this.addCard(37, WATER, 0, GRASS, 1);
        this.addCard(38, FIELD, 0, SWAMP, 1);
        this.addCard(39, GRASS, 0, SWAMP, 1);
        this.addCard(40, MINE, 1, FIELD, 0);
        this.addCard(41, FIELD, 0, GRASS, 2);
        this.addCard(42, WATER, 0, GRASS, 2);
        this.addCard(43, FIELD, 0, SWAMP, 2);
        this.addCard(44, GRASS, 0, SWAMP, 2);
        this.addCard(45, MINE, 2, FIELD, 0);
        this.addCard(46, SWAMP, 0, MINE, 2);
        this.addCard(47, SWAMP, 0, MINE, 2);
        this.addCard(48, FIELD, 0, MINE, 3);

        shuffleArray(this.cards);

        for( let i=0; i < 5; i++ ) {
            this.tiles.push([{type: "none", value: 0}, {type: "none", value: 0}, {type: "none", value: 0}, {type: "none", value: 0}, {type: "none", value: 0}]);
        }
        this.tiles[2][2].type = "chateau";
    }

    addCard(index, type1, value1, type2, value2) {
        this.cards.push(new Card(index, {type: type1, value: value1}, {type: type2, value: value2}));
    }

    canPlaceCard() {
        const card = this.getCurCard();
        for( let j=0; j < 5; j++ ) {
            for( let i=0; i < 5; i++ ) {
                const tilePosition = {X: i, Y: j}
                let result = false;
                if( this.tryPlaceCard(tilePosition) ) {
                    result = true;
                }
                card.position = 1;
                if( this.tryPlaceCard(tilePosition) ) {
                    result = true;
                }
                card.position = 2;
                if( this.tryPlaceCard(tilePosition) ) {
                    result = true;
                }
                card.position = 3;
                if( this.tryPlaceCard(tilePosition) ) {
                    result = true;
                }
                if( result ) {
                    card.position = 0;
                    return true;
                }
            }
        }
        return false;
    }

    tryPlaceCard(tilePosition) {
        const card = this.getCurCard();
        if( card.position === 0 && tilePosition.X === 4 ) {
            // cannot place card out of the board
            return false;
        }
        if( card.position === 2 && tilePosition.X === 0 ) {
            // cannot place card out of the board
            return false;
        }
        if( card.position === 1 && tilePosition.Y === 4 ) {
            // cannot place card out of the board
            return false;
        }
        if( card.position === 3 && tilePosition.Y === 0 ) {
            // cannot place card out of the board
            return false;
        }
        let deltaX = 0;
        let deltaY = 0;
        switch(card.position) {
            case 0:
                deltaX = 1;
                break;
            case 1:
                deltaY = 1;
                break;
            case 2:
                deltaX = -1;
                break;
            case 3:
                deltaY = -1
                break;
        }
        if( this.tiles[tilePosition.Y][tilePosition.X].type !== "none" ) {
            // cannot place a card on top of another card
            return false;
        }
        if( this.tiles[tilePosition.Y+deltaY][tilePosition.X+deltaX].type !== "none" ) {
            // cannot place a card on top of another card
            return false;
        }
        if(
            this.canPlaceTile(tilePosition.X, tilePosition.Y, card.tiles[0]) ||
            this.canPlaceTile(tilePosition.X+deltaX, tilePosition.Y+deltaY, card.tiles[1])
        ) {
            return true;
        }
        return false;    
    }

    placeCardOnTile(tilePosition) {
        const card = this.getCurCard();
        let deltaX = 0;
        let deltaY = 0;
        switch(card.position) {
            case 0:
                deltaX = 1;
                break;
            case 1:
                deltaY = 1;
                break;
            case 2:
                deltaX = -1;
                break;
            case 3:
                deltaY = -1
                break;
        }
        this.tiles[tilePosition.Y][tilePosition.X] = card.tiles[0];
        this.tiles[tilePosition.Y+deltaY][tilePosition.X+deltaX] = card.tiles[1]
    }

    getTile(X,Y) {
        if( X < 0 ) return null;
        if( Y < 0 ) return null;
        if( X > 4 ) return null;
        if( Y > 4 ) return null;
        return this.tiles[Y][X];
    }

    getTileType(X,Y) {
        if( X < 0 ) return "none";
        if( Y < 0 ) return "none";
        if( X > 4 ) return "none";
        if( Y > 4 ) return "none";
        return this.tiles[Y][X].type;
    }

    canPlaceTile(X, Y, tile) {
        const types = [ this.getTileType(X-1,Y), this.getTileType(X+1,Y), this.getTileType(X,Y-1), this.getTileType(X,Y+1)];
        return types.some(t=>t==="chateau"||t===tile.type);
    }

    startTurn() {
        this.curCards = [];
        // choose 4 cards
        if( this.cards.length === 0 ) {
            return;
        }
        for( let i=0; i < 4; i++ ) {
            this.curCards.push(this.cards.pop());
        }
        this.curCards.sort(
            (card1, card2)=>card1.index-card2.index
        );
    }

    getSameTypedNeighboors(X,Y,type) {
        const neighboors = [];
        let tile = this.getTile(X-1,Y);
        if( tile && tile.type === type ) {
            neighboors.push({i: X-1, j: Y, coef: tile.value});
        }
        tile = this.getTile(X+1,Y);
        if( tile && tile.type === type ) {
            neighboors.push({i: X+1, j: Y, coef: tile.value});
        }
        tile = this.getTile(X,Y-1);
        if( tile && tile.type === type ) {
            neighboors.push({i: X, j: Y-1, coef: tile.value});
        }
        tile = this.getTile(X,Y+1);
        if( tile && tile.type === type ) {
            neighboors.push({i: X, j: Y+1, coef: tile.value});
        }
        return neighboors;
    }

    computePoints() {
        const points = [];
        const legend = {};
        const legendNames = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        let curLegendIndex = -1;
        for( let i=0; i < 5; i++ ) {
            points.push(["0","0","0","0","0"]);
        }
        for( let j=0; j < 5; j++ ) {
            for( let i=0; i < 5; i++ ) {
                if( points[j][i] !== "0" ) {
                    continue;
                }
                if( this.tiles[j][i].type === "none" ) {
                    continue;
                }
                // start a new region
                curLegendIndex++;
                let coef = this.tiles[j][i].value;
                let totalCards = 1;
                points[j][i] = legendNames[curLegendIndex];
                // get region !!
                const curType = this.tiles[j][i].type;
                const neighboors = this.getSameTypedNeighboors(i,j,curType);
                while( neighboors.length > 0 ) {
                    const curNeighbor = neighboors.shift();
                    if( points[curNeighbor.j][curNeighbor.i] === "0" ) {
                        points[curNeighbor.j][curNeighbor.i] = legendNames[curLegendIndex];
                        totalCards++;
                        coef += curNeighbor.coef;
                        neighboors.push(...this.getSameTypedNeighboors(curNeighbor.i,curNeighbor.j,curType));
                    }
                }
                legend[legendNames[curLegendIndex]] = coef * totalCards;
            }
        }
        let total = 0;
        for( const l in legend ) {
            total += legend[l];
        }
        return total;
    }

    computeBrunoPoints() {
        this.brunoTiles.sort((t1,t2)=>t2.type - t1.type);        
        const points = {
            water:{tiles: 0, coef: 0},
            grass:{tiles: 0, coef: 0},
            swamp:{tiles: 0, coef: 0},
            forest:{tiles: 0, coef: 0},
            field:{tiles: 0, coef: 0},
            mine:{tiles: 0, coef: 0},
        };
        this.brunoTiles.forEach(t=>{
            points[t.type].tiles = points[t.type].tiles+1;
            points[t.type].coef = points[t.type].coef+t.value;
        });
        let total = 0;
        for( const point in points ) {
            const p = points[point];
            total = total+p.tiles*p.coef
        }
        return total;
    }

    nextTurn() {
        const brunoCard = this.curCards[this.brunoCardClickedIndex];
        this.brunoTiles.push(brunoCard.tiles[0]);
        this.brunoTiles.push(brunoCard.tiles[1]);

        this.brunoPoints = this.computeBrunoPoints();
        this.points = this.computePoints();
        
        this.startTurn();

        this.playerFirst = true; // always first: this.curCardClickedIndex < this.brunoCardClickedIndex;
        this.curCardClickedIndex = -1;
        this.brunoCardClickedIndex = -1;
        if( !this.playerFirst ) {
            this.brunoCardClickedIndex = 2;
        }
    }

    getCurCard() {
        if( this.curCardClickedIndex === -1 ) { return null; }
        return this.curCards[this.curCardClickedIndex];
    }

    getCurCardIndex() {
        const card = this.getCurCard();
        return card ? card.index : -1;
    }

    rotateCurCard() {
        const card = this.getCurCard();
        if( card ) {
            card.rotate();
        }
    }
}