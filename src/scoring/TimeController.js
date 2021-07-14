import constants from './const.js'
const UPPER = 0
const LOWER = 1
function timeIntervalStringToSecond(timeIntervalString) {
	let convertObj = {
		'10 sec': 10,
		'30 sec': 30,
		'1 min': 60,
		'2 min': 120,
		'3 min': 180,
		'5 min': 300,
		'10 min': 600
	}
	return convertObj[timeIntervalString]
}
function timeIntervalSecondToString(timeIntervalSecond) {
	let convertObj = {
		10: '10 sec',
		30: '30 sec',
		60: '1 min',
		120: '2 min',
		180: '3 min',
		300: '5 min',
		600: '10 min'
	}
	return convertObj[timeIntervalSecond]
}
class TimeController {
	constructor(initializerObject, totalEpoch) {
		this.timeFrom = {}
		this.timeFrom[UPPER] = initializerObject.upperTimeFrom // int
		this.timeFrom[LOWER] = initializerObject.lowerTimeFrom // int
		this.timeInterval = {}
		this.timeInterval[UPPER] = timeIntervalStringToSecond(initializerObject.upperTimeInterval) // int
		this.timeInterval[LOWER] = timeIntervalStringToSecond(initializerObject.lowerTimeInterval) // int
		this.totalEpoch = totalEpoch // int
		this.cursorLine = initializerObject.cursorLine // float
	}
	// 前: 未來
	// 後: 過去
	pageDown() {
		// 先檢查有沒有下頁
		let minPagePart = this.timeInterval[UPPER] < this.timeInterval[LOWER] ? UPPER : LOWER // 看上面和下面哪個比較小
		let theOtherPart = minPagePart === UPPER ? LOWER : UPPER
		let nextJumpSec = this.timeInterval[minPagePart] // 要往前幾秒
		let totalSec = this.totalEpoch * 30
		if (this.timeFrom[minPagePart] + nextJumpSec >= totalSec) return // 沒有下一頁
		this.cursorLine += nextJumpSec // 把游標往前幾秒
		this.timeFrom[minPagePart] += nextJumpSec
		let over = this.timeFrom[minPagePart] + this.timeInterval[minPagePart] - totalSec // 超過結尾秒數
		if (over > 0) { // 如果超過
			this.timeFrom[minPagePart] -= over // 超過的部分減回來
			this.cursorLine -= over
		}
		this.cursorLine = parseFloat(this.cursorLine.toFixed(constants.floatToFixed))
		if ((this.cursorLine > this.timeFrom[theOtherPart] + this.timeInterval[theOtherPart]) || // 如果游標在另一頁的顯示範圍外
			(this.cursorLine === this.timeFrom[minPagePart] && this.cursorLine === this.timeFrom[theOtherPart] + this.timeInterval[theOtherPart])) { // 或是在小頁面的開頭卻在另一頁的結尾
			this.timeFrom[theOtherPart] += this.timeInterval[theOtherPart] // 另一半也往前一頁
			let theOtherOver = this.timeFrom[theOtherPart] + this.timeInterval[theOtherPart] - totalSec // 超過結尾秒數
			if (theOtherOver > 0) { // 如果超過
				this.timeFrom[theOtherPart] -= theOtherOver // 超過的部分減回來
			}
		}
	}
	pageUp() {
		//  先檢查有沒有上頁
		let minPagePart = this.timeInterval[UPPER] < this.timeInterval[LOWER] ? UPPER : LOWER // 看上面和下面哪個比較小
		let theOtherPart = minPagePart === UPPER ? LOWER : UPPER
		let lastJumpSec = this.timeInterval[minPagePart] // 要往後幾秒
		if (this.timeFrom[minPagePart] <= 0) return // 沒有上一頁
		this.cursorLine -= lastJumpSec // 把游標往後幾秒
		this.timeFrom[minPagePart] -= lastJumpSec
		let over = -this.timeFrom[minPagePart] // 超過開頭秒數
		if (over > 0) { // 如果超過
			this.timeFrom[minPagePart] += over // 超過的部分加回來
			this.cursorLine += over
		}
		this.cursorLine = parseFloat(this.cursorLine.toFixed(constants.floatToFixed))
		if ((this.cursorLine < this.timeFrom[theOtherPart]) || // 如果游標在另一頁顯示範圍外
			(this.cursorLine === this.timeFrom[minPagePart] + this.timeInterval[minPagePart] && this.cursorLine === this.timeFrom[theOtherPart])) { // 或是在小頁面的結尾卻在另一頁的開頭
			this.timeFrom[theOtherPart] -= this.timeInterval[theOtherPart] // 另一半也往後一頁
			let theOtherOver = -this.timeFrom[theOtherPart] // 超過開頭秒數
			if (theOtherOver > 0) { // 如果超過
				this.timeFrom[theOtherPart] += theOtherOver // 超過的部分加回來
			}
		}
	}
	nextEpoch() {
		// 先檢查有沒有下一個epoch
		let totalSec = this.totalEpoch * 30
		let currentEpoch = this.getCurrentEpoch()
		if (currentEpoch + 1 >= this.totalEpoch) return // 沒有下一個epoch
		this.cursorLine += 30
		this.timeFrom[UPPER] += 30
		this.cursorLine = parseFloat(this.cursorLine.toFixed(constants.floatToFixed))
		if ((this.cursorLine > this.timeFrom[LOWER] + this.timeInterval[LOWER]) || // 如果游標在下半頁的顯示範圍外
			(this.cursorLine === this.timeFrom[UPPER] && this.cursorLine === this.timeFrom[LOWER] + this.timeInterval[LOWER])) { // 或是在上半頁的開頭卻在下半頁的結尾
			this.timeFrom[LOWER] += this.timeInterval[LOWER] // 下半頁也往前一頁
			let theOtherOver = this.timeFrom[LOWER] + this.timeInterval[LOWER] - totalSec // 超過結尾秒數
			if (theOtherOver > 0) { // 如果超過
				this.timeFrom[LOWER] -= theOtherOver // 超過的部分減回來
			}
		}
	}
	lastEpoch() {
		// 先檢查有沒有上一個epoch
		let currentEpoch = this.getCurrentEpoch()
		if (currentEpoch <= 0) return // 沒有上一個epoch
		this.cursorLine -= 30
		this.timeFrom[UPPER] -= 30
		this.cursorLine = parseFloat(this.cursorLine.toFixed(constants.floatToFixed))
		if ((this.cursorLine < this.timeFrom[LOWER]) || // 如果游標在下半頁顯示範圍外
			(this.cursorLine === this.timeFrom[UPPER] + this.timeInterval[UPPER] && this.cursorLine === this.timeFrom[LOWER])) { // 或是在上半頁的結尾卻在下半頁的開頭
			this.timeFrom[LOWER] -= this.timeInterval[LOWER] // 下半頁也往後一頁
			let theOtherOver = -this.timeFrom[LOWER] // 超過開頭秒數
			if (theOtherOver > 0) { // 如果超過
				this.timeFrom[LOWER] += theOtherOver // 超過的部分加回來
			}
		}
	}
	jumpToEpoch(epoch) {
		let cursorRelativeToUpperTimeFrom = this.cursorLine - this.timeFrom[UPPER] // 游標相對於上半頁的秒數
		let startTime = epoch * 30
		this.timeFrom[LOWER] = this.timeFrom[UPPER] = startTime // 將上下的開始時間都設為要跳躍的epoch
		this.cursorLine = startTime + cursorRelativeToUpperTimeFrom // 游標一樣設為相對於上半頁的秒數

		let totalSec = this.totalEpoch * 30
		let theOtherOver = this.timeFrom[LOWER] + this.timeInterval[LOWER] - totalSec // 超過結尾秒數
		if (theOtherOver > 0) { // 如果超過
			this.timeFrom[LOWER] -= theOtherOver // 超過的部分減回來
		}
	}
	moveCursor(sec) {
		sec = parseFloat(sec.toFixed(constants.floatToFixed))
		let upperTimeFrom = this.timeFrom[UPPER]
		let upperTimeTo = upperTimeFrom + this.timeInterval[UPPER]
		this.cursorLine = sec
		if (sec < upperTimeFrom || sec > upperTimeTo) { // 如果移動後不在上半頁的範圍內
			let quotient = Math.floor(sec / this.timeInterval[UPPER])
			let remainder = parseFloat((sec % this.timeInterval[UPPER]).toFixed(constants.floatToFixed))
			if (remainder === 0 && // 如果移動後游標剛好在邊界
				(quotient * this.timeInterval[UPPER] === this.timeFrom[LOWER] + this.timeInterval[LOWER])) { // 而且在下半頁的結尾
				this.timeFrom[UPPER] = (quotient - 1) * this.timeInterval[UPPER]
			} else {
				this.timeFrom[UPPER] = quotient * this.timeInterval[UPPER]
			}
		}
	}
	setUpperTimeInterval(upperTimeInterval) {
		this.timeInterval[UPPER] = timeIntervalStringToSecond(upperTimeInterval)
		if (this.timeInterval[UPPER] === this.timeInterval[LOWER]) { // 如果上下時間長度一樣
			// 就把上面設成跟下面一樣
			this.timeFrom[UPPER] = this.timeFrom[LOWER]
		} else {
			let quotient = Math.floor(this.cursorLine / this.timeInterval[UPPER])
			let remainder = parseFloat((this.cursorLine % this.timeInterval[UPPER]).toFixed(constants.floatToFixed))
			if (remainder === 0 && // 如果設定區間長度後游標剛好在邊界
				(quotient * this.timeInterval[UPPER] === this.timeFrom[LOWER] + this.timeInterval[LOWER])) { // 而且在下半頁的結尾
				this.timeFrom[UPPER] = (quotient - 1) * this.timeInterval[UPPER]
			} else {
				this.timeFrom[UPPER] = quotient * this.timeInterval[UPPER]
			}
		}
	}
	setLowerTimeInterval(lowerTimeInterval) {
		let currentEpoch = this.getCurrentEpoch()
		let totalSec = this.totalEpoch * 30
		this.timeInterval[LOWER] = timeIntervalStringToSecond(lowerTimeInterval)
		if (this.timeInterval[LOWER] === this.timeInterval[UPPER]) { // 如果上下時間長度一樣
			// 就把下面設成跟上面一樣
			this.timeFrom[LOWER] = this.timeFrom[UPPER]
		} else {
			this.timeFrom[LOWER] = currentEpoch * 30
			let over = this.timeFrom[LOWER] + this.timeInterval[LOWER] - totalSec
			if (over > 0) {
				this.timeFrom[LOWER] -= over
			}
		}
	}
	getCurrentEpoch() {
		let quotient = Math.floor(this.cursorLine / 30)
		let remainder = parseFloat((this.cursorLine % 30).toFixed(constants.floatToFixed))
		//console.log('remainder:', remainder)
		//console.log(Math.log(remainder))
		if (remainder === 0) {
			//console.log('cursorLine:', this.cursorLine, 'upper end:', this.timeFrom[UPPER] + this.timeInterval[UPPER])
			if (this.cursorLine === this.timeFrom[UPPER] + this.timeInterval[UPPER]) {
				quotient--
			}
		}
		return quotient
	}
	getUpperSecondFrom() {
		return this.timeFrom[UPPER]
	}
	getUpperSecondTo() {
		return this.timeFrom[UPPER] + this.timeInterval[UPPER]
	}
	getUpperTimeInterval() {
		//console.log(this.timeInterval[UPPER])
		return timeIntervalSecondToString(this.timeInterval[UPPER])
	}
	getLowerSecondFrom() {
		return this.timeFrom[LOWER]
	}
	getLowerSecondTo() {
		return this.timeFrom[LOWER] + this.timeInterval[LOWER]
	}
	getLowerTimeInterval() {
		return timeIntervalSecondToString(this.timeInterval[LOWER])
	}
	getCursorSecond() {
		return this.cursorLine
	}
}

export default TimeController