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
var gIsDark = false
var gIsHint = false
var gIsSafe = false
var gIsFirstMegaHint = false
var gIsSecMegaHint = false
var gIsManually = false
var gLives = 3
var gSafeClick = 3
var gStartTime
var gTimerInterval
var gScore
var gMegaHintLoc = {}

function onInit() {
	var btn = document.querySelector('.restart-btn')
	btn.innerText = '😁'
	gGame.revealedCount = 0
	gGame.markedCount = 0
	gSafeClick = 3
	gBoard = buildBoard()
	renderBoard(gBoard)
	closeModal()
	gIsFisrtClick = true
	gIsFirstMegaHint = false
	gIsSecMegaHint = false
	gLives = 3
	updateLives()
	stopTimer()
	document.querySelector('.timer span').innerText = '0.000'
	showHelps()
	gIsManually = false
	gGame.isVictory = false
	switch (gLevel.SIZE) {
		case 4:
			gLevel.MINES = 2
			break;
		case 6:
			gLevel.MINES = 7
			break;
		case 8:
			gLevel.MINES = 14
			break;
		case 12:
			gLevel.MINES = 32
			break;
	}
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
	if (gIsManually) {
		createMines(i, j)
		return
	}
	if (gIsFirstMegaHint) {
		megaHintFirstClick(i, j)
		return
	}
	if (gIsSecMegaHint) {
		megaHintSecClick(i, j)
		return
	}
	if (gIsHint === true) {
		showHint(gBoard, i, j)
		return
	}
	if (gIsFisrtClick) {
		gIsFisrtClick = false
		gGame.isOn = true
		startTimer()
		gBoard[i][j].isRevealed = true
		minesLocation(gBoard, i, j)
		cellLocation(gBoard)
		elCell.classList.add('clicked')
		gGame.revealedCount++
		if (gBoard[i][j].minesAroundCount === 0 && gBoard[i][j].isMine === false) {
			expandReveal(gBoard, i, j)
			// megaExpand(gBoard, i, j)
		}
		if (gBoard[i][j].isMine) {
			showMines(elCell)
			gLives--
			updateLives()
			checkGameOver(gBoard, i, j)
		}
	} else {
		if (gBoard[i][j].isMine) {
			showMines(elCell)
			gLives--
			updateLives()
			checkGameOver(gBoard, i, j)
		} else if (gBoard[i][j].isRevealed === false) {
			if (gBoard[i][j].minesAroundCount === 0) {
				expandReveal(gBoard, i, j)
				// megaExpand(gBoard, i, j)
			}

			elCell.classList.add('clicked')
			gGame.revealedCount++
			gBoard[i][j].isRevealed = true
			checkGameOver(gBoard, i, j)
			if (gBoard[i][j].isMarked) {
				gBoard[i][j].isMarked = false
				gGame.markedCount--
			}
		}
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
			renderCell(i, j, gBoard[i][j].minesAroundCount)
			if (gBoard[i][j].minesAroundCount !== 0) renderCell(i, j, gBoard[i][j].minesAroundCount)
			else {
				renderCell(i, j, EMPTY)
			}
			checkGameOver(board, i, j)
		}
	}
}

function minesLocation(board, celli, cellj) {
	for (let i = 0; i < board.length; i++) {
		for (let j = 0; j < board[0].length; j++) {
			if (board[i][j].isMine === true) return
		}
	}

	var loc = {}
	for (let index = 0; index < gLevel.MINES; index++) {
		loc.i = getRandomInt(0, gLevel.SIZE)
		loc.j = getRandomInt(0, gLevel.SIZE)
		while ((loc.i === celli && loc.j === cellj) ||
			board[loc.i][loc.j].isMine
		) {
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
		gScore = +document.querySelector('.timer span').innerText
		bestScoreShow()
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
		document.querySelector('h1').style.color = 'rgb(229, 232, 232)'
		document.querySelector('h3').style.color = 'rgb(229, 232, 232)'
		document.querySelector('.dark').innerText = 'Light Mode'
		gIsDark = true
	} else {
		document.querySelector('body').style.backgroundColor = 'rgb(242, 242, 242)'
		document.querySelector('.board').style.backgroundColor = 'rgb(124, 109, 109)'
		document.querySelector('.timer').style.color = 'rgb(124, 109, 109)'
		document.querySelector('h1').style.color = 'rgb(62, 96, 176)'
		document.querySelector('h3').style.color = 'rgb(62, 96, 176)'
		document.querySelector('.dark').innerText = 'Dark Mode'
		gIsDark = false
	}
}

function showHints(elBtn) {
	if (gIsHint || gIsFisrtClick) return
	elBtn.classList.add('hint-marked')
	gIsHint = true
}

function showHint(board, col, row) {
	// if (gIsHint) return
	for (var i = col - 1; i <= col + 1; i++) {
		if (i < 0 || i >= board.length) continue
		for (var j = row - 1; j <= row + 1; j++) {
			if (j < 0 || j >= board[0].length) continue
			document.querySelector(`.cell-${i}-${j}`).classList.add('hint-clicked')
		}
	}

	setTimeout(() => {
		for (var i = col - 1; i <= col + 1; i++) {
			if (i < 0 || i >= board.length) continue
			for (var j = row - 1; j <= row + 1; j++) {
				if (j < 0 || j >= board[0].length) continue
				document.querySelector(`.cell-${i}-${j}`).classList.remove('hint-clicked')
			}
		}
		document.querySelector('.hint-marked').style.display = 'none'
		document.querySelector('.hint-marked').classList.remove('hint-marked')
		gIsHint = false
	}, 1500)
}

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
	if (gSafeClick === 0 || gIsSafe || gIsFisrtClick) return
	var loc = {}
	loc.i = getRandomInt(0, gLevel.SIZE)
	loc.j = getRandomInt(0, gLevel.SIZE)
	while (board[loc.i][loc.j].isMine || board[loc.i][loc.j].isRevealed) {
		loc.i = getRandomInt(0, gLevel.SIZE)
		loc.j = getRandomInt(0, gLevel.SIZE)
	}
	document.querySelector(`.cell-${loc.i}-${loc.j}`).classList.add('safe-cell')
	gSafeClick--
	gIsSafe = true

	setTimeout(() => {
		document.querySelector(`.cell-${loc.i}-${loc.j}`).classList.remove('safe-cell')
		gIsSafe = false
	}, 1500)
}

