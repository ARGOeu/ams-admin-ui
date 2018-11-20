import React, { Component } from 'react';
import './App.css';
import UserManager from './UserManager';
import { BrowserRouter, Route, Switch, Link } from "react-router-dom";
import About from './About'

// Main React App entrypoint. Uses the main top-level element UserManager which
// is responsible for retrieving and displaying user data
class App extends Component {
  render() {

    // Create a navigation bar with links to different routes
    // Create a BrowserRouter Wrapper above App
    // Use Switch with two Routers to render two views: UserManager and About
    return (<BrowserRouter>
     
      <div className="App">
      <nav>
        <Link to="/">Home</Link>
        <Link to="/about">About</Link>
      </nav>
        <main>
        <Switch>
          <Route  exact path='/' component={UserManager} />
          <Route  exact path='/about' component={About} />
        </Switch>
        </main>
      </div>
      
    </BrowserRouter>
    );
  }
}

export default App;
