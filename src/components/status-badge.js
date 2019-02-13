import React, { Component } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSync } from '@fortawesome/free-solid-svg-icons'
import { fetchLatestInSeries } from '../services/influx-service.js';

class StatusBadge extends Component {
  state = {}

  componentDidMount() {
    this.load();
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
      <div className="border rounded inline-block m-4 p-4">
        <div className="text-center inline-block align-top">
          <h3>{title}</h3>
          <h1>{jsonData.values[0][1]}</h1>
          <p>{time}</p>
        </div>
        <FontAwesomeIcon 
          icon={faSync} 
          className="text-blue align-top m-1" 
          onClick={this.load.bind(this)}
        />
      </div>
    )
  }

  load() {
    fetchLatestInSeries({ queryOptions: this.props.queryOptions })
      .then((data) => {
        this.setState({ jsonData: data });
      });
  }
}


function capitalize(str){
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export default StatusBadge;
