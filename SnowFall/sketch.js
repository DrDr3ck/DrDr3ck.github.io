const snowflakes = [];
let gravity;
let img = null;
let total = 0;

function preload() {
    img = loadImage("snowflake.png");
}

function setup() {
    createCanvas(600,600);

    for( let i=0; i < 300; i++) {
        snowflakes.push(new SnowFlake());
        if( snowflakes[i].r > 8 ) {
            total++;
        }
    }

    img.loadPixels();
    for( let i=0; i < img.width; i++ ) {
        for( let j=0; j < img.height; j++ ) {
            const index = i + j * img.width;
            if( img.pixels[index*4] === 0 ) {
                img.pixels[index*4+3] = 0;
            }
        }
    }
    img.updatePixels();

    gravity = createVector(0,0.03);
}

function draw() {
    background(0);

    snowflakes.forEach(snowflake => {
        snowflake.applyForce(gravity);
        snowflake.update();
        snowflake.show();
    });
}