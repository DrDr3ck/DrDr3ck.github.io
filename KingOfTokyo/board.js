class Monster {
    constructor(health, victory=0, inTokyo=false) {
        this.health = health;
        this.victory = victory;
        this.inTokyo = inTokyo;
    }
}

class Board {
    constructor() {
        this.curMonsterIndex = Math.floor(Math.random()*3);
        this.monsters = [new Monster(10), new Monster(12), new Monster(12)];
    }

    curMonster() {
        return this.monsters[this.curMonsterIndex];
    }

    nextMonster() {
        this.curMonsterIndex = (this.curMonsterIndex+1)%3;
    }
}