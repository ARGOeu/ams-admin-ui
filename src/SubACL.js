import React, { Component } from "react";
import {
  NotificationContainer,
  NotificationManager
} from "react-notifications";
import config from "./config";
import Authen from "./Authen";
import { CardBody, Card } from "reactstrap";
import DataManager from "./DataManager";



class SubACL extends Component {
  constructor(props) {
    super(props);
    this.authen = new Authen(config.endpoint);
    this.DM = new DataManager(config.endpoint, this.authen.getToken())
    this.state = {  project: "",
    sub: "",
    user:"",
    acl: [] };

    if (this.authen.isLogged()) {
      this.state = {
        project: this.props.match.params.projectname,
        sub: this.props.match.params.subname,
        user: "",
        acl: this.apiGetSubACL(this.props.match.params.projectname,this.props.match.params.subname)
        
      };
    }
    this.handleUserChange = this.handleUserChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleAdd = this.handleAdd.bind(this);
    this.handleRemove = this.handleRemove.bind(this);
  }

  handleAdd(e) {
    this.apiUserExists(this.state.user)
  }

  handleUserChange(e) {
    this.setState({ user: e.target.value });
  }

  handleSubmit(e) {
    e.preventDefault();
    this.doModACL(this.state.project, this.state.sub);
  }


  handleRemove(e) {
    let key = e.target.getAttribute("indexedkey");
    let acl = this.state.acl.filter(word => word !== key)
    this.setState({acl: acl})
  }


  doModACL(project, sub) {
    let comp = this;
    this.DM.subModACL(project, sub, {authorized_users:this.state.acl}).then(done=>{
      comp.props.history.push("/subs/details/projects/" + project + "/subscriptions/" + sub);
    })
  }



  apiUserExists(user) {
  
    this.DM.userGet(user).then(r=>{
      console.log(r)
      if (r.done){
        let acl = this.state.acl
        if (acl.indexOf(this.state.user) > -1) return;
        for (let project of r.data.projects) {
          if (project.project === this.state.project){
            acl.push(this.state.user)
            this.setState({ acl: acl});
            return;
          } 
        }
        NotificationManager.error("User doesn't have roles in this project", null, 1000)
      } else {
        NotificationManager.error("User doesn't exist", null, 1000)
          return
      }
    })
  }

  apiGetSubACL(project, sub) {
    this.DM.subGetACL(project,sub).then(r=>{
      if (r.done){
        this.setState({acl: r.data.authorized_users})
      }
    })
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
          <div className="col">
            <h2>Modify Subscription ACL</h2>
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
                    <label className="ml-4">Subscription Name:</label>
                    <strong className="ml-2">{this.state.sub}</strong>
                  </div>
                  <em className="mb-2" style={{color:"#555555"}}>Enter a username to be added to the <strong>{this.state.sub}</strong> subscription's authorized list. User should be member of the <strong>{this.state.project}</strong> project</em>
                
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
                  
                  <button type="button"
                    onClick={() => {
                      this.props.history.goBack();
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

export default SubACL;
