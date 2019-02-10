/* global Plotly */
import React, { Component } from 'react';
import { fetchTimeseries } from '../services/influx-service.js';

class PlotlyChart extends Component {

	state = {
		queryOptions: 'environment,locale=plant,plant=orchid,sensor_id=CDS#001'
	}

  // constructor(props) {
  //   super(props);

  // }

  componentDidMount() {
    fetchTimeseries({ seriesQuery: this.state.queryOptions })
      .then((data) => {
      	this.setState({ jsonData: data });
	    	plotGeneric(
	        concatPoints(data),
	        {
	          x: 'time',
	          y:  'light'
	        });
      	console.log('Dashboard got',data);
      });
  }

  render() {
  	// const { jsonData } = this.state;
  	// if (jsonData) {
	  //   return plotGeneric(
	  //       jsonData,
	  //       {
	  //         x: 'time',
	  //         y:  'humidity'
	  //       });  		
  	// }
  	// return null;
  	return <div id="plotly-plot"></div>;
  }
}

function plotGeneric(jsonData, options) {
  let plot = document.querySelector('#plotly-plot');
  plot.setAttribute('class', 'std-plot');
  Plotly.plot(
    plot,
    [{
      x: jsonData[options.x],
      y: jsonData[options.y]
    }],
    {
      margin: { t: 0 }
    }
  )
  console.log('plot is ', plot)
  return plot;
}

function convertTimestampToDatetime(jsonData) {
  jsonData.datetime = [];
  jsonData.timestamp.forEach(function(timestamp) {
    let date = new Date(parseInt(timestamp) * 1000);
    jsonData.datetime.push(date.toLocaleTimeString());
  });
}

function concatPoints(jsonData) {
  let seriesNames = jsonData.columns;
  let values = jsonData.values;

  let series = {};
  seriesNames.forEach((name) => series[name] = []);

  values.forEach((set) => {
    seriesNames.forEach((name, index) => {
      series[name].push(set[index]);
    });
  });

  console.log('from InfluxDB:', series);
  return series;
}

export default PlotlyChart;
