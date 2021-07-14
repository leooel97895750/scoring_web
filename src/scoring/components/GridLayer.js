import React from 'react'
//import { linearScale } from './functions/LinearScale'
import styles from './css/fillStyle.module.css'

function GridLayer(props) {
	//console.log(props.verticalLines)
	let lines = []
	for (let i = 0; i < props.verticalLines.length; i++) {
		let line = props.verticalLines[i]
		let xPos = props.secondToXPosition(line.second)
		//console.log(xPos)
		lines.push (
			<line
				x1={xPos}
				y1={props.bottomBoundary}
				x2={xPos}
				y2={props.topBoundary}
				stroke={line.color}
				strokeDasharray={line.dashed ? '4' : ''}
				key={line.second}
			/>
		)
	}
	for (let i = 0; i < props.horizontalLines.length; i++) {
		let line = props.horizontalLines[i]
		if (!line.zoomToShow && props.isZoomed(line.channelId)) continue
		let yPos = props.valueToYPosition(line.channelId, line.value)
		lines.push (
			<line
				x1={props.leftBoundary}
				y1={yPos}
				x2={props.rightBoundary}
				y2={yPos}
				stroke={line.color}
				strokeDasharray={line.dashed ? '4' : ''}
				key={line.channelId + '_' + line.value}
			/>
		)
	}
	return (
		<svg
			width={props.width}
			height={props.height}
			className={styles.fill} >
				{lines}
		</svg>
	)
}

export default GridLayer