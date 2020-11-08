const initSongVolume = 0.3;
let songVolume = initSongVolume;

function getData() {
	const data = {
		volume: songVolume
	};
	return data;
}

const storageKey = "34KH4R";

function doSave() {
	const data = JSON.stringify(getData());
	if( data && data !== "null" ) {
		localStorage.setItem(storageKey, data);
		console.log("saving ",data);
	}
}

function loadData() {
	const storage = localStorage.getItem(storageKey);
	const initialData = getData();
	let data = initialData;
	if( storage ) {
		data = JSON.parse(storage) || initialData;
	}
	songVolume = data.volume;
}


const userLang = navigator.language || navigator.userLanguage; // "en-US"

function drawText(string, x, y) {
	fill(222);
	text(string, x, y);
	fill(11);
	text(string, x + 1, y);
}

const FPS = 60;

function preload() {
	// Load sounds
}

function setup() {
	loadData();

	canvas = createCanvas(1200, 850);
	canvas.parent('canvas');

	frameRate(FPS);
}

function draw() {
	background(51);
}