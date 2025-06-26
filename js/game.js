'use strict'

var gBoard
var gLevel = {
	SIZE: 4,
	MINES: 2
}
var gGame = {
	isOn: false,
	revealedCount: 0,
	markedCount: 0,
	secsPassed: 0,
	isVictory: false
}
const MINES = '💣'
const FLAG = '🚩'
const EMPTY = ' '
var gMinesAround
var gIsFisrtClick = true
var gLives = 3
var gSetTimeout
var gIsDark = false
var gIsHint = false
var gStartTime
var gTimerInterval

function onInit() {
	var btn = document.querySelector('.restart-btn')
	btn.innerText = '😁'
	gGame.revealedCount = 0
	gGame.markedCount = 0
	gBoard = buildBoard()
	renderBoard(gBoard)
	closeModal()
	gIsFisrtClick = true
	gLives = 3
	updateLives()
	stopTimer()
	document.querySelector('.timer span').innerText = '0.000'
}

function buildBoard() {
	const board = []

	for (var i = 0; i < gLevel.SIZE; i++) {
		board.push([])

		for (var j = 0; j < gLevel.SIZE; j++) {
			board[i][j] = {
				minesAroundCount: 0,
				isRevealed: false,
				isMine: false,
				isMarked: false
			}
		}
	}
	return board
}

function renderBoard(board) {
	var strHTML = ''

	for (var i = 0; i < board.length; i++) {
		strHTML += '<tr>'

		for (var j = 0; j < board[0].length; j++) {
			var cell = board[i][j].minesAroundCount
			if (board[i][j] === MINES) cell = MINES
			const className = `cell cell-${i}-${j}`
			strHTML += `<td class="hidden ${className}" onclick="onCellClicked(this, ${i}, ${j})" 
			oncontextmenu="onCellMarked(this, ${i}, ${j})">${cell}</td>`
		}

		strHTML += '</tr>'
	}
	const elContainer = document.querySelector('.board')
	elContainer.innerHTML = strHTML
}

function cellLocation(board) {
	for (let i = 0; i < board.length; i++) {

		for (let j = 0; j < board[0].length; j++) {
			if (board[i][j].isMine === true) continue
			renderCell(i, j, setMinesNegsCount(board, i, j))
		}
	}
}

function setMinesNegsCount(board, col, row) {
	for (var i = col - 1; i <= col + 1; i++) {
		if (i < 0 || i >= board.length) continue
		for (var j = row - 1; j <= row + 1; j++) {
			if (i === col && j === row) continue
			if (j < 0 || j >= board[0].length) continue
			if (board[i][j].isMine === true) {
				board[col][row].minesAroundCount++
			}
		}
	}
	if (board[col][row].minesAroundCount !== 0) return board[col][row].minesAroundCount
	else return EMPTY
}

function onCellClicked(elCell, i, j) {
	// if (gIsHint === true) {
	// 	showHint(gBoard, i, j)
	// } else {
	if (gIsFisrtClick) {
		gIsFisrtClick = false
		gGame.isOn = true
		gBoard[i][j].isRevealed = true
		minesLocation(gBoard, i, j)
		cellLocation(gBoard)
		elCell.classList.add('clicked')
		gGame.revealedCount++
		expandReveal(gBoard, i, j)
		startTimer()
	} else {
		if (gBoard[i][j].isMine) {
			showMines(elCell)
			gLives--
			updateLives()
			checkGameOver(gBoard, i, j)
		} else if (gBoard[i][j].isRevealed === false) {
			if (gBoard[i][j].minesAroundCount !== 0) renderCell(i, j, gBoard[i][j].minesAroundCount)
			else renderCell(i, j, EMPTY)
			elCell.classList.add('clicked')
			gGame.revealedCount++
			expandReveal(gBoard, i, j)
			gBoard[i][j].isRevealed = true
			checkGameOver(gBoard, i, j)
			console.log(gGame.revealedCount)
			if (gBoard[i][j].isMarked) {
				gBoard[i][j].isMarked = false
				gGame.markedCount--
			}
		}
		// }
	}
}

