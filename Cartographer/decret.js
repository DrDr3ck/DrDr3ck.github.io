const EMPTYCASE = ' ';
const FORESTCASE = 0;
const CITYCASE = 1;
const FIELDCASE = 2;
const WATERCASE = 3;
const MONSTERCASE = 4;
const MONTAGNE = "M"; // ou -M

const NDV = -9999;

/**
 * 
 * @param type type of decret ("forest", "zone", "ville", "champs")
 * @param occurrence occurrence in the list of decret of a given type
 */
function countPointsForDecret(board, type, occurrence) {
    if( type === "champs") {
        if( occurrence === 0 ) {
            // vallee des mages
            return countValleeMages(board);
        } else if( occurrence === 1 ) {
            // canaux d irrigation
            return countCanauxIrrigation(board);
        } else if( occurrence === 2 ) {
            // grenier doré
            return countGrenierDore(board, templePositions);
        } else if( occurrence === 3 ) {
            // montee des eaux
            return countMonteeDesEaux(board);
        }
    }
    if( type === "forest") {
        if( occurrence === 0 ) {
            // arbres vigies
            return countArbreVigie(board);
        } else if( occurrence === 1 ) {
            // bois de la sentinelle
            return countBoisSentinelle(board);
        } else if( occurrence === 2 ) {
            // foret des hauts plateaux
            return countForetHautsPlateaux(board);
        } else if( occurrence === 3 ) {
            // chemin verdoyant
            return countCheminVerdoyant(board);
        }
    }
    if( type === "zone") {
        if( occurrence === 0 ) {
            // frontieres
            return countFrontieres(board);
        } else if( occurrence === 1 ) {
            // baronnie perdue
            return countBaronniePerdue(board);
        } else if( occurrence === 2 ) {
            // route brisee
            return countRouteBrisee(board);
        } else if( occurrence === 3 ) {
            // chaudrons
            return countChaudrons(board);
        }
    }
    if( type === "ville") {
        if( occurrence === 0 ) {
            // grande cite
            return countGrandeCite(board);
        } else if( occurrence === 1 ) {
            // plaines de l or vert
            return countPlainesOrVert(board);
        } else if( occurrence === 2 ) {
            // places fortes
            return countPlacesFortes(board);
        } else if( occurrence === 3 ) {
            // remparts
            return countRemparts(board);
        }
    }
    return NDV;
}

function neighborhood(board,i,j) {
    let count = 0;
    if( i === 0 || board[i-1][j].value !== EMPTYCASE ) count++;
    if( i === board.length-1 || board[i+1][j].value !== EMPTYCASE ) count++;
    if( j === 0 || board[i][j-1].value !== EMPTYCASE ) count++;
    if( j === board.length-1 || board[i][j+1].value !== EMPTYCASE ) count++;
    return count;
}

function neighborhoodType(board,i,j) {
    const neighbors = [];
    if( i > 0 && board[i-1][j].value !== EMPTYCASE ) {
        neighbors.push(board[i-1][j].value);
    }
    if( i < board.length-1 && board[i+1][j].value !== EMPTYCASE ) {
        neighbors.push(board[i+1][j].value);
    }
    if( j > 0 && board[i][j-1].value !== EMPTYCASE ) {
        neighbors.push(board[i][j-1].value);
    }
    if( j < board.length-1 && board[i][j+1].value !== EMPTYCASE ) {
        neighbors.push(board[i][j+1].value);
    }
    return neighbors;
}

function isOnEdge(board, i,j) {
    if( i === 0 || j === 0 ) {
        return true;
    }
    if( i === board.length-1 || j === board.length-1 ) {
        return true;
    }
    return false;
}

/**
 * Count number of points for 'Frontieres'
 * 1 point pour chaque ligne ou colonne completement remplie
 */
