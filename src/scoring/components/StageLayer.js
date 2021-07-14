import React from 'react'
import { linearScale } from './functions/LinearScale'
import styles from './css/fillStyle.module.css'

function StageLayer(props) {
	let transformFunction = linearScale(0, props.stages.length, props.leftBoundary, props.rightBoundary)
	let stageTextArray = []
	for (let i = 0; i < props.stages.length; i++) {
		let xPosition = transformFunction(i)
		stageTextArray.push(
			<text
				key={'top_' + i}
				x={xPosition}
				y={props.topBoundary}
				dominantBaseline={'hanging'}
				fillOpacity={0.5}
				fill={'darkgreen'}
				fontWeight={'bold'}
				fontSize={40}>
				{props.stages[i]}
			</text>
		)
		stageTextArray.push(
			<text
				key={'bottom_' + i}
				x={xPosition}
				y={props.bottomBoundary}
				fillOpacity={0.5}
				fill={'darkgreen'}
				fontWeight={'bold'}
				fontSize={40}>
				{props.stages[i]}
			</text>
		)
	}
	return (
		<svg
			width={props.width}
			height={props.height}
			className={styles.fill}>
				{stageTextArray}
		</svg>
	)
}

export default StageLayer