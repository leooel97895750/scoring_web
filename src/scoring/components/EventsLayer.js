import React from 'react'
//import { linearScale } from './functions/LinearScale'
import clamp from './functions/Clamp'
import styles from './css/fillStyle.module.css'

function EventsLayer(props) {
	let elements = []
	//console.log(props.events.length)
	for (let i = 0; i < props.events.length; i++) {
		let event = props.events[i]
		let centerline = props.getChannelCenterline(event.channelId)
		let from = clamp(0, event.secondFrom, props.interval)
		let to = clamp(0, event.secondTo, props.interval)
		let xFrom = props.secondToXPosition(from)
		let xTo = props.secondToXPosition(to)
		let xLen = xTo - xFrom
		let top = centerline - props.eventHeight / 2
		//console.log(event.channelId)
		elements.push(
			<rect
				key={event.eventId + '_' + event.channelId}
				x={xFrom}
				y={top}
				width={xLen}
				height={props.eventHeight}
				style={{
					fill: event.color,
					fillOpacity: 0.5
				}}
			/>
		)
		let bottom = centerline + props.eventHeight / 2
		elements.push(
			<text
				key={event.eventId + '_' + event.channelId + "_text"}
				x={xFrom}
				y={bottom}
			>
				{event.type}
			</text>
		)
		
	}
	if (props.editingEvent) {
		//console.log('拖曳事件')
		let centerline = props.getChannelCenterline(props.editingEvent.channelId)
		let from = clamp(0, props.editingEvent.secondFrom, props.interval)
		let to = clamp(0, props.editingEvent.secondTo, props.interval)
		let xFrom = props.secondToXPosition(from)
		let xTo = props.secondToXPosition(to)
		let xLen = xTo - xFrom
		let top = centerline - props.eventHeight / 2
		elements.push(
			<rect
				key="editingEvent"
				x={xFrom}
				y={top}
				width={xLen}
				height={props.eventHeight}
				stroke={'black'}
				strokeWidth={2}
				fill={'none'}
			/>
		)
		
		let bottom = centerline + props.eventHeight / 2
		let tipHeight = 20
		let tipWidth = 40
		let tipXOffset = 0
		let tipYOffset = 10
		// 顯示秒數
		elements.push(
			<rect
				key="tip_rect"
				x={xTo + tipXOffset}
				y={bottom + tipYOffset}
				width={tipWidth}
				height={tipHeight}
				stroke="black"
				strokeWidth={1}
				fill="white"
			/>
		)
		elements.push(
			<text
				key="tip_text"
				x={xTo + tipXOffset + tipWidth / 2}
				y={bottom + 10 + tipHeight / 2}
				dominantBaseline="middle"
				textAnchor="middle" >
				{Math.abs(from - to).toFixed(1)}
			</text>
		)
	}
	return (
		<svg
			width={props.width}
			height={props.height}
			className={styles.fill}>
			{elements}
		</svg>
	)
}

export default EventsLayer