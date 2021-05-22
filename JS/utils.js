function createMat(ROWS, COLS) {
    var mat = []
    for (var i = 0; i < ROWS; i++) {
        var row = []
        for (var j = 0; j < COLS; j++) {
            row.push('')
        }
        mat.push(row)
    }
    return mat
}


function getRandomIntInclusive(min, max) {
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1) + min)
}


// function renderClock() {
//     var elClock = document.querySelector('.clock');
//     elClock.innerText = '00:00:00';

//     gClockInterval = setInterval(() => {
//         var nowTime = Date.now();

//         var diff = parseInt(nowTime - gStartTime);
//         var secs = parseInt(diff / 1000) + '';
//         var minutes = parseInt(secs / 60) + '';
//         var hours = parseInt(minutes / 60) + '';


//         var innerClock = `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}:${secs.padStart(2, '0')}`;

//         elClock.innerText = innerClock;
//     }, 1000);
// }


//Cancel a mouse menu
document.addEventListener("contextmenu", function(e) {
    e.preventDefault();
}, false);