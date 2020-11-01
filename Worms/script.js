const world = {
    map: null,
    width: 2400,
    height: 400,
    player1: null,
    player2: null,
    cameraTracking1: null,
    cameraTracking2: null,
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
        this.nBounceBeforeDeath = -1;
        this.bDead = false;

        this.friction = 0.2;
    }

    draw(dx, dy) {
        ellipse(this.x-dx, this.y-dy, this.radius*2, this.radius*2);
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
            if (world.map[Math.floor(fTestPosX)][Math.floor(fTestPosY)] !== 0)
            {
                // Accumulate collision points to give an escape response vector
                // Effectively, normal to the areas of contact
                fResponseX += fPotentialX - fTestPosX;
                fResponseY += fPotentialY - fTestPosY;
                bCollision = true;
            }
        }

        // Calculate magnitudes of response and velocity vectors
        const fMagVelocity = sqrt(this.velX*this.velX + this.velY*this.velY);
        const fMagResponse = sqrt(fResponseX*fResponseX + fResponseY*fResponseY);

        // Collision occurred
        if (bCollision)
        {
            // Force object to be stable, this stops the object penetrating the terrain
            if (fMagVelocity < 1) this.stable = true;
            
            // Calculate reflection vector of objects velocity vector, using response vector as normal
            const dot = this.velX * (fResponseX / fMagResponse) + this.velY * (fResponseY / fMagResponse);
  
            // Use friction coefficient to dampen response (approximating energy loss)
            this.velX = this.friction * (-2.0 * dot * (fResponseX / fMagResponse) + this.velX);
            this.velY = this.friction * (-2.0 * dot * (fResponseY / fMagResponse) + this.velY);
            
            //Some objects will "die" after several bounces
            if (this.nBounceBeforeDeath > 0)
            {
                this.nBounceBeforeDeath--;
                this.bDead = this.nBounceBeforeDeath == 0;

                // If object died, work out what to do next
                if (this.bDead && this.radius > 2)
                {
                    // Shockwave other entities in range
                    entities.filter(entity => entity !== this).forEach(entity => {
                        const dx = entity.x - this.x;
                        const dy = entity.y - this.y;
                        const dist = Math.max(0.0001, sqrt(dx*dx+dy*dy));

                        if( dist < entity.radius * 2) {   
                            entity.velX = (dx/dist)* entity.radius;
                            entity.velY = (dy/dist)* entity.radius;
                            console.log("bouge",entity.velX,entity.velY);
                            entity.stable = false;
                        }
                    });
        
                    console.log("boom in", this.x);
                    for (let i = 0; i < 20; i++)
			            entities.push(new Debris(this.x, this.y));
                    /*
                    // Action upon object death
                    // = 0 Nothing
                    // > 0 Explosion 
                    const nResponse = this.BounceDeathAction();
                    if (nResponse > 0)
                        Boom(this.x, this.y, nResponse);
                        */
                }
            } 
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

const YELLOW = 1;
const RED = 2;

class Bot extends Entity {
    constructor(x,y,radius,team) {
        super(x,y);
        this.radius = radius;
        this.shootAngle = 0;
        this.team = team;
    }

    draw(dx,dy) {
        if( this.team === YELLOW) {
            fill(250,250,120);
        }
        if( this.team === RED) {
            fill(250,120,120);
        }
        super.draw(dx,dy);
    }
}

class Debris extends Entity {
    constructor(x,y) {
        super(x,y);
        this.velX = 10.0 * Math.cos(Math.random() * 2.0 * PI);
        this.velY = 10.0 * Math.sin(Math.random() * 2.0 * PI);
        this.radius = 2.0;
        this.friction = 0.8;
        this.nBounceBeforeDeath = 5; // After 5 bounces, dispose
    }
}

class Missile extends Entity {
    constructor(x,y,vx, vy) {
        super(x,y);
        this.radius = 3;
        this.velX = vx;
        this.velY = vy;
        this.friction = 0.5;
        this.nBounceBeforeDeath = 1;
    }
}

const userLang = navigator.language || navigator.userLanguage;  // "en-US"

let entities = [];

entities.push( new Bot(550,50,16,YELLOW) );
entities.push( new Bot(2050,50,16,RED) );
entities.push( new Bot(700,50,16,YELLOW) );
entities.push( new Bot(1900,50,16,RED) );

world.player1 = entities[0];
world.player2 = entities[1];
world.cameraTracking1 = world.player1;
world.cameraTracking2 = world.player2;
world.player2.shootAngle = -PI;

function createMap() {
    const map = [];
    for( let i=0; i < world.width; i++ ) {
        const column = [];
        const maxLand = noise(i*0.003);
        for( let j=0; j < world.height; j++ ) {
            let land = 1;
            if( i % 100 === 0 ) land = 2;
            column.push( j>maxLand*400 ? land : 0);
        }
        map.push(column);
    }
    return map;
}

function drawShootAngle(player, dx=0, dy=0) {
    const cx = player.x - dx + 8.0*cos(player.shootAngle);
    const cy = player.y - dy + 8.0*sin(player.shootAngle);
    fill(0);
    ellipse(cx,cy,4,4);
}

function getColor(mapValue) {
    switch(mapValue) {
        case 0:
            return {r: 0, g: 0, b: 128};
        case 1:
            return {r: 0, g: 128, b: 0};
        case 2:
            return {r: 100, g: 128, b: 100};
        default:
            return {r:0, g:0, b:0};
    }
}

function drawObjects(dx, dy) {
    entities.forEach(entity => {
        if( entity.y > 0 )
            entity.draw(dx,dy);
    });
}

function drawFire(fire, player, dx, dy) {
    for (let i = 0; i < 11 * fire.fEnergyLevel; i++)
    {
        line(player.x - 5 - dx, player.y - 12 - dy, player.x - 5 + i - dx, player.y - 12 - dy);
    }
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
            // Get Weapon Origin
            const ox = world.player1.x;
            const oy = world.player1.y;

            // Get Weapon Direction
            const dx = cos(world.player1.shootAngle);
            const dy = sin(world.player1.shootAngle);

            // create Missile
            const missileStrength = 60.0* world.fire1.fEnergyLevel;
            const m = new Missile(ox, oy, dx * missileStrength, dy * missileStrength);
            entities.push(m);
            //pCameraTrackingObject = m;
                    
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
            // Get Weapon Origin
            const ox = world.player2.x;
            const oy = world.player2.y;

            // Get Weapon Direction
            const dx = cos(world.player2.shootAngle);
            const dy = sin(world.player2.shootAngle);

            // create Missile
            const missileStrength = 60.0* world.fire2.fEnergyLevel;
            const m = new Missile(ox, oy, dx * missileStrength, dy * missileStrength);
            entities.push(m);
            //pCameraTrackingObject = m;

            // Reset flags involved with firing weapon
            world.fire2.bFireWeapon = false;
            world.fire2.fEnergyLevel = 0.0;
            world.fire2.bEnergising = false;
            console.log("fire 2");
        }
    }

    let cameraPosX1 = 0;
    let cameraPosY1 = 0;

    let cameraPosX2 = 0;
    let cameraPosY2 = 0;

    if (world.cameraTracking1 !== null)
		{
			cameraPosX1 = world.cameraTracking1.x - width / 2;
			cameraPosY1 = world.cameraTracking1.y - height / 2;
			//fCameraPosXTarget = pCameraTrackingObject->px - ScreenWidth() / 2;
			//fCameraPosYTarget = pCameraTrackingObject->py - ScreenHeight() / 2;
			//fCameraPosX += (fCameraPosXTarget - fCameraPosX) * 5.0f * fElapsedTime;
			//fCameraPosY += (fCameraPosYTarget - fCameraPosY) * 5.0f * fElapsedTime;
        }

        if (world.cameraTracking1 !== null)
		{
			cameraPosX2 = world.cameraTracking2.x - width / 2;
			cameraPosY2 = world.cameraTracking2.y - height / 2;
        }
        
    // Clamp map boundaries
    if (cameraPosX1 < 0) cameraPosX1 = 0;
    if (cameraPosX1 >= world.width - width) cameraPosX1 = world.width - width;
    if (cameraPosY1 < 0) cameraPosY1 = 0;
    if (cameraPosY1 >= world.height - height) cameraPosY1 = world.height - 400;

    if (cameraPosX2 < 0) cameraPosX2 = 0;
    if (cameraPosX2 >= world.width - width) cameraPosX2 = world.width - width;
    if (cameraPosY2 < 0) cameraPosY2 = 0;
    if (cameraPosY2 >= world.height - height) cameraPosY2 = world.height - 400;

    // update objects
    entities.forEach(entity => {
        entity.update(elapsedTime);
    });
    
    // draw map
    noStroke();
    loadPixels();
    const cameraDx1 = round(cameraPosX1);
    const cameraDy1 = round(cameraPosY1);
    const cameraDx2 = round(cameraPosX2);
    const cameraDy2 = round(cameraPosY2);
    for( let i=0; i < 1200; i++ ) {
        for( let j=0; j < world.height; j++ ) {
            let index = i + j * 1200;
            let color = getColor(world.map[i+cameraDx1][j+cameraDy1]);
            pixels[index*4] = color.r;      
            pixels[index*4+1] = color.g;
            pixels[index*4+2] = color.b;
            pixels[index*4+3] = 255;    
            color = getColor(world.map[i+cameraDx2][j+cameraDy2]); //getColor(world.map[i+2400][j]);
            index = i + (j+450) * 1200;
            pixels[index*4] = color.r;        
            pixels[index*4+1] = color.g;
            pixels[index*4+2] = color.b;
            pixels[index*4+3] = 255;    
        }
    }
    updatePixels();
    fill(255);
    rect(0,400,1200,50);

    // draw objects
    const dy = -450;
    drawObjects(cameraPosX1, cameraPosY1);
    drawObjects(cameraPosX2, cameraPosY2+dy);
    let gameIsStable = true;
    entities.forEach(entity => {
        gameIsStable &= entity.stable;
    });

    // draw shootangle
    drawShootAngle(world.player1,cameraPosX1,cameraPosY1);
    drawShootAngle(world.player2,cameraPosX2,cameraPosY2+dy);

    // Draws an Energy Bar, indicating how much energy should the weapon be fired with
    push();
    strokeWeight(3);
    stroke(250,100,100);
    drawFire(world.fire1, world.player1, cameraPosX1, cameraPosY1);
    stroke(100,250,100);
    drawFire(world.fire2, world.player2, cameraPosX2,cameraPosY2+dy);
    pop();

    // text for help
    textSize(16);
    textAlign(LEFT);
    if( userLang !== "en-US" ) {
        text('Q-D for aiming', 10, 390);
        text('Z to jump', 10, 390-16-5);
        text('Hold S to fire', 10, 390 - 16*2 - 5*2);
    } else {
        text('A-D for aiming', 10, 390);
        text('W to jump', 10, 390-16-5);
        text('Hold S to fire', 10, 390 - 16*2 - 5*2);
    }

    textAlign(RIGHT);
    text('4-6 for aiming', 1190, 390+450);
    text('8 to jump', 1190, 390-16-5+450);
    text('Hold 5 to fire', 1190, 390 - 16*2 - 5*2+450);

    if( gameIsStable ) {
        fill(250,100,100);
        rect(10,10,10,10);
    }

    // TODO: memory leak
    entities = entities.filter(entity => !entity.bDead);

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