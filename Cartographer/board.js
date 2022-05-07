const window_width = window.screen.availWidth > 1460 ? 1460 : window.screen.availWidth;
const window_height = window.screen.availHeight > 800 ? 800 : window.screen.availHeight;

let scale = window_width < 800 ? .5 : 1;

const uiManager = new UIManager();
uiManager.loggerContainer = new LoggerContainer(
	window_width - 240,
	window_height - 400*scale,
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

let pieces = 0;
const piecesMax = 14;

/* Randomize array in-place using Durstenfeld shuffle algorithm */
function shuffleArray(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
}

const SIMPLE_SQUARE = [["#"]];
const GOLDEN_L = [["G","G"],[" ","G"]];
const BIG_L = [["#","#"],["#","#"],["# "," "]];
const GOLDEN_I = [["G","G"]];
const GOLDEN_BIGI = [["G","G","G"]];
const SIMPLE_PLUS = [[" ","#"," "],["#","#","#"],[" ","#"," "]];
const GOLDEN_DIAG = [["G"," "],[" ","G"]];
const SIMPLE_S = [["#","#"," "],[" ","#","#"]];
const LONG_DIAG = [["#"," "," "],[" ","#"," "],[" "," ","#"]];
const BIG_T = [["#","#","#"],[" ","#"," "],[" ","#"," "]];
const LONG_S = [[" ","#"],[" ","#"],["#","#"],["#"," "]];
const SIMPLE_LINE = [["#"],["#"],["#"],["#"]];
const SIMPLE_T = [["#","#","#"],[" ","#"," "]];
const SIMPLE_L = [["# "," "],["#"," "],["#","#"]];
const LONG_L = [["#","#","#"],["#"," "," "],["#"," "," "]];
const STAIRS = [[" "," ","#"],[" ","#","#"],["#","#"," "]];
const SIMPLE_U = [["#","#","#"],["#"," ","#"]];
const DOUBLE_I = [["#","#"],[" "," "],["#","#"]];

const allShapes = [
    GOLDEN_L, GOLDEN_I, GOLDEN_DIAG, GOLDEN_BIGI, BIG_T, SIMPLE_LINE,
    LONG_S, SIMPLE_T, SIMPLE_L, SIMPLE_SQUARE, LONG_L, BIG_L,
    SIMPLE_PLUS, SIMPLE_S, STAIRS, LONG_DIAG, SIMPLE_U, DOUBLE_I
];

// forestButton, cityButton, fieldButton, waterButton, monsterButton
const forest = "forest";
const city = "city";
const field = "field";
const water = "water";
const monster = "monster";

const explorations = [
    {title: "Hameau", type: [city]},
    {title: "Terres Agricoles", type: [field]},
    {title: "Foret Oubliee", type: [forest]},
    {title: "Grande Riviere", type: [water]},
    {title: "Marecage", type: [forest, water]},
    {title: "Village de Pecheurs", type: [city, water]},
    {title: "Village Perche", type: [city, forest]},
    {title: "Exploitation Agricole", type: [city, field, monster]},
    {title: "Verger", type: [forest, field]},
    {title: "Terres Fracturees", type: [forest, city, field, water, monster]},
    {title: "Ruisseau Preserve", type: [field, water]},
    {title: "Hameau", type: [city]},
    {title: "Terres Agricoles", type: [field]},
    {title: "Foret Oubliee", type: [forest]},
    {title: "Grande Riviere", type: [water]},
    // {title: "Offensive de Kobolds", type: [monster]},
    {title: "Attaque de Gobelins", type: [monster]},
    {title: "Raid de Gnolls", type: [monster]},
    {title: "Assaut de Gobelours", type: [monster]}
];

function enableTypeButtons(index) {
    const types = explorations[index].type;
    curSelectedType = -1;
    [forest,city,field,water,monster].forEach(
        (type, i) => {
            const isEnable = types.includes(type);
            typeButtons[i].visible = isEnable;
            if( isEnable && curSelectedType === -1) {
                curSelectedType = i;
            }
        }
    );
}

function chooseShape(index) {
    curSelectedShape = allShapes[index];
    buttons.forEach(b=>b.enabled=true);

    enableTypeButtons(index);
}

let xBoard = 87;
let yBoard = 65;
let sizeBoard = 58.8; 

let useTemple = false;
let templesPosition = [];

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

        templesPosition = [
            {X:1,Y:2},
            {X:5,Y:1},
            {X:9,Y:2},
            {X:1,Y:8},
            {X:5,Y:9},
            {X:9,Y:8},
        ];
    }
    return b;
}

const board = createBoard("A");

/**
 * Returns true if a monster os next to the given case position
 */
