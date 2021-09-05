const tileSize = 40;
const cols = 10;
const rows = 10;
const board = [];
let button;
let game = "processing";

const outOfRange = function(x, max) {
  return x < 0 || x >= max;
}

function setup() {   
  canvas = createCanvas(tileSize*cols+1, tileSize*rows+1);
  
  reset();

  button = createButton("Restart");
  button.mousePressed(reset);

  textSize(20);
  textAlign(CENTER);

  document.body.style.backgroundColor = "rgb(51,51,51)";
  document.addEventListener('contextmenu', event => event.preventDefault());
} 

function reset() {
  game = "processing";
  board.splice(0, board.length);
  const options = [];
  for( let i=0; i<cols; i++ ) {
    board.push([]);
    for(let j=0; j<rows; j++ ) {
      board[i].push(new Cell(i,j));
      options.push([i,j]);
    }
  }

  for( let i = 0; i < 10; i++ ) {
    const index = Math.round(random(options.length-1));
    const x = options[index][0];
    const y = options[index][1];
    board[x][y].mine = true;
  }
  
  for( let i=0; i<cols; i++ ) {
    for(let j=0; j<rows; j++ ) {
      board[i][j].countNeighbor();
    }
  }
}

function setShownAll() {
  for( let i=0; i<cols; i++ ) {
    for(let j=0; j<rows; j++ ) {
      board[i][j].shown = true;
    }
  }
}

function checkWin() {
  for( let i=0; i<cols; i++ ) {
    for(let j=0; j<rows; j++ ) {
      const cell = board[i][j];
      if( !cell.mine && !cell.shown ) {
        return false;
      }
    }
  }
  return true;
}

function keyPressed() {
  if( key === ' ') {
    const x = Math.floor(mouseX/tileSize);
    const y = Math.floor(mouseY/tileSize);
    if( outOfRange(x,cols) || outOfRange(y,rows) ) {
      return;
    }
    if( !board[x][y].shown ) {
        board[x][y].flag = !board[x][y].flag;
    }
  }
}

function mouseClicked() {
  const x = Math.floor(mouseX/tileSize);
  const y = Math.floor(mouseY/tileSize);
  if( outOfRange(x,cols) || outOfRange(y,rows) ) {
    return;
  }
  if( !board[x][y].mine ) {
    board[x][y].setShown();
    // check if everything is shown !
    if( checkWin() ) {
      setShownAll();
      game = "win";
    }
  } else {
    // you loose!!!
    setShownAll();
    game = "lost";
  }
  return false;
}

function draw() { 
  background(255);
  button.position(windowWidth/2-button.width/2,2);

  for( let i=0; i<cols; i++ ) {
    for(let j=0; j<rows; j++ ) {
      board[i][j].show();
    }
  }

  if( game === "lost" ) {
    textSize(40);
    const len = textWidth("You loose!!!");
    fill(255);
    rect(width/2-len/2-5, height/2-40,len+10,40+10);
    fill(0);
    text("You loose!!!", width/2, height/2);
    textSize(20);
  } else if( game === "win" ) {
    textSize(40);
    const len = textWidth("You Win!!!");
    fill(255);
    rect(width/2-len/2-5, height/2-40,len+10,40+10);
    fill(0);
    text("You Win!!!", width/2, height/2);
    textSize(20);
  }
}
