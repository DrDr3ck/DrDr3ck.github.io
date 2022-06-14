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
    constructor( index, color, direction=true) {
        super("start", index);
        this.color = color;
        this.direction = direction;
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
            case "color":
            default:
                index = this.face + 6;
                value = "green";
                if( this.face < 4 ) {
                    value = "red";
                }
                if( this.face < 2 ) {
                    value = "yellow";
                }
                if( this.faces % 2 ) {
                    // black
                    value = `${value}:black`;
                } else {
                    // white
                    value = `${value}:white`;
                }
                break;
        }
        return {index: index, value: "none"};
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
        this.dices.forEach(d=>d.role());
    }
}