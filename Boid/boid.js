function Boid() {
    this.position = createVector(random(width), random(height));
    this.velocity = createVector(random(2)-1,random(2)-1);
    this.acc = createVector(0,0);
    this.perception = 50;
    this.maxForce = 1;
    this.maxSpeed = 4;

    this.show = function() {
        strokeWeight(16);
        stroke(255);
        point(this.position.x, this.position.y);
    }

    this.align = function(boids) {
        let average = createVector(0,0);
        let total = 0;
        for( const boid of boids ) {
            if( dist(this.position.x, this.position.y, boid.position.x, boid.position.y) < this.perception && boid !== this ) {
                average.add(boid.velocity);
                total++;
            }
        }
        if( total > 0 ) {
            average.div(total);
            average.setMag(this.maxSpeed);
            average.sub(this.velocity);
            average.limit(this.maxForce);
        }
        return average;
    }

    this.cohesion = function(boids) {
        let average = createVector(0,0);
        let total = 0;
        for( const boid of boids ) {
            if( dist(this.position.x, this.position.y, boid.position.x, boid.position.y) < this.perception && boid !== this ) {
                average.add(boid.position);
                total++;
            }
        }
        if( total > 0 ) {
            average.div(total);
            average.sub(this.position);
            average.setMag(this.maxSpeed);
            average.sub(this.velocity);
            average.limit(this.maxForce);
        }
        return average;
    }

    this.separation = function(boids) {
        let perceptionRadius = 50;
        let steering = createVector();
        let total = 0;
        for (let other of boids) {
          let d = dist(
            this.position.x,
            this.position.y,
            other.position.x,
            other.position.y
          );
          if (other != this && d < perceptionRadius) {
            let diff = p5.Vector.sub(this.position, other.position);
            diff.div(d * d);
            steering.add(diff);
            total++;
          }
        }
        if (total > 0) {
          steering.div(total);
          steering.setMag(this.maxSpeed);
          steering.sub(this.velocity);
          steering.limit(this.maxForce);
        }
        return steering;
      }

    this.flock = function(boids) {
        const alignment = this.align(boids);
        const cohesion = this.cohesion(boids);
        const separation = this.separation(boids);
        this.acc.add(alignment);
        this.acc.add(cohesion);
        this.acc.add(separation);
    }

    this.update = function() {
        this.position.add(this.velocity);
        this.velocity.add(this.acc);
        //this.velocity.limit(this.maxForce);
        this.acc.mult(0);

        if( this.position.x > width ) {
            this.position.x -= width;
        }
        if( this.position.x < 0 ) {
            this.position.x += width;
        }

        if( this.position.y > height ) {
            this.position.y -= height;
        }
        if( this.position.y < 0 ) {
            this.position.y += height;
        }
    }
}