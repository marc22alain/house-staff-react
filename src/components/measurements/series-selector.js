import React, { Component } from 'react';

class SeriesSelector extends Component {
  constructor(props) {
    super(props);

    this.state = {
      series: props.values,
      callback: props.callback
    };
  }

  render() {
    if (!this.state.series) {
      return <div>{'...loading'}</div>;
    } else {
      return <ul className="list-reset" >
        {this.state.series.map(item => 
          <li key={item} onClick={this.callItemCallback.bind(this)} className="no-underline">{item}</li>)}
        </ul> 
    }
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (prevProps.values !== this.props.values) {
        this.setState((state) => {
          return { series: this.props.values }
        });
      }
  }

  callItemCallback(event) {
    this.state.callback(event.target);
  }
}

export default SeriesSelector;
