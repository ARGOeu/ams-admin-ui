import React from "react";
import Authen from "./Authen";
import config from './config';
import {Button, Card, CardBody, CardHeader, CardFooter, Row} from 'reactstrap';
import {Link} from 'react-router-dom';
import ProjectRoles from './ProjectRoles';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { library } from "@fortawesome/fontawesome-svg-core";
import {
  NotificationContainer,
  NotificationManager
} from "react-notifications";
import {
  faExclamationTriangle
} from "@fortawesome/free-solid-svg-icons";
library.add(
  faExclamationTriangle,
);


function clip() {
  let copyText = document.getElementById("usertoken");
  copyText.select();
  document.execCommand("copy");
  NotificationManager.info("token copied to clipboard", null, 1000);
}

class UserDetails extends React.Component {
  constructor(props) {
    super(props);
    this.authen = new Authen(config.endpoint);
    console.log(this.props)
    this.state = {user:null}

    this.apiGetData.bind(this);

    if (this.authen.isLogged()) {
      this.state = {
        toDelete: this.props.toDelete,
        user: this.apiGetData(this.authen.getToken(), config.endpoint, this.props.match.params.username)}
     } else {
          this.state = {user:null};
      }
    
  }

  apiDelete(token, endpoint, username) {
    
    // If token or endpoint empty return
    if (token === "" || token === null || endpoint === "" || username === "") {
      return;
    }
    // quickly construct request url
    let url = "https://" + endpoint + "/v1/users/" + username + "?key=" + token;
    // setup the required headers
    let headers = {
      "Content-Type": "application/json",
      Accept: "application/json"
    };
    // fetch the data and if succesfull change the component state - which will trigger a re-render
    fetch(url, { method:'delete', headers: headers })
      .then(response => {
        if (response.status === 200) {
          NotificationManager.info("User Deleted", null, 1000);
          return true;
        } else {
          NotificationManager.error("Error", null, 1000);
          return false;
        }
      }).then(done=>{
        if (done) {
            // display notification
            setTimeout(function(){
              window.location = "/users";
            },1000);
        }
      })
      .catch(error => console.log(error));
  }


  apiGetData(token, endpoint, username) {
    
    // If token or endpoint empty return
    if (token === "" || token === null || endpoint === "" || username === "") {
      return;
    }
    // quickly construct request url
    let url = "https://" + endpoint + "/v1/users/" + username + "?key=" + token;
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
      .then(json => {console.log(json); this.setState({ user: json})})
      .catch(error => console.log(error));
  }

  render() {
   
  

    if (this.state.user === undefined) {
      return <h3>loading</h3>
    }

    let willDelete = null
    let willBack = null 

    if (this.state.toDelete) {
      willDelete = (<div>
        <h2 className="bg-danger text-white p-2 rounded"><FontAwesomeIcon className="mx-3" icon="exclamation-triangle" />Are you sure you want to delete this user ?</h2>
        <div className= "text-right"><Button color="danger" className="mr-2" onClick={()=>{this.apiDelete(this.authen.getToken(), config.endpoint, this.state.user.name)}}>Delete</Button>
        <Link to="/users" className="btn btn-dark">Cancel</Link></div>
        
      </div>);
    } else {
      willBack = <Link to="/users" className="btn btn-dark">Back</Link>
     
    }

    return (<div>
      <NotificationContainer />
      <Row>
      <div className="col-sm-6 mx-auto">
        <Card>    
      <CardHeader>User: <strong>{this.state.user.name}</strong></CardHeader>
      <CardBody>
        <table>
          <tbody>
          <tr><td><strong>uuid: </strong></td><td>{this.state.user.uuid}</td></tr>
          <tr><td><strong>email: </strong></td><td>{this.state.user.email}</td></tr>
          <tr><td><strong>token: </strong></td><td><input type="text" className="form-control-static" readOnly value={this.state.user.token} id="usertoken" /><button onClick={clip}className="btn btn-sm">Copy</button></td></tr>
          </tbody>
        </table>
        <hr/>
        <ProjectRoles projects={this.state.user.projects}/>
        <hr/>
        <table>
        <tbody>
        <tr><td><strong>created by:</strong></td><td>{this.state.user.created_by}</td></tr>
        <tr><td><strong>created on:</strong></td><td>{this.state.user.created_on}</td></tr>
        <tr><td><strong>modified on:</strong></td><td>{this.state.user.modified_on}</td></tr>
        </tbody>
        </table>
      </CardBody>
      <CardFooter>
        {willDelete}
        {willBack}
        </CardFooter>
    </Card>
    </div>
    </Row>
    

    
     </div>
    );
  }
}

export default UserDetails;