function hasMonster(i,j) {
    if( i > 0 ) {
        if( board[i-1][j].value === MONSTERCASE ) return true;
    }
    if( i < board.length-1 ) {
        if( board[i+1][j].value === MONSTERCASE ) return true;
    }
    if( j > 0 ) {
        if( board[i][j-1].value === MONSTERCASE ) return true;
    }
    if( j < board[i].length-1 ) {
        if( board[i][j+1].value === MONSTERCASE ) return true;
    }
}

let monsters = 0;

function hasDecret(decretName) {
    // TODO
    return false;
}

function nextClicked() {
    // check if a mountain is closed:
    for( let j = 0; j< 11; j++) {
        for( let i = 0; i< 11; i++) {
            // find a mountain
            if( board[i][j].value === "M" ) {
                // check neighborhood
                if( neighborhood(board,i,j) === 4 ) {
                    board[i][j].value = "-M";
                    pieces++;
                }
            }
        }
    }

    // check if a golden shape has been used
    if( curSelectedShape[0].some(s=>s==="G") ) {
        pieces++;
    }

    // count monsters
    monsters = 0;
    for( let j = 0; j< 11; j++) {
        for( let i = 0; i< 11; i++) {
            // find a monster
            if( board[i][j].value === EMPTYCASE ) {
                if( hasMonster(i,j) ) {
                    monsters++;
                }
            }
        }
    }

    // count decrets !!
    if( hasDecret("Frontieres") ) {
        // const result = countFrontieres(board);
    }

    turn++;
    nextButton.enabled = false;
    undoButton.enabled = false;
    curSelectedShape = null;
    buttons.forEach(b=>b.enabled=false);

    useTemple = false;
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

let curSelectedShape = null;

function turnShape() {
    if( !curSelectedShape ) {
        return;
    }
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
    flipShape(false);
}

function flipShape(mayTurn=true) {
    if( !curSelectedShape ) {
        return;
    }
    const shape = curSelectedShape;
    for(let i=0; i < shape.length;i++) {
        const row = shape[i];
        for(let j=0; j < row.length/2;j++) {
            const tmp = row[j];
            row[j] = row[row.length-j-1];
            row[row.length-j-1] = tmp;
        }
    }
    curSelectedShape = shape;
    if( mayTurn ) {
        if( curSelectedShape.length < curSelectedShape[0].length ) {
            turnShape();
            turnShape();
        }
    }
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
    spritesheet.addSpriteSheet('temple', './temple.png', 58, 58);
    spritesheet.addSpriteSheet('icons', './icons.png', 60,60);
    spritesheet.addSpriteSheet('shapes', './shapes.png', 70,40);
    spritesheet.addSpriteSheet('piece', './piece.png', 33,33);
}

const typeButtons = [];
const buttons = [];

function setup() {
	canvas = createCanvas(window_width, window_height);
	canvas.parent("canvas");

	frameRate(60);

	uiManager.addLogger("Cartographer board");
    uiManager.addLogger("Please, select a shape");
	lastTime = Date.now();

    const templeButton = new BImageButton(830, 65-sizeBoard-5, spritesheet.getImage('temple', 0), ()=>{
        useTemple = !useTemple;
    });
    const forestButton =new BImageButton(830, 65, spritesheet.getImage('cases', 0), ()=>{
        curSelectedType = 0;
    });
    const cityButton =new BImageButton(830, 65+sizeBoard+5, spritesheet.getImage('cases', 1), ()=>{
        curSelectedType = 1;
    });
    const fieldButton =new BImageButton(830, 65+(sizeBoard+5)*2, spritesheet.getImage('cases', 2), ()=>{
        curSelectedType = 2;
    });
    const waterButton =new BImageButton(830, 65+(sizeBoard+5)*3, spritesheet.getImage('cases', 3), ()=>{
        curSelectedType = 3;
    });
    const monsterButton =new BImageButton(830, 65+(sizeBoard+5)*4, spritesheet.getImage('cases', 4), ()=>{
        curSelectedType = MONSTERCASE;
    });

    const turnIcon =new BImageButton(780, 420, spritesheet.getImage('icons', 1), ()=>{
        turnShape();
    });
    const flipIcon =new BImageButton(780, 535, spritesheet.getImage('icons', 0), ()=>{
        flipShape();
    });

    typeButtons.push(...[forestButton, cityButton, fieldButton, waterButton, monsterButton]);
    buttons.push(...[forestButton, cityButton, fieldButton, waterButton, monsterButton, turnIcon, flipIcon]);

    const shapeButtons = [];
    let X = 920;
    let Y = 60;
    for( let i=0; i < 18; i++ ) {
        shapeIcon = new BImageButton(X, Y, spritesheet.getImage('shapes', i), ()=>{
            chooseShape(i);
        });
        X += 80;
        if( X >= 1350 ) {
            X=920;
            Y+=50;
        }
        shapeButtons.push(shapeIcon);
    }

    uiManager.setUI([...buttons, templeButton, nextButton, undoButton, ...shapeButtons]);
    nextButton.enabled = false;
    undoButton.enabled = false;
    buttons.forEach(b=>b.enabled = false);
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
                if( board[i][j].value === "-M") {
                    stroke(0);
                    fill(51);
                    ellipse(xBoard+sizeBoard*i+sizeBoard/2,yBoard+sizeBoard*j+sizeBoard/2+12,22);
                }
            }
            stroke(0);
            noFill();
            if( toggleDebug && board[i][j].value === "M" ) {
                fill(0);
            } else if( toggleDebug && templesPosition.findIndex(pos=>pos.X===i && pos.Y===j) >= 0 ) {
                fill(250,150,0);
            }
            rect(xBoard+sizeBoard*i, yBoard+sizeBoard*j, sizeBoard, sizeBoard);
        }
    }

    textSize(25);
    fill(125);
    textAlign(LEFT, CENTER);
    if( curSelectedShape ) {
        text("Shape", 770, 510);
        drawShape(13,6, false);
    } else {
        text("Choose a Shape", 770, 510);
    }

    text(`${monsters.toString()} x`,770,340);

    // draw cursor on board
    const overCase = mouseOverCase();
    if( overCase !== null ) {
        push();
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
        pop();
    }

    drawPieces();

    // selected type button
    stroke(255,228,180);
    noFill();
    strokeWeight(2);
    rect(830, 65+(sizeBoard+5)*curSelectedType, sizeBoard, sizeBoard);

    // temple ?
    if( useTemple ) {
        rect(830, 65-(sizeBoard+5), sizeBoard, sizeBoard);
        highlightTemples();
    }
    strokeWeight(1);
}