function onCellMarked(elCell, i, j) {
	if (gIsFisrtClick) return
	if (gBoard[i][j].isRevealed) return
	if (gBoard[i][j].isMarked === false) {
		event.preventDefault()
		gBoard[i][j].isMarked = true
		renderCell(i, j, FLAG)
		elCell.classList.add('marked')
		gGame.markedCount++
		checkGameOver(gBoard, i, j)
	} else {
		event.preventDefault()
		gBoard[i][j].isMarked = false
		gGame.markedCount--
		elCell.classList.remove('marked')
	}
}

function checkGameOver(board, i, j) {
	if (gLives === 0) gameOver(i, j)
	if (gGame.markedCount === gLevel.MINES && gGame.revealedCount === (gLevel.SIZE ** 2 - gLevel.MINES)) {
		gGame.isVictory = true
		gameOver(i, j)
	}
}

function expandReveal(board, col, row) {
	for (var i = col - 1; i <= col + 1; i++) {
		if (i < 0 || i >= board.length) continue
		for (var j = row - 1; j <= row + 1; j++) {
			if (i === col && j === row) continue
			if (j < 0 || j >= board[0].length) continue
			if (board[i][j].isMine === true) continue
			if (!document.querySelector(`.cell-${i}-${j}`).classList.contains('clicked')) {
				gGame.revealedCount++
				document.querySelector(`.cell-${i}-${j}`).classList.add('clicked')
			}
			board[i][j].isRevealed = true
			if (gBoard[i][j].isMarked) {
				gBoard[i][j].isMarked = false
				gGame.markedCount--
			}
			if (gBoard[i][j].minesAroundCount !== 0) renderCell(i, j, gBoard[i][j].minesAroundCount)
			else renderCell(i, j, EMPTY)
			checkGameOver(board, i, j)
		}
	}
}

function minesLocation(board, celli, cellj) {
	var loc = {}
	for (let index = 0; index < gLevel.MINES; index++) {
		loc.i = getRandomInt(0, gLevel.SIZE)
		loc.j = getRandomInt(0, gLevel.SIZE)
		while (loc.i === celli && loc.j === cellj) {
			loc.i = getRandomInt(0, gLevel.SIZE)
			loc.j = getRandomInt(0, gLevel.SIZE)
		}
		board[loc.i][loc.j].isMine = true
		renderCell(loc.i, loc.j, MINES)
	}
}

function renderCell(i, j, value) {
	const elCell = document.querySelector(`.cell-${i}-${j}`)
	elCell.innerHTML = value
}

function gameOver(i, j) {
	var btn = document.querySelector('.restart-btn')
	gGame.isOn = false
	var msg
	stopTimer()
	if (gGame.isVictory) {
		msg = 'You Won!!!'
		btn.innerText = '😎'
		openModal(msg)
	} else {
		msg = 'Game Over'
		if (gLives === 0) btn.innerText = '🤯'
		openModal(msg)
	}
}

function openModal(msg) {
	const elModal = document.querySelector('.modal')
	const elMsg = elModal.querySelector('.msg')
	elMsg.innerText = msg
	elModal.style.display = 'block'
}

function closeModal() {
	const elModal = document.querySelector('.modal')
	elModal.style.display = 'none'
}

function updateLives() {
	var lives = document.querySelector('.lives')
	lives.innerText = ''

	for (let i = 0; i < gLives; i++) {
		lives.innerText += '❤️'
	}
}

function showMines(elCell) {
	elCell.classList.add('clicked')
	setTimeout(() => {
		elCell.classList.remove('clicked')
	}, 1000)
}

