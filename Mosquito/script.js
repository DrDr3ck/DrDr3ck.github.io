const canvas = document.getElementById("canvas");
const score = document.getElementById("score");
const succesPage = document.getElementById("succesPage");
const statsPage = document.getElementById("statsPage");

succesPage.style.visibility = statsPage.style.visibility = 'hidden';
succesPage.style.opacity = statsPage.style.opacity = '0';

let count = Number(localStorage.getItem('mosquito/score')) || 0;
addScore(0);

start();

function addScore(n) {
    count += n;
    score.innerHTML = count;
    localStorage.setItem('mosquito/score', count.toString());
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

  const left = Math.random() > 0.5;

  mosquito.style.top = Math.random()*450+5;
  mosquito.style.left = left ? -100 : 550;
  mosquito.style.height = Math.random()*50+40;

  mosquito.style.setProperty("--trX", left ? "500%" : "-500%");
  const trY = 10*(Math.round(Math.random()*15)-6);
  mosquito.style.setProperty("--trY", `${trY}%`);
  mosquito.alt = Math.round(Math.random()*3+0.5);

  canvas.appendChild(mosquito);

  return mosquito;
}

canvas.addEventListener('click', function(e) {
    const targetElement = e.target || e.srcElement;
    // increase score when clicking on a mosquito
    if(targetElement.classList.contains("mosquito")) {
        let PV = targetElement.alt - 1;
        targetElement.alt = PV;
        let size = 48;
        if( PV <= 0) { 
            targetElement.remove();
            addScore(1);
        } else {
            size = 24;
        }
        const hit = addHit(e.x-canvas.offsetLeft+window.scrollX, e.y-canvas.offsetTop+window.scrollY, size);
        setTimeout(() => {hit.remove();}, 5000);
    }
});

function succes() {
    closeStatsPage();
    succesPage.style.visibility = (succesPage.style.visibility === 'hidden') ? 'visible' : 'hidden';
    succesPage.style.opacity = 1 - Number(succesPage.style.opacity);
}

function closeSuccesPage() {
    succesPage.style.visibility = 'hidden';
    succesPage.style.opacity = 0;
}

function stats() {
    closeSuccesPage();
    statsPage.style.visibility = (statsPage.style.visibility === 'hidden') ? 'visible' : 'hidden';
    statsPage.style.opacity = 1 - Number(statsPage.style.opacity);
}

function closeStatsPage() {
    statsPage.style.visibility = 'hidden';
    statsPage.style.opacity = 0;
}