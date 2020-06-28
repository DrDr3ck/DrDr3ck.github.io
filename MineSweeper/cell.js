function Cell(x,y) {
    this.x = x;
    this.y = y;
    this.shown = false;
    this.mine = false;
    this.flag = false;
    this.neighborCount = 0;

    this.countNeighbor = function() {
        for( let xoff = -1; xoff <= 1; xoff++ ) {
            for( let yoff = -1; yoff <= 1; yoff++ ) {
                const x = this.x-xoff;
                const y = this.y-yoff;
                if( outOfRange(x, cols) || outOfRange(y, rows) ) {
                    continue;
                }
                if( board[x][y].mine ) {
                    this.neighborCount++;
                }
            }    
        }
    }

    this.setShown = function() {
        if( this.shown ) {
            return;
        }
        this.shown = true;
        this.flag = false;
        if( this.neighborCount === 0 ) {
            this.floodFill();
        }
    }

    this.floodFill = function() {
        for( let xoff = -1; xoff <= 1; xoff++ ) {
            for( let yoff = -1; yoff <= 1; yoff++ ) {
                const x = this.x-xoff;
                const y = this.y-yoff;
                if( outOfRange(x, cols) || outOfRange(y, rows) ) {
                    continue;
                }
                board[x][y].setShown();
            }    
        }
    }

    this.show = function() {
        stroke(0);
        if( !this.shown ) {
            fill(255);
            rect(this.x*tileSize, this.y*tileSize, tileSize, tileSize);
            if( this.flag ) {
                fill(255,69,0);
                offset = 6;
                rect(this.x*tileSize+offset, this.y*tileSize+offset, tileSize-offset*2, tileSize-offset*2);
            }
        } else {
            fill(200);
            rect(this.x*tileSize, this.y*tileSize, tileSize, tileSize);
            if( this.flag ) {
                fill(255,69,0);
                offset = 6;
                rect(this.x*tileSize+offset, this.y*tileSize+offset, tileSize-offset*2, tileSize-offset*2);
            }
            if( this.mine ) {
                fill(255);
                ellipse(this.x*tileSize+tileSize/2, this.y*tileSize+tileSize/2, tileSize/2, tileSize/2);
            } else if( this.neighborCount > 0 ) {
                fill(0);
                text(this.neighborCount, this.x*tileSize+tileSize/2, this.y*tileSize+tileSize/2+6);
            }
        }
    }
}