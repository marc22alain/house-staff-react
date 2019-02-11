import React, { Component } from 'react';
import './App.css';
import Dashboard from './controllers/dashboard.js';

class App extends Component {

  render() {
    return (
      <div className="text-center">
        <header className="bg-purple-darker m-6 p-4 rounded shadow-lg">
          <h2 className="text-white">At Your Service</h2>
        </header>
        <Dashboard />
      </div>
    );
  }
}

export default App;
