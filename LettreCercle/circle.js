function Circle(x,y,r) {
    this.location = createVector(x,y);
    this.r = r;
    this.growing = true;
    this.color = 255;

    this.show = function() {
        stroke(this.color);
        strokeWeight(2);
        noFill();
        const diameter = this.r*2;
        ellipse(this.location.x, this.location.y, diameter, diameter);
    }

    this.grow = function() {
        if( this.growing ) {
            this.r += 0.5;
        }
    }

    this.edges = function() {
        return (
            this.location.x+this.r > width || this.location.x - this.r < 0 ||
            this.location.y+this.r > height || this.location.y - this.r < 0
        );
    }
}