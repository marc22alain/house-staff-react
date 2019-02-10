import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import Dashboard from './controllers/dashboard.js';

class App extends Component {

  render() {
    return (
      <div className="text-center">
        <header className="bg-purple-darker m-6 p-6 rounded shadow-lg">
          <img src={logo} className="App-logo" alt="logo" />
          <p className="text-base text-white">
            Edit <code>src/App.js</code> and save to reload.
          </p>
          <a
            className="App-link"
            href="https://reactjs.org"
            target="_blank"
            rel="noopener noreferrer"
          >
            Learn React
          </a>
        </header>
        <Dashboard />
      </div>
    );
  }
}

export default App;
