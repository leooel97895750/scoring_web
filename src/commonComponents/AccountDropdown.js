import React from 'react'
import axios from 'axios'
import Dropdown from 'react-bootstrap/Dropdown'

function AccountDropdown(props) {
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
	return(
		<Dropdown onSelect={async (item) => {
				if (item === 'set_pass') window.location.href = '#/setpass'
				else if (item === 'logout') {
					let result = await axios.post('/ajax_logout', {})
					if (result.data.success) {
						props.onLogout()
					}
				}}}>
			<Dropdown.Toggle as={CustomToggle} id="account-dropdown">
				{props.account}
			</Dropdown.Toggle>
			<Dropdown.Menu>
				<Dropdown.Item eventKey={'set_pass'} style={{color: 'black'}}>
					更改密碼
				</Dropdown.Item>
				<Dropdown.Item eventKey={'logout'} style={{color: 'black'}}>
					登出
				</Dropdown.Item>
			</Dropdown.Menu>
		</Dropdown>
	)
}

export default AccountDropdown