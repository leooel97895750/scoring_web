import React, { Component } from 'react'
import axios from 'axios'
/*
import Navbar from 'react-bootstrap/Navbar'
import Container from 'react-bootstrap/Container'
import NavbarBrand from 'react-bootstrap/NavbarBrand'
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'
*/
import Login from './components/Login'
import List from './components/List'
import CommonNavbar from '../commonComponents/CommonNavbar'
import CommonFooter from '../commonComponents/CommonFooter'

class Home extends Component {
	constructor(props) {
		super(props)
		this.checkAccountAndSetState = this.checkAccountAndSetState.bind(this)
		this.state = {
			display: false,
			account: null
		}
	}
	render() {
		return <>
			<CommonNavbar account={this.state.account} onLogout={() => {
				this.setState({
					account: null
				})
			}} />
			{this.state.display ? <>
				<div style={{height: '70px'}} />
				{this.state.account !== null ? <List /> : <Login onLogin={() => { this.checkAccountAndSetState() }} />}  
				<div style={{height: '60px'}} />
			</> : null}
			
			<CommonFooter />
		</>
	}
	async componentDidMount() {
		this.checkAccountAndSetState()
	}
	async checkAccountAndSetState() {
		let result = await axios.post('/ajax_who_am_i', {})
		if (result.data.account !== undefined) {
			this.setState({
				account: result.data.account
			})
		}
		this.setState({
			display: true
		})
	}
}

export default Home