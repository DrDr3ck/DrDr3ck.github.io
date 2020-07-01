function Particle(x,y) {
    this.position = createVector(x,y);
    this.r = 3;

    this.update = function() {
        this.position.x -= 1;
        this.position.y += random(-1,1);

        let angle = this.position.heading();
        angle = constrain(angle, 0, PI/6);
        const magnitude = this.position.mag();
        this.position = p5.Vector.fromAngle(angle);
        this.position.setMag(magnitude);

    }

    this.show = function() {
        fill(255);
        stroke(255);
        ellipse(this.position.x, this.position.y, this.r*2, this.r*2);
    }

    this.finished = function() {
        return this.position.x < 1;
    }

    this.intersects = function(particles) {
        for( particle of particles ) {
            let d = dist(particle.position.x, particle.position.y, this.position.x, this.position.y);
            if( d < this.r*2 ) {
                return true;
            }
        }
        return false;
    }
}