function countFrontieres(board) {
    let count = 0;
    for( let j = 0; j< board.length; j++) {
        const row = board[j];
        if( row.every(r=>r.value !== EMPTYCASE) ) {
            count++;
        }
        let col = 0;
        for( let i = 0; i< board.length; i++) {
            if( board[i][j].value !== EMPTYCASE ) {
                col++;
            }
        }
        if( col === board.length ) {
            count++;
        }
    }
    return count*6;
}

/**
 * 1 point par case vide completement entourée (board compris)
 */
function countChaudrons(board) {
    let count = 0;
    for( let j = 0; j< board.length; j++) {
        for( let i = 0; i< board.length; i++) {
            if( board[i][j].value === EMPTYCASE && neighborhood(board,i,j) === 4 ) {
                count++;
            }
        }
    }
    return count;
}

/**
 * 3 points pour chaque diagonale de cases remplies du bord gauche au bord du bas
 */
function countRouteBrisee(board) {
    let count = 0;
    for( let i = 0; i <= board.length-1; i++) {
        let all = true;
        for( let j=0; j < i+1; j++) {
            if( board[i-j][board.length-j-1].value === EMPTYCASE ) {
                all = false;
                break;
            }
        }
        if( all ) {
            count+=3;
        }
    }
    return count;
}

function getBiggerSquare(board, i, j) {
    let size = 0;
    if( board[i][j].value === EMPTYCASE ) {
        return size;
    }
    size++;
    while( i+size < board.length && j+size < board.length ) {
        if( board[i+size][j+size].value === EMPTYCASE ) {
            return size;
        }
        for( let ij=0; ij<=size; ij++) {
            if( board[i+size][j+ij].value === EMPTYCASE ) {
                return size;
            }
            if( board[i+ij][j+size].value === EMPTYCASE ) {
                return size;
            }
        }
        size++;
    }
    return size;
}

/**
 * 3 points pour chaque case constituant l un des bords du plus grand carre rempli de cases
 */
function countBaronniePerdue(board) {
    let biggerSquare = 0;
    for( let i = 0; i< board.length; i++) {
        for( let j=0; j < board.length; j++) {
            const curSquare = getBiggerSquare(board,i,j);
            if( curSquare > biggerSquare ) {
                biggerSquare = curSquare;
            }
        }
    }
    return biggerSquare*3;
}

/**
 * 1 point par case foret completement entourée (board compris)
 */
function countArbreVigie(board) {
    let count = 0;
    for( let j = 0; j< board.length; j++) {
        for( let i = 0; i< board.length; i++) {
            if( board[i][j].value === FORESTCASE && neighborhood(board,i,j) === 4 ) {
                count++;
            }
        }
    }
    return count;
}

/**
 * 1 point par case foret au bord
 */
function countBoisSentinelle(board) {
    let count = 0;
    for( let j = 0; j< board.length; j++) {
        for( let i = 0; i< board.length; i++) {
            if( board[i][j].value === FORESTCASE && isOnEdge(board, i,j) ) {
                count++;
            }
        }
    }
    return count;
}

/**
 * 3 par montagne connectées par des forets
 */
function countForetHautsPlateaux(board, limit=11) {
    const montagnes = [];
    const visited = "FHP";
    for( let j = 0; j< board.length; j++) {
        for( let i = 0; i< board.length; i++) {
            if( board[i][j].visited === visited ) {
                continue;
            }
            if( board[i][j].value === FORESTCASE ) {
                board[i][j].visited = visited;
                const forest = propagate(board, i, j, FORESTCASE, visited, limit);
                forest.forEach(n=>board[n.X][n.Y].visited=visited);
                const monts = getBorderMontagnePositions(board, forest, limit);
                if( monts.length >= 2 ) {
                    monts.forEach(curM=>{
                        if( !montagnes.some(m=>m.X === curM.X && m.Y === curM.Y) ) {
                            montagnes.push(curM);
                        }
                    });
                }
            }
        }
    }
    return montagnes.length * 3;
}

