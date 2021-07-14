import React from 'react'
import Navbar from 'react-bootstrap/Navbar'

function CommonFooter(props) {
	return <Navbar bg="dark" variant="dark" fixed="bottom">
		<Navbar.Collapse>
			<Navbar.Text style={{fontSize: '12px', margin: '0 auto'}}>
				National Cheng Kung University Hospital <a href="/#/">成大睡眠中心</a>
				<br />
				cooperates with National Cheng Kung University Department of Computer Science and Information Engineering NCBCI Lab成大資訊工程所<a href="/#/">神經運算與腦機介面實驗室</a>
			</Navbar.Text>
		</Navbar.Collapse>
	</Navbar>
}

export default CommonFooter