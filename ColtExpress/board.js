function shuffleArray(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = this.randomInt(i + 1);
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
}

function randomInt(i) {
    return Math.floor(Math.random() * i);
}

const avatars = {
  cheyenne: 0,
  belle: 1,
  doc: 2,
  tuco: 3,
  ghost: 4,
  django: 5
}
const banditNames = ["cheyenne", "belle", "doc", "tuco", "ghost", "django"];

class Bandit {
    constructor(name) {
        this.IA = true;
        this.allCards = [0,0,1,1,2,2,3,4,5,5]; 
        this.cards = []; // cards for the current turn
        this.name = name;
        this.gun = 6;
        this.talonIndex = 0;
        this.avatarIndex = avatars[name];
    }

    shuffleCards() {
        shuffleArray(this.allCards);
        this.cards = [];
        this.talonIndex = 0;
        this.moreCards();
        this.moreCards();
    }

    /**
     * Adds 3 more cards
     */
    moreCards() {
      for( let i=0; i < 3; i++ ) {
        this.cards.push(this.allCards[i+this.talonIndex]);
      }
      this.talonIndex += 3;
    }
}

const MALETTE = 0;
const SAC = 1;
const RUBIS = 2;

const wagons = [
  {
    index: 0,
    butins: [0,1,1],
    bandits: [],
    toit: {
      butins: [0,0,0],
      bandits: []
    }
  },
  {
    index: 1,
    butins: [0,4,1],
    bandits: [],
    toit: {
      butins: [0,0,0],
      bandits: []
    }
  },
  {
    index: 2,
    butins: [0,3,1],
    bandits: [],
    toit: {
      butins: [0,0,0],
      bandits: []
    }
  },
  {
    index: 4,
    butins: [0,3,0],
    bandits: [],
    toit: {
      butins: [0,0,0],
      bandits: []
    }
  },
  {
    index: 5,
    butins: [0,1,0],
    bandits: [],
    toit: {
      butins: [0,0,0],
      bandits: []
    }
  },
  {
    index: 6,
    butins: [0,0,3],
    bandits: [],
    toit: {
      butins: [0,0,0],
      bandits: []
    }
  }
];

const voyages = [
  ["empty","tunnel","empty","empty"],
  ["empty","empty","empty","empty"],
  ["empty","empty","tunnel","reverse"],
  ["empty","tunnel","empty","tunnel","empty"],
  ["empty","empty","tunnel","empty","empty"],
  ["empty","tunnel","double","empty"],
  ["empty","double","empty"]
];
const stop = ["Empty","Empty","Tunnel","Empty"];

class Board {
    constructor() {
        console.log(banditNames);
        shuffleArray(banditNames);
        console.log(banditNames);
        this.bandit = new Bandit(banditNames[0]);
        this.bandit.IA = false;
        this.bandits = [this.bandit, new Bandit(banditNames[1]), new Bandit(banditNames[2]), new Bandit(banditNames[3])];
        this.wagons = [];
        this.cards = [];
        this.voyages = [];
    }

    init() {
        this.bandit.shuffleCards();
        shuffleArray(wagons);
        wagons.forEach(w=>{
            if( this.wagons.length < 4 ) {
                this.wagons.push(w);
            }
        });
        this.wagons.push({
          index: 3,
          butins: [1,0,0],
          bandits: [],
          toit: {
            butins: [0,0,0],
            bandits: []
          }
        });
        shuffleArray(this.bandits);
        this.wagons[0].bandits = [this.bandits[0].avatarIndex,this.bandits[2].avatarIndex];
        this.wagons[1].bandits = [this.bandits[1].avatarIndex,this.bandits[3].avatarIndex];

        shuffleArray(voyages);
        for( let i=0; i < 4; i++ ) {
          this.voyages.push(voyages[i]);
        }
        this.voyages.push(stop);
        console.log(this.voyages[0]);
    }

    useCard(name, cardIndex) {
      this.cards.push({name, index: cardIndex});
      const banditIndex = this.bandits.findIndex(b=>b.name === name);
      this.bandits[banditIndex].cards.splice(cardIndex, 1);
    }
}