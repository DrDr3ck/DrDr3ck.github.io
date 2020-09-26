const canvas = document.getElementById("canvas");
const score = document.getElementById("score");

let count = 0;

start();

function addScore(n) {
    count += n;
    score.innerHTML = count;
}

function start() {
    count = 0;
    addScore(0);

    game();

    function game() {
        if( canvas.children.length < 10 ) {
            const cur = addMosquito();
            setTimeout(() => {cur.remove();}, 12000);
        }
        setTimeout(() => {game();}, 500);
    }
}

function addMosquito() {
  const mosquito = new Image();
  mosquito.src = "./mosquito.png";
  mosquito.classList.add("mosquito");

  mosquito.style.top = Math.random()*400+50;
  mosquito.style.left = -100;
  mosquito.style.height = Math.random()*50+40;

  mosquito.style.setProperty("--trX", "500%");
  mosquito.style.setProperty("--trY", "100px");
  mosquito.alt = Math.round(Math.random()*3+0.5);

  canvas.appendChild(mosquito);

  return mosquito;
}

canvas.addEventListener('click', function(e) {
    const targetElement = e.target || e.srcElement;
    if(targetElement.classList.contains("mosquito")) {
        let PV = targetElement.alt - 1;
        if( PV <= 0) {
            targetElement.remove();
            addScore(1);
        }
        targetElement.alt = PV;
    }
});