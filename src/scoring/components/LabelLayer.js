import React, {Component} from 'react'
import styles from './css/fillStyle.module.css'

class LabelLayer extends Component {
	constructor(props) {
		super(props)
		this.updateCanvas = this.updateCanvas.bind(this)
		this.ref = React.createRef()
	}
	render() {
		//console.log('label render')
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
		ctx.textBaseline = 'middle'
		for (let i = 0; i < this.props.labels.length; i++) {
			let label = this.props.labels[i]
			let xPos = this.props.gravityToXPosition(label.gravity)
			xPos += label.xOffset
			let yPos = this.props.valueToYPosition(label.channelId, label.value)
			yPos += label.yOffset
			ctx.textAlign = label.gravity === 'left' ? 'left' : label.gravity === 'right' ? 'right' : 'center'
			ctx.fillStyle = label.color
			ctx.font = label.font
			ctx.fillText(label.label, xPos, yPos)
		}
	}
	componentDidMount() {
		this.updateCanvas()
	}
	componentDidUpdate() {
		this.updateCanvas()
	}
}

export default LabelLayer