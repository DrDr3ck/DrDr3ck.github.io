class Item {
    constructor(x,y,size) {
        this.position = {x,y};
        this.sizeX = size;
        this.sizeY = size;
        this.factory = null;
        this.belt = null;
        this.color = {r: 235, g: 235, b: 235};
    }
    show = () => {
        fill(this.color.r, this.color.g, this.color.b);
        stroke(66);
        strokeWeight(3);
        ellipse(this.position.x, this.position.y, this.sizeX, this.sizeY);
        strokeWeight(1);
    }
    update = (world) => {
        // item is attached to a factory or a belt ?
        if( this.factory || this.belt ) {
            return;
        }
        // otherwise find a belt or factory
        world.factories.some(factory => {
            if( factory.contains(this.position.x, this.position.y) ) {
                factory.setItem(this);
                return true; // break
            }
            return false;
        });
        if( this.factory ) {
            return;
        }
        const belt = findBelt(this);
        if( belt ) {
            belt.setItem(this);
        }
        // what should we do with item without factory/belt ?
    }
}