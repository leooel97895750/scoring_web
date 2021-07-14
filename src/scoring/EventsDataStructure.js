function secondToEpochFrom(sec) {
	let epoch = Math.floor(sec / 30)
	if (sec % 30 === 0) {
		epoch--
	}
	return epoch
}
function secondToEpochTo(sec) {
	let epoch = Math.floor(sec / 30)
	return epoch
}
class EventsDataStructure {
	constructor(events, colorsForChannels, mappingIn, mappingOut) {
		//console.log(events)
		let eventIdToEventObject = {}
		let epochNumToEventId = {}
		let maxEventId = -1
		for (let i = 0; i < events.length; i++) {
			let event = events[i]
			let eventInstance = Object.assign({ active: true }, event)
			// 確認mapping in
			if (mappingIn[eventInstance.channelId] !== undefined) {
				eventInstance.channelId = mappingIn[eventInstance.channelId]
			}
			// 加入eventIdToEventObject
			eventIdToEventObject[event.eventId] = eventInstance
			// 加入epochNumToEventId
			let epochFrom = secondToEpochFrom(event.secondFrom)
			//console.log(event.from, event.to)
			let epochTo = secondToEpochTo(event.secondTo)
			//console.log(epochFrom, epochTo)
			for (let epoch = epochFrom; epoch <= epochTo; epoch++) {
				if (epochNumToEventId[epoch] === undefined) {
					epochNumToEventId[epoch] = new Set()
				}
				epochNumToEventId[epoch].add(event.eventId)
			}
			// 更新最大ID
			maxEventId = Math.max(maxEventId, event.eventId)
		}
		this.eventIdToEventObject = eventIdToEventObject
		this.epochNumToEventId = epochNumToEventId
		//console.log(eventIdToEventObject)
		//console.log(epochNumToEventId)
		this.nextEventId = maxEventId + 1
		this.colorsForChannels = Object.assign({}, colorsForChannels)
		this.mappingIn = Object.assign({}, mappingIn)
		this.mappingOut = Object.assign({}, mappingOut)
		
		
	}
	getEventObjectByEventId(eventId) {
		return Object.assign({}, this.eventIdToEventObject[eventId])
	}
	getEventObjectsByEventIds(eventIds) {
		let result = []
		for (let i = 0; i < eventIds.length; i++) {
			let eventObject = Object.assign({}, this.eventIdToEventObject[eventIds[i]])
			eventObject.color = this.colorsForChannels[eventObject.channelId][eventObject.type]
			result.push(eventObject)
			// 確認mapping out
			if (this.mappingOut[eventObject.channelId] !== undefined) {
				let channelArray = Array.from(this.mappingOut[eventObject.channelId])
				for (let j = 0; j < channelArray.length; j++) {
					let mappingOutObject = Object.assign({}, eventObject)
					mappingOutObject.channelId = channelArray[j]
					mappingOutObject.color = this.colorsForChannels[mappingOutObject.channelId][mappingOutObject.type]
					result.push(mappingOutObject)
				}
			}
		}
		return result
	}
	getEventIdsByEpoch(epoch) {
		if (this.epochNumToEventId[epoch] === undefined) return []
		return Array.from(this.epochNumToEventId[epoch])
	}
	getEventIdsByTimeRangeAndChannelIds(timeFrom, timeTo, channelIds) {
		let epochNum = Math.floor((timeTo - timeFrom) / 30)
		epochNum = epochNum === 0 ? 1 : epochNum
		let epochFrom = Math.floor(timeFrom / 30)
		let resultSet = new Set()
		for (let i = 0; i < epochNum; i++) {
			let epoch = i + epochFrom
			if (this.epochNumToEventId[epoch] === undefined) continue
			let eventIds = Array.from(this.epochNumToEventId[epoch])
			for (let j = 0; j < eventIds.length; j++) {
				let eventId = eventIds[j]
				let eventObject = this.eventIdToEventObject[eventId]
				if ((eventObject.secondFrom <= timeTo && eventObject.secondTo >= timeFrom) && // 如果在時間範圍內
					channelIds.has(eventObject.channelId)) { // 且屬於要搜尋的channel
					resultSet.add(eventId)
				}
			}
		}
		return Array.from(resultSet)
	}
	addEvent(channelId, secondFrom, secondTo, type, priority) {
		const union = (a, b) => Array.from(new Set([...a, ...b]))
		// 確認mapping in
		if (this.mappingIn[channelId] !== undefined) {
			channelId = this.mappingIn[channelId]
		}
		let epochFrom = secondToEpochFrom(secondFrom)
		let epochTo = secondToEpochTo(secondTo)
		// TODO: 應該有更有效率的演算法
		let eventsToCheck = new Set()
		for (let epoch = epochFrom; epoch <= epochTo; epoch++) {
			if (this.epochNumToEventId[epoch] === undefined) continue
			eventsToCheck = union(eventsToCheck, this.epochNumToEventId[epoch])
		}
		let minSecondFrom = secondFrom
		let maxSecondTo = secondTo
		// 有重疊的事件ID都放進來
		let overlappedEvents = []
		// 找出最早的事件
		let earliestEvent = null
		eventsToCheck.forEach((currentValue, currentKey, set) => {
			let eventToCheck = this.eventIdToEventObject[currentValue]
			// 確認是不是在同一個channel上
			if (eventToCheck.channelId !== channelId) return
			// 確認是否重疊
			if (secondFrom <= eventToCheck.secondTo && secondTo >= eventToCheck.secondFrom) { // 如果有重疊
				minSecondFrom = Math.min(minSecondFrom, eventToCheck.secondFrom)
				maxSecondTo = Math.max(maxSecondTo, eventToCheck.secondTo)
				overlappedEvents.push(eventToCheck.eventId)
				if (earliestEvent === null) { // 第一次
					earliestEvent = eventToCheck
				} else if (earliestEvent.secondFrom > eventToCheck.secondFrom) { // 更新為更早的事件
					earliestEvent = eventToCheck
				}
			}
		})
		// 把所有重疊的事件刪掉
		for (let i = 0; i < overlappedEvents.length; i++) {
			this.deleteEvent(overlappedEvents[i])
		}
		// 看eventType是甚麼，如果優先度高，就是設定的事件，如果優先度低，就是最早的事件
		//console.log(earliestEvent)
		//console.log('priority', priority)
		if (priority === false && earliestEvent !== null) {
			type = earliestEvent.type
		}
		// 把新的事件加進來
		let event = {
			secondFrom: minSecondFrom,
			secondTo: maxSecondTo,
			type: type,
			channelId: channelId,
			isActive: true,
			eventId: this.nextEventId 
		}
		// 加入eventIdToEventObject
		this.eventIdToEventObject[this.nextEventId] = event
		// 加入epochNumToEventId
		for (let epoch = secondToEpochFrom(minSecondFrom); epoch <= secondToEpochTo(maxSecondTo); epoch++) {
			if (this.epochNumToEventId[epoch] === undefined) {
				this.epochNumToEventId[epoch] = new Set()
			}
			this.epochNumToEventId[epoch].add(this.nextEventId)
		}
		// 建立回傳物件
		let resultObject = {
			overlappedEventId: overlappedEvents,
			eventId: this.nextEventId,
			type: type
		}
		this.nextEventId++
		//console.log(this.epochNumToEventId)
		//console.log(this.eventIdToEventObject)
		return resultObject
	}
	deleteEvent(eventId) {
		let event = this.eventIdToEventObject[eventId]
		if (event === undefined) return
		event.isActive = false
		let epochFrom = secondToEpochFrom(event.secondFrom)
		let epochTo = secondToEpochTo(event.secondTo)
		for (let epoch = epochFrom; epoch <= epochTo; epoch++) {
			if (this.epochNumToEventId[epoch] !== undefined) this.epochNumToEventId[epoch].delete(event.eventId)
		}
	}
	setEventType(eventId, type) {
		this.eventIdToEventObject[eventId].type = type
	}
}

export default EventsDataStructure