function getBorderMontagnePositions(board, forest, limit=11) {
    const monts = [];
    forest.forEach(f=>{
        const neighbors = getNeighbors(board, f, limit);
        neighbors.forEach(n=>{
            if( n.value === "M" || n.value === "-M" ) {
                const curM = {X:n.X, Y:n.Y};
                if( !monts.some(m=>m.X === curM.X && m.Y === curM.Y) ) {
                    monts.push(curM);
                }
            }
        });
    });
    return monts;
}

/**
 * 1 point par colonne et ligne contenant au moins 1 foret
 */
function countCheminVerdoyant(board) {
    let count = 0;
    for( let j = 0; j< board.length; j++) {
        for( let i = 0; i< board.length; i++) {
            if( board[i][j].value === FORESTCASE ) {
                count++;
                break;
            }
        }
        for( let i = 0; i< board.length; i++) {
            if( board[j][i].value === FORESTCASE ) {
                count++;
                break;
            }
        }
    }
    return count;
}

/**
 * 1 point par champs touchant une montagne et 2 points par eaux touchant une montagne
 */
function countValleeMages(board) {
    let count = 0;
    for( let j = 0; j< board.length; j++) {
        for( let i = 0; i< board.length; i++) {
            if( ["M","-M"].includes(board[i][j].value) ) {
                const neighbors = neighborhoodType(board,i,j);
                count+=neighbors.filter(f=>f===FIELDCASE).length;
                count+=neighbors.filter(f=>f===WATERCASE).length*2;
            }
        }
    }
    return count;
}

/**
 * 1 point par lac adjacent a au moins une ferme et 1 point par ferme adjacent a au moins un lac
 */
function countCanauxIrrigation(board) {
    let count = 0;
    for( let j = 0; j< board.length; j++) {
        for( let i = 0; i< board.length; i++) {
            if( board[i][j].value === WATERCASE ) {
                const neighbors = neighborhoodType(board,i,j);
                if( neighbors.filter(f=>f===FIELDCASE).length > 0 ) count++;
            }
            if( board[i][j].value === FIELDCASE ) {
                const neighbors = neighborhoodType(board,i,j);
                if( neighbors.filter(f=>f===WATERCASE).length > 0 ) count++;
            }
        }
    }
    return count;
}

const templePositions = [
    {X:1,Y:2},
    {X:5,Y:1},
    {X:9,Y:2},
    {X:1,Y:8},
    {X:5,Y:9},
    {X:9,Y:8},
];

/**
 * 1 point par lac a cote d une ruine, 3 points par ferme sur une ruine
 */
function countGrenierDore(board, templePositions) {
    let count = 0;
    templePositions.forEach(pos=>{
        const neighbors = neighborhoodType(board,pos.X,pos.Y);
        count+=neighbors.filter(f=>f===WATERCASE).length;
        if( board[pos.X][pos.Y].value === FIELDCASE ) {
            count+=3;
        }
    });
    return count;
}

/**
 * 3 par lacs non connectés à des champs et non aux bords
 * 3 par champs non connectés à des lacs et non aux bords
 */
function countMonteeDesEaux(board, limit=11) {
    const lacs = [];
    const fermes = []; 
    const visited = "MdE";
    for( let j = 0; j< board.length; j++) {
        for( let i = 0; i< board.length; i++) {
            if( board[i][j].visited === visited ) {
                continue;
            }
            if( board[i][j].value === FIELDCASE ) {
                board[i][j].visited = visited;
                const ferme = propagate(board, i, j, FIELDCASE, visited, limit);
                ferme.forEach(n=>board[n.X][n.Y].visited=visited);
                // check neighborhood of the ferme
                const neighborhood = getBorderNeighborhood(board, ferme, limit);
                if( !neighborhood.includes("B") && !neighborhood.includes(WATERCASE) ) {
                    fermes.push(ferme);
                }
            }
            if( board[i][j].value === WATERCASE ) {
                board[i][j].visited = visited;
                const lac = propagate(board, i, j, WATERCASE, visited, limit);
                lac.forEach(n=>board[n.X][n.Y].visited=visited);
                // check neighborhood of the lac
                const neighborhood = getBorderNeighborhood(board, lac, limit);
                if( !neighborhood.includes("B") && !neighborhood.includes(FIELDCASE) ) {
                    lacs.push(lac);
                }
            }
        }
    }
    return (fermes.length + lacs.length)*3;
}

