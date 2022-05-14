const window_width = 740; //window.screen.availWidth > 1280 ? 1280 : window.screen.availWidth;
const window_height = 360; //window.screen.availHeight > 800 ? 800 : window.screen.availHeight;

const version = 'Version 0.13';

let scale = window_width < 800 ? .5 : 1;

const uiManager = new UIManager();
uiManager.loggerContainer = new LoggerContainer(
	540,
	205,
	300*scale,
	100*scale
);
uiManager.loggerContainer.visible = true;
uiManager.loggerContainer.textSize = 10;

const toolManager = new ToolManager();
const jobManager = new JobManager();
const soundManager = new SoundMgr();
const spritesheet = new SpriteSheet();

const GAME_LOADING_STATE = 0;
const GAME_START_STATE = 1;
const GAME_PLAY_STATE = 2;
let gameState = GAME_LOADING_STATE ;

let titre = null;

let isBoardUp = false;

let toggleDebug = false;

let pieces = 0;
const piecesMax = 14;

let season = Season.Printemps;
let seasonTime = SeasonTime[season];
let curTime = 0;

const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
let seed = urlParams.get('seed');
if( !seed ) {
    seed = getRandomName().replaceAll(' ', '_');
}

let boardIndex = urlParams.get('board') === "verso" ? 1 : 0;

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
    {title: "Hameau", type: [city], time: 1, shape: [GOLDEN_L, BIG_L]},
    {title: "Terres Agricoles", type: [field], time: 1, shape: [GOLDEN_I, SIMPLE_PLUS]},
    {title: "Foret Oubliee", type: [forest], time: 1, shape: [GOLDEN_DIAG, SIMPLE_S]},
    {title: "Grande Riviere", type: [water], time: 1, shape: [GOLDEN_BIGI, STAIRS]},
    {title: "Marecage", type: [forest, water], time: 2, shape: [BIG_T]},
    {title: "Village de Pecheurs", type: [city, water], time: 2, shape: [SIMPLE_LINE]},
    {title: "Village Perche", type: [city, forest], time: 2, shape: [LONG_S]},
    {title: "Exploitation Agricole", type: [city, field], time: 2, shape: [SIMPLE_T]},
    {title: "Verger", type: [forest, field], time: 2, shape: [SIMPLE_L]},
    {title: "Terres Fracturees", type: [forest, city, field, water, monster], time: 0, shape: [SIMPLE_SQUARE]},
    {title: "Ruisseau Preserve", type: [field, water], time: 2, shape: [LONG_L]},
    {title: "Avant-poste en Ruines", type: [], time: 0, shape: []},
    {title: "Offensive de Kobolds", type: [monster], time: 0, shape: [SIMPLE_T]},
    {title: "Attaque de Gobelins", type: [monster], time: 0, shape: [LONG_DIAG]},
    {title: "Raid de Gnolls", type: [monster], time: 0, shape: [SIMPLE_U]},
    {title: "Assaut de Gobelours", type: [monster], time: 0, shape: [DOUBLE_I]}
];

function chooseShape(index) {
    curSelectedShape = allShapes[index];
    isGoldShape = index < 4;
}

let xBoard = 28;//window_width/2-350+87-50;
let yBoard = 17;
let sizeBoard = 58.8*scale; 

const cardHeight = 276;//Card.height;
const cardWidth = 200;//Card.width;

let points = [
    {decret1: 0, decret2: 0, pieces: 0, monsters: 0, total: 0},
    {decret1: 0, decret2: 0, pieces: 0, monsters: 0, total: 0},
    {decret1: 0, decret2: 0, pieces: 0, monsters: 0, total: 0},
    {decret1: 0, decret2: 0, pieces: 0, monsters: 0, total: 0}
];

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
            row.push({turn: -1, value: EMPTYCASE, visited: ""});
        }    
        b.push(row);
    }
    if( type === "A") {
        b[3][1].value = "M"; // montagne
        b[8][2].value = "M"; // montagne
        b[5][5].value = "M"; // montagne
        b[2][8].value = "M"; // montagne
        b[7][9].value = "M"; // montagne

        templesPosition = getTemplePositions(0);
    } else if( type === "B") {
        b[3][2].value = "M"; // montagne
        b[8][1].value = "M"; // montagne
        b[5][7].value = "M"; // montagne
        b[2][9].value = "M"; // montagne
        b[9][8].value = "M"; // montagne

        b[5][3].value = "B"; // bord interieur
        b[4][4].value = "B"; // bord interieur
        b[5][4].value = "B"; // bord interieur
        b[4][5].value = "B"; // bord interieur
        b[5][5].value = "B"; // bord interieur
        b[6][5].value = "B"; // bord interieur
        b[5][6].value = "B"; // bord interieur

        templesPosition = getTemplePositions(1);
    }
    return b;
}

let board = createBoard("A");

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
    if( curSelectedShape && curSelectedShape[0].some(s=>s==="G") ) {
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

    if( curSelectedType !== MONSTERCASE ) {
        curTime = Math.min(seasonTime, curTime+explorations[curSeasonCards[curSeasonCards.length-1]].time)
    }

    turn++;
    nextButton.enabled = false;
    undoButton.enabled = false;
    pointButton.visible = (curTime === seasonTime);
    if( pointButton.visible ) {
        pointsClicked();
    }
    nextCard();
}

function nextCard() {
    if( curTime === seasonTime ) {
        // count points !!
        return;
    }
    useTemple = false;
    let curCard = cards.shift();
	curSeasonCards.push(curCard);
    if( curCard === 11 ) {
        useTemple = true;
        curCard = cards.shift();
	    curSeasonCards.push(curCard);
        if( curCard === 11 ) {
            curCard = cards.shift();
	        curSeasonCards.push(curCard);
        }
    }
    curSelectedShape = null;
    curSelectedType = -1;
    if( isBoardUp ) {
        setupCard(curSeasonCards[curSeasonCards.length-1]);
    }
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
    soundManager.playSound('undo');
}

let curSelectedShape = null;
let isGoldShape = false;

