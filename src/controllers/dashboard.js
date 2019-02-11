import React, { Component } from 'react';
import SeriesSelector from '../components/measurements/series-selector.js';
import PlotlyChart from '../components/plotly-chart.js';
import StatusBadge from '../components/status-badge.js';
import { fetchDBcatalog } from '../services/influx-service.js';


class Dashboard extends Component {
  constructor(props) {
    super(props);

    // Trim when the series-selector is fully wired in.
    this.state = {
      tiles: [{
        queryOptions: {
          measurement: 'environment',
          tags: [{
              key: 'locale',
              value: 'plant'
            },{
              key: 'plant',
              value: 'orchid'
            },{
              key: 'sensor_id',
              value: 'CDS#001'
            }
          ],
          fields: ['light'],
          timeRange: {
            start: '3-weeks-ago',
            end: 'now'
          }
        }
      }],
      badges: []
    };
  }

  componentDidMount() {
    fetchDBcatalog()
      .then((catalog) => {
        this.setState({ dbCatalog: catalog });
      });
  }

  render() {
    let callback = this.instantiateNewDashboardTile.bind(this);
    if (!this.state.dbCatalog) {
      return null;
    } else {
      // TODO: add the TileManager
      return <div>
              <SeriesSelector
                catalog={this.state.dbCatalog}
                callback={callback}
              />
              <div>
                {this.state.badges.map((tile, index) => {
                  return  <StatusBadge 
                            key={index.toString()}
                            queryOptions={tile.queryOptions}
                          />
                })}
              </div>
              <div>
                {this.state.tiles.map((tile, index) => {
                  return  <PlotlyChart 
                            key={index.toString()}
                            queryOptions={tile.queryOptions}
                          />
                })}
              </div>
            </div>;
    }
  }

  instantiateNewDashboardTile(options) {
    console.log('instantiateNewDashboardTile', options);
    if (options.queryOptions.timespan !== 'now') {
      this.setState((state) => {
        state.tiles.push(options)
        return { tiles: state.tiles }
      });      
    } else {
      this.setState((state) => {
        state.badges.push(options)
        return { badges: state.badges }
      });      
    }
  }
}

export default Dashboard;
