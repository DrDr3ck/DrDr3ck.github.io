let font = null;
let vehicles = [];

function preload() {
  font = loadFont("./LEMONMILK-Regular.otf");
}

function setup() {   
  createCanvas(1000, 400);

  const points = font.textToPoints("Steering",25,250,192);
  stroke(255);
  strokeWeight(6);
  points.forEach(pt => {
    vehicles.push(new Vehicle(pt.x, pt.y));
  });
} 

function draw() { 
  background(51);

  vehicles.forEach(vehicle=>{
    vehicle.behaviors();
    vehicle.update();
    vehicle.show();
  });

  textSize(22);
  fill(255);
  noStroke();
  textStyle(BOLD);
  text("Move mouse over the dots",25,350);
}
