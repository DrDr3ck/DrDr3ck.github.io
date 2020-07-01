const snowflakes = [];

function setup() {
    createCanvas(600,600);

    for( let i=0; i < 300; i++) {
        snowflakes.push(new SnowFlake());
    }

    frameRate(30);
}

function draw() {
    background(0);

    snowflakes.forEach(snowflake => {
        snowflake.update();
        snowflake.show();
    });
}