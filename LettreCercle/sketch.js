let font = null;
const circles = [];
const initialRadius = 2;
let canvas = null;
let graphic = null;
const spots = [];

function preload() {
  font = loadFont("./LEMONMILK-Regular.otf");
}

function setup() {   
  canvas = createCanvas(1000, 400);

  // create the image from text
  // and get the 'white' pixels
  background(0);
  textSize(350);
  fill(255);
  noStroke();
  textStyle(BOLD);
  text("2020",100,300);
  loadPixels();
  clear();
  let size = 0;
  for( let y=0; y < height; y++ ) {
    for( let x=0; x < width; x++ ) {
      const index = x + y*width;
      const b = pixels[index*4]; // trick 4 indices per pixel (R G B A)
      if( b > 250) {
        spots.push(createVector(x,y));
      }
    }
  }
  console.log("Starting with "+spots.length + " spots");

  document.body.style.backgroundColor = "rgb(51,51,51)";
} 

function addNewCircle() {
  const spotIndex = Math.floor(random(spots.length-circles.length));
  const x = spots[spotIndex].x;
  const y = spots[spotIndex].y;
  let valid = true;
  circles.forEach(c=>{
    const d = dist(x,y,c.location.x,c.location.y);
    if( d < c.r + initialRadius ) {
      valid = false;
    }
  });
  // Performance enhancement: swap spotIndex with last valid element and decrease size of spots.length
  // swap spotIndex with spots.length-circles.length
  spots[spotIndex].x = spots[spots.length-circles.length-1].x;
  spots[spotIndex].y = spots[spots.length-circles.length-1].y;
  if( valid ) {
    return new Circle(x, y, initialRadius);
  } else {
    return null;
  }
}

function draw() { 
  background(51);

  const total = 10;
  let count = 0;
  let attempts = 0;

  while( count < total ) {
    const c = addNewCircle();
    if( c !== null ) {
      circles.push(c);
      count++;
    }
    attempts++;
    if( attempts > 1000 ) {
      noLoop();
      console.log("Rendered with "+circles.length+ " circles");
      break;
    }
  }

  for( const circle of circles ) {
    if( circle.growing ) {
      if( circle.edges() ){
        circle.growing = false;
        break;
      } else {
        for( const other of circles ) {
          if( other !== circle ) {
            const d = dist(circle.location.x,circle.location.y,other.location.x,other.location.y);
            if( d < circle.r + other.r + 2) {
              circle.growing = false;
              break;
            }
          }
        }
      }
    }
    circle.grow();
  }

  for( const circle of circles ) {
    circle.show();
  }
}
