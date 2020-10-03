class Box {
    constructor(x,y,direction,size) {
        this.position = {x,y};
        this.size = size;
        this.direction = direction;
        this.curFrame = 0; // from 0 to 30ticks*60sec = 1800 ticks
    }
    update = () => {
        this.curFrame++;
    }
}

// Create one item per minute
class Creator extends Box {
    constructor(x,y,direction) {
        super(x,y,direction,100);
    }
    show = () => {
        fill(222,91,89);
        stroke(66);
        rect(this.position.x, this.position.y, this.size, this.size,20,20,0,0);
    }
    update = () => {
        super.update();
    }
}

class Hammer extends Box {
    constructor(x,y,direction) {
        super(x,y,direction,100);
    }
    show = () => {
        fill(156);
        stroke(105);
        rect(this.position.x, this.position.y, this.size, this.size);
    }
    update = () => {
        super.update();
    }
}

class Painter extends Box {
    constructor(x,y,direction) {
        super(x,y,direction,100);
    }
    show = () => {
        fill(244,254,254);
        stroke(105);
        rect(this.position.x, this.position.y, this.size, this.size);
        noStroke();
        fill(200);
        ellipse(this.position.x+40,this.position.y+50, 40, 40);
        ellipse(this.position.x+60,this.position.y+40, 40, 40);
        ellipse(this.position.x+60,this.position.y+60, 40, 40);
        const alpha = 150;
        fill(200,54,54,alpha);        
        ellipse(this.position.x+40,this.position.y+50, 40, 40);
        fill(54,200,54,alpha);        
        ellipse(this.position.x+60,this.position.y+40, 40, 40);
        fill(54,54,200,alpha);        
        ellipse(this.position.x+60,this.position.y+60, 40, 40);
    }
    update = () => {
        super.update();
    }
}

class Dryer extends Box {
    constructor(x,y,direction) {
        super(x,y,direction,100);
    }
    show = () => {
        fill(135, 206, 235);
        stroke(142,108,74);
        rect(this.position.x, this.position.y, this.size, this.size, 25,0,25,0);
    }
    update = () => {
        super.update();
    }
}

class Deliver extends Box {
    constructor(x,y,direction) {
        super(x,y,direction,100);
    }
    show = () => {
        fill(173,135,98);
        stroke(142,108,74);
        rect(this.position.x, this.position.y, this.size, this.size, 16);
    }
    update = () => {
        super.update();
    }
}