class DataManager {
	constructor(channels, totalEpoch) {
		let channelIdToChannelState = {
			true: {}, // upper
			false: {} // lower
		}
		//console.log(channels)
		for (let i = 0; i < channels.length; i++) {
			let channel = channels[i]
			//console.log(channel)
			channelIdToChannelState[channel.upper][channel.channelId] = Object.assign({ zoom: 0 }, channel)
		}
		this.channelIdToChannelState = channelIdToChannelState
		this.epochToArrayBuffer = {
			true: {}, // upper
			false: {} // lower
		}
		this.totalEpoch = totalEpoch
	}
	checkData(secondFrom, secondTo, upper) {
		// 從第幾個epoch開始
		let epochFrom = Math.floor(secondFrom / 30)
		// 到第幾個epoch結束
		let epochTo = Math.floor(secondTo / 30)
		if (secondTo % 30 === 0) epochTo--
		let epochsHaveNoData = []
		//console.log('epoch', upper, epochFrom, epochTo)
		for (let epoch = epochFrom; epoch <= epochTo; epoch++) {
			// 如果那個epoch沒有資料就把他的編號加進陣列裡
			if (this.epochToArrayBuffer[upper][epoch] === undefined) {
				epochsHaveNoData.push(epoch)
			}
		}
		return epochsHaveNoData
	}
	checkDataTimePoint(second, upper) {
		let epoch = Math.floor(second / 30)
		if (this.epochToArrayBuffer[upper][epoch] === undefined) {
			return [epoch]
		}
		return []
	}
	hasData(secondFrom, secondTo, upper) {
		let epochsHaveNoData = this.checkData(secondFrom, secondTo, upper)
		return epochsHaveNoData.length === 0
	}
	setData(data, epoch, upper) {
		this.epochToArrayBuffer[upper][epoch] = data
	}
	getData(secondFrom, secondTo, upper) {
		// 看是上半部還是下半部的狀態
		let halfChannelState = this.channelIdToChannelState[upper]
		// 取的那一半全部的陣列ID
		let halfChannelIds = Object.keys(halfChannelState)
		let result = [] // 最後回傳的陣列
		for (let i = 0; i < halfChannelIds.length; i++) {
			// 取得其中一個channel的狀態
			let oneChannelState = halfChannelState[halfChannelIds[i]]
			let channelData = {} // 最後要回傳的其中一個element
			// 設定lineWidth
			channelData.lineWidth = oneChannelState.lineWidth
			// 設定dataLength
			let fs = (oneChannelState.dataLength - 1) / 30
			let totalSecond = secondTo - secondFrom
			let dataLength = totalSecond * fs + 1
			channelData.dataLength = dataLength
			// 設定資料
			let epochFrom = Math.floor(secondFrom / 30) // 從哪一個epoch開始
			let epochFromSecond = epochFrom * 30 // epoch開始秒數
			let secondOffset = secondFrom - epochFromSecond // 目標秒數相當於偏移epoch開始秒數幾秒
			let pointOffset = secondOffset * fs // 相當於偏移幾個資料點
			let epochTo = Math.floor(secondTo / 30) // 到哪一個epoch結束
			epochTo -= secondTo % 30 === 0 ? 1 : 0
			let floatArrays = [] // 將所有要用到的epoch資料轉成float32array存進這個陣列
			for (let epoch = epochFrom; epoch <= epochTo; epoch++) {
				if (this.epochToArrayBuffer[upper][epoch] === undefined) {
					floatArrays = null
					break
				}
				//console.log('array buffer:', this.epochToArrayBuffer[upper][epoch])
				//console.log('offset:', oneChannelState.offset)
				//console.log('length:', oneChannelState.dataLength)
				let floatArray = new Float32Array(this.epochToArrayBuffer[upper][epoch], oneChannelState.offset, oneChannelState.dataLength)
				//console.log('has data', halfChannelIds[i], floatArray[0], floatArray[1], floatArray[2])
				floatArrays.push(floatArray)
			}
			// 資料點轉成float數值
			let pointToValue = function(x) {
				if (floatArrays === null) return 0
				let samplesInOneEpoch = oneChannelState.dataLength - 1 // 一個epoch有幾個資料點
				let whichArray = Math.floor(x / samplesInOneEpoch) // 看是第幾個array
				let whichIndex = x % samplesInOneEpoch // 的第幾個數值
				if (whichIndex === 0 && whichArray !== 0) {
					whichArray--
					whichIndex += samplesInOneEpoch
				}
				//console.log('whichArray:', whichArray)
				return floatArrays[whichArray][whichIndex]
			}
			let data = function(x) {
				return pointToValue(x + pointOffset)
			}
			channelData.data = data
			// 設定min, max
			let min
			let max
			if(oneChannelState.channelId !== 16){
				let originalRange = oneChannelState.originalMax - oneChannelState.originalMin
				let originalHalfRange = originalRange / 2
				let center = (oneChannelState.originalMax + oneChannelState.originalMin) / 2
				let halfRange = originalHalfRange * Math.pow(2, oneChannelState.zoom)
				min = center - halfRange
				max = center + halfRange
				// console.log(oneChannelState.zoom)
			}
			else{
				// console.log(oneChannelState.zoom)
				// let zoomMax = [100, 87.5, 81.25, 78.125]
				// let zoomMin = [50, 62.5, 68.75, 71.875]
				max = 100
				min = 50
				//console.log(min, max)
			}
			channelData.min = min
			channelData.max = max
			// 設定顏色
			channelData.color = oneChannelState.color
			// 設定channelId
			channelData.channelId = oneChannelState.channelId
			// 設定是否可縮放
			channelData.zoomable = oneChannelState.zoomable
			
			channelData.draggable = oneChannelState.draggable
			
			channelData.showDesat = oneChannelState.showDesat
			
			channelData.showLocalExtreme = oneChannelState.showLocalExtreme
			
			channelData.zoom = oneChannelState.zoom
			// 存進結果
			result.push(channelData)
		}
		return result
	}
	zoomChannel(channelId, up) {
		let channelState = this.channelIdToChannelState[true][channelId] === undefined ?
			this.channelIdToChannelState[false][channelId] : this.channelIdToChannelState[true][channelId]
		channelState.zoom += up ? 1 : -1
		channelState.zoom = channelState.zoom > channelState.maxZoom ? channelState.maxZoom :
			channelState.zoom < channelState.minZoom ? channelState.minZoom : channelState.zoom
	}
	getChannelRange(upper, channelId) {
		let oneChannelState = this.channelIdToChannelState[upper][channelId]
		let originalRange = oneChannelState.originalMax - oneChannelState.originalMin
		let range = originalRange * Math.pow(2, oneChannelState.zoom)
		return range
	}
	getBuffered() {
		let buffered = new Array(this.totalEpoch)
		for (let i = 0; i < buffered.length; i++) {
			buffered[i] = this.epochToArrayBuffer[true][i] !== undefined && this.epochToArrayBuffer[false][i] !== undefined
		}
		return buffered
	}
	getNextEpochToBuffer(currentEpoch) {
		let epoch = currentEpoch + 1
		let result = {}
		while (epoch < this.totalEpoch && epoch - currentEpoch < 30) {
			result.upper = this.epochToArrayBuffer[true][epoch] === undefined
			result.lower = this.epochToArrayBuffer[false][epoch] === undefined
			if (result.upper || result.lower) {
				result.epoch = epoch
				return result
			}
			epoch++
		}
		return null
	}
}

export default DataManager