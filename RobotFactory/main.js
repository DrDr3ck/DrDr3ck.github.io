const uiManager = new UIManager();
const windowWidth = 1400;
const windowHeight = 800;
uiManager.loggerContainer = new LoggerContainer(windowWidth-300, windowHeight-100, 240, 100);
uiManager.loggerContainer.visible = true;

const toolManager = new ToolManager();
const jobManager = new JobManager();
const soundManager = new SoundMgr();
const spritesheet = new SpriteSheet();

const GAME_LOADING_STATE = 0;
const GAME_START_STATE = 1;
const GAME_PLAY_STATE = 2;
const GAME_OVER_STATE = 3;
let curState = GAME_LOADING_STATE;
let toggleDebug = false;
let lastTime = 0;

/*****************************/

const defaultMine = {
	type: "mine",
	curTime: 0,
	settings: {
		clickTime: 2500,
		maxTime: 10000,
		createResource: 1, // create 1 resource at a time
		countResource: 0,
		maxResource: 20,
		typeResource: "iron",
	},
	position: {
		x: 100, y: 100, w: 300, h: 200
	},
	bgcolor: {r: 155, g: 122, b: 144 }
}

const defaultFactory = {
	type: "factory",
	curTime: 0,
	settings: {
		neededResource: [{type: "iron", count: 5}],
		clickTime: 500,
		maxTime: 10000,
		createResource: 1,
		countResource: 0,
		maxResource: 1,
		typeResource: "robot"
	},
	position: {
		x: 100, y: 500, w: 200, h: 200
	},
	bgcolor: {r: 30, g: 93, b: 136 }
};

const resources = {
	iron: 0, coal: 0, copper: 0, robot: 0
};

const defaultSeller = {
	type: "sell",
	settings: {
		priceRatio: 1
	},
	position: {
		x: 1100, y: 500, w: 200, h: 200
	},
	bgcolor: {r: 30, g: 136, b: 93 }
};

const components = [defaultMine, defaultFactory, defaultSeller];

/*****************************/

function preload() {
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
const startButton = new BButton(80, windowHeight - 50 - 200, "START", startClicked);

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

    lastTime = Date.now();
}

function updateGame(elapsedTime) {
	if( defaultMine.settings.countResource === defaultMine.settings.maxResource ) {
		defaultMine.curTime = 0;
	} else {
		defaultMine.curTime += elapsedTime;
		if( defaultMine.curTime > defaultMine.settings.maxTime ) {
			defaultMine.curTime -= defaultMine.settings.maxTime;
			if( defaultMine.settings.countResource < defaultMine.settings.maxResource ) {
				const delta = Math.min(
					defaultMine.settings.countResource+defaultMine.settings.createResource,
					defaultMine.settings.maxResource
				) - defaultMine.settings.countResource;
				defaultMine.settings.countResource += delta;
				//resources[defaultMine.settings.typeResource] += delta;
			}
		}
	}

	// check if default factory is working...
	if( defaultFactory.curTime > 0 ) {
		defaultFactory.curTime += elapsedTime;
		if( defaultFactory.curTime > defaultFactory.settings.maxTime ) {
			defaultFactory.curTime = 0;
			// TODO: get item
		}
	} else {
		// check if default factory can work
		const curNeeded = resources[defaultFactory.settings.neededResource[0].type];
		const maxNeeded = defaultFactory.settings.neededResource[0].count;
		if( curNeeded >= maxNeeded ) {
			// remove resource
			resources[defaultFactory.settings.neededResource[0].type] -= maxNeeded;
			defaultFactory.curTime = 1;
		}
	}
}

function displayTime(x,y,ratio) {
	const radius = 30;
	stroke(0);
	fill(22,80,22);
	circle(x,y,radius);
	fill(44,160,44);
	arc(x,y,radius,radius, -HALF_PI, PI*2*ratio-HALF_PI);
}

function displaySettings(x,y) {
	const radius = 30;
	stroke(0);
	fill(122,122,152);
	circle(x,y,radius);
}

function displayTitle(x,y,title) {
	fill(0);
	noStroke();
	textSize(35);
	textAlign(CENTER, CENTER);
	text(title,x,y);
}

function displayCount(x, y, count, max) {
	fill(24);
	noStroke();
	textSize(25);
	textAlign(LEFT, TOP);
	text(`${count}/${max}`, x, y);
}

function displayComponent(component) {
	noStroke();
	fill(component.bgcolor.r, component.bgcolor.g, component.bgcolor.b);
	rect(component.position.x, component.position.y, component.position.w, component.position.h);
	stroke(0);
	strokeWeight(1);
	noFill();
	rect(component.position.x, component.position.y, component.position.w, component.position.h);

	displaySettings(component.position.x+component.position.w-30, component.position.y+component.position.h-30);

	displayTitle(component.position.x+component.position.w/2, component.position.y+component.position.h/2,component.type);

	if( component.settings.maxTime ) {
		displayTime(component.position.x+component.position.w-30, component.position.y+30, component.curTime/component.settings.maxTime);
	}
	if( component.settings.maxResource ) {
		displayCount(component.position.x+15, component.position.y+component.position.h-15-25,component.settings.countResource,component.settings.maxResource);
	}
	if( component.settings.neededResource ) {
		displayCount(component.position.x+15, component.position.y+15, resources[component.settings.neededResource[0].type], component.settings.neededResource[0].count);
	}
}

function drawGame() {
	displayComponent(defaultMine);
	displayComponent(defaultFactory);
	displayComponent(defaultSeller);
}

function initGame() {

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

function mouseClicked() {
	if( toggleDebug ) {
		uiManager.addLogger(`X=${mouseX}, Y=${mouseY}`);
	}
	toolManager.mouseClicked();
	uiManager.mouseClicked();

	// check if player clicks on 'time'
	components.forEach(component=>{
		if( !component.settings.clickTime ) return;
		const x = component.position.x+component.position.w-30
		const y = component.position.y+30;
		const radius = 30;
		if( mouseX > x+radius || mouseX < x-radius || mouseY > y+radius || mouseY < y-radius ) {
			return;
		}
		// add time !!
		component.curTime += component.settings.clickTime;
	});

	// check if player clicks on 'resource'
	components.forEach(component=>{
		if( !component.settings.countResource ) return;
		const x = component.position.x+30
		const y = component.position.y+component.position.h-30;
		const radius = 30;
		if( mouseX > x+radius || mouseX < x-radius || mouseY > y+radius || mouseY < y-radius ) {
			return;
		}
		// add resource !!
		resources[component.settings.typeResource] += component.settings.countResource;
		component.settings.countResource = 0;
	});

	return false;
}

function keyPressed() {
	if (key === "D") {
		toggleDebug = !toggleDebug;
	}
}