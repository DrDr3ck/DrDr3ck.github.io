function World(w,h) {
    this.w = w;
    this.h = h;
    this.level = [];
    this.rocks = [];
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
        this.level[9][11] = 'G';
        this.level[14][6] = 'G';
        this.level[6][14] = 'G';

        this.rocks.push(createVector(18,2));
        this.rocks.push(createVector(26,2));
        this.level[18][3] = ' ';
        this.level[18][4] = ' ';
        this.level[18][5] = ' ';
        
        this.rocks.forEach(rock => this.level[rock.x][rock.y] = 'R');
    }

    this.canUp = function(x,y) {
        const tile = this.level[x][Math.max(y-1,0)];
        if( tile === 'W' || tile === 'B' || tile === 'R' ) {
            return false;
        }
        return true;
    }

    this.canDown = function(x,y) {
        const tile = this.level[x][Math.min(y+1,this.h-1)];
        if( tile === 'W' || tile === 'B' || tile === 'R' ) {
            return false;
        }
        return true;
    }

    this.canLeft = function(x,y) {
        const tile = this.level[Math.max(x-1,0)][y];
        if( tile === 'W' || tile === 'B' || tile === 'R' ) {
            return false;
        }
        return true;
    }

    this.canRight = function(x,y) {
        const tile = this.level[Math.min(x+1,this.w-1)][y];
        if( tile === 'W' || tile === 'B' || tile === 'R' ) {
            return false;
        }
        return true;
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
    }
}