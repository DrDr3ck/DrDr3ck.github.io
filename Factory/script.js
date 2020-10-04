const saving = document.getElementById("saving");

const globalFrame = 30;
let seconds = -1;
let minutes = -1;
let hours = -1;

const world = {
  belts: [],
  factories: [],
  items: [],
  data: null
};

const initialData = {
    itemsCount: 0,
    level: 1,
    money: 0,
    description: {
        belts: [
            {x: 100, y:100, direction: DOWN, speed:25},
            {x: 200, y:200, direction: RIGHT, speed:20},
            {x: 300, y:200, direction: RIGHT, speed:20},
            {x: 400, y:100, direction: UP, speed:35},
            {x: 500, y:0, direction: RIGHT, speed:15},
            {x: 600, y:0, direction: RIGHT, speed:15}
        ],
        factories: [
            {name: Creator.name, x: 100, y: 0, direction: DOWN, size:100, speed: 30},
            {name: Hammer.name, x: 100, y: 200, direction: RIGHT, size:100, speed: 30},
            {name: Painter.name, x: 400, y: 200, direction: UP, size:100, speed: 30},
            {name: Dryer.name, x: 400, y: 0, direction: RIGHT, size:100, speed: 30},
            {name: Deliver.name, x: 700, y: 0, direction: RIGHT, size:100, speed: 30}
        ]
    }
};

const storage = localStorage.getItem("FACTORY");
let data = initialData;
if( storage ) {
    data = JSON.parse(storage);
    for (var k in initialData) {
        if( !data[k] ) {
            data[k] = initialData[k];
        }
    }
}
world.data = data;
world.belts = BeltManager.readBelts(
    data.description.belts
);
world.factories = FactoryManager.readFactories(
    data.description.factories
);

// saving data
const doSaveData = () => {
    localStorage.setItem("FACTORY", JSON.stringify(world.data));
    console.log("auto save "+JSON.stringify(world.data));
}
const saveData = () => {
    doSaveData();
    setTimeout(saveData, 10000); // 60000 for every minute !!
}
saveData();

function setup() {   
    canvas = createCanvas(800, 400);
    canvas.parent('canvas');

    frameRate(globalFrame);
}

function draw() { 
    background(51);

    // process time
    const f = frameCount % globalFrame;
    if( f === 0 ) {
        seconds = (seconds+1)%60;
        if( seconds === 0 ) {
            minutes = (minutes+1)%60;
            if( minutes === 0 ) {
                hours++;
            }
        }
    }

    // update and draw
    updateItems(world, f);
    updateWorld(world, f);
    drawWorld(world);
    drawItems(world);
}

function mouseClicked() {
    console.info("Mouse position: (" + mouseX + ", " + mouseY+")");
    world.factories.forEach(factory => {
        if( factory.contains(mouseX, mouseY)) {
            factory.clicked();
        }
    });
}

function updateItems(world, frameNumber) {
    world.items.forEach(item => item.update(world));
    // delete delivered items
    world.items = world.items.filter(item => item.sizeX > 0);
}

function updateWorld(world, frameNumber) {
    world.belts.forEach(belt => belt.update());
    world.factories.forEach(factory => factory.update());
}

function drawWorld(world) {
    world.belts.forEach(belt => belt.show());
    world.factories.forEach(factory => factory.show());
}

function drawItems(world) {
    world.items.forEach(item => item.show());
}