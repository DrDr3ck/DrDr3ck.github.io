function BoulderDash(wx,wy) {
    this.x = wx*tileSize; // x in the screen
    this.y = wy*tileSize;
    this.wx = wx; // world x : i.e. the horizontal index of a tile in the world
    this.wy = wy;
    this.state = "pause";
    this.frame = 0;
    this.speed = 4;
    this.lastDirection = "right";

    this.setState = function(state) {
        if( this.state.startsWith("pause") || this.frame === 0) {
            this.state = state;
            this.frame = 8;
            if( this.state === "right" || this.state === "left") {
                this.lastDirection = this.state;
            }
        }
    }

    this.update = function() {
        if( this.state === "pause" && this.frame < 8 ) {
            const r = random();
            if( r > 0.98 ) {
                this.state = "pause1";
                this.frame = animationPause1.length*3;
            } else if( r > 0.96 ) {
                this.state = "pause2";
                this.frame = animationPause1.length*3;
            } else if( r > 0.94 ) {
                this.state = "pause3";
                this.frame = animationPause1.length*3;
            }
        }
        if( this.frame !== 0 ) {
            if( this.state.startsWith("pause") ) {
                this.frame-=0.25;
            } else {
                this.frame--;
                if( this.frame === 0 ) {
                    if( this.state === "up") {
                        wy--;
                    }
                    if( this.state === "down") {
                        wy++;
                    }
                    if( this.state === "left") {
                        wx--;
                    }
                    if( this.state === "right") {
                        wx++;
                    }
                }
            }
        } else {
            this.state = "pause";
            this.frame = 8*Math.floor(random(5,15));
        }

        if( this.state === "up") {
            world.level[wx][wy] = ' ';
            this.y -= this.speed;
        }
        if( this.state === "down") {
            world.level[wx][wy] = ' ';
            this.y += this.speed;
        }
        if( this.state === "left") {
            world.level[wx][wy] = ' ';
            this.x -= this.speed;
        }
        if( this.state === "right") {
            world.level[wx][wy] = ' ';
            this.x += this.speed;
        }
    }

    this.show = function() {
        const frame = floor(this.frame);
        if( this.state === "pause") {
            image(animationPause1[4], this.x,this.y);
        } else if( this.state === "pause1" ) {
            image(animationPause1[frame%animationPause1.length], this.x,this.y);
        } else if( this.state === "pause2" ) {
            image(animationPause2[frame%animationPause2.length], this.x,this.y);
        } else if( this.state === "pause3" ) {
            image(animationPause3[frame%animationPause3.length], this.x,this.y);
        } else if( this.state === "left" ) {
            image(animationLeft[frame%animationLeft.length], this.x,this.y);
        } else if( this.state === "right" ) {
            image(animationRight[frame%animationRight.length], this.x,this.y);
        } else if( this.state === "up" || this.state === "down" ) {
            if( this.lastDirection === "right" ) {
                image(animationRight[frame%animationRight.length], this.x,this.y);            
            } else {
                image(animationLeft[frame%animationLeft.length], this.x,this.y);
            }
        }
        textSize(22);
        fill(0, 102, 153);
        text(this.state, 0, 22);
    }
}