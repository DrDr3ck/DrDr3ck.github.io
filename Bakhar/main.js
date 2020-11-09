const initSongVolume = 0.3;
let songVolume = initSongVolume;

const GAME_MENU_STATE = 0;

let curState = GAME_MENU_STATE;

function getData() {
	const data = {
		volume: songVolume
	};
	return data;
}

const storageKey = '34KH4R';

function doSave() {
	const data = JSON.stringify(getData());
	if (data && data !== 'null') {
		localStorage.setItem(storageKey, data);
		console.log('saving ', data);
	}
}

function loadData() {
	const storage = localStorage.getItem(storageKey);
	const initialData = getData();
	let data = initialData;
	if (storage) {
		data = JSON.parse(storage) || initialData;
		for (var k in initialData) {
			if (!data[k]) {
				data[k] = initialData[k];
			}
		}
	}
	songVolume = data.volume;
}

const userLang = navigator.language || navigator.userLanguage; // "en-US"

function drawText(string, x, y) {
	fill(198,244,255);
	text(string, x, y);
}

class UIManager {
	constructor() {
		this.components = [];
	}

	processInput() {
		this.components.forEach((c) => {
			c.over = c.mouseOver(mouseX, mouseY);
		});
    }
    
    mouseClicked() {
        let overComponent = null;
        this.components.forEach((c) => {
            if( c.over ) {
                overComponent = c;
                return;
            }
        });
        if( overComponent ) {
            overComponent.clicked();
        }
    }

	update(elapsedTime) {
		this.components.forEach((c) => {
			c.update(elapsedTime);
		});
	}
}

const manager = new UIManager();

class UIComponent {
	constructor(x, y, width, height) {
		this.x = x;
		this.y = y;
		this.w = width;
		this.h = height;
		manager.components.push(this);
	}

	mouseOver(mx, my) {
		if (mx > this.x + this.w) return false;
		if (mx < this.x) return false;
		if (my < this.y - this.h) return false;
		if (my > this.y) return false;
		return true;
	}

	update(elapsedTime) {
		// virtual pure ?
    }
    
    clicked() {
    }
}

class BButton extends UIComponent {
	constructor(x, y, text) {
		super(x, y, 400, 70);
		this.text = text;
		this.over = false;
	}

	draw() {
		push();
		textAlign(CENTER, CENTER);
		rectMode(CENTER);
		textSize(60);
		let fRadius = 5;
		let lRadius = 15;
		if (this.over) {
			stroke(29,62,105);
			fRadius = 15;
			lRadius = 5;
		} else {
            stroke(188,219,255);
        }
        fill(9,18,47);
		
		rect(this.x + this.w / 2, this.y - this.h / 2, this.w, this.h, fRadius, lRadius);
		drawText(this.text, this.x + this.w / 2, this.y - this.h / 2);
		pop();
	}
}

const FPS = 60;

function preload() {
	// Load sounds
}

function setup() {
	loadData();

	canvas = createCanvas(1200, 800);
	canvas.parent('canvas');

	frameRate(FPS);
}

const menu = {
	start: new BButton(100, 400, 'START'),
	story: new BButton(100, 500, 'BLOG'),
	credit: new BButton(100, 600, 'CREDIT')
};

let lastTime = Date.now();

function drawMenu() {
	background(51);
	fill(128);
	rect(180, 80, width - 180 - 180, 580 - 80);
	menu.start.draw();
	menu.story.draw();
	menu.credit.draw();
}

function processInput() {
	manager.processInput();
}

function update(elapsedTime) {}

function render() {
	if (curState === GAME_MENU_STATE) {
		drawMenu();
		return;
	}
}

function draw() {
	const currentTime = Date.now();
	const elapsedTime = currentTime - lastTime;
	processInput();
	update(elapsedTime);
	render();
	lastTime = currentTime;
}

function mouseMoved() {
	//console.info('Mouse position: (' + mouseX + ', ' + mouseY + ')');
}

function mouseClicked() {
    manager.mouseClicked();
}