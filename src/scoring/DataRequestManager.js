class DataRequestManager {
	constructor(psgFileId) {
		this.psgFileId = psgFileId
		this.runningRequests = {
			true: {}, // upper
			false: {} // lower
		}
		this.completeRequest = {
			true: new Set(), // upper
			false: new Set() // lower
		}
		this.results = []
	}
	setRequest(newUpperRequests, newLowerRequests, cb) { // 新增一群請求
		//console.log('set request:', newUpperRequests, newLowerRequests)
		this.cb = cb
		//console.log('running requests', this.runningRequests)
		let newRequests = {
			true: newUpperRequests,
			false: newLowerRequests
		}
		//console.log(newRequests)
		let requestUrl = {
			true: '/ajax_epoch_upper',
			false: '/ajax_epoch_lower'
		}
		let upperLowerKeys = [true, false]
		for (let i = 0; i < upperLowerKeys.length; i++) {
			let upper = upperLowerKeys[i] // 上半部或下半部
			//let halfRunningRequests = this.runningRequests[upper] // 正在請求中的xhr
			//let halfCompleteRequest = this.completeRequest[upper] // 已完成的集合
			let halfNewRequests = newRequests[upper] // 新的請求epoch
			let halfRunningRequestKeys = Object.keys(this.runningRequests[upper])
			let halfNewRequestsSet = new Set(halfNewRequests)
			// 對正在進行中的請求一個一個檢查
			for (let j = 0; j < halfRunningRequestKeys.length; j++) {
				let runningEpochNum = parseInt(halfRunningRequestKeys[j])
				if (!halfNewRequestsSet.has(runningEpochNum)) { // 如果這個進行中的請求並沒有在新的請求中
					//console.log('new request doesnt contain', upper, runningEpochNum)
					this.runningRequests[upper][runningEpochNum].abort() // 就強制結束
					delete this.runningRequests[upper][runningEpochNum] // 並且刪除
					//console.log('abort xhr', this.runningRequests)
				}
			}
			// 將新的請求一個一個建立
			for (let j = 0; j < halfNewRequests.length; j++) {
				let epoch = halfNewRequests[j]
				//console.log('is running', !(this.runningRequests[upper][epoch] === undefined), 'is complete', this.completeRequest[upper].has(epoch))
				if (this.runningRequests[upper][epoch] === undefined && // 如果新的請求沒有進行中
					!this.completeRequest[upper].has(epoch)) { // 而且也沒有已完成
					// 就建立
					//console.log('create xhr', upper, epoch)
					let xhr = new XMLHttpRequest()
					xhr.open('POST', requestUrl[upper], true)
					xhr.responseType = 'arraybuffer'
					xhr.onload = (e) => {
						let resultObject = {
							data: xhr.response,
							epoch: epoch,
							upper: upper
						}
						this.results.push(resultObject) // 將結果存起來
						this.completeRequest[upper].add(epoch) // 存到完成的集合
						delete this.runningRequests[upper][epoch] // 並且將請求刪除
						//console.log('delete xhr', this.runningRequests)
						//console.log(this.runningRequests)
						//console.log('request complete', upper, epoch)
						if (Object.keys(this.runningRequests[true]).length === 0 &&
							Object.keys(this.runningRequests[false]).length === 0) { // 如果已經沒有其他請求正在進行中
							//console.log('all complete')
							let toCb = this.results
							this.results = [] // 將節果清空
							// 將完成的集合清空
							this.completeRequest[true] = new Set()
							this.completeRequest[false] = new Set()
							this.cb(toCb) // 呼叫cb，將這一批結果傳回去
						}
					}
					xhr.setRequestHeader('Content-Type', 'application/json')
					xhr.send(JSON.stringify({
						psgFileId: this.psgFileId,
						epochNum: epoch
					}))
					//console.log('before add xhr', this.runningRequests)
					this.runningRequests[upper][epoch] = xhr // 加入正在進行中
					//console.log('add xhr', this.runningRequests)
				}
			}
		}
		// 檢查一下經過新增和刪除請求之後，是否還有逕行中的請求，若沒有直接cb
		if (Object.keys(this.runningRequests[true]).length === 0 &&
			Object.keys(this.runningRequests[false]).length === 0) {
			// 檢查有沒有結果沒回傳
			if (this.results.length !== 0) {
				let toCb = this.results
				this.results = [] // 將節果清空
				// 將完成的集合清空
				this.completeRequest[true] = new Set()
				this.completeRequest[false] = new Set()
				this.cb(toCb) // 呼叫cb，將這一批結果傳回去
			}	
		}
	}
	// 強制清空並回傳結果
	clearResults() {
		let results = this.results
		this.results = []
		this.completeRequest[true] = new Set()
		this.completeRequest[false] = new Set()
		return results
	}
}

export default DataRequestManager