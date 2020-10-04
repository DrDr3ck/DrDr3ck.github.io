class Factory {
    constructor(x,y,direction,size,speed = 30) {
        this.position = {x,y};
        this.size = size;
        this.direction = direction;
        this.curFrame = 0; // from 0 to 30ticks*60sec = 1800 ticks
        this.speed = speed; // 30px/sec by default
        this.processProgress = 0;
        this.progress = 25;
        this.currentItem = null;
    }
    doUpdate = function() {
        if( this.curFrame > 0 ) {
            this.curFrame--;
        }
        if( this.curFrame <= 0 ) {
            this.curFrame = 0;
            this.ready();
        }
        if( this.currentItem && this.processProgress === 0 ) {
            // move item at the middle
            const step = this.speed/globalFrame;
            const dx = this.currentItem.position.x - (this.position.x+this.size/2);
            const dy = this.currentItem.position.y - (this.position.y+this.size/2);
            if( dy < 0 ) {
                this.currentItem.position.y += step;
            } else if( dy > 0 ) {
                this.currentItem.position.y -= step;
            } else if( dx < 0 ) {
                this.currentItem.position.x += step;
            } else if( dx > 0 ) {
                this.currentItem.position.x -= step;
            }
            if( Math.abs(dx) < step && Math.abs(dy) < step ) {
                this.currentItem.position.x = this.position.x+this.size/2;
                this.currentItem.position.y = this.position.y+this.size/2;
                this.processProgress = 1;
            }
        }
    }
    contains = (x,y) => {
        if( x < this.position.x ) {return false;}
        if( x > this.position.x+this.size ) {return false;}
        if( y < this.position.y ) {return false;}
        if( y > this.position.y+this.size ) {return false;}
        return true;
    }
    clicked = () => {
        if( this.processProgress > 0 ) {
            this.processItem();
            if( this.processProgress >= 100) {
                this.endProcessItem();
            }
        }
    }
    hasItem = () => {
        return this.currentItem !== null;        
    }
    setItem = (item) => {
        this.currentItem = item;
        item.factory = this;
    }
    processItem() {
        this.processProgress += this.progress;
    }
    endProcessItem() {
        this.processProgress = 0;
        // find belt under the factory
        const belt = findBelt(this.currentItem.position, true/*alsoHidden*/);
        if( belt.canAddItem(this.currentItem) ) {
            this.currentItem.factory = null;
            belt.addItem(this.currentItem);
            this.currentItem = null;
        }
    }
    ready() {
        // does nothing
    }
    static findFactory(world, position) {
        for( const factory of world.factories ) {
            if( !factory.hasItem() && factory.contains(position.x, position.y) ) {
                return factory; // break
            }
        }
        return null;
    }
}

// Create one item per minute
class Creator extends Factory {
    constructor(x,y,direction) {
        super(x,y,direction,100);
    }
    show = () => {
        fill(222,91,89);
        if( this.processProgress > 0 ) {
            if( frameCount % 15 !== 0 ) {
                stroke(255,250,205);
                strokeWeight(3);
            } else {
                stroke(255*0.8,250*0.8,205*0.8);
                strokeWeight(2);
            }
        } else {
            strokeWeight(1);
            stroke(66);
        }
        rect(this.position.x, this.position.y, this.size, this.size,20,20,0,0);
    }
    update = function() {
        // create an item if possible
        if( !this.hasItem() && this.currentItem === null && this.curFrame === 0) {
            const item = new Item(this.position.x+this.size/2,this.position.y+this.size/2,40);
            world.items.push(item);
            this.setItem(item);
            this.processProgress = 95;
        }
        this.doUpdate();
    }
    endProcessItem() {
        const secondsBeforeNextCreation = 2; // to change to 30 !
        this.curFrame = globalFrame*secondsBeforeNextCreation;
        super.endProcessItem();
    }
}

class Hammer extends Factory {
    constructor(x,y,direction) {
        super(x,y,direction,100);
    }
    show = () => {
        fill(156);
        strokeWeight(1);
        if( this.processProgress > 0 ) {
            stroke(255,250,205);
            strokeWeight(3);
        } else {
            stroke(105);
        }
        const x = this.position.x;
        const y = this.position.y;
        const half = this.size/2;
        rect(x, y, this.size, this.size);
        // hammer icon
        push();
        fill(5);
        stroke(5);
        translate(x+half,y+half);
        rotate(-PI / 4.0);
        translate(-half,-half);
        rect(5,45,45,10,5,0,0,5);
        rect(55,25,30,50,5);
        rect(90,45,5,10,0,5,5,0);
        pop();
    }
    update = function() {
        this.doUpdate();
    }
    processItem() {
        super.processItem();
        this.currentItem.sizeX += 2.5;
        this.currentItem.sizeY -= 5;
    }
    endProcessItem() {
        this.currentItem.sizeX = 50;
        this.currentItem.sizeY = 20;
        super.endProcessItem();
    }
}

