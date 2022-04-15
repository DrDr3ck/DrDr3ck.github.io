async function fetchAsync (url) {
	let response = await fetch(url);
	let data = await response.json();
	return data;
}

class ServerApi {
    constructor() {        
    }

    async startGame(gameId) {
        const data = await fetchAsync(`http://localhost:5000/start?gameId=${gameId}`);
        return data;
    }

    async connectPlayer(gameId, playerId) {
        const data = await fetchAsync(`http://localhost:5000/connect?gameId=${gameId}&playerId=${playerId}`);
        return data;
    }

    async playCard(type, card, playerId) {
        const data = await fetchAsync(`http://localhost:5000/play?type=${type}&cardColor=${card.color}&cardValue=${card.value}&playerId=${playerId}`);
        return data;
    }

    async createGame() {
        const data = await fetchAsync("http://localhost:5000/create");
        console.log(data);
        return data.gameId;
    }

    async getCurrentPlayerId() {
        const data = await fetchAsync("http://localhost:5000/a.html?action=playerId");
		console.log(data);
        return data.currentPlayerId;
    }

    async getPlayer(id) {
        const data = await fetchAsync(`http://localhost:5000/player?action=player&playerId=${id}`);
		console.log(data);
        return data.currentPlayerId;
    }

    async getBoard(gameId, playerId, boardStep) {
        const data = await fetchAsync(`http://localhost:5000/board?gameId=${gameId}&playerId=${playerId}&boardStep=${boardStep}`);
        return data;
    }
}