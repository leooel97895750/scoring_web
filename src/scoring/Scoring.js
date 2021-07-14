import React, { Component } from 'react'
import axios from 'axios'
import ScoringNavbar from './components/ScoringNavbar'
import Hypnogram from './components/Hypnogram'
//import MultichannelChart from './components/MultichannelChart'
import SignalPanel from './components/SignalPanel'
//import SplitPane from 'react-split-pane'
import './edit.css'
//import EventInfoWindow from './components/EventInfoWindow'
import EventsDataStructure from './EventsDataStructure'
import TimeController from './TimeController'
import DataManager from './DataManager'
import DataRequestManager from './DataRequestManager'
import PauseRequestManager from './PauseRequestManager'
import getChannelEvents from './config/getChannelEvents'
import dataDisplay from './config/dataDisplay'
import channelNameToChannelId from './config/channelNameToChannelId'
import units from './config/units'
import channelColors from './config/channelColors'
import constants from './const'
import formatSecond from './components/functions/formatSecond'
import {
	upperLabelsForScale,
	lowerLabelsForScale
} from './config/labelsForScale'
import {
	jump
} from './config/FakeData'
import {
	upperConstLabels,
	lowerConstLabels
} from './config/constLabels'
import {
	getVerticalLines,
	getUpperHorizontalLines,
	getLowerHorizontalLines
} from './config/lines'
//import { HashRouter } from 'react-router-dom'
const stageIntToString = Object.freeze({
	0: 'W',
	1: '1',
	2: '2',
	3: '3',
	'-1': 'R',
	'-2': '?',
	10: ''
})

