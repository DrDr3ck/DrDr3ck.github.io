function World(w,h) {
    this.w = w;
    this.h = h;
    this.level = [];
    this.rocks = [];
    this.slimes = [];
    this.enemies = [];

    this.readLevel = function() {
        // TODO: read a level
        for( let i=0; i < this.w; i++ ) {
            this.level.push([]);
            for( let j=1; j < this.h; j++ ) {
                this.level[i].push('D');
            }
        }    
        for( let i=0; i < this.w; i++ ) {
            this.level[i][1] = 'W';
            this.level[i][this.h-1] = 'W';
        }
        for( let i=1; i < this.h; i++ ) {
            this.level[0][i] = 'W';
            this.level[this.w-1][i] = 'W';
        }
        for( let i=7; i < 29; i++ ) {
            this.level[i][12] = 'B';
        }
        for( let i=1; i < 23; i++ ) {
            this.level[i][7] = 'B';
        }
        this.level[18][7] = 'M';

        // gems
        this.level[9][11] = 'G';
        this.level[14][6] = 'G';
        this.level[6][14] = 'G';

        this.slimes.push(createVector(18,14));
        this.slimes.forEach(rock => this.level[rock.x][rock.y] = 'S');

        this.rocks.push(createVector(18,2));
        this.rocks.push(createVector(26,2));
        this.level[18][3] = ' ';
        this.level[18][4] = ' ';
        this.level[18][5] = ' ';
        this.level[18][8] = ' ';
        
        this.rocks.forEach(rock => this.level[rock.x][rock.y] = 'R');
    }

    this.blocks = function(tile) {
        return tile === 'W' || tile === 'B' || tile === 'R' || tile === 'S';
    }

    this.canUp = function(x,y) {
        const tile = this.level[x][Math.max(y-1,0)];
        return !this.blocks(tile);
    }

    this.canDown = function(x,y) {
        const tile = this.level[x][Math.min(y+1,this.h-1)];
        return !this.blocks(tile);
    }

    this.canLeft = function(x,y) {
        const tile = this.level[Math.max(x-1,0)][y];
        return !this.blocks(tile);
    }

    this.canRight = function(x,y) {
        const tile = this.level[Math.min(x+1,this.w-1)][y];
        return !this.blocks(tile);
    }

    this.show = function() {
        for( let i=0; i < this.w; i++ ) {
            for( let j=1; j < this.h; j++ ) {
                if( this.level[i][j] === 'W' ) {
                    image(spriteWall,tileSize*i,tileSize*j,tileSize,tileSize);            
                } else if( this.level[i][j] === 'R' ) {
                    image(spriteRock,tileSize*i,tileSize*j,tileSize,tileSize);            
                } else if( this.level[i][j] === 'D' ) {
                    image(spriteDirt,tileSize*i,tileSize*j,tileSize,tileSize);            
                } else if( this.level[i][j] === 'B' ) {
                    image(spriteBrick,tileSize*i,tileSize*j,tileSize,tileSize);            
                } else if( this.level[i][j] === 'G' ) {
                    image(animationDiamond[floor(frameCount/3)%8],i*tileSize, j*tileSize);
                } else if( this.level[i][j] === 'S' ) {
                    image(animationSlime[floor(frameCount/3)%8],i*tileSize, j*tileSize);
                } else if( this.level[i][j] === 'M' ) {
                    image(animationMagicWall[floor(frameCount/3)%8],i*tileSize, j*tileSize);
                }
            }
        }

        this.enemies.forEach(enemy => {
            if( enemy.type == 1 ) {
                image(animationEnemy1[floor(frameCount/3)%8],enemy.x*tileSize, enemy.y*tileSize);    
            } else {
                image(animationEnemy2[floor(frameCount/3)%8],enemy.x*tileSize, enemy.y*tileSize);    
            }
        })

        // toolbar
        image(animationEnemy1[floor(frameCount/3)%8],13*tileSize, 0*tileSize);
        image(animationEnemy2[floor(frameCount/3)%8],15*tileSize, 0*tileSize);
    }

    this.isAvailableTile = function(x,y) {
        const tile = world.level[x][y];
        return tile === ' ' || tile === 'D';
    }

    this.update = function() {
        // update rocks
        if( frameCount % (FPS/4) !== 0 ) {
            return;
        }
        for( let i = 0; i < this.rocks.length; i++ ) {
            const rock = this.rocks[i];
            const tile = world.level[rock.x][rock.y+1];
            if( tile === ' ') {
                world.level[rock.x][rock.y] = ' ';
                this.rocks[i] = createVector(rock.x, rock.y+1);
                world.level[rock.x][rock.y+1] = 'R';
            }
        }
        if( this.slimes.length === 0 ) {
            return;
        }
        const r = random(1);
        if( r > 0.8 ) {
            // try to find a spot to add more slime
            let i = Math.round(random(0,this.slimes.length-1));
            const slimePosition = this.slimes[i];
            let x = Math.max(0,slimePosition.x-1);
            let y = slimePosition.y;
            if( this.isAvailableTile(x, y) ) {
                this.slimes.push(createVector(x, y));
                this.level[x][y] = 'S';
                return;
            }
            x = Math.min(this.w-1,slimePosition.x+1);
            y = slimePosition.y;
            if( this.isAvailableTile(x, y) ) {
                this.slimes.push(createVector(x, y));
                this.level[x][y] = 'S';
                return;
            }
            x = slimePosition.x;
            y = Math.max(0,slimePosition.y-1);
            if( this.isAvailableTile(x, y) ) {
                this.slimes.push(createVector(x, y));
                this.level[x][y] = 'S';
                return;
            }
            x = slimePosition.x;
            y = Math.min(this.h-1,slimePosition.y+1);
            if( this.isAvailableTile(x, y) ) {
                this.slimes.push(createVector(x, y));
                this.level[x][y] = 'S';
                return;
            }
        }
    }
}