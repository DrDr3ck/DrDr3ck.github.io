const uiManager = new UIManager();
const windowWidth = 1800;
const windowHeight = 1000;
uiManager.loggerContainer = new LoggerContainer(windowWidth-300, windowHeight-100, 240, 100);
uiManager.loggerContainer.visible = true;

const toolManager = new ToolManager();
const jobManager = new JobManager();
const soundManager = new SoundMgr();
const spritesheet = new SpriteSheet();

const soutiens = [
	["financiers"], ["generaux"], ["financiers","generaux"], ["financiers"], ["generaux"]
];

const materiauxCards = [
	0,0,0,0,0,0,
	1,1,1,1,1,
	2,2,2,2,2,
	3,3,3,3,3,3,3,
	4,4,
	5,5,5,5,5,
	6,6,6,6,6,6,6,
	7,7,7,7,7,7,
	8,8,8,8,8,8,8
];
const energieCards = [
	0,0,
	1,1,1,
	2,2,2,2,2,2,2,
	3,3,3,3,
	4,4,4,4,4,4,
	5,5,5,
	6,7,
	8,8,8,8
];
const orCards = [
	0,0,1,1,2,2,3,3,4,4,
	5,5,6,7,8,9,
	10,11,12,12,13,14,
    15,15,16,16,17,18,19
];
const scienceCards = [
	0,1,2,3,4,5,6,7,8,9,
	10,11,12,13,14,15,16,17,18,19,
	20,21,22
];
const explorationCards = [
	0,1,2,3,4,5,
	6,7,8,9,10,11,
	12,13,14,15,16
];

const cards = [];
materiauxCards.forEach(c=>cards.push({type: "materiaux", index: c}));
energieCards.forEach(c=>cards.push({type: "energie", index: c}));
orCards.forEach(c=>cards.push({type: "or", index: c}));
scienceCards.forEach(c=>cards.push({type: "science", index: c}));
explorationCards.forEach(c=>cards.push({type: "exploration", index: c}));

console.log(cards.length);

let hand = [];
let storedHand = [];

let cube = null;

const constructionCards = [];

const empireCards = [];

let selectedCardIndex = -1;
let defausseCard = null;
let overConstructionZone = false;
let overConstructionCardIndex = -1;
let overRecycleZone = false;
let overDefausseZone = false;
let defausseMode = false;

let corner = {X:0,Y:0};
const spriteSize = {width: 240, height: 365};
let imageNb = 0;

const description = { materiaux: [], energie: [], or: [], science: [], exploration: []};

const GAME_LOADING_STATE = 0;
const GAME_START_STATE = 1;
const GAME_PLAY_STATE = 2;
const GAME_OVER_STATE = 3;
let curState = GAME_LOADING_STATE;
let toggleDebug = false;
let lastTime = 0;

function randomInt(i) {
	return Math.floor(Math.random() * i);
}

function shuffleArray(array) {
	for (var i = array.length - 1; i > 0; i--) {
		var j = randomInt(i + 1);
		var temp = array[i];
		array[i] = array[j];
		array[j] = temp;
	}
}

function preload() {
	spritesheet.addSpriteSheet('board', './board.png', 2196, 580);

	spritesheet.addSpriteSheet('cover', './cover.jpg', 1200, 800);
}

function musicClicked() {
	// TODO
}

const speakerStorageKey = 'DrDr3ck/GameEngine/Speaker';
function speakerClicked() {
	speakerButton.checked = !speakerButton.checked;
	soundManager.mute(!speakerButton.checked);
	localStorage.setItem(speakerStorageKey, speakerButton.checked?"on":"off");
}

function startClicked() {
	curState = GAME_PLAY_STATE;
	uiManager.setUI([ speakerButton, musicButton ]);
	uiManager.addLogger("Start game");
}

const speakerButton = new BFloatingSwitchButton(windowWidth - 70 - 10 - 70, 70, '\uD83D\uDD0A', speakerClicked);
const musicButton = new BFloatingSwitchButton(windowWidth - 70, 70, '\uD83C\uDFB6', musicClicked);
const startButton = new BButton(80, windowHeight - 50, "START", startClicked);

function initUI() {
    speakerButton.setTextSize(50);
	musicButton.setTextSize(50);
	musicButton.enabled = false;
	musicButton.checked = false;
	const isSpeakerOn = localStorage.getItem(speakerStorageKey);
	if( isSpeakerOn === "off" ) {
		speakerButton.checked = false;
		soundManager.mute(true);
	}
	const menu = [ speakerButton, startButton, musicButton ];
	uiManager.setUI(menu);
}

