function SnowFlake() {
    this.position = createVector(random(width),random(-200,height));
    this.vel = createVector(0,0);
    this.acc = createVector(0,0);
    this.dir = (random(1)>0.5) ? 1 : -1;
    const r1 = random(4,16);
    const r2 = random(4,16);
    this.r = min(r1,r2);
    this.angle = random(TWO_PI);
    this.offset = 0;
    this.speed = random(100,200);

    this.applyForce = function(force) {
        let f = force.copy();
        f.mult(this.r);

        this.acc.add(f);
    }

    this.update = function() {
        this.vel.add(this.acc);
        this.vel.limit(this.r*0.2);

        if( this.vel.mag() < 1 ) {
            this.vel.normalize();
        }

        this.position.add(this.vel);
        this.acc.mult(0);

        if( this.position.y > height + this.r ) {
            this.position.x = random(width);
            this.position.y = random(-100,-10);
        }

        this.angle += this.dir*this.vel.mag() / this.speed;

        this.offset = sin(this.angle) * this.r * 2;
    }

    this.show = function() {
        fill(255);
        stroke(255);
        push();
        translate(this.position.x+this.offset, this.position.y);
        rotate(this.angle);
        imageMode(CENTER);
        //ellipse(0, 0, this.r*2, this.r*2);
        //rect(-this.r,-this.r,this.r*2, this.r*2);
        image(img, 0, 0, this.r*2, this.r*2);
        pop();
    }
}