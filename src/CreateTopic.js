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

function getShortName(fullName) {
  let tokens = fullName.split("/");
  return tokens[tokens.length - 1];
}

class CreateTopic extends Component {
  constructor(props) {
    super(props);
    this.authen = new Authen();
    this.DM = new DataManager(this.authen.getEndpoint(), this.authen.getToken());
    this.state = { projects: [], topics: [], value: "", isServiceAdmin: this.authen.isServiceAdmin(), isProjectAdmin: this.authen.isProjectAdmin() };
    if (this.authen.isLogged()) {
      this.state = {
        projects: this.apiGetProjects(),
        value: window.location.hash.substring(1),
        schemas: this.apiGetSchemas(window.location.hash.substring(1)),
        error: "",
        topic: "",
        topics: this.apiGetTopics(window.location.hash.substring(1)),
        selectedSchema: ""
      };
    }
    this.handleTopicChange = this.handleTopicChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleTopicChange(e) {
    this.setState({ topic: e.target.value });
    // quickly validate
    if (e.target.value === "") {
      this.setState({ error: "Name Required" });
    } else if (!/^[A-Z0-9_-]+$/i.test(e.target.value)) {
      this.setState({
        error:
          "Invalid name (use only letters, numbers, underscores and dashes)"
      });
    }
    if (!!this.state.topics && this.state.topics.indexOf(e.target.value) > -1) {
      this.setState({ error: "Topic with the same name already exists" });
    } else {
      this.setState({ error: "" });
    }
  }

  handleSubmit(e) {
    e.preventDefault();
    if (this.state.error !== "") return;
    this.doCreateTopic(this.state.value, this.state.topic, this.state.selectedSchema);
  }

  getProjects() {
    if (this.state.projects === undefined) return [];
    return this.state.projects;
  }

  getSchemas() {
    if (this.state.schemas === undefined) return [];
    return this.state.schemas;
  }

  apiGetSchemas(projectName) {
    this.DM.projectGetSchemas(projectName).then((r) => {
      if (r.done) {
        this.setState({ schemas: r.data.schemas });
      }
    });
  }

  // get project data
  apiGetProjects() {

    if (this.state.isServiceAdmin === false && this.state.isProjectAdmin === true) {
      // get project list from allowed projects
      let allowedProjects = this.authen.getProjectsPerRole()["project_admin"]
      let results = []
      for (let project of allowedProjects)
        results.push({ "name": project, "created_on": "", "modified_on": "" })
      return results

    }

    this.DM.projectGet().then(r => {
      if (r.done) {
        this.setState({ projects: r.data.projects });
      }
    });
  }

  doCreateTopic(project, topic, schema) {
    let comp = this;
    this.DM.topicCreate(project, topic, schema).then(r => {
      if (r.done) {
        NotificationManager.info("Topic Created!", null, 1000);
        setTimeout(() => {
          comp.props.history.push(
            "/topics/details/projects/" + project + "/topics/" + topic
          );
        }, 1000);
      } else {
        NotificationManager.error("Error during topic creation!", null, 1000);
      }
    });

  }

  loadProjectTopics(value) {
    // if project value exists in known projects
    if (this.state.projects.indexOf(value)) {
      this.setState({
        topics: this.apiGetTopics(value)
      });
      window.location.hash = value;
    }
  }

  apiGetTopics(project) {
    this.DM.topicGet(project).then(r => {
      if (r.done) {
        let listOfTopics = [];
        // Failsafe for ams version that returns empty resposne
        if ("topics" in r.data) {
          for (let itemTopic of r.data.topics) {
            listOfTopics.push(itemTopic.name.split("/")[4]);
          }
        }


        this.setState({ topics: listOfTopics });
      }
    });
  }

  matchProjects(state, value) {
    return state.name.toLowerCase().indexOf(value.toLowerCase()) !== -1;
  }

  matchSchemas(state, value) {
    return state.name.toLowerCase().indexOf(value.toLowerCase()) !== -1;
  }

  render() {
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
              <div className="col-4 p-2">
                Type a project name and a schema to bind a topic to:
              </div>
              <br></br>
            </div>
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
                        this.apiGetSchemas(value);
                        this.setState({
                          ...this.state,
                          value
                        });
                      }}
                      onSelect={value => {
                        this.apiGetSchemas(value);
                        this.setState({
                          ...this.state,
                          value
                        });
                        this.loadProjectTopics(value);
                      }}
                      renderMenu={children => (
                        <div className="menu">{children}</div>
                      )}
                      renderItem={(item, isHighlighted) => (
                        <div
                          className={`item ${isHighlighted ? "item-highlighted" : ""
                            }`}
                          key={item.name}
                        >
                          {getProjectColorIcon(item.name)}
                          <span className="ml-2">{item.name}</span>
                        </div>
                      )}
                    />
                  </div>
                  <div className="input-group mb-2 mr-sm-2">
                    <div className="input-group-prepend">
                      <div className="input-group-text">Schema:</div>
                    </div>
                    <Autocomplete
                      value={this.state.selectedSchema}
                      inputProps={{
                        id: "states-autocomplete",
                        className: "form-control"
                      }}
                      wrapperProps={{
                        className: "input-group-append"
                      }}
                      wrapperStyle={{ width: "75%" }}
                      items={this.getSchemas()}
                      getItemValue={item => item.name}
                      shouldItemRender={this.matchSchemas}
                      onChange={(event, value) => {
                        this.setState({ selectedSchema: value });
                      }}
                      onSelect={value => {
                        this.setState({ selectedSchema: value });
                      }}
                      renderMenu={children => (
                        <div className="menu">{children}</div>
                      )}
                      renderItem={(item, isHighlighted) => (
                        <div
                          className={`item ${isHighlighted ? "item-highlighted" : ""
                            }`}
                          key={getShortName(item.name)}
                        >
                          {getProjectColorIcon(item.name)}
                          <span className="ml-2">{getShortName(item.name)}</span>
                        </div>
                      )}
                    />
                  </div>
                  <div className="form-control-group">
                    <label>Topic Name:</label>
                    <input
                      className="form-control"
                      style={{ width: "82%" }}
                      onChange={this.handleTopicChange}
                      value={this.state.topic}
                    />
                    <label className="text-danger">{this.state.error}</label>
                  </div>
                  <button type="submit" className="btn btn-success">
                    Create Topic
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
            </div>
          </CardBody>
        </Card>
      </div>
    );
  }
}

export default CreateTopic;
