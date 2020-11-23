class ObjectManager {
    constructor() {
        this.items = [];
    }

    addObject(description, count) {
        this.items.push({description, count});
    }

}

class ObjectDescription {
    constructor(name, description) {
        this.name = name;
        this.description = description;
        this.recipe = [];
    }
}

class BObject {
    constructor(x,y, sizeX, sizeY) {
        this.x = x;
        this.y = y;
        this.size = {x: sizeX, y: sizeY};
    }

    draw() {

    }

    update(elapsedTime) {

    }
}