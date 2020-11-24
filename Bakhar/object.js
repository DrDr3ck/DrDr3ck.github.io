class ObjectManager {
    constructor() {
        this.items = {};
    }

    addObject(description, count) {
        this.items[description.name] = {description, count};
    }

    getObject(name) {
        return this.items[name];
    }

}

class ObjectDescription {
    constructor(name, description) {
        this.name = name;
        this.description = description;
        this.recipe = [];
    }

    addRecipeItem(name, count) {
        this.recipe.push({name, count});
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