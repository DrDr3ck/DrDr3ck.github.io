class Item {
    constructor(x,y,size) {
        this.position = {x,y};
        this.size = size;
    }
    show = () => {
        fill(156);
        stroke(66);
        strokeWeight(3);
        ellipse(this.position.x, this.position.y, this.size, this.size);
        strokeWeight(1);
    }
    update = (world) => {
        // need to check if item is on a belt.
        // depending of the belt direction,
        // the item will ;ove in the same direction.
        this.position.y += 0.2;
    }
}