class Painter extends Factory {
    constructor(x,y,direction) {
        super(x,y,direction,100);
    }
    show = () => {
        fill(244,254,254);
        strokeWeight(1);
        if( this.processProgress > 0 ) {
            stroke(255,250,205);
            strokeWeight(3);
        } else {
            stroke(105);
        }
        const x = this.position.x;
        const y = this.position.y;
        const half = this.size/2;
        rect(x, y, this.size, this.size);
        push(); // pinceau
        translate(x+half,y+half);
        rotate(-PI / 4.0);
        translate(-half-10,-half-5);
        fill(5);
        stroke(5);
        strokeWeight(1);
        rect(70,20,20,50,3);
        rect(5,50,15,10);
        strokeWeight(5);
        line(80,75,80,85);
        line(80,85,70,85);
        line(70,85,40,55);
        line(40,55,25,55);
        pop();
    }
    update = function() {
        this.doUpdate();
    }
    processItem() {
        this.currentItem.color = {
            r: Math.min(255,this.currentItem.color.r*0.9),
            g: Math.min(255,this.currentItem.color.g*0.7),
            b: Math.min(255,this.currentItem.color.b*0.7)
        }
        super.processItem();
    }
    endProcessItem() {
        this.currentItem.color = {r: 156, g: 63, b: 63}; 
        super.endProcessItem();
    }
}

class Dryer extends Factory {
    constructor(x,y,direction) {
        super(x,y,direction,100);
    }
    show = () => {
        fill(135, 206, 235);
        strokeWeight(1);
        if( this.processProgress > 0 ) {
            stroke(255,250,205);
            strokeWeight(3);
        } else {
            stroke(105);
        }
        const x = this.position.x;
        const y = this.position.y;
        const half = this.size/2;
        rect(x, y, this.size, this.size, 25,0,25,0);
        push(); // ventilateur
        translate(x+half, y+half);
        fill(5);
        noStroke();
        ellipse(0,0,20,20);
        ellipse(34,11,20,40);
        ellipse(28,0,30,20);
        ellipse(-34,-11,20,40);
        ellipse(-28,0,30,20);
        ellipse(0,-28,20,30);
        ellipse(11,-34,40,20);
        ellipse(0,28,20,30);
        ellipse(-11,34,40,20);
        pop();
    }
    update = function() {
        this.doUpdate();
    }
    processItem() {
        super.processItem();
        this.currentItem.color = {
            r: Math.min(255,this.currentItem.color.r*1.045),
            g: Math.min(255,this.currentItem.color.g*1.045),
            b: Math.min(255,this.currentItem.color.b*1.045)
        }; 
    }
    endProcessItem() {
        this.currentItem.color = {
            r: Math.min(255,this.currentItem.color.r*1.2),
            g: Math.min(255,this.currentItem.color.g*1.2),
            b: Math.min(255,this.currentItem.color.b*1.2)
        }; 
        super.endProcessItem();
    }
}

class Deliver extends Factory {
    constructor(x,y,direction) {
        super(x,y,direction,100,60);
        this.progress = 100;
        this.max = 5;
        this.count = 0;
    }
    show = () => {
        fill(173,135,98);
        strokeWeight(1);
        if( this.processProgress > 0 ) {
            stroke(255,250,205);
            strokeWeight(3);
        } else {
            stroke(142,108,74);
        }
        const x = this.position.x;
        const y = this.position.y;
        const half = this.size/2;
        rect(x, y, this.size, this.size, 16);
        fill(220);
        textSize(32);
        const str = `${this.count}/${this.max}`;
        text(str, x+half, y+this.size-5);
    }
    update = function() {
        this.doUpdate();
    }
    endProcessItem() {
        this.currentItem.sizeX = 0;
        this.currentItem.sizeY = 0;
        this.count++;
        world.data.itemsCount++;
        if( this.count === this.max ) {
            // move box
            // pay me !!!! TODO
            // get a new box
            this.count = 0;
            world.data.money += 50;
        }
        super.endProcessItem();
    }
}