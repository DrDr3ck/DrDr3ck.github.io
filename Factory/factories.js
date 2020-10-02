class Creator {
    constructor(x,y) {
        this.position = {x,y};
        this.size = 100;
    }
    show = () => {
        fill(222,91,89);
        stroke(66);
        rect(this.position.x, this.position.y, this.size, this.size,20,20,0,0);
    }
    update = () => {
    }
}

class Hammer {
    constructor(x,y) {
        this.position = {x,y};
        this.size = 100;
    }
    show = () => {
        fill(156);
        stroke(105);
        rect(this.position.x, this.position.y, this.size, this.size);
    }
    update = () => {
    }
}

class Painter {
    constructor(x,y) {
        this.position = {x,y};
        this.size = 100;
    }
    show = () => {
        fill(244,254,254);
        stroke(105);
        rect(this.position.x, this.position.y, this.size, this.size);
    }
    update = () => {
    }
}

class Deliver {
    constructor(x,y) {
        this.position = {x,y};
        this.size = 100;
    }
    show = () => {
        fill(173,135,98);
        stroke(142,108,74);
        rect(this.position.x, this.position.y, this.size, this.size, 16);
    }
    update = () => {
    }
}