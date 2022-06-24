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
    name: "bar",
    butins: [0,1,1],
    bandits: [],
    toit: {
      butins: [0,0,0],
      bandits: []
    }
  },
  {
    index: 1,
    name: "soute",
    butins: [0,4,1],
    bandits: [],
    toit: {
      butins: [0,0,0],
      bandits: []
    }
  },
  {
    index: 2,
    name: "first class",
    butins: [0,3,1],
    bandits: [],
    toit: {
      butins: [0,0,0],
      bandits: []
    }
  },
  {
    index: 4,
    name: "dinner",
    butins: [0,3,0],
    bandits: [],
    toit: {
      butins: [0,0,0],
      bandits: []
    }
  },
  {
    index: 5,
    name: "second class",
    butins: [0,1,0],
    bandits: [],
    toit: {
      butins: [0,0,0],
      bandits: []
    }
  },
  {
    index: 6,
    name: "vip class",
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

const START_TURN = 0;
const BANDIT_TURN = 1;
const YOUR_TURN = 2;
const WAIT_TURN = 3;
const PLAY_TURN = 4;

const CARD_PHASE = 0;
const PLAY_PHASE = 1;

class Board {
    constructor() {
        console.log(banditNames);
        shuffleArray(banditNames);
        console.log(banditNames);
        this.marshalIndex = 4; // index of the wagon for the marshal
        this.bandit = new Bandit(banditNames[0]);
        this.bandit.IA = false;
        this.bandits = [this.bandit, new Bandit(banditNames[1]), new Bandit(banditNames[2]), new Bandit(banditNames[3])];
        this.wagons = [];
        this.cards = [];
        this.banditIndices = []; // list of indices for the current turn
        this.voyages = [];
        this.curTurn = 0;
        this.curBanditIndex = 0; // index of the first bandit for this turn
        this.state = START_TURN;
        this.phase = CARD_PHASE;
    }

    init() {
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
        // TODO: transform butin into 'real' butin value
        shuffleArray(this.bandits);
        this.bandits.forEach(b=>b.shuffleCards());
        this.wagons[0].bandits = [this.bandits[0].avatarIndex,this.bandits[2].avatarIndex];
        this.wagons[1].bandits = [this.bandits[1].avatarIndex,this.bandits[3].avatarIndex];

        shuffleArray(voyages);
        for( let i=0; i < 4; i++ ) {
          this.voyages.push(voyages[i]);
        }
        this.voyages.push(stop);
        console.log(this.voyages[0]);
    }

    playCard() {
      const bandit = this.bandits[this.curBanditIndex];
      const card = bandit.cards.pop();
      let visible = this.voyages[0][this.curTurn].toLowerCase() !== "tunnel";
      if( bandit.name === "ghost" && this.curTurn === 0 ) {
        visible = false;
      }
      this.cards.push({name: bandit.name, index: card, visible});
      this.curBanditIndex = this.curBanditIndex + 1;
    }

    useCard(name, cardIndex) {
      const visible = this.voyages[0][this.curTurn].toLowerCase() !== "tunnel";
      this.cards.push({name, index: this.bandit.cards[cardIndex], visible});
      const banditIndex = this.bandits.findIndex(b=>b.name === name);
      this.bandits[banditIndex].cards.splice(cardIndex, 1);
      this.curBanditIndex = this.curBanditIndex + 1;
    }

    curBanditName() {
      return this.bandits[this.curBanditIndex].name;
    }

    playState() {
      // pop last card if needed
      if( this.curTurn !== -1 ) {
        this.cards.shift();
      }
      this.curTurn = 0;
      if( this.cards.length === 0 ) {
        // move to turn state again
        // shuffle cards, ...
        newTurnButton.visible = true;
        playButton.visible = false;
        return;
      }
      // take first card
      const card = this.cards[0];
      // according to card, add buttons to enable possibilities
      switch( card.index ) {
        case 0: // tir
          // on which wagon is the bandit ?
          const wagon1 = this.findWagonIndex(card.name);
          if( wagon1.roof ) {
            uiManager.addLogger(`${card.name} fires from roof of wagon ${wagon1.wagon.name}`);
          } else {
            uiManager.addLogger(`${card.name} fires from wagon ${wagon1.wagon.name}`);
          }
          break;
        case 1: // ramasser or
          // on which wagon is the bandit ?
          const wagon2 = this.findWagonIndex(card.name);
          if( wagon2.roof ) {
            uiManager.addLogger(`${card.name} is getting gold from roof of wagon ${wagon2.wagon.name}`);
          } else {
            uiManager.addLogger(`${card.name} is getting gold from wagon ${wagon2.wagon.name}`);
          }
          break;
        case 2: // monter/descendre
          // on which wagon is the bandit ?
          const wagon3 = this.findWagonIndex(card.name);
          if( wagon3.roof ) {
            if( wagon3.wagonIndex === this.marshalIndex ) {
              uiManager.addLogger(`${card.name} cannot go down because of the marshal`);  
              // TODO: il prend un tir du marshal
            } else {
              uiManager.addLogger(`${card.name} is going down on wagon ${wagon3.wagon.name}`);
              const banditIndex = avatars[card.name];
              wagon3.wagon.toit.bandits = wagon3.wagon.toit.bandits.filter(b=>b!==banditIndex);
              wagon3.wagon.bandits.push(banditIndex);
            }
          } else {
            uiManager.addLogger(`${card.name} is going up on wagon ${wagon3.wagon.name}`);
            const banditIndex = avatars[card.name];
            wagon3.wagon.bandits = wagon3.wagon.bandits.filter(b=>b!==banditIndex);
            wagon3.wagon.toit.bandits.push(banditIndex);
          }
          
          break;
        case 3: // coup de poing
          // on which wagon is the bandit ?
          const wagon4 = this.findWagonIndex(card.name);
          // TODO: check if a bandit is present with the current one
          uiManager.addLogger(`${card.name} fights on wagon ${wagon4.wagon.name}`);
          break;
        case 4: // marshal
          uiManager.addLogger(`Marshal moves from wagon ${this.marshalIndex}`);
          break;
        case 5: // bouger
          // on which wagon is the bandit ?
          const wagon5 = this.findWagonIndex(card.name);
          if( wagon3.roof ) {
            uiManager.addLogger(`${card.name} moves from roof of wagon ${wagon5.wagon.name}`);
          } else {
            uiManager.addLogger(`${card.name} moves from wagon ${wagon5.wagon.name}`);
          }
          break;
      }
    }

    findWagonIndex(banditName) {
      const banditIndex = avatars[banditName];
      for( let i=0; i < this.wagons.length; i++ ) {
        const wagon = this.wagons[i];
        if( wagon.bandits.includes(banditIndex) ) {
          return {wagonIndex: i, wagon, roof: false};
        }
        if( wagon.toit.bandits.includes(banditIndex) ) {
          return {wagonIndex: i, wagon, roof: true};
        }
      }
      return 999;
    }

    nextState() {
      if( this.curBanditIndex === 4 ) {
        this.curTurn = this.curTurn + 1;
        this.curBanditIndex = 0;
        // was it last turn ?
        if( this.curTurn === this.voyages[0].length ) {
          this.phase = PLAY_PHASE;
          // replace next button by play button
          nextButton.visible = false;
          playButton.visible = true;
        }
      }
      if( this.phase === CARD_PHASE ) {
        if( this.curBanditName() === this.bandit.name ) {
          this.state = YOUR_TURN;
          uiManager.addLogger("Your turn");
          plus3Button.enabled = true;
        } else {
          this.state = BANDIT_TURN;
          plus3Button.enabled = false;
          uiManager.addLogger(`${this.curBanditName()} turn`);
        }
        if( this.state === BANDIT_TURN ) {
          this.playCard();
          // bandit is playing, disable all buttons/cards except the 'next' button
          this.state = WAIT_TURN;
          nextButton.visible = true;
        } else if( this.state === YOUR_TURN ) {
          nextButton.visible = false;
        }
      } else { // PLAY_PHASE
        this.curTurn = -1;
        this.playState();
      }
    }
}