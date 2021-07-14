import React from 'react'
import { linearScale } from './functions/LinearScale'
import styles from './css/fillStyle.module.css'

function CursorLineLayer(props) {
	let transform = linearScale(0, 1, props.leftBoundary, props.rightBoundary)
	let x = transform(props.proportion)
	return (
		<svg
			width={props.width}
			height={props.height}
			className={styles.fill} >
			<line
				x1={x}
				x2={x}
				y1={props.bottomBoundary}
				y2={props.topBoundary}
				className={styles.redLine} />
		</svg>
	)
}

export default CursorLineLayer