function SnowFlake() {
    this.position = createVector(random(width),random(height));
    this.vel = createVector(0,0);
    this.acc = createVector(0,0);
    this.dir = (random(1)>0.5) ? 1 : -1;
    this.r = random(1,8);
    this.angle = random(TWO_PI);
    this.offset = 0;

    this.update = function() {
        this.position.y += this.r*0.25;
        this.offset = sin(this.angle) * this.r;

        if( this.position.y > height + this.r ) {
            this.position.x = random(width);
            this.position.y = random(-100,-10);
        }
    }

    this.show = function() {
        fill(255);
        stroke(255);
        ellipse(this.position.x+this.offset, this.position.y, this.r*2, this.r*2);
    }
}