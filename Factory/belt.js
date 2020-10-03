const findBelt = (item) => {
    for( const belt of world.belts ) {
        if( belt.contains(item.position.x, item.position.y)) {
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
        this.currentItem = null;
    }
    show = () => {
        if(!this.visible) {
            return;
        }
        fill(200);
        stroke(105);
        rect(this.position.x, this.position.y, this.size, this.size);
        let x = this.position.x;
        let y = this.position.y;
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
        const step = this.speed/frame;
        this.step = (this.step+step)%this.size;
        if( this.currentItem ) {
            // move item on the belt at same speed that the belt
            if( this.direction === "Down" ) {
                this.currentItem.position.y += step;
            } else if( this.direction === "Up" ) {
                this.currentItem.position.y -= step;
            } else if( this.direction === "Right" ) {
                this.currentItem.position.x += step;
            } else if( this.direction === "Left" ) {
                this.currentItem.position.x -= step;
            }
            if( !this.contains(this.currentItem.position.x, this.currentItem.position.y) ) {
                this.currentItem.belt = null;
                this.currentItem = null;
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
    setItem = (item) => {
        this.currentItem = item;
        item.belt = this;
    }
}