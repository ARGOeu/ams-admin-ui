import React from "react";
import User from "./User";
import Authen from "./Authen";
import argologoAnim from './argologo_anim.svg'
import config from './config';
import { Link } from 'react-router-dom';



class UserList extends React.Component {
  constructor(props) {
    super(props);
    this.authen = new Authen(config.endpoint);

    this.state = {users:[]}

    if (this.authen.isLogged()) {
      this.state = {
        users: this.apiGetData(this.authen.getToken(), config.endpoint)}
     } else {
          this.state = {users:[]};
      }
    
  }

  apiGetData(token, endpoint) {
    // If token or endpoint empty return
    if (token === "" || token === null || endpoint === "") {
      return;
    }
    // quickly construct request url
    let url = "https://" + endpoint + "/v1/users?key=" + token;
    // setup the required headers
    let headers = {
      "Content-Type": "application/json",
      Accept: "application/json"
    };
    // fetch the data and if succesfull change the component state - which will trigger a re-render
    fetch(url, { headers: headers })
      .then(response => {
        if (response.status === 200) {
          return response.json();
        } else {
          return { users: [] };
        }
      })
      .then(json => this.setState({ users: json.users, token: token }))
      .catch(error => console.log(error));
  }

  render() {
    let userComps = [];
    let count = 0;

    if (this.state.users === undefined) {
        return <div><h1><img alt="argo admin ui" src={argologoAnim}></img>Loading data...</h1></div>
    }

    

    for (let user of this.state.users) {
      userComps.push(<User key={count} item={user} />);
      count++;
    }
    return (
     <div>
       <h2>Users</h2><Link className="btn btn-success" to="/users/create">Create User</Link>
    <ul>{userComps}</ul>)
    </div>
    );
  }
}

export default UserList;
