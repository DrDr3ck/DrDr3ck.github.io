// default list of {url, title} — can be overridden via textarea input
let defaultItems = [
  { url: "https://www.youtube.com/watch?v=ktyID5n3G0M", title: "Piege Obscur" },
  { url: "https://www.youtube.com/watch?v=C4VKaxcDOeE", title: "Marrakech" },
  { url: "https://www.youtube.com/watch?v=vixzAR0EGrg", title: "Fertility" },
  { url: "https://www.youtube.com/watch?v=rYY4lnHmya8", title: "Atlandice" },
  { url: "https://www.youtube.com/watch?v=9uleuGMjyIk", title: "Ligretto" },
  { url: "https://www.youtube.com/watch?v=JmyCPwJKMr4", title: "The Game" },
  { url: "https://www.youtube.com/watch?v=tvI8eFfm6Bk", title: "Catan" },
  { url: "https://www.youtube.com/watch?v=PZwI7PyJ5pk", title: "Carcassonne" },
  { url: "https://www.youtube.com/watch?v=jnM9yf65rpo", title: "KingDomino" },
  { url: "https://www.youtube.com/watch?v=4BJv_vDqou8", title: "Skyjo" },
  { url: "https://www.youtube.com/watch?v=C9zOpikMSzA", title: "Azul" },
  { url: "https://www.youtube.com/watch?v=NATKVAh88Y4", title: "Room 25" }
];

// active items used to draw QR codes (may be set from textarea)
let items = defaultItems.slice();

let qrObjects = [];
let scaleFactor = 8;
let titleArea = 40;
let frameInset = 8; 
let whiteBorder = 8; // white space between black frame and QR
let customFont;
let cols = 3; // number of columns in the grid
let gap = 50; // pixels between items and as outer margin

let hideUI = false;
let mainCanvas = null;
let controlsDiv = null;

function preload() {
  // try to load a font from the repo; if missing, p5 will fallback
  customFont = loadFont('../Steering/LEMONMILK-Regular.otf');
}

function setup() {
  mainCanvas = createCanvas(400, 200);
  mainCanvas.style('display', 'none');
  noLoop();

  if (hideUI) {
    parseInputAndGenerate(items.map(it => `${it.title}: ${it.url}`).join('\n'));
    return;
  }

  // create a controls container so we can hide it when generating or printing
  controlsDiv = createDiv();
  controlsDiv.id('qrControls');
  controlsDiv.parent(document.body);

  // small print CSS: hide controls when printing
  let st = createElement('style');
  st.html('@media print { #qrControls { display: none !important; } }');
  st.parent(document.head || document.body);

  // build a simple UI: textarea with lines "title: url" and a button
  let info = createP('Enter one item per line in the form: <strong>title: url</strong>');
  info.parent(controlsDiv);

  let ta = createElement('textarea');
  ta.id('qrListInput');
  ta.attribute('rows', '10');
  ta.attribute('cols', '60');
  // prefill textarea with current defaults
  let prefill = items.map(it => `${it.title}: ${it.url}`).join('\n');
  ta.elt.value = prefill;
  ta.parent(controlsDiv);

  let btn = createButton('Generer les QR Codes');
  btn.parent(controlsDiv);
  btn.mousePressed(() => {
    parseInputAndGenerate(ta.elt.value);
    hideUI = true;
    if (controlsDiv) controlsDiv.style('display', 'none');
    if (mainCanvas) mainCanvas.style('display', 'block');
  });
  btn.style('margin-right', '8px');
  btn.style('margin-left', '8px');
}

function parseInputAndGenerate(text) {
  let lines = text.split(/\r?\n/);
  let parsed = [];
  for (let raw of lines) {
    let line = raw.trim();
    if (!line) continue;
    if (line.startsWith('#')) continue;
    // split at first ':' or ' - ' if no colon
    let parts;
    if (line.indexOf(':') >= 0) parts = line.split(/:(.+)/);
    else parts = line.split(/-(.+)/);
    if (parts.length >= 3) {
      let title = parts[0].trim();
      let url = parts[1].trim();
      if (title && url) parsed.push({ title: title, url: url });
    }
  }
  if (parsed.length > 0) items = parsed;
  else items = defaultItems.slice();

  generateQRCodesAndLayout();
}

function generateQRCodesAndLayout() {
  qrObjects = [];
  // generate all QR objects and find the largest module size
  let maxModule = 0;
  for (let i = 0; i < items.length; i++) {
    let q = qrcode(0, 'L');
    q.addData(items[i].url);
    q.make();
    let m = q.getModuleCount();
    qrObjects.push({ qr: q, modules: m });
    if (m > maxModule) maxModule = m;
  }

  let qrPixelSize = maxModule * scaleFactor;
  let itemW = qrPixelSize + frameInset * 2 + whiteBorder * 2;
  let itemH = qrPixelSize + titleArea + frameInset * 2 + whiteBorder * 2;

  cols = min(cols, items.length);
  let rows = ceil(items.length / cols);
  // canvas includes gaps between items and outer margins
  let canvasW = cols * itemW + (cols + 1) * gap;
  let canvasH = rows * itemH + (rows + 1) * gap;
  if (mainCanvas) mainCanvas.style('display', 'block');
  resizeCanvas(canvasW, canvasH);
  redraw();
}

function draw() {
  background(255);

  // compute sizes again
  let maxModule = 0;
  for (let i = 0; i < qrObjects.length; i++) if (qrObjects[i].modules > maxModule) maxModule = qrObjects[i].modules;
  let qrPixelSize = maxModule * scaleFactor;
  let itemW = qrPixelSize + frameInset * 2 + whiteBorder * 2;
  let itemH = qrPixelSize + titleArea + frameInset * 2 + whiteBorder * 2;

  let radius = 16;

  for (let i = 0; i < items.length; i++) {
    let colIdx = i % cols;
    let rowIdx = floor(i / cols);
    // include outer margin gap and spacing between items
    let x0 = gap + colIdx * (itemW + gap);
    let y0 = gap + rowIdx * (itemH + gap);

    // outer black frame
    noStroke();
    fill(0);
    rect(x0, y0, itemW, itemH, radius);
    // inner white area
    fill(255);
    rect(x0 + frameInset, y0 + frameInset, itemW - frameInset * 2, itemH - frameInset * 2, max(0, radius - 4));

    // draw QR centered within the QR area
    let obj = qrObjects[i];
    let q = obj.qr;
    let m = obj.modules;
    let qrPixel = m * scaleFactor;
    let qrX = x0 + frameInset + whiteBorder + floor((qrPixelSize - qrPixel) / 2);
    let qrY = y0 + frameInset + whiteBorder;

    for (let r = 0; r < m; r++) {
      for (let c = 0; c < m; c++) {
        if (q.isDark(r, c)) fill(0);
        else fill(255);
        rect(qrX + c * scaleFactor, qrY + r * scaleFactor, scaleFactor, scaleFactor);
      }
    }

    // title
    push();
    fill(0);
    if (customFont) textFont(customFont);
    textSize(16);
    textAlign(CENTER, TOP);
    text(items[i].title, x0 + itemW / 2, qrY + qrPixel + 6);
    pop();
  }
}