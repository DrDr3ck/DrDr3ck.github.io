const snowflakes = [];
const particles = [];
let current;
let stop = false;
let checkBox;

function setup() {
    createCanvas(600,600);

    for( let i=0; i < 200; i++) {
        // snowflakes.push(new SnowFlake());
    }
    current = new Particle(width/2, 0);
    stop = false;
    checkBox = createCheckbox('Animated', false);
    checkBox.changed(reset);
}

function reset() {
    particles.splice(0, particles.length);
    stop = false;
}

function keyPressed() {
    if( keyCode === ESCAPE ) {
        reset();
    }
}

function draw() {
    background(0);

    snowflakes.forEach(snowflake => {
        snowflake.update();
        snowflake.show();
    });

    translate(width/2, height/2);
    rotate(PI/6);

    if( !checkBox.checked() ) {
        while( !stop ) {
            while( !current.finished() && !current.intersects(particles) ) {
                current.update();    
            }

            particles.push(current);
            current = new Particle(width/2-6, 0);
            if( current.finished() || current.intersects(particles) ) {
                stop = true;
            }
        }
    } else {
        while( !current.finished() && !current.intersects(particles) ) {
            current.update();    
        }

        particles.push(current);
        current = new Particle(width/2-6, 0);
    }

    for( let i = 0; i < 6; i++ ) {
        rotate(PI/3);
        current.show();
        particles.forEach(particle => {
            particle.show();
        });
        push();
        scale(1,-1);
        current.show();
        particles.forEach(particle => {
            particle.show();
        });
        pop();
    }

}