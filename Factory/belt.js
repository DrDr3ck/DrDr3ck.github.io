class Belt {
    constructor(x,y,direction,visible=true) {
        this.position = {x,y};
        this.direction = direction;
        this.size = 100;
        this.step = 0;
        this.visible = visible;
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
    update = (frameCount) => {
        // step from 0 to 100px
        // frameCount from 0 to 30 ticks
        // speed = 0.2 => 30px*0.5/sec = 15px/sec
        this.step = (this.step+0.5)%this.size;
    }
}