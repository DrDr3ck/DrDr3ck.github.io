const window_width = window.screen.availWidth > 1460 ? 1460 : window.screen.availWidth;
const window_height = window.screen.availHeight > 800 ? 800 : window.screen.availHeight;

let scale = window_width < 800 ? .5 : 1;

const uiManager = new UIManager();
uiManager.loggerContainer = new LoggerContainer(
	window_width - 240,
	window_height - 500*scale,
	240,
	100
);
uiManager.loggerContainer.visible = true;

const toolManager = new ToolManager();
const jobManager = new JobManager();
const spritesheet = new SpriteSheet();

const GAME_START_STATE = 1;
const GAME_PLAY_STATE = 2;
let gameState = GAME_PLAY_STATE;

let toggleDebug = false;

/* Randomize array in-place using Durstenfeld shuffle algorithm */
function shuffleArray(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
}

const EMPTYCASE = ' ';

const SIMPLE_SQUARE = ["#"];
const GOLDEN_L = [["G"," "],["G","G"]];
const BIG_L = [["#","#","#"],["#","#"," "]];
const GOLDEN_I = [["G"],["G"]];
const SIMPLE_PLUS = [[" ","#"," "],["#","#","#"],[" ","#"," "]];
const GOLDEN_DIAG = [["G"," "],[" ","G"]];
const SIMPLE_S = [["# "," "],["#","#"],[" ","#"]];

let xBoard = 87;
let yBoard = 65;
let sizeBoard = 58.8; 

/**
 * Creates a board of type A or B
 * @param type 
 * @returns created board array
 */
function createBoard(type) {
    const b = [];
    for( let j = 0; j< 11; j++) {
        const row = [];
        for( let i = 0; i< 11; i++) {
            row.push({turn: -1, value: EMPTYCASE});
        }    
        b.push(row);
    }
    if( type === "A") {
        b[3][1].value = "M"; // montagne
        b[8][2].value = "M"; // montagne
        b[5][5].value = "M"; // montagne
        b[2][8].value = "M"; // montagne
        b[7][9].value = "M"; // montagne
    }
    return b;
}

const board = createBoard("A");
console.log(board);

function nextClicked() {
    turn++;
    nextButton.enabled = false;
    undoButton.enabled = false;
}

function undoClicked() {
    // remove shape of current turn
    for( let j = 0; j< 11; j++) {
        for( let i = 0; i< 11; i++) {
            if( board[i][j].turn === turn ) {
                board[i][j].turn = -1;
                board[i][j].value = EMPTYCASE;
            }
        }
    }
    nextButton.enabled = false;
    undoButton.enabled = false;
}

let curSelectedShape = SIMPLE_SQUARE;

function turnShape() {
    const newShape = [];
    const newWidth = curSelectedShape[0].length;
    const newHeight = curSelectedShape.length;
    for(let i=0; i < newWidth; i++ ) {
        const row = [];
        for(let j=0; j < newHeight; j++ ) {
            row.push(curSelectedShape[j][i]);
        }
        newShape.push(row);
    }
    curSelectedShape = newShape;
    flipShape();
}

function flipShape() {
    const shape = curSelectedShape;
    for(let i=0; i < shape.length;i++) {
        const row = shape[i];
        for(let j=0; j < row.length/2;j++) {
            console.log(`row[${i}]: switch ${j} with ${row.length-j-1}`);
            const tmp = row[j];
            row[j] = row[row.length-j-1];
            row[row.length-j-1] = tmp;
        }
    }
    curSelectedShape = shape;
}

let turn = 0;

let curSelectedType = 0;

const nextButton = new BButton(window_width - 80 - 400*scale, window_height - 100, "NEXT", nextClicked);
nextButton.setTextSize(45*scale);
nextButton.w = 400*scale;
const undoButton = new BButton(window_width - 80 - 400*scale, window_height - 30, "UNDO", undoClicked);
undoButton.setTextSize(45*scale);
undoButton.w = 400*scale;

function preload() {
	spritesheet.addSpriteSheet('board', './board.png', 700, 697);
    spritesheet.addSpriteSheet('cases', './cases.png', 58, 58);
}

function setup() {
	canvas = createCanvas(window_width, window_height);
	canvas.parent("canvas");

	frameRate(60);

	uiManager.addLogger("Cartographer board");
	lastTime = Date.now();

    const forestButton =new BImageButton(830, 60, spritesheet.getImage('cases', 0), ()=>{
        curSelectedType = 0;
    });
    const cityButton =new BImageButton(830, 60+sizeBoard+5, spritesheet.getImage('cases', 1), ()=>{
        curSelectedType = 1;
    });
    const fieldButton =new BImageButton(830, 60+(sizeBoard+5)*2, spritesheet.getImage('cases', 2), ()=>{
        curSelectedType = 2;
    });
    const waterButton =new BImageButton(830, 60+(sizeBoard+5)*3, spritesheet.getImage('cases', 3), ()=>{
        curSelectedType = 3;
    });
    const monsterButton =new BImageButton(830, 60+(sizeBoard+5)*4, spritesheet.getImage('cases', 4), ()=>{
        curSelectedType = 4;
    });
    uiManager.setUI([forestButton, cityButton, fieldButton, waterButton, monsterButton, nextButton, undoButton]);
    nextButton.enabled = false;
    undoButton.enabled = false;
}

