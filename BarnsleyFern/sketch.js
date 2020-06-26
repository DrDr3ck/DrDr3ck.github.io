let x = 0;
let y = 0;
let nextX = x;
let nextY = y;
let count = 0;

function setup() {
    createCanvas(600,600);
    background(51);
    stroke(0,150,0);
    strokeWeight(1);
}

function nextPoint() {
    const r = random(1);
    if( r < 0.01 ) {
        nextX = 0;
        nextY = 0.16*y;
    } else if( r < 0.86 ) {
        nextX = 0.85*x+0.04*y;
        nextY = -0.04*x+0.85*y+1.6;
    } else if( r < 0.93 ) {
        nextX = 0.20*x-0.26*y;
        nextY = 0.23*x+0.22*y+1.6;
    } else {
        nextX = -0.15*x+0.28*y;
        nextY = 0.26*x+0.24*y+0.44;
    }

    x = nextX;
    y = nextY;
}

function drawPoint() {
    const px = map(x,-6,6,0,width);
    const py = map(y,0,12,height,0);
    point(px,py);
}

function draw() {
    for( let i = 0; i < 100; i++ ) {
        drawPoint();
        nextPoint();
    }
    count += 100;
    if( count >= 100000) {
        noLoop();
    }
}