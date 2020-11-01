const world = {
    map: null,
    width: 3600,
    height: 400,
    player1: null,
    player2: null,
    fire1: {
        bEnergising: true,
        bFireWeapon: false,
        fEnergyLevel: 0.0
    },
    fire2: {
        bEnergising: true,
        bFireWeapon: false,
        fEnergyLevel: 0.0
    }
}

const PI = 3.141592;

class Entity {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.velX = 0;
        this.velY = 0;
        this.accX = 0;
        this.accY = 0;
        this.stable = false;
        this.radius = 18;

        this.friction = 0.2;
    }

    draw(dx, dy) {
        push();
        fill(250,250,120);
        ellipse(this.x+dx, this.y+dy, this.radius*2, this.radius*2);
        pop();
    }

    update(elapsedTime) {
        if( this.stable ) return;
        this.accY = 2.0; // gravity
        // update velocity
        this.velX += this.accX * elapsedTime;
        this.velY += this.accY * elapsedTime;
        // update position
        const fPotentialX = this.x + this.velX * elapsedTime;
        const fPotentialY = this.y + this.velY * elapsedTime;
        // reset acceleration
        this.accX = 0;
        this.accY = 0;
        this.stable = false;

        // collision with map
        const angle = atan2(this.velY, this.velX);
        let fResponseX = 0;
        let fResponseY = 0;
        let bCollision = false;

        for( let r = angle-PI/2.0; r < angle+PI/2.0; r+=PI/8.0)
        {
            // Calculate test point on circumference of circle
            let fTestPosX = (this.radius) * cos(r) + fPotentialX;
            let fTestPosY = (this.radius) * sin(r) + fPotentialY;

            // Constrain to test within map boundary
            if (fTestPosX >= world.width) fTestPosX = world.width - 1;
            if (fTestPosY >= world.height) fTestPosY = world.height - 1;
            if (fTestPosX < 0) fTestPosX = 0;
            if (fTestPosY < 0) fTestPosY = 0;

            // Test if any points on semicircle intersect with terrain
            if (world.map[Math.round(fTestPosX)][Math.round(fTestPosY)] != 0)
            {
                // Accumulate collision points to give an escape response vector
                // Effectively, normal to the areas of contact
                fResponseX += fPotentialX - fTestPosX;
                fResponseY += fPotentialY - fTestPosY;
                bCollision = true;
            }
        }

        //console.log("velocity: ",this.velX,this.velY);

        // Calculate magnitudes of response and velocity vectors
        const fMagVelocity = sqrt(this.velX*this.velX + this.velY*this.velY);
        const fMagResponse = sqrt(fResponseX*fResponseX + fResponseY*fResponseY);

        // Collision occurred
        if (bCollision)
        {
            // Force object to be stable, this stops the object penetrating the terrain
            //this.stable = true;
            //console.log("fMagVelocity",fMagVelocity);
            if (fMagVelocity < 0.5) this.stable = true;
            
            // Calculate reflection vector of objects velocity vector, using response vector as normal
            const dot = this.velX * (fResponseX / fMagResponse) + this.velY * (fResponseY / fMagResponse);
  
            // Use friction coefficient to dampen response (approximating energy loss)
            this.velX = this.friction * (-2.0 * dot * (fResponseX / fMagResponse) + this.velX);
            this.velY = this.friction * (-2.0 * dot * (fResponseY / fMagResponse) + this.velY);
            /*
            //Some objects will "die" after several bounces
            if (p->nBounceBeforeDeath > 0)
            {
                p->nBounceBeforeDeath--;
                p->bDead = p->nBounceBeforeDeath == 0;

                // If object died, work out what to do next
                if (p->bDead)
                {
                    // Action upon object death
                    // = 0 Nothing
                    // > 0 Explosion 
                    int nResponse = p->BounceDeathAction();
                    if (nResponse > 0)
                        Boom(p->px, p->py, nResponse);
                }
            }
            */

        }
        else
        {
            // No collision so update objects position
            this.x = fPotentialX;
            this.y = fPotentialY;
        }

        // Turn off movement when tiny
        //if (fMagVelocity < 0.5) this.stable = true;
    }
}

class Bot extends Entity {
    constructor(x,y,radius) {
        super(x,y);
        this.radius = radius;
        this.shootAngle = 0;
    }
}

const entities = [];

entities.push( new Bot(100,50,16) );
entities.push( new Bot(2800,50,16) );
world.player1 = entities[0];
world.player2 = entities[1];
world.player2.shootAngle = -PI;

function createMap() {
    const map = [];
    for( let i=0; i < world.width; i++ ) {
        const column = [];
        for( let j=0; j < world.height; j++ ) {
            if( i < 1800 ) {
                column.push( j>300 ? 1 : 0);
            } else {
                column.push( j>250 ? 1 : 0);
            }
        }
        map.push(column);
    }
    return map;
}

function drawShootAngle(player, dx=0, dy=0) {
    const cx = player.x + dx + 8.0*cos(player.shootAngle);
    const cy = player.y + dy + 8.0*sin(player.shootAngle);
    fill(0);
    ellipse(cx,cy,4,4);
}

function setup() {   
    canvas = createCanvas(1200, 850);
    canvas.parent('canvas');

    world.map = createMap();
}