function turnShape(curShape) {
    if( !curShape ) {
        return;
    }
    const newShape = [];
    const newWidth = curShape[0].length;
    const newHeight = curShape.length;
    for(let i=0; i < newWidth; i++ ) {
        const row = [];
        for(let j=0; j < newHeight; j++ ) {
            row.push(curShape[j][i]);
        }
        newShape.push(row);
    }
    curShape = newShape;
    curShape = flipShape(curShape, false);
    return curShape;
}

function flipShape(curShape, mayTurn=true) {
    if( !curShape ) {
        return;
    }
    const shape = curShape;
    for(let i=0; i < shape.length;i++) {
        const row = shape[i];
        for(let j=0; j < row.length/2;j++) {
            const tmp = row[j];
            row[j] = row[row.length-j-1];
            row[row.length-j-1] = tmp;
        }
    }
    curShape = shape;
    if( mayTurn ) {
        if( curShape.length < curShape[0].length ) {
            curShape = turnShape(curShape);
            curShape = turnShape(curShape);
        }
    }
    return curShape;
}

function closeCurrentDialog() {
	uiManager.setDialog(null);
}

class PointsDialog extends Dialog {
	constructor(x, y, w, h) {
		super(x, y, w, h);

        this.components.forEach((c) => (c.visible = true));
        this.confirmButton = new BButton(10,190,"Confirm",()=>{this.confirmed()});
        const plusDialogButton = new BFloatingButton(160, 210, '+', ()=>{
            if( this.decret1Buttons[0].visible || this.decret2Buttons[0].visible ) {
                this.confirmButton.visible = true;
            } else {
                this.confirmed();
            }
        });
        plusDialogButton.setTextSize(32);
        this.components.push(plusDialogButton);

        const decret1Inc1Button = new BFloatingButton(12, 150, '+1', () => {
            this.decret1++;
            this.confirmButton.visible = false;
        });
        decret1Inc1Button.setTextSize(32);
        this.components.push(decret1Inc1Button);
        const decret1Inc5Button = new BFloatingButton(52, 150, '+5', () => {
            this.decret1+=5;
            this.confirmButton.visible = false;
        });
        decret1Inc5Button.setTextSize(32);
        this.components.push(decret1Inc5Button);
        const decret1Dec1Button = new BFloatingButton(12, 200, '-1', () => {
            this.decret1--;
            this.confirmButton.visible = false;
        });
        decret1Dec1Button.setTextSize(32);
        this.components.push(decret1Dec1Button);
        const decret1Dec5Button = new BFloatingButton(52, 200, '-5', () => {
            this.decret1-=5;
            this.confirmButton.visible = false;
        });
        decret1Dec5Button.setTextSize(32);
        this.components.push(decret1Dec5Button);

        this.decret1Buttons = [decret1Inc1Button,decret1Inc5Button,decret1Dec1Button,decret1Dec5Button];

        const decret2Inc1Button = new BFloatingButton(312-20, 150, '+1', () => {
            this.decret2++;
            this.confirmButton.visible = false;
        });
        decret2Inc1Button.setTextSize(32);
        this.components.push(decret2Inc1Button);
        const decret2Inc5Button = new BFloatingButton(332, 150, '+5', () => {
            this.decret2+=5;
            this.confirmButton.visible = false;
        });
        decret2Inc5Button.setTextSize(32);
        this.components.push(decret2Inc5Button);
        const decret2Dec1Button = new BFloatingButton(312-20, 200, '-1', () => {
            this.decret2--;
            this.confirmButton.visible = false;
        });
        decret2Dec1Button.setTextSize(32);
        this.components.push(decret2Dec1Button);
        const decret2Dec5Button = new BFloatingButton(332, 200, '-5', () => {
            this.decret2-=5;
            this.confirmButton.visible = false;
        });
        decret2Dec5Button.setTextSize(32);
        this.components.push(decret2Dec5Button);

        this.decret2Buttons = [decret2Inc1Button,decret2Inc5Button,decret2Dec1Button,decret2Dec5Button];

        this.decret1 = 0;
        this.decret2 = 0;

        const monsterButton = new BButton(100,150,`${-monsters}`,()=>{});
        monsterButton.setTextSize(30);
        monsterButton.w = 75;
        const pieceButton = new BButton(25,150,pieces.toString(),()=>{});
        pieceButton.setTextSize(30);
        pieceButton.w = 75;
        this.confirmButton.setTextSize(30);
        this.confirmButton.w = 150;
        this.components.push(monsterButton);
        this.components.push(pieceButton);
        this.components.push(this.confirmButton);
        pieceButton.enabled = false;
        monsterButton.enabled = false;

        this.transparency = 60;
    }

    confirmed() {
        const total = this.decret1+this.decret2+pieces-monsters;
        // ajouter les points et changer de saisons
        if( season === Season.Printemps ) {
            points[0] = {decret1: this.decret1, decret2: this.decret2, pieces, monsters, total};
            season = Season.Ete;
        } else if( season === Season.Ete ) {
            points[1] = {decret1: this.decret1, decret2: this.decret2, pieces, monsters, total};
            season = Season.Automne;
        } else if( season === Season.Automne ) {
            points[2] = {decret1: this.decret1, decret2: this.decret2, pieces, monsters, total};
            season = Season.Hiver;
        } else {
            points[3] = {decret1: this.decret1, decret2: this.decret2, pieces, monsters, total};
            season = Season.End;
            uiManager.addLogger("The End");
        }
        seasonTime = SeasonTime[season];
        curTime = 0;
        pointButton.visible = false;
        curSeasonCards = [];
        if( season !== Season.End ) {
            cards = cardMgr.getSeason(season);
            nextCard();
        }
        closeCurrentDialog();
        delete this;
    }

    resetVisit(board) {
        for( let j = 0; j<11; j++ ) {
            for( let i = 0; i < 11; i++) {
                board[i][j].visited = " ";
            }
        }
    }

    setDecret1(board, type, occurrence) {
        const val = countPointsForDecret(board, type, occurrence);
        if( val === -9999 ) {
            return;
        }
        this.decret1 = val;
        // deactivate inc/dec buttons
        this.decret1Buttons.forEach(b=>b.visible = false);
    }

