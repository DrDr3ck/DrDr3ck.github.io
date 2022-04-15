// launch it by calling: node server.js

const { fstat } = require('fs');
const http = require('http');

const hostname = "localhost";
const port = 5000;

const CardColor = {
    Fusee: "AFusee",
    Blue: "Blue",
    Green: "Green",
    Red: "Red",
    Yellow: "Yellow"
}

/**
 * Orders cards
 * @param cards cards to order
 * @returns ordered cards
 */
 function orderCards(cards) {
	cards.sort((a,b) => a.value > b.value);
	cards.sort((a,b) => a.color > b.color);
	return cards;
}

class Board {
    constructor(maxPlayer) {
        this.cards = [];
        this.maxPlayer = maxPlayer;
    }

    /**
     * Initializes the list of cards (+shuffle)
     */
    init() {
        this.cards = [];
        for( let i = 0 ; i < 9; i++) {
            this.addCard(CardColor.Blue, i+1);
            this.addCard(CardColor.Red, i+1);
            this.addCard(CardColor.Yellow, i+1);
            // pas de cartes vertes si 3 joueurs uniquement
            if( this.maxPlayer != 3 ) {
                this.addCard(CardColor.Green, i+1);
            }
        }
        for( let i = 0 ; i < 3; i++) {
            this.addCard(CardColor.Fusee, i+1);
        }
        // pas de Fusee 4 si 3 joueurs uniquement
        if( this.maxPlayer != 3 ) {
            this.addCard(CardColor.Fusee, 4);
        }
        this.cards.sort((a, b) => 0.5 - Math.random());
        this.cards.sort((a, b) => 0.5 - Math.random());
        this.cards.sort((a, b) => 0.5 - Math.random());
    }

    /**
     * Distributes cards to the given number of players
     * @param playerId id of player
     * @return array with cards for each player
     */
    distribute(playerId) {
        const maxCards = this.cards.length / this.maxPlayer;
        let cards = this.cards.slice(maxCards*playerId, maxCards*playerId+maxCards);
        cards = orderCards(cards);
        return cards;
    }

    /**
     * Adds given card to list of cards
     * @param color color of the card
     * @param value value of the card
     */
    addCard(color, value) {
        this.cards.push({color: color, value: value});
    }
}

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
            this.id = 100; // TODO: Math.floor(Math.random() * 899) + 100;  // entre 100 et 999
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
        if( gameId <= 0 ) {
            return "no game created";
        }
        if( !this.checkGameId(gameId) ) {
            // wrong gameId, cannot connect
            return "this game id does not exist";
        }
        if( playerId === -1 ) {
            playerId = this.players.length;
            console.log("new player", playerId);
        }
        // check if player is not already connected
        if( this.players.find(p=>p.playerId === playerId) ) {
            return "player already connected";
        }
        if( this.players.length >= this.maxPlayers ) {
            // cannot have an extra player, returns false
            return "too many players connected";
        }
        // Add new player
        this.players.push({playerId, cards: [], missions: [], communication: { card: null, state: "green"}, captain: false, folds: []});
        return {playerId};
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
        if( !this.checkGameId(gameId) ) {
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
        if( this.board !== null ) {
            // already started: return true
            return true;
        }
        if( !this.checkGameId(gameId) ) {
            return false;
        }
        if( this.players.length < 4 ) { // should be 3 but for now, game only work with 4 players
            return false;
        }
        // create board
        this.board = new Board(this.players.length);
        this.board.init();
        // distribute cards and define captain
        for (var i = 0; i < this.players.length; i++) {
            const cards = this.board.distribute(i);
            this.players[i].cards = cards;
            const isCaptain = cards.find(card => card.value == this.maxPlayers && card.color == CardColor.Fusee);
            this.players[i].captain = isCaptain;
            if( isCaptain ) {
                this.captainId = this.players[i].playerId;
            }
        }
        // DEBUG force player 0 to be the captain
        this.players[this.captainId].captain = false;
        this.players[0].captain = true;
        this.captainId = 0;
        // END DEBUG
        
        // choose first mission
        // get a random card (not a Fusee)
        var randomCard = {color: CardColor.Fusee};
        while( randomCard.color === CardColor.Fusee ) {
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
            this.currentPlayerId = this.captainId;
        }
        return true;
    }

    /**
     * Gets the board for the given player
     * @param gameId id of the game
     * @param playerId id of the player
     */
    getBoard(gameId, playerId, boardStep) {
        if( !this.checkGameId(gameId) ) {
            return null;
        }
        const playerIndex = this.getPlayerIndex(playerId);
        if( playerIndex < 0 ) {
            return null;
        }
        if( boardStep === this.currentBoardStep ) {
            // board has not changed, no need to get it
            return null;
        }
        const otherPlayers = [];
        for( var i = playerIndex+1; i < playerIndex+this.players.length; i++) {
            const curPlayerIndex = i % this.players.length;
            otherPlayers.push(
                {
                    playerId: this.players[curPlayerIndex].playerId,
                    missions: this.players[curPlayerIndex].missions,
                    communication: this.players[curPlayerIndex].communication,
                    folds: this.players[curPlayerIndex].folds,
                    captain: this.players[curPlayerIndex].captain
                }
            );
        }
        return {
            ...this.players[playerIndex],
            allMissions: this.missions,
            fold: this.fold,
            maxPlayers: this.maxPlayers,
            boardStep: this.currentBoardStep,
            currentPlayerId: this.currentPlayerId,
            otherPlayers
        };
    }

    removeCard(card, playerId) {
        const player = this.getPlayer(playerId);
        player.cards = player.cards.filter(c => c.color !== card.color || c.value !== card.value);
    }

    addCardInFold(card, playerId) {
        this.fold.push({card, playerId});
    }

    /**
     * Returns true if otherCard is better than mainCard
     * @param otherCard 
     * @param mainCard 
     */
    isBetterCard(otherCard, mainCard) {
        if( otherCard.color !== mainCard.color ) {
            if( otherCard.color === CardColor.Fusee ) {
                return true;
            }
            // mainCard has a different color than otherCard, so mainCard wins
            return false;
        }
        // same color
        return otherCard.value > mainCard.value;
    }

    /**
     * Plays an action for given player
     * @param action action to play
     * @param playerId id of player
     * @return the player that wins the turn or -1 if turn is not finished
     */
    playCard(action, playerId) {
        if( this.fold.length === this.maxPlayers ) {
            // cannot play an extra card
            return -1;
        }
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
        // next player OR get the fold
        this.currentPlayerId = (this.currentPlayerId+1) % this.maxPlayers;

        // end of turn
        if( this.fold.length === this.maxPlayers ) {
            // who win the current fold ?
            let mainCard = this.fold[0].card;
            let winnerId = this.fold[0].playerId;
            for( let foldIndex = 1; foldIndex < this.fold.length; foldIndex++ ) {
                if( this.isBetterCard(this.fold[foldIndex].card, mainCard) ) {
                    mainCard = this.fold[foldIndex].card;
                    winnerId = this.fold[foldIndex].playerId;
                }
            }
            // remove all cards from the fold
            setTimeout(()=>{this.fold = [];this.currentBoardStep = this.currentBoardStep + 1;}, 3000);

            this.currentPlayerId = winnerId;
            return winnerId;
        }
        return -1;
    }

    addMissionCardToPlayer(mission, playerId) {
        const player = this.getPlayer(playerId);
        player.missions.push(mission);
    }

    removeCardFromMission(mission) {
        const missionIndex = this.missions.findIndex(m => m.card.value === mission.card.value && m.card.color === mission.card.color);
        this.missions.splice(missionIndex,1);
    }
}

