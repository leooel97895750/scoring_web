import axios from 'axios'

const COUNT_DOWN_MSEC = 500

const START = 0
const UNSAVED = 1
const SAVING = 2
const SAVED = 3
const END = 4

class PauseRequestManager {
	
	constructor(psgFileId, onStateChange) {
		this.psgFileId = psgFileId
		this.onStateChange = onStateChange
		// to save
		this.stages = {}
		this.events = []
		this.currentWindow = null
		
		this.timer = null
		this.requestQueue = []
		this.currentId = 0
		this.sendingRequest = false
		
		this.state = START
		this.toFlush = false
	}
	static get_START() {
		return START
	}
	static get_UNSAVED() {
		return UNSAVED
	}
	static get_SAVING() {
		return SAVING
	}
	static get_SAVED() {
		return SAVED
	}
	static get_END() {
		return END
	}
	async queueRequest() {
		this.state = SAVING
		this.onStateChange(SAVING)
		let data = {}
		data.psgFileId = this.psgFileId
		let stagesArr = []
		let keys = Object.keys(this.stages)
		for (let i = 0; i < keys.length; i++) {
			let epochNum = parseInt(keys[i])
			stagesArr.push({
				epochNum: epochNum,
				stage: this.stages[epochNum]
			})
		}
		data.stages = stagesArr
		this.stages = {}
		data.events = this.events
		this.events = []
		data.jump = this.currentWindow
		this.currentWindow = null
		//await axios.post('/ajax_update_pause', data)
		this.requestQueue.push(data)
		if (this.sendingRequest) return
		this.sendingRequest = true
		while (this.requestQueue.length !== 0) {
			let data = this.requestQueue.shift()
			//console.log(data)
			let updatePauseResult
			try {
				updatePauseResult = await axios.post('/ajax_update_pause', data)
			}
			catch(e) {
				window.alert('無法連線')
				window.location.reload();
			}
			//console.log(updatePauseResult.data)
			if (!updatePauseResult.data.success) {
				alert(updatePauseResult.data.msg)
				window.history.go(0)
				return
			}
		}
		this.sendingRequest = false
		if (this.toFlush) {
			this.state = END
			this.onStateChange(END)
			this.onAllSaved()
		} else {
			this.state = SAVED
			this.onStateChange(SAVED)
		}
	}
	flush(onAllSaved) {
		if (this.state === SAVED || this.state === START) {
			this.state = END
			this.onStateChange(END)
			onAllSaved()
			return
		} else if (this.state === UNSAVED || this.state === SAVING) {
			if (this.timer !== null) {
				clearTimeout(this.timer)
				this.timer = null
			}
			this.toFlush = true
			this.queueRequest()
			this.onAllSaved = onAllSaved
		}
	}
	restartTimer() {
		if (this.timer !== null) {
			clearTimeout(this.timer)
		}
		this.timer = setTimeout(() => {
			this.timer = null
			this.queueRequest()
		}, COUNT_DOWN_MSEC)
		this.state = UNSAVED
		this.onStateChange(UNSAVED)
	}
	editStage(epochNum, stage) {
		if (this.state === END) return
		this.stages[epochNum] = stage
		this.restartTimer()
	}
	editEvent(action, eventId, timeFrom, timeTo, channelId, type) {
		if (this.state === END) return
		let event = {
			action: action,
			timeFrom: timeFrom,
			timeTo: timeTo,
			eventId: eventId,
			channelId: channelId,
			type: type
		}
		this.events.push(event)
		this.restartTimer()
	}
	editCurrentWindow(upperTimeFrom, lowerTimeFrom, upperTimeInterval, lowerTimeInterval, cursorLine) {
		if (this.state === END) return
		this.currentWindow = {
			upperTimeFrom: upperTimeFrom,
			lowerTimeFrom: lowerTimeFrom,
			upperTimeInterval: upperTimeInterval,
			lowerTimeInterval: lowerTimeInterval,
			cursorLine: cursorLine
		}
		this.restartTimer()
	}
}

export default PauseRequestManager