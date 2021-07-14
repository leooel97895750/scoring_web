import React, {Component} from 'react'
import ChannelChart from './ChannelChart'
import CursorLineLayer from './CursorLineLayer'
import InteractiveLayer from './InteractiveLayer'
import GridLayer from './GridLayer'
import EventsLayer from './EventsLayer'
import LabelLayer from './LabelLayer'
import StageLayer from './StageLayer'
import EventInfoWindow from './EventInfoWindow'
import { linearScale } from './functions/LinearScale'
//import { defaultParameters } from './functions/DefaultParameters'
import clamp from './functions/Clamp'

const LEFT_BUTTON_NOTHING = -1
const LEFT_BUTTON_MOVE_CURSOR = 0
const LEFT_BUTTON_CLICK_EVENT = 1
const LEFT_BUTTON_DRAG_EVENT = 2

class MultichannelChart extends Component {
	constructor(props) {
		super(props)
		
		// setup index to convert channelId to channelNum
		this.channelIdToChannelNum = {}
		for (let i = 0; i < props.data.length; i++) {
			this.channelIdToChannelNum[props.data[i].channelId] = i
		}
		//console.log(this.channelIdToChannelNum)
		this.verticalPositionToChannelId = this.verticalPositionToChannelId.bind(this)
		this.onRightDragStart = this.onRightDragStart.bind(this)
		this.onRightDrag = this.onRightDrag.bind(this)
		this.onRightDragEnd = this.onRightDragEnd.bind(this)
		this.onLeftDragStart = this.onLeftDragStart.bind(this)
		this.onLeftDrag = this.onLeftDrag.bind(this)
		this.onLeftDragEnd = this.onLeftDragEnd.bind(this)
		this.dragCancel = this.dragCancel.bind(this)
		this.onMouseMove = this.onMouseMove.bind(this)
		this.onMouseScroll = this.onMouseScroll.bind(this)
		
		this.secondToXPosition = this.secondToXPosition.bind(this)
		this.valueToYPosition = this.valueToYPosition.bind(this)
		
		this.getChannelCenterline = this.getChannelCenterline.bind(this)

		this.gravityToXPosition = this.gravityToXPosition.bind(this)
		
		this.proportionToXPosition = this.proportionToXPosition.bind(this)
		this.proportionToAbsoluteSecond = this.proportionToAbsoluteSecond.bind(this)
		this.absoluteSecondToXPosition = this.absoluteSecondToXPosition.bind(this)
		
		this.isMouseAtAnyEventBoundary = this.isMouseAtAnyEventBoundary.bind(this)
		this.getEventWhoseBoundaryIsMouseAt = this.getEventWhoseBoundaryIsMouseAt.bind(this)
		this.getEventWhichIsMouseOn = this.getEventWhichIsMouseOn.bind(this)
		
		this.state = {
			// 以下單位皆為proportion
			rightDraggingStart: null, // 右鍵拖曳起始點
			rightDragging: null, // 右鍵拖曳中位置
			rightDraggingChannel: null, // 右鍵拖曳中channel
			leftDraggingStart: null, // 左鍵拖曳起始點
			leftDragging: null, // 左鍵拖曳中位置
			leftDraggingChannel: null, // 左鍵拖曳中channel
			
			leftDraggingType: LEFT_BUTTON_NOTHING, // 左鍵動作種類
			editingEvent: null,
			
			eventInfoWindowEventId: null,
			eventInfoWindowVisible: false,
			
		}
	}
	componentDidMount() {
		//關閉瀏覽器默認右键事件
		document.oncontextmenu = function (e) {
			e = e || window.event;
			return false;
		};
	}
	isMouseAtAnyEventBoundary(channelId, mouseXPosition) {
		return this.getEventWhoseBoundaryIsMouseAt(channelId, mouseXPosition) !== null
	}
	getEventWhoseBoundaryIsMouseAt(channelId, mouseXPosition) {
		//let absoluteSecondToXPosition = linearScale(this.props.secondFrom, this.props.secondTo, this.props.leftSpace, this.props.width - this.props.rightSpace)
		let nearestDistance = 5
		let nearestEvent = null
		for (let i = 0; i < this.props.events.length; i++) {
			let event = this.props.events[i]
			if (event.channelId === channelId) {
				if (event.secondFrom >= this.props.secondFrom) {
					let eventLeftBoundaryXPosition = this.absoluteSecondToXPosition(event.secondFrom)
					let distance = Math.abs(eventLeftBoundaryXPosition - mouseXPosition)
					if (distance <= nearestDistance) {
						nearestDistance = distance
						nearestEvent = Object.assign({
							nearestBoundary: 'left'
						}, event)
					}
				}
				if (event.secondTo <= this.props.secondTo) {
					let eventRightBoundaryXPosition = this.absoluteSecondToXPosition(event.secondTo)
					let distance = Math.abs(eventRightBoundaryXPosition - mouseXPosition)
					if (distance <= nearestDistance) {
						nearestDistance = distance
						nearestEvent = Object.assign({
							nearestBoundary: 'right'
						}, event)
					}
				}
			}
		}
		return nearestEvent
	}
	getEventWhichIsMouseOn(channelId, mouseXPosition) {
		let xPositionToAbsoluteSecond = linearScale(this.props.leftSpace, this.props.width - this.props.rightSpace, this.props.secondFrom, this.props.secondTo)
		let mouseAbsoluteSecond = xPositionToAbsoluteSecond(mouseXPosition)
		for (let i = 0; i < this.props.events.length; i++) {
			let event = this.props.events[i]
			if (event.channelId === channelId) {
				if (event.secondFrom < mouseAbsoluteSecond && mouseAbsoluteSecond < event.secondTo) {
					return Object.assign({}, event)
				}
			}
		}
		return null
	}
	// function for InteractiveLayer to get channel ID
	verticalPositionToChannelId(y) {
		const channelHeight = (this.props.height - this.props.topSpace - this.props.bottomSpace + this.props.interspace) / this.props.data.length - this.props.interspace
		const halfChannelHeight = channelHeight / 2
		let channelCenterPosition = this.props.topSpace + halfChannelHeight
		for (let i = 0; i < this.props.data.length; i++) {
			if (Math.abs(y - channelCenterPosition) <= halfChannelHeight) {
				return this.props.data[i].channelId
			}
			channelCenterPosition += channelHeight + this.props.interspace
		}
		return -1
	}
	// functions for InteractiveLayer callback
	onRightDragStart(channelId, proportion) {
		//console.log("right drag start", channelId, proportion)
		if (proportion > 1 || proportion < 0) return
		// 確認這個channel上可不可以標事件
		if (channelId === -1) return
		let channelNum = this.channelIdToChannelNum[channelId]
		//console.log('draggable', this.props.data[channelNum].draggable)
		if (!this.props.data[channelNum].draggable) return
		this.setState({
			rightDraggingStart: proportion,
			rightDraggingChannel: channelId,
		})
	}
	onRightDrag(proportion) {
		//console.log("right drag", proportion)
		proportion = clamp(0, proportion, 1)
		if (this.state.rightDraggingStart === null) return // 如果在標籤上拖動，直接返回
		//console.log(proportion)
		
		this.setState({
			rightDragging: proportion
		})
	}
	onRightDragEnd(proportion) {
		//console.log("right drag end", proportion)
		proportion = clamp(0, proportion, 1)
		//console.log(this.state.rightDraggingChannel)
		if (this.state.rightDraggingChannel === -1 ||
			this.state.rightDraggingStart === null) { // 如果在間隙拖動
			//console.log('無效事件')
		} else if (this.state.rightDragging === null) { // 如果只有點擊，沒有拖動
			// 新增一個 3 秒的事件
			let absoluteSecondFrom = this.proportionToAbsoluteSecond(this.state.rightDraggingStart)
			let absoluteSecondTo = absoluteSecondFrom + 3
			if (this.props.editable) this.props.addEvent(this.state.rightDraggingChannel, absoluteSecondFrom, absoluteSecondTo, this.props.getChannelEvents(this.state.rightDraggingChannel)[0], false)
		} else if (proportion === this.state.rightDraggingStart) { // 如果頭尾相同
			console.log('無效事件')
		}else { // 如果有拖動
			let absoluteSecondStart = this.proportionToAbsoluteSecond(this.state.rightDraggingStart)
			let absoluteSecondEnd = this.proportionToAbsoluteSecond(proportion)
			let absoluteSecondFrom = Math.min(absoluteSecondStart, absoluteSecondEnd)
			let absoluteSecondTo = Math.max(absoluteSecondStart, absoluteSecondEnd)
			if (this.props.editable) this.props.addEvent(this.state.rightDraggingChannel, absoluteSecondFrom, absoluteSecondTo, this.props.getChannelEvents(this.state.rightDraggingChannel)[0], false)
		}
		

		// 在新增完事件後開啟info window
		let event = this.getEventWhichIsMouseOn(this.state.rightDraggingChannel, this.proportionToXPosition(proportion) - 5)
		if (event === null) event = this.getEventWhichIsMouseOn(this.state.rightDraggingChannel, this.proportionToXPosition(proportion) + 5)
		if (event !== null && this.state.rightDraggingChannel !== 2 && this.state.rightDraggingChannel !== 17 && this.state.rightDraggingChannel !== 18) {
			//console.log('popup window')
			//let eventId = event.eventId
			this.setState({
				eventInfoWindowEventId: event.eventId,
				eventInfoWindowVisible: true,
				rightDragging: null,
				rightDraggingChannel: null,
				rightDraggingStart: null,
			})
		}
		else {
			this.setState({
				rightDragging: null,
				rightDraggingChannel: null,
				rightDraggingStart: null,
			})
		}
	}
	onLeftDragStart(channelId, proportion) {
		//console.log("left drag start", channelId, proportion)
		let mouseXPosition = this.proportionToXPosition(proportion)
		//console.log('mouseXPosition', mouseXPosition)
		let event = this.getEventWhoseBoundaryIsMouseAt(channelId, mouseXPosition)
		if (event === null) { // 可能是移動游標或是點擊事件
			if (proportion < 0 || proportion > 1) return
			event = this.getEventWhichIsMouseOn(channelId, mouseXPosition)
			if (event === null) { // 移動游標
				this.setState({
					leftDraggingStart: proportion,
					leftDraggingType: LEFT_BUTTON_MOVE_CURSOR,
					leftDraggingChannel: channelId
				})
				this.props.moveCursor(this.proportionToAbsoluteSecond(proportion))
			} else { // 點擊事件
				this.setState({
					leftDraggingStart: proportion,
					leftDraggingType: LEFT_BUTTON_CLICK_EVENT,
					leftDraggingChannel: channelId,
					editingEvent: event
				})
			}
		} else { // 拖曳事件
			let absoluteSecondToProportion = linearScale(this.props.secondFrom, this.props.secondTo, 0, 1)
			let dragStartProportion = absoluteSecondToProportion( // 將起始位置設為事件邊緣
				event.nearestBoundary === 'left' ?
				event.secondFrom :
				event.nearestBoundary === 'right' ?
				event.secondTo : null)
			this.setState({
				leftDraggingStart: dragStartProportion,
				leftDraggingType: LEFT_BUTTON_DRAG_EVENT,
				leftDraggingChannel: channelId,
				editingEvent: event
			})
		}
	}
	onLeftDrag(proportion) {
		//console.log("left drag", proportion)
		proportion = clamp(0, proportion, 1)
		this.setState({
			leftDragging: proportion
		})
		if (this.state.leftDraggingType === LEFT_BUTTON_MOVE_CURSOR) {
			this.props.moveCursor(this.proportionToAbsoluteSecond(proportion))
		}
	}
	onLeftDragEnd(proportion) {
		//console.log("left drag end", proportion)
		proportion = clamp(0, proportion, 1)
		if (this.state.leftDraggingType === LEFT_BUTTON_MOVE_CURSOR) {
			this.props.moveCursor(this.proportionToAbsoluteSecond(proportion))
		} else if (this.state.leftDraggingType === LEFT_BUTTON_CLICK_EVENT) {
			let event = this.getEventWhichIsMouseOn(this.state.leftDraggingChannel, this.proportionToXPosition(proportion))
			if (event !== null && event.eventId === this.state.editingEvent.eventId) {
				//console.log('popup window')
				//let eventId = event.eventId
				this.setState({
					eventInfoWindowEventId: event.eventId,
					eventInfoWindowVisible: true
				})
			}
		} else if (this.state.leftDraggingType === LEFT_BUTTON_DRAG_EVENT) {
			if (this.state.leftDragging !== null) {
				let event = this.state.editingEvent
				let newBoundary1Second = this.proportionToAbsoluteSecond(proportion)
				let newBoundary2Second =
					event.nearestBoundary === 'left' ?
					event.secondTo :
					event.nearestBoundary === 'right' ?
					event.secondFrom : null
				this.props.deleteEvent(event.eventId)
				let secondFrom = Math.min(newBoundary1Second, newBoundary2Second)
				let secondTo = Math.max(newBoundary1Second, newBoundary2Second)
				if (this.props.editable) this.props.addEvent(this.state.leftDraggingChannel, secondFrom, secondTo, event.type, true)
			}
		}
		//let event = this.getEventWhichIsMouseOn(this.state.leftDraggingChannel, this.proportionToXPosition(proportion) + 5)
		//console.log(event)
		// if (event !== null && this.state.leftDraggingChannel !== 2) {
		// 	//console.log('popup window')
		// 	//let eventId = event.eventId
		// 	/*
		// 	this.setState({
		// 		eventInfoWindowEventId: event.eventId,
		// 		eventInfoWindowVisible: true
		// 	})
		// 	*/
		// }
		this.setState({
			leftDraggingStart: null,
			leftDragging: null,
			leftDraggingChannel: null,
			leftDraggingType: LEFT_BUTTON_NOTHING,
			editingEvent: null
		})
	}
	dragCancel() {
		//console.log("drag cancel")
		this.setState({
			rightDragging: null,
			rightDraggingChannel: null,
			rightDraggingStart: null,
			leftDraggingStart: null,
			leftDraggingChannel: null,
			leftDragging: null,
			leftDraggingType: LEFT_BUTTON_NOTHING,
			editingEvent: null
		})
	}
	onMouseMove(channelId, proportion) {
		//console.log("mouse move", channelId, proportion)
		let mouseXPosition = this.proportionToXPosition(proportion)
		if (this.props.editable) {
			if (this.isMouseAtAnyEventBoundary(channelId, mouseXPosition)) {
				document.body.style.cursor = 'ew-resize'
			} else {
				document.body.style.cursor = 'auto'
			}
		}
	}
	onMouseScroll(channelId, up) {
		//console.log("mouse scroll", channelId, up)
		let zoomable = false
		let i = 0
		for (i = 0; i < this.props.data.length; i++) { // 先查出那個 channel 是否可以縮放
			if (this.props.data[i].channelId === channelId) {
				zoomable = this.props.data[i].zoomable
				break
			}
		}
		if (zoomable) { // 如果可以縮放
			this.props.zoomChannel(channelId, up)
			let nextScales = Object.assign({}, this.state.scales)
			if (nextScales[channelId] === undefined) {
				nextScales[channelId] = 0
			}
			nextScales[channelId] += up ? -1 : 1
			nextScales[channelId] = clamp(this.props.data[i].zoomMin, nextScales[channelId], this.props.data[i].zoomMax)
			this.setState({
				scales: nextScales
			})
		}
	}
	proportionToXPosition(proportion) {
		let transform = linearScale(0, 1, this.props.leftSpace, this.props.width - this.props.rightSpace)
		return transform(proportion)
	}
	proportionToAbsoluteSecond(proportion) {
		let transform = linearScale(0, 1, this.props.secondFrom, this.props.secondTo)
		return transform(proportion)
	}
	absoluteSecondToXPosition(absoluteSecond) {
		let transform = linearScale(this.props.secondFrom, this.props.secondTo, this.props.leftSpace, this.props.width - this.props.rightSpace)
		return transform(absoluteSecond)
	}
	// functions for GridLayer to get position
	secondToXPosition(sec) {
		let pageTimeInterval = this.props.secondTo - this.props.secondFrom
		//console.log(this.props.secondTo, this.props.secondFrom)
		let transformFunction = linearScale(0, pageTimeInterval, this.props.leftSpace, this.props.width - this.props.rightSpace)
		return transformFunction(sec)
	}
	valueToYPosition(channelId, value) {
		let channelNum = this.channelIdToChannelNum[channelId]
		//console.log(this.channelIdToChannelNum)
		//console.log('channelId', channelId)
		//console.log('channelNum', channelNum)
		const channelHeight = (this.props.height - this.props.topSpace - this.props.bottomSpace + this.props.interspace) / this.props.data.length - this.props.interspace
		let top = this.props.topSpace + (channelHeight + this.props.interspace) * channelNum
		let bottom = top + channelHeight
		let channelData = this.props.data[channelNum]
		let transformFunction = linearScale(channelData.max, channelData.min, top, bottom)
		return transformFunction(value)
	}
	// functions for EventsLayer
	getChannelCenterline(channelId) {
		let channelNum = this.channelIdToChannelNum[channelId]
		let data = this.props.data[channelNum]
		return this.valueToYPosition(channelId, (data.min + data.max) / 2)
	}
	// functions for LabelLayer
	gravityToXPosition(gravity) {
		return gravity === 'left' ? 0 : gravity === 'right' ? this.props.leftSpace : this.props.leftSpace / 2
	}
	render() {
		let charts = []
		charts.push(
			<GridLayer
				key="gridLayer"
				width={this.props.width}
				height={this.props.height}
				leftBoundary={this.props.leftSpace}
				rightBoundary={this.props.width - this.props.rightSpace}
				bottomBoundary={this.props.height - this.props.bottomSpace}
				topBoundary={this.props.topSpace}
				secondToXPosition={this.secondToXPosition}
				valueToYPosition={this.valueToYPosition}
				verticalLines={this.props.verticalLines}
				horizontalLines={this.props.horizontalLines}
				isZoomed={(channelId) => {
					let channelNum = this.channelIdToChannelNum[channelId]
					return this.props.data[channelNum].zoom !== 0
				}}
			/>
		)
		let channelHeight = (this.props.height - this.props.topSpace - this.props.bottomSpace + this.props.interspace) / this.props.data.length - this.props.interspace
		//console.log(channelHeight)
		if (this.props.loading === false) {
			for (let i = 0; i < this.props.data.length; i++) {
				let x1 = this.props.data[i].min
				let x2 = this.props.data[i].max
				//console.log(this.props.data[i].channelId)
				
				let y2 = this.props.topSpace + i * (this.props.interspace + channelHeight)
				let y1 = y2 + channelHeight
				
				let zoomScale = -1 * (this.props.data[i].zoom) + 1
				if (zoomScale <= 0) zoomScale = 1
				let yTransform
				// spo2縮放
				if(this.props.data[i].channelId === 16){
					yTransform = (x) => {
						return (zoomScale * (100 - x)) + y2
					}
				}
				else{
					yTransform = linearScale(x1, x2, y1, y2)
				}
				let xTransform = linearScale(0, this.props.data[i].dataLength - 1, this.props.leftSpace, this.props.width - this.props.rightSpace)
				charts.push (
					<ChannelChart
						chartKey={
							this.props.data[i].channelId + ',' +
							this.props.width + ',' +
							this.props.height + ',' +
							this.props.secondFrom + ',' +
							this.props.secondTo + ',' +
							x1 + ',' + x2 + ',' + zoomScale
						}
						key={i}
						width={this.props.width}
						height={this.props.height}
						lineWidth={this.props.data[i].lineWidth}
						dataLength={this.props.data[i].dataLength}
						data={this.props.data[i].data}
						xTransform={xTransform}
						yTransform={yTransform}
						color={this.props.data[i].color}
						showLocalExtreme={this.props.data[i].showLocalExtreme}
						cid={this.props.data[i].channelId}
					/>
				)
			}
		}
		let editingEvent = null
		if (this.state.rightDraggingStart !== null &&
			this.state.rightDragging !== null &&
			this.state.rightDraggingChannel !== -1) { // 如果右鍵拖曳而且有移動且不是在間隙拖動
			editingEvent = {}
			let proportionToRelativeSecond = linearScale(0, 1, 0, this.props.secondTo - this.props.secondFrom)
			editingEvent.channelId = this.state.rightDraggingChannel
			let rightDraggingStartRelativeSecond = proportionToRelativeSecond(this.state.rightDraggingStart)
			let rightDraggingRelativeSecond = proportionToRelativeSecond(this.state.rightDragging)
			editingEvent.secondFrom = Math.min(rightDraggingStartRelativeSecond, rightDraggingRelativeSecond)
			editingEvent.secondTo = Math.max(rightDraggingStartRelativeSecond, rightDraggingRelativeSecond)
			//console.log(editingEvent)
		}
		
		if (this.state.leftDraggingType === LEFT_BUTTON_DRAG_EVENT &&
			this.state.leftDragging !== null) { // 如果正在拖曳事件且開始拖曳
			editingEvent = {}
			let oneBoundary = this.proportionToAbsoluteSecond(this.state.leftDragging) // 顯示的其中一個拖曳框邊界
			oneBoundary -= this.props.secondFrom
			//console.log('one boundary', oneBoundary)
			let theOtherBoundary = null // 顯示的另一個拖曳框邊界
			if (this.state.editingEvent.nearestBoundary === 'left') { // 如果拖曳左邊界
				theOtherBoundary = clamp(this.props.secondFrom, this.state.editingEvent.secondTo, this.props.secondTo) // 超過頁面的部份截斷
			} else { // 如果拖曳右邊界
				theOtherBoundary = clamp(this.props.secondFrom, this.state.editingEvent.secondFrom, this.props.secondTo) // 超過頁面的部份截斷
			}
			theOtherBoundary -= this.props.secondFrom // 轉成相對秒數
			//console.log('the other boundary', theOtherBoundary)
			editingEvent.secondFrom = Math.min(oneBoundary, theOtherBoundary)
			editingEvent.secondTo = Math.max(oneBoundary, theOtherBoundary)
			editingEvent.channelId = this.state.leftDraggingChannel
			//console.log(editingEvent)
		}
		//console.log(this.props.events)
		charts.push(
			<EventsLayer
				key="eventsLayer"
				width={this.props.width}
				height={this.props.height}
				getChannelCenterline={this.getChannelCenterline}
				secondToXPosition={this.secondToXPosition}
				eventHeight={channelHeight}
				interval={this.props.secondTo - this.props.secondFrom}
				events={this.props.events.map((event, index) => {
					let derivedEvent = {
						channelId: event.channelId,
						secondFrom: event.secondFrom - this.props.secondFrom,
						secondTo: event.secondTo - this.props.secondFrom,
						type: event.type,
						color: event.color,
						eventId: event.eventId
					}
					return derivedEvent
				})}
				editingEvent={this.props.editable ? editingEvent : null}
			/>
		)
		charts.push(
			<StageLayer
				key={'stageLayer'}
				leftBoundary={this.props.leftSpace}
				rightBoundary={this.props.width - this.props.rightSpace}
				bottomBoundary={this.props.height - this.props.bottomSpace}
				topBoundary={this.props.topSpace}
				width={this.props.width}
				height={this.props.height}
				stages={this.props.stages}
			/>
		)
		let absoluteSecondToProportion = linearScale(this.props.secondFrom, this.props.secondTo, 0, 1)
		charts.push(
			<CursorLineLayer
				key="cursorLineLayer"
				width={this.props.width}
				height={this.props.height}
				leftBoundary={this.props.leftSpace}
				rightBoundary={this.props.width - this.props.rightSpace}
				bottomBoundary={this.props.height - this.props.bottomSpace}
				topBoundary={this.props.topSpace}
				proportion={absoluteSecondToProportion(this.props.cursorSecond)}
			/>
		)
		let horizontalPositionToProportion = linearScale(this.props.leftSpace, this.props.width - this.props.rightSpace, 0, 1)
		charts.push(
			<LabelLayer
				key="labelLayer"
				width={this.props.width}
				height={this.props.height}
				gravityToXPosition={this.gravityToXPosition}
				labels={this.props.labels}
				valueToYPosition={this.valueToYPosition}
			/>
		)
		charts.push(
			<InteractiveLayer
				key='interactiveLayer'
				horizontalPositionToProportion={horizontalPositionToProportion}
				verticalPositionToChannelId={this.verticalPositionToChannelId}
				onRightDragStart={this.onRightDragStart}
				onRightDrag={this.onRightDrag}
				onRightDragEnd={this.onRightDragEnd}
				onLeftDragStart={this.onLeftDragStart}
				onLeftDrag={this.onLeftDrag}
				onLeftDragEnd={this.onLeftDragEnd}
				dragCancel={this.dragCancel}
				onMouseMove={this.onMouseMove}
				onMouseScroll={this.onMouseScroll}
			/>
		)
		let showDesat = false
		if (this.state.eventInfoWindowEventId !== null) {
			let event = this.props.getEventInfo(this.state.eventInfoWindowEventId)
			showDesat = this.props.data[this.channelIdToChannelNum[event.channelId]].showDesat
		}
		//console.log(this.state.eventInfoWindowVisible)
		if (this.state.eventInfoWindowVisible) {
			charts.push(
				<EventInfoWindow
					key={'eventInfoWindow'}
					editable={this.props.editable}
					onSelected={this.props.setEventType}
					onCancel={() => {
						this.setState({
							eventInfoWindowVisible: false
						})
					}}
					onDelete={this.props.deleteEvent}
					getEventInfo={this.props.getEventInfo}
					getChannelEvents={this.props.getChannelEvents}
					eventId={this.state.eventInfoWindowEventId}
					data={this.props.data}
					preData={this.props.preData}
					nextData={this.props.nextData}
					secondFrom={this.props.secondFrom}
					secondTo={this.props.secondTo}
					visible={true}
					showDesat={showDesat}
					psgFileId={this.props.psgFileId}
				/>
			)
		}
		return charts
	}
}

MultichannelChart.defaultProps = {
	data: [/*{
		update: PropTypes.bool,
		lineWidth: PropTypes.number,
		dataLength: PropTypes.number,
		data: PropTypes.func.isRequired,
		max: ...,
		min: ...,
		color: PropTypes.string
	}*/],
	width: 800,
	height:800,
	topSpace: 10,
	bottomSpace: 10,
	interspace: 5,
	leftSpace: 30,
	rightSpace: 10
}

export default MultichannelChart