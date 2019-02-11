import React, { Component } from 'react';
import { fetchLatestInSeries } from '../services/influx-service.js';

class StatusBadge extends Component {
  state = {}

  componentDidMount() {
    fetchLatestInSeries({ queryOptions: this.props.queryOptions })
      .then((data) => {
        console.log('StatusBadge got data', data);
        this.setState({ jsonData: data });
      });
  }

  render() {
    const { jsonData } = this.state;
    if (!jsonData) {
      return null;
    }
    let field = this.props.queryOptions.fields[0];
    let title = capitalize(field);
    let time = (new Date(jsonData.values[0][0])).toLocaleTimeString();
    return (
      <div className="border rounded inline-block text-center m-4 p-4">
        <h3>{title}</h3>
        <h1>{jsonData.values[0][1]}</h1>
        <p>{time}</p>
      </div>
    )
  }
}


function capitalize(str){
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export default StatusBadge;
