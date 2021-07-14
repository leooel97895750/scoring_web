import React, { Component } from 'react'
import { HashRouter, Route, Switch } from 'react-router-dom'
import Home from './home/Home'
import HiddenHome from './home/HiddenHome'
import Scoring from './scoring/Scoring'
import SetPassword from './setPass/SetPassword'
import 'bootstrap/dist/css/bootstrap.min.css'

class App extends Component {
	render() {
		return (
			<HashRouter>
				<Switch>
					<Route exact path="/" component={Home} />
					<Route exact path="/hidden" component={HiddenHome} />
					<Route exact path="/scoring/:id/:which" component={Scoring} />
					<Route exact path="/setpass" component={SetPassword} />
				</Switch>
			</HashRouter>
		)
	}
	componentDidMount() {
		document.title = 'Scoring Web'
	}
}
export default App
//import logo from './logo.svg';
//import './App.css';
/*
import Hypnogram from './components/Hypnogram'
import MultichannelChart from './components/MultichannelChart'
import SignalPanel from './components/SignalPanel'
import SplitPane from 'react-split-pane'
import './edit.css'
import 'bootstrap/dist/css/bootstrap.min.css'
import EventInfoWindow from './components/EventInfoWindow'
import EventsDataStructure from './EventsDataStructure'
//import { HashRouter } from 'react-router-dom'

class App extends Component {
	constructor(props) {
		super(props)
		this.state = {
			scales: {}, // 各個channel縮放指數
			currentEpoch: 0,
			upperTimeInterval: '30 sec',
			lowerTimeInterval: '30 sec'
		}
		
		this.jumpTo = this.jumpTo.bind(this)
		this.addEvent = this.addEvent.bind(this)
		this.deleteEvent = this.deleteEvent.bind(this)
		this.moveCursor = this.moveCursor.bind(this)
		this.zoomChannel = this.zoomChannel.bind(this)
		this.setEventType = this.setEventType.bind(this)
		this.getEventInfo = this.getEventInfo.bind(this)
		this.upperSelectItem = this.upperSelectItem.bind(this)
		this.lowerSelectItem = this.lowerSelectItem.bind(this)
	}
	render() {
		let a = new Array(800)//[-10, 1, 1, -10, 3, 3, 0, 0, -10, 1, 1, 2, 3, 3, -10, -10]
		a.fill(0)
		return (
			<>
				<Hypnogram
						leftSpace={20}
						rightSpace={10}
						topSpace={5}
						bottomSpace={5}
						stages={a}
						currentEpoch={this.state.currentEpoch}
						jumpTo={this.jumpTo}
				/>
				<SignalPanel
					interactable={true}
					addEvent={this.addEvent}
					deleteEvent={this.deleteEvent}
					setEventType={this.setEventType}
					moveCursor={this.moveCursor}
					zoomChannel={this.zoomChannel}
					// TODO: getChannelEvents
					getChannelEvents={() => {
						return ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j']
					}}
					getEventInfo={this.getEventInfo}
					upperSelectItem={this.upperSelectItem}
					upperItems={['10 sec', '30 sec']}
					upperSelectedItem={'30 sec'}
					lowerSelectItem={this.lowerSelectItem}
					lowerItems={['30 sec', '1 min', '2 min']}
					lowerSelectedItem={'30 sec'}
				/>
			</>
		)
	}
	jumpTo(epoch) {
		this.setState({
			currentEpoch: epoch
		})
	}
	addEvent(channelId, secondFrom, secondTo, type, priority) {
		console.log('add event', channelId, secondFrom, secondTo, type, priority)
	}
	deleteEvent(eventId) {
		console.log('delete event', eventId)
	}
	moveCursor(second) {
		console.log('move cursor', second)
	}
	zoomChannel(channelId, up) {
		console.log('zoom channel', channelId, up)
	}
	upperSelectItem(item) {
		console.log('upper select item', item)
	}
	lowerSelectItem(item) {
		console.log('lower select item', item)
	}
	setEventType(eventId, type) {
		console.log('set event type', eventId, type)
	}
	getEventInfo(eventId) {
		return {
			secondFrom: 1550.156,
			secondTo: 1560.64,
			channelId: 1,
			type: 'd'
		}
	}
}

export default App;
*/
/*
import React from 'react';
import styled from '@emotion/styled';
import { HashRouter, Route, Redirect } from 'react-router-dom';


import Sidebar from './components/Sidebar';

// basic examples
import BasicHorizontal from './examples/basic/BasicHorizontal';
import BasicNested from './examples/basic/BasicNested';
import BasicStep from './examples/basic/BasicStep';
import BasicVertical from './examples/basic/BasicVertical';
import PercentageHorizontal from './examples/basic/PercentageHorizontal';
import PercentageVertical from './examples/basic/PercentageVertical';
import SnapToPostion from './examples/basic/SnapToPosition';

// advanced examples
import InlineStyles from './examples/advanced/InlineStyles';
import MultipleHorizontal from './examples/advanced/MultipleHorizontal';
import MultipleVertical from './examples/advanced/MultipleVertical';
import NestedHorizontal from './examples/advanced/NestedHorizontal';
import NestedVertical from './examples/advanced/NestedVertical';
import Subcomponent from './examples/advanced/Subcomponent';

import './edit.css'


export default function App() {
  return (
    <HashRouter>
      <Wrapper>
        <Sidebar />
        <Container>
          <React.StrictMode>
            <Route
              exact
              path="/"
              render={() => <Redirect to="/basic-horizontal" />}
            />
            <Route exact path="/basic-horizontal" component={BasicHorizontal} />
            <Route exact path="/basic-vertical" component={BasicVertical} />
            <Route exact path="/basic-step" component={BasicStep} />
            <Route exact path="/basic-nested" component={BasicNested} />
            <Route
              exact
              path="/percentage-vertical"
              component={PercentageVertical}
            />
            <Route
              exact
              path="/percentage-horizontal"
              component={PercentageHorizontal}
            />
            <Route exact path="/snap-position" component={SnapToPostion} />
            <Route exact path="/inline-styles" component={InlineStyles} />
            <Route
              exact
              path="/multiple-vertical"
              component={MultipleVertical}
            />
            <Route
              exact
              path="/multiple-horizontal"
              component={MultipleHorizontal}
            />
            <Route exact path="/nested-vertical" component={NestedVertical} />
            <Route
              exact
              path="/nested-horizontal"
              component={NestedHorizontal}
            />
            <Route exact path="/subcomponent" component={Subcomponent} />
          </React.StrictMode>
        </Container>
      </Wrapper>
    </HashRouter>
  );
}
*/