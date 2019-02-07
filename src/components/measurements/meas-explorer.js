import React, { Component } from 'react';
import { fetchMeasurements, fetchTimeseries } from '../../services/influx-service.js';

class MeasExplorer extends Component {
  state = {
    measurements: []
  }

  componentDidMount() {
    fetchTimeseries({
      measurement: 'environment',
      fields: ['*'],
      tags: [{plant:'orchid'}]
    })
    fetchMeasurements()
      .then((data) => {
      	console.log('state', data);
      	this.setState({'measurements':data});
      });
  }

  render() {
    return (this.listMeasurements());
  }

  listMeasurements() {
  	let meas = this.state.measurements;
  	return <ul className="list-reset" >
  			{meas.map(item => 
  				<li key={item} className="no-underline">{item}</li>)}
  			</ul>;
  }
}

export default MeasExplorer;