function showHelps() {
	var btns = document.querySelectorAll('.hint-btns button')

	for (let i = 0; i < 3; i++) {
		btns[i].style.display = 'inline'
	}
}

function megaHintBtn() {
	if (gIsFisrtClick) return
	gIsFirstMegaHint = true
}

function megaHintFirstClick(i, j) {
	if (gIsSecMegaHint) return
	gIsSecMegaHint = true
	gIsFirstMegaHint = false
	gMegaHintLoc.i = i
	gMegaHintLoc.j = j
}

function megaHintSecClick(i, j) {
	for (var col = gMegaHintLoc.i; col <= i; col++) {
		for (var row = gMegaHintLoc.j; row <= j; row++) {
			document.querySelector(`.cell-${col}-${row}`).classList.add('megaHintClicked')
		}
	}

	setTimeout(() => {
		for (var col = gMegaHintLoc.i; col <= i; col++) {
			for (var row = gMegaHintLoc.j; row <= j; row++) {
				document.querySelector(`.cell-${col}-${row}`).classList.remove('megaHintClicked')
			}
		}
		gIsSecMegaHint = false
	}, 2000)
}

function manuallyCreate() {
	if (!gIsFisrtClick) return
	gIsManually = !gIsManually
	if (gIsManually) gLevel.MINES -= 2
}

function createMines(i, j) {
	gBoard[i][j].isMine = true
	renderCell(i, j, MINES)
	gLevel.MINES++
}

function bestScoreShow() {
	var bestScore = localStorage.getItem('bestScore')
	if (gScore < bestScore || bestScore === null) {
		localStorage.setItem('bestScore', gScore)
		bestScore = gScore
	}
	document.querySelector('.best-score span').innerText = `${bestScore}`
}

function eliminateMines(board) {
	if (gIsFisrtClick) return
	var minesLocation = []
	var deletedMines = 3

	for (let i = 0; i < gLevel.SIZE; i++) {
		for (let j = 0; j < gLevel.SIZE; j++) {
			if (board[i][j].isMine === true) {
				minesLocation.push({ i, j })
			}
		}
	}
	if (minesLocation.length < 3) return

	var num1 = getRandomInt(0, minesLocation.length)
	var num2 = getRandomInt(0, minesLocation.length - 1)
	var num3 = getRandomInt(0, minesLocation.length - 2)

	while (num1 === num2 || num1 === num3 || num2 === num3) {
		var num1 = getRandomInt(0, minesLocation.length)
		var num2 = getRandomInt(0, minesLocation.length - 1)
		var num3 = getRandomInt(0, minesLocation.length - 2)
	}

	var mine1 = minesLocation.splice(num1, 1)[0]
	var mine2 = minesLocation.splice(num2, 1)[0]
	var mine3 = minesLocation.splice(num3, 1)[0]

	board[mine1.i][mine1.j].isMine = false
	board[mine2.i][mine2.j].isMine = false
	board[mine3.i][mine3.j].isMine = false

	renderCell(mine1.i, mine1.j, setMinesNegsCount(board, mine1.i, mine1.j))
	renderCell(mine2.i, mine2.j, setMinesNegsCount(board, mine2.i, mine2.j))
	renderCell(mine3.i, mine3.j, setMinesNegsCount(board, mine3.i, mine3.j))

	deletedMines--
	resetMinesAroundCount(board)
	cellLocation(gBoard)
}

function resetMinesAroundCount(board) {
	for (let i = 0; i < board.length; i++) {
		for (let j = 0; j < board[0].length; j++) {
			if (board[i][j].isMine === true) continue
			board[i][j].minesAroundCount = 0
		}
	}
}