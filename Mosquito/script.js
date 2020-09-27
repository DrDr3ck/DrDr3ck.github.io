const canvas = document.getElementById("canvas");
const score = document.getElementById("score");
const successPage = document.getElementById("successPage");
const statsPage = document.getElementById("statsPage");
const shopPage = document.getElementById("shopPage");
const upgradePage = document.getElementById("upgradePage");
const bestiaryPage = document.getElementById("bestiaryPage");
const successElements = document.getElementById("successElements");
const statsElements = document.getElementById("statsElements");
const shopElements = document.getElementById("shopElements");

const nbsp = "\u00a0";

let scoreValue = Number(localStorage.getItem('mosquito/score')) || 0;
let killValue = Number(localStorage.getItem('mosquito/kill')) || 0;
let hitDamageValue = Number(localStorage.getItem('mosquito/hitDamage')) || 1;
let killMultValue = Number(localStorage.getItem('mosquito/killMult')) || 1;
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
            const r = Math.random();
            let insectLifeTime = 12000;
            let cur = null;
            if( r > 0.15 ) {
                cur = addMosquito();
            } else if( r > 0.03 ) {
                cur = addBee();
            } else {
                cur = addGrassHopper();
                insectLifeTime = 22000;
            }
            setTimeout(() => {cur.remove();}, insectLifeTime);
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

function addBee() {
    const bee = addImage("bee");

    // sliding from left or right side of the page ?
    const left = Math.random() > 0.5;

    // mosquito position
    bee.style.top = Math.random()*450+5;
    bee.style.left = left ? -100 : 550;
    bee.style.height = Math.random()*70+40;

    // mosquito movement
    bee.style.setProperty("--trX", left ? "500%" : "-500%");
    const trY = 10*(Math.round(Math.random()*15)-6);
    bee.style.setProperty("--trY", `${trY}%`);

    // mosquito PV
    bee.alt = Math.round(Math.random()*8+3.5);
    bee.title = "HP: "+bee.alt;

    canvas.appendChild(bee);

    return bee;
}

function addGrassHopper() {
    const grassHopper = addImage("grasshopper");

    // sliding from left or right side of the page ?
    const left = Math.random() > 0.5;

    // mosquito position
    grassHopper.style.top = Math.random()*450+5;
    grassHopper.style.left = left ? -100 : 550;
    grassHopper.style.height = Math.random()*70+40;

    // mosquito movement
    grassHopper.style.setProperty("--trX", left ? "500%" : "-500%");
    const trY = 10*(Math.round(Math.random()*15)-6);
    grassHopper.style.setProperty("--trY", `${trY}%`);

    // mosquito PV
    grassHopper.alt = Math.round(Math.random()*15+7.5);
    grassHopper.title = "HP: "+grassHopper.alt;

    canvas.appendChild(grassHopper);

    return grassHopper;
}

function killInsect(insectElement, basePrice) {
    insectElement.remove();
    killValue++;
    localStorage.setItem('mosquito/kill', killValue.toString());
    addScore(basePrice*killMultValue);
}

function getInsectType(targetElement) {
    if( targetElement.classList.contains("mosquito") ) { return "mosquito"; }
    if( targetElement.classList.contains("bee") ) { return "bee"; }
    if( targetElement.classList.contains("grasshopper") ) { return "grasshopper"; }
    return null;
}

const insectValue = {mosquito: 1, bee: 1.4, grasshopper: 2.6};

