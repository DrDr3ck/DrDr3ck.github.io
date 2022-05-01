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

let xBoard = 87;
let yBoard = 65;
let sizeBoard = 58.8; 

const board = [];
for( let i = 0; i< 11; i++) {
    board.push("...........".split(''));
}
board[3][8] = 0;
console.log(board);

function nextClicked() {
	
}

let curCaseCursor = 0;

const nextButton = new BButton(window_width - 80 - 400*scale, window_height - 100, "NEXT", nextClicked);
nextButton.setTextSize(45*scale);
nextButton.w = 400*scale;

function preload() {
	spritesheet.addSpriteSheet('board', './board.png', 700, 697);
    spritesheet.addSpriteSheet('cases', './cases.png', 58, 58);
}

function setup() {
	canvas = createCanvas(window_width, window_height);
	canvas.parent("canvas");

	frameRate(60);

	uiManager.addLogger("Cartographer board");
	uiManager.addLogger(`Screen size: ${window.screen.width.toString()}x${window.screen.height.toString()}`);
	lastTime = Date.now();

    const forestButton =new BImageButton(830, 60, spritesheet.getImage('cases', 0), ()=>{
        curCaseCursor = 0;
    });
    const cityButton =new BImageButton(830, 60+sizeBoard+5, spritesheet.getImage('cases', 1), ()=>{
        curCaseCursor = 1;
    });
    const fieldButton =new BImageButton(830, 60+(sizeBoard+5)*2, spritesheet.getImage('cases', 2), ()=>{
        curCaseCursor = 2;
    });
    const waterButton =new BImageButton(830, 60+(sizeBoard+5)*3, spritesheet.getImage('cases', 3), ()=>{
        curCaseCursor = 3;
    });
    const monsterButton =new BImageButton(830, 60+(sizeBoard+5)*4, spritesheet.getImage('cases', 4), ()=>{
        curCaseCursor = 4;
    });
    uiManager.setUI([forestButton, cityButton, fieldButton, waterButton, monsterButton, nextButton]);
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
                spritesheet.drawScaledSprite('cases', board[i][j], xBoard+sizeBoard*i, yBoard+sizeBoard*j, scale);
            }
            stroke(0);
            noFill();
            rect(xBoard+sizeBoard*i, yBoard+sizeBoard*j, sizeBoard, sizeBoard);
        }
    }

    const overCase = mouseOverCase();
    if( overCase !== null ) {
        textAlign(CENTER, CENTER);
        textSize(25);
        fill(25);
        text(overCase.X+1, 330,770);	
        text(letters[overCase.Y], 300,770);	

        spritesheet.drawScaledSprite('cases', curCaseCursor, xBoard+sizeBoard*overCase.X, yBoard+sizeBoard*overCase.Y, scale);
        if( !isEmptyCase(overCase)) {
            stroke(250,50,50);
            strokeWeight(4);
            noFill();
            rect(xBoard+sizeBoard*overCase.X, yBoard+sizeBoard*overCase.Y, sizeBoard, sizeBoard);
            strokeWeight(1);
        }
    }
}

function isEmptyCase(position) {
    const curCase = board[position.X][position.Y]
    return curCase === '.';
}

function isCurrentCase(position) {
    const curCase = board[position.X][position.Y]
    return curCase === curCaseCursor;
}

function addCurrentCase() {
    const overCase = mouseOverCase();
    if( overCase ) {
        if( isEmptyCase(overCase) ) {
            board[overCase.X][overCase.Y] = curCaseCursor;
        } else if( isCurrentCase(overCase) ) {
            board[overCase.X][overCase.Y] = '.';
        }
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
	}
}

