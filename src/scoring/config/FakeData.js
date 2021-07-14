let jump = {
	upperTimeFrom: 0,
	lowerTimeFrom: 0,
	upperTimeInterval: '30 sec',
	lowerTimeInterval: '30 sec',
	cursorLine: 0
}
let upperData = []
for (let i = 0; i < 10; i++) {
	upperData.push({
		lineWidth: 1,
		dataLength: 6000,
		data: function(x) {
			return 0
		},
		min: -1,
		max: 1,
		color: 'black',
		channelId: i + 1,
		zoomable: false
	})
}
let lowerData = []
for (let i = 10; i < 20; i++) {
	lowerData.push({
		lineWidth: 1,
		dataLength: 6000,
		data: function(x) {
			return 0
		},
		min: -1,
		max: 1,
		color: 'black',
		channelId: i + 1,
		zoomable: false
	})
}
export {
	jump,
	upperData,
	lowerData
}