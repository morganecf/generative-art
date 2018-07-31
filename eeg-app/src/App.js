import React, { Component } from 'react';
import { MuseClient } from 'muse-js';
import Modal from 'react-modal';
import './App.css';
import InfoText from './InfoText';
import Timeseries from './Timeseries';
import PhaseShift from './PhaseShift';
import Radial from './Radial';
import Accelerometer from './Accelerometer';
import { sampleData } from './sample_data';


/*
  TODO
  - dim background when modal is showing
  - use real EEG data, not sample
  - finish accelerometer visualization
  - animation for scribbles / graph ?
  - real time stuff
*/

// Angular muse demo: https://github.com/NeuroJS/angular-muse
// Available data: http://developer.choosemuse.com/tools/available-data#MuseIO_Available_Data
// TODO read: https://medium.com/neurotechx/a-techys-introduction-to-neuroscience-3f492df4d3bf
// TODO read: https://en.wikipedia.org/wiki/Theta_wave

const RECORD_TIME = 40000;
const BISEXUAL = [
  "#0a0ad6",
  "#d60acf",
  "#d60a0a"
];

Modal.setAppElement('#root');

class App extends Component {
  constructor() {
    super();
    this.options = {
      quicksilver: 'Quicksilver Eye',
      radial: 'Radial Scribbles',
      bisexual: 'Bisexual Squares',
      static: 'Static Song',
      graph: 'To Hell With It, I Just Want A Graph',
    };
    this.visualizations = {
      quicksilver: new PhaseShift({
        opacity: 0.03,
        slowFactor: 1500,
        numSamples: 130,
        background: '#d1d1d1',
        color: () => '#111',
        angle: (d, i) => i * Math.PI * 2,
      }),
      radial: new Radial({
        color: '#fff',
        background: '#222',
        electrodes: [0, 1, 2],
      }),
      bisexual: new PhaseShift({
        opacity: 0.02,
        slowFactor: 1500,
        numSamples: 120,
        background: '#1c1b1b',
        color: d => BISEXUAL[d.electrode],
        angle: (d, i) => d.reading * Math.PI * 2,
      }),
      static: new Accelerometer(),
      graph: new Timeseries({
        height: 200,
        width: 950,
      }),
    };
    this.state = {
      connection: 'disconnected',
      recording: null,
      isModalOpen: false,
      timer: 0,
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

    const data = {
      eeg: [],
      telemetry: [],
      accelerometer: [],
    };

    const eeg = this.client.eegReadings.subscribe(reading => {
      /*
        Measures electric potentials (voltages) across different areas of scalp.
        The higher the sample value, the more there's a change in potential.
        Voltage is the potential difference between two points. So this reading
        already gives you the potentials. 
        {
          electrode,  // numeric index of electrode
          samples,    // 12 measurements in units of microvolts (mV)
          timestamp,  // timestamp of when the sample was taken
        }
      */
      data.eeg.push(reading);
    });
    const accelerometer = this.client.accelerometerData.subscribe(reading => {
      /*
        Measures the x,y,z coordinates of head position
      */
      data.accelerometer.push(reading);
    });

    const timer = setInterval(() => {
      this.setState({ timer: this.state.timer + 1 });
    }, 1000);

    setTimeout(() => {
      eeg.unsubscribe();
      accelerometer.unsubscribe();
      window.clearInterval(timer);
      this.setState({
        data,
        recording: 'recorded',
      });
      console.log('DATA:', data);
    }, RECORD_TIME);
  }

  onOpenModal() {
    if (this.vis) {
      this.vis.unmount();
    }
    this.vis = this.visualizations[this.state.option];
    this.vis.mount();
    this.vis.draw(this.state.data.eeg);
  }

  onShowInfo(option) {
    this.setState({ infoText: InfoText[option] });
  }

  onHideInfo() {
    this.setState({ infoText: null });
  }

  openModal(option) {
    this.setState({ option, isModalOpen: true });
  }

  closeModal() {
    this.setState({ isModalOpen: false });
  }

  getOptions() {
    return Object.keys(this.options).map(option =>
      <span>
        <button
          className="option"
          key={option}
          onClick={this.openModal.bind(this, [option])}
          onMouseEnter={this.onShowInfo.bind(this, [option])}
          onMouseLeave={this.onHideInfo.bind(this)}
          disabled={this.state.recording === 'recording'}>
          {this.options[option]}
        </button>
      </span>
    );
  }

  getConnectionStatus() {
    switch (this.state.connection) {
      case 'disconnected':
        return <button className="connect" onClick={this.connect.bind(this)}>Connect</button>;
      case 'connecting':
        return (
          <span className="connection-status connecting">
            <span className="loader"></span>
            <span>Connecting...</span>
          </span>
        );
      case 'connected':
        return <span className="connection-status connected">Connected!</span>;
      default:
        return null;
    }
  }

  getRecordingStatus()  {
    switch (this.state.recording) {
      case 'recording':
        return (
          <span className="record-status recording">
            <span className="loader"></span>
            <span>{`Recording for ${RECORD_TIME / 1000 - this.state.timer}s...`}</span>;
          </span>
        );
      case 'recorded':
        return <span className="record-status recorded">Done recording!</span>;
      default:
        return <button className="record" onClick={this.record.bind(this)}>Record</button>;
    }
  }

  getFirstStep() {
    return (
      <div className="first-step">
        <h2>1. Put on the EEG and connect</h2>
          <div>{this.getConnectionStatus()}</div>
      </div>
    );
  }

  getSecondStep() {
    if (this.state.connection === 'connected') {
      return (
        <div className="first-step">
          <h2>2. Record yourself</h2>
          <div>{this.getRecordingStatus()}</div>
        </div>
      );
    }
  }

  getThirdStep() {
    if (this.state.recording === 'recorded') {
      return (
        <div className="second-step">
          <h2>3. Stylize your brainwaves</h2>
          <div className="options">{this.getOptions()}</div>
          <div className="info">{this.state.infoText}</div>
        </div>
      );
    }
  }

  render() {
    return (
      <div className="App">
        <h1>Electroencephaloart Demo</h1>
        {this.getFirstStep()}
        {this.getSecondStep()}
        {this.getThirdStep()}
        <Modal
          isOpen={this.state.isModalOpen}
          onAfterOpen={this.onOpenModal.bind(this)}
          onRequestClose={this.closeModal.bind(this)}>
          <div id="chart"></div>
        </Modal>
      </div>
    );
  }
}

export default App;
