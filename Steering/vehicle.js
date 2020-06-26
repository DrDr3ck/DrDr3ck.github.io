function Vehicle(x,y) {
    this.green = color(0,255,0);
    this.red = color(255,0,0);
    this.position = createVector(random(width),random(height));
    this.target = createVector(x,y);
    this.vel = createVector();
    this.acc = createVector();
    this.r = 8;
    this.maxSpeed = 10;
    this.maxForce = 1;

    this.behaviors = function() {
        const arrive = this.arrive(this.target);
        const mouse = createVector(mouseX, mouseY);
        const flee = this.flee(mouse);

        arrive.mult(1);
        flee.mult(5);

        this.applyForce(arrive);
        this.applyForce(flee);
    }

    this.arrive = function(target) {
        const desired = p5.Vector.sub(target, this.position);
        const dist = desired.mag();
        let speed = this.maxSpeed;
        if( dist < 100 ) {
            speed = map(dist, 0, 100, 0, this.maxSpeed);
        }
        desired.setMag(speed);
        const steer = p5.Vector.sub(desired, this.vel);
        steer.limit(this.maxForce);
        return steer;
    }

    this.flee = function(target) {
        const desired = p5.Vector.sub(target, this.position);
        const dist = desired.mag();
        if( dist < 50 ) {
            desired.setMag(this.maxSpeed);
            desired.mult(-1);
            const steer = p5.Vector.sub(desired, this.vel);
            steer.limit(this.maxForce);
            return steer;
        } else {
            return createVector(0,0);
        }
    }

    this.applyForce = function(f) {
        this.acc.add(f);
    }

    this.update = function() {
        this.position.add(this.vel);
        this.vel.add(this.acc);
        this.acc.mult(0);
    }

    this.show = function() {
        const dist = this.position.dist(this.target);
        const vehicleColor = lerpColor(this.green, this.red, Math.min(dist/100,1));
        stroke(vehicleColor);
        strokeWeight(this.r);
        point(this.position.x, this.position.y);
    }
}