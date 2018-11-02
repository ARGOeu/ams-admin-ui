import React from 'react'
import config from './config'
import argologo from './argologo.svg'

// UserManager implements the top level component that will handle retrieval and dipslay of user data
class UserManager extends React.Component {

    // UserManager renders the main ui header along with a token input box and a placeholder for a future user list
    render() {
        return <div>
        <header className="App-header">
        <h1 className="App-title"><img src={argologo} className="App-logo" alt="logo" />Admin UI: <span>AMS Users</span></h1>
        <div className="service-info">
        <span className="label">endpoint: </span><span className="value">{config.endpoint}</span>
        <span className="label">access-token: </span> <input className="round" id="token"/>
        </div>
        </header>
        <p>User list placeholder</p>
        </div>
    }
}

export default UserManager;