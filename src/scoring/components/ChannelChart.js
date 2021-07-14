import React, {Component} from 'react'
//import PropTypes from 'prop-types'
import styles from './css/fillStyle.module.css'

function localMax(val1, val2, val3) {
	return (val2 > val1 && val2 >= val3) || (val2 >= val1 && val2 > val3)
}
function localMin(val1, val2, val3) {
	return (val2 < val1 && val2 <= val3) || (val2 <= val1 && val2 < val3)
}
function getMode(arr) {
	let result = {}
	arr.forEach(key => {
	  result[key] = (result[key] || 0) + 1
	})
	let max = 0
	let mode = []
	
	for (let key in result) {
	  if (result[key] > max) {
		max = result[key]
		mode = [key]
	  } 
	  else if (result[key] === max){
		mode.push(key)
	  }
	}
	return mode
}

class ChannelChart extends Component {
	constructor(props) {
		super(props)
		this.updateCanvas = this.updateCanvas.bind(this)
		this.ref = React.createRef()
	}
	render() {
		//console.log('channel render:', this.props.chartKey)
		return <canvas
			ref={this.ref}
			width={this.props.width}
			height={this.props.height}
			className={styles.fill}></canvas>
	}
	shouldComponentUpdate(nextProps, nextState) {
		//console.log(nextProps.chartKey)
		//console.log(this.props.chartKey)
		return nextProps.chartKey !== this.props.chartKey
	}
	updateCanvas() {
		//console.log('channel update:', this.props.chartKey)
		//console.log(this.props.data(0), this.props.data(1), this.props.data(2))
		let canvas = this.ref.current
		let ctx = canvas.getContext('2d')
		ctx.clearRect(0, 0, canvas.width, canvas.height)
		ctx.lineWidth = this.props.lineWidth
		ctx.strokeStyle = this.props.color
		ctx.beginPath()
		let localExtremeSearchQueue = []
		let showValuePosition = []
		let pointX = this.props.xTransform(0)
		let dataY = this.props.data(0)
		localExtremeSearchQueue.push(dataY)
		let pointY = this.props.yTransform(dataY)
		let dataValuesX = []
		let dataValuesY = []
		
		ctx.moveTo(pointX, pointY)
		// 2021/1/18 縮放的資料長度
		// console.log(this.props.dataLength)
		// console.log(localExtremeSearchQueue)
		for (let i = 1; i < this.props.dataLength; i++) {
			pointX = this.props.xTransform(i)
			dataY = this.props.data(i)
			localExtremeSearchQueue.push(dataY)
			
			pointY = this.props.yTransform(dataY)
			ctx.lineTo(pointX, pointY)

			// 實際印到畫面上的X, Y
			// console.log(pointX, pointY);
			if (this.props.showLocalExtreme) {
				dataValuesX.push(pointX)
				dataValuesY.push(dataY.toFixed(0))
			}

			// 舊的數字顯示規則
			// if (this.props.showLocalExtreme) {
			// 	if (localExtremeSearchQueue.length === 4) {
			// 		localExtremeSearchQueue.shift()
			// 	}
			// 	if (localExtremeSearchQueue.length === 3) {
			// 		if (localMax(localExtremeSearchQueue[0], localExtremeSearchQueue[1], localExtremeSearchQueue[2]) ||
			// 			localMin(localExtremeSearchQueue[0], localExtremeSearchQueue[1], localExtremeSearchQueue[2])) {
			// 			showValuePosition.push({
			// 				x: i - 1,
			// 				y: localExtremeSearchQueue[1]
			// 			})
			// 		}
			// 	}
			// }
		}

		// 顯示每個channel資料
		// console.log(dataValues)

		// 新的數字顯示規則
		// 之後可以考慮先用趨勢抓出最高最低點，優先顯示，之後再讓每段的數值顯示，用transform後的x來判斷是否重疊
		if (this.props.showLocalExtreme) {
			// 只顯示spo2、pulse
			//console.log(dataValuesY)
			// 抓出最常出現的數值
			let baseline = getMode(dataValuesY)[0]
			// console.log(baseline);

			let blockWidth = Math.round(this.props.dataLength / 6)
			// console.log(blockWidth);
			let sameCheck = dataValuesY[0];
			let sameCount = 1;
			for (let i = 1; i < this.props.dataLength; i++) {
				if (sameCheck === dataValuesY[i]) {
					sameCount++;
				}
				else {
					showValuePosition.push({
						x: i - Math.floor(sameCount / 2),
						y: this.props.data(i)
					})
					sameCount = 1;
				}
				sameCheck = dataValuesY[i];
				// baseline定期顯示
				// if (dataValuesY[i] == baseline && i % blockWidth == 3) {
				// 	showValuePosition.push({
				// 		x: i,
				// 		y: this.props.data(i)
				// 	})
				// }
			}
		}

		ctx.strokeStyle = this.props.color
		ctx.stroke()
		
		ctx.font = "12px Arial"
		ctx.textBaseline = "hanging"
		ctx.textAlign = "center"
		if (this.props.showLocalExtreme) {
			let lastX = 0
			for (let i = 0; i < showValuePosition.length; i++) {
				let x = this.props.xTransform(showValuePosition[i].x);
				let y = this.props.yTransform(showValuePosition[i].y) + 10;
				//若重疊則省略顯示
				if((x - lastX) > 14){
					ctx.fillText(showValuePosition[i].y.toFixed(0), x, y);
					lastX = x;
				}
			}
		}
	}
	componentDidMount() {
		this.updateCanvas()
	}
	componentDidUpdate() {
		this.updateCanvas()
	}
}

export default ChannelChart