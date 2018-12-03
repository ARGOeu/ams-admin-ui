import React from 'react'
import config from './config'
import argologo from './argologo.svg'
import argologoAnim from './argologo_anim.svg'
import UserList from './UserList'

// UserManager implements the top level component that will handle retrieval and dipslay of user data
class UserManager extends React.Component {

    // construct component with state of empty user list, empty token and endpoint as defined in config
    constructor(props) {
        super(props);

        // if token cached in localstorage retrieve it
        let cachedToken = "";
        cachedToken = localStorage.getItem("ams_token");


        this.state = {
            users: [],
            token: cachedToken,
            username: null,
            endpoint: config.endpoint
        };

        this.apiGetUser(cachedToken, config.endpoint)
        this.apiGetData(cachedToken, config.endpoint)

       

    }

    // handle when user enters a new token and hits enter
    handleTokenChange(event) {
        var keyCode = event.keyCode || event.which;

        if (keyCode === 13) {
            this.apiGetUser(event.target.value, this.state.endpoint);
            this.apiGetData(event.target.value, this.state.endpoint);
            if (this.state.username !== null){
                localStorage.setItem("ams_token", event.target.value);
            }
            
        }
    }

    doLogout(){
        // remove all cached tokens user empty list
        console.log("logged out...");
        localStorage.removeItem("ams_token");
        this.setState({users:[],username:null,token:""})
        
    }

    doLogin(){
        let token = document.querySelector("#token").value;
        this.apiGetUser(token, this.state.endpoint);
        this.apiGetData(token, this.state.endpoint);
        console.log("logging in...");
    }

    // retrieves token's holder data
    apiGetUser(token, endpoint) {

        // If token or endpoint empty return
        if ((token === "" || token === null) || endpoint === "") {
            return;
        }
        // quickly construct request url
        let url = "https://" + endpoint + "/v1/users:byToken/" + token + "?key=" + token;
        // setup the required headers
        let headers = {
            "Content-Type": "application/json",
            "Accept": "application/json",
        }
        // fetch the data and if succesfull change the component state - which will trigger a re-render
        fetch(url, { headers: headers })
            .then(response => {
                if (response.status === 200) {
                    return response.json()
                } else {
                    return { name: null, token: null }
                }
            })
            .then(json => {
                localStorage.setItem("ams_token", token);
                this.setState({ username: json.name, token: token })
            })
            .catch(error => console.log(error));

    }

    // retrieves user data from ams endpoint using a specific access token
    apiGetData(token, endpoint) {
        // If token or endpoint empty return
        if ((token === "" || token === null) || endpoint === "") {
            return;
        }
        // quickly construct request url
        let url = "https://" + endpoint + "/v1/users?key=" + token;
        // setup the required headers
        let headers = {
            "Content-Type": "application/json",
            "Accept": "application/json",
        }
        // fetch the data and if succesfull change the component state - which will trigger a re-render
        fetch(url, { headers: headers })
            .then(response => {
                if (response.status === 200) {
                    return response.json()
                } else {
                    return { users: [] }
                }
            })
            .then(json => this.setState({ users: json.users, token: token }))
            .catch(error => console.log(error));
    }

    // UserManager renders the main ui header along with a token input box and a placeholder for a future user list
    render() {
        // initialize logo var
        let logo = null;
        // if loading use the subtle animating logo else use the static one
        if (this.state.users.length === 0 && this.state.username != null) {
            logo = argologoAnim
        } else {
            logo = argologo
        }

        console.log(this.state);
        // empty user placeholder
        let userData = [{
            'name': 'ams_user_001',
            'projects': [{ 'project': 'TESTPROJECT', 'roles': ['project_admin'] }],
            'created_on': '2018-10-30T15:33:45Z',
            'email': 'example@foo'
        },
        {
            'name': 'ams_user_002',
            'projects': [{ 'project': 'TESTPROJECT', 'roles': ['consumer'] }, { 'project': 'TEST2', 'roles': ['project_admin'] }],
            'created_on': '2018-10-30T16:33:45Z',
            'email': 'example02@foo'
        },
        {
            'name': 'ams_user_002',
            'projects': [{ 'project': 'TESTPROJECT', 'roles': ['publishier'] }],
            'created_on': '2018-10-30T16:33:45Z',
            'email': 'example03@foo'
        }
        ];
        // if retrieved user data from ams user the first user
        if (this.state.users.length > 0) {
            userData = this.state.users;
        }

        return <div>

            <header className="App-header">
                <h1 className="App-title"><img src={logo} className="App-logo" alt="logo" />Admin UI: <span>AMS Users</span></h1>
                <div className="service-info">
                    <span className="label">endpoint: </span><span className="value">{config.endpoint}</span>
                    {this.state.username != null &&
                        <>
                            <span className="label">user:</span> <span className="value">{this.state.username}</span>
                            <button id="logout" onClick={evt => this.doLogout()}>Logout</button>
                        </>
                    }
                    {this.state.username === null &&
                        <>
                            <span className="label">access-token: </span> <input type="text" defaultValue={this.state.token} className="round" id="token" onKeyPress={evt => this.handleTokenChange(evt)} />
                            <button id="login" onClick={evt => this.doLogin()}>Login</button>
                        </>
                    }
                </div>
            </header>
            {this.state.users.length > 0 && this.state.username != null &&
            <UserList item={userData} />
            }
            {this.state.users.length === 0 && this.state.username != null &&
            <p>Loading data... please wait...</p>
            }
            {this.state.users.length === 0 && this.state.username === null &&
            <p>Empty data, please <strong>login</strong> to retrieve user list</p>
            }

        </div>
    }
}

export default UserManager;