    setDecret2(board, type, occurrence) {
        const val = countPointsForDecret(board, type, occurrence);
        if( val === -9999 ) {
            return;
        }
        this.decret2 = val;
        // deactivate inc/dec buttons
        this.decret2Buttons.forEach(b=>b.visible = false);
    }

    doDraw() {
        super.doDraw();
        if (this.popupAnimation !== 0) {
            return;
        }
        fill(250);
		stroke(0);
		textSize(20);
		textAlign(LEFT, TOP);
		text(season, 50, 15);

        textAlign(CENTER, CENTER);
        textSize(30);
        text(this.decret1.toString(), 60,75);
        text(this.decret2.toString(), 140,75);

        textAlign(RIGHT, CENTER);
        text(this.decret1+this.decret2+pieces-monsters, 110,170);
    }
}

function pointsClicked() {
    const dialog = new PointsDialog(540, 10, 730-540, 200);
    let decret1Index = 0;
    if( season === Season.Ete ) {
        decret1Index = 1;
    } else if( season === Season.Automne ) {
        decret1Index = 2;
    } else if( season === Season.Hiver ) {
        decret1Index = 3;
    }
    const decret2Index = (decret1Index+1)%4;
    uiManager.setDialog(dialog);
    dialog.resetVisit(board);
    dialog.setDecret1(board, decretTypes[decret1Index], occurrences[decret1Index]);
    dialog.setDecret2(board, decretTypes[decret2Index], occurrences[decret2Index]);
    dialog.confirmButton.visible = false;
}

let turn = 0;

let curSelectedType = -1;

function speakerClicked() {
	speakerButton.checked = !speakerButton.checked;
	soundManager.mute(!speakerButton.checked);
}

function toggleFullScreen() {
    var doc = window.document;
    var docEl = doc.documentElement;
  
    var requestFullScreen =
      docEl.requestFullscreen ||
      docEl.mozRequestFullScreen ||
      docEl.webkitRequestFullScreen ||
      docEl.msRequestFullscreen;
    var cancelFullScreen =
      doc.exitFullscreen ||
      doc.mozCancelFullScreen ||
      doc.webkitExitFullscreen ||
      doc.msExitFullscreen;
  
    if (
      !doc.fullscreenElement &&
      !doc.mozFullScreenElement &&
      !doc.webkitFullscreenElement &&
      !doc.msFullscreenElement
    ) {
      requestFullScreen.call(docEl);
      return true;
    } else {
      cancelFullScreen.call(doc);
      return false;
    }
  }

const speakerButton = new BFloatingSwitchButton(window_width - 35 - 10, window_height - 60, '\uD83D\uDD0A', speakerClicked);
const fullScreenButton = new BFloatingSwitchButton(window_width - 35*2 - 10*2 -10,window_height - 60,"F",()=>{
	if(!toggleFullScreen()) {
		fullScreenButton.checked = false;
		resizeCanvas(window_width, window_height);
		uiManager.addLogger(`Canvas size: ${window_width.toString()}x${window_height.toString()}`);
	} else {
		fullScreenButton.checked = true;
		resizeCanvas(window.screen.availWidth, window.screen.availHeight);
		uiManager.addLogger(`Canvas size: ${window.screen.availWidth.toString()}x${window.screen.availHeight.toString()}`);
	}
});
fullScreenButton.checked = document.fullscreenElement;
const startRectoButton = new BButton(20, window_height/2, "RECTO", ()=> startClicked(0));
const startVersoButton = new BButton(20, window_height/2+75, "VERSO", ()=> startClicked(1));
const copySeedButton = new BButton(60, window_height/2 + 60, "Copy", ()=> copySeed(boardIndex));
const copy2SeedButton = new BButton(window_width-40-200, window_height/2 + 60, "Copy", ()=>copySeed(1));
const resetSeedButton = new BButton(window_width - 240, window_height - 40, "Reset", resetSeed);
speakerButton.setTextSize(35);
fullScreenButton.setTextSize(35);
startRectoButton.setTextSize(35);
startRectoButton.w = 200;
startVersoButton.setTextSize(35);
startVersoButton.w = 200;
copySeedButton.setTextSize(35*scale);
copySeedButton.w = 150*scale;
copy2SeedButton.setTextSize(35*scale);
copy2SeedButton.w = 150*scale;
resetSeedButton.setTextSize(35*scale);
resetSeedButton.w = 200*scale;

const nextButton = new BButton(window_width - 120 - 200*scale, window_height - 50, "NEXT", nextClicked);
nextButton.setTextSize(45*scale);
nextButton.w = 200*scale;
const undoButton = new BButton(window_width - 120 - 200*scale, window_height - 10, "UNDO", undoClicked);
undoButton.setTextSize(45*scale);
undoButton.w = 200*scale;

const pointButton = new BFloatingButton(window_width - 200 - 60 - 100*scale, window_height - 10, "+", pointsClicked);
pointButton.setTextSize(35);
pointButton.scale = scale;

let cardMgr = null;
let cards = []; // cards for the current season
let curSeasonCards = [];

const typeButtons = [];
const buttons = [];
const shapeButtons = [];

const decretTypes = ["forest", "zone", "ville", "champs"];
const decretPoints = {
    forest: [17,25,18,22],
    zone: [24,24,24,20],
    ville: [16,21,16,20],
    champs: [22,24,20,27]
};
const occurrences = [];

