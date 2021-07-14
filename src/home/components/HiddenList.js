import React, { Component } from 'react'
//import Navbar from 'react-bootstrap/Navbar'
//import Form from 'react-bootstrap/Form'
//import Button from 'react-bootstrap/Button'
import ListItem from './ListItem'
import axios from 'axios'

class List extends Component {
	constructor(props) {
		super(props)
		this.state = {files: []}
	}
	render() {
		return <>
			{this.state.files.map((file, index) => {
				return <ListItem
					key={index}
					totalNumber={file.scoringTimes}
					fileName={file.name}
					selectItem={(t) => {
						//console.log('id:', file.psgFileId, 'times:', t)
						window.location.href = '#/scoring/' + file.psgFileId + '/' + t
					}}
					psgFileId={file.psgFileId}
					paused={file.paused} />
			})}
		</>
	}
	async componentDidMount() {
		let filesResult = await axios.post('/ajax_list_files', {})
		if (!filesResult.data.success) {
			alert(filesResult.data.msg)
			window.history.go(0)
			return
		}
		console.log(filesResult.data.psgInfo)
		let showdata = []
		// 要顯示的psg id
		for (let i = 0; i < filesResult.data.psgInfo.length; i++) {
			showdata.push(filesResult.data.psgInfo[i])
		}
		console.log(showdata)
		this.setState({ files: showdata })
		
	}
}

export default List