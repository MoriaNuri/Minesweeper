'use strict'
const MINE = 'mine'
const FLAG = 'flag'
const EMPTY = "empty"
const MINE_ICON = '💥'
const FLAG_ICON = '🚩'
const EMPTY_ICON = ''
const beginerLevel = { size: 4, mines: 2 }
const mediumLevel = { size: 8, mines: 12 }
const expertLevel = { size: 12, mines: 30 }
const levels = [beginerLevel, mediumLevel, expertLevel]

var gStartTime = null;
var gAddSecondInterval = null;
var gBoard;
var gGame = {
    isOn: false,
    countSecondPassed: 0,
    locationMines: [],
    lives: 3,
    firstClick:true
}

var gLevel = beginerLevel

function initGame() { 
    gGame.firstClick = true;
    gBoard = buildBoard()
    renderBoard(gBoard)
    gGame.lives = 3
    renderLive()
}

function buildBoard() {
    // Create the Matrix
    var board = createMat(gLevel.size, gLevel.size)// SEND GLEVEL .SIZE  TO HERE??
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[0].length; j++) {
            var cell = {
                minesAroundCount: 0,
                isShown: false,
                isMine: false,
                isMarked: false,
            }
            board[i][j] = cell;
        }
    }
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

            strHTML += '\t<td oncontextmenu="cellMarked(this,' + i + ',' + j + ');" onclick="cellClicked(this,' + i + ',' + j + ');"class="' + cellClass + '"> \n' // print cell
            if (currentCell.isShown) {

                if (currentCell.isMine) {

                    strHTML += MINE_ICON
                } else {
                    strHTML += currentCell.minesAroundCount;
                }
            }

            if (currentCell.isMarked) {
                if (currentCell.isShown) continue;
                strHTML += FLAG_ICON
            }

            strHTML += '\t</td>\n'

        }
        strHTML += '</tr>\n';
    }

    var elBoard = document.querySelector('.board');
    elBoard.innerHTML = strHTML;
}



function getClassName(location) {
    var cellClass = 'cell-' + location.i + '-' + location.j;
    return cellClass;
}

// function renderLives(numOfLives) {
//     var elLives = document.querySelector('.lives')
//     elLives.innerHTML = ''
//     for (var i = 0; i < numOfLives; i++)
//         setTimeout(function() { elLives.innerHTML += '<img src="img/heart.png">' }, i * 1)
// }

// function removeLive(elCell) {
//     if (gGame.lives === 1) gameOver(elCell)
//     else alertMine(elCell)
//     renderLives(--gGame.lives)
// }

// function removeLives() {
//     document.querySelector('.lives').innerHTML = ''
// }



function setMinesNegsCount() { // UPDET ALL CELL THE NEG COUNT
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[i].length; j++) {
            gBoard[i][j].minesAroundCount = countNegs(i, j, gBoard);
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
    var modelCell = gBoard[i][j]
    if (modelCell.isMine) {
        gGame.lives--
        renderLive()
        if (gGame.lives === 0) {
            gameOver(false)//WIN=FALSE
            return
        }
    }

    // update model
    modelCell.isShown = true

    // Check if this is the first click.
    if (gGame.firstClick) {// Onclick start the game
        gGame.firstClick = false
        startTime()
        addRandomMines()
        setMinesNegsCount()// model
        renderBoard(gBoard)
    } else {
        renderCell(elCell, i, j)
    }

    // If dont have neighbors with mines, then get all neighboars and change them to be shown and then render again the table.
    if (modelCell.minesAroundCount === 0) {
        expandShown(elCell, i, j)
    }




    // in any case
    checkWin()
}

function cellMarked(elCell, i, j) {
    if (!gGame.isOn) return //No render mines in start without it.
    if (gBoard[i][j].isShown) return

    // Update model
    gBoard[i][j].isMarked = !gBoard[i][j].isMarked

    // Update DOM
    // Render specific cell.
    renderCell(elCell, i, j)

    checkWin()
}



function checkWin() {
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[0].length; j++) {
            var cell = gBoard[i][j]
            if (cell.isMine && !cell.isMarked && !cell.isShown) return false // no win!!
            if (!cell.isMine && !cell.isShown) return false// no win!!
        }
    }

    gameOver(true)  // if win
}

