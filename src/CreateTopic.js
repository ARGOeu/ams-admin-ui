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
library.add(faDiceD6, faEnvelope);

function getProjectColorIcon(projectName) {
  let color = "#616A6B";
  if (projectName in config.project_colors) {
    color = config.project_colors[projectName];
  }

  return <FontAwesomeIcon icon="dice-d6" style={{ color: color }} />;
}

function sendData(url = ``, data = {}, method = "POST") {
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
      NotificationManager.info("Topic Created", null, 1000);
      return true;
    } else {
      NotificationManager.info("Issues with topic creation", null, 1000);
      return false;
    }
  });
}

class CreateTopic extends Component {
  constructor(props) {
    super(props);
    this.authen = new Authen(config.endpoint);
    this.state = { projects: [], topics: [], value: "" };
    if (this.authen.isLogged()) {
      this.state = {
        projects: this.apiGetProjects(this.authen.getToken(), config.endpoint),
        value: window.location.hash.substring(1),
        error: "",
        topic: "",
        topics: this.apiGetTopics(
          this.authen.getToken(),
          config.endpoint,
          window.location.hash.substring(1)
        )
      };
    }
    this.handleTopicChange = this.handleTopicChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleTopicChange(e) {
    this.setState({ topic: e.target.value });
    // quickly validate
    if (this.state.topics.indexOf(e.target.value) > -1) {
      this.setState({ error: "Topic with the same name already exists" });
    } else {
      this.setState({ error: "" });
    }
  }

  handleSubmit(e) {
    e.preventDefault();
    if (this.state.error !== "") return;
    this.doCreateTopic(this.state.value, this.state.topic);
  }

  getProjects() {
    if (this.state.projects === undefined) return [];
    return this.state.projects;
  }

  apiGetData(token, endpoint, projectname) {
    // If token or endpoint empty return
    if (
      token === "" ||
      token === null ||
      endpoint === "" ||
      projectname === ""
    ) {
      return;
    }
    // quickly construct request url
    let url =
      "https://" + endpoint + "/v1/projects/" + projectname + "?key=" + token;
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
          return { project: null };
        }
      })
      .then(json => {
        let initVal = {
          project: ""
        };

        this.setState({ initialValues: initVal });
      })
      .catch(error => console.log(error));
  }

  // get project data
  apiGetProjects(token, endpoint) {
    // If token or endpoint empty return
    if (token === "" || token === null || endpoint === "") {
      return;
    }
    // quickly construct request url
    let url = "https://" + endpoint + "/v1/projects?key=" + token;
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
          return { projects: [] };
        }
      })
      .then(json => this.setState({ projects: json.projects, token: token }))
      .catch(error => console.log(error));
  }

  doCreateTopic(project, topic) {
    if (topic === "") return;
    // quickly construct request url
    let url =
      "https://" +
      config.endpoint +
      "/v1/projects/" +
      project +
      "/topics/" +
      topic +
      "?key=" +
      this.authen.getToken();

    sendData(url, "", "PUT")
      .then(done => {
        console.log(done);
        if (done) {
          window.location =
            "/topics/details/projects/" + project + "/topics/" + topic;
        }
      })
      .catch(error => console.error(error));
  }

  loadProjectTopics(value) {
    // if project value exists in known projects
    if (this.state.projects.indexOf(value)) {
      this.setState({
        topics: this.apiGetTopics(
          this.authen.getToken(),
          config.endpoint,
          value
        )
      });
      window.location.hash = value;
    }
  }

  apiGetTopics(token, endpoint, project) {
    // If token or endpoint empty return
    if (token === "" || token === null || endpoint === "") {
      return;
    }
    // quickly construct request url
    let url =
      "https://" +
      endpoint +
      "/v1/projects/" +
      project +
      "/topics?key=" +
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
          return { topics: [] };
        }
      })
      .then(json => {
        let listOfTopics = [];
        for (let itemTopic of json.topics) {
          listOfTopics.push(itemTopic.name.split("/")[4]);
        }
        console.log(listOfTopics);
        this.setState({ topics: listOfTopics, token: token });
      })
      .catch(error => console.log(error));
  }

  matchProjects(state, value) {
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
                        // this.loadProjectTopics(value);
                      }}
                      onSelect={value => {
                        this.setState({ value });
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
                      window.history.back();
                    }}
                    className="btn btn-dark"
                  >
                    Cancel
                  </button>
                </form>
              </div>
              <div className="col-4 p-2">
                Type a project name to create a topic to
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    );
  }
}

export default CreateTopic;
