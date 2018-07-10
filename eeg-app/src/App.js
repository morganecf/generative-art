import React, { Component } from 'react';
import { MuseClient } from "muse-js";
import './App.css';

const RECORD_TIME = 1000;

class App extends Component {
  constructor() {
    super();
    this.state = {
      connection: 'disconnected',
      recording: null,
    };
  }

  async connect() {
    this.client = new MuseClient();
    this.setState({ connection: 'connecting' });
    await this.client.connect();
    await this.client.start();
    this.setState({ connection: 'connected' });
  }

  record() {
    this.setState({ recording: 'recording' });
    const eeg = this.client.eegReadings.subscribe(reading => {
      console.log(reading);
    });
    // const telemetry = this.client.telemetryData.subscribe(telemetry => {
    //   // console.log(telemetry);
    // });
    // const accelerometer = this.client.accelerometerData.subscribe(acceleration => {
    //   // console.log(acceleration);
    // });

    setTimeout(() => {
      eeg.unsubscribe();
      this.setState({ recording: 'recorded' });
    }, RECORD_TIME);
  }

  getConnectionStatus() {
    let connectionStatus;
    switch (this.state.connection) {
      case 'disconnected':
        connectionStatus = <button className="connect" onClick={this.connect.bind(this)}>Connect</button>;
        break;
      case 'connecting':
        connectionStatus = <span className="connection-status connecting">Connecting...</span>;
        break;
      case 'connected':
        connectionStatus = <span className="connection-status connected">Connected!</span>;
        break;
      default:
        break;
    }
    return connectionStatus;
  }

  getRecordingStatus()  {
    let recordingStatus;
    switch (this.state.recording) {
      case 'recording':
        recordingStatus = <span className="record-status recording">{`Recording for ${RECORD_TIME / 1000}s...`}</span>;
        break;
      case 'recorded':
        recordingStatus = <span className="record-status recorded">Done recording!</span>;
        break;
      default:
        recordingStatus = <button className="record" onClick={this.record.bind(this)}>Record</button>;
        break;
    }
    return recordingStatus;
  }

  render() {
    const connectionStatus = this.getConnectionStatus();
    const recordingStatus = this.state.connection === 'connected' ? this.getRecordingStatus() : null;

    return (
      <div className="App">
        <div>{connectionStatus}</div>
        <div>{recordingStatus}</div>
      </div>
    );
  }
}

export default App;
