const gravity = 1;

class Player {
    constructor() {
        const sprite = new Sprite(50, 50);
        sprite.addAnimation('idle', 'world', [ 0 ], FPS, true);
        sprite.addAnimation('wait1', 'world', [ 8, 9, 10, 11, 12, 13, 14, 15 ], FPS, true);
        sprite.addAnimation('wait2', 'world', [ 16, 17, 18, 19, 20, 21, 22, 23 ], FPS, true);
        sprite.addAnimation('wait3', 'world', [ 24, 25, 26, 27, 28, 29, 30, 31 ], FPS, true);
        sprite.addAnimation('left', 'world', [ 32, 33, 34, 35, 36, 37, 38, 39 ], FPS, true);
        sprite.addAnimation('right', 'world', [ 40, 41, 42, 43, 44, 45, 46, 47 ], FPS, true);
        sprite.speed = 0.4;
        this.sprite = sprite;

        this.vx = 0;
        this.vy = 0;
        this.inMove = true;
    }

    draw() {
        this.sprite.draw();
    }

    update(elapsedTime) {
        this.sprite.update(elapsedTime);
        const spriteBox = this.sprite.getBox();
        spriteBox.w += this.vx;
        spriteBox.h += this.vy;
        this.sprite.position.y += this.vy;
        this.sprite.position.x += this.vx;
        // check if new position is colliding a wall
        world.walls.forEach(wall=>{
            if( wall.collide(spriteBox)) {
                if( this.vy > 0) {
                    this.sprite.position.y = wall.y-this.sprite.height;
                    this.vy = 0; // no more falling
                    this.inMove = false;
                } else if( this.vy < 0) {
                    this.sprite.position.y = wall.y+wall.h;
                    this.vy = 0;
                    this.inMove = false;
                } else if( this.vx >= 0 ) {
                    this.sprite.position.x = wall.x-this.sprite.width;
                    this.vx = 0;
                    this.inMove = false;
                } else {
                    this.sprite.position.x = wall.x+wall.w;
                    this.vx = 0;
                    this.inMove = false;
                }
                console.log("vx", this.vx);
            }
        });
        world.platforms.forEach(platform=>{
            if( platform.collide(spriteBox)) {
                if( this.vy >= 0 && -this.sprite.position.y+platform.y >= this.sprite.height*0.75-this.vy ) {
                    this.sprite.position.y = platform.y-this.sprite.height;
                    this.vy = 0; // no more falling
                    this.inMove = false;
                }
                
            }
        });
        this.vy = this.vy + gravity;
    }
}

class Wall {
    constructor(x,y,w,h) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
    }

    draw() {
        push();
        fill(150,50,50);
        rect(this.x, this.y, this.w, this.h);
        pop();
    }

    getBox() {
        return {x:this.x, y: this.y, w: this.w, h: this.h};
    }

    collide(rect2) {
		if( !rect2 ) {
			return false;
		}
        const rect1 = this.getBox();
		if (
			rect1.x < rect2.x + rect2.w &&
			rect1.x + rect1.w > rect2.x &&
			rect1.y < rect2.y + rect2.h &&
			rect1.h + rect1.y > rect2.y
		) {
			return true;
        }
		return false;
	}

    // collision: https://katyscode.wordpress.com/2013/01/18/2d-platform-games-collision-detection-for-dummies/
}

class Platform extends Wall {
    constructor(x,y,w,h) {
        super(x,y,w,h);
    }

    draw() {
        push();
        fill(50,150,50);
        rect(this.x, this.y, this.w, this.h);
        pop();
    }
}

class World {
    constructor() {
        this.player = new Player();
        this.walls = [new Wall(-100, windowHeight-50, windowWidth+200, 100)];
        this.platforms = [];
    }

    draw() {
        this.walls.forEach(wall=>wall.draw());
        this.platforms.forEach(platform=>platform.draw());
        this.player.draw();
    }

    update(elapsedTime) {
        this.player.update(elapsedTime);
    }
}