class Scoring extends Component {
	constructor(props) {
		super(props)
		this.state = {
			display: false,
			cursorSecond: 0,
			upperSecondFrom: 0,
			upperSecondTo: 30,
			lowerSecondFrom: 0,
			lowerSecondTo: 30,
			upperData: [],
			lowerData: [],
			preUpperData: [],
			preLowerData: [],
			nextUpperData: [],
			nextLowerData: [],
			upperLabels: [],
			lowerLabels: [],
			upperEvents: [],
			lowerEvents: [],
			upperSelectedItem: '30 sec',
			lowerSelectedItem: '30 sec',
			stages: [],
			upperStages: [],
			lowerStages: [],
			answer: null, // 機器判讀結果
			hasAnswer: false,
			enableShowAnswerCheckbox: true,
			currentEpoch: 0,
			
			psgFileId: parseInt(props.match.params.id),
			which: parseInt(props.match.params.which), // 0 -> 編輯中
			editable: parseInt(props.match.params.which) === 0,
			
			stateToShow: '',
			
			hasStagesBeenLoaded: false,
			hasNotCompleted: true,
			hasSubmitted: false,
			
			modeArr: null
			
		}
		
		this.jumpTo = this.jumpTo.bind(this)
		this.addEvent = this.addEvent.bind(this)
		this.deleteEvent = this.deleteEvent.bind(this)
		this.moveCursor = this.moveCursor.bind(this)
		this.zoomChannel = this.zoomChannel.bind(this)
		this.setEventType = this.setEventType.bind(this)
		this.getEventInfo = this.getEventInfo.bind(this)
		
		this.upperSelectItem = this.upperSelectItem.bind(this)
		this.lowerSelectItem = this.lowerSelectItem.bind(this)
		
		this.setStateFromDataStructure = this.setStateFromDataStructure.bind(this)
		
		// some data struct
		this.eventDataStructure = null // new EventsDataStructure([])
		this.timeController = null // new TimeController(jump, totalEpoch)
		this.stagesDataStructure = null // new Array(totalEpoch)
		this.answer = null // 機器判讀結果
		//this.stagesDataStructure.fill(0)
		this.dataManager = null
		this.dataRequestManager = null
		this.pauseRequestManager = null
		this.onKeyDown = this.onKeyDown.bind(this)
		this.onRequestComplete = this.onRequestComplete.bind(this)
		this.onStateChange = this.onStateChange.bind(this)
		
		this.onShowAnswerChecked = this.onShowAnswerChecked.bind(this)
		
		this.bufferTimer = null
	}
	setStateFromDataStructure() {
		let cursorSecond = this.timeController.getCursorSecond()
		let upperSecondFrom = this.timeController.getUpperSecondFrom()
		let upperSecondTo = this.timeController.getUpperSecondTo()
		let lowerSecondFrom = this.timeController.getLowerSecondFrom()
		let lowerSecondTo = this.timeController.getLowerSecondTo()


		let upperData = this.dataManager.getData(upperSecondFrom, upperSecondTo, true)
		let lowerData = this.dataManager.getData(lowerSecondFrom, lowerSecondTo, false)

		// 上一頁資料
		// let upperDataPeriod = upperSecondTo - upperSecondFrom;
		// let preUpperData = this.dataManager.getData(upperSecondFrom - upperDataPeriod, upperSecondTo - upperDataPeriod, true);
		// let lowerDataPeriod = lowerSecondTo - lowerSecondFrom;
		// let preLowerData = this.dataManager.getData(lowerSecondFrom - lowerDataPeriod, lowerSecondTo - lowerDataPeriod, false);
		// // 下一頁資料
		// let nextUpperData = this.dataManager.getData(upperSecondFrom + upperDataPeriod, upperSecondTo + upperDataPeriod, true);
		// let nextLowerData = this.dataManager.getData(lowerSecondFrom + lowerDataPeriod, lowerSecondTo + lowerDataPeriod, false);
		// console.log('upperData');
		// console.log(upperData);
		// console.log('preUpperData');
		// console.log(preUpperData);
		// console.log('nextUpperData');
		// console.log(nextUpperData);

		let upperLabels = []
		for (let i = 0; i < upperConstLabels.length; i++) {
			upperLabels.push(upperConstLabels[i])
		}
		let upperChannelKeys = Object.keys(upperLabelsForScale)
		for (let i = 0; i < upperChannelKeys.length; i++) {
			let channelId = upperChannelKeys[i]
			let label = Object.assign({label: this.dataManager.getChannelRange(true, channelId) + ' ' + units[channelId]}, upperLabelsForScale[channelId])
			upperLabels.push(label)
		}
		
		let lowerLabels = []
		for (let i = 0; i < lowerConstLabels.length; i++) {
			lowerLabels.push(lowerConstLabels[i])
		}
		let lowerChannelKeys = Object.keys(lowerLabelsForScale)
		for (let i = 0; i < lowerChannelKeys.length; i++) {
			let channelId = lowerChannelKeys[i]
			let label = Object.assign({label: this.dataManager.getChannelRange(false, channelId) + ' ' + units[channelId]}, lowerLabelsForScale[channelId])
			lowerLabels.push(label)
		}

		let upperChannels = new Set([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
		
		let upperEventIds = this.eventDataStructure.getEventIdsByTimeRangeAndChannelIds(upperSecondFrom, upperSecondTo, upperChannels)
		//console.log(upperEventIds)
		let upperEvents = this.eventDataStructure.getEventObjectsByEventIds(upperEventIds)
		
		let lowerChannels = new Set([11, 12, 13, 14, 15, 16, 17, 18, 19, 20])
		let lowerEventIds = this.eventDataStructure.getEventIdsByTimeRangeAndChannelIds(lowerSecondFrom, lowerSecondTo, lowerChannels)
		let lowerEvents = this.eventDataStructure.getEventObjectsByEventIds(lowerEventIds)
		//console.log('events', upperEvents, lowerEvents)
		let upperSelectedItem = this.timeController.getUpperTimeInterval()
		let lowerSelectedItem = this.timeController.getLowerTimeInterval()
		
		let stages = Array.from(this.stagesDataStructure)
		
		let upperEpochFrom = Math.floor(upperSecondFrom / 30)
		let upperEpochLength = Math.floor((upperSecondTo - upperSecondFrom) / 30)
		upperEpochLength = upperEpochLength === 0 ? 1 : upperEpochLength
		let upperStages = []
		for (let i = 0; i < upperEpochLength; i++) {
			let epoch = upperEpochFrom + i
			upperStages.push(stageIntToString[stages[epoch]])
		}
		let lowerEpochFrom = Math.floor(lowerSecondFrom / 30)
		let lowerEpochLength = Math.floor((lowerSecondTo - lowerSecondFrom) / 30)
		lowerEpochLength = lowerEpochLength === 0 ? 1 : lowerEpochLength
		let lowerStages = []
		for (let i = 0; i < lowerEpochLength; i++) {
			let epoch = lowerEpochFrom + i
			lowerStages.push(stageIntToString[stages[epoch]])
		}
		let currentEpoch = this.timeController.getCurrentEpoch()
		let buffered = this.dataManager.getBuffered()
		let hasNotCompleted = false
		for (let i = 0; i < stages.length; i++) {
			
			if (stages[i] === 10) {
				//console.log('stages[' + i + '] === 10')
				hasNotCompleted = true
				break
			}
		}
		//console.log('hasNotCompleted', hasNotCompleted)
		this.setState({
			display: true,
			upperLoading: !this.dataManager.hasData(upperSecondFrom, upperSecondTo, true),
			lowerLoading: !this.dataManager.hasData(lowerSecondFrom, lowerSecondTo, false),
			cursorSecond: cursorSecond,
			upperSecondFrom: upperSecondFrom,
			upperSecondTo: upperSecondTo,
			lowerSecondFrom: lowerSecondFrom,
			lowerSecondTo: lowerSecondTo,
			upperData: upperData,
			lowerData: lowerData,
			// preUpperData: preUpperData,
			// preLowerData: preLowerData,
			// nextUpperData: nextUpperData,
			// nextLowerData: nextLowerData,
			upperLabel: upperLabels,
			lowerLabel: lowerLabels,
			upperEvents: upperEvents,
			lowerEvents: lowerEvents,
			upperSelectedItem: upperSelectedItem,
			lowerSelectedItem: lowerSelectedItem,
			stages: stages,
			upperStages: upperStages,
			lowerStages: lowerStages,
			currentEpoch: currentEpoch,
			buffered: buffered,
			hasNotCompleted: hasNotCompleted
		})
	}

	render() {
		//console.log('render')
		/*
		let upperStages = []
		let upperEpochNum = Math.floor((this.state.upperSecondTo - this.state.upperSecondFrom) / 30)
		upperEpochNum = upperEpochNum == 0 ? 1 : upperEpochNum // 如果不到一個epoch，就當作有一個epoch
		let upperEpochFrom = Math.floor(this.state.upperSecondFrom / 30)
		for (let i = 0; i < upperEpochNum; i++) {
			upperStages.push()
		}
		*/
		//console.log(this.timeController.getUpperTimeInterval())
		//console.log(this.state.upperEvents)
		//if (this.state.display === false) return <></>
		// if (!this.state.hasNetwork) {
		// 	alert('目前是斷線狀態\n資料將不會儲存\n請檢查網路連線');
		// 	window.location.reload();
		// 	return (
		// 		<div>
		// 			<h2>目前是斷線狀態</h2>
		// 			<h2>資料將不會儲存</h2>
		// 			<h2>請檢查網路連線</h2>
		// 		</div>
		// 	)
		// }
		// else {
			return (
				<>
					<ScoringNavbar
						onComplete={() => {
							this.setState({
								hasSubmitted: true
							})
							this.pauseRequestManager.flush(async () => {
								let submitStageResult = await axios.post('/ajax_submit_stage', { psgFileId: this.state.psgFileId })
								if (!submitStageResult.data.success) {
									alert(submitStageResult.data.msg)
									window.history.go(0)
									return
								}
								window.location.href="#"
							})
						}}
						logout={() => {
							console.log('logout')
						}}
						stateToShow={this.state.stateToShow}
						editable={this.state.editable}
						account={this.state.account}
						onLogout={() => {
							window.location.href="#"
						}}
						onShowAnswerChecked={this.onShowAnswerChecked}
						enableShowAnswerCheckbox={this.state.enableShowAnswerCheckbox}
						hasAnswer={this.state.hasAnswer}
						buttonDisabled={(this.state.hasNotCompleted) || (this.state.hasSubmitted)}
						hasStagesBeenLoaded={this.state.hasStagesBeenLoaded} />
					{this.state.display && (!this.state.hasSubmitted) ?
						<>
							<Hypnogram
								leftSpace={20}
								rightSpace={10}
								topSpace={5}
								bottomSpace={5}
								stages={this.state.stages}
								modeArr={this.state.modeArr}
								answer={this.state.answer}
								currentEpoch={this.state.currentEpoch}
								jumpTo={this.jumpTo}
								buffered={this.state.buffered}/>
							{<div style={{
								position: 'absolute',
								textAlign: 'center',
								fontWeight: 'bold',
								left: '0px',
								right: '0px',
								height: '0px',
								top: '52px',
								color: 'red',
								fontSize: '24px',
								opacity: '40%'
							}}>
								{
									'Cursor: ' + formatSecond(this.state.cursorSecond) +
									' Epoch: ' + (parseInt(this.state.currentEpoch) + 1) +
									' - ' + stageIntToString[this.state.stages[this.state.currentEpoch]]
								}
							</div>}
							<SignalPanel
								upperLoading={this.state.upperLoading}
								lowerLoading={this.state.lowerLoading}
								editable={this.state.editable}
								addEvent={this.addEvent}
								deleteEvent={this.deleteEvent}
								setEventType={this.setEventType}
								moveCursor={this.moveCursor}
								zoomChannel={this.zoomChannel}
								getEventInfo={this.getEventInfo}
								getChannelEvents={getChannelEvents}
								cursorSecond={this.state.cursorSecond}
								upperSecondFrom={this.state.upperSecondFrom}
								upperSecondTo={this.state.upperSecondTo}
								upperData={this.state.upperData}
								preUpperData={this.state.preUpperData}
								nextUpperData={this.state.nextUpperData}
								lowerSecondFrom={this.state.lowerSecondFrom}
								lowerSecondTo={this.state.lowerSecondTo}
								lowerData={this.state.lowerData}
								preLowerData={this.state.preLowerData}
								nextLowerData={this.state.nextLowerData}
								upperEvents={this.state.upperEvents}
								lowerEvents={this.state.lowerEvents}
								upperLabels={this.state.upperLabel}
								lowerLabels={this.state.lowerLabel}
								upperVerticalLines={getVerticalLines(this.timeController.getUpperTimeInterval())}
								upperHorizontalLines={getUpperHorizontalLines()}
								lowerVerticalLines={getVerticalLines(this.timeController.getLowerTimeInterval())}
								lowerHorizontalLines={getLowerHorizontalLines()}
								upperStages={this.state.upperStages}
								lowerStages={this.state.lowerStages}
								upperSelectItem={this.upperSelectItem}
								upperItems={['10 sec', '30 sec', '1 min', '2 min', '3 min', '5 min', '10 min']}
								upperSelectedItem={this.state.upperSelectedItem}
								lowerSelectItem={this.lowerSelectItem}
								lowerItems={['10 sec', '30 sec', '1 min', '2 min', '3 min', '5 min', '10 min']}
								lowerSelectedItem={this.state.lowerSelectedItem}
								psgFileId={this.state.psgFileId} />
						</> : null
					}
				</>
			)
		// }
	}
	async componentDidMount() {
		// this.interval = setInterval(() => this.networkDetect(), 3000)

		let account = (await axios.post('/ajax_who_am_i', {})).data.account
		if (account === undefined) {
			window.location.href = "#"
			return
		}
		this.setState({
			account: account
		})
		let chSegRes = (await axios.post('/ajax_ch_seg', { psgFileId: this.state.psgFileId })).data
		if (!chSegRes.success) {
			alert(chSegRes.msg)
			window.history.go(0)
			return
		}
		//console.log(chSegRes)
		let upperChannels = chSegRes.upperChannels
		let lowerChannels = chSegRes.lowerChannels
		let paramForDataManagerConstructor = []
		for (let i = 0; i < upperChannels.length; i++) {
			let channel = upperChannels[i]
			let channelId = channelNameToChannelId[channel.channelName]
			let element = {}
			element.offset = channel.offset
			element.dataLength = channel.length
			element.channelId = channelId
			element = Object.assign(element, dataDisplay[channelId])
			paramForDataManagerConstructor.push(element)
		}
		for (let i = 0; i < lowerChannels.length; i++) {
			let channel = lowerChannels[i]
			let channelId = channelNameToChannelId[channel.channelName]
			let element = {}
			element.offset = channel.offset
			element.dataLength = channel.length
			element.channelId = channelId
			element = Object.assign(element, dataDisplay[channelId])
			paramForDataManagerConstructor.push(element)
		}
		let totalEpoch = chSegRes.totalEpochNumber
		
		// test
		//this.answer = new Array(totalEpoch)
		//this.answer.fill(0)
		
		this.dataManager = new DataManager(paramForDataManagerConstructor, totalEpoch)
		let psgFileId = parseInt(this.props.match.params.id)
		this.dataRequestManager = new DataRequestManager(psgFileId)
		if (this.state.editable) {
			let loadPauseResult = await axios.post('/ajax_load_pause', {psgFileId: psgFileId})
			if (!loadPauseResult.data.success) {
				alert(loadPauseResult.data.msg)
				window.history.go(0)
				return
			}
			console.log(loadPauseResult.data.events)
			this.eventDataStructure = new EventsDataStructure(loadPauseResult.data.events, channelColors, {13: 12, 14: 12, 15: 12}, {12: new Set([13, 14, 15])})
		
			console.log(loadPauseResult.data.jump, totalEpoch);
			this.timeController = new TimeController(loadPauseResult.data.jump, totalEpoch)
		
			this.stagesDataStructure = loadPauseResult.data.stages
			this.pauseRequestManager = new PauseRequestManager(psgFileId, this.onStateChange)
		} else {
			let loadResultResult = await axios.post('/ajax_load_result', {psgFileId: psgFileId, scoringTimes: this.state.which})
			if (!loadResultResult.data.success) {
				alert(loadResultResult.data.msg)
				window.history.go(0)
				return
			}
			let events = loadResultResult.data.events
			for (let i = 1; i <= events.length; i++) {
				events[i - 1].eventId = i
			}
			//console.log(events)
			this.eventDataStructure = new EventsDataStructure(events, channelColors, {13: 12, 14: 12, 15: 12}, {12: new Set([13, 14, 15])})
			this.timeController = new TimeController(jump, totalEpoch)
			this.stagesDataStructure = loadResultResult.data.stages
			this.pauseRequestManager = null
			
			let statResult = await axios.post('/ajax_load_stat', { psgFileId: psgFileId })
			if (!statResult.data.success) {
				alert(statResult.data.msg)
				window.history.go(0)
				return
			} else {
				let stat = statResult.data.stat
				let epochAndStageToCount = new Array(totalEpoch)
				for (let i = 0; i < epochAndStageToCount.length; i++) {
					epochAndStageToCount[i] = {
						'-1': 0,
						'-2': 0,
						'0': 0,
						'1': 0,
						'2': 0,
						'3': 0
					}
				}
				for (let i = 0; i < stat.length; i++) {
					let epoch = stat[i].epoch
					let stage = stat[i].stage
					let count = stat[i].count
					epochAndStageToCount[epoch][stage] = count
				}
				let modeArr = new Array(totalEpoch)
				for (let i = 0; i < epochAndStageToCount.length; i++) {
					let max = 0
					let maxKey = null
					let keys = Object.keys(epochAndStageToCount[i])
					for (let j = 0; j < keys.length; j++) {
						if (epochAndStageToCount[i][keys[j]] > max) {
							max = epochAndStageToCount[i][keys[j]]
							maxKey = keys[j]
						}
					}
					modeArr[i] = parseInt(maxKey)
				}
				this.setState({
					modeArr: modeArr
				})
				console.log(modeArr)
			}
			//console.log(statResult)
			//console.log(this.eventDataStructure)
		}
		let hasAnswerResult = await axios.post('/ajax_has_answer', { psgFileId: psgFileId })
		if (!hasAnswerResult.data.success) {
			alert(hasAnswerResult.data.msg)
			window.history.go(0)
			return
		}
		
		this.setState({
			hasStagesBeenLoaded: true,
			hasAnswer: hasAnswerResult.data.hasAnswer
			//hasNotCompleted: true
		})
		this.checkDataAndSendRequest()
		document.addEventListener('keydown', this.onKeyDown);
		//console.log(this)
	}
	componentWillUnmount() {
		clearInterval(this.interval)
		//console.log('unmount')
		this.unmount = true
		document.removeEventListener('keydown', this.onKeyDown);
	}
	onKeyDown(e) {
		//console.log('key down')
		//console.log(this)
		if (this.stagesDataStructure === null || this.timeController === null) return
		if (this.state.hasSubmitted) return
		let currentEpoch = this.timeController.getCurrentEpoch()
		
		if (e.keyCode === 39 || e.keyCode === 40 || e.keyCode === 34) { // right arrow
			this.timeController.pageDown()
			if (this.state.editable) this.pauseRequestManager.editCurrentWindow(
				this.timeController.getUpperSecondFrom(),
				this.timeController.getLowerSecondFrom(),
				this.timeController.getUpperTimeInterval(),
				this.timeController.getLowerTimeInterval(),
				this.timeController.getCursorSecond()
			)
			this.checkDataAndSendRequest()
			this.setStateFromDataStructure()
			//this.startBuffer()
		} else if (e.keyCode === 37 || e.keyCode === 38 || e.keyCode === 33) { // left arrow
			this.timeController.pageUp()
			if (this.state.editable) this.pauseRequestManager.editCurrentWindow(
				this.timeController.getUpperSecondFrom(),
				this.timeController.getLowerSecondFrom(),
				this.timeController.getUpperTimeInterval(),
				this.timeController.getLowerTimeInterval(),
				this.timeController.getCursorSecond()
			)
			this.checkDataAndSendRequest()
			this.setStateFromDataStructure()
			//this.startBuffer()
		}
		if (this.state.editable) if (e.keyCode === 192 || e.keyCode === 96 || e.keyCode === 48) { // wake
			this.stagesDataStructure[currentEpoch] = 0
			this.pauseRequestManager.editStage(currentEpoch, 0)
			this.timeController.nextEpoch()
			this.pauseRequestManager.editCurrentWindow(
				this.timeController.getUpperSecondFrom(),
				this.timeController.getLowerSecondFrom(),
				this.timeController.getUpperTimeInterval(),
				this.timeController.getLowerTimeInterval(),
				this.timeController.getCursorSecond()
			)
			this.checkDataAndSendRequest()
			this.setStateFromDataStructure()
			//this.startBuffer()
		} else if (e.keyCode === 49 || e.keyCode === 97) { // n1
			this.stagesDataStructure[currentEpoch] = 1
			this.pauseRequestManager.editStage(currentEpoch, 1)
			this.timeController.nextEpoch()
			this.pauseRequestManager.editCurrentWindow(
				this.timeController.getUpperSecondFrom(),
				this.timeController.getLowerSecondFrom(),
				this.timeController.getUpperTimeInterval(),
				this.timeController.getLowerTimeInterval(),
				this.timeController.getCursorSecond()
			)
			this.checkDataAndSendRequest()
			this.setStateFromDataStructure()
			//this.startBuffer()
		} else if (e.keyCode === 50 || e.keyCode === 98) { // n2
			this.stagesDataStructure[currentEpoch] = 2
			this.pauseRequestManager.editStage(currentEpoch, 2)
			this.timeController.nextEpoch()
			this.pauseRequestManager.editCurrentWindow(
				this.timeController.getUpperSecondFrom(),
				this.timeController.getLowerSecondFrom(),
				this.timeController.getUpperTimeInterval(),
				this.timeController.getLowerTimeInterval(),
				this.timeController.getCursorSecond()
			)
			this.checkDataAndSendRequest()
			this.setStateFromDataStructure()
			//this.startBuffer()
		} else if (e.keyCode === 51 || e.keyCode === 99) { // n3
			this.stagesDataStructure[currentEpoch] = 3
			this.pauseRequestManager.editStage(currentEpoch, 3)
			this.timeController.nextEpoch()
			this.pauseRequestManager.editCurrentWindow(
				this.timeController.getUpperSecondFrom(),
				this.timeController.getLowerSecondFrom(),
				this.timeController.getUpperTimeInterval(),
				this.timeController.getLowerTimeInterval(),
				this.timeController.getCursorSecond()
			)
			this.checkDataAndSendRequest()
			this.setStateFromDataStructure()
			//this.startBuffer()
		} else if (e.keyCode === 53 || e.keyCode === 101) { // rem
			this.stagesDataStructure[currentEpoch] = -1
			this.pauseRequestManager.editStage(currentEpoch, -1)
			this.timeController.nextEpoch()
			this.pauseRequestManager.editCurrentWindow(
				this.timeController.getUpperSecondFrom(),
				this.timeController.getLowerSecondFrom(),
				this.timeController.getUpperTimeInterval(),
				this.timeController.getLowerTimeInterval(),
				this.timeController.getCursorSecond()
			)
			this.checkDataAndSendRequest()
			this.setStateFromDataStructure()
			//this.startBuffer()
		} else if (window.event.shiftKey && e.keyCode === 191) { // ?
			this.stagesDataStructure[currentEpoch] = -2
			this.pauseRequestManager.editStage(currentEpoch, -2)
			this.timeController.nextEpoch()
			this.pauseRequestManager.editCurrentWindow(
				this.timeController.getUpperSecondFrom(),
				this.timeController.getLowerSecondFrom(),
				this.timeController.getUpperTimeInterval(),
				this.timeController.getLowerTimeInterval(),
				this.timeController.getCursorSecond()
			)
			this.checkDataAndSendRequest()
			this.setStateFromDataStructure()
			//this.startBuffer()
		}
	}
	startBuffer() {
		let toBuffer = this.dataManager.getNextEpochToBuffer(this.timeController.getCurrentEpoch())
		
		//console.log('to buffer', toBuffer)
		if (toBuffer !== null) {
			//console.log(toBuffer.epoch)
			this.dataRequestManager.setRequest(toBuffer.upper ? [toBuffer.epoch] : [], toBuffer.lower ? [toBuffer.epoch] : [], this.onRequestComplete)
		}
	}
	onRequestComplete(data) {
		//console.log(data)
		//console.log('complete')
		if (this.unmount) return
		for (let i = 0; i < data.length; i++) {
			//console.log('set data', data[i].upper, data[i].epoch)
			this.dataManager.setData(data[i].data, data[i].epoch, data[i].upper)
		}
		this.setStateFromDataStructure()
		this.startBuffer()
	}
	checkDataAndSendRequest() {
		let upperSecondFrom = this.timeController.getUpperSecondFrom()
		let upperSecondTo = this.timeController.getUpperSecondTo()
		let upperNoEpochs = this.dataManager.checkData(upperSecondFrom, upperSecondTo, true)
		
		let lowerSecondFrom = this.timeController.getLowerSecondFrom()
		let lowerSecondTo = this.timeController.getLowerSecondTo()
		let lowerNoEpochs = this.dataManager.checkData(lowerSecondFrom, lowerSecondTo, false)
		//console.log('upper second', upperSecondFrom, upperSecondTo)
		//console.log('lower second', lowerSecondFrom, lowerSecondTo)
		//console.log('upper no data:', upperNoEpochs, 'lower no data:', lowerNoEpochs)
		//console.log('lower no data:', lowerNoEpochs)
		if (upperNoEpochs.length === 0 && lowerNoEpochs.length === 0) {
			//console.log('no request start buffer')
			this.startBuffer()
			return
		}
		this.dataRequestManager.setRequest(upperNoEpochs, lowerNoEpochs, (data) => {this.onRequestComplete(data)})
	}
	jumpTo(epoch) {
		//console.log('jump to', epoch)
		this.timeController.jumpToEpoch(epoch)
		if (this.state.editable) this.pauseRequestManager.editCurrentWindow(
			this.timeController.getUpperSecondFrom(),
			this.timeController.getLowerSecondFrom(),
			this.timeController.getUpperTimeInterval(),
			this.timeController.getLowerTimeInterval(),
			this.timeController.getCursorSecond()
		)
		this.checkDataAndSendRequest()
		this.setStateFromDataStructure()
	}
	addEvent(channelId, secondFrom, secondTo, type, priority) {
		//console.log('add event', channelId, secondFrom, secondTo, type, priority)
		secondFrom = parseFloat(secondFrom.toFixed(constants.floatToFixed))
		secondTo = parseFloat(secondTo.toFixed(constants.floatToFixed))
		let maxSec = this.stagesDataStructure.length * 30
		secondTo = secondTo > maxSec ? maxSec : secondTo
		let addResult = this.eventDataStructure.addEvent(channelId, secondFrom, secondTo, type, priority)
		for (let i = 0; i < addResult.overlappedEventId.length; i++) {
			this.pauseRequestManager.editEvent('delete', addResult.overlappedEventId[i], null, null, null, null)
		}
		let eventObject = this.eventDataStructure.getEventObjectByEventId(addResult.eventId)
		this.pauseRequestManager.editEvent('add', addResult.eventId, eventObject.secondFrom, eventObject.secondTo, eventObject.channelId, eventObject.type)
		this.setStateFromDataStructure()
	}
	deleteEvent(eventId) {
		//console.log('delete event', eventId)
		this.eventDataStructure.deleteEvent(eventId)
		this.pauseRequestManager.editEvent('delete', eventId, null, null, null, null)
		this.setStateFromDataStructure()
	}
	moveCursor(second) {
		//console.log('move cursor', second)
		this.timeController.moveCursor(second)
		if (this.state.editable) this.pauseRequestManager.editCurrentWindow(
			this.timeController.getUpperSecondFrom(),
			this.timeController.getLowerSecondFrom(),
			this.timeController.getUpperTimeInterval(),
			this.timeController.getLowerTimeInterval(),
			this.timeController.getCursorSecond()
		)
		this.checkDataAndSendRequest()
		this.setStateFromDataStructure()
		//this.startBuffer()
	}
	zoomChannel(channelId, up) {
		//console.log('zoom channel', channelId, up)
		this.dataManager.zoomChannel(channelId, up)
		this.setStateFromDataStructure()
	}
	upperSelectItem(item) {
		//console.log('upper select item', item)
		this.timeController.setUpperTimeInterval(item)
		if (this.state.editable) this.pauseRequestManager.editCurrentWindow(
			this.timeController.getUpperSecondFrom(),
			this.timeController.getLowerSecondFrom(),
			this.timeController.getUpperTimeInterval(),
			this.timeController.getLowerTimeInterval(),
			this.timeController.getCursorSecond()
		)
		this.checkDataAndSendRequest()
		this.setStateFromDataStructure()
		//this.startBuffer()
	}
	lowerSelectItem(item) {
		//console.log('lower select item', item)
		this.timeController.setLowerTimeInterval(item)
		if (this.state.editable) this.pauseRequestManager.editCurrentWindow(
			this.timeController.getUpperSecondFrom(),
			this.timeController.getLowerSecondFrom(),
			this.timeController.getUpperTimeInterval(),
			this.timeController.getLowerTimeInterval(),
			this.timeController.getCursorSecond()
		)
		this.checkDataAndSendRequest()
		this.setStateFromDataStructure()
		//this.startBuffer()
	}
	setEventType(eventId, type) {
		//console.log('set event type', eventId, type)
		this.eventDataStructure.setEventType(eventId, type)
		this.pauseRequestManager.editEvent('set', eventId, null, null, null, type)
		this.setStateFromDataStructure()
	}
	getEventInfo(eventId) {
		return this.eventDataStructure.getEventObjectByEventId(eventId)
	}
	onStateChange(state) {
		//console.log(PauseRequestManager.start)
		//console.log(state)
		let stateToStr = {}
		stateToStr[PauseRequestManager.get_START()] = ''
		stateToStr[PauseRequestManager.get_UNSAVED()] = '尚未儲存'
		stateToStr[PauseRequestManager.get_SAVING()] = '儲存中'
		stateToStr[PauseRequestManager.get_SAVED()] = '已儲存'
		stateToStr[PauseRequestManager.get_END()] = '已完成'
		//console.log(stateToStr)
		let stateStr = stateToStr[state]
		this.setState({
			stateToShow: stateStr
		})
	}
	async onShowAnswerChecked(checked) {
		if (checked) {
			if (this.answer === null) {
				// ajax to get answer
				// let answerResult = await axios.post('/ajax_answer', { psgFileId: this.state.psgFileId })
				this.setState({
					enableShowAnswerCheckbox: false
				})
				let answerResult = await axios.post('/ajax_answer', { psgFileId: this.state.psgFileId })
				//console.log(answerResult)
				if (!answerResult.data.success) {
					alert(answerResult.data.msg)
					window.history.go(0)
					return
				}
				this.answer = answerResult.data.data
				this.setState({
					enableShowAnswerCheckbox: true,
					answer: this.answer
				})
			} else {
				this.setState({
					answer: this.answer
				})
			}
		} else {
			this.setState({
				answer: null
			})
		}
	}
}

export default Scoring