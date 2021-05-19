'use strict'
const MINE = 'mine'
const FLAG = 'flag'
const EMPTY= "empty"

const MINE_ICON = '💥'
const FLAG_ICON= '🚩'
const EMPTY_ICON= ''

''

var gBoard;
var gGame = {
    isOn: false,
    shownCount: 0,
    markedCount: 0,
    secsPassed: 0
}

var gLevel = {
    size: 4,
    mines: 2
}


function initGame() {
    gBoard = buildBoard()
    renderBoard(gBoard)

}

// Step1 – the seed app:
// 1. Create a 4x4 gBoard Matrix containing Objects. Place 2 mines 
// manually when each cell’s isShown set to true. 
// 2. Present the mines using renderBoard() function.

function buildBoard() {
    // Create the Matrix
    var board = createMat(4, 4)
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[0].length; j++) {
            var cell = {
                minesAroundCount: 4,
                isShown: true,
                isMine: false,
                isMarked: true
            };
            if (i === 0 && j === 0 || i === 1 && j === 1) {
                cell.isMine = true

            }
            board[i][j] = cell;
        }
      
    }
    console.log(board);

    // con
    setMinesNegsCount(board)
    console.log(board)
    return board
}



function renderBoard(board) {
    var strHTML = '';

    for (var i = 0; i < board.length; i++) {
        strHTML += '<tr>';                                 // print row
        for (var j = 0; j < board[0].length; j++) {
            var currentCell = board[i][j];
            var cellClass = getClassName({ i: i, j: j })

            if (currentCell.isMine) cellClass += ' mine'
            strHTML += '\t<td class="cell ' + cellClass + '">\n'// print cell
            if (currentCell.isMine) {

                strHTML += MINE_ICON;
                console.log(strHTML, 'hello')
            }
            strHTML += '\t</td>\n'
        }
        strHTML += '</tr>\n';
    }
    var elBoard = document.querySelector('.board');
    console.log(elBoard, 'hello')
    elBoard.innerHTML = strHTML;
    console.log(strHTML)
}



function getClassName(location) {
    var cellClass = 'cell-' + location.i + '-' + location.j;
    return cellClass;
}



function setMinesNegsCount(board) { // UPDET ALL CELL THE NEG COUNT
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[i].length; j++) {
            board[i][j].minesAroundCount = countNegs(i, j, board);
        }
    }
   
}


function countNegs(cellI, cellJ, mat) { 
    var negsCount = 0;
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= mat.length) continue;
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (i === cellI && j === cellJ) continue;
            if (j < 0 || j >= mat[i].length) continue;

            if (mat[i][j].isMine) negsCount++;
        }
    }
    return negsCount;
}

function cellClicked(elCell, i, j){


}

function cellMarked(elCell){

}

function checkGameOver(){


}

function expandShown(board, elCell, i, j){


}


