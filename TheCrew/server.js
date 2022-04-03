class Server() {
    constructor() {
        this.cards = [];
        this.fold = [];
        this.missions = [];
        this.players = [];
        this.id = -1;
        this.maxPlayers = 4; // should be 5 but still need to implement it
        this.board = null;

        this.currentBoardStep = -1;
    }

    /**
     * Creates a game
     * @returns the id of the created game
     */
    function createGame() {
        // check if a game has already started
        if( this.id === -1 ) {
            this.id = Math.floor(Math.random() * 100000);
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
    function connectPlayer(gameId, playerId) {
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

    function getPlayerIndex(playerId) {
        return this.players.findIndex(p=>p.playerId === playerId);
    }

    function checkGameId(gameId) {
        return gameId === this.id && gameId !== -1;
    }

    /**
     * Starts a game if enough players
     * @param gameId id of the game to start
     * @returns true if game can start
     */
    function startGame(gameId, missionId) {
        if( !checkGameId(gameId) ) {
            return false;
        }
        this.currentBoardStep = 0;
        return true;
    }

    /**
     * Gets the board for the given player
     * @param gameId id of the game
     * @param playerId id of the player
     */
    function getBoard(gameId, playerId, boardStep) {
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
            fold: this.fold,
            boardStep: this.currentBoardStep
        };
    }

    /**
     * Plays an action for given player
     * @param action action to play
     * @param playerId id of player
     */
    function playCard(action, playerId) {
        if( action.type === "play" ) {
            // TODO: play a card
        }
        this.currentBoardStep = this.currentBoardStep + 1;
    }
}