function setup() {
    initUI();
	canvas = createCanvas(windowWidth, windowHeight);
    canvas.parent('canvas');

    frameRate(60);

	spritesheet.addSpriteSheet('empires', './empires.png', 370, 230);

	spritesheet.addSpriteSheet('verso', './verso.png', 240, 365);
	spritesheet.addSpriteSheet('materiaux', './materiaux.png', 240, 365);
	spritesheet.addSpriteSheet('energie', './energie.png', 240, 365);
	spritesheet.addSpriteSheet('or', './or.png', 240, 365);
	spritesheet.addSpriteSheet('science', './science.png', 240, 365);
	spritesheet.addSpriteSheet('exploration', './exploration.png', 240, 365);

    lastTime = Date.now();
}

function updateGame(elapsedTime) {

}

const scale = 0.9;

function drawCard(card, X, Y) {
	if( card.type === "none" ) {
		return;
	}
	spritesheet.drawScaledSprite(card.type, card.index, X, Y, scale);
	const cardDesc = description[card.type][card.index];
	if( cardDesc ) {
		// draw cubes to check
		noFill();
		stroke(250);
		const cubesType = [];
		Object.keys(cardDesc.construction).forEach(k=>{for(let i=0; i < cardDesc.construction[k]; i++) {cubesType.push(k);};});
		cubesType.forEach((t,i)=>{
			rect(X+5,Y+5+31.5*i,28,28);
		});
	}
}

function drawCube(cube, X, Y) {
	if( cube === "materiaux" ) {
		fill(199,179,148);
	}
	rect(X-15,Y-15,30,30,5);
}

const handX = 350
const handDeltaX = 220;
const handY = 665;
const cardWidth = 240*scale;
const cardHeight = 365*scale;

function drawGame() {
	if( overRecycleZone ) {
		fill(150);
		stroke(150);
		rect(350, 5, 1100, 280, 55);
	}
	spritesheet.drawScaledSprite('board', 0, 350, 0, 0.5);
	
	if( defausseCard ) {
		drawCard(defausseCard, windowWidth-cardWidth-5, windowHeight-cardHeight-5);
	} else {
		spritesheet.drawScaledSprite('verso', 0, windowWidth-cardWidth-5, windowHeight-cardHeight-5, 0.9);
	}
	if( overDefausseZone ) {
		stroke(250);
		strokeWeight(3);
		rect(windowWidth-cardWidth-5, windowHeight-cardHeight-5, cardWidth, cardHeight, 5);
	}

	// main
	hand.forEach((c,i)=>{
		if( i !== selectedCardIndex ) {
			drawCard(c, handX+handDeltaX*i, handY);
		}
	});
	
	// en cours de construction
	if( overConstructionZone ) {
		fill(150);
		stroke(150);
		strokeWeight(3);
	} else {
		noFill();
		stroke(0);
		strokeWeight(1);
	}
	rect(350, 300, 1400, 360, 25);
	if( overConstructionCardIndex >= 0 ) {
		noFill();
		stroke(250);
		strokeWeight(5);
		rect(350+220*overConstructionCardIndex+10, 300+15, cardWidth, cardHeight, 5);
		strokeWeight(1);
	}
	constructionCards.forEach((c,i)=>drawCard(c, 350+220*i+10, 300+15));

	// empire
	spritesheet.drawScaledSprite('empires', 0, 10, 770, scale);
	empireCards.forEach((c,i)=>drawCard(c, 125, 437-35*i));

	// draw selected card if any
	if( selectedCardIndex >= 0 ) {
		drawCard(hand[selectedCardIndex], mouseX-cardWidth/2, mouseY-cardHeight/2);
	}

	if( cube ) {
		drawCube(cube, mouseX, mouseY);
	}
}

// take 5 cards
function fillHand(defausse=true) {
	if( defausse ) {
		// TODO store current hand
		hand = [];
	}
	for( let i = 0; i < 5; i++ ) {
		hand.push( cards.pop() );  
	}
}

function initGame() {
	shuffleArray(cards);
	fillHand(false);
}

function drawLoading() {
	fill(0);
	noStroke();
	textSize(50);
	textAlign(CENTER, CENTER);
	text('Loading...', width / 2, height / 2);
	if (
		soundManager.totalLoadedSounds === soundManager.soundToLoad &&
		spritesheet.totalLoadedImages === spritesheet.totalImagesToLoad
	) {
		curState = GAME_START_STATE;

        // init game
        initGame();
		textAlign(LEFT, BASELINE);
		uiManager.addLogger('Game loaded');
	}
}

