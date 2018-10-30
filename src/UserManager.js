import React from 'react'
import config from './config'
import argologo from './argologo.svg'
import UserList from './UserList'

// UserManager implements the top level component that will handle retrieval and dipslay of user data
class UserManager extends React.Component {

    // construct component with state of empty user list, empty token and endpoint as defined in config
    constructor(props) {
        super(props);
        this.state = { users: [],
                       token: "",
                       endpoint: config.endpoint};
       
    }

    // handle when user enters a new token and hits enter
    handleTokenChange(event) {
        var keyCode = event.keyCode || event.which;
        if (keyCode === 13){
            this.apiGetData(event.target.value);
        }   
    }

    // retrieves user data from ams endpoint using a specific access token
    apiGetData(token){
        // If token or endpoint empty return
        if (token === "" || this.state.endpoint === "") {
            return;
        }
        // quickly construct request url
        let url = "https://" + this.state.endpoint + "/v1/users?key=" + token; 
        // setup the required headers
        let headers = {
            "Content-Type": "application/json",
            "Accept": "application/json",
        }
        // fetch the data and if succesfull change the component state - which will trigger a re-render
        fetch(url,{headers:headers})
          .then(response=>{
                if (response.status === 200){
                    return response.json()
                } else {
                    return {users:[]}
                }
            })
          .then(json => this.setState({users: json.users, token: token}))
          .catch(error => console.log(error));
    }

    // UserManager renders the main ui header along with a token input box and a placeholder for a future user list
    render() {

        // empty user placeholder
        let userData = [{'name':'ams_user_001', 
                        'projects':[{'project':'TESTPROJECT','roles':['project_admin']}], 
                        'created_on': '2018-10-30T15:33:45Z', 
                        'email':'example@foo'},
                        {'name':'ams_user_002', 
                        'projects':[{'project':'TESTPROJECT','roles':['consumer']},{'project':'TEST2','roles':['project_admin']}], 
                        'created_on': '2018-10-30T16:33:45Z', 
                        'email':'example02@foo'},
                        {'name':'ams_user_002', 
                        'projects':[{'project':'TESTPROJECT','roles':['publishier']}], 
                        'created_on': '2018-10-30T16:33:45Z', 
                        'email':'example03@foo'}
                    ];
        // if retrieved user data from ams user the first user
        if (this.state.users.length > 0) {
            userData = this.state.users;
        }

        return <div>
        <header className="App-header">
        <h1 className="App-title"><img src={argologo} className="App-logo" alt="logo" />Admin UI: <span>AMS Users</span></h1>
        <div className="service-info">
        <span className="label">endpoint: </span><span className="value">{config.endpoint}</span>
        <span className="label">access-token: </span> <input className="round" id="token" onKeyPress={evt => this.handleTokenChange(evt)}/>
        </div>
        </header>
         <UserList item={userData}/>
        </div>
    }
}

export default UserManager;