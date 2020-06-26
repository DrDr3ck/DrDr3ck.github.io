const cols = 600;
const rows = 400;
let frequency = 0.7;
let prev = [];
let next = [];
let slider;

function setup() {
    createCanvas(cols, rows);
    for(let i=0;i<cols;i++) {
        next[i] = [];
        prev[i] = [];
        for(let j=0;j<rows;j++) {
            next[i][j] = 0;
            prev[i][j] = 0;
        }
    }
    //prev[100][100] = 15;
    //next[100][100] = 255;
    slider = createSlider(0.01, 1, 0.03, 0.01);
    slider.position(20,100);
    //slider.setValue(0.7);
}

function draw() {
    background(0);

    const frequency = slider.value();
    const count = Math.max(1,map(frequency, 0.7, 1, 1, 10));
    if( random() < frequency ) {
        for( let i=0; i < count; i++ ) {
            let x = Math.floor(random(cols));
            x = Math.max(1,x);
            x = Math.min(cols-2,x);
            let y = Math.floor(random(rows));
            y = Math.max(1,y);
            y = Math.min(rows-2,y);
            prev[x][y] = random()*255;
        }
    }
    
    const dampening = map(frequency, 0, 1, 0.95, 0.85);
    loadPixels();
    for(let i=1;i<cols-1;i++) {
        for(let j=1;j<rows-1;j++) {
            next[i][j] = (
                prev[i-1][j] +
                prev[i+1][j] +
                prev[i][j-1] +
                prev[i][j+1]) / 2. - next[i][j];
            next[i][j] *= dampening;
            const index = i + j * cols;
            pixels[index*4] = next[i][j]*128;      
            pixels[index*4+1] = next[i][j]*128;
            pixels[index*4+2] = next[i][j]*255;
            pixels[index*4+3] = 128;    
        }
    }
    updatePixels();

    let temp = prev;
    prev = next;
    next = temp;
}