function setup() {
	canvas = createCanvas(window_width, window_height);
	canvas.parent("canvas");

	frameRate(60);

    spritesheet.addSpriteSheet('board', './resources/boards.png', 700, 697);
    spritesheet.addSpriteSheet('cases', './resources/cases.png', 58, 58);
    spritesheet.addSpriteSheet('decret', './resources/decret.png', cardWidth, cardHeight);
    spritesheet.addSpriteSheet('exploration', './resources/exploration.png', cardWidth, cardHeight);
    spritesheet.addSpriteSheet('icons', './resources/icons.png', 60,60);
    spritesheet.addSpriteSheet('piece', './resources/piece.png', 33,33);
    spritesheet.addSpriteSheet('season', './resources/season.png', cardWidth, cardHeight);
    spritesheet.addSpriteSheet('shapes', './resources/shapes.png', 70,40);

    spritesheet.addSpriteSheet('forest', './resources/decret-forest-100.png', 400, 570);
	spritesheet.addSpriteSheet('zone', './resources/decret-zone-100.png', 400, 570);
	spritesheet.addSpriteSheet('ville', './resources/decret-ville-100.png', 400, 570);
	spritesheet.addSpriteSheet('champs', './resources/decret-champs-100.png', 400, 570);

    soundManager.addSound('turn_shape', './resources/turn_shape.wav', 0.55);
    soundManager.addSound('flip_shape', './resources/flip_shape.wav', 0.55);
    soundManager.addSound('cannot_place', './resources/cannot_place.wav', 0.55);
    soundManager.addSound('undo', './resources/undo.wav', 0.85);
    soundManager.addSound('place_shape', './resources/place_shape.mp3', 0.85);

	lastTime = Date.now();    
}

function setupMyUI() {
    speakerClicked();
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

    const turnButton =new BImageButton(630, 170, spritesheet.getImage('icons', 1), ()=>{
        curSelectedShape = turnShape(curSelectedShape);
        soundManager.playSound('turn_shape');
    });
    turnButton.scale = 0.5;
    const flipButton =new BImageButton(630+40, 170, spritesheet.getImage('icons', 0), ()=>{
        curSelectedShape = flipShape(curSelectedShape);
        soundManager.playSound('flip_shape');
    });
    flipButton.scale = 0.5;

    typeButtons.push(...[forestButton, cityButton, fieldButton, waterButton, monsterButton]);
    buttons.push(...[forestButton, cityButton, fieldButton, waterButton, monsterButton, turnButton, flipButton]);

    let X = 130;
    let Y = 490;
    for( let i=0; i < 18; i++ ) {
        shapeButtons.push(new BImageButton(X, Y, spritesheet.getImage('shapes', i), ()=>{
            chooseShape(i);
        }));
    }

    typeButtons.forEach(b=>b.scale=scale);
    shapeButtons.forEach(b=>b.scale=scale);

    copySeedButton.x = 660;
    copySeedButton.y = 335;
    copy2SeedButton.visible = false;

    uiManager.setUI([...buttons, nextButton, undoButton, pointButton, ...shapeButtons, copySeedButton, speakerButton, fullScreenButton]);
    nextButton.enabled = false;
    undoButton.enabled = false;
    pointButton.visible = false;

    buttons.forEach(b=>b.visible=false);
    shapeButtons.forEach(b=>b.visible=false);

    cardMgr = new CardMgr(seed);    
    if( seed ) {
        uiManager.addLogger(`seed: ${seed}`);
    }

    cardMgr.shuffleArray(decretTypes);
    occurrences.push(...[Math.floor(cardMgr.randomInt(4)), Math.floor(cardMgr.randomInt(4)), Math.floor(cardMgr.randomInt(4)), Math.floor(cardMgr.randomInt(4))]);

    cardMgr.init();
    cards = cardMgr.getSeason(season);
    nextCard();
}

function drawLoading() {
    spritesheet.drawScaledSprite('cartographer', 0, window_width/2 - 553/4, 10, .45);
    fill(51);
    stroke(0);
    rect(width / 4, height / 4 * 3, width / 2, height / 10);
	fill(9, 47, 18);
    const total = spritesheet.totalImagesToLoad;
	const current = spritesheet.totalLoadedImages;
    rect(width / 4, height / 4 * 3, current / total * width / 2, height / 10);

	fill(250);
	noStroke();
	textSize(25);
	textAlign(CENTER, CENTER);
	text('Loading...', width / 2, height / 4 * 3 + 15);
	if (
		spritesheet.totalLoadedImages === spritesheet.totalImagesToLoad
	) {
		gameState = GAME_START_STATE;
        uiManager.setUI([startRectoButton, startVersoButton, resetSeedButton]);
        if( document.location.toString().includes("seed=") ) {
            startClicked(boardIndex);
        }
	}
    textAlign(CENTER, CENTER);
    textSize(6);
    noStroke();
    text(version, window_width-50, 10);
}

function preload() {
	spritesheet.addSpriteSheet('cartographer', './resources/cartographer.png', 553, 759);
}


function startClicked(boardSide) {
    gameState = GAME_PLAY_STATE;
    boardIndex = boardSide;
    uiManager.addLogger("Cartographer solo");
    if( boardSide === 0 ) {
        board = createBoard("A");
    } else {
        board = createBoard("B");
    }
    setupMyUI();
}

let cardButton = [];

function drawType(typeName, i, unique=true) {
    const cardTypes = ["forest", "city", "field", "water", "monster"];
    const typeIndex = cardTypes.indexOf(typeName);
    const typeButton = typeButtons[typeIndex];
    typeButton.visible = true;
    typeButton.enabled = !unique;
    typeButton.x = 710;
    typeButton.y = 20+70*i*scale;
    if( unique || i === 0 ) {
        if( curSelectedType === -1 ) {
            curSelectedType = typeIndex;
        }
    }
}

function drawSingleShape(shape, i, unique=true) {
    const shapeIndex = allShapes.indexOf(shape);
    const shapeButton = shapeButtons[shapeIndex];
    shapeButton.visible = true;
    shapeButton.enabled = !unique;
    shapeButton.x = 1280*scale-10+40*i;
    shapeButton.y = 20;
    if( unique || i === 0 ) {
        if( !curSelectedShape ) {
            chooseShape(shapeIndex);
        }
    }
}

/**
 * \return true if at least one temple is available
 */
function canUseTemple() {
    // check if a temple is still available
    return templesPosition.filter(pos=>
        board[pos.X][pos.Y].value === EMPTYCASE
    ).length > 0;
}

function isATemple(x,y) {
    return templesPosition.findIndex(pos=>pos.X===x && pos.Y===y) >= 0;
}