function mouseOverCase() {
    if(
        mouseX > xBoard && mouseX < xBoard+sizeBoard*11 &&
        mouseY > yBoard && mouseY < yBoard+sizeBoard*11
    ) {
        return {X: Math.floor((mouseX-xBoard)/sizeBoard), Y: Math.floor((mouseY-yBoard)/sizeBoard)};
    }
    return null;
}

const letters = "ABCDEFGHIJK".split('');

function drawBoard() {
    const X = 50;
    const Y = 50;
	spritesheet.drawScaledSprite('board', 0, X, Y, scale);

    for( let j = 0; j<11; j++ ) {
        for( let i = 0; i < 11; i++) {
            if( !isEmptyCase({X:i, Y:j}) ) {
                spritesheet.drawScaledSprite('cases', board[i][j].value, xBoard+sizeBoard*i, yBoard+sizeBoard*j, scale);
            }
            stroke(0);
            noFill();
            if( toggleDebug && board[i][j].value === "M" ) {
                fill(0);
            }
            rect(xBoard+sizeBoard*i, yBoard+sizeBoard*j, sizeBoard, sizeBoard);
        }
    }

    const overCase = mouseOverCase();
    if( overCase !== null ) {
        textAlign(CENTER, CENTER);
        textSize(25);
        fill(25);
        if( toggleDebug ) {
            text(overCase.X, 300,770);	
            text(overCase.Y, 330,770);	
        } else {
            text(overCase.X+1, 330,770);	
            text(letters[overCase.Y], 300,770);	
        }

        // TODO: check if shape is OUT of the board
        drawShape(overCase.X, overCase.Y);
    }

    stroke(255,228,180);
    noFill();
    strokeWeight(2);
    rect(830, 60+(sizeBoard+5)*curSelectedType, sizeBoard, sizeBoard);
    strokeWeight(1);
}

let canDraw = true;

function drawShape(X,Y) {
    canDraw = true;
    const shape = curSelectedShape;
    for(let i=0; i < shape.length;i++) {
        const row = shape[i];
        for(let j=0; j < row.length;j++) {
            if( row[j] === " ") {
                continue;
            }
            const curX = X+i;
            const curY = Y+j;
            spritesheet.drawScaledSprite('cases', curSelectedType, xBoard+sizeBoard*curX, yBoard+sizeBoard*curY, scale);
            if( !isEmptyCase({X:curX, Y:curY})) {
                stroke(250,50,50);
                strokeWeight(4);
                noFill();
                rect(xBoard+sizeBoard*curX, yBoard+sizeBoard*curY, sizeBoard, sizeBoard);
                strokeWeight(1);
                canDraw = false;
            }
        }
    }
}

function addShape() {
    const overCase = mouseOverCase();
    if( overCase === null ) {
        return false;
    }
    const shape = curSelectedShape;
    for(let i=0; i < shape.length;i++) {
        const row = shape[i];
        for(let j=0; j < row.length;j++) {
            if( row[j] === " ") {
                continue;
            }
            const curX = overCase.X+i;
            const curY = overCase.Y+j;
            board[curX][curY].value = curSelectedType;
            board[curX][curY].turn = turn;    
        }
    }
    return true;
}

function isEmptyCase(position) {
    if( position.X >= board.length ) {
        return 0;
    }
    const curCase = board[position.X][position.Y];
    if( !curCase ) {
        return false;
    }
    return curCase.value === EMPTYCASE;
}

function isCurrentCase(position) {
    const curCase = board[position.X][position.Y]
    return curCase.value === curSelectedType;
}

function addCurrentCase() {
    const overCase = mouseOverCase();
    if( overCase === null ) {
        // out of board
        return;
    }
    if( !canDraw ) {
        uiManager.addLogger("Cannot draw this shape here");
        return;
    }
    if( addShape() ) {
        nextButton.enabled = true;
        undoButton.enabled = true;
    }
}

function draw() {
	const currentTime = Date.now();
	const elapsedTime = currentTime - lastTime;
	background(51);

	uiManager.processInput();
	uiManager.update(elapsedTime);

	drawBoard();

	if (gameState === GAME_START_STATE) {
		background(51, 51, 51, 200);
	}

	uiManager.draw();

	if (gameState === GAME_PLAY_STATE) {
		if (toolManager.currentTool) {
			toolManager.currentTool.draw();
		}
		jobManager.draw();
	}

	lastTime = currentTime;
}

function mouseClicked() {
	toolManager.mouseClicked();
	uiManager.mouseClicked();

    addCurrentCase();

	return false;
}

function mousePressed() {
	console.log(mouseX, mouseY);
}

function mouseReleased() {
}

function keyPressed() {
	if (key === "D") {
		toggleDebug = !toggleDebug;
        if( toggleDebug ) {
            uiManager.addLogger(`Screen size: ${window.screen.width.toString()}x${window.screen.height.toString()}`);
        }
	}

    if (key === "B") {
        console.log(board);
    }

    if (key === "N") {
        curSelectedShape = SIMPLE_S;
    }

    if( key === "t" ) {
        // tourner la forme de 90 degres
        turnShape();
    }
    if( key === "r" || key === "f" ) {
        // retourner la forme (miroir)
        flipShape();
        if( curSelectedShape.length < curSelectedShape[0].length ) {
            turnShape();
            turnShape();
        }
    }
}

