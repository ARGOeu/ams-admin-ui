import React, { Component } from "react";
import {
  NotificationContainer
} from "react-notifications";
import config from "./config";
import Authen from "./Authen";
import { CardBody, Card } from "reactstrap";
import DataManager from "./DataManager";



class SubModOffset extends Component {
  constructor(props) {
    super(props);
    this.authen = new Authen(config.endpoint);
    this.DM = new DataManager(config.endpoint, this.authen.getToken());
    this.state = {  project: "",
    subname: "",
    offsets: {min: 0, max:0, current:0}
    }

    if (this.authen.isLogged()) {
      this.state = {
        project: this.props.match.params.projectname,
        subname: this.props.match.params.subname,
        offsets: {min: 0, max:0, current:0}
      };
      // update sub
      this.apiGetData(this.state.project,this.state.subname)
    }

    this.apiGetData = this.apiGetData.bind(this)
    this.handleOffset = this.handleOffset.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
    this.doModOffset = this.doModOffset.bind(this)
  
  }

  apiGetData(projectName, subName) {
    this.DM.subGetOffsets(projectName, subName).then(r => {
      if (r.done){
        this.setState({offsets:r.data})
      }
    })
  }


  handleOffset(e) {
    
    
    let offsets = this.state.offsets
    offsets.current = e.target.value
    this.setState({offsets})
  }

  handleSubmit(e) {
    e.preventDefault();
    this.doModOffset(this.state.project, this.state.subname, this.state.offsets.current)
  }

  

  doModOffset(project, sub, offset) {
    this.DM.subModOffset(project,sub,{offset:parseInt(offset)}).then(done=>{
      if (done){
        this.props.history.push( "/subs/details/projects/" + project + "/subscriptions/" + sub)
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
          <div className="col-3">
            <h2>Update Subscription</h2>
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
                    <label className="ml-4">Subname Name:</label>
                    <strong className="ml-2">{this.state.subname}</strong>
                  </div>

                  <div className="form-control-group">
                    <label className="mr-2"><strong>Offsets: </strong></label>
                    <code  style={{color: "grey"}} className="border p-1">{this.state.offsets.min}</code>
                    <input type="range" style={{width:"400px"}}  onChange={this.handleOffset} className="mx-2" min={this.state.offsets.min} max={this.state.offsets.max} value={this.state.offsets.current}></input>
                    <code style={{color: "grey"}} className="border p-1">{this.state.offsets.max}</code>
                    <br/>
                    <label className="mr-2"><strong>Current: </strong></label><code className="border p-1">{this.state.offsets.current}</code>
                  </div>
                  
                
                  <br/>
                  <button type="submit" className="btn btn-success mr-2">
                    Modify Offset
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

export default SubModOffset;
