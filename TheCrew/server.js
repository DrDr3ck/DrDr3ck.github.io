const ServerPhase = {
    BEFORE_CREATION: "CREATION",
    ACCEPT_CONNEXION: "CONNEXION",
    CHOOSE_MISSIONS: "MISSIONS",
    STARTED: "START",
    END: "END",
}

class Server {
    constructor() {
        this.state = ServerPhase.BEFORE_CREATION;
        this.cards = [];
        this.fold = [];
        this.missions = [];
        this.players = [];
        this.captainId = -1;
        this.id = -1;
        this.maxPlayers = 4; // should be 5 but still need to implement it
        this.board = null;

        this.currentBoardStep = -1;
        this.currentPlayerId = -1;
    }

    /**
     * Creates a game
     * @returns the id of the created game
     */
     createGame() {
        // check if a game has already started
        if( this.state === ServerPhase.BEFORE_CREATION ) {
            this.id = Math.floor(Math.random() * 100000);
            this.state = ServerPhase.ACCEPT_CONNEXION;
        }       
        return this.id;
    }

    /**
     * Connects player to a given game
     * @param gameId id of the game to connect to
     * @param playerId id of player
     * @returns true if player can connect or is already connected,
     * false if max players is already reached
     */
    connectPlayer(gameId, playerId) {
        if( !checkGameId(gameId) ) {
            // wrong gameId, cannot connect
            return false;
        }
        if( this.players.length >= this.maxPlayers ) {
            // cannot have an extra player, returns false
            return false;
        }
        // check if player is not already connected
        if( !this.players.find(p=>p.playerId === playerId) ) {
            // Add new player
            this.players.push({playerId, cards: [], missions: [], communication: { card: null, state: "green"}, captain: false});
        }
        return true;
    }

    getPlayerIndex(playerId) {
        return this.players.findIndex(p=>p.playerId === playerId);
    }

    getPlayer(playerId) {
        return this.players[this.getPlayerIndex(playerId)];
    }

    /**
     * Checks if gameID is valid
     * @param gameId id of the game
     * @returns true if gameId corresponds to the current server id
     */
    checkGameId(gameId) {
        return gameId === this.id && gameId !== -1 && this.state === ServerPhase.ACCEPT_CONNEXION;
    }

    /**
     * Gets the number of players connected to the given game
     * @param gameId id of the game
     * @returns number of players connected
     */
    playersConnected(gameId) {
        if( !checkGameId(gameId) ) {
            return 0;
        }
        return this.players.length;
    }

    /**
     * Starts a game if enough players
     * @param gameId id of the game to start
     * @returns true if game can start
     */
    startGame(gameId, missionId) {
        if( !checkGameId(gameId) ) {
            return false;
        }
        if( this.players.length < 4 ) { // should be 3 but for now, game only work with 4 players
            return false;
        }
        // create board
        this.board = new Board(this.players.length);
        // distribute cards and define captain
        for (var i = 0; i < this.players.length; i++) {
            const cards = board.distribute(i);
            this.players[i].cards = cards;
            const isCaptain = cards.find(card => card.value == maxPlayers && card.color == CardColor.Fusee);
            this.players[i].captain = isCaptain;
            if( isCaptain ) {
                this.captainId = this.players[i].playerId;
            }
        }
        
        // choose first mission
        // get a random card (not a Fusee)
        let randomCard = null;
        while( randomCard === null || randomCard.color === CardColor.Fusee ) {
            randomCard = this.board.cards[Math.floor((Math.random()*this.board.cards.length))];
        }
        this.state === ServerPhase.CHOOSE_MISSIONS;
        // DEBUG: missionId is always 1
        this.missions.push({card: randomCard, rule: null, playerId: this.captainId});
        this.addMissionCardToPlayer(this.missions[0], this.captainId);
        this.removeCardFromMission(this.missions[0]);
        // END DEBUG
        
        this.currentBoardStep = 0;
        if( this.missions.length === 0 ) {
            this.state === ServerPhase.STARTED;
        }
        return true;
    }

    /**
     * Gets the board for the given player
     * @param gameId id of the game
     * @param playerId id of the player
     */
    getBoard(gameId, playerId, boardStep) {
        if( !checkGameId(gameId) ) {
            return null;
        }
        const playerIndex = getPlayerIndex(playerId);
        if( playerIndex < 0 ) {
            return null;
        }
        if( boardStep === this.currentBoardStep ) {
            // board has not changed, no need to get it
            return null;
        }
        return {
            ...this.players[playerIndex],
            missions: this.missions,
            fold: this.fold,
            boardStep: this.currentBoardStep,
            currentPlayerId: this.currentPlayerId,
            otherPlayers: [] // need to see missions and communications
        };
    }

    /**
     * Plays an action for given player
     * @param action action to play
     * @param playerId id of player
     */
    playCard(action, playerId) {
        if( action.type === "card" ) {
            // play a card
            this.removeCard(action.card, playerId);
            this.addCardInFold(action.card, playerId);
        } else if( action.type === "mission") {
            // a player chooses a mission card
            this.addMissionCardToPlayer(action.mission, playerId);
            this.removeCardFromMission(action.mission);
            if( this.missions.length === 0 ) {
                this.state === ServerPhase.STARTED;
                this.currentPlayerId = this.captainId;
            }
        }
        this.currentBoardStep = this.currentBoardStep + 1;
    }

    addMissionCardToPlayer(mission, playerId) {
        const player = getPlayer(playerId);
        player.missions.push(mission);
    }

    removeCardFromMission(mission) {
        const missionIndex = this.missions.findIndex(m => m.card.value === mission.card.value && m.card.color === mission.card.color);
        this.missions.splice(missionIndex,1);
    }
}