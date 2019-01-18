import React, { Component } from "react";
import {
  NotificationContainer,
  NotificationManager
} from "react-notifications";
import config from "./config";
import Authen from "./Authen";
import { CardBody, Card } from "reactstrap";


function sendData(url = ``, data = {}, method = "POST") {
  console.log(data)
  return fetch(url, {
    method: method,
    mode: "cors",
    cache: "no-cache",
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json; charset=utf-8"
    },
    redirect: "follow",
    referrer: "no-referrer",
    body: JSON.stringify(data)
  }).then(response => {
    if (response.status === 200) {
      NotificationManager.info("Acl Modified Created", null, 1000);
      return true;
    } else {
      NotificationManager.info("Issues with acl modification", null, 1000);
      return false;
    }
  });
}

class TopicACL extends Component {
  constructor(props) {
    super(props);
    this.authen = new Authen(config.endpoint);
    this.state = {  project: "",
    topic: "",
    user:"",
    acl: [] };

    if (this.authen.isLogged()) {
      this.state = {
        project: this.props.match.params.projectname,
        topic: this.props.match.params.topicname,
        user: "",
        acl: this.apiGetTopicACL(config.endpoint,this.authen.getToken(),this.props.match.params.projectname,this.props.match.params.topicname)
        
      };
    }
    this.handleUserChange = this.handleUserChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleAdd = this.handleAdd.bind(this);
    this.handleRemove = this.handleRemove.bind(this);
  }

  handleAdd(e) {
    this.apiUserExists(config.endpoint, this.authen.getToken(), this.state.user)
  }

  handleUserChange(e) {
    this.setState({ user: e.target.value });
  }

  handleSubmit(e) {
    e.preventDefault();
    this.doModACL(this.state.project, this.state.topic);
  }


  handleRemove(e) {
    let key = e.target.getAttribute("indexedkey");
    let acl = this.state.acl.filter(word => word !== key)
    this.setState({acl: acl})
  }


  doModACL(project, topic) {
    if (topic === "" || project === "") return;
    // quickly construct request url
    let url =
      "https://" +
      config.endpoint +
      "/v1/projects/" +
      project +
      "/topics/" +
      topic +
      ":modifyAcl?key=" +
      this.authen.getToken();

    sendData(url, {authorized_users:this.state.acl}, "POST")
      .then(done => {
        console.log(done);
        if (done) {
          window.location =
            "/topics/details/projects/" + project + "/topics/" + topic;
        }
      })
      .catch(error => console.error(error));
  }



  apiUserExists(endpoint, token, user) {
    // If token or endpoint empty return
    if (token === "" || user === null || endpoint === "") {
      return;
    }
    // quickly construct request url
    let url =
      "https://" +
      endpoint +
      "/v1/users/" +
      user +"?key=" +
      token;
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
          return null;
        }
      })
      .then(json => {
        if (json === null) {
          NotificationManager.error("User doesn't exist", null, 1000)
          return
        }
        let acl = this.state.acl
        if (acl.indexOf(this.state.user) > -1) return;
        console.log(json)
        for (let project of json.projects) {
          if (project.project === this.state.project){
            acl.push(this.state.user)
            this.setState({ acl: acl});
            return;
          } 
          

        }
        NotificationManager.error("User doesn't have roles in this project", null, 1000)
       
      })
      .catch(error => console.log(error));
  }

  apiGetTopicACL(endpoint, token, project, topic) {
    // If token or endpoint empty return
    if (token === "" || topic === null || endpoint === "") {
      return;
    }
    // quickly construct request url
    let url =
      "https://" +
      endpoint +
      "/v1/projects/" +
      project +
      "/topics/" + topic + ":acl?key=" +
      token;
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
          return { acl: [] };
        }
      })
      .then(json => {
        this.setState({ acl: json.authorized_users});
      })
      .catch(error => console.log(error));
  }

  render() {

    let aclUsers = []

    if (this.state.acl){
      for (let user of this.state.acl){
         aclUsers.push(<span className="tag-style" key={user}><strong>{user}</strong><button className="ml-2 close-link" indexedkey={user} key={user} onClick={this.handleRemove}>X</button></span>)
        }
    }
    

    return (
      <div>
        <NotificationContainer />
        <div className="row mb-2">
          <div className="col-2">
            <h2>Create Topic</h2>
          </div>
        </div>
        <Card className="mb-2">
          <CardBody>
            <div className="row">
              <div className="col-8">
                <form onSubmit={this.handleSubmit}>
                  
                  <div className="form-control-group">
                    <label>Project: </label>
                    <strong className="ml-2">{this.state.project}</strong>
                    <label className="ml-4">Topic Name:</label>
                    <strong className="ml-2">{this.state.topic}</strong>
                  </div>
                  
                  <div className="form-control-group">
                    <div className="input-group mb-2">
                          <div className="input-group-prepend">
                            <div className="input-group-text">User:</div>
                          </div>
                          <input type="text" onChange={this.handleUserChange} id="add-auth-user" className="form-control mr-2" placeholder="Username"  value={this.state.user}></input> 
                          <button type="button" onClick={this.handleAdd} className="btn btn-success">Add to ACL</button>
                    </div>
                  </div>

                  <span>Authorized Users:</span>
                  <div className="border rounded p-3 mb-2">
                    {aclUsers}
                  </div>
                  <button type="submit" className="btn btn-success mr-2">
                    Save ACL
                  </button>
                  
                  <button
                    onClick={() => {
                      window.history.back();
                    }}
                    className="btn btn-dark"
                  >
                    Cancel
                  </button>
                </form>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    );
  }
}

export default TopicACL;