function restartLevel(elBtn) {
	if (elBtn.innerText === 'Easy') {
		gLevel.SIZE = 4
		gLevel.MINES = 2
		onInit()
	}
	if (elBtn.innerText === 'Medium') {
		gLevel.SIZE = 6
		gLevel.MINES = 7
		onInit()
	}
	if (elBtn.innerText === 'Hard') {
		gLevel.SIZE = 8
		gLevel.MINES = 14
		onInit()
	}
	if (elBtn.innerText === 'Legend') {
		gLevel.SIZE = 12
		gLevel.MINES = 32
		onInit()
	}

}

function darkMode() {
	if (!gIsDark) {
		document.querySelector('body').style.backgroundColor = 'rgb(95, 91, 91)'
		document.querySelector('.board').style.backgroundColor = 'rgb(229, 232, 232)'
		document.querySelector('.timer').style.color = 'rgb(229, 232, 232)'
		gIsDark = true
	} else {
		document.querySelector('body').style.backgroundColor = 'rgb(242, 242, 242)'
		document.querySelector('.board').style.backgroundColor = 'rgb(124, 109, 109)'
		document.querySelector('.timer').style.color = 'rgb(124, 109, 109)'
		gIsDark = false
	}
}

// function showHints(elBtn) {
// 	elBtn.classList.add('hint-marked')
// 	gIsHint = true
// 	console.log(gIsHint);

// }

// function showHint(board, col, row) {
// 	for (var i = col - 1; i <= col + 1; i++) {
// 		if (i < 0 || i >= board.length) continue
// 		for (var j = row - 1; j <= row + 1; j++) {
// 			if (j < 0 || j >= board[0].length) continue
// 			if (board[i][j].isMine === true) continue
// 			if (!document.querySelector(`.cell-${i}-${j}`).classList.contains('clicked')) {
// 				document.querySelector(`.cell-${i}-${j}`).classList.add('clicked')
// 			}
// 			if (gBoard[i][j].minesAroundCount !== 0) renderCell(i, j, gBoard[i][j].minesAroundCount)
// 			else renderCell(i, j, EMPTY)
// 		}
// 	}
// 	if (gSetTimeout) return
// 	gSetTimeout = setTimeout(() => {
// 		for (var i = col - 1; i <= col + 1; i++) {
// 			if (i < 0 || i >= board.length) continue
// 			for (var j = row - 1; j <= row + 1; j++) {
// 				if (j < 0 || j >= board[0].length) continue
// 				// if (board[i][j].isMine === true) continue
// 				document.querySelector(`.cell-${i}-${j}`).classList.remove('clicked')
// 			}
// 		}
// 		document.querySelector('.hint-marked').style.display = 'none'
// 		gIsHint = false
// 	}, 1500)
// }

function stopTimer() {
	clearInterval(gTimerInterval)
}

function startTimer() {
	gStartTime = Date.now()
	gTimerInterval = setInterval(updateTimer, 25)
}

function updateTimer() {

	const now = Date.now()
	const diff = (now - gStartTime) / 1000
	document.querySelector('.timer span').innerText = diff.toFixed(3)
}

function safeClick(board) {
	var loc = {}
	loc.i = getRandomInt(0, gLevel.SIZE)
	loc.j = getRandomInt(0, gLevel.SIZE)
}


	// for (let i = 0; i < board.length; i++) {
	// 	for (let j = 0; j < board[0].length; j++) {
	// 		if (board[i][j].isMine === true) continue

	// 	}
	// }

	// for (let index = 0; index < gLevel.MINES; index++) {
	// 	loc.i = getRandomInt(0, gLevel.SIZE)
	// 	loc.j = getRandomInt(0, gLevel.SIZE)
	// 	while (loc.i === celli && loc.j === cellj) {
	// 		loc.i = getRandomInt(0, gLevel.SIZE)
	// 		loc.j = getRandomInt(0, gLevel.SIZE)
	// 	}
	// 	board[loc.i][loc.j].isMine = true
	// 	renderCell(loc.i, loc.j, MINES)
	// }
