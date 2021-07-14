import React, { Component } from 'react';
import styles from './css/chartLayerStyle.module.css'

const LEFT_BUTTON = 0
const RIGHT_BUTTON = 2
const NO_BUTTON = -1

class InteractiveLayer extends Component {
	ref = React.createRef()
	draggingButton = NO_BUTTON
	constructor(props) {
		super(props)
		this.mouseDown = this.mouseDown.bind(this)
		this.mouseMove = this.mouseMove.bind(this)
		this.mouseUp = this.mouseUp.bind(this)
		this.mouseLeave = this.mouseLeave.bind(this)
		this.preventDragHandler = this.preventDragHandler.bind(this)
		this.mouseScroll = this.mouseScroll.bind(this)
		this.toChannelIdProportion = this.toChannelIdProportion.bind(this)
		this.mousewheel = (/Firefox/i.test(navigator.userAgent)) ? "DOMMouseScroll" : "mousewheel"
	}
	render() {
		return <div ref={this.ref} className={styles.chartLayer} onDragStart={this.preventDragHandler} />
	}
	toChannelIdProportion(absoluteX, absoluteY) {
		const { current } = this.ref
		const rect = current.getBoundingClientRect()
		let x = absoluteX - rect.left
		let y = absoluteY - rect.top
		let channelId = this.props.verticalPositionToChannelId(y)
		let proportion = this.props.horizontalPositionToProportion(x)
		return {
			channelId: channelId,
			proportion: proportion
		}
	}
	mouseDown(evt)  {
		//console.log('mouse down', evt.button)
		if (evt.button !== 0 && evt.button !== 2) return
		if (this.draggingButton !== -1) {
			this.draggingButton = NO_BUTTON
			if (this.props.dragCancel) {
				this.props.dragCancel()
			}
		}
		let { channelId, proportion } = this.toChannelIdProportion(evt.clientX, evt.clientY)
		if (evt.button === LEFT_BUTTON) {
			this.draggingButton = LEFT_BUTTON
			if (this.props.onLeftDragStart) {
				this.props.onLeftDragStart(channelId, proportion)
			}
		} else if (evt.button === RIGHT_BUTTON) {
			this.draggingButton = RIGHT_BUTTON
			if (this.props.onRightDragStart) {
				this.props.onRightDragStart(channelId, proportion)
			}
		}
	}
	mouseMove(evt)  {
		let { channelId, proportion } = this.toChannelIdProportion(evt.clientX, evt.clientY)
		if (this.draggingButton === LEFT_BUTTON) {
			if (this.props.onLeftDrag) {
				this.props.onLeftDrag(proportion)
			}
		} else if (this.draggingButton === RIGHT_BUTTON) {
			if (this.props.onRightDrag) {
				this.props.onRightDrag(proportion)
			}
		} else {
			if (this.props.onMouseMove) {
				this.props.onMouseMove(channelId, proportion)
			}
		}
	}
	mouseUp(evt)  {
		//console.log('mouse up')
		if (evt.button !== 0 && evt.button !== 2) return
		let channelIdAndProportion = this.toChannelIdProportion(evt.clientX, evt.clientY)
		let proportion = channelIdAndProportion.proportion
		if (this.draggingButton === evt.button) {
			if (this.draggingButton === LEFT_BUTTON) {
				if (this.props.onLeftDragEnd) {
					this.props.onLeftDragEnd(proportion)
				}
			} else if (this.draggingButton === RIGHT_BUTTON) {
				if (this.props.onRightDragEnd) {
					this.props.onRightDragEnd(proportion)
				}
			}
			this.draggingButton = NO_BUTTON
		}
	}
	mouseLeave(evt) {
		//console.log('mouse leave')
		if (this.draggingButton === LEFT_BUTTON || this.draggingButton === RIGHT_BUTTON) {
			this.draggingButton = NO_BUTTON
			if (this.props.dragCancel) {
				this.props.dragCancel()
			}
		}
	}
	mouseScroll(e) {
		let channelIdAndProportion = this.toChannelIdProportion(e.pageX, e.pageY)
		let channelId = channelIdAndProportion.channelId
		if (e.wheelDelta > 0 || e.detail < 0) {
			// 往前
			if (this.props.onMouseScroll) {
				this.props.onMouseScroll(channelId, false)
			}
		} else {
			// 往後
			if (this.props.onMouseScroll) {
				this.props.onMouseScroll(channelId, true)
			}
		}
	}
	preventContextMenu(e) {
		e.preventDefault()
	}
	preventDragHandler(e) {
		e.preventDefault()
	}
	componentDidMount() {
		const { current } = this.ref
		current.addEventListener('mousedown', this.mouseDown)
		current.addEventListener('mousemove', this.mouseMove)
		current.addEventListener('mouseup', this.mouseUp)
		current.addEventListener('mouseleave', this.mouseLeave)
		current.addEventListener('contextmenu', this.preventContextMenu)
		current.addEventListener(this.mousewheel, this.mouseScroll)
	}
	componentWillUnmount() {
		const { current } = this.ref
		current.removeEventListener('mousedown', this.mouseDown)
		current.removeEventListener('mousemove', this.mouseMove)
		current.removeEventListener('mouseup', this.mouseUp)
		current.removeEventListener('mouseleave', this.mouseLeave)
		current.removeEventListener('contextmenu', this.preventContextMenu)
		current.removeEventListener(this.mousewheel, this.mouseScroll)
	}
}

export default InteractiveLayer