canvas.addEventListener('click', function(e) {
    const targetElement = e.target;
    // increase score when clicking on a mosquito
    const insectType = getInsectType(targetElement);
    if( insectType ) {
        // reducing PV
        let PV = Number(targetElement.alt) - hitDamageValue;
        targetElement.alt = PV;
        targetElement.title = "HP: "+getDisplayValue(PV);
        addScore(killMultValue*hitMultValue); // Hit money
        let size = 48;
        if( PV <= 0) { 
            console.log("money: "+insectValue[insectType]);
            killInsect(targetElement,insectValue[insectType]);
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
        [10,25,50,100,250,500,1000,2500,5000,10000].forEach(curKilled => {
            const curKillDiv = document.createElement("div");
            curKillDiv.id = `${curKilled} kills`;
            curKillDiv.classList.add("textCell");
            curKillDiv.appendChild(document.createTextNode(`${curKilled} mosquitoes killed`));
            successElements.appendChild(curKillDiv);
        });
        [2,4,6,8,10].forEach(curDamage => {
            const curDamageDiv = document.createElement("div");
            curDamageDiv.id = `${curDamage} damage`;
            curDamageDiv.classList.add("textCell");
            curDamageDiv.appendChild(document.createTextNode(`Hit Damage of ${curDamage}`));
            successElements.appendChild(curDamageDiv);
        });
    }
    // update success
    for( const child of successElements.children) {
        let success = false;
        if( child.id.includes("kills") ) {
            const curKilled = Number(child.id.split(" ")[0]);
            success = curKilled <= killValue;
        } else if( child.id.includes("damage") ) {
            const curDamage = Number(child.id.split(" ")[0]);
            success = curDamage <= hitDamageValue;
        }
        if( success ) {
            child.style.backgroundColor = "#129912";
            child.style.color = "black";
        } else {
            child.style.backgroundColor = "#991212";
            child.style.color = "white";
        }
    }

    openDialog(successPage);
}

function buyHitDamageUpgrade(price, factor) {
    if( price > scoreValue ) {
        // cannot buy it
        return;
    }
    addScore(-price);
    hitDamageValue *= factor;
    localStorage.setItem('mosquito/hitDamage', hitDamageValue.toString());
    updateUpgradePage();
}

function buyHitMultUpgrade(price, factor) {
    if( price > scoreValue ) {
        // cannot buy it
        return;
    }
    addScore(-price);
    hitMultValue *= factor;
    localStorage.setItem('mosquito/hitMult', hitMultValue.toString());
    updateUpgradePage();
}

function buyKillMultUpgrade(price, factor) {
    if( price > scoreValue ) {
        // cannot buy it
        return;
    }
    addScore(-price);
    killMultValue *= factor;
    localStorage.setItem('mosquito/killMult', killMultValue.toString());
    updateUpgradePage();
}

function updateBuyButton(child, price) {
    if( scoreValue >= price ) {
        child.style.background = "#129912";
        child.style.color = "black";
    } else {
        child.style.backgroundColor = "#991212";
        child.style.color = "white";
    }
}

function openShopPage() {
    openDialog(shopPage);
}

function updateUpgradePage() {
    // update upgrade page
    const buyHitDamage = document.getElementById("buyHitDamage");
    updateBuyButton(buyHitDamage, 10);

    const buyHitMult = document.getElementById("buyHitMult");
    updateBuyButton(buyHitMult, 100);

    const buyKillMult = document.getElementById("buyKillMult");
    updateBuyButton(buyKillMult, 1000);
}

function openUpgradePage() {
    updateUpgradePage();
    openDialog(upgradePage);
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

function openBestiaryPage() {
    openDialog(bestiaryPage);
}

function openStatsPage() {
    // update stats page
    const killedDiv = getOrCreateCell("killed", statsElements);
    updateText(killedDiv, `Total mosquito killed: ${killValue}`);
    const scoreMultDiv = getOrCreateCell("scoreMult", statsElements);
    updateText(scoreMultDiv, `Kill Money multiplier: ${getDisplayValue(killMultValue)}`);
    const hitMultDiv = getOrCreateCell("hitMult", statsElements);
    updateText(hitMultDiv, `Hit Money multiplier: ${getDisplayValue(hitMultValue)}`);
    const hitDamageDiv = getOrCreateCell("hitDamage", statsElements);
    updateText(hitDamageDiv, `Hit damage: ${getDisplayValue(hitDamageValue)}${nbsp}HP`);

    openDialog(statsPage);
}

function openDialog(dialog) {
    dialog.classList.add("show");
}

function closePage(pageId) {
    document.getElementById(pageId).classList.remove("show");
}