/// VILLES
/**
 * 1 par case de la plus grande cité non connecté à une montagne
 */
function countGrandeCite(board, limit=11) {
    // montagne is "M" or "-M"
    const villes = [];
    const visited = "R";
    for( let j = 0; j< board.length; j++) {
        for( let i = 0; i< board.length; i++) {
            if( board[i][j].visited === visited ) {
                continue;
            }
            if( board[i][j].value === CITYCASE ) {
                board[i][j].visited = visited;
                const neighborhood = propagate(board, i, j, CITYCASE, visited, limit);
                neighborhood.forEach(n=>board[n.X][n.Y].visited=visited);
                // check if neighborhood is next to a montagne (M or -M)
                if( !nextToMontagne(board, neighborhood, limit )) {
                    villes.push(neighborhood.length);
                }
            }
        }
    }
    if( villes.length === 0 ) {
        return 0;
    }
    villes.sort((a,b) => b-a);
    return villes[0];
}

function nextToMontagne(board, ville, limit=11) {
    const isMontagne = (v,deltaX,deltaY) => {
        if( deltaX<0 && v.X === 0 ) return false; // on an edge
        if( deltaX>0 && v.X === limit-1 ) return false; // on an edge
        if( deltaY<0 && v.Y === 0 ) return false; // on an edge
        if( deltaY>0 && v.Y === limit-1 ) return false; // on an edge
        const val = board[v.X+deltaX][v.Y+deltaY].value;
        return ["M", "-M"].includes(val);
    }
    for( const v of ville ) {
        if( isMontagne(v,-1,0) ) return true;
        if( isMontagne(v,1,0) ) return true;
        if( isMontagne(v,0,-1) ) return true;
        if( isMontagne(v,0,1) ) return true;
    }
    return false;
}

/**
 * 3 pour chaque cité connectés à au moins 3 types de terrains differents
 */
function countPlainesOrVert(board, limit=11) {
    const villes = [];
    const visited = "POV";
    for( let j = 0; j< board.length; j++) {
        for( let i = 0; i< board.length; i++) {
            if( board[i][j].visited === visited ) {
                continue;
            }
            if( board[i][j].value === CITYCASE ) {
                board[i][j].visited = visited;
                const ville = propagate(board, i, j, CITYCASE, visited, limit);
                ville.forEach(n=>board[n.X][n.Y].visited=visited);
                // check neighborhood of the ville
                const neighborhood = getBorderNeighborhood(board, ville, limit);
                if( neighborhood.filter(n=>n!="B").length >= 3 ) {
                    villes.push(ville);
                }
            }
        }
    }
    return villes.length * 3;
}

function getBorderNeighborhood(board, ville, limit=11) {
    const border = [];
    ville.forEach(
        v=> {
            const neighbors = getNeighbors(board, v, limit);
            neighbors.forEach(n=>{
                let val = n.value;
                if( val === "-M") {val = "M"};
                if( val === CITYCASE || val === " ") {
                    return;
                }
                if( border.includes(val) ) {
                    return;
                }
                border.push(val);
            });
            if( !border.includes("B") && neighbors.length < 4 ) {
                border.push("B");
            }
        }
    );
    return border;
}

/**
 * 8 par cité de 6 cases ou plus
 */
