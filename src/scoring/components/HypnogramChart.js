import React, {Component} from 'react'
import styles from './css/fillStyle.module.css'

class HypnogramChart extends Component {
	ref = React.createRef()
	render() {
		//console.log('channel render')
		return <canvas
			ref={this.ref}
			width={this.props.width}
			height={this.props.height}
			className={styles.fill}></canvas>
	}
	updateCanvas() {
		let canvas = this.ref.current
		let ctx = canvas.getContext('2d')
		ctx.clearRect(0, 0, canvas.width, canvas.height)
		ctx.lineWidth = this.props.lineWidth
		ctx.strokeStyle = this.props.color
		ctx.beginPath()
		let pointX = this.props.epochToXPosition(0)
		let pointY = this.props.stageToYPosition(this.props.stages[0])
		let last = this.props.stages[0]
		ctx.moveTo(pointX, pointY)
		for (let i = 1; i < this.props.stages.length; i++) {
			if (this.props.stages[i] === last) {
				continue
			}
			pointX = this.props.epochToXPosition(i)
			ctx.lineTo(pointX, pointY)
			pointY = this.props.stageToYPosition(this.props.stages[i])
			if (this.props.stages[i] === 10 || last === 10) {
				ctx.moveTo(pointX, pointY)
			} else {
				ctx.lineTo(pointX, pointY)
			}
			last = this.props.stages[i]
		}
		pointX = this.props.epochToXPosition(this.props.stages.length)
		ctx.lineTo(pointX, pointY)
		ctx.strokeStyle = this.props.color
		ctx.stroke()
	}
	componentDidMount() {
		this.updateCanvas()
	}
	componentDidUpdate() {
		this.updateCanvas()
	}
}

export default HypnogramChart