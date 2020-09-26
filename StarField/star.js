function Star() {
    this.x = random(-width/2, width/2);
    this.y = random(-height/2, height/2);
    this.z = random(width);
    if( random() > 0.5 ) {
        this.color = [0,0,random()*127+128];
    } else {
        const c = random()*127+128;
        this.color = [c,c,c];
    }
    this.pz = this.z;

    this.show = function() {
        const sx = map(this.x / this.z,0,1,0,width);
        const sy = map(this.y / this.z,0,1,0,height);
        const r = map(this.z, 0, width, 8, 0);
        const px = map(this.x / this.pz,0,1,0,width);
        const py = map(this.y / this.pz,0,1,0,height);
        this.pz = this.z;
        
        stroke(this.color[0],this.color[1],this.color[2]);
        line(px, py, sx, sy);

        noStroke();
        fill(this.color[2]);
        ellipse(sx, sy, r, r);
        
    }

    this.update = function() {
        this.z = this.z - speed;
        if( this.z < 1 ) {
            this.x = random(-width/2, width/2);
            this.y = random(-height/2, height/2);
            this.z = width;
            this.pz = this.z;
        }
    }
}