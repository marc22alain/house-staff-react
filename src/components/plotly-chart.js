import React, { Component } from 'react';
import Plot from 'react-plotly.js';
import { fetchTimeseries } from '../services/influx-service.js';


/*
  What features should it offer?
  The ability to delete itself.
  The ability to update its data.
  The ability to modify its query, such as:
  - how much history to pull
  - specify field values
  The ability to overlay a series ?
    . like an event series
    . have been thinking of the dashboard's ability to persist its constituents
      but not sure how this would work ...
*/
class PlotlyChart extends Component {

  state = {}

  componentDidMount() {
    fetchTimeseries({ queryOptions: this.props.queryOptions })
      .then((data) => {
        this.setState({ jsonData: concatPoints(data) });
      });
  }

  render() {
    const { jsonData } = this.state;
    if (!jsonData) {
      return null;
    }
    let field = this.props.queryOptions.fields[0];
    let title = capitalize(field);
    return (
      <Plot
        data={[
          {
            x: jsonData['time'],
            y: jsonData[field]
          },
        ]}
        layout={ {width: 480, height: 320, title: title} }
      />
    );
  }
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

  if (seriesNames && values) {
    seriesNames.forEach((name) => series[name] = []);

    values.forEach((set) => {
      seriesNames.forEach((name, index) => {
        series[name].push(set[index]);
      });
    });
  }

  return series;
}

function capitalize(str){
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export default PlotlyChart;
