import React, { Component } from "react";
import {
  NotificationContainer,
  NotificationManager
} from "react-notifications";
import config from "./config";
import Authen from "./Authen";
import { CardBody, Card } from "reactstrap";
import Autocomplete from "react-autocomplete";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { library } from "@fortawesome/fontawesome-svg-core";
import { faDiceD6, faEnvelope } from "@fortawesome/free-solid-svg-icons";
import DataManager from "./DataManager";
library.add(faDiceD6, faEnvelope);

function getProjectColorIcon(projectName) {
  let color = "#616A6B";
  if (projectName in config.project_colors) {
    color = config.project_colors[projectName];
  }

  return <FontAwesomeIcon icon="dice-d6" style={{ color: color }} />;
}



class CreateSub extends Component {
  constructor(props) {
    super(props);
    this.authen = new Authen();
    this.DM = new DataManager(this.authen.getEndpoint(), this.authen.getToken());
    this.state = { projects: [], subs: [], topics: [], value: "", isServiceAdmin: this.authen.isServiceAdmin(), isProjectAdmin: this.authen.isProjectAdmin() };
    if (this.authen.isLogged()) {
      this.state = {
        projects: this.apiGetProjects(this.authen.getToken(), this.authen.getEndpoint()),
        value: window.location.hash.substring(1),
        error: {sub:"",topic:"",project:""},
        sub: "",
        subs: this.apiGetSubs(
         
          window.location.hash.substring(1)
        ),
        topics: this.apiGetTopics(
         
          window.location.hash.substring(1)
        )
      };
    }
    this.handleSubChange = this.handleSubChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleSubChange(e) {
    this.setState({ sub: e.target.value });
    let error = this.state.error
    
    if (e.target.value === "") {
      error.sub = "Name Required"
    } else if (!/^[A-Z0-9_-]+$/i.test(e.target.value)) {
      error.sub =
        "Invalid name (use only letters, numbers, underscores and dashes)";
    }  else if (this.state.subs.indexOf(e.target.value) > -1) {
      
      error.sub = "Sub with the same name already exists"
      
    }  else {
      error.sub = ""
    }
    this.setState({ error });
  }

  validateProject(value){
    let error = this.state.error;
    if (value === ""){
      error.project = "Name Required"
    } else if (!/^[A-Z0-9_-]+$/i.test(value)) {
      error.sub =
        "Invalid name (use only letters, numbers, underscores and dashes)";
    } else {
      error.project = ""
    }

    this.setState({error})
  }

  validateTopic(value){
    let error = this.state.error;
    if (value === ""){
      error.topic = "Name Required"
    } else if (!/^[A-Z0-9_-]+$/i.test(value)) {
      error.topic =
        "Invalid name (use only letters, numbers, underscores and dashes)";
    }
     else {
      error.topic = ""
    }

    this.setState({error})
  }

  handleSubmit(e) {
    e.preventDefault();
    if (this.state.error.sub !== "" || this.state.error.project !=="" || this.state.error.topic !=="") return;
    this.doCreateSub(this.state.value, this.state.sub, this.state.topic);
  }

  getProjects() {
    if (this.state.projects === undefined) return [];
    return this.state.projects;
  }

  getTopics() {
    if (this.state.topics === undefined) return [];
    return this.state.topics;
  }

  apiGetData(projectName) {
    this.DM.projectGet(projectName).then(r=>{
      if (r.done){
        let initVal = {
          project: ""
        };

        this.setState({ initialValues: initVal });
      }
    })
  }

  // get project data
  apiGetProjects() {
    
    if (this.state.isServiceAdmin === false && this.state.isProjectAdmin === true){
        // get project list from allowed projects
        let allowedProjects = this.authen.getProjectsPerRole()["project_admin"]
        let results = []
        for (let project of allowedProjects)
        results.push({"name":project, "created_on":"", "modified_on":""})
        return results
        
    }

    this.DM.projectGet().then(r=>{
      if (r.done){
        this.setState({projects: r.data.projects})
      }
    })
  }

  doCreateSub(project, sub, topic) {
    let comp = this;
    this.DM.subCreate(project, sub, {topic:`projects/${project}/topics/${topic}`}).then(r=>{
      if (r.done){
        NotificationManager.info("Subscription Created!", null, 1000);
        setTimeout(()=>{comp.props.history.push("/subs/details/projects/" + project + "/subscriptions/" + sub)},1000)  
      } else {
        NotificationManager.error("Error during subscription creation!", null, 1000);
        
      }
    })
  }

  loadProjectTopics(value) {
    // if project value exists in known projects
    if (this.state.projects.indexOf(value)) {
      this.setState({
        topics: this.apiGetTopics(
          value
        )
      });
      window.location.hash = value;
    }
  }

  apiGetTopics(project) {
    this.DM.topicGet(project).then(r=>{
      if (r.done){
        let listOfTopics = [];
        for (let itemTopic of r.data.topics) {
          listOfTopics.push(itemTopic.name.split("/")[4]);
        }
        
        this.setState({ topics: listOfTopics });
      }
    })
  }

  apiGetSubs(project) {
    this.DM.subGet(project).then(r=>{
      if (r.done){
        let listOfSubs = [];
        // Failsafe for ams version that returns empty response
        if ("subscriptions" in r.data) {
          for (let itemSub of r.data.subscriptions) {
            listOfSubs.push(itemSub.name.split("/")[4]);
          }
        }
       
        
        this.setState({ subs: listOfSubs});
      }
    })
  }

  matchProjects(state, value) {
    return state.name.toLowerCase().indexOf(value.toLowerCase()) !== -1;
  }

  matchTopics(state, value) {
    
   
    return state.name.toLowerCase().indexOf(value.toLowerCase()) !== -1;
  }

  render() {
    return (
      <div>
        <NotificationContainer />
        <div className="row mb-2">
          <div className="col-3">
            <h2>Create Subscription</h2>
          </div>
        </div>
        <Card className="mb-2">
          <CardBody>
            <div className="row">
              <div className="col-8">
                <form onSubmit={this.handleSubmit}>
                  <div className="input-group mb-2 mr-sm-2">
                    <div className="input-group-prepend">
                      <div className="input-group-text">Project:</div>
                    </div>
                    <Autocomplete
                      value={this.state.value}
                      inputProps={{
                        id: "states-autocomplete",
                        className: "form-control"
                      }}
                      wrapperProps={{
                        className: "input-group-append"
                      }}
                      wrapperStyle={{ width: "75%" }}
                      items={this.getProjects()}
                      getItemValue={item => item.name}
                      shouldItemRender={this.matchProjects}
                      onChange={(event, value) => {
                        this.setState({ value });
                        this.validateProject(value);
                        // this.loadProjectTopics(value);
                      }}
                      onSelect={value => {
                        this.setState({ value });
                        this.validateProject(value);
                        this.loadProjectTopics(value);
                        
                      }}
                      renderMenu={children => (
                        <div className="menu">{children}</div>
                      )}
                      renderItem={(item, isHighlighted) => (
                        <div
                          className={`item ${
                            isHighlighted ? "item-highlighted" : ""
                          }`}
                          key={item.name}
                        >
                          {getProjectColorIcon(item.name)}
                          <span className="ml-2">{item.name}</span>
                        </div>
                      )}
                    />
                     
                  </div>
                  <label className="text-danger">{this.state.error.project}</label>
                  <div className="form-control-group">
                    <label>Subscription Name:</label>
                    <input
                      className="form-control"
                      style={{ width: "82%" }}
                      onChange={this.handleSubChange}
                      onBlur={this.handleSubChange}
                      value={this.state.subscription}
                    />
                    <label className="text-danger">{this.state.error.sub}</label>
                  </div>
                  <div className="input-group mb-2 mr-sm-2">
                    <div className="input-group-prepend">
                      <div className="input-group-text">Topic:</div>
                    </div>
                    <Autocomplete
                      value={this.state.topic}
                      inputProps={{
                        id: "states-autocomplete",
                        className: "form-control"
                      }}
                      wrapperProps={{
                        className: "input-group-append"
                      }}
                      wrapperStyle={{ width: "75%" }}
                      items={this.getTopics()}
                      getItemValue={item => item}
                      //shouldItemRender={this.matchTopics}
                      onChange={(event, value) => {
                        this.setState({ topic: value });
                        this.validateTopic(value);
                        // this.loadProjectTopics(value);
                      }}
                      onSelect={value => {
                        this.setState({ topic: value });
                        this.validateTopic(value);
                      }}
                      renderMenu={children => (
                        <div className="menu">{children}</div>
                      )}
                      renderItem={(item, isHighlighted) => (
                        <div
                          className={`item ${
                            isHighlighted ? "item-highlighted" : ""
                          }`}
                          key={item}
                        >
                          
                          <span className="ml-2">{item}</span>
                        </div>
                      )}
                    />
                    
                  </div>
                  <label className="text-danger">{this.state.error.topic}</label>
                  <br/>
                  <button type="submit" className="btn btn-success">
                    Create Subscription
                  </button>
                  <span> </span>
                  <button
                    onClick={() => {
                      this.props.history.goBack();
                    }}
                    className="btn btn-dark"
                  >
                    Cancel
                  </button>
                </form>
              </div>
              <div className="col-4 p-2">
                Type a project name to create a subscription to
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    );
  }
}

export default CreateSub;