function countPlacesFortes(board, limit=11) {
    const villes = [];
    const visited = "PF";
    for( let j = 0; j< board.length; j++) {
        for( let i = 0; i< board.length; i++) {
            if( board[i][j].visited === visited ) {
                continue;
            }
            if( board[i][j].value === CITYCASE ) {
                board[i][j].visited = visited;
                const neighborhood = propagate(board, i, j, CITYCASE, visited, limit);
                neighborhood.forEach(n=>board[n.X][n.Y].visited=visited);
                villes.push(neighborhood.length);
            }
        }
    }
    return villes.filter(v=>v>=6).length * 8;
}

function getNeighbors(board, neighbor, limit=11) {
    const neighbors = [];
    if( neighbor.X > 0 ) {
        const newX = neighbor.X-1;
        const newY = neighbor.Y;
        const cell = board[newX][newY];
        neighbors.push({X:newX, Y:newY, visited: cell.visited, value: cell.value})
    }
    if( neighbor.X < limit-1 ) {
        const newX = neighbor.X+1;
        const newY = neighbor.Y;
        const cell = board[newX][newY];
        neighbors.push({X:newX, Y:newY, visited: cell.visited, value: cell.value})
    }
    if( neighbor.Y < limit-1 ) {
        const newX = neighbor.X;
        const newY = neighbor.Y+1;
        const cell = board[newX][newY];
        neighbors.push({X:newX, Y:newY, visited: cell.visited, value: cell.value})
    }
    if( neighbor.Y > 0 ) {
        const newX = neighbor.X;
        const newY = neighbor.Y-1;
        const cell = board[newX][newY];
        neighbors.push({X:newX, Y:newY, visited: cell.visited, value: cell.value})
    }
    return neighbors;
}

function propagate(board, i, j, value, visited, limit=11) {
    const neighbors = [{X:i, Y:j}];
    const allCells = [{X:i, Y:j}];
    while( neighbors.length > 0 ) {
        const curNeighbor = neighbors.shift();
        const curNeighbors = getNeighbors(board, curNeighbor, limit);
        curNeighbors.forEach(n=>{
            if( n.visited === visited ) {
                return;
            }
            if( n.value !== value ) {
                return;
            }
            board[n.X][n.Y].visited = visited;
            neighbors.push({X:n.X, Y:n.Y});
            allCells.push({X:n.X, Y:n.Y});
        });
    }
    return allCells;
}

/**
 * 2 par case de la 2e plus grande cité
 */
function countRemparts(board, limit=11) {
    const villes = [];
    const visited = "R";
    for( let j = 0; j< board.length; j++) {
        for( let i = 0; i< board.length; i++) {
            if( board[i][j].visited === visited ) {
                continue;
            }
            if( board[i][j].value === CITYCASE ) {
                board[i][j].visited = visited;
                const neighborhood = propagate(board, i, j, CITYCASE, visited, limit);
                neighborhood.forEach(n=>board[n.X][n.Y].visited=visited);
                villes.push(neighborhood.length);
            }
        }
    }
    if( villes.length <= 1 ) {
        return 0;
    }
    villes.sort((a,b) => b-a);
    return villes[1]*2;
}

//*************************************************/

function expectToBe(curResult,expectedResult) {
    if( curResult !== expectedResult) {
        throw `expect ${expectedResult} but receive ${curResult}`;
    }
}

