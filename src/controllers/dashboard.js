import React, { Component } from 'react';
import SeriesSelector from '../components/measurements/series-selector.js';
import { fetchMeasurements, fetchSeries } from '../services/influx-service.js';

// TODO: consider how best to abstract this: 
//  http://192.168.2.31:8086/query?db=mydb&q=SHOW SERIES %3B SHOW MEASUREMENTS

class Dashboard extends Component {
  constructor(props) {
    super(props);

    this.state = {};

    fetchSeries()
      .then((seriesResponse) => {
        this.setState(() => {
          return {series: seriesResponse.values};
        })
      });
  }

  render() {
    if (!this.state.series) {
      return <SeriesSelector
              values={null}
              callback={this.instantiateNewDashboardTile}
            />;
    } else {
      // TODO: add the TileManager
      return <SeriesSelector
              values={this.state.series}
            />;
    }
  }

  instantiateNewDashboardTile(options) {
    console.log('instantiateNewDashboardTile', options);
    // TODO: update state for TileManager, adding a new Tile.
  }
}

export default Dashboard;
