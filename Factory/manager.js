class FactoryManager {
    static createFactory(type, position, direction) {
        let factory = null;
        if( type === Creator.name ) {
            factory = new Creator(position.x,position.y,direction);
        } else if( type === Hammer.name ) {
            factory = new Hammer(position.x,position.y,direction);
        } else if( type === Painter.name ) {
            factory = new Painter(position.x,position.y,direction);
        } else if( type === Dryer.name ) {
            factory = new Dryer(position.x,position.y,direction);
        } else if( type === Deliver.name ) {
            factory = new Deliver(position.x,position.y,direction);
        }
        return factory;
    }
    static readFactories(factoriesDescription) {
        const factories = [];
        factoriesDescription.forEach(description => {
            try {
            const factory = this.createFactory(description.name, {x: description.x, y: description.y}, description.direction);
            factory.size = description.size;
            factory.speed = description.speed;
            factories.push(factory);
            } catch(error) {
                console.error("Cannot create factory "+description.name+": "+error);
            }
        });
        return factories;
    }
}

class BeltManager {
    static readBelts(beltsDescription) {
        const belts = [];
        beltsDescription.forEach(description => {
            const belt = new Belt(
                description.x, description.y,
                description.direction,
                description.speed, description.visible
            );
            belts.push(belt);
        });
        return belts;
    }
}

class ItemManager {
    static createItem() {
        return new Item(0,0);
    }
}