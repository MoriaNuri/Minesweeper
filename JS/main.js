'use strict'
const MINE = 'mine'
const FLAG = 'flag'
const EMPTY = "empty" //? 

const MINE_ICON = '💥'
const FLAG_ICON = '🚩'
const EMPTY_ICON = ''//?

const beginerLevel = { size: 4, mines: 2 }
const mediumLevel = { size: 8, mines: 12 }
const expertLevel = { size: 12, mines: 30 }

var gStartTime = null;
var gClockInterval = null;

var gBoard;
var gGame = {
    isOn: false,
    shownCount: 0,
    markedCount: 0,
    secsPassed: 0
} 

var gLevel = beginerLevel


function initGame() {
    gBoard = buildBoard()
    renderBoard(gBoard)

}

function startGame() {//Maybe not should


}

function buildBoard() {
    // Create the Matrix
    var board = createMat(4, 4)// SEND GLEVEL .SIZE  TO HERE??
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[0].length; j++) {
            var cell = {
                minesAroundCount: 0,
                isShown: false,
                isMine: false,
                isMarked: false
            };

            board[i][j] = cell;
        }

    }
    console.log(board);


    console.log(board)
    return board
}



function renderBoard(board) {
    var strHTML = '';

    for (var i = 0; i < board.length; i++) {
        strHTML += '<tr>';  // print row
        for (var j = 0; j < board[0].length; j++) {
            var currentCell = board[i][j];
            var cellClass = getClassName({ i: i, j: j })

            if (currentCell.isMine) cellClass += ' mine'

            strHTML += '\t<td oncontextmenu="cellMarked(this,' + i + ',' + j + ');" onclick="cellClicked(this,' + i + ',' + j + ')";' + 'class="cell ' + cellClass + '"> \n'// print cell
            if (currentCell.isShown) {

                if (currentCell.isMine) {

                    strHTML += MINE_ICON;
                    // console.log(strHTML, 'hello')
                } else {
                    strHTML += currentCell.minesAroundCount;
                }
                strHTML += '\t</td>\n'
            }

            if (currentCell.isMarked) {
                if (currentCell.isShown) continue;
                strHTML += FLAG_ICON


            }


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
    if (!mat[cellI][cellJ].isMine) {
        for (var i = cellI - 1; i <= cellI + 1; i++) {
            if (i < 0 || i >= mat.length) continue;
            for (var j = cellJ - 1; j <= cellJ + 1; j++) {
                if (i === cellI && j === cellJ) continue;
                if (j < 0 || j >= mat[i].length) continue;

                if (mat[i][j].isMine) negsCount++;
            }
        }
    }
    return negsCount;
}

/*check if this mine or not
if this mine then fame over or just decreas life
else (not mine) change in boardmodel (mat) to isShown=True
open renderCell
 
*/
function cellClicked(elCell, i, j) {

    if (gBoard[i][j].isMine) {
        alert('Game over')
    }

    gBoard[i][j].isShown = true
    gGame.shownCount++

    if (!gGame.isOn) {// Onclick start the game
        gGame.isOn = true
        gStartTime = Date.now();
        renderClock();
        generateMinesRandom()
        setMinesNegsCount(gBoard)// model
        renderBoard(gBoard)
        gameOver(gBoard)
    }

    renderBoard(gBoard)

    //checkGameOver()
}

function cellMarked(elCell, i, j) {
    if (gBoard[i][j].isShown) return
 
    if (gBoard[i][j].isMarked) {
        gBoard[i][j].isMarked = !gBoard[i][j].isMarked
        elCell.innerText =EMPTY_ICON
        gGame.markedCount--
    } else{elCell.innerText = FLAG_ICON
        gGame.markedCount++
    }
  
  }





//  lose- onclick mine or win- all the cell mark and show

function checkGameOver(board) {
    // win:
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[0].length; j++) {
            var cell = board[i][j]
            if (cell.isMine && !cell.isMarked)
                return false // no win!!


            // if (!cell.isMine && cell.isShown) {

            }      
        }
            
    }






function gameOver(win) {
    gGame.isOn = false;
}

function expandShown(board, elCell, i, j) {


}

// generate random mine
// get rand i j if cell in board[i][j] can be mine
// set it to be mine. if it shown or mine before then it cant be mine.
function generateMineRandom() {
    while (true) {
        var iRandom = getRandomIntInclusive(0, gLevel.size)// 0-4/0-8/0-12
        var jRandom = getRandomIntInclusive(0, gLevel.size)// 0-4/0-8/0-12

        if (!gBoard[iRandom][jRandom].isShown && !gBoard[iRandom][jRandom].isMine) {
            gBoard[iRandom][jRandom].isMine = true;
            break;
        }
    }
}
// NUM RANDOM 0-gLevel.mines
function generateMinesRandom() {
    for (var i = 0; i < gLevel.mines; i++) {
        generateMineRandom()
    }
}



function renderClock() {
    var elClock = document.querySelector('.clock');
    elClock.innerText = '00:00:00';

    gClockInterval = setInterval(() => {
        var nowTime = Date.now();

        var diff = parseInt(nowTime - gStartTime);
        var secs = parseInt(diff / 1000) + '';
        var minutes = parseInt(secs / 60) + '';
        var hours = parseInt(minutes / 60) + '';


        var innerClock = `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}:${secs.padStart(2, '0')}`;

        elClock.innerText = innerClock;
    }, 1000);
}

// function checkVictory()
// var isVictory = true;
// var cells = Object.keys(board);
// for (var i = 0; i < cells.length; i++) {
//     if 
