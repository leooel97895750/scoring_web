import React, {Component} from 'react'
import PropTypes from 'prop-types'
import styles from './css/channelChartStyle.module.css'

function ChartBackground(props) {
	let lines = props.linesOption.map((options) => <line
		x1={options.x1}
		y1={options.y1}
		x2={options.x2}
		y2={options.y2}
		stroke={options.color ? 'rgb(0,0,0)' : options.color}
		stroke-width={1}
		stroke-dasharray={options.dash} />)
	return <svg width={props.width} height={props.height}>lines</svg>
}

ChartBackground.defaultProps = {
	linesOptions: [],
	width: 800,
	height: 800
}

export default ChartBackground