function getVerticalLines(time) {
	let verticalLines10 = []
	for (let i = 0; i <= 20; i++) {
		verticalLines10.push({
			second: i / 2,
			dashed: i % 5 !== 0,
			color: '#73e68c'
		})
	}
	let verticalLines30 = []
	for (let i = 0; i <= 60; i++) {
		verticalLines30.push({
			second: i / 2,
			dashed: i % 5 !== 0,
			color: '#73e68c'
		})
	}
	let verticalLines60 = []
	for (let i = 0; i <= 2; i++) {
		verticalLines60.push({
			second: i * 30,
			dashed: false,
			color: '#73e68c'
		})
	}
	let verticalLine120 = []
	for (let i = 0; i <= 4; i++) {
		verticalLine120.push({
			second: i * 30,
			dashed: false,
			color: '#73e68c'
		})
	}
	let verticalLine180 = []
	for (let i = 0; i <= 6; i++) {
		verticalLine180.push({
			second: i * 30,
			dashed: false,
			color: '#73e68c'
		})
	}
	let verticalLine300 = []
	for (let i = 0; i <= 10; i++) {
		verticalLine300.push({
			second: i * 30,
			dashed: false,
			color: '#73e68c'
		})
	}
	let verticalLine600 = []
	for (let i = 0; i <= 20; i++) {
		verticalLine600.push({
			second: i * 30,
			dashed: false,
			color: '#73e68c'
		})
	}
	let lines = {
		'10 sec': verticalLines10,
		'30 sec': verticalLines30,
		'1 min': verticalLines60,
		'2 min': verticalLine120,
		'3 min': verticalLine180,
		'5 min': verticalLine300,
		'10 min': verticalLine600
	}
	return lines[time]
}
function getUpperHorizontalLines() {
	return [{
		channelId: 2,
		value: 37.5,
		dashed: false,
		color: '#73e68c',
		zoomToShow: false
	}, {
		channelId: 2,
		value: -37.5,
		dashed: false,
		color: '#73e68c',
		zoomToShow: false
	}, {
		channelId: 3,
		value: 37.5,
		dashed: false,
		color: '#73e68c',
		zoomToShow: false
	}, {
		channelId: 3,
		value: -37.5,
		dashed: false,
		color: '#73e68c',
		zoomToShow: false
	}, {
		channelId: 4,
		value: 37.5,
		dashed: false,
		color: '#73e68c',
		zoomToShow: false
	}, {
		channelId: 4,
		value: -37.5,
		dashed: false,
		color: '#73e68c',
		zoomToShow: false
	}, {
		channelId: 2,
		value: 0,
		dashed: false,
		color: '#73e68c',
		zoomToShow: true
	}, {
		channelId: 3,
		value: 0,
		dashed: false,
		color: '#73e68c',
		zoomToShow: true
	}, {
		channelId: 4,
		value: 0,
		dashed: false,
		color: '#73e68c',
		zoomToShow: true
	}]
}
function getLowerHorizontalLines() {
	return [{
		channelId: 16,
		value: 50,
		dashed: false,
		color: '#73e68c',
		zoomToShow: false
	}, {
		channelId: 16,
		value: 60,
		dashed: false,
		color: '#73e68c',
		zoomToShow: false
	}, {
		channelId: 16,
		value: 70,
		dashed: false,
		color: '#73e68c',
		zoomToShow: false
	}, {
		channelId: 16,
		value: 80,
		dashed: false,
		color: '#73e68c',
		zoomToShow: false
	}, {
		channelId: 16,
		value: 90,
		dashed: false,
		color: '#73e68c',
		zoomToShow: false
	}, {
		channelId: 16,
		value: 100,
		dashed: false,
		color: '#73e68c',
		zoomToShow: false
	}, {
		channelId: 20,
		value: -2,
		dashed: false,
		color: '#73e68c',
		zoomToShow: false
	}, {
		channelId: 20,
		value: -1,
		dashed: false,
		color: '#73e68c',
		zoomToShow: false
	}, {
		channelId: 20,
		value: 0,
		dashed: false,
		color: '#73e68c',
		zoomToShow: false
	}, {
		channelId: 20,
		value: 1,
		dashed: false,
		color: '#73e68c',
		zoomToShow: false
	}, {
		channelId: 20,
		value: 2,
		dashed: false,
		color: '#73e68c',
		zoomToShow: false
	}]
}
export {
	getVerticalLines,
	getUpperHorizontalLines,
	getLowerHorizontalLines
}