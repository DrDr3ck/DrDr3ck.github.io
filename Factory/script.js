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

//world.belts.push(new Belt(100,0,"Down",false));
world.belts.push(new Belt(100,100,"Down"));
world.belts.push(new Belt(200,200,"Right"));
world.belts.push(new Belt(300,200,"Right"));
world.belts.push(new Belt(400,100,"Up"));
world.belts.push(new Belt(500,0,"Right"));
world.belts.push(new Belt(600,0,"Right"));
//world.belts.push(new Belt(700,0,"Right",false));

world.factories.push(new Creator(100,0,"Down"));
world.factories.push(new Hammer(100,200,"Right"));
world.factories.push(new Painter(400,200,"Up"));
world.factories.push(new Dryer(400,0,"Right"));
world.factories.push(new Deliver(700,0,"Right"));

//world.items.push(new Item(150,50,40));

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
    console.log("Saving Data");
}
const saveData = () => {
    doSaveData();
    setTimeout(saveData, 10000);
}
saveData();

function setup() {   
    canvas = createCanvas(800, 400);
    canvas.parent('canvas');

    frameRate(frame);
}

function draw() { 
    background(51);

    const f = frameCount % 30;
    if( f === 0 ) {
        seconds = (seconds+1)%60;
        console.log("new second: "+seconds);
        if( seconds === 0 ) {
            minutes = (minutes+1)%60;
            console.log("new minute: "+minutes);
            if( minutes === 0 ) {
                hours++;
                console.log("new hour: "+hours);
            }
        }
    }

    updateItems(world, f);
    updateWorld(world, f);
    drawWorld(world);
    drawItems(world);
}

function mouseClicked() {
    console.log(mouseX + "  " + mouseY);
}

function updateItems(world, frameNumber) {
    world.items.forEach(item => item.update(world));
}

function updateWorld(world, frameNumber) {
    world.belts.forEach(belt => belt.update(frameNumber));
    world.factories.forEach(factory => factory.update());
    world.items.forEach(item => item.update(world));
}

function drawWorld(world) {
    world.belts.forEach(belt => belt.show());
    world.factories.forEach(factory => factory.show());
    world.items.forEach(item => item.show());
}

function drawItems(world) {
    world.items.forEach(item => item.show());
}