function draw() { 
    const elapsedTime = 0.3;
    if( world.player1.stable ) {
        // player 1 left
        if( keyIsDown(81) || keyIsDown(65) ) { // q or a
            world.player1.shootAngle -= 1 * elapsedTime / 5;
        }
        // player 1 right
        if( keyIsDown(68) ) {
            world.player1.shootAngle += 1 * elapsedTime / 5;
        }
        // player 1 fire
        if( keyIsDown(83) ) { 
            if (world.fire1.bEnergising) {
                world.fire1.fEnergyLevel += 0.75 * elapsedTime / 10;
                if (world.fire1.fEnergyLevel >= 1.0) // If it maxes out, Fire!
                {
                    world.fire1.fEnergyLevel = 1.0;
                    world.fire1.bFireWeapon = true;
                }
            }
        }
        if (world.fire1.bFireWeapon) {
            // Reset flags involved with firing weapon
            world.fire1.bFireWeapon = false;
            world.fire1.fEnergyLevel = 0.0;
            world.fire1.bEnergising = false;
            console.log("fire 1");
        }
    }

    if( world.player2.stable ) {
        // player 2 left
        if( keyIsDown(100) ) {
            world.player2.shootAngle -= 1 * elapsedTime / 5;
        }
        // player 2 right
        if( keyIsDown(102) ) {
            world.player2.shootAngle += 1 * elapsedTime / 5;
        }
        // player 2 fire
        if( keyIsDown(101) ) {
            if (world.fire2.bEnergising) {
                world.fire2.fEnergyLevel += 0.75 * elapsedTime / 10;
                if (world.fire2.fEnergyLevel >= 1.0) // If it maxes out, Fire!
                {
                    world.fire2.fEnergyLevel = 1.0;
                    world.fire2.bFireWeapon = true;
                }
            }
        }
        if (world.fire2.bFireWeapon) {
            // Reset flags involved with firing weapon
            world.fire2.bFireWeapon = false;
            world.fire2.fEnergyLevel = 0.0;
            world.fire2.bEnergising = false;
            console.log("fire 2");
        }
    }

    // update objects
    entities.forEach(entity => {
        entity.update(elapsedTime);
    });
    
    // draw map
    noStroke();
    loadPixels();
    for( let i=0; i < 1200; i++ ) {
        for( let j=0; j < world.height; j++ ) {
            let index = i + j * 1200;
            let land = world.map[i][j] > 0;
            pixels[index*4] = 0;      
            pixels[index*4+1] = land ? 128 : 0;
            pixels[index*4+2] = land ? 0 : 128;
            pixels[index*4+3] = 255;    
            land = world.map[i+2400][j] > 0;
            index = i + (j+450) * 1200;
            pixels[index*4] = 0;      
            pixels[index*4+1] = land ? 128 : 0;
            pixels[index*4+2] = land ? 0 : 128;
            pixels[index*4+3] = 255;    
        }
    }
    updatePixels();
    fill(255);
    rect(0,400,1200,50);

    // draw objects
    let gameIsStable = true;
    world.player1.draw(0,0);
    world.player2.draw(-1800,450);
    entities.forEach(entity => {
        
        gameIsStable &= entity.stable;
    });

    // draw shootangle
    drawShootAngle(world.player1);
    drawShootAngle(world.player2,-1800,+450);

    // Draws an Energy Bar, indicating how much energy should the weapon be fired with
    push();
    strokeWeight(3);
    stroke(250,100,100);
    for (let i = 0; i < 11 * world.fire1.fEnergyLevel; i++)
    {
        line(world.player1.x - 5, world.player1.y - 12, world.player1.x - 5 + i, world.player1.y - 12);
    }
    for (let i = 0; i < 11 * world.fire2.fEnergyLevel; i++)
    {
        line(world.player2.x - 5 - 1800, world.player2.y - 12 + 450, world.player2.x - 5 + i - 1800, world.player2.y - 12 + 450);
    }
    pop();

    if( gameIsStable ) {
        fill(250,100,100);
        rect(10,10,10,10);
    }

}

function keyPressed() {
    if( world.player1.stable ) {
        if( key === 'z' || key === 'w') {
            console.log("player 1 jump");
            const a = world.player1.shootAngle;
            world.player1.velX = 4.0 * cos(a);
            world.player1.velY = 8.0 * sin(a);
            world.player1.stable = false;
        }
        if( key === 's') {
            // start firing
            world.fire1.bEnergising = true;
			world.fire1.bFireWeapon = false;
			world.fire1.fEnergyLevel = 0.0;
        }
    }
    if( world.player2.stable ) {
        if( key === '8' ) {
            console.log("player 2 jump");
            const a = world.player2.shootAngle;
            world.player2.velX = 4.0 * cos(a);
            world.player2.velY = 8.0 * sin(a);
            world.player2.stable = false;
        }
        if( key === '5') {
            // start firing
            world.fire2.bEnergising = true;
			world.fire2.bFireWeapon = false;
			world.fire2.fEnergyLevel = 0.0;
        }
    }
    console.log("Keycode for ",key,":",keyCode);
}

function keyReleased() {
    if( world.player1.stable ) {
        if( key === 's') {
            if (world.fire1.bEnergising) {
                world.fire1.bFireWeapon = true;
            }
			world.fire1.bEnergising = false;
        }
    }
    if( world.player2.stable ) {
        if( key === '5') {
            if (world.fire2.bEnergising) {
                world.fire2.bFireWeapon = true;
            }
			world.fire2.bEnergising = false;
        }
    }
}