function canPlaceShape(shape, X, Y, needToBeOnTemple=false) {
    let isOnTemple = false;
    for(let i=0; i < shape.length;i++) {
        const row = shape[i];
        for(let j=0; j < row.length;j++) {
            if( row[j] === " ") {
                continue;
            }

            const curX = X+i;
            const curY = Y+j;
            if( isATemple(curX, curY) ) {
                isOnTemple = true;
            }
            
            if( !isEmptyCase({X:curX, Y:curY})) {
                return false;
            }
        }
    }
    if( needToBeOnTemple ) {
        return isOnTemple;
    }
    return true;
}

function canPlaceOnBoard(shape) {
    for( let j = 0; j<11; j++ ) {
        for( let i = 0; i < 11; i++) {
            if( canPlaceShape(shape, i, j, useTemple) ) {
                return true;
            }
        }
    }
}

function getAllShapes(shape) {
    const shapes = [];
    shapes.push(shape);
    shape = turnShape(shape);
    shapes.push(shape);
    shape = turnShape(shape);
    shapes.push(shape);
    shape = turnShape(shape);
    shapes.push(shape);
    // add an extra turn just to clone the shape
    // as flip does not clone it
    shape = turnShape(shape);
    shape = flipShape(shape);
    shapes.push(shape);
    shape = turnShape(shape);
    shapes.push(shape);
    shape = turnShape(shape);
    shapes.push(shape);
    shape = turnShape(shape);
    shapes.push(shape);
    return shapes;
}

function checkShapeOnBoard(shape) {
    const shapes = getAllShapes(shape);
    if( shapes.some(s=>canPlaceOnBoard(s)) ) {
        return true;
    }
    return false;
}

function canBePlaced(cardIndex) {
    const curCard = explorations[cardIndex];
    const cardShapes = curCard.shape;
    if( checkShapeOnBoard(cardShapes[0]) ) {
        return true;
    }
    if( cardShapes.length > 1 ) {
        if( checkShapeOnBoard(cardShapes[1]) ) {
            return true;
        }
    }
    return false;
}

function setupCard(cardIndex) {
    // can we use a temple ?
    if( useTemple && !canUseTemple() ) {
        // set 'terres fracturees' as selected card
        cardIndex = 9;
        uiManager.addLogger("No available ruins");
        useTemple = false;
    }
    
    if( !canBePlaced(cardIndex) ) {
        // set 'terres fracturees' as selected card
        cardIndex = 9;
        soundManager.playSound('cannot_place');
        uiManager.addLogger("Cannot place this shape");
    }
    
    buttons.forEach(b=>b.visible=true);
    typeButtons.forEach(b=>b.visible=false);
    shapeButtons.forEach(b=>b.visible=false);

    const curCard = explorations[cardIndex];
    uiManager.addLogger(curCard.title);
    const types = curCard.type;
    const shapes = curCard.shape;
    
    types.forEach((t,i)=>drawType(t, i, types.length === 1));
    shapes.forEach((s,i)=>drawSingleShape(s, i, shapes.length === 1));

    if( isMonsterCard(cardIndex) ) {
        // place card
        if( placeMonster(cardIndex) ) {
            uiManager.addLogger("Monster added to board");
        } else {
            soundManager.playSound('cannot_place');
            uiManager.addLogger("Cannot place monster");
        }
        // undo disabled
        undoButton.enabled = false;
        // only next is enabled   
        nextButton.enabled = true;
        curSelectedShape = null;
        curSelectedType = -1;
    }
}

function placeMonster(cardIndex) {
    const top = cardIndex >= 14;
    const left = cardIndex === 14 || cardIndex === 12;
    const monsterWidth = curSelectedShape.length;
    const monsterHeight = curSelectedShape[0].length;
    let X = left ? 0 : 11 - monsterWidth;
    let Y = top ? 0 : 11 - monsterHeight;
    let ring = 0;
    const deltas = [];
    if( cardIndex === 14 ) { // big U
        deltas.push(...[{X:0, Y:1}, {X:1, Y:0}, {X:0, Y:-1}, {X:-1, Y:0}]);
    } else if( cardIndex === 15 ) { // double I
        deltas.push(...[{X:0, Y:1}, {X:-1, Y:0}, {X:0, Y:-1}, {X:1, Y:0}]);
    } else if( cardIndex === 13 ) { // big diagonal
        deltas.push(...[{X:0, Y:-1}, {X:-1, Y:0}, {X:0, Y:1}, {X:1, Y:0}]);
    } else if( cardIndex === 12 ) { // small T
        deltas.push(...[{X:0, Y:-1}, {X:1, Y:0}, {X:0, Y:1}, {X:-1, Y:0}]);
    }
    let deltaSide = 0;
    let startX = X;
    let startY = Y;
    while( !canPlaceShape(curSelectedShape, X, Y, false) ) {
        // move it
        X += deltas[deltaSide].X;
        Y += deltas[deltaSide].Y;
        console.log(Y, monsterHeight, Y+monsterHeight-1);
        if( Y < ring || Y+ring+monsterHeight-1 >= 11 || X < ring || X+ring+monsterWidth-1 >= 11) {
            // need to turn: go back first
            X -= deltas[deltaSide].X;
            Y -= deltas[deltaSide].Y;
            // change delta
            deltaSide = (deltaSide+1)%4;
            // turn
            X += deltas[deltaSide].X;
            Y += deltas[deltaSide].Y;
        }
        if( startX === X && startY === Y ) {
            ring++;
            if( ring === 5 ) {
                return false;
            }
            X = left ? ring : 11 - ring - monsterWidth;
            Y = top ? ring : 11 - ring - monsterHeight;
            startX = X;
            startY = Y;
        }
    }
    addShapeAtPosition(X,Y);
    return true;
}

