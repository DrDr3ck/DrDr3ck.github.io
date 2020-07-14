function Boid() {
    this.position = createVector(random(width), random(height));
    this.velocity = createVector(random(2)-1,random(2)-1);
    this.acc = createVector(0,0);
    this.perception = 500;

    this.show = function() {
        strokeWeight(16);
        stroke(255);
        point(this.position.x, this.position.y);
    }

    this.align = function(boids) {
        let average = createVector(0,0);
        let total = 0;
        boids.filter(
            (boidFilter)=>{dist(this.position.x, this.position.y, boidFilter.position.x, boidFilter.position.y) < this.perception && boidFilter !== this}).forEach((boid)=>{
                average.add(boid.velocity);
                total++;
            });
        if( total > 0 ) {
            average.div(total);
            average.sub(this.velocity);
            console.log(average);
        }
        return average;
    }

    this.flock = function(boids) {
        const alignment = this.align(boids);
        this.acc.add(alignment);
    }

    this.update = function() {
        this.position.add(this.velocity);
        this.velocity.add(this.acc);
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