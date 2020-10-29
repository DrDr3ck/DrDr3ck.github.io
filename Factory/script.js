const saving = document.getElementById("saving");
const upgrade = document.getElementById("upgrade");
const next = document.getElementById("next");
const endGame = document.getElementById("endGame");

// Get the <span> element that closes the modal
var closeUpgrade = document.getElementsByClassName("close")[0];
// When the user clicks on <span> (x), close the modal
closeUpgrade.onclick = function() {
    upgrade.style.display = "none";
}

// Get the <span> element for 'Next Level'
var nextLevel = document.getElementsByClassName("next")[0];

const images = {
    hammer: null
};

const getImages = (imageName) => {
    if( imageName === "hammer")  {
        return images.hammer;
    }
    return null;
}

const globalFrame = 30;

function preload() {
    images.hammer = loadImage('images/hammer.png');
}

let seconds = -1;
let minutes = -1;
let hours = -1;

const world = {
  belts: [],
  factories: [],
  items: [],
  data: null
};

const level1 = {
    number: 1,
    description: {
        belts: [
            {x: 300, y:150, direction: FRIGHT, speed:25},
            {x: 400, y:150, direction: FRIGHT, speed:25}
        ],
        factories: [
            {name: Creator.name, x: 200, y: 150, direction: FRIGHT, size:100, speed: 30},
            {name: Deliver.name, x: 500, y: 150, direction: FRIGHT, size:100, speed: 30}
        ]
    },
    finish: {
        deliver: 5
    }
};

const level2 = {
    number: 2,
    description: {
        belts: [
            {x: 200, y:150, direction: FRIGHT, speed:25},
            {x: 400, y:150, direction: FRIGHT, speed:25}
        ],
        factories: [
            {name: Creator.name, x: 100, y: 150, direction: FRIGHT, size:100, speed: 30},
            {name: Hammer.name, x: 300, y: 150, direction: FRIGHT, size:100, speed: 30},
            {name: Deliver.name, x: 500, y: 150, direction: FRIGHT, size:100, speed: 30}
        ]
    },
    finish: {
        hammer: 10
    }
};

const level3 = {
    number: 3,
    description: {
        belts: [
            {x: 200, y:100, direction: FDOWN, speed:25},
            {x: 300, y:200, direction: FRIGHT, speed:25},
            {x: 400, y:200, direction: FRIGHT, speed:25},
            {x: 500, y:100, direction: FUP, speed:25}
        ],
        factories: [
            {name: Creator.name, x: 200, y: 0, direction: FDOWN, size:100, speed: 30},
            {name: Painter.name, x: 200, y: 200, direction: FRIGHT, size:100, speed: 30},
            {name: Dryer.name, x: 500, y: 200, direction: FUP, size:100, speed: 30},
            {name: Deliver.name, x: 500, y: 0, direction: FRIGHT, size:100, speed: 30}
        ]
    },
    finish: {
        dryer: 15
    }
};

const level5 = {
    number: 5,
    description: {
        belts: [
            {x: 100, y:100, direction: FDOWN, speed:25},
            {x: 200, y:200, direction: FRIGHT, speed:20},
            {x: 300, y:200, direction: FRIGHT, speed:20},
            {x: 400, y:100, direction: FUP, speed:35},
            {x: 500, y:0, direction: FRIGHT, speed:15},
            {x: 600, y:0, direction: FRIGHT, speed:15}
        ],
        factories: [
            {name: Creator.name, x: 100, y: 0, direction: FDOWN, size:100, speed: 30},
            {name: Hammer.name, x: 100, y: 200, direction: FRIGHT, size:100, speed: 30},
            {name: Painter.name, x: 400, y: 200, direction: FUP, size:100, speed: 30},
            {name: Dryer.name, x: 400, y: 0, direction: FRIGHT, size:100, speed: 30},
            {name: Deliver.name, x: 700, y: 0, direction: FRIGHT, size:100, speed: 30}
        ]
    }
}

// When the user clicks on 'Next', close the modal + change level
nextLevel.onclick = function() {
    next.style.display = "none";
    if( world.data.level.number === 1 ) {
        world.data.level = level2;
        world.belts = BeltManager.readBelts(
            level2.description.belts
        );
        world.factories = FactoryManager.readFactories(
            level2.description.factories
        );
        world.items = [];
    } else if( world.data.level.number === 2 ) {
        world.data.level = level3;
        world.belts = BeltManager.readBelts(
            level3.description.belts
        );
        world.factories = FactoryManager.readFactories(
            level3.description.factories
        );
        world.items = [];
    } else if( world.data.level.number === 3 ) {
        // End of the game: no more levels
        endGame.style.display = "block";
    }
    doSaveData();
}

const initialData = {
    itemsCount: 0,
    creatorsCount: 0,
    hammersCount: 0,
    dryersCount: 0,
    paintersCount: 0,
    money: 0,
    level: level1
};

const loadDataFromStorage = () => {
    const storage = localStorage.getItem("FACTORY");
    let data = initialData;
    if( storage ) {
        data = JSON.parse(storage) || initialData;
        for (var k in initialData) {
            if( !data[k] ) {
                data[k] = initialData[k];
            }
        }
    }
    world.data = data;
    world.belts = BeltManager.readBelts(
        data.level.description.belts
    );
    world.factories = FactoryManager.readFactories(
        data.level.description.factories
    );
}

// saving data
const doSaveData = () => {
    const wdata = JSON.stringify(world.data);
    if( wdata && wdata !== "null" ) {
        localStorage.setItem("FACTORY", wdata);
        //console.log("auto save "+JSON.stringify(world.data));
    } else {
        console.error("no data to save...");
    }
}
const saveData = () => {
    doSaveData();
    setTimeout(saveData, 10000); // 60000 for every minute
}

function setup() {   
    canvas = createCanvas(800, 400);
    canvas.parent('canvas');

    frameRate(globalFrame);

    // loading data from storage
    loadDataFromStorage();

    setTimeout(saveData, 10000);
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

    // check next level
    if( next.style.display !== "block" ) {
        if( world.data.level.number === 1 && world.data.itemsCount >= world.data.level.finish.deliver ) {
            next.style.display = "block";
        } else if( world.data.level.number === 2 && world.data.hammersCount >= world.data.level.finish.hammer ) {
            next.style.display = "block";
        } else if( world.data.level.number === 3 && world.data.dryersCount >= world.data.level.finish.dryer ) {
            next.style.display = "block";
        }
    }

    // update and draw
    updateItems(world, f);
    updateWorld(world, f);
    drawWorld(world);
    drawItems(world);
}

function mouseClicked() {
    if( upgrade.style.display === "block") return;
    //console.info("Mouse position: (" + mouseX + ", " + mouseY+")");
    world.factories.forEach(factory => {
        if( factory.contains(mouseX, mouseY)) {
            if( factory.containsHover(mouseX, mouseY)) {
                factory.showUpgrade();
                upgrade.style.display = "block";
            } else {
                factory.clicked();
            }
        }
    });
}

function mouseMoved() {
    if( upgrade.style.display === "block") return;
    world.factories.forEach(factory => {
        factory.setHover(factory.contains(mouseX, mouseY));
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
    
    // display money
    stroke(255,250,205);
    strokeWeight(3);
    textSize(32);
    fill(255, 215, 0);
    const money = world.data.money+"$";
    textAlign(RIGHT, BASELINE);
    text(money, 790, 390);
    noStroke();
}

function drawItems(world) {
    world.items.forEach(item => item.show());
}