const cols = 10;
const rows = 20;

const tileSize = 30;

let board;

const shapes = [
    ["0000", "1111", "0000", "0000"],
    ["0000", "0220", "0220", "0000"],
    ["0000", "0030", "0333", "0000"],
    ["0000", "0440", "0044", "0000"],
    ["0000", "0055", "0550", "0000"],
    ["0000", "0600", "0666", "0000"],
    ["0000", "0007", "0777", "0000"],
];

const colors = [[0,240,240],[240,240,0],[160,0,240],[240,0,0],[0,240,0],[0,0,240],[240,160,0]];

let tetrisShape;
let shapePosition;
let shapeIndex;

let frame=0;
let autoMove = 20;

function setup() {
    createCanvas(cols*tileSize+1, rows*tileSize+1);
    resetBoard(true);
    frameRate(20);
    takeRandomShape();
}

function resetBoard(full) {
    if( full ) {
        board = [];
    }
    for(let i=0;i<cols;i++) {
        if( full ) {
            board[i] = [];
        }
        for(let j=0;j<rows;j++) {
            board[i][j] = 0;
        }
    }
}

function shapeCanMove(curShape, dir) {
    let x = shapePosition.x + dir;
    let y = shapePosition.y;
    for( let j=0; j < curShape.length; j++) {
        const row = curShape[j];
        x = shapePosition.x + dir;
        for( let i=0; i < row.length; i++) {
            const cell = row[i];
            if( cell !== "0" ) {
                if( x >= cols || x < 0 || y >= rows || board[x][y] !== 0 ) {
                    return false;
                }
            }
            x++;
        }
        y++;
    }
    return true;
}

function keyPressed() {
    if( keyCode === LEFT_ARROW ) {
        if( shapeCanMove(tetrisShape, -1) ) {
            shapePosition.x--;
        }
    } else if( keyCode === RIGHT_ARROW ) {
        if( shapeCanMove(tetrisShape, +1) ) {            
            shapePosition.x++;
        }
    } else if( keyCode === UP_ARROW ) {
        // rotate
        rotateShape();
    } else if( keyCode === DOWN_ARROW ) {
        if( !checkDown(tetrisShape, shapePosition) ) {
            shapePosition.y++;
        }
    }
}

function rotateShape() {
    let rotatedShape = [];
    for( let i=0; i < 4; i++) {
        rotatedShape.push([]);
        for( let j=0; j < 4; j++) {
            rotatedShape[i][j] = tetrisShape[3-j][i];
        }
    }

    // test if rotatedShape overlaps another shape or bypasses an edge !!
    if( shapeCanMove(rotatedShape, 0) ) {
        tetrisShape = [...rotatedShape];
    }
}

function rowFilled(index, curBoard) {
    for( let j = 0; j < cols; j++ ) {
        if( curBoard[j][index] === 0 ) {
            return false;
        }
    }
    return true;
}

function translateBoard(index, curBoard) {
    for( let i = index; i > 0; i-- ) {
        for( let j = 0; j < cols; j++ ) {
            curBoard[j][i] = curBoard[j][i-1];
        }
    }
    return curBoard;
}

function drawShapeInBoard(shape) {
    let x = shapePosition.x;
    let y = shapePosition.y;
    shape.forEach(row => {
        x = shapePosition.x;
        for( let i=0; i < row.length; i++) {
            const cell = row[i];
            if( cell !== "0" ) {
                board[x][y] = parseInt(cell);
            }
            x++;
        }
        y++;
    });
}

function checkDown(curShape, curPosition) {
    let sx = curPosition.x;
    let sy = curPosition.y+1;
    for( let j=0; j < curShape.length; j++) {
        const row = curShape[j];
        sx = curPosition.x;
        for( let i=0; i < row.length; i++) {
            const cell = row[i];
            if( cell !== "0" ) {
                if( sy >= 0 && sy >= rows || board[sx][sy] !== 0 ) {
                    // set shape at current position
                    drawShapeInBoard(curShape);
                    // take another shape
                    takeRandomShape();
                    frame = -1;
                    return true;
                }
            }
            sx++;
        }
        sy++;
    }
    return false;
}

function takeRandomShape() {
    shapeIndex = Math.round(random()*7-0.5)+1;
    const newTetrisShape = shapes[shapeIndex-1];
    newShapePosition = createVector(cols/2-2, -2);
    if( checkDown(newTetrisShape, newShapePosition) ) {
        // reset game
        resetBoard(false);
    }
    tetrisShape = newTetrisShape;
    shapePosition = newShapePosition;
}

function draw() {
    background(51);
    // update 
    // check if shape is touching the bottom of another shape
    if( frame % autoMove === 0 ) {
        if( !checkDown(tetrisShape, shapePosition) ) {
            shapePosition.y++;
        }
        // need to check if a row is filled !!
        let index = rows-1;
        while( index !== -1 ) {
            if( rowFilled(index, board) ) {
                board = translateBoard(index, board);
                index--;
            } else {
                index--;
            }
        }
    }
    frame++;

    // draw board
    stroke(0);
    for(let i=0;i<cols;i++) {
        for(let j=0;j<rows;j++) {
            const b = board[i][j];
            let offset = 0;
            if( b === 0 ) {
                fill(255);
            } else {
                fill(255);
                rect(i*tileSize+offset, j*tileSize+offset, tileSize-offset*2, tileSize-offset*2);
                const color = colors[b-1];
                fill(color[0],color[1],color[2]);
                offset = 3;
            }
            rect(i*tileSize+offset, j*tileSize+offset, tileSize-offset*2, tileSize-offset*2);
        }
    }
    // draw shape
    let x = shapePosition.x;
    let y = shapePosition.y;
    tetrisShape.forEach(row => {
        x = shapePosition.x;
        for( let i=0; i < row.length; i++) {
            const cell = row[i];
            if( cell !== "0" ) {
                const colorIndex = parseInt(cell);
                const color = colors[colorIndex-1];
                fill(color[0],color[1],color[2]);
                const offset = 3;
                rect(x*tileSize+offset, y*tileSize+offset, tileSize-offset*2, tileSize-offset*2);
            }
            x++;
        }
        y++;
    });
}