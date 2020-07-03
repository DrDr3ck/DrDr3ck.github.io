class AudioController {
    constructor() {
        this.bgMusic = new Audio('Assets/Audio/creepy.mp3');
        this.flipSound = new Audio('Assets/Audio/flip.wav');
        this.matchSound = new Audio('Assets/Audio/match.wav');
        this.victorySound = new Audio('Assets/Audio/victory.wav');
        this.gameOverSound = new Audio('Assets/Audio/gameover.wav');
        this.bgMusic.volume = 0.3;
        this.bgMusic.loop = true;
    }

    startMusic() {
        this.bgMusic.play();
    }
    stopMusic() {
        this.bgMusic.pause();
        this.bgMusic.currentTime = 0;
    }
    flip() {
        this.flipSound.play();
    }
    match() {
        this.matchSound.play();
    }
    victory() {
        this.stopMusic();
        this.victorySound.play();
    }
    gameOver() {
        this.stopMusic();
        this.gameOverSound.play();
    }
}

class MixOrMatch {
    constructor(totalTime, cards) {
        this.cards = cards;
        this.totalTime = totalTime;

        this.timer = document.getElementById("time-remaining");
        this.flips = document.getElementById("flips");

        this.audio = new AudioController();
    }

    startGame() {
        this.cardToCheck = null;
        this.totalFlips = 0;
        this.timeRemaining = this.totalTime;
        this.matchedCards = [];
        this.busy = true;

        setTimeout(()=>{
            this.audio.startMusic();
            this.shuffleCards();
            this.countDown = this.startCountDown();
            this.busy = false;
        }, 500);
        this.hideCards();
        this.timer.innerText = this.timeRemaining;
        this.flips.innerText = this.totalFlips;
    }

    hideCards() {
        this.cards.forEach(card=>{
            card.classList.remove('visible');
            card.classList.remove('matched');
        });
    }

    startCountDown() {
        return setInterval(()=>{
            console.log("startCountDown: "+this.timeRemaining);
            this.timeRemaining--;
            this.timer.innerText = this.timeRemaining;
            if( this.timeRemaining === 0 ) {
                this.gameOver();
            }
        }, 1000);
    }

    canFlipCard(card) {
        return !this.busy && !this.matchedCards.includes(card) && card !== this.cardToCheck;
    }

    flipCard(card) {
        if( !this.canFlipCard(card) ) {
            return;
        }
        this.audio.flip();
        this.totalFlips++;
        this.flips.innerText = this.totalFlips;
        card.classList.add('visible');

        if( this.cardToCheck ) { // not null
            this.checkForCardMatch(card);
        } else {
            this.cardToCheck = card;
        }
    }

    checkForCardMatch(card) {
        const card2 = this.cardToCheck;
        if( this.getCardValue(card2) === this.getCardValue(card) ) {
            this.matchedCards.push(card);
            this.matchedCards.push(card2);
            card.classList.add('matched');
            card2.classList.add('matched');
            this.audio.match();
            if( this.matchedCards.length == this.cards.length ) {
                this.victory();
            }
        } else {
            this.busy = true;
            setTimeout(()=>{
                card.classList.remove('visible');
                card2.classList.remove('visible');
                this.busy = false;
            },1000);
        }
        this.cardToCheck = null;
    }

    getCardValue(card) {
        return card.getElementsByClassName('card-value')[0].src;
    }

    gameOver() {
        clearInterval(this.countDown);
        this.audio.gameOver();
        document.getElementById('game-over-text').classList.add('visible');
        this.totalTime += 10;
    }

    victory() {
        clearInterval(this.countDown);
        this.audio.victory();
        document.getElementById('victory-text').classList.add('visible');
        this.totalTime -= 10;
    }

    shuffleCards() {
        for( let i = this.cards.length-1; i >= 1; i-- ) {
            const j = Math.floor(Math.random()*(i+1));
            this.cards[j].style.order = i;
            this.cards[i].style.order = j;
        }
    }
}

function ready() {
    let overlays = Array.from(document.getElementsByClassName('overlay-text'));
    let cards = Array.from(document.getElementsByClassName('card'));
    let game = new MixOrMatch(100, cards);

    overlays.forEach(overlay => {
        overlay.addEventListener('click', () => {
            overlay.classList.remove('visible');
            game.startGame();
        });
    });

    cards.forEach(card => {
        card.addEventListener('click', () => {
            game.flipCard(card);
        });
    });
}

if( document.readyState === 'loading' ) {
    document.addEventListener('DOMContentLoaded', ready());
} else {
    ready();
}