function test() {
    expectToBe(countFrontieres(
        [
            [{value:" "}, {value: " "}, {value: "M"}],
            [{value:" "}, {value: " "}, {value: "1"}],
            [{value:"M"}, {value: "0"}, {value: "1"}]
        ]), 12
    );

    expectToBe(countRouteBrisee(
        [
            [{value:"-M"}, {value: " "}, {value: "1"}, {value: "M"}],
            [{value:" "}, {value: "4"}, {value: "2"}, {value: "2"}],
            [{value:" "}, {value: " "}, {value: "2"}, {value: " "}],
            [{value:" "}, {value: " "}, {value: " "}, {value: "1"}]
        ]), 9
    );

    expectToBe(countBaronniePerdue(
        [
            [{value:"M"}, {value: "5"}, {value: "4"}, {value: "R"}],
            [{value:" "}, {value: "4"}, {value: "2"}, {value: "A"}],
            [{value:"1"}, {value: "2"}, {value: "2"}, {value: "F"}],
            [{value:"M"}, {value: "2"}, {value: " "}, {value: "1"}]
        ]), 9
    );

    expectToBe(countChaudrons(
        [
            [{value:" "}, {value: " "}, {value: "M"}],
            [{value:" "}, {value: " "}, {value: "1"}],
            [{value:"M"}, {value: "0"}, {value: "1"}]
        ]), 0
    );

    expectToBe(countChaudrons(
        [
            [{value:"1"}, {value: " "}, {value: "M"}],
            [{value:" "}, {value: "2"}, {value: "1"}],
            [{value:"M"}, {value: "0"}, {value: " "}]
        ]), 3
    );

    expectToBe(countArbreVigie(
        [
            [{value:FORESTCASE}, {value: " "}, {value: "M"}],
            [{value:" "}, {value: FORESTCASE}, {value: "1"}],
            [{value:"M"}, {value: "0"}, {value: FORESTCASE}]
        ]), 1
    );

    expectToBe(countBoisSentinelle(
        [
            [{value:FORESTCASE}, {value: FORESTCASE}, {value: "M"}],
            [{value:" "}, {value: FORESTCASE}, {value: "1"}],
            [{value:"M"}, {value: "0"}, {value: FORESTCASE}]
        ]), 3
    );

    expectToBe(countCheminVerdoyant(
        [
            [{value:FORESTCASE}, {value: FORESTCASE}, {value: "M"}],
            [{value:" "}, {value: "2"}, {value: "1"}],
            [{value:"M"}, {value: "0"}, {value: FORESTCASE}]
        ]), 5
    );

    expectToBe(countValleeMages(
        [
            [{value:WATERCASE}, {value: FIELDCASE}, {value: "-M"}],
            [{value:WATERCASE}, {value: "2"}, {value: "1"}],
            [{value:"M"}, {value: "0"}, {value: FIELDCASE}]
        ]), 3
    );

    expectToBe(countCanauxIrrigation(
        [
            [{value:WATERCASE}, {value: "2"}, {value: "M"}],
            [{value:WATERCASE}, {value: FIELDCASE}, {value: WATERCASE}],
            [{value:"M"}, {value: "0"}, {value: FIELDCASE}]
        ]), 4
    );

    expectToBe(countGrenierDore(
        [
            [{value:"0"}, {value: WATERCASE}, {value: "0"}],
            [{value:WATERCASE}, {value: FIELDCASE}, {value: FIELDCASE}],
            [{value:"0"}, {value: "0"}, {value: FIELDCASE}]
        ], [{X:1,Y:1}]), 5
    );

    expectToBe(countPlacesFortes(
        [
            [{value:CITYCASE, visited: ""}, {value: "2", visited: ""}, {value: "M", visited: ""}],
            [{value:CITYCASE, visited: ""}, {value: CITYCASE, visited: ""}, {value: CITYCASE, visited: ""}],
            [{value:"M", visited: ""}, {value: CITYCASE, visited: ""}, {value: CITYCASE, visited: ""}]
        ], 3), 8
    );

    expectToBe(countRemparts(
        [
            [{value:CITYCASE, visited: ""}, {value: "2", visited: ""}, {value: "M", visited: ""}],
            [{value:CITYCASE, visited: ""}, {value: CITYCASE, visited: ""}, {value: "w", visited: ""}],
            [{value:"M", visited: ""}, {value: "w", visited: ""}, {value: CITYCASE, visited: ""}]
        ], 3), 2
    );

    expectToBe(countRemparts(
        [
            [{value:CITYCASE, visited: ""}, {value: "FFFFFF", visited: ""}, {value: "MMMMMF", visited: ""},{value:CITYCASE, visited: ""}, {value: "2", visited: ""}, {value: "M", visited: ""}],
            [{value:CITYCASE, visited: ""}, {value: CITYCASE, visited: ""}, {value: "FFFFFF", visited: ""},{value:CITYCASE, visited: ""}, {value: "2", visited: ""}, {value: "M", visited: ""}],
            [{value:"MMMMMM", visited: ""}, {value: "FFFFFF", visited: ""}, {value: CITYCASE, visited: ""},{value:CITYCASE, visited: ""}, {value: "2", visited: ""}, {value: "M", visited: ""}],
            [{value:CITYCASE, visited: ""}, {value: CITYCASE, visited: ""}, {value: "MMMMMM", visited: ""},{value:CITYCASE, visited: ""}, {value: "2", visited: ""}, {value: "M", visited: ""}],
            [{value:CITYCASE, visited: ""}, {value: CITYCASE, visited: ""}, {value: "FFFFFF", visited: ""},{value:CITYCASE, visited: ""}, {value: "2", visited: ""}, {value: "M", visited: ""}],
            [{value:"MMMMMM", visited: ""}, {value: "MMMMMM", visited: ""}, {value: CITYCASE, visited: ""},{value:CITYCASE, visited: ""}, {value: "2", visited: ""}, {value: "M", visited: ""}]
        ], 6), 8
    );

    expectToBe(countGrandeCite(
        [
            [{value:CITYCASE, visited: ""}, {value: "FFFFFF", visited: ""}, {value: "MMMMMF", visited: ""},{value:CITYCASE, visited: ""}, {value: "M", visited: ""}, {value: "M", visited: ""}],
            [{value:CITYCASE, visited: ""}, {value: CITYCASE, visited: ""}, {value: "FFFFFF", visited: ""},{value:CITYCASE, visited: ""}, {value: "2", visited: ""}, {value: "M", visited: ""}],
            [{value:"MMMMMM", visited: ""}, {value: "FFFFFF", visited: ""}, {value: CITYCASE, visited: ""},{value:CITYCASE, visited: ""}, {value: "2", visited: ""}, {value: "M", visited: ""}],
            [{value:CITYCASE, visited: ""}, {value: CITYCASE, visited: ""}, {value: "MMMMMM", visited: ""},{value:CITYCASE, visited: ""}, {value: "2", visited: ""}, {value: "M", visited: ""}],
            [{value:CITYCASE, visited: ""}, {value: CITYCASE, visited: ""}, {value: "FFFFFF", visited: ""},{value:CITYCASE, visited: ""}, {value: "2", visited: ""}, {value: "M", visited: ""}],
            [{value:"MMMMMM", visited: ""}, {value: "MMMMMM", visited: ""}, {value: CITYCASE, visited: ""},{value:CITYCASE, visited: ""}, {value: "2", visited: ""}, {value: "M", visited: ""}]
        ], 6), 4
    );

    expectToBe(countPlainesOrVert(
        [
            [{value:CITYCASE, visited: ""}, {value:      "M", visited: ""}, {value: WATERCASE, visited: ""},{value:CITYCASE, visited: ""}, {value: "2", visited: ""}, {value: "M", visited: ""}],
            [{value:CITYCASE, visited: ""}, {value: CITYCASE, visited: ""}, {value: FIELDCASE, visited: ""},{value:CITYCASE, visited: ""}, {value: "2", visited: ""}, {value: "M", visited: ""}],
            [{value:FIELDCASE, visited: ""}, {value:    "-M", visited: ""}, {value: CITYCASE, visited: ""},{value:CITYCASE, visited: ""}, {value: "2", visited: ""}, {value: "M", visited: ""}],
            [{value:CITYCASE, visited: ""}, {value: CITYCASE, visited: ""}, {value: " ", visited: ""},{value:CITYCASE, visited: ""}, {value: "2", visited: ""}, {value: "M", visited: ""}],
            [{value:CITYCASE, visited: ""}, {value: CITYCASE, visited: ""}, {value: " ", visited: ""},{value:CITYCASE, visited: ""}, {value: "2", visited: ""}, {value: "M", visited: ""}],
            [{value:FIELDCASE, visited: ""}, {value: WATERCASE, visited: ""}, {value: CITYCASE, visited: ""},{value:CITYCASE, visited: ""}, {value: "2", visited: ""}, {value: "M", visited: ""}]
        ], 6), 6
    );

    expectToBe(countMonteeDesEaux(
        [
            [{value:WATERCASE, visited: ""}, {value:      "M", visited: ""}, {value: CITYCASE, visited: ""},{value:CITYCASE, visited: ""}, {value: "2", visited: ""}, {value: WATERCASE, visited: ""}],
            [{value:WATERCASE, visited: ""}, {value: CITYCASE, visited: ""}, {value: FIELDCASE, visited: ""},{value:FIELDCASE, visited: ""}, {value: "2", visited: ""}, {value: "M", visited: ""}],
            [{value:FIELDCASE, visited: ""}, {value:    "-M", visited: ""}, {value: CITYCASE, visited: ""},{value:FIELDCASE, visited: ""}, {value: "2", visited: ""}, {value: "M", visited: ""}],
            [{value:CITYCASE, visited: ""}, {value: WATERCASE, visited: ""}, {value: " ", visited: ""},{value:CITYCASE, visited: ""}, {value: WATERCASE, visited: ""}, {value: "M", visited: ""}],
            [{value:CITYCASE, visited: ""}, {value: WATERCASE, visited: ""}, {value: " ", visited: ""},{value:CITYCASE, visited: ""}, {value: FIELDCASE, visited: ""}, {value: "M", visited: ""}],
            [{value:FIELDCASE, visited: ""}, {value: CITYCASE, visited: ""}, {value: CITYCASE, visited: ""},{value:CITYCASE, visited: ""}, {value: "2", visited: ""}, {value: "M", visited: ""}]
        ], 6), 6
    );

    expectToBe(countForetHautsPlateaux(
        [
            [{value:FORESTCASE, visited: ""}, {value:      "M", visited: ""}, {value: CITYCASE, visited: ""},{value:CITYCASE, visited: ""}, {value: "2", visited: ""}, {value: WATERCASE, visited: ""}],
            [{value:FORESTCASE, visited: ""}, {value: CITYCASE, visited: ""}, {value: FIELDCASE, visited: ""},{value:FIELDCASE, visited: ""}, {value: "2", visited: ""}, {value: "3", visited: ""}],
            [{value:FORESTCASE, visited: ""}, {value:    "-M", visited: ""}, {value: CITYCASE, visited: ""},{value:FORESTCASE, visited: ""}, {value: "2", visited: ""}, {value: "3", visited: ""}],
            [{value:FORESTCASE, visited: ""}, {value: FORESTCASE, visited: ""}, {value: " ", visited: ""},{value:FORESTCASE, visited: ""}, {value: WATERCASE, visited: ""}, {value: "3", visited: ""}],
            [{value:CITYCASE, visited: ""}, {value: WATERCASE, visited: ""}, {value: " ", visited: ""},{value:FORESTCASE, visited: ""}, {value: FORESTCASE, visited: ""}, {value: "3", visited: ""}],
            [{value:FIELDCASE, visited: ""}, {value: CITYCASE, visited: ""}, {value: CITYCASE, visited: ""},{value:CITYCASE, visited: ""}, {value: "M", visited: ""}, {value: "3", visited: ""}]
        ], 6), 6
    );
    
}

test();