import React from 'react'
import Dropdown from 'react-bootstrap/Dropdown'

function FileNameDropdown(props) {
	const CustomToggle = React.forwardRef(({ children, onClick }, ref) => (
		<a
			href="/#/"
			ref={ref}
			onClick={(e) => {
				e.preventDefault();
				onClick(e);
			}}>
			{children}
			&#x25bc;
		</a>
	))
	//console.log('props', props)
	let children = []
	for (let i = 1; i <= props.totalNumber; i++) {
		let key = i
		children.push(<Dropdown.Item key={key} eventKey={key}>
			{'第 ' + key +' 次結果'}
		</Dropdown.Item>)
	}
	children.push(<Dropdown.Divider key='divider' />)
	children.push(<Dropdown.Item key={0} eventKey={0}>
		{props.paused ? '繼續' : '新增'}
	</Dropdown.Item>)
	return(
		<Dropdown onSelect={props.selectItem} style={{display: 'inline-block'}}>
			<Dropdown.Toggle as={CustomToggle} id="dropdown-filename">
				{props.fileName}
			</Dropdown.Toggle>
			<Dropdown.Menu>{children}</Dropdown.Menu>
		</Dropdown>
	)
}

export default FileNameDropdown