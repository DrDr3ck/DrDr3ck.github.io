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
            if( !factory.hasItem() && factory.contains(this.position.x, this.position.y) ) {
                factory.setItem(this);
                return true; // break
            }
            return false;
        });
        if( this.factory ) {
            return;
        }
        const belt = findBelt(this.position, false/*onlyVisible*/);
        if( belt && belt.canAddItem(this) ) {
            belt.addItem(this);
        }
        if( this.belt ) {
            return;
        }
        // what should we do with item without factory/belt ?
        console.error("*** item cannot be placed");
    }
    getBox = () => {
        return {
            x: this.position.x-this.sizeX/2,
            y: this.position.y-this.sizeY/2,
            width: this.sizeX,
            height: this.sizeY
        };
    }
    collide = (item) => {
        const a = this.getBox();
        const b = item.getBox();
        return !(
            ((a.y + a.height) < (b.y)) ||
            (a.y > (b.y + b.height)) ||
            ((a.x + a.width) < b.x) ||
            (a.x > (b.x + b.width))
        );
    }
}