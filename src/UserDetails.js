import React from "react";
import Authen from "./Authen";
import config from './config';
import {Card, CardBody, CardHeader, CardFooter, Row} from 'reactstrap';
import {Link} from 'react-router-dom';


class UserDetails extends React.Component {
  constructor(props) {
    super(props);
    this.authen = new Authen(config.endpoint);

    this.state = {user:null}

    this.apiGetData.bind(this);

    if (this.authen.isLogged()) {
      this.state = {
        user: this.apiGetData(this.authen.getToken(), config.endpoint, this.props.match.params.username)}
     } else {
          this.state = {user:null};
      }
    
  }

  apiGetData(token, endpoint, username) {
    console.log(token,endpoint,username);
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

    return (<div>
      <Row>
      <div className="col-sm-6 mx-auto">
        <Card>    
      <CardHeader>User: <strong>{this.state.user.name}</strong></CardHeader>
      <CardBody>
        <table>
          <tbody>
          <tr><td><strong>uuid:</strong></td><td>{this.state.user.uuid}</td></tr>
          <tr><td><strong>email:</strong></td><td>{this.state.user.email}</td></tr>
          <tr><td><strong>token:</strong></td><td><code>{this.state.user.token}</code></td></tr>
          </tbody>
        </table>
        <hr/>
        <em>Projects:</em><pre>{JSON.stringify(this.state.user.projects)}</pre>
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
        <Link to="/users">Back</Link>
      </CardFooter>
    </Card>
    </div>
    </Row>
    

    
     </div>
    );
  }
}

export default UserDetails;
