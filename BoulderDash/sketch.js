let boulder;
let world;
let tileSize = 32;
let spritesheet;
let animationStart = [];
let animationPause1 = [];
let animationPause2 = [];
let animationPause3 = [];
let animationLeft = [];
let animationRight = [];
let animationDiamond = [];
let animationEnemy1 = [];
let animationEnemy2 = [];
let spriteWall;
let spriteBrick;
let spriteRock;
let spriteDirt;

let FPS = 80;

function preload() {
    spritesheet = loadImage("sprites.png");
}

function setup() {
    world = new World(30,20);
    world.readLevel();
    createCanvas(tileSize*world.w,tileSize*world.h);
    boulder = new BoulderDash(2,3);
    for( let i = 0 ; i < 8; i++) {
        animationPause1.push(spritesheet.get(tileSize*i,tileSize*1,tileSize,tileSize));
        animationPause2.push(spritesheet.get(tileSize*i,tileSize*2,tileSize,tileSize));
        animationPause3.push(spritesheet.get(tileSize*i,tileSize*3,tileSize,tileSize));
        animationLeft.push(spritesheet.get(tileSize*i,tileSize*4,tileSize,tileSize));
        animationRight.push(spritesheet.get(tileSize*i,tileSize*5,tileSize,tileSize));
        animationDiamond.push(spritesheet.get(tileSize*i,tileSize*10,tileSize,tileSize));
        animationEnemy1.push(spritesheet.get(tileSize*i,tileSize*9,tileSize,tileSize));
        animationEnemy2.push(spritesheet.get(tileSize*i,tileSize*11,tileSize,tileSize));
    }
    spriteWall = spritesheet.get(tileSize*1,tileSize*6,tileSize,tileSize);
    spriteBrick = spritesheet.get(tileSize*3,tileSize*6,tileSize,tileSize);
    spriteRock = spritesheet.get(tileSize*0,tileSize*7,tileSize,tileSize);
    spriteDirt = spritesheet.get(tileSize*1,tileSize*7,tileSize,tileSize);

    animationStart.push(spritesheet.get(tileSize*0,tileSize*0,tileSize,tileSize));
    animationStart.push(spritesheet.get(tileSize*0,tileSize*0,tileSize,tileSize));
    animationStart.push(spritesheet.get(tileSize*3,tileSize*0,tileSize,tileSize));
    animationStart.push(spritesheet.get(tileSize*3,tileSize*0,tileSize,tileSize));
    animationStart.push(spritesheet.get(tileSize*2,tileSize*0,tileSize,tileSize));
    animationStart.push(spritesheet.get(tileSize*2,tileSize*0,tileSize,tileSize));
    animationStart.push(spritesheet.get(tileSize*1,tileSize*0,tileSize,tileSize));
    animationStart.push(spritesheet.get(tileSize*1,tileSize*0,tileSize,tileSize));
    
    frameRate(FPS);
}

function draw() {
    background(0);

    if(keyIsDown(LEFT_ARROW)) {
        boulder.setState("left");
    } else if(keyIsDown(RIGHT_ARROW)) {
        boulder.setState("right");
    } else if(keyIsDown(UP_ARROW)) {
        boulder.setState("up");
    } else if(keyIsDown(DOWN_ARROW)) {
        boulder.setState("down");
    }

    boulder.update();
    world.update();
    world.show();
    boulder.show();
}