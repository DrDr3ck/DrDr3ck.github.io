const globalFrame = 30;

const findBelt = (position, hidden=false) => {
    for( const belt of world.belts ) {
        if( !hidden && !belt.visible ) {
            continue;
        }
        if( belt.contains(position)) {
            return belt;
        }
    }
    return null;
}

class Belt {
    constructor(x,y,direction,speed,visible=true) {
        this.position = {x,y};
        this.direction = direction;
        this.size = 100;
        this.step = 0;
        this.visible = visible;
        this.speed = speed; // speed px/s
        this.items = [];
    }
    show = () => {
        if(!this.visible) {
            return;
        }
        fill(200);
        stroke(105);
        let x = this.position.x;
        let y = this.position.y;
        rect(x, y, this.size, this.size);
        strokeWeight(2);
        if( this.direction === "Down") {
            [0,20,40,60,80].forEach(ty => {
                const newY = y+(ty+this.step)%100;
                line(x, newY, x+this.size, newY);
            });
        } else if( this.direction === "Right") {
            [0,20,40,60,80].forEach(tx => {
                const newX = x+(tx+this.step)%100;
                line(newX, y, newX, y+this.size);
            });
        } else if( this.direction === "Left") {
            [0,20,40,60,80].forEach(tx => {
                const newX = x+(tx-this.step+100)%100;
                line(newX, y, newX, y+this.size);
            });
        } else if( this.direction === "Up") {
            [0,20,40,60,80].forEach(ty => {
                const newY = y+(ty-this.step+100)%100;
                line(x, newY, x+this.size, newY);
            });
        }
    }
    update = function() {
        // step from 0 to 100px
        // frameCount from 0 to 30 ticks
        // speed = 0.2 => 30px*0.5/sec = 15px/sec
        const step = this.speed/globalFrame;
        this.step = (this.step+step)%this.size;
        const toRemove = [];
        for( const item of this.items ) {
            let dx = 0;
            let dy = 0;
            // move item on the belt at same speed that the belt
            if( this.direction === "Down" ) {
                dy = step;
            } else if( this.direction === "Up" ) {
                dy = -step;
            } else if( this.direction === "Right" ) {
                dx = step;
            } else if( this.direction === "Left" ) {
                dx = -step;
            }
            const newPosition = {x: item.position.x+dx, y: item.position.y+dy};
            // need to check if item will stay on current belt
            if( this.contains(newPosition) ) {
                // check if item collide with another item of the belt
                let collide = false;
                this.items.forEach(i=>{
                    if( i.uid < item.uid && i.collide(item) ) {
                        collide = true;
                        console.log(item.uid+" and "+i.uid+" are colliding." );
                    }
                });
                if( !collide ) {
                    item.position = {x: item.position.x+dx, y: item.position.y+dy};
                }
            } else {
                // check if item can go on next factory / belt
                const factory = Factory.findFactory(world, newPosition);
                if( factory ) {
                    item.belt = null;
                    factory.setItem(item);
                    toRemove.push(item);
                    continue;
                }
                const belt = findBelt(newPosition, false);
                if( belt ) {
                    /*
                    let collide = false;
                    belt.items.forEach(i=>{
                        if( i !== item && i.collide(item) ) {
                            collide = true;
                        }
                    });
                    if( !collide ) {
                        */
                        item.belt = null;
                        belt.addItem(item);
                        toRemove.push(item);
                    //}
                }
            }
        }
        for( const item of toRemove ) {
            const index = this.items.indexOf(item);
            if (index > -1) {
                this.items.splice(index, 1);
            }
        }
    }
    canAddItem = (item) => {
        // check if given item collide with any item of the belt
        for( const curItem of this.items ) {
            if( item.collide(curItem) ) {
                return false;
            }
        }
        return true;
    }
    addItem = (item) => {
        this.items.push(item);
        item.belt = this;
    }
    containsPoint = (x,y) => {
        if( x < this.position.x ) {return false;}
        if( x > this.position.x+this.size ) {return false;}
        if( y < this.position.y ) {return false;}
        if( y > this.position.y+this.size ) {return false;}
        return true;
    }
    contains = (position) => {
        return this.containsPoint(position.x, position.y);
    }
}