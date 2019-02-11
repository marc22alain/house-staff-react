import React, { Component } from 'react';

class SeriesSelector extends Component {
  state = {}

  // TODO: delete when you no longer need to inspect `props`.
  constructor(props) {
    super(props);
    console.log('SeriesSelector props', props);
  }

  render() {
    if (!this.props.catalog) {
      return null;
    } else {
      return (
        <div className="border m-6 p-4 rounded">
          {this.addMeasurementOptions()}
          {this.addSeriesOptions()}
          {this.addFieldOptions()}
          {this.addTimeSpanOptions()}
          {this.addPlusButton()}
        </div>
      );
    }
  }

  addMeasurementOptions() {
    return (
      <select id="measurement" onChange={this.selectCallback.bind(this)}>
        <option value="">Select a table</option>
        {Object.keys(this.props.catalog).map(item => 
          <option key={item} value={item}>{item}</option>
        )}
      </select>
    )
  }

  addSeriesOptions() {
    if (this.state.selectedMeasurement) {
      let seriesOptions = this.props.catalog[this.state.selectedMeasurement].series;
      return (
        <select id="series" onChange={this.selectCallback.bind(this)}>
          <option value="">Select a series</option>
          {seriesOptions.map((series, seriesIndex) => {
            let description = series.tags.map((tag) => `${tag.key}=${tag.value}`).join();
            return <option key={description} value={seriesIndex.toString()}>{description}</option>
            })
          }
        </select>
      );
    } else {
      return null;
    }
  }

  addFieldOptions() {
    if (this.state.selectedSeries) {
      let fieldOptions = this.props.catalog[this.state.selectedMeasurement].keys;
      return (
        <select id="fields" onChange={this.selectCallback.bind(this)}>
          <option value="">Select a field</option>
          {fieldOptions.map((field) => {
            let fieldName = field.name;
            return <option key={fieldName} value={fieldName}>{fieldName}</option>
            })
          }
        </select>
      );
    } else {
      return null;
    }
  }

  addTimeSpanOptions() {
    if (this.state.selectedSeries) {
      let spanOptions = ['all','now'];
      return (
        <select id="timespan" onChange={this.selectCallback.bind(this)}>
          <option value="">Select a timespan</option>
          {spanOptions.map((opt) => {
            return <option key={opt} value={opt}>{opt}</option>
            })
          }
        </select>
      );
    } else {
      return null;
    }
  }

  addPlusButton() {
    if (this.state.selectedField) {
      return (
        <button onClick={this.callItemCallback.bind(this)}>Add plot</button>
      );
    } else {
      return null;
    }
  }

  callItemCallback(event) {
    this.props.callback({
      queryOptions: {
        measurement: this.state.selectedMeasurement,
        tags: this.state.selectedSeries.tags,
        fields: [this.state.selectedField],
        timespan: this.state.selectedTimespan
      }
    });
  }

  selectCallback(event) {
    let selected = event.target.value;
    switch (event.target.id) {
      case 'measurement':
        this.setState({ selectedMeasurement: selected });
        this.setState({ selectedSeries: null });
        this.setState({ selectedFields: null });
        break;
      case 'series':
        let selectedSeries = this.props.catalog[this.state.selectedMeasurement].series[parseInt(selected)];
        this.setState({ selectedSeries: selectedSeries });
        break;
      case 'fields':
        this.setState({ selectedField: selected });
        break;
      case 'timespan':
        this.setState({ selectedTimespan: selected });
        break;
      default:
        throw new TypeError('Oops, select action undefined!');
    }
  }
}

export default SeriesSelector;
