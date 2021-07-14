function labelsGenerator(upper) {
	if (upper) {
		return [
			{
				label: '0.5',
				gravity: 'right',
				channelId: 1,
				value: 0.5,
				xOffset: -5,
				yOffset: 0,
				color: 'black',
				font: '10px Arial'
			},
			{
				label: '0',
				gravity: 'right',
				channelId: 1,
				value: 0,
				xOffset: -5,
				yOffset: 0,
				color: 'black',
				font: '10px Arial'
			},
			{
				label: '-0.5',
				gravity: 'right',
				channelId: 1,
				value: -0.5,
				xOffset: -5,
				yOffset: 0,
				color: 'black',
				font: '10px Arial'
			},
			{
				label: 'sin',
				gravity: 'center',
				channelId: 1,
				value: 0,
				xOffset: 0,
				yOffset: 0,
				color: 'black',
				font: '20px Arial'
			},
			{
				label: 'func_2',
				gravity: 'center',
				channelId: 2,
				value: 0,
				xOffset: 0,
				yOffset: -10,
				color: '#000000',
				font: '20px Arial'
			},
			{
				label: '1V',
				gravity: 'center',
				channelId: 2,
				value: 0,
				xOffset: 0,
				yOffset: 10,
				color: 'red',
				font: '15px Arial'
			},
			{
				label: 'func_3',
				gravity: 'center',
				channelId: 3,
				value: 0,
				xOffset: 0,
				yOffset: 0,
				color: '#000000',
				font: '20px Arial'
			}
		]
	} else {
		return [
			{
				label: 'func_4',
				gravity: 'center',
				channelId: 4,
				value: 0,
				xOffset: 0,
				yOffset: 0,
				color: '#000000',
				font: '20px Arial'
			},
			{
				label: 'func_5',
				gravity: 'center',
				channelId: 5,
				value: 0,
				xOffset: 0,
				yOffset: 0,
				color: '#000000',
				font: '20px Arial'
			},
			{
				label: 'func_6',
				gravity: 'center',
				channelId: 6,
				value: 0,
				xOffset: 0,
				yOffset: 0,
				color: '#000000',
				font: '20px Arial'
			}
		]
	}
}

export default labelsGenerator