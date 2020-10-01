const saving = document.getElementById("saving");

const storage = localStorage.getItem("FACTORY");
let data = {
    itemsCount: 0,
    level: 1
};
if( storage ) {
    data = JSON.parse(storage);
}

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
}

function mouseClicked() {
    console.log(mouseX + "  " + mouseY);
}