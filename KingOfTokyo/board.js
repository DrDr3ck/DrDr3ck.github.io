class Monster {
    constructor(name, maxHealth, health, victory=0, inTokyo=false, energy=0) {
        this.name = name;
        this.maxHealth = maxHealth;
        this.maxVictoryCount = this.maxHealth===12 ? 2 : 3;
        this.health = health;
        this.victory = victory;
        this.inTokyo = inTokyo;
        this.energy = 0;
    }

    isDead() {
        return this.health === 0;
    }

    isEnemy() {
        return this.maxHealth === 12;
    }

    moveIn() {
        this.victory = this.victory + 1;
        this.inTokyo = true;
    }

    moveOut() {
        this.inTokyo = false;
    }

    alreadyOnTokyo() {
        this.victory = this.victory + 2;
    }

    addEnergy(energy) {
        this.energy = this.energy + energy;
    }

    addDamage(damage) {
        this.health = Math.max(0, this.health-damage);
        if( this.isEnemy() && this.health < 5 ) {
            this.moveOut();
        }
    }

    addHealth(health) {
        this.health = Math.min(this.maxHealth, this.health+health);
    }

    addVictory(value, count) {
        if( count >= this.maxVictoryCount ) {
            this.victory = this.victory + value + (count-this.maxVictoryCount);
        }
    }
}

class Board {
    constructor() {
        this.curMonsterIndex = Math.floor(Math.random()*3);
        this.monsters = [new Monster("Gigazaur", 10, 10), new Monster("The King", 12, 12), new Monster("Alienoid", 12, 12)];
        this.role = 3;
        this.askMoveOut = false;
    }

    prevMonster() {
        return this.monsters[(this.curMonsterIndex+2)%3];
    }
    curMonster() {
        return this.monsters[this.curMonsterIndex];
    }
    nextMonster() {
        return this.monsters[(this.curMonsterIndex+1)%3];
    }

    nextTurn() {
        this.curMonsterIndex = (this.curMonsterIndex+1)%3;
        if( this.curMonster().isDead() ) {
            this.curMonsterIndex = (this.curMonsterIndex+1)%3;
        }
        this.role = this.curMonsterIndex === 0 ? 3 : 1;
        const monster = this.curMonster();
        if( monster.inTokyo ) {
            monster.alreadyOnTokyo();
        }
    }

    resolve(dice) {
        const fight = dice.fight;
        const health = dice.health;
        const energy = dice.energy;
        const victoryValue = dice.victoryValue;
        const victoryCount = dice.victoryCount;
        const monster = this.curMonster();
        const result ={};
        if( !monster.inTokyo ) {
            monster.addHealth(health);
            result.health = health;
        }
        result.fight = fight;
        if( monster.inTokyo !== this.nextMonster().inTokyo ) {
            //this.nextMonster().getDamage(fight);
        }
        if( monster.inTokyo !== this.prevMonster().inTokyo ) {
            //this.prevMonster().getDamage(fight);
        }
        //monster.getEnergy(energy);
        result.energy = energy;
        //monster.getVictory(victoryValue, victoryCount);
        result.victory = {value: victoryValue, count: victoryCount};
        return result;
    }

    moveMonster() {
        const monster = this.curMonster();
        if( !monster.inTokyo && !this.nextMonster().inTokyo && !this.prevMonster().inTokyo ) {
            return true;
        }
        return false;
    }
}