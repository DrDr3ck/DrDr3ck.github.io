const randomInt = (i) => {
    return Math.floor(Math.random() * i);
}

class Nomad {
    constructor(position, health) {
        this.position = position;
        this.health = health;
    }

    move(dX,dY) {
        // is new position free ?
        this.position.x = this.position.x + dX;
        this.position.y = this.position.y + dY;
    }

    moveLeft() {
        this.move(-1,0);
    }
    moveRight() {
        this.move(1,0);
    }
    moveUp() {
        this.move(0,-1);
    }
    moveDown() {
        this.move(0,1);
    }
}

class Board {
    constructor() {
        this.tiles = [];
        this.turn = 0;
        this.nomads = [];
        this.curNomadIndex = 0;
    }

    dump() {
        return {
            tiles: this.tiles,
            turn: this.turn,
            nomads: this.nomads,
            curNomadIndex: this.curNomadIndex
        }
    }

    reset(json) {
        if( json["tiles"] ) {
            this.tiles = json["tiles"];
        }
        if( json["turn"] ) {
            this.turn = json["turn"];
        }
        if( json["nomads"] ) {
            this.nomads = [];
            json["nomads"].forEach(n=>this.addNomad(n.position, n.health));
        }
        if( json["curNomadIndex"] ) {
            this.curNomadIndex = json["curNomadIndex"];
        }
    }

    initTiles(ni,nj) {
        this.tiles = [];
        for( let j=0; j < nj; j++) {
            this.tiles.push([]);
            for( let i=0; i < ni; i++) {
                const n = noise(i/3, j/3)*10;
                const color = {r:0,g:0,b:0};
                let tileType = "none";
                if( n > 7 ) {
                    // rock
                    tileType = "rock";
                    const c = randomInt(40)+120;
                    color.r = c;
                    color.g = c;
                    color.b = c;
                } else if( n > 5 ) {
                    // green: tree ?
                    tileType = "tree";
                    color.g = randomInt(50)+105;
                } else if( n < 3 ) {
                    // water
                    tileType = "water";
                    color.g = 180;
                    color.b = 240;
                } else {
                    // brown: dirt
                    tileType = "dirt";
                    color.r = randomInt(30)+120;
                    color.g = randomInt(10)+60;
                    color.b = 19;
                }
                this.tiles[j].push({
                    type: tileType,
                    color: color
                });
            }
        }
        /*
        // brown
        this.tiles[10][5].color = {r:139, g:69, b:19};

        // rock
        this.tiles[8][10].color = {r:139, g:139, b:139};
        this.tiles[9][10].color = {r:122, g:122, b:122};
        this.tiles[9][11].color = {r:150, g:150, b:150};
        this.tiles[8][11].color = {r:161, g:161, b:161};

        // water
        this.tiles[4][15].color = {r:0, g:191, b:255};
        this.tiles[4][16].color = {r:0, g:180, b:240};
        this.tiles[5][15].color = {r:0, g:160, b:220};
        */
    }

    curNomad() {
        return this.nomads[this.curNomadIndex];
    }

    /**
     * Returns tile where the current Nomad is standing on
     */
    curTile() {
        const nomad = this.curNomad();
        return this.tiles[nomad.position.y][nomad.position.x];
    }

    addNomad(position, health=20) {
        this.nomads.push(new Nomad(position, health));
    }
}