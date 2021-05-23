'use strict'

const MINE_ICON = '💥'
const FLAG_ICON = '🚩'
const EMPTY_ICON = ''

const NORMAL_ICON = '😀'
const SAD_ICON = '🙊'
const WIN_ICON = '🤩'

const FIRST_SAFE_AVAILABLE = 3

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
    firstClick: true,
    safeClicksAvailable: FIRST_SAFE_AVAILABLE
}
var gLevel = beginerLevel

function initGame() {
    gGame.safeClicksAvailable = FIRST_SAFE_AVAILABLE
    updateRemainingSafe()
    gGame.isOn=true
    gGame.firstClick = true;
    gBoard = buildBoard()
    renderBoard(gBoard)
    gGame.lives = 3
    renderLive()
    changeStatusIcon(NORMAL_ICON)
}

function buildBoard() {
    var board = createMat(gLevel.size, gLevel.size)
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
        strHTML += '<tr>'; 
        for (var j = 0; j < board[0].length; j++) {
            var currentCell = board[i][j];
            var cellClass = getClassName({ i: i, j: j })

            if (currentCell.isShown) cellClass += ' is-shown'
            strHTML += '\t<td oncontextmenu="cellMarked(this,' + i + ',' + j + ');" onclick="cellClicked(this,' + i + ',' + j + ');"class="' + cellClass + '"> \n' 
            if (currentCell.isShown) {
                if (currentCell.isMine) {
                    strHTML += MINE_ICON
                } else if (currentCell.minesAroundCount > 0) {
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
    return `cell-${location.i}-${location.j}`
}

function setMinesNegsCount() {
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

function cellClicked(elCell, i, j) {
    if (!gGame.isOn) return
    var modelCell = gBoard[i][j]
    if (modelCell.isMine) {
        changeStatusIcon(SAD_ICON)
        gGame.lives--
        renderLive()

        if (gGame.lives === 0) {
            gameOver(false)
            return
        }
    }
    modelCell.isShown = true

  
    if (gGame.firstClick) {
        gGame.firstClick = false
        startTime()
        addRandomMines()
        setMinesNegsCount()
        renderBoard(gBoard)
    } else {
        renderCell(elCell, i, j)
    }

    if (modelCell.minesAroundCount === 0) {
        expandShown(elCell, i, j)
    }
    // in any case
    checkWin()
}

function cellMarked(elCell, i, j) {
    if (!gGame.isOn || gGame.firstClick || gBoard[i][j].isShown) return 
    gBoard[i][j].isMarked = !gBoard[i][j].isMarked
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
        changeStatusIcon(WIN_ICON)
        showWinModal()
    }
    else {
        showAllMines()
        showLoseModal()
    }
}

function restartGame() {
    initGame()
    hideWinModal()
    hideLoseModal()
    restartTimer()
}

function expandShown(elcell, posI, posJ) {
    for (var i = posI - 1; i <= posI + 1; i++) { // go from 1 before until 1 after
        if (i < 0 || i >= gBoard.length) continue // checkt if this cell is in the board
        for (var j = posJ - 1; j <= posJ + 1; j++) {
            if (j < 0 || j >= gBoard[i].length) continue
            var cell = gBoard[i][j]
            if (cell.isShown || cell.isMine) continue
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

function getRandCell()
{
    var iRandom = getRandomIntInclusive(0, gLevel.size - 1)
    var jRandom = getRandomIntInclusive(0, gLevel.size - 1)

    return {i: iRandom, j: jRandom}
}


function generateMineRandom() {
    while (true) {
        var randCell = getRandCell()

        if (!gBoard[randCell.i][randCell.j].isShown && !gBoard[randCell.i][randCell.j].isMine) {
            gBoard[randCell.i][randCell.j].isMine = true;
            return { i: randCell.i, j: randCell.j}
        }
    }
}

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
    restartGame()
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

function showLoseModal() {
    var elWinModal = document.querySelector('.modal-lose')
    elWinModal.style.display = 'block'

    setTimeout(hideWinModal, 4000)
}

function hideLoseModal() {
    var elWinModal = document.querySelector('.modal-lose')
    elWinModal.style.display = 'none'
}

function renderCell(elCell, i, j) {
    var modelCell = gBoard[i][j]

    if (modelCell.isMarked) {
        elCell.innerText = FLAG_ICON
    }
    else if (modelCell.isShown) {
        elCell.classList.add('is-shown')
        if (modelCell.isMine) {
            elCell.innerText = MINE_ICON
        }
        else if (modelCell.minesAroundCount > 0) {
            elCell.innerText = modelCell.minesAroundCount
        }
    } else {
        elCell.innerText = EMPTY_ICON
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

function changeStatusIcon(statusIcon) {
    document.querySelector('.status-icon span').innerText = statusIcon

}

function foundCellForSafe()
{
    while (true) {
        var randCell = getRandCell() // {i: x, j: y}
        var randModelCell = gBoard[randCell.i][randCell.j]
        if (randModelCell.isMine || randModelCell.isShown || randModelCell.isMarked) {
            continue
        } else {
            return randCell
        }
    }
}

function hideSelfClickCell(cellLocation) {
    var className = getClassName(cellLocation)
    document.querySelector('.'+ className).innerText = ''
}

function safeClick() {
    if (gGame.safeClicksAvailable > 0 && gGame.firstClick===false) {
        gGame.safeClicksAvailable--
        updateRemainingSafe()
        /* generate i and j,
         check if this cell is not shown and not mine and not mark
          and then show them for 3 sec and then hide it
        */
       var cellToShow = foundCellForSafe() // {i: x, j: y}
        var valueToShow = gBoard[cellToShow.i][cellToShow.j].minesAroundCount

        // update dom
       var className = getClassName(cellToShow)
        document.querySelector('.'+className).innerText = valueToShow
        
        setTimeout(function() {hideSelfClickCell(cellToShow)}, 3000)
    }
}

function updateRemainingSafe() {
    document.querySelector('.available-safe').innerText = gGame.safeClicksAvailable + ' clicks available'
}