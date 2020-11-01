const world = {
    map: null,
    width: 3600,
    height: 400
}

class Entity {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.velX = 0;
        this.velY = 0;
        this.accX = 0;
        this.accY = 0;
        this.stable = false;
    }

    draw() {
        push();
        fill(250,250,120);
        ellipse(this.x, this.y, 16,16);
        pop();
    }

    update() {
        if( this.stable ) return;
        
    }
}

const entities = [];

entities.push( new Entity(100,50) );

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

function setup() {   
    canvas = createCanvas(1200, 850);
    canvas.parent('canvas');

    world.map = createMap();
}

function draw() { 
    noStroke();
    background(51);
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

    entities.forEach(entity => {
        entity.draw();
        entity.update();
    });

    // player 1 left
    if( keyIsDown(81) ) {
        console.log(key);
    }
    // player 1 right
    if( keyIsDown(68) ) {
        console.log(key);
    }
    // player 1 fire
    if( keyIsDown(83) ) {
        console.log(key);
    }

    // player 2 left
    if( keyIsDown(100) ) {
        console.log(key);
    }
    // player 2 right
    if( keyIsDown(102) ) {
        console.log(key);
    }
    // player 2 fire
    if( keyIsDown(101) ) {
        console.log(key);
    }
}

function keyPressed() {
    if( key === 'z' ) {
        console.log("player 1 jump");
    }
    if( key === '8' ) {
        console.log("player 2 jump");
    }
    console.log("Keycode for ",key,":",keyCode);
}