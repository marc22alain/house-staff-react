import React, { Component } from 'react';
import SeriesSelector from '../components/measurements/series-selector.js';
import PlotlyChart from '../components/plotly-chart.js';
import { fetchMeasurements, fetchSeries, fetchTimeseries, fetchSeriesAndKeys } from '../services/influx-service.js';

// TODO: consider how best to abstract this: 
//  http://192.168.2.31:8086/query?db=mydb&q=SHOW SERIES %3B SHOW MEASUREMENTS %3B SHOW FIELD KEYS FROM environment

class Dashboard extends Component {
  constructor(props) {
    super(props);

    this.state = {
      tiles: [{number:55}]
    };

    // TODO: move this to componentDidMount()
    fetchSeriesAndKeys()
      .then((seriesResponse) => {
        this.setState(() => {
          return {series: seriesResponse.values};
        })
      });
  }

  render() {
    let callback = this.instantiateNewDashboardTile.bind(this);
    if (!this.state.series) {
      return <div><SeriesSelector
                values={null}
                callback={callback}
              />
              <PlotlyChart />
             {this.state.tiles.map((tile) => {
                return <h1 key={tile.number.toString()}>{tile.number}</h1>
              })} </div>;
    } else {
      // TODO: add the TileManager
      return <div><SeriesSelector
              values={this.state.series}
              callback={callback}
            />
              <PlotlyChart />
             {this.state.tiles.map((tile) => {
                return <h1 key={tile.number.toString()}>{tile.number}</h1>
              })} </div>;
    }
  }

  instantiateNewDashboardTile(options) {
    // example: "environment,locale=plant,plant=orchid,sensor_id=CDS#001"
    console.log('instantiateNewDashboardTile', options);
    this.setState((state) => {
      console.log('instantiateNewDashboardTile state', state);
      let randomNum = Math.floor(Math.random() * 10);
      console.log('randomNum', randomNum);
      state.tiles.push({ number: randomNum })
      return { tiles: state.tiles }
    });
    // TODO: update state for TileManager, adding a new Tile.
    fetchTimeseries({ seriesQuery: options })
      .then((data) => console.log('Dashboard got',data));
  }
}

export default Dashboard;
