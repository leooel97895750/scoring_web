import React from 'react'
import styles from './css/fillStyle.module.css'
import { linearScale } from './functions/LinearScale'

function BufferedLayer(props) {
	//console.log(props)
	let transform = linearScale(0, props.buffered.length, props.leftBoundary, props.rightBoundary)
	let rects = []
	
	let cont = false
	let startX = null
	let fill = 'rgba(100, 100, 100, 0.3)'
	for (let i = 0; i < props.buffered.length; i++) {
		if (cont) {
			if (!props.buffered[i]) {
				let endX = transform(i)
				rects.push(<rect
					key={i}
					x={startX}
					y={props.topBoundary}
					width={endX - startX}
					height={props.bottomBoundary - props.topBoundary}
					style={{
						fill: fill
					}} />)
				cont = false
			}
		} else {
		if (props.buffered[i]) { // 開始一個
				startX = transform(i)
				//console.log('i:', i, 'startX:', startX)
				cont = true
			}
		}
	}
	let end = props.buffered.length
	let endX = transform(end)
	if (cont) {
		rects.push(<rect
			key={end}
			x={startX}
			y={props.topBoundary}
			width={endX - startX}
			height={props.bottomBoundary - props.topBoundary}
			style={{
				fill: fill
			}} />)
	}
	return <svg className={styles.fill} width={props.width} height={props.height}>{rects}</svg>
}

export default BufferedLayer