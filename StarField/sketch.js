let stars = [];
let speed;

function setup() {
    createCanvas(800, 800);

    for( let i=0; i < 200; i++ ) {
        stars.push(new Star());
    }
}

function draw() {
    background(0);

    speed = map(mouseX, 0, width, 0, 50);
    speed = max(speed, 0);
    speed = min(speed, 50);
    translate(width/2, height/2);

    for( const star of stars ) {
        star.update();
        star.show();
    }
}