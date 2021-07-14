import React, { Component } from 'react';
import MultichannelChart from './MultichannelChart'
import TimeIntervalDropdown from './TimeIntervalDropdown'
import SplitPane from 'react-split-pane'
import styles from './css/signalPanelStyle.module.css'
//import labelsGenerator from './functions/LabelsGenerator'

//import EventInfoWindow from './EventInfoWindow'

class SignalPanel extends Component {
	ref = React.createRef()
	constructor(props) {
		super(props)
		this.firstTime = true
		this.state = {
			height: 0,
			width: 0,
			splittedPanelHeight: 0
		}
		this.windowResize = this.windowResize.bind(this)
		this.splittedPanelResize = this.splittedPanelResize.bind(this)
	}
	windowResize() {
		const { current } = this.ref;
		//console.log(`${current.offsetWidth}, ${current.offsetHeight}`)
		this.setState({
			width: current.offsetWidth,
			height: current.offsetHeight,
		})
	}
	splittedPanelResize(height) {
		this.setState({
			splittedPanelHeight: height
		})
	}
	render() {
		if (!this.firstTime) {
			//console.log(`render width: ${this.state.width}, height: ${this.state.height}, size: ${this.state.splittedPanelHeight}`)
		}
		//console.log(this.props.upperItems)
		//console.log(this.props.lowerItems)
		//let dataLength = 20000
		let panel = this.firstTime ? (<div ref={this.ref} className={styles.signalPanel}></div>) :
			(<div ref={this.ref} className={styles.signalPanel}>
				<SplitPane
					split="horizontal"
					defaultSize={this.state.splittedPanelHeight}
					minSize={50}
					maxSize={-50}
					/*onDragFinished*/onChange={this.splittedPanelResize}>
					<>
						<MultichannelChart
							loading={this.props.upperLoading}
							editable={this.props.editable}
							addEvent={this.props.addEvent}
							deleteEvent={this.props.deleteEvent}
							setEventType={this.props.setEventType}
							moveCursor={this.props.moveCursor}
							zoomChannel={this.props.zoomChannel}
							getEventInfo={this.props.getEventInfo}
							getChannelEvents={this.props.getChannelEvents}
							width={this.state.width}
							height={this.state.splittedPanelHeight}
							topSpace={5}
							bottomSpace={5}
							interspace={2}
							leftSpace={85}
							rightSpace={5}
							secondFrom={this.props.upperSecondFrom}
							secondTo={this.props.upperSecondTo}
							cursorSecond={this.props.cursorSecond}
							data={this.props.upperData}
							preData={this.props.preUpperData}
							nextData={this.props.nextUpperData}
							events={this.props.upperEvents}
							labels={this.props.upperLabels}
							verticalLines={this.props.upperVerticalLines}
							horizontalLines={this.props.upperHorizontalLines}
							stages={this.props.upperStages}
							psgFileId={this.props.psgFileId}
						/>
						<div style={{
							position: 'absolute',
							left: '0px',
							right: '0px',
							height: '0px'}}>
							<TimeIntervalDropdown
								selectItem={this.props.upperSelectItem}
								items={this.props.upperItems}
								selectedItem={this.props.upperSelectedItem}
							/>
						</div>
					</>
					<>
						<MultichannelChart
							loading={this.props.lowerLoading}
							editable={this.props.editable}
							addEvent={this.props.addEvent}
							deleteEvent={this.props.deleteEvent}
							setEventType={this.props.setEventType}
							moveCursor={this.props.moveCursor}
							zoomChannel={this.props.zoomChannel}
							getEventInfo={this.props.getEventInfo}
							getChannelEvents={this.props.getChannelEvents}
							width={this.state.width}
							height={this.state.height - this.state.splittedPanelHeight}
							topSpace={5}
							bottomSpace={5}
							interspace={2}
							leftSpace={85}
							rightSpace={5}
							secondFrom={this.props.lowerSecondFrom}
							secondTo={this.props.lowerSecondTo}
							cursorSecond={this.props.cursorSecond}
							data={this.props.lowerData}
							preData={this.props.preLowerData}
							nextData={this.props.nextLowerData}
							events={this.props.lowerEvents}
							labels={this.props.lowerLabels}
							verticalLines={this.props.lowerVerticalLines}
							horizontalLines={this.props.lowerHorizontalLines}
							stages={this.props.lowerStages}
							psgFileId={this.props.psgFileId}
						/>
						<div style={{
							position: 'absolute',
							left: '0px',
							right: '0px',
							height: '0px'}}>
							<TimeIntervalDropdown
								selectItem={this.props.lowerSelectItem}
								items={this.props.lowerItems}
								selectedItem={this.props.lowerSelectedItem}
							/>
						</div>
					</>
				</SplitPane>
			</div>)
		this.firstTime = false
		return panel
	}
	componentDidMount() {
		window.addEventListener('resize', this.windowResize)
		const { current } = this.ref;
		this.setState({
			width: current.offsetWidth,
			height: current.offsetHeight,
			splittedPanelHeight: Math.floor(current.offsetHeight / 2)
		})
	}

	componentWillUnmount() {
		window.removeEventListener('resize', this.windowResize)
	}
}

export default SignalPanel