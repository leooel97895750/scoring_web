import React from 'react'
import Card from 'react-bootstrap/Card'
import FileNameDropdown from './FileNameDropdown'
function ListItem(props) {
	//console.log(props)
	return <>
		<Card style={{
			width: '40rem',
			marginLeft: 'auto',
			marginRight: 'auto'}}>
			<Card.Body>
				<FileNameDropdown totalNumber={props.totalNumber} fileName={props.fileName} selectItem={props.selectItem} paused={props.paused} />
				{
					props.totalNumber !== 0 ?
						<a href={'/download?id=' + props.psgFileId} style={{float: 'right'}}>下載</a> :
						null
				}
			</Card.Body>
		</Card>
		<br />
	</>
}

export default ListItem