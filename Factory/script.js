const saving = document.getElementById("saving");

const frame = 30;
let seconds = -1;
let minutes = -1;
let hours = -1;

const world = {
  belts: [],
  factories: [],
  items: []
};

world.belts.push(new Belt(100,100,"Down",25));
world.belts.push(new Belt(200,200,"Right",12));
world.belts.push(new Belt(300,200,"Right",18));
world.belts.push(new Belt(400,100,"Up",35));
world.belts.push(new Belt(500,0,"Right",15));
world.belts.push(new Belt(600,0,"Right",15));

world.factories.push(new Creator(100,0,"Down"));
world.belts.push(new Belt(100,0,"Down",30,false));
world.factories.push(new Hammer(100,200,"Right"));
world.belts.push(new Belt(100,200,"Right", 30, false));
world.factories.push(new Painter(400,200,"Up"));
world.belts.push(new Belt(400,200,"Up", 30, false));
world.factories.push(new Dryer(400,0,"Right"));
world.belts.push(new Belt(400,0,"Right", 30, false));
world.factories.push(new Deliver(700,0,"Right"));
world.belts.push(new Belt(700,0,"Right", 30, false));

//const firstItem = new Item(150,101,40);
//world.items.push(firstItem);

const storage = localStorage.getItem("FACTORY");
let data = {
    itemsCount: 0,
    level: 1
};
if( storage ) {
    data = JSON.parse(storage);
}

// saving data
const doSaveData = () => {
    localStorage.setItem("FACTORY", JSON.stringify(data));
}
const saveData = () => {
    doSaveData();
    setTimeout(saveData, 60000);
}
saveData();

function setup() {   
    canvas = createCanvas(800, 400);
    canvas.parent('canvas');

    frameRate(frame);
}

function draw() { 
    background(51);

    // process time
    const f = frameCount % 30;
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
    console.log("Mouse position: (" + mouseX + ", " + mouseY+")");
    world.factories.forEach(factory => {
        if( factory.contains(mouseX, mouseY)) {
            factory.clicked();
        }
    });
    world.belts.forEach(belt => {
        if( belt.contains(mouseX, mouseY)) {
            // console.log("Belt to the "+belt.direction);
        }
    });
}

function updateItems(world, frameNumber) {
    world.items.forEach(item => item.update(world));
    // when should we delete items ?
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