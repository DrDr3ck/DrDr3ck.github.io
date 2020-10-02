const saving = document.getElementById("saving");

const world = {
  belts: [],
  factories: [],
  items: []
};

world.belts.push(new Belt(100,0,"Down",false));
world.belts.push(new Belt(100,100,"Down"));
world.belts.push(new Belt(200,200,"Right"));
world.belts.push(new Belt(300,200,"Right"));
world.belts.push(new Belt(500,200,"Right"));
world.belts.push(new Belt(600,200,"Right"));
world.belts.push(new Belt(700,200,"Right",false));

world.factories.push(new Creator(100,0));
world.factories.push(new Hammer(100,200));
world.factories.push(new Painter(400,200));
world.factories.push(new Deliver(700,200));

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
}

function draw() { 
    background(51);

    updateWorld(world);
    drawWorld(world);
}

function mouseClicked() {
    console.log(mouseX + "  " + mouseY);
}

function updateWorld(world) {
    world.belts.forEach(belt => belt.update());
    world.factories.forEach(factory => factory.update());
    world.items.forEach(item => item.update(world));
}

function drawWorld(world) {
    world.belts.forEach(belt => belt.show());
    world.factories.forEach(factory => factory.show());
    world.items.forEach(item => item.show());
}