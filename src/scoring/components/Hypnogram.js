import React, {Component} from 'react'
import HypnogramChart from './HypnogramChart'
import InteractiveLayer from './InteractiveLayer'
import GridLayer from './GridLayer'
import BufferedLayer from './BufferedLayer'
import CursorLineLayer from './CursorLineLayer'
import LabelLayer from './LabelLayer'
import linesInHypnogram from './config/LinesInHypnogram'
import labelsForHypnogram from './config/LabelsForHypnogram'
import clamp from './functions/Clamp'
import { linearScale } from './functions/LinearScale'
import styles from './css/hypnogramStyle.module.css'

class Hypnogram extends Component {
	ref = React.createRef()
	constructor(props) {
		super(props)
		this.firstTime = true
		this.state = {
			height: 0,
			width: 0
		}
		this.windowResize = this.windowResize.bind(this)
		this.mouseOnProportion = this.mouseOnProportion.bind(this)
		this.mouseOnScroll = this.mouseOnScroll.bind(this)
		this.gravityToXPosition = this.gravityToXPosition.bind(this)
	}
	render() {
		let epochToXPosition = linearScale(0, this.props.stages.length,
			this.props.leftSpace, this.state.width - this.props.rightSpace)
		let stageToYPosition = linearScale(-2.5, 3.5,
			this.props.topSpace, this.state.height - this.props.bottomSpace)
		let horizontalPositionToProportion = linearScale(this.props.leftSpace, this.state.width - this.props.rightSpace, 0, 1)
		let proportion = this.props.currentEpoch / this.props.stages.length
		let hypnogram = this.firstTime ? <div ref={this.ref} className={styles.hypnogram} /> : (
			<div ref={this.ref} className={styles.hypnogram}>
				<GridLayer
					width={this.state.width}
					height={this.state.height}
					leftBoundary={this.props.leftSpace}
					rightBoundary={this.state.width - this.props.rightSpace}
					topBoundary={this.props.topSpace}
					bottomBoundary={this.state.height - this.props.bottomSpace}
					secondToXPosition={linearScale(0, this.props.stages.length, this.props.leftSpace, this.state.width - this.props.rightSpace)}
					verticalLines={linesInHypnogram.verticalLines}
					valueToYPosition={(channelId, value) => {
						return stageToYPosition(value)
					}}
					horizontalLines={linesInHypnogram.horizontalLines}
					isZoomed={() => { return false }}
				/>
				<BufferedLayer
					width={this.state.width}
					height={this.state.height}
					leftBoundary={this.props.leftSpace}
					rightBoundary={this.state.width - this.props.rightSpace}
					topBoundary={this.props.topSpace}
					bottomBoundary={this.state.height - this.props.bottomSpace}
					buffered={this.props.buffered}
				/>
				{
					this.props.answer ?
						<HypnogramChart
							width={this.state.width}
							height={this.state.height}
							lineWidth={1}
							color={'orange'}
							epochToXPosition={epochToXPosition}
							stageToYPosition={stageToYPosition}
							stages={this.props.answer}
						/> : null
				}
				{
					this.props.modeArr ?
						<HypnogramChart
							width={this.state.width}
							height={this.state.height}
							lineWidth={1}
							color={'blue'}
							epochToXPosition={epochToXPosition}
							stageToYPosition={stageToYPosition}
							stages={this.props.modeArr}
						/> : null
				}
				<HypnogramChart
					width={this.state.width}
					height={this.state.height}
					lineWidth={1}
					color={'black'}
					epochToXPosition={epochToXPosition}
					stageToYPosition={stageToYPosition}
					stages={this.props.stages}
				/>
				<CursorLineLayer
					width={this.state.width}
					height={this.state.height}
					leftBoundary={this.props.leftSpace}
					rightBoundary={this.state.width - this.props.rightSpace}
					topBoundary={this.props.topSpace}
					bottomBoundary={this.state.height - this.props.bottomSpace}
					proportion={proportion}
				/>
				<LabelLayer
					width={this.state.width}
					height={this.state.height}
					gravityToXPosition={this.gravityToXPosition}
					labels={labelsForHypnogram}
					valueToYPosition={(channelId, value) => {
						return stageToYPosition(value)
					}}
				/>
				<InteractiveLayer
					horizontalPositionToProportion={horizontalPositionToProportion}
					verticalPositionToChannelId={() => { return 0 }}
					onRightDragStart={ (channelId, proportion) => {
						this.mouseOnProportion(proportion)
					} }
					onRightDrag={this.mouseOnProportion}
					onRightDragEnd={this.mouseOnProportion}
					onLeftDragStart={ (channelId, proportion) => {
						this.mouseOnProportion(proportion)
					} }
					onLeftDrag={this.mouseOnProportion}
					onLeftDragEnd={this.mouseOnProportion}
					onMouseScroll={(channelId, up) => {
						this.mouseOnScroll(up)
					}}
				/>
			</div>
		)
		this.firstTime = false
		return hypnogram
	}
	windowResize() {
		const { current } = this.ref;
		this.setState({
			width: current.offsetWidth,
			height: current.offsetHeight,
		})
	}
	mouseOnProportion(proportion) {
		let epoch = proportion * this.props.stages.length
		epoch = clamp(0, epoch, this.props.stages.length - 1)
		epoch = Math.round(epoch)
		if (epoch !== this.props.currentEpoch) {
			this.props.jumpTo(epoch)
		}
	}
	mouseOnScroll(direction) {
		let epoch = this.props.currentEpoch + (direction ? 1 : -1)
		epoch = clamp(0, epoch, this.props.stages.length - 1)
		if (epoch !== this.props.currentEpoch) {
			this.props.jumpTo(epoch)
		}
	}
	gravityToXPosition(gravity) {
		return gravity === 'left' ? 0 : gravity === 'right' ? this.props.leftSpace : this.props.leftSpace / 2
	}
	componentDidMount() {
		//console.log('hypnogram did mount')
		window.addEventListener('resize', this.windowResize)
		const { current } = this.ref;
		this.setState({
			width: current.offsetWidth,
			height: current.offsetHeight
		})
	}

	componentWillUnmount() {
		window.removeEventListener('resize', this.windowResize)
	}
}

export default Hypnogram