function highlightTemples() {
    templesPosition.forEach(pos=>{
        if( board[pos.X][pos.Y].value === EMPTYCASE ) {
            rect(xBoard+sizeBoard*pos.X, yBoard+sizeBoard*pos.Y, sizeBoard, sizeBoard);
        }
    });
}

function drawPieces() {
    const X = 920;
    const Y = 340;
    const sizePiece = 20;
    for( let i = 0; i < piecesMax; i++ ) {
        if( i < pieces ) {
            spritesheet.drawScaledSprite('piece', 0, X+i*sizePiece*2-sizePiece+3, Y-sizePiece+4, scale);
        } else {
            stroke(0);
            fill(151);
            ellipse(X+i*sizePiece*2,Y,sizePiece);
        }
    }
}

let canDraw = true;
let onTemple = false;

function drawShape(X,Y,checkDraw=true) {
    if( !curSelectedShape ) {
        return;
    }
    if( checkDraw ) {
        canDraw = true;
        onTemple = false;
    }
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
            if( checkDraw && !isEmptyCase({X:curX, Y:curY})) {
                stroke(250,50,50);
                strokeWeight(4);
                noFill();
                rect(xBoard+sizeBoard*curX, yBoard+sizeBoard*curY, sizeBoard, sizeBoard);
                strokeWeight(1);
                canDraw = false;
            }
            if( checkDraw && useTemple ) {
                if( templesPosition.findIndex(pos=>pos.X===curX && pos.Y===curY) >= 0 ) {
                    onTemple = true;
                }
            }
        }
    }
}

function addShape() {
    if( !curSelectedShape ) {
        return false;
    }
    const overCase = mouseOverCase();
    if( overCase === null ) {
        return false;
    }
    console.log("usetemple", useTemple);
    console.log("onTemple", onTemple);
    if( useTemple && !onTemple ) {
        uiManager.addLogger("Shape should be on a temple");
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

function shapeAlreadyAdded() {
    // check if a case with current turn has already been added in board
    for( let j = 0; j< 11; j++) {
        for( let i = 0; i< 11; i++) {
            if( board[i][j].turn === turn ) {
                return true;
            }
        }
    }
    return false;
}

function addCurrentCase() {
    if( !curSelectedShape ) {
        return;
    }
    const overCase = mouseOverCase();
    if( overCase === null ) {
        // out of board
        return;
    }
    if( !canDraw ) {
        uiManager.addLogger("Cannot draw this shape here");
        return;
    }
    if( shapeAlreadyAdded() ) {
        uiManager.addLogger("Shape already added for this turn");
        setTimeout(function() {
            uiManager.addLogger("Please click Next or Undo");
        }, 1500);
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
            uiManager.addLogger(`Screen size: ${window.screen.availWidth.toString()}x${window.screen.availHeight.toString()}`);
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
    }
}