function isMonsterCard(cardIndex) {
    return cardIndex > 11;
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

function drawDecretCard(X,Y,title,index,selection) {
    const cardDecretWidth = 400;
    const cardDecretHeight = 570;
    const decrets = ["A","B","C","D"];
    scale/=2;
	if( decrets.includes(title) ) {
		spritesheet.drawScaledSprite('decret', index, X, Y, scale*.75);
	} else {
		spritesheet.drawScaledSprite(title, index, X, Y, scale*.75);
	}
    scale*=2;
	if( selection ) {
		stroke(255,228,180);
	} else {
		stroke(10);
	}
	strokeWeight(4*scale);
	noFill();
	rect(X, Y, cardDecretWidth/2*scale*.75, cardDecretHeight/2*scale*.75, 10);
    
}

function isMouseOverDecret(originalX,originalY) {
    if( inMove ) return -1;
    let X = originalX;
    let Y = originalY;
	if( mouseX > X && mouseX < X+cardWidth*scale*.75 && mouseY > Y && mouseY < Y+cardHeight*scale*.75) {
		return 0;
	}
	X += 170*scale;
	if( mouseX > X && mouseX < X+cardWidth*scale*.75 && mouseY > Y && mouseY < Y+cardHeight*scale*.75) {
		return 1;
	}
	X += 170*scale;
	if( mouseX > X && mouseX < X+cardWidth*scale*.75 && mouseY > Y && mouseY < Y+cardHeight*scale*.75) {
		return 2;
	}
	X += 170*scale;
	if( mouseX > X && mouseX < X+cardWidth*scale*.75 && mouseY > Y && mouseY < Y+cardHeight*scale*.75) {
		return 3;
	}
	return -1;
}

function isMouseOverExploration() {
    if( season === Season.End ) {
        return false;
    }
    let X = 400;
	let Y = 20+40*(curSeasonCards.length-1)*scale;
	if( mouseX > X && mouseX < X+cardWidth*scale*.75 && mouseY > Y && mouseY < Y+cardHeight*scale*.75) {
		return true;
	}
    return false;
}

function drawEmptyCard(X,Y) {
	strokeWeight(4);
	rect(X, Y, cardWidth*scale*.75, cardHeight*scale*.75, 20);
	strokeWeight(1);
}

function drawExplorationCard(X,Y, index, drawRuin=false) {
    if( index === 11 && (drawRuin || toggleDebug) ) {
        X-=20;
    }
    if( toggleDebug && index > 11 ) {
        X+=20;
    }
	fill(250,150,10);
	stroke(0);
	drawEmptyCard(X,Y);
	spritesheet.drawScaledSprite('exploration', index, X, Y, scale*.75);
	strokeWeight(4*scale);
	noFill();
	rect(X, Y, cardWidth*scale*.75, cardHeight*scale*.75, 10);
}

const letters = "ABCDEFGHIJK".split('');

function drawBoard() {
    // draw board
    const X = 10;
    const Y = 10;
	spritesheet.drawScaledSprite('board', boardIndex, X, Y, scale);

    let overDecret = -1;
    // draw decrets
    if( !isBoardUp ) {
        spritesheet.drawScaledSprite('decret', 0, 370, 20, scale*.75);
        spritesheet.drawScaledSprite('decret', 1, 370+170*scale, 20, scale*.75);
        spritesheet.drawScaledSprite('decret', 2, 370+170*2*scale, 20, scale*.75);
        spritesheet.drawScaledSprite('decret', 3, 370+170*3*scale, 20, scale*.75);

        overDecret = isMouseOverDecret(370,20);
        if( overDecret !== 0 ) {
            drawDecretCard(370, 20, decretTypes[0], occurrences[0], season === Season.Printemps || season === Season.Hiver);
        }
        if( overDecret !== 1 ) {
            drawDecretCard(370+170*scale, 20, decretTypes[1], occurrences[1], season === Season.Ete || season === Season.Printemps);
        }
        if( overDecret !== 2 ) {
            drawDecretCard(370+170*2*scale, 20, decretTypes[2], occurrences[2], season === Season.Automne || season === Season.Ete);
        }
        if( overDecret !== 3 ) {
            drawDecretCard(370+170*3*scale, 20, decretTypes[3], occurrences[3], season === Season.Hiver || season === Season.Automne);
        }
    } else {
        // draw exploration cards
        const delta = 0; // TODO
        for( i = 0; i < curSeasonCards.length+delta; i++ ) {
            const card = curSeasonCards[i];
            drawExplorationCard(400,20+40*i*scale, card, i === curSeasonCards.length+delta-2);	
        } 
    }

    /*
    for( i = 0; i < cards.length+delta; i++ ) {
        const card = cards[i];
        drawExplorationCard(1100,20+40*i, card, i === cards.length+delta-2);	
    }
    */

    // draw board lines
    strokeWeight(1);
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

    drawPieces();
    drawTime();
    drawPoints();

    // temple ?
    if( useTemple || pointButton.visible) {
        strokeWeight(4);
        highlightTemples();
    }
    strokeWeight(1);

    // bigger cards
    if( !isBoardUp ) {
        if( overDecret >= 0 ) {
            scale*=3;
            drawDecretCard(window_width/2-cardWidth/2*scale, 20, decretTypes[overDecret],occurrences[overDecret], false);
            scale/=3;
        }
    } else {
        if( !pointButton.visible && isMouseOverExploration() ) {
            scale*=3;
            const card = curSeasonCards[curSeasonCards.length-1];
            drawExplorationCard(window_width/2-cardWidth/2*scale, 20, card, false);
            scale/=3;
        }
    }

    // draw selected shape
    textSize(25);
    fill(125);
    textAlign(LEFT, CENTER);
    if( curSelectedShape ) {
        if( isBoardUp ) {
            drawShape(35,4, false);
        }
    } else if( pointButton.visible ) {
        text("End of Season", 770, 510);
    }

    // draw cursor on board
    if( !uiManager.currentDialog ) {
        const overCase = mouseOverCase();
        if( overCase !== null ) {
            push();
            textAlign(CENTER, CENTER);
            textSize(25);
            fill(25);
            if( toggleDebug ) {
                text(overCase.X, 305,770);	
                text(overCase.Y, 335,770);	
            } else {
                text(overCase.X+1, 335,770);	
                text(letters[overCase.Y], 305,770);	
            }

            // TODO: check if shape is OUT of the board
            drawShape(overCase.X, overCase.Y);
            if( isGoldShape ) {
                spritesheet.drawScaledSprite('piece', 0, mouseX-33/2, mouseY-33/2, scale);
            }
            pop();
        }
    }

    // TODO:
    // selected type button
    /*
    stroke(255,228,180);
    noFill();
    strokeWeight(2);
    if( curSelectedType >= 0 ) {
        rect(830, 65+(sizeBoard+5)*curSelectedType, sizeBoard, sizeBoard);
    }
    */

    if( toggleDebug ) {
        // logger
        rect(
            uiManager.loggerContainer.x,
            uiManager.loggerContainer.y,
            uiManager.loggerContainer.w,
            uiManager.loggerContainer.h
        );
    }

    // affiche le titre si le joueur en a gagné un
    if( (season === Season.End||toggleDebug) && titre ) {
        textAlign(CENTER, CENTER);
        text(titre, 450, 340);
        textAlign(LEFT, TOP);
    }

    textSize(6);
    noStroke();
    textAlign(CENTER, CENTER);
    text(version, window_width-50, 10);
}

function drawTime() {
    fill(250);
    stroke(0);
    textSize(20);
    textAlign(LEFT, TOP);
    if( season !== Season.End) {
        text(`${season} ${curTime}/${seasonTime}`, 380, 1);
    } else {
        text(season, 380, 1);
    }
}

function drawPoints() {
    if( !isBoardUp ) {
        drawSeasonPoint(370,135,0);
        drawSeasonPoint(455,135,1);
        drawSeasonPoint(540,135,2);
        drawSeasonPoint(630,135,3);
    }
    const total = points.reduce((acc,val)=>acc+val.total, 0);
    fill(250);
    stroke(0);
    textSize(22);
    textAlign(CENTER, CENTER);
    text(total,410,320);

    if( season === Season.End || toggleDebug ) {
        const totalSolo = [0,1,2,3].reduce((acc,val)=>
            acc+decretPoints[decretTypes[val]][occurrences[val]], 0
        );
        textSize(18);
        fill(247, 255, 60);
        textAlign(LEFT, CENTER);
        text(`- ${totalSolo} = ${total-totalSolo}`,440,320);
        if( season === Season.End ) {
            if( total-totalSolo < -30 ) {
                uiManager.addLogger("Fin du jeu");
            } else if( total-totalSolo < -20 ) {
                titre = "Buveur d'encre patenté";
            } else if( total-totalSolo < -10 ) {
                titre = "Gribouilleur attardé";
            } else if( total-totalSolo < -5 ) {
                titre = "Assistant incompétent";
            } else if( total-totalSolo < 0 ) {
                titre = "Assesseur amateur";
            } else if( total-totalSolo < 10 ) {
                titre = "Apprenti géomètre";
            } else if( total-totalSolo < 20 ) {
                titre = "Topographe itinérant";
            } else if( total-totalSolo < 30 ) {
                titre = "Maitre cartographe";
            } else {
                titre = "Cartographe légendaire";
            }
        }
    }

    fill(250);
    textAlign(LEFT, TOP);
}

function drawSeasonPoint(x,y,seasonIndex) {
    const decret1Value = points[seasonIndex].decret1;
    const decret2Value = points[seasonIndex].decret2;
    const piecesValue = points[seasonIndex].pieces;
    const monstersValue = points[seasonIndex].monsters;
    fill(250);
    stroke(0);
    textSize(14);
    const delta = 25;
    textAlign(LEFT, TOP);
    text(decret1Value, x, y);
    text(decret2Value, x+delta, y);
    text(piecesValue, x, y+delta);
    text(-monstersValue, x+delta, y+delta);
    const total = decret1Value+decret2Value+piecesValue-monstersValue;
    text(total,x+delta*2,y+delta/2);
    noFill();
    rect(x-5,y-5,80,delta*2,10);
    line(x+delta-5,y-5,x+delta-5,y+delta*2-5);
    line(x+delta*2-5,y-5,x+delta*2-5,y+delta*2-5);
    line(x-5,y+delta-7,x+delta*2-5,y+delta-7);
}

function highlightTemples() {
    noFill();
    templesPosition.forEach(pos=>{
        if( board[pos.X][pos.Y].value === EMPTYCASE ) {
            stroke(255,228,180);
            rect(xBoard+sizeBoard*pos.X, yBoard+sizeBoard*pos.Y, sizeBoard, sizeBoard);
        } else {
            stroke(155,128,180);
            rect(xBoard+sizeBoard*pos.X, yBoard+sizeBoard*pos.Y, sizeBoard, sizeBoard);
        }
    });
}

function drawPieces() {
    strokeWeight(1);
    const X = 30;
    const Y = 350;
    const sizePiece = 20;
    for( let i = 0; i < piecesMax; i++ ) {
        if( i < pieces ) {
            spritesheet.drawScaledSprite('piece', 0, X+i*sizePiece*1.2-sizePiece+3, Y-sizePiece+4, 1);
        } else {
            stroke(0);
            fill(151);
            ellipse(X+i*sizePiece*1.2,Y,sizePiece);
        }
    }

    stroke(144,0,211);
    fill(138,43,226);
    textAlign(LEFT, CENTER);
    textSize(25);
    text(-monsters,360,350);
    stroke(0);
}

let canDraw = true;
let isDrawnOnTemple = false;

function drawShape(X,Y,checkDraw=true) {
    if( !curSelectedShape ) {
        return;
    }
    const deltaX = 0;
    let curScale = 0.6;
    if( checkDraw ) {
        canDraw = true;
        isDrawnOnTemple = false;
        curScale = 1;
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
            spritesheet.drawScaledSprite('cases', curSelectedType, xBoard+sizeBoard*curX*curScale+deltaX, yBoard+sizeBoard*curY*curScale, curScale*scale);
            if( checkDraw && !isEmptyCase({X:curX, Y:curY})) {
                stroke(250,50,50);
                strokeWeight(4);
                noFill();
                rect(xBoard+sizeBoard*curX+deltaX, yBoard+sizeBoard*curY, sizeBoard, sizeBoard);
                strokeWeight(1);
                canDraw = false;
            }
            if( checkDraw && useTemple ) {
                if( templesPosition.findIndex(pos=>pos.X===curX && pos.Y===curY) >= 0 ) {
                    isDrawnOnTemple = true;
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
    if( useTemple && !isDrawnOnTemple ) {
        uiManager.addLogger("Shape should be on a ruin");
        return false;
    }
    addShapeAtPosition(overCase.X, overCase.Y);
    return true;
}

function addShapeAtPosition(X, Y) {
    const shape = curSelectedShape;
    for(let i=0; i < shape.length;i++) {
        const row = shape[i];
        for(let j=0; j < row.length;j++) {
            if( row[j] === " ") {
                continue;
            }
            const curX = X+i;
            const curY = Y+j;
            board[curX][curY].value = curSelectedType;
            board[curX][curY].turn = turn;    
        }
    }
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
    if( shapeAlreadyAdded() ) {
        soundManager.playSound('cannot_place');
        uiManager.addLogger("Shape already added");
        setTimeout(function() {
            uiManager.addLogger("Please click Next or Undo");
        }, 1500);
        return;
    }
    if( !canDraw ) {
        soundManager.playSound('cannot_place');
        uiManager.addLogger("Cannot be drawn here");
        return;
    }
    if( addShape() ) {
        soundManager.playSound('place_shape');
        nextButton.enabled = true;
        undoButton.enabled = true;
    }
}

function copySeed(boardSide) {
    if( !navigator.clipboard ) {
        uiManager.addLogger("cannot copy");
        return;
    }
    if( document.location.toString().includes("seed=") && document.location.toString().includes("board=") ) {
        navigator.clipboard.writeText(`${document.location.toString()}`);
    } else if( document.location.toString().includes("seed=") ) {
        navigator.clipboard.writeText(`${document.location.toString()}&board=${boardSide===1?"verso":"recto"}`);
    } else if( document.location.toString().includes("board=") ) {
        navigator.clipboard.writeText(`${document.location.toString()}&seed=${seed}`);
    } else {
        navigator.clipboard.writeText(`${document.location.toString()}?board=${boardSide===1?"verso":"recto"}&seed=${seed}`);
    }
    if( titre ) {
        window.open(`mailto:someone@example.com?subject=${titre}&body=copie ta carte ici`, "_parent");
    }
    uiManager.addLogger("seed copied");
}

function resetSeed() {
    if( document.location.toString().includes("seed=") ) {
        const url = document.location.toString().split("?")[0];
        document.location.assign(url);
    } else {
        seed = getRandomName().replaceAll(' ', '_');
    }
}

function draw() {
	const currentTime = Date.now();
	const elapsedTime = currentTime - lastTime;
	background(51);
    if (gameState === GAME_LOADING_STATE) {
		drawLoading();
		return;
	}

	uiManager.processInput();
	uiManager.update(elapsedTime);

    if (gameState === GAME_PLAY_STATE) {
	    drawBoard();
    }

	if (gameState === GAME_START_STATE) {
		background(51);
        spritesheet.drawScaledSprite('cartographer', 0, window_width/2 - 553/4, 10, .45);
        textSize(10);
        textAlign(LEFT, CENTER);
        text(`${seed.replaceAll('_', ' ')}`, window_width  - 250, window_height - 80);
        textSize(6);
        textAlign(CENTER, CENTER);
        text(version, window_width-50, 10);
	}

    textAlign(LEFT, TOP);
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
    const mouseDeltaX = mousePosition.X - mouseX;
    const mouseDeltaY = mousePosition.Y - mouseY;
    const simpleClick = Math.abs(mouseDeltaX) < 10 && Math.abs(mouseDeltaY) < 10;
    if( simpleClick && !uiManager.currentDialog ) {
        addCurrentCase();
    }

	toolManager.mouseClicked();
	uiManager.mouseClicked();

	return false;
}

let mousePosition = {X:0, Y:0};
let inMove = false;

function mousePressed() {
	console.log(mouseX, mouseY);
    if( toggleDebug ) {
        uiManager.addLogger(`X=${mouseX}, Y=${mouseY}`);
    }
    mousePosition={X:mouseX, Y:mouseY};
    inMove = true;
}

function mouseReleased() {
    const mouseDeltaX = mousePosition.X - mouseX;
    const mouseDeltaY = mousePosition.Y - mouseY;
    console.log(mouseDeltaY, mouseDeltaX);
    if( mouseX > 360 && mousePosition.X > 360 && Math.abs(mouseDeltaY) > mouseDeltaX*5 ) {
        if( mouseDeltaY > 100 ) {
            isBoardUp = true;
            setupCard(curSeasonCards[curSeasonCards.length-1]);
        } else if( mouseDeltaY < -100 ) {
            isBoardUp = false;
            buttons.forEach(b=>b.visible=false);
            shapeButtons.forEach(b=>b.visible=false);
        }
    }
    inMove = false;
}

function keyPressed() {
	if (key === "D") {
		toggleDebug = !toggleDebug;
        if( toggleDebug ) {
            uiManager.addLogger(`Screen size: ${window.screen.availWidth.toString()}x${window.screen.availHeight.toString()}`);
        }
	}

    if( key === "B" ) {
        for(let i = 0; i < board.length; i++ ) {
            const row = board[i].map(b=>b.value).join(",");
            console.log(row);
        }
    }

    if( key === "P") {
        pointsClicked();
    }

    if( turn === 0 ) {
        if (key === "a") {
            occurrences[0] = (occurrences[0]+1)%4;
        }
        if (key === "b") {
            occurrences[1] = (occurrences[1]+1)%4;
        }
        if (key === "c") {
            occurrences[2] = (occurrences[2]+1)%4;
        }
        if (key === "d") {
            occurrences[3] = (occurrences[3]+1)%4;
        }
    }

    if( key === "t" ) {
        // tourner la forme de 90 degres
        curSelectedShape = turnShape(curSelectedShape);
        soundManager.playSound('turn_shape');
    }
    if( key === "r" || key === "f" ) {
        // retourner la forme (miroir)
        curSelectedShape = flipShape(curSelectedShape);
        soundManager.playSound('flip_shape');
    }
}