const getValueOf = (name, url) => {
    // find name index in url
    const nameIdx = url.indexOf(name);
    if( nameIdx < 0 ) {
        return "";
    }
    const str = url.substring(nameIdx+name.length+1);
    const separatorIdx = str.indexOf("&");
    if( separatorIdx < 0 ) {
        return str;
    }
    return str.substring(0,separatorIdx);
}

const myServer = new Server();

const server = http.createServer((req, res) => {
    res.statusCode = 200;
    console.log("method", req.method);
    console.log("url", req.url);

    res.setHeader("Content-Type", "application/json");
    res.setHeader('Access-Control-Allow-Origin', req.headers.origin);
    res.setHeader("Access-Control-Allow-Headers", "Authorization, Cache-Control, Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers");

    if( req.url === "/create") {
        const id = myServer.createGame();
        res.end(JSON.stringify({gameId: id}));
        return;
    } else if( req.url.startsWith("/connect")) {
        const gameId = parseInt(getValueOf("gameId", req.url));
        const playerId = parseInt(getValueOf("playerId", req.url));
        const message = myServer.connectPlayer(gameId, playerId);
        if( typeof message === "string")  {
            console.log(message);
            res.end(JSON.stringify({status: false, msg: message}));
            return;
        }
        res.end(JSON.stringify({status: true, msg: "", playerId: message.playerId}));
        return;
    } else if( req.url.startsWith("/play")) {
        // type=${type}&cardColor=${card.color}&cardValue=${card.value}&playerId=${playerId}
        const playerId = parseInt(getValueOf("playerId", req.url));
        const cardValue = parseInt(getValueOf("cardValue", req.url));
        const type = getValueOf("type", req.url);
        const cardColor = getValueOf("cardColor", req.url);
        const result = myServer.playCard({type, card: {color: cardColor, value: cardValue}}, playerId);
        res.end(JSON.stringify({status: true}));
    } else if( req.url.startsWith("/start")) {        
        const gameId = parseInt(getValueOf("gameId", req.url));
        const result = myServer.startGame(gameId);
        res.end(JSON.stringify({status: result}));
    } else if( req.url.startsWith("/board")) {
        const gameId = parseInt(getValueOf("gameId", req.url));
        const playerId = parseInt(getValueOf("playerId", req.url));
        const boardStep = parseInt(getValueOf("boardStep", req.url));
        const result = myServer.getBoard(gameId, playerId, boardStep);
        res.end(JSON.stringify(result));
    }
    /*
    if( req.method === "GET" ) {
        if( req.data) {
            let body = "";
            req.on("data", chunk => {body+=chunk.toString();});
            console.log(body);
            const json = JSON.parse(body);
            console.log(json);
        }
        res.end(JSON.stringify({cards: [{color: "green", value: 1}]}));
    } else if( req.method === "POST" ) {
        console.log("POST", req.data);
    }
    */
    res.statusCode = 400;
})

server.listen(port, hostname, () => {
    console.log(`Server running ${hostname}:${port}`);
});