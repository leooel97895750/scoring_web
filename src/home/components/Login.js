import React, { Component } from 'react'
import axios from 'axios'
import Card from 'react-bootstrap/Card'
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'
import Alert from 'react-bootstrap/Alert'

class Login extends Component {
	constructor(props) {
		super(props)
		this.handleSubmit = this.handleSubmit.bind(this)
		this.state = {
			waitingForResponse: false,
			errorMessage: null
		}
	}
	render() {
		return (
			<div style={{
				position: 'absolute',
				top: '50%',
				left: '50%',
				transform: 'translateX(-50%) translateY(-50%)'}}>
				<Card style={{width: '30rem'}}>
					<Card.Header as="h5">登入</Card.Header>
					<Card.Body>
						<Form onSubmit={this.handleSubmit}>
							<Form.Group controlId="formAccount">
								<Form.Label>帳號</Form.Label>
								<Form.Control />
							</Form.Group>
							<Form.Group controlId="formPassword">
								<Form.Label>密碼</Form.Label>
								<Form.Control type="password" />
							</Form.Group>
							{
								this.state.waitingForResponse || !this.state.errorMessage ?
									null :
									<Alert variant="danger">{this.state.errorMessage}</Alert>
							}
							<Button variant="primary" type="submit" disabled={this.state.waitingForResponse}>
								{this.state.waitingForResponse ? '登入中' : '登入'}
							</Button>
						</Form>
						
					</Card.Body>
				</Card>
			</div>
		)
	}
	async handleSubmit(event) {
		event.preventDefault()
		this.setState({
			waitingForResponse: true
		})
		let loginResult = await axios.post('/ajax_login', {
			account: event.target.elements.formAccount.value,
			password: event.target.elements.formPassword.value
		})
		this.setState({
			waitingForResponse: false
		})
		if (loginResult.data.success) {
			this.setState({
				errorMessage: null
			})
			this.props.onLogin()
		} else {
			this.setState({
				errorMessage: loginResult.data.msg
			})
		}
	}
}

export default Login