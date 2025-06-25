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
var gIsFisrtClick = true

function onInit() {
	gBoard = buildBoard()
	cellLocation(gBoard)
	renderBoard(gBoard)
	closeModal()
	gIsFisrtClick = true
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
	// for (var mine = 0; mine < gLevel.MINES; mine++){
	// 	board[getRandomInt(0, gLevel.SIZE)][getRandomInt(0, gLevel.SIZE)] = MINES
	// }
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
			strHTML += `<td class="hidden ${className}" onclick="onCellClicked(this, ${i}, ${j})" oncontextmenu="onCellMarked(this, ${i}, ${j})">${cell}</td>`
		}

		strHTML += '</tr>'
	}
	const elContainer = document.querySelector('.board')
	elContainer.innerHTML = strHTML
}

function cellLocation(board) {
	for (let i = 0; i < board.length; i++) {

		for (let j = 0; j < board[0].length; j++) {
			if (board[i][j] === MINES) continue
			setMinesNegsCount(board, i, j)
		}
	}
}

function setMinesNegsCount(board, col, row) {
	for (var i = col - 1; i <= col + 1; i++) {
		if (i < 0 || i >= board.length) continue
		for (var j = row - 1; j <= row + 1; j++) {
			if (i === col && j === row) continue
			if (j < 0 || j >= board[0].length) continue
			if (board[i][j] === MINES) {
				board[col][row].minesAroundCount++
				renderCell(col, row, board[col][row].minesAroundCount)
			}
		}
	}
}

function onCellClicked(elCell, i, j) {
	if (gIsFisrtClick) {
		gIsFisrtClick = false
		gGame.isOn = true
		minesLocation(gBoard, i, j)
		cellLocation(gBoard)
		elCell.classList.remove('hidden')
	} else {
		elCell.classList.remove('hidden')
		checkGameOver(gBoard, i, j)
	}
}

function onCellMarked(elCell, i, j) {
event.preventDefault()

}

function checkGameOver(board, i, j) {
	if (board[i][j] === MINES) gameOver()
}

function expandReveal(board, elCell, i, j) {

}

function minesLocation(board, celli, cellj) {
	board[0][0] = MINES
	board[3][3] = MINES
	renderCell(0, 0, MINES)
	renderCell(3, 3, MINES)
	// var loc = {}
	// for (let index = 0; index < gLevel.MINES; index++) {
	// 	loc.i = getRandomInt(0, gLevel.SIZE)
	// 	loc.j = getRandomInt(0, gLevel.SIZE)
	// 	while (loc.i === celli && loc.j === cellj) {
	// 		loc.i = getRandomInt(0, gLevel.SIZE)
	// 		loc.j = getRandomInt(0, gLevel.SIZE)
	// 	}
	// 	board[loc.i][loc.j] = MINES
	// 	renderCell(loc.i, loc.j, MINES)
	// }
}

function renderCell(i, j, value) {
	const elCell = document.querySelector(`.cell-${i}-${j}`)
	elCell.innerHTML = value
}

function openModal(msg) {
	const elModal = document.querySelector('.modal')
	const elMsg = elModal.querySelector('.msg')
	elMsg.innerText = msg
	elModal.style.display = 'block'
}

function gameOver() {
	gGame.isOn = false
	var msg = gGame.isVictory ? 'You Won!!!' : 'Game Over'
	openModal(msg)
}

function closeModal() {
	const elModal = document.querySelector('.modal')
	elModal.style.display = 'none'
}
