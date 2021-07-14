import React, { Component } from 'react'
import Modal from 'react-bootstrap/Modal'
import Button from 'react-bootstrap/Button'
import axios from 'axios'
import formatSecond from './functions/formatSecond'

function formatDuration(from, to) {
	return (to - from).toFixed(1)
}
class EventInfoWindow extends Component {
	constructor(props) {
		super(props)
		this.handleChange = this.handleChange.bind(this)
		this.state = {
			desat: null
		}
	}
	handleChange(e) {
		let type = e.target.value
		this.props.onSelected(this.props.eventId, type)
		this.props.onCancel()
	}
	render() {
		//console.log(this.props.eventId)
		let eventInfo = this.props.getEventInfo(this.props.eventId)
		let eventTypes = this.props.getChannelEvents(eventInfo.channelId)
		let desat = null
		if (this.props.showDesat) {
			desat = <>Desat<br />{this.state.desat}</>
		}

		// 產生起訖點振幅
		let amplitude = null;
		//console.log(eventInfo.channelId); // 只會有2(顯示全腦波)、12(應該顯示四排)、16(顯示spo2)
		if(eventInfo.channelId === 2){
			//this.props.data[0 ~ 7]

			//console.log(this.props.data[1]);
			// 左界在目前頁面
			let isLeftIn = ((eventInfo.secondFrom >= this.props.secondFrom) && (eventInfo.secondFrom <= this.props.secondTo)) ? 1 : 0;
			// 右界在目前頁面
			let isRightIn = ((eventInfo.secondTo >= this.props.secondFrom) && (eventInfo.secondTo <= this.props.secondTo)) ? 1 : 0;

			let eegAmps = [];
			for(let i=0; i<8; i++){
				let startPoint = (this.props.data[i].dataLength-1) * (eventInfo.secondFrom - this.props.secondFrom) / (this.props.secondTo - this.props.secondFrom);
				let endPoint = (this.props.data[i].dataLength-1) * (eventInfo.secondTo - this.props.secondFrom) / (this.props.secondTo - this.props.secondFrom);
				//console.log(startPoint, endPoint);
				let eegAmp = 0;
				if(isLeftIn && isRightIn){
					try {eegAmp = Math.abs(this.props.data[i].data(Math.round(startPoint)) - this.props.data[i].data(Math.round(endPoint))).toFixed(1);}
					catch(error) {console.log(error);}
				}
				// 左界超出
				else if(isLeftIn === 0 && isRightIn === 1){
					//console.log(Math.round(startPoint + this.props.data[i].dataLength - 1), Math.round(endPoint));
					try {eegAmp = Math.abs(this.props.preData[i].data(Math.round(startPoint + this.props.data[i].dataLength - 1)) - this.props.data[i].data(Math.round(endPoint))).toFixed(1);}
					catch(error) {console.log(error);}
				}
				// 右界超出
				else if(isLeftIn === 1 && isRightIn === 0){
					//console.log(Math.round(startPoint), Math.round(endPoint - this.props.data[i].dataLength + 1));
					try {eegAmp = Math.abs(this.props.data[i].data(Math.round(startPoint)) - this.props.nextData[i].data(Math.round(endPoint - this.props.data[i].dataLength + 1))).toFixed(1);}
					catch(error) {console.log(error);}
				}
				eegAmps.push(eegAmp);
			}
			
			amplitude = <>
				起訖點振幅<br />
				<span style={{float:'left'}}>C3M2: <b>{eegAmps[0]}uv</b><br/>C4M1: <b>{eegAmps[1]}uv</b><br/>F3M2: <b>{eegAmps[2]}uv</b><br/>F4M1: <b>{eegAmps[3]}uv</b></span>
				<span style={{float:'left', marginLeft:'10px'}}>O1M2: <b>{eegAmps[4]}uv</b><br/>O2M1: <b>{eegAmps[5]}uv</b><br/>E1M2: <b>{eegAmps[6]}uv</b><br/>E2M1: <b>{eegAmps[7]}uv</b></span>
				<br />
			</>
		}
		else if(eventInfo.channelId === 12){
			// this.props.data[1 ~ 4]

			//console.log(this.props.data[1]);
			// 左界在目前頁面
			let isLeftIn = ((eventInfo.secondFrom >= this.props.secondFrom) && (eventInfo.secondFrom <= this.props.secondTo)) ? 1 : 0;
			// 右界在目前頁面
			let isRightIn = ((eventInfo.secondTo >= this.props.secondFrom) && (eventInfo.secondTo <= this.props.secondTo)) ? 1 : 0;

			let eventAmps = [];
			for(let i=1; i<5; i++){
				let startPoint = (this.props.data[i].dataLength-1) * (eventInfo.secondFrom - this.props.secondFrom) / (this.props.secondTo - this.props.secondFrom);
				let endPoint = (this.props.data[i].dataLength-1) * (eventInfo.secondTo - this.props.secondFrom) / (this.props.secondTo - this.props.secondFrom);
				//console.log(startPoint, endPoint);
				let eventAmp = 0;
				if(isLeftIn && isRightIn){
					try {eventAmp = Math.abs(this.props.data[i].data(Math.round(startPoint)) - this.props.data[i].data(Math.round(endPoint))).toFixed(1);}
					catch(error) {console.log(error);}
				}
				// 左界超出
				else if(isLeftIn === 0 && isRightIn === 1){

					try {eventAmp = Math.abs(this.props.preData[i].data(Math.round(startPoint + this.props.data[i].dataLength - 1)) - this.props.data[i].data(Math.round(endPoint))).toFixed(1);}
					catch(error) {console.log(error);}
				}
				// 右界超出
				else if(isLeftIn === 1 && isRightIn === 0){

					try {eventAmp = Math.abs(this.props.data[i].data(Math.round(startPoint)) - this.props.nextData[i].data(Math.round(endPoint - this.props.data[i].dataLength + 1))).toFixed(1);}
					catch(error) {console.log(error);}
				}
				eventAmps.push(eventAmp);
			}
			
			amplitude = <>
				起訖點振幅<br />
				<span style={{float:'left'}}>NPress: <b>{eventAmps[0]}cmH2O</b><br/>Therm: <b>{eventAmps[1]}uv</b></span>
				<span style={{float:'left', marginLeft:'10px'}}>Thor: <b>{eventAmps[2]}uv</b><br/>Abdo: <b>{eventAmps[3]}uv</b></span>
				<br />
			</>
		}
		// else if(eventInfo.channelId === 16){
		// 	// this.props.data[5]

		// 	// 左界在目前頁面
		// 	let isLeftIn = ((eventInfo.secondFrom >= this.props.secondFrom) && (eventInfo.secondFrom <= this.props.secondTo)) ? 1 : 0;
		// 	// 右界在目前頁面
		// 	let isRightIn = ((eventInfo.secondTo >= this.props.secondFrom) && (eventInfo.secondTo <= this.props.secondTo)) ? 1 : 0;
		// 	//console.log(isLeftIn, isRightIn);

		// 	console.log(this.props.data[5]);

		// 	let startPoint = (this.props.data[5].dataLength-1) * (eventInfo.secondFrom - this.props.secondFrom) / (this.props.secondTo - this.props.secondFrom);
		// 	let endPoint = (this.props.data[5].dataLength-1) * (eventInfo.secondTo - this.props.secondFrom) / (this.props.secondTo - this.props.secondFrom);
		// 	console.log(startPoint, endPoint);

		// 	let spo2Amp = 0;
		// 	if(isLeftIn && isRightIn){
		// 		try {spo2Amp = Math.abs(this.props.data[5].data(Math.round(startPoint)) - this.props.data[5].data(Math.round(endPoint))).toFixed(1);}
		// 		catch(error) {console.log(error);}
		// 	}
		// 	// 左界超出
		// 	else if(isLeftIn === 0 && isRightIn === 1){
		// 		try {spo2Amp = Math.abs(this.props.preData[5].data(Math.round(startPoint + this.props.data[5].dataLength)) - this.props.data[5].data(Math.round(endPoint))).toFixed(1);}
		// 		catch(error) {console.log(error);}
		// 	}
		// 	// 右界超出
		// 	else if(isLeftIn === 1 && isRightIn === 0){
		// 		try {spo2Amp = Math.abs(this.props.data[5].data(Math.round(startPoint)) - this.props.nextData[5].data(Math.round(endPoint - this.props.data[5].dataLength))).toFixed(1);}
		// 		catch(error) {console.log(error);}
		// 	}


		// 	amplitude = <>
		// 		<span>
		// 			{spo2Amp}%
		// 		</span>
		// 		<br />
		// 	</>
		// }

		return (
			<Modal
				show={this.props.visible}
				onHide={this.props.onCancel}
				size="sm"
				aria-labelledby="contained-modal-title-vcenter"
				centered>
				<Modal.Header closeButton>
					<Modal.Title id="contained-modal-title-vcenter">
						Scored Event Info
					</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<p>
						Start<br />
						{formatSecond(eventInfo.secondFrom)}<br />
						Duration<br />
						{formatDuration(eventInfo.secondFrom, eventInfo.secondTo)}<br />
						
						{amplitude}
						{desat}<br />
						
					</p>
					{this.props.editable ? 
					<select onChange={this.handleChange} size="11" value={eventInfo.type} style={{"overflow":"hidden"}}>
						{eventTypes ? eventTypes.map((type) => {
							return <option key={type} value={type}>{type}</option>
						}) : null}
					</select>
					// <Form.Group>
					// 	<Form.Control
					// 		as="select"
							
					// 		onChange={this.handleChange}
					// 		value={eventInfo.type}
							
					// 		>
					// 		{eventTypes ? eventTypes.map((type) => {
					// 			return <option key={type} value={type}>{type}</option>
					// 		}) : null}
					// 	</Form.Control>
					// </Form.Group> 
					: <p>{eventInfo.type}</p>}
				</Modal.Body>
				{this.props.editable ? <Modal.Footer>
					<Button
						variant="danger"
						onClick={() => {
							this.props.onDelete(this.props.eventId)
							this.props.onCancel()
						}}>
						Delete
					</Button>
				</Modal.Footer> : null}
			</Modal>
		)
	}
	async componentDidMount() {
		//console.log('mount')
		// if is spo2 try to get desat from server
		if (!this.props.showDesat) return
		let eventInfo = this.props.getEventInfo(this.props.eventId)
		let desatResult = await axios.post('/calculate_spo2', {
			timeA: parseInt(eventInfo.secondFrom.toFixed(0)),
			timeB: parseInt(eventInfo.secondTo.toFixed(0)),
			psgFileId: this.props.psgFileId
		})
		this.setState({
			desat: desatResult.data.spo2.toFixed(1)
		})
	}
}

export default EventInfoWindow