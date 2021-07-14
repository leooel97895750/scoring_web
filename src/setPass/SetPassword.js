import React, { Component } from 'react'
import axios from 'axios'
import Card from 'react-bootstrap/Card'
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'
import Alert from 'react-bootstrap/Alert'
import CommonNavbar from '../commonComponents/CommonNavbar'
import CommonFooter from '../commonComponents/CommonFooter'

class SetPassword extends Component {
	constructor(props) {
		super(props)
		this.handleSubmit = this.handleSubmit.bind(this)
		this.state = {
			account: null,
			errorMessage: null,
			waitingForResult: false
		}
	}
	render() {
		return (
			<>
				<CommonNavbar account={this.state.account} onLogout={() => {
					window.location.href="/#/"
				}} />
				{this.state.account !== null ? <div style={{
					position: 'absolute',
					top: '50%',
					left: '50%',
					transform: 'translateX(-50%) translateY(-50%)'}}>
					<Card style={{width: '30rem'}}>
						<Card.Header as="h5">更改密碼</Card.Header>
						<Card.Body>
							<Form onSubmit={this.handleSubmit}>
								<Form.Group controlId="originalPass">
									<Form.Label>原來的密碼</Form.Label>
									<Form.Control type="password" />
								</Form.Group>
								<Form.Group controlId="newPass">
									<Form.Label>新密碼</Form.Label>
									<Form.Control type="password" />
								</Form.Group>
								<Form.Group controlId="newPass2">
									<Form.Label>密碼確認</Form.Label>
									<Form.Control type="password" />
								</Form.Group>
								{
									this.state.errorMessage ?
										<Alert variant="danger">{this.state.errorMessage}</Alert> : null
								}
								<Button variant="primary" type="submit" disabled={this.state.waitingForResponse}>
									更改
								</Button>
							</Form>
						</Card.Body>
					</Card>
				</div> : null}
				<CommonFooter />
			</>
		)
	}
	async componentDidMount() {
		let whoAmIResult = await axios.post('/ajax_who_am_i', {})
		if (whoAmIResult.data.account === undefined) {
			window.location.href = "#"
			return
		}
		this.setState({
			account: whoAmIResult.data.account
		})
	}
	async handleSubmit(event) {
		event.preventDefault()
		this.setState({
			waitingForResponse: true,
			errorMessage: null
		})
		let setPassResult = await axios.post('/ajax_reset_pass', {
			oldPass: event.target.elements.originalPass.value,
			newPass: event.target.elements.newPass.value,
			newPass2: event.target.elements.newPass2.value
		})
		this.setState({
			waitingForResponse: false
		})
		if (setPassResult.data.success) {
			window.location.href = '/#/'
		} else {
			console.log(setPassResult.data.msg)
			this.setState({
				errorMessage: setPassResult.data.msg
			})
		}
	}
}

export default SetPassword