function gameOver(win) {
    gGame.isOn = false
    clearInterval(gAddSecondInterval)
    var elSmilyBtn = document.querySelector('.smily span')
    if (win) {
        elSmilyBtn.innerText = '🤩'
        showWinModal()
        // removeLives(

    }
    else {
        elSmilyBtn.innerText = '🙊'
        showAllMines()
        alert("LOSE")

        // showLoseGame() will alert user that he lost, and also show all mines.
        // in lose open all the mine/ cell?
    }
}

function restartGame() {
    initGame()
    hideWinModal()
    restartTimer()
}


function expandShown(elcell, posI, posJ) {
    for (var i = posI - 1; i <= posI + 1; i++) { // go from 1 before until 1 after
        if (i < 0 || i >= gBoard.length) continue // checkt if this cell is in the board
        for (var j = posJ - 1; j <= posJ + 1; j++) {
            if (j < 0 || j >= gBoard[i].length) continue
            var cell = gBoard[i][j]
            if (cell.isShown||cell.isMine) continue
            // update model
            cell.isShown = true
            // update DOM
            var className = getClassName({ i: i, j: j })
            var elCellToRender = document.querySelector(`.${className}`)
            renderCell(elCellToRender, i, j)

            if (!cell.minesAroundCount) expandShown(gBoard, { i, j })
        }
    }
}



// generate random mine
// get rand i j if cell in board[i][j] can be mine
// set it to be mine. if it shown or mine before then it cant be mine.
function generateMineRandom() {
    while (true) {
        var iRandom = getRandomIntInclusive(0, gLevel.size - 1)// 0-4/0-8/0-12
        var jRandom = getRandomIntInclusive(0, gLevel.size - 1)// 0-4/0-8/0-12

        if (!gBoard[iRandom][jRandom].isShown && !gBoard[iRandom][jRandom].isMine) {
            gBoard[iRandom][jRandom].isMine = true;
            console.log(iRandom + " " + jRandom)
            return { i: iRandom, j: jRandom }
        }
    }
}
// NUM RANDOM 0-gLevel.mines
function addRandomMines() {
    gGame.locationMines = [] // Init the mines
    for (var i = 0; i < gLevel.mines; i++) {
        var newMine = generateMineRandom()
        gGame.locationMines.push(newMine) // add the new mine.
    }
}


function startTime() {
    var start = Date.now()
    gAddSecondInterval = setInterval(() => addSecondToTimer(start), 1000)
}

function addSecondToTimer(start) {
    var now = Date.now()
    gGame.countSecondPassed = Math.floor((now - start) / 1000)
    document.querySelector('.time span').innerText = gGame.countSecondPassed
}






function changeLevel(levelIndex) {
    gLevel = levels[levelIndex]
    initGame()
}




function showWinModal() {
    var elWinModal = document.querySelector('.modal-win')
    elWinModal.style.display = 'block'

    setTimeout(hideWinModal, 4000)
}

function hideWinModal() {
    var elWinModal = document.querySelector('.modal-win')
    elWinModal.style.display = 'none'
}

function renderCell(elCell, i, j) {
    var modelCell = gBoard[i][j]

    if (modelCell.isMarked) {
        elCell.innerText = FLAG_ICON
    }
    else if (modelCell.isMine) {
        elCell.innerText = MINE_ICON
    }
    else if (modelCell.isShown) {
        elCell.innerText = modelCell.minesAroundCount
    } else {
        elCell.innerText = EMPTY_ICON
        elCell.style.backgroundColor = '#888'
    }
}

function showAllMines() {
    for (var i = 0; i < gGame.locationMines.length; i++) {
        var currMine = gGame.locationMines[i]
        gBoard[currMine.i][currMine.j].isShown = true
    }
    renderBoard(gBoard)
}


function renderLive() {
    var elLives = document.querySelector('.lives')
    var strHtml = ''
    for (var i = 0; i < gGame.lives; i++) {
        strHtml += '❤️ '
    }
    elLives.innerHTML = strHtml
}


function restartTimer() {
    clearInterval(gAddSecondInterval)
    gGame.countSecondPassed = 0
    document.querySelector('.time span').innerText = gGame.countSecondPassed
}