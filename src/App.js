import React, { Component } from 'react';
import './App.css';
import UserManager from './UserManager';

// Main React App entrypoint. Uses the main top-level element UserManager which
// is responsible for retrieving and displaying user data
class App extends Component {
  render() {
    return (
      <div className="App">
       <UserManager/>
      </div>
    );
  }
}

export default App;
