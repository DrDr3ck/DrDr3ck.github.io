const world = {
    tileX: -1,
    tileY: -1
};

const tileSize = 20;

function drawRect(tileX, tileY) {
    rect(tileX*tileSize, tileY*tileSize, tileSize, tileSize);
}

function setup() {   
    canvas = createCanvas(1200, 400);
    canvas.parent('canvas');
}

function draw() { 
    background(51);

    fill(10,150,10);
    noStroke();
    ellipse(110,110,tileSize,tileSize);

    noFill();
    stroke(150);
    drawRect(world.tileX-1, world.tileY);
    drawRect(world.tileX+1, world.tileY);
    drawRect(world.tileX, world.tileY-1);
    drawRect(world.tileX, world.tileY+1);
    stroke(200);
    drawRect(world.tileX, world.tileY);
}

function mouseMoved() {
    //console.info("Mouse position: (" + mouseX + ", " + mouseY+")");
    world.tileX = Math.floor(mouseX / tileSize);
    world.tileY = Math.floor(mouseY / tileSize);
}