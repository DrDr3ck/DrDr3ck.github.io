const EMPTYCASE = ' ';
const FORESTCASE = 0;
const CITYCASE = 1;
const FIELDCASE = 2;
const WATERCASE = 3;
const MONSTERCASE = 4;
const MONTAGNE = "M"; // ou -M

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
    return count;
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
        ]), 2
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