const boids = [];

function setup() {
    createCanvas(800, 600);

    for( let i = 0; i < 100; i++ ) {
        boids.push( new Boid() );
    }
}

function draw() {
    background(51);

    for( const boid of boids ) {
        boid.flock(boids);
        boid.update();
        boid.show();
    }
}