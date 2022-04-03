class Server() {
    constructor() {

    }

    /**
     * Creates a game
     * @returns the id of the created game
     */
    function createGame() {
        const id = 0;
        return id;
    }

    /**
     * Connects player to a given game
     * @param gameId id of the game to connect to
     * @param playerId id of player
     * @returns true if connexion is possible
     */
    function connect(gameId, playerId) {
        return true;
    }

    /**
     * Starts a game
     * @param gameId id of the game to start
     * @returns true if game can start
     */
    function start(gameId) {
        // start the game
        return true;
    }

    /**
     * Gets the board for the given player
     * @param gameId id of the game
     * @param playerId id of the player
     */
    function getBoard(gameId, playerId) {
        // TODO
    }

    /**
     * Plays an action for given player
     * @param action action to play
     * @param playerId id of player
     */
    function play(action, playerId) {

    }
}