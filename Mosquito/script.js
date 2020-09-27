const canvas = document.getElementById("canvas");
const score = document.getElementById("score");
const successPage = document.getElementById("successPage");
const statsPage = document.getElementById("statsPage");
const successElements = document.getElementById("successElements");
const statsElements = document.getElementById("statsElements");
const shopElements = document.getElementById("shopElements");

const nbsp = "\u00a0";
const br = "\u0085";

let scoreValue = Number(localStorage.getItem('mosquito/score')) || 0;
let killValue = Number(localStorage.getItem('mosquito/kill')) || 0;
let hitDamageValue = Number(localStorage.getItem('mosquito/hitDamageValue')) || 1;
let scoreMultValue = Number(localStorage.getItem('mosquito/scoreMult')) || 1;
let hitMultValue = Number(localStorage.getItem('mosquito/hitMult')) || 0.1;
addScore(0);

start();

function getDisplayValue(v) {
    var unit = " ";
    if( v < 1e3 ) {
        v = Math.round(v*100);
        v = v/100.;
    } else if( v < 1e6 ) {
        v = v/1e3;
        v = Math.round(v*1000);
        v = v/1000.;
        unit = "k ";
    } else if( v < 1e9 ) {
        v = v/1e6;
        v = Math.round(v*1000);
        v = v/1000.;
        unit = "M ";
    } else if( v < 1e12 ) {
        v = v/1e9;
        v = Math.round(v*1000);
        v = v/1000.;
        unit = "G ";
    } else if( v < 1e15 ) {
        v = v/1e12;
        v = Math.round(v*1000);
        v = v/1000.;
        unit = "T ";
    } else if( v < 1e18 ) {
        v = v/1e15;
        v = Math.round(v*1000);
        v = v/1000.;
        unit = "P ";
    }

    return `${v}${unit}`;
}

function addScore(n) {
    scoreValue += n;
    score.innerHTML = getDisplayValue(scoreValue);
    localStorage.setItem('mosquito/score', scoreValue.toString());
}

function start() {
    game();

    function game() {
        if( canvas.children.length < 15 ) {
            const cur = addMosquito();
            setTimeout(() => {cur.remove();}, 12000);
        }
        setTimeout(() => {game();}, 500);
    }
}

function addImage(name) {
  const img = new Image();
  img.src = `./${name}.png`;
  img.classList.add(name);
  return img;
}

function addHit(x, y, size) {
  const hit = addImage("hit");

  hit.style.top = y-size/2;
  hit.style.left = x-size;
  hit.style.height = size;
  hit.style.setProperty("--trX", "0%");
  hit.style.setProperty("--trY", "0%");

  canvas.insertBefore(hit, canvas.firstChild);
  return hit;
}

function addMosquito() {
  const mosquito = addImage("mosquito");

  // sliding from left or right side of the page ?
  const left = Math.random() > 0.5;

  // mosquito position
  mosquito.style.top = Math.random()*450+5;
  mosquito.style.left = left ? -100 : 550;
  mosquito.style.height = Math.random()*50+40;

  // mosquito movement
  mosquito.style.setProperty("--trX", left ? "500%" : "-500%");
  const trY = 10*(Math.round(Math.random()*15)-6);
  mosquito.style.setProperty("--trY", `${trY}%`);

  // mosquito PV
  mosquito.alt = Math.round(Math.random()*3+0.5);
  mosquito.title = "HP: "+mosquito.alt;

  canvas.appendChild(mosquito);

  return mosquito;
}

function killMosquito(mosquitoElement) {
    mosquitoElement.remove();
    killValue++;
    localStorage.setItem('mosquito/kill', killValue.toString());
    addScore(scoreMultValue);
}

canvas.addEventListener('click', function(e) {
    const targetElement = e.target;
    // increase score when clicking on a mosquito
    if(targetElement.classList.contains("mosquito")) {
        // reducing PV
        let PV = targetElement.alt - hitDamageValue;
        targetElement.alt = PV;
        addScore(scoreMultValue*hitMultValue);
        let size = 48;
        if( PV <= 0) { 
            killMosquito(targetElement);
        } else {
            size = 24;
        }
        const hit = addHit(e.x-canvas.offsetLeft+window.scrollX, e.y-canvas.offsetTop+window.scrollY, size);
        setTimeout(() => {hit.remove();}, 5000);
    }
});

function openSuccessPage() {
    if( successElements.children.length === 0 ) {
        // fill success page
        killedList = [10,25,50,100,250,500];
        killedList.forEach(curKilled => {
            const curKillDiv = document.createElement("div");
            curKillDiv.id = `${curKilled} kills`;
            curKillDiv.classList.add("textCell");
            curKillDiv.appendChild(document.createTextNode(`${curKilled} mosquitos killed`));
            successElements.appendChild(curKillDiv);
        });
        
    }
    // update success
    for( const child of successElements.children) {
        const curKilled = Number(child.id.split(" ")[0]);
        console.log("curKilled: "+curKilled);
        if( curKilled <= killValue ) {
            child.style.backgroundColor = "#129912";
            child.style.color = "black";
        } else {
            child.style.backgroundColor = "#991212";
            child.style.color = "white";
        }
    }
    openDialog(successPage);
}

function openShopPage() {
    openDialog(shopPage);
}

function getOrCreateCell(divName, parent) {
    const existingDiv = document.getElementById(divName);
    if( existingDiv ) {
        return existingDiv;
    }
    const createdDiv = document.createElement("div");
    createdDiv.id = divName;
    createdDiv.classList.add("textCell");
    createdDiv.style.backgroundColor = "#ADD8E6";
    parent.appendChild(createdDiv);
    return createdDiv;
}

function updateText(element, text) {
    element.textContent = text;
}

function openStatsPage() {
    // update stats page
    const killedDiv = getOrCreateCell("killed", statsElements);
    updateText(killedDiv, `Total mosquito killed: ${killValue}`);
    const scoreMultDiv = getOrCreateCell("scoreMult", statsElements);
    updateText(scoreMultDiv, `Kill Money multiplier: ${scoreMultValue}`);
    const hitMultDiv = getOrCreateCell("hitMult", statsElements);
    updateText(hitMultDiv, `Hit Money multiplier: ${hitMultValue}`);
    const hitDamageDiv = getOrCreateCell("hitDamage", statsElements);
    updateText(hitDamageDiv, `Hit damage: ${hitDamageValue}${nbsp}HP`);

    openDialog(statsPage);
}

function openDialog(dialog) {
    dialog.classList.add("show");
}

function closePage(pageId) {
    document.getElementById(pageId).classList.remove("show");
}