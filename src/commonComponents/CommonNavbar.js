import React from 'react'
import Navbar from 'react-bootstrap/Navbar'
import AccountDropdown from './AccountDropdown'

function CommonNavbar(props) {
	return <Navbar bg="dark" variant="dark" fixed="top">
		<div style={{ width: '150px' }} />
		<Navbar.Brand href="/#/">Scoring Web</Navbar.Brand>
		{props.account !== null ? <Navbar.Collapse className="justify-content-end">
			<Navbar.Collapse className="justify-content-end">
				<Navbar.Text>
					<AccountDropdown account={props.account} onLogout={props.onLogout} />
				</Navbar.Text>
				<div style={{ width: '150px' }} />
			</Navbar.Collapse>
		</Navbar.Collapse> : null}
	</Navbar>
}

export default CommonNavbar