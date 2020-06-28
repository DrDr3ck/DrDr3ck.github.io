function World(w,h) {
    this.w = w;
    this.h = h;
    this.level = [];

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
        for( let i=5; i < 15; i++ ) {
            this.level[i][12] = 'B';
        }
    }

    this.canUp = function(x,y) {
        const tile = this.level[x][Math.max(y-1,0)];
        if( tile === 'W' || tile === 'B' ) {
            return false;
        }
        return true;
    }

    this.canDown = function(x,y) {
        const tile = this.level[x][Math.min(y+1,this.h-1)];
        if( tile === 'W' || tile === 'B' ) {
            return false;
        }
        return true;
    }

    this.canLeft = function(x,y) {
        const tile = this.level[Math.max(x-1,0)][y];
        if( tile === 'W' || tile === 'B' ) {
            return false;
        }
        return true;
    }

    this.canRight = function(x,y) {
        const tile = this.level[Math.min(x+1,this.w-1)][y];
        if( tile === 'W' || tile === 'B' ) {
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
                }
            }
        }

        image(animationDiamond[floor(frameCount/3)%8],9*tileSize, 11*tileSize);

        image(animationEnemy1[floor(frameCount/3)%8],13*tileSize, 0*tileSize);
        image(animationEnemy2[floor(frameCount/3)%8],15*tileSize, 0*tileSize);
    }

    this.update = function() {
        return;
    }
}