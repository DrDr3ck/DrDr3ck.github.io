const randomInt = (i) => {
    return Math.floor(Math.random() * i);
}

const noneColor = {r: 51, g: 51, b: 51};

class Nomad {
    constructor(position, health, hasMoved=false) {
        this.position = position;
        this.health = health;
        this.hasMoved = hasMoved;
    }

    move(board,dX,dY) {
        if( this.hasMoved ) {
            return;
        }
        // is new position free ?
        if( board.isTileFree(this.position.x + dX, this.position.y + dY) ) {
            this.position.x = this.position.x + dX;
            this.position.y = this.position.y + dY;
            this.hasMoved = true;
        }
    }

    moveLeft(board) {
        this.move(board,-1,0);
    }
    moveRight() {
        this.move(board,1,0);
    }
    moveUp() {
        this.move(board,0,-1);
    }
    moveDown() {
        this.move(board,0,1);
    }

    transform(board) {
        // transform cur tile
        board.doTransform();
    }
}

class Board {
    constructor() {
        this.tiles = [];
        this.turn = 0;
        this.nomads = [];
        this.curNomadIndex = 0;
        this.ressources = {
            "plank": 0,
            "brick": 0,
            "food": 0
        };
    }

    dump() {
        return {
            tiles: this.tiles,
            turn: this.turn,
            nomads: this.nomads,
            curNomadIndex: this.curNomadIndex,
            ressources: this.ressources
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
            json["nomads"].forEach(n=>this.addNomad(n.position, n.health, n.hasMoved));
        }
        if( json["curNomadIndex"] ) {
            this.curNomadIndex = json["curNomadIndex"];
        }
        if( json["ressources"] ) {
            this.ressources = json["ressources"];
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

    nextNomad(next) {
        if( next ) {
            this.curNomadIndex = (this.curNomadIndex+1)%this.nomads.length;
        } else {
            this.curNomadIndex = (this.curNomadIndex-1+this.nomads.length)%this.nomads.length;
        }
    }

    /**
     * Selects a nomad if any at tile X,Y
     */
    selectNomad(X,Y) {
        uiManager.addLogger(`select nomad at ${X},${Y}`)
        this.nomads.forEach(n=>console.log(n.position));
        const nomadIndex = this.nomads.findIndex(n=>n.position.x === X && n.position.y === Y);
        console.log("nomadIndex", nomadIndex);
        if( nomadIndex >= 0 ) {
            this.curNomadIndex = nomadIndex;
        }
    }

    /**
     * Returns tile where the current Nomad is standing on
     */
    curTile() {
        const nomad = this.curNomad();
        return this.tiles[nomad.position.y][nomad.position.x];
    }

    addRessource(ressourceType) {
        board.ressources[ressourceType] = board.ressources[ressourceType] + 1;
    }

    doTransform() {
        // transform cur tile
        const tile = this.curTile();
        switch(tile.type) {
            case "dirt":
                // transform into 'field'
                // check neighborhood: if water, it should be a field+
                const neighborhood = this.getNeighboorTiles();
                if( neighborhood.some(n=>n.type === "water") ) {
                    tile.type = "field+-";
                } else {
                    tile.type = "field-";
                }
                const c = randomInt(20);
                tile.color = {r:255-c, g:219-c, b:88-c};
                break;
            case "field+":
                // recolt
                tile.type= "none";
                this.addRessource("food");
                this.addRessource("food");
                tile.color = noneColor;
                break;
            case "field":
                // recolt
                tile.type= "none";
                this.addRessource("food");
                tile.color = noneColor;
                break;
            case "rock":
                // recolt 'brick'
                tile.type= "none";
                this.addRessource("brick");
                tile.color = noneColor;
                break;
            case "tree":
                // recolt 'plank'
                tile.type= "none";
                this.addRessource("plank");
                tile.color = noneColor;
                break;
        }
    }

    addNomad(position, health=20) {
        this.nomads.push(new Nomad(position, health));
    }

    isTileFree(X,Y) {
        if( this.tiles[Y][X].type === "water" || this.tiles[Y][X].type === "none" ) {
            return false;
        }
        const result = this.nomads.some(nomad=>
            nomad.position.x === X && nomad.position.y === Y
        );
        return !result;
    }

    getTile(X,Y) {
        return this.tiles[Y][X];
    }

    checkBlockedNomads() {
        for( let i= this.nomads.length-1; i >= 0; i-- ) {
            const neighborhoods = this.getNeighboorTiles(this.nomads[i].position);
            if( neighborhoods.every(n=>n.type==="none"||n.type==="water") ) {
                // this nomad is blocked: kill him!!
                this.nomads.splice(i,1);
                this.curNomadIndex = 0;
            }
        }
    }

    reproduce() {
        const nomad = this.curNomad();
        if( this.nomads.filter(n=>n.position.x === nomad.position.x && n.position.y === nomad.position.y).length > 1 ) {
            // cannot reproduce anymore during this turn
            console.log("cannot reproduce anymore");
            return;
        }
        // find a nomad next to the current nomad
        const nomads = this.getNeighboorNomads(nomad.position);
        if( nomads.length === 0 ) {
            console.log("no nomads for reproduction");
            return;
        }
        // create a new nomad
        console.log("new nomad");
        this.addNomad({...nomad.position}, 20);
    }

    eatFood() {
        const nbNeededFood = this.nomads.length;
        if( this.ressources.food >= nbNeededFood ) {
            this.ressources.food -= nbNeededFood;
        } else {
            // health damage for those who cannot eat
            const damage = nbNeededFood - this.ressources.food;
            for( let i=0; i < damage; i++ ) {
                const nomad = this.nomads[i];
                nomad.health--;
            }
            this.ressources.food = 0;
        }
    }

    getNeighboorNomads(curPosition) {
        const neighbors = [];
        const position = curPosition ? curPosition : this.curNomad().position;
        if( position.x>0 ) {
            const nomads = this.nomads.filter(n=>n.position.x === position.x-1 && n.position.y === position.y);
            if( nomads.length === 1 ) {
                neighbors.push(nomads[0]);
            }
        }
        if( position.x<this.tiles[0].length-1 ) {
            const nomads = this.nomads.filter(n=>n.position.x === position.x+1 && n.position.y === position.y);
            if( nomads.length === 1 ) {
                neighbors.push(nomads[0]);
            }
        }
        if( position.y>0 ) {
            const nomads = this.nomads.filter(n=>n.position.x === position.x && n.position.y === position.y-1);
            if( nomads.length === 1 ) {
                neighbors.push(nomads[0]);
            }
        }
        if( position.y<this.tiles.length-1 ) {
            const nomads = this.nomads.filter(n=>n.position.x === position.x && n.position.y === position.y+1);
            if( nomads.length === 1 ) {
                neighbors.push(nomads[0]);
            }
        }
        return neighbors;
    }

    getNeighboorTiles(curPosition) {
        const tiles = [];
        const position = curPosition ? curPosition : this.curNomad().position;
        if( position.x>0 ) {
            tiles.push(this.getTile(position.x-1, position.y));
        }
        if( position.x<this.tiles[0].length-1 ) {
            tiles.push(this.getTile(position.x+1, position.y));
        }
        if( position.y>0 ) {
            tiles.push(this.getTile(position.x, position.y-1));
        }
        if( position.y<this.tiles.length-1 ) {
            tiles.push(this.getTile(position.x, position.y+1));
        }
        return tiles;
    }
}