function draw() {
    const currentTime = Date.now();
	const elapsedTime = currentTime - lastTime;
    background(51);
    if (curState === GAME_LOADING_STATE) {
		drawLoading();
		return;
	}

    uiManager.processInput();

    uiManager.update(elapsedTime);

    // draw game
	if( curState === GAME_START_STATE ) {
		fill(250);
		stroke(0);
		textSize(75);
		text("It's a wonderful world", 300, 75);
		spritesheet.drawSprite("cover", 0, (windowWidth-1200)/2, (windowHeight-800)/2);
	}
	if (curState === GAME_PLAY_STATE) {
		updateGame(elapsedTime);
		drawGame();
	}

    uiManager.draw();
	if (toolManager.currentTool) {
		toolManager.currentTool.draw();
	}
    jobManager.draw();
    
    lastTime = currentTime;
}

function mouseMoved() {
	overConstructionZone = false;
	overRecycleZone = false;
	overDefausseZone = false;
	overConstructionCardIndex = -1;
	if( selectedCardIndex >= 0 ) {
		if( mouseX >= 350 && mouseY >= 300 && mouseX <= 350+1400 && mouseY <= 300+360) {
			overConstructionZone = true;
		}
		if( mouseX >= 350 && mouseY >= 5 && mouseX <= 350+1100 && mouseY <= 5+280) {
			overRecycleZone = true;
		}
		if( mouseX >= windowWidth-cardWidth-5 && mouseY >= windowHeight-cardHeight-5 && mouseX <= windowWidth-5 && mouseY <= windowHeight-5 ) {
			overDefausseZone = true;
		}
	} else if( cube ) {
		// check if cube is over a construction card
		constructionCards.forEach((c,i)=>{
			// 350+220*i+10, 300+15, cardWidth, cardHeight
			if( mouseX >= 350+220*i+10 && mouseY >= 300+15 && mouseX <= 350+220*i+10+cardWidth && mouseY <= 300+15+cardHeight) {
				overConstructionCardIndex = i;
			}
		});
		// check if cube is over the Empire
	}
}

function storeHand() {
	storedHand = hand.filter(c=>c.type !== "none").map(c=>{return {...c};});
}

function restoreHand() {
	hand = storedHand.map(c=>{return {...c};});
}

function addCardToHand(card) {
	hand.push({...card});
}

function mouseClicked() {
	if( toggleDebug ) {
		uiManager.addLogger(`X=${mouseX}, Y=${mouseY}`);
	}
	if( cube ) {
		// check if cube can be drop here...
		if( overConstructionCardIndex >= 0 ) {
			cube = null; // TODO
		}
	} else if( selectedCardIndex === -1 ) {
		hand.forEach((c,i)=>{
			if( c.type === "none" ) {
				return;
			}
			const cX = handX+handDeltaX*i;
			const cY = handY;
			if( mouseX > cX && mouseX < cX+cardWidth && mouseY > cY && mouseY < cY+cardHeight ) {
				if( defausseMode ) {
					// add the selected card to the hand and remove other cards
					const newCard = {...hand[i]};
					restoreHand();
					addCardToHand(newCard);
					defausseMode = false;
				} else {
					selectedCardIndex = i;
				}
			}
		});
	} else {
		if( overConstructionZone ) {
			const selectedCard = hand[selectedCardIndex];
			constructionCards.push({...selectedCard});
			selectedCard.type = "none";
		}
		if( overRecycleZone ) {
			// TODO: get cube
			const selectedCard = hand[selectedCardIndex];
			selectedCard.type = "none";
			cube = "materiaux";
		}
		if( overDefausseZone ) {
			const selectedCard = hand[selectedCardIndex];
			if( defausseCard ) {
				defausseCard = null;
				selectedCard.type = "none";
				// store hand
				storeHand();
				fillHand(true);
				defausseMode = true;
			} else {
				defausseCard = {...selectedCard};
			}
			selectedCard.type = "none";
		}
		selectedCardIndex = -1;
	}
	if( cube === null && selectedCardIndex === -1 ) {
		if( hand.every(c=>c.type === "none") ) {
			fillHand(true);
		}
	}
	toolManager.mouseClicked();
	uiManager.mouseClicked();
	return false;
}

function keyPressed() {
	if( key === "a" ) {
		// to do
		corner = {X: mouseX, Y: mouseY};
	}
	if( key === "c" ) {
		// copy image
		copy(corner.X, corner.Y, spriteSize.width, spriteSize.height, spriteSize.width*imageNb, 0, spriteSize.width, spriteSize.height);
		imageNb = imageNb + 1;
	}
	if (key === "D") {
		toggleDebug = !toggleDebug;
	}
}

// description des cartes
function addDescriptionCard(type, title, count, construction, production, recyclage, bonus=null) {
	description[type].push({title, count, construction, production, recyclage, bonus});
}

