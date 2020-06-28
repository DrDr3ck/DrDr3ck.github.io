function BoulderDash(wx,wy) {
    this.x = wx*tileSize; // x in the screen
    this.y = wy*tileSize;
    this.wx = wx; // world x : i.e. the horizontal index of a tile in the world
    this.wy = wy;
    this.state = "pause_start";
    this.frame = 8;
    this.speed = 4;
    this.lastDirection = "right";
    this.scoreGems = 0;

    this.setState = function(state) {
        if( this.state == "pause_start" ) {
            return;
        }
        if( this.state.startsWith("pause") || this.frame === 0) {
            if( state.startsWith("shift") ) {
                // can shift ?
                state = state.substr(5);
                if( state === "right" && world.level[this.wx+1][this.wy] === 'D' ) {
                    world.level[this.wx+1][this.wy] = ' ';
                } else if( state === "left" && world.level[this.wx-1][this.wy] === 'D' ) {
                    world.level[this.wx-1][this.wy] = ' ';
                } else if( state === "up" && world.level[this.wx][this.wy-1] === 'D' ) {
                    world.level[this.wx][this.wy-1] = ' ';
                } else if( state === "down" && world.level[this.wx][this.wy+1] === 'D' ) {
                    world.level[this.wx][this.wy+1] = ' ';
                }
            } else {
                // can move ?
                let canMove = false;
                if( state === "up" && world.canUp(this.wx, this.wy) ) {
                    canMove = true;
                } else if( state === "down" && world.canDown(this.wx, this.wy) ) {
                    canMove = true;
                } else if( state === "left" && world.canLeft(this.wx, this.wy) ) {
                    canMove = true;
                } else if( state === "right" && world.canRight(this.wx, this.wy) ) {
                    canMove = true;
                }
                if( canMove ) {
                    this.state = state;
                    this.frame = 8;
                    if( this.state === "right" || this.state === "left") {
                        this.lastDirection = this.state;
                    }
                }
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
                        this.wy--;
                    }
                    if( this.state === "down") {
                        this.wy++;
                    }
                    if( this.state === "left") {
                        this.wx--;
                    }
                    if( this.state === "right") {
                        this.wx++;
                    }
                    if( world.level[this.wx][this.wy] === 'G' ) {
                        world.level[this.wx][this.wy] = ' ';
                        this.scoreGems += 1;
                    }
                    world.level[this.wx][this.wy] = 'b';
                }
            }
        } else {
            this.state = "pause";
            this.frame = 8*Math.floor(random(5,15));
        }

        if( this.state === "up" ) {
            if( this.frame !== 0 ) {
                world.level[this.wx][this.wy] = ' ';
            }
            this.y -= this.speed;
        }
        if( this.state === "down") {
            if( this.frame !== 0 ) {
                world.level[this.wx][this.wy] = ' ';
            }
            this.y += this.speed;
        }
        if( this.state === "left") {
            if( this.frame !== 0 ) {
                world.level[this.wx][this.wy] = ' ';
            }
            this.x -= this.speed;
        }
        if( this.state === "right") {
            if( this.frame !== 0 ) {
                world.level[this.wx][this.wy] = ' ';
            }
            this.x += this.speed;
        }
    }

    this.show = function() {
        const frame = floor(this.frame);
        if( this.state === "pause_start") {
            image(animationStart[frame%animationStart.length], this.x,this.y);
        } else if( this.state === "pause") {
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
        text(this.wx, 720, 22);
        text(this.wy, 760, 22);

        text(this.scoreGems, 120, 22);
    }
}