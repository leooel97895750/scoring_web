import React from 'react';
import styles from './css/timeIntervalDropdownStyle.module.css'
import Dropdown from 'react-bootstrap/Dropdown'

function TimeIntervalDropdown(props) {
	const CustomToggle = React.forwardRef(({ children, onClick }, ref) => (
		<a
			href="/#/"
			ref={ref}
			className={styles.timeIntervalDropdown}
			onClick={(e) => {
				e.preventDefault();
				//console.log('on click')
				onClick(e);
			}}>
			{children}
			&#x25bc;
		</a>
	))
	//console.log('items', props.items)
	return(
		//<div></div>
		<Dropdown onSelect={props.selectItem}>
			<Dropdown.Toggle as={CustomToggle} id="dropdown-custom-components">
				{props.selectedItem}
			</Dropdown.Toggle>
			<Dropdown.Menu>
				{props.items.map((item) => {
					return <Dropdown.Item
						key={item}
						eventKey={item}>
						{item}
					</Dropdown.Item>
				})}
			</Dropdown.Menu>
		</Dropdown>
	)
}

export default TimeIntervalDropdown