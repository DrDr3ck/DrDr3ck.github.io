class Tile {
    constructor(type, index) {
        this.type = type;
        this.cardIndex = index;
    }
}

class MonsterTile extends Tile {
    constructor( index, forme, color, texture) {
        super("monster", index);
        this.forme = forme;
        this.color = color;
        this.texture = texture;
    }
}

class TunnelTile extends Tile {
    constructor( index) {
        super("tunnel", index);
        this.nextTunnelIndex = -1;
        this.prevTunnelIndex = -1;
    }
}

class PotionTile extends Tile {
    constructor( index, potion) {
        super("potion", index);
        this.potion = potion;
    }
}

class StartTile extends Tile {
    constructor( index, color) {
        super("start", index);
        this.color = color;
    }
}

class Dice {
    constructor(type) {
        this.face = 0;
        this.type = type;
    }

    role() {
        this.face = Math.floor(Math.random()*6);
    }

    getFace() {
        let index = -1;
        let value = "";
        // transform face into dice index
        switch(this.type) {
            case "texture":
                index = this.face < 3 ? 0 : 1;
                value = this.face < 3 ? "point" : "trait";
                break;
            case "forme":
                index = this.face < 3 ? 2 : 3;
                value = this.face < 3 ? "fantome" : "limace";
                break;
            case "color":
                index = this.face < 3 ? 4 : 5;
                value = this.face < 3 ? "blue" : "red";
                break;
            case "start":
            default:
                index = this.face + 6;
                value = "green";
                if( this.face < 4 ) {
                    value = "red";
                }
                if( this.face < 2 ) {
                    value = "yellow";
                }
                if( this.face % 2 ) {
                    // black
                    value = `${value}:black`;
                } else {
                    // white
                    value = `${value}:white`;
                }
                break;
        }
        return {index: index, value: value};
    }
}

/* Randomize array in-place using Durstenfeld shuffle algorithm */
const shuffleArray = (array) => {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random()*(i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
}

class Board {
    constructor() {
        this.cards = [];
        this.dices = [];
    }

    init() {
        this.cards.push(new PotionTile(0, "texture"));
        this.cards.push(new PotionTile(1, "forme"));
        this.cards.push(new PotionTile(2, "color"));
        this.cards.push(new TunnelTile(3));
        this.cards.push(new TunnelTile(4));
        this.cards.push(new TunnelTile(5));
        this.cards.push(new StartTile(6, "yellow"));
        this.cards.push(new StartTile(7, "red"));
        this.cards.push(new StartTile(8, "green"));
        this.cards.push(new MonsterTile(9, "fantome","red","point"));
        this.cards.push(new MonsterTile(10, "fantome","blue","point"));
        this.cards.push(new MonsterTile(11, "fantome","red","trait"));
        this.cards.push(new MonsterTile(12, "fantome","blue","trait"));
        this.cards.push(new MonsterTile(13, "limace","red","point"));
        this.cards.push(new MonsterTile(14, "limace","blue","point"));
        this.cards.push(new MonsterTile(15, "limace","red","trait"));
        this.cards.push(new MonsterTile(16, "limace","blue","trait"));
        this.cards.push(new MonsterTile(9, "fantome","red","point"));
        this.cards.push(new MonsterTile(10, "fantome","blue","point"));
        this.cards.push(new MonsterTile(11, "fantome","red","trait"));
        this.cards.push(new MonsterTile(12, "fantome","blue","trait"));
        this.cards.push(new MonsterTile(13, "limace","red","point"));
        this.cards.push(new MonsterTile(14, "limace","blue","point"));
        this.cards.push(new MonsterTile(15, "limace","red","trait"));
        this.cards.push(new MonsterTile(16, "limace","blue","trait"));

        shuffleArray(this.cards);
    }

    roleDices() {
        if( this.dices.length === 0 ) {
            this.dices.push(new Dice("forme"));
            this.dices.push(new Dice("color"));
            this.dices.push(new Dice("texture"));
            this.dices.push(new Dice("start"));
        }
        shuffleArray(this.dices);
        this.dices.forEach(d=>{
            d.role();
            if( d.type === "texture" ) {
                this.texture = d.getFace().value;
            }
            if( d.type === "forme" ) {
                this.forme = d.getFace().value;
            }
            if( d.type === "color" ) {
                this.color = d.getFace().value;
            }
            if( d.type === "start" ) {
                this.increment = d.getFace().value.endsWith("white") ? 1 : 24;
            }
        });
        
    }

    findStartTileIndex(start) {
        return this.cards.findIndex(c=>c.type === "start" && start.startsWith(c.color));
    }

    getNext(index) {
        return (index+this.increment)%25;
    }

    curCardType(index) {
        return this.cards[index].type;
    }

    isMonster(index) {
        const monsterCard = this.cards[index];
        if( monsterCard.color === this.color && monsterCard.forme === this.forme && monsterCard.texture === this.texture ) {
            return true;
        }
        return false;
    }

    getNextTunnel(index) {
        let curIndex = this.getNext(index);
        while( this.curCardType(curIndex) !== "tunnel" ) {
            curIndex = this.getNext(curIndex);
        }
        return curIndex;
    }

    changeMonsterDef(index) {
        switch( this.cards[index].potion ) {
            case "texture":
                this.texture = this.texture === "trait" ? "point" : "trait";
                break;
            case "forme":
                this.forme = this.forme === "fantome" ? "limace" : "fantome";
                break;
            case "color":
                this.color = this.color === "red" ? "blue" : "red";
                break;
        }
    }

    getMonster() {
        // find starter tile
        const start = this.dices.filter(d=>d.type === "start")[0].getFace();
        let curIndex = this.findStartTileIndex(start.value);
        let found = false;
        while( !found ) {
            curIndex = this.getNext(curIndex);
            switch( this.curCardType(curIndex) ) {
                case "monster":
                    if( this.isMonster(curIndex) ) {
                        found = true;
                    }
                    break;
                case "tunnel":
                    curIndex = this.getNextTunnel(curIndex);
                    break;
                case "potion":
                    this.changeMonsterDef(curIndex);
                    break;
            }
        }
        return curIndex;
    }
}