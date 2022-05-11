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
            return countGrenierDore(board);
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
function countForetHautsPlateaux(board) {
    return NDV;
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
function countMonteeDesEaux(board) {
    return NDV;
}

/// VILLES
/**
 * 1 par case de la plus grande cité non connecté à une montagne
 */
function countGrandeCite(board) {
    return NDV;
}

/**
 * 3 pour chaque cité connectés à au moins 3 types de terrains differents
 */
function countPlainesOrVert(board) {
    return NDV;
}

/**
 * 8 par cité de 6 cases ou plus
 */
function countPlacesFortes(board) {
    return NDV;
}

/**
 * 2 par case de la 2e plus grande cité
 */
function countRemparts(board) {
    return NDV;
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

    expectToBe(BaronniePerdue(
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
}

test();