addDescriptionCard("materiaux", "Base Militaire", 6, {materiaux: 3, energie: 1}, {}, "materiaux");
addDescriptionCard("materiaux", "Centrale Nucléaire", 5, {materiaux: 4, science: 1}, {}, "energie");
addDescriptionCard("materiaux", "Place Financière", 5, {materiaux: 4, energie: 1}, {}, "or");
addDescriptionCard("materiaux", "Centre de Recherche", 7, {materiaux: 3, energie: 1}, {}, "science");
addDescriptionCard("materiaux", "Réseau de Transport", 2, {materiaux: 3}, {}, "materiaux");
addDescriptionCard("materiaux", "Plate-Forme Pétrolière", 5, {materiaux: 3, exploration: 1}, {}, "energie");
addDescriptionCard("materiaux", "Usine de Recyclage", 7, {materiaux: 2}, {}, "materiaux");
addDescriptionCard("materiaux", "Complexe Industriel", 6, {materiaux: 3, energie: 1}, {}, "or");
addDescriptionCard("materiaux", "Eoliennes", 7, {materiaux: 2}, {}, "energie");

addDescriptionCard("energie", "Escadrille de Soucoupes", 2, {energie: 3, science: 2}, {}, "science");
addDescriptionCard("energie", "Sous-Marin", 3, {materiaux: 2, energie: 3}, {}, "materiaux");
addDescriptionCard("energie", "Division de Chars", 7, {materiaux: 1, energie: 2}, {}, "materiaux");
addDescriptionCard("energie", "Brise-Glace", 4, {energie: 3, science: 1}, {}, "exploration");
addDescriptionCard("energie", "Zeppelin", 6, {energie: 2}, {}, "exploration");
addDescriptionCard("energie", "Laboratoire Aéroporté", 3, {energie: 3}, {}, "science");
addDescriptionCard("energie", "Juggernaut", 1, {materiaux: 3, energie: 3, crystalium: 1}, {}, "materiaux");
addDescriptionCard("energie", "Porte-Avions", 1, {materiaux: 3, energie: 4}, {}, "materiaux");
addDescriptionCard("energie", "Méga-Foreuse", 4, {materiaux: 1, energie: 2}, {}, "materiaux");

addDescriptionCard("or", "Laboratoire Secret", 2, {materiaux: 2, or: 3}, {}, "science");
addDescriptionCard("or", "Zone Portuaire", 2, {or: 5}, {}, "or");
addDescriptionCard("or", "Ville Souterraine", 2, {materiaux: 3, or: 3}, {}, "energie");
addDescriptionCard("or", "Agence d'Espionnage", 2, {energie: 2, or: 2}, {}, "exploration");
addDescriptionCard("or", "Ville Sous-Marine", 2, {energie: 2, science: 1, or: 2}, {}, "exploration");
addDescriptionCard("or", "Ville-Casino", 2, {energie: 3, or: 4}, {}, "or");
addDescriptionCard("or", "Université", 1, {science: 1, or: 2}, {}, "science");
addDescriptionCard("or", "Base Polaire", 1, {energie: 3, or: 4}, {}, "exploration");
addDescriptionCard("or", "Base Lunaire", 1, {energie: 2, science: 2, or: 2, crystalium: 1}, {}, "exploration");
addDescriptionCard("or", "Barrage Géant", 1, {materiaux: 3, or: 2}, {}, "energie");
addDescriptionCard("or", "Exposition Universelle", 1, {or: 3, financier: 2}, {}, "or");
addDescriptionCard("or", "Monument National", 1, {materiaux: 5, or: 3}, {}, "or");
addDescriptionCard("or", "Société Secrète", 2, {or: 3, crystalium: 1}, {}, "or");
addDescriptionCard("or", "Tour Géante", 1, {materiaux: 2, or: 3, financier: 1}, {}, "or");
addDescriptionCard("or", "Canon Solaire", 1, {energie: 2, science: 1, or: 3}, {}, "energie");
addDescriptionCard("or", "Centre de Propagande", 2, {or: 3}, {}, "or");
addDescriptionCard("or", "Musée", 2, {or: 3}, {}, "exploration");
addDescriptionCard("or", "Train Magnétique", 1, {energie: 1, science: 1, or: 3}, {}, "or");
addDescriptionCard("or", "Ascenseur Spatial", 1, {energie: 3, science: 1, or: 2}, {}, "energie");
addDescriptionCard("or", "Congrès Mondial", 1, {or: 6, financier: 2}, {}, "or");

addDescriptionCard("science", "Clonage Humain", 1, {science: 2, or: 1}, {}, "or"); // 23

addDescriptionCard("exploration", "Ile d'Avalon", 1, {exploration: 5}, {}, "science"); // 17
