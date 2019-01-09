import React from "react";
import Authen from "./Authen";
import config from "./config";
import {
  Col,
  Button,
  Card,
  CardBody,
  CardHeader,
  CardFooter,
  Row
} from "reactstrap";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { library } from "@fortawesome/fontawesome-svg-core";
import {
  NotificationContainer,
  NotificationManager
} from "react-notifications";
import {
  faDiceD6,
  faEnvelope,
  faEnvelopeOpen
} from "@fortawesome/free-solid-svg-icons";
library.add(faDiceD6, faEnvelope, faEnvelopeOpen);

function getShortName(fullName) {
  let tokens = fullName.split("/");
  return tokens[tokens.length - 1];
}

function getProjectColorIcon(projectName) {
  let color = "#616A6B";
  if (projectName in config.project_colors) {
    color = config.project_colors[projectName];
  }

  return <FontAwesomeIcon icon="dice-d6" style={{ color: color }} size="4x" />;
}

class ProjectDetails extends React.Component {
  constructor(props) {
    super(props);
    this.authen = new Authen(config.endpoint);
    this.state = { project: null, topics: null, subs: null };

    this.apiGetData.bind(this);
    this.apiGetTopics.bind(this);
    this.apiGetSubs.bind(this);

    if (this.authen.isLogged()) {
      this.state = {
        toDelete: this.props.toDelete,
        project: this.apiGetData(
          this.authen.getToken(),
          config.endpoint,
          this.props.match.params.projectname
        ),
        topics: this.apiGetTopics(
          this.authen.getToken(),
          config.endpoint,
          this.props.match.params.projectname
        ),
        subs: this.apiGetSubs(
          this.authen.getToken(),
          config.endpoint,
          this.props.match.params.projectname
        )
      };
    } else {
      this.state = { project: null, topics: null, subs: null };
    }
  }

  apiDelete(token, endpoint, projectname) {
    // If token or endpoint empty return
    if (token === "" || token === null || endpoint === "" || projectname === "") {
      return;
    }
    // quickly construct request url
    let url = "https://" + endpoint + "/v1/projects/" + projectname + "?key=" + token;
    // setup the required headers
    let headers = {
      "Content-Type": "application/json",
      Accept: "application/json"
    };
    // fetch the data and if succesfull change the component state - which will trigger a re-render
    fetch(url, { method: "delete", headers: headers })
      .then(response => {
        if (response.status === 200) {
          NotificationManager.info("Project Deleted", null, 1000);
          return true;
        } else {
          NotificationManager.error("Error", null, 1000);
          return false;
        }
      })
      .then(done => {
        if (done) {
          // display notification
          setTimeout(function() {
            window.location = "/projects";
          }, 1000);
        }
      })
      .catch(error => console.log(error));
  }

  apiGetData(token, endpoint, projectName) {
    // If token or endpoint empty return
    if (
      token === "" ||
      token === null ||
      endpoint === "" ||
      projectName === ""
    ) {
      return;
    }
    // quickly construct request url
    let url =
      "https://" + endpoint + "/v1/projects/" + projectName + "?key=" + token;
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
          return { project: [] };
        }
      })
      .then(json => {
        console.log(json);
        this.setState({ project: json });
      })
      .catch(error => console.log(error));
  }

  apiGetTopics(token, endpoint, projectName) {
    // If token or endpoint empty return
    if (
      token === "" ||
      token === null ||
      endpoint === "" ||
      projectName === ""
    ) {
      return;
    }
    // quickly construct request url
    let url =
      "https://" +
      endpoint +
      "/v1/projects/" +
      projectName +
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
        console.log(json);
        this.setState({ topics: json.topics });
      })
      .catch(error => console.log(error));
  }

  apiGetSubs(token, endpoint, projectName) {
    // If token or endpoint empty return
    if (
      token === "" ||
      token === null ||
      endpoint === "" ||
      projectName === ""
    ) {
      return;
    }
    // quickly construct request url
    let url =
      "https://" +
      endpoint +
      "/v1/projects/" +
      projectName +
      "/subscriptions?key=" +
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
          return { subs: [] };
        }
      })
      .then(json => {
        console.log(json);
        this.setState({ subs: json.subscriptions });
      })
      .catch(error => console.log(error));
  }

  render() {
    if (this.state.project === undefined) {
      return <h3>loading</h3>;
    }

    let willDelete = null;
    let willBack = null;

    let topicList = null;
    let subList = null;

    if (this.state.topics !== null && this.state.topics !== undefined) {
      let topics = [];
      for (let topic of this.state.topics) {
        topics.push(
          <li key={topic.name} className="list-group-item">
            <FontAwesomeIcon icon="envelope" className="mr-2" />
            <Link to={"/topics/details" + topic.name}>
              {getShortName(topic.name)}
            </Link>
          </li>
        );
      }
      topicList = <ul className="list-group">{topics}</ul>;
    }

    if (this.state.subs !== null && this.state.subs !== undefined) {
      let topicSubs = {}
      for (let sub of this.state.subs) {
        let subItem = <li key={sub.name} className="list-group-item"><FontAwesomeIcon icon="envelope-open" className="mr-2" /><Link to={"subs/details/"+sub.name}>{getShortName(sub.name)}</Link></li>
        if (sub.topic in topicSubs){
          topicSubs[sub.topic].push(subItem)
        } else {
          topicSubs[sub.topic] = [subItem];
        }
      }
      let topicSubList = []
      for (let topic in topicSubs) {
         
         topicSubList.push(<li key={topic} className="list-group-item"><FontAwesomeIcon icon="envelope" className="mr-2" />{getShortName(topic)}<ul className="mt-2 list-group">{topicSubs[topic]}</ul></li>)
      }
      
      subList= <ul className="list-group">{topicSubList}</ul>
    }

    if (this.state.toDelete) {
      willDelete = (
        <Card className="border-danger mb-2">
          <CardHeader className="border-danger text-danger text-center">
            <h5>
              <FontAwesomeIcon className="mx-3" icon="exclamation-triangle" />
              <strong>Project Deletion</strong>
            </h5>
          </CardHeader>
          <CardBody className="border-danger text-center">
            Are you sure you want to delete project:{" "}
            <strong>{this.state.project.name}</strong>
          </CardBody>
          <CardFooter className="border-danger text-danger text-center">
            <Button
              color="danger"
              className="mr-2"
              onClick={() => {
                this.apiDelete(
                  this.authen.getToken(),
                  config.endpoint,
                  this.state.project.name
                );
              }}
            >
              Delete
            </Button>
            <Button
              onClick={() => {
                window.history.back();
              }}
              className="btn btn-dark"
            >
              Cancel
            </Button>
          </CardFooter>
        </Card>
      );
    } else {
      willBack = (
        <Button
          onClick={() => {
            window.history.back();
          }}
          className="btn btn-dark"
        >
          Back
        </Button>
      );
    }

    return (
      <div>
        <NotificationContainer />
        <Row>
          <Col>
            <h2>Project Details</h2>
          </Col>
          <Col className="text-right">
            <Link
              className="btn btn-info  ml-1 mr-1"
              to={"/projects/update/" + this.state.project.name}
            >
              <FontAwesomeIcon icon="pen" /> Modify Project
            </Link>
            <a
              className="btn btn-danger  ml-1 mr-1"
              href={"/projects/delete/" + this.state.project.name}
            >
              <FontAwesomeIcon icon="times" /> Delete Project
            </a>
          </Col>
        </Row>

        <div>
          <Row>
            <div className="col-md-4 col-sm-12 col-xs-12">
              <Card>
                <CardBody>
                  <div className="mx-auto profile-circle">
                    <div className="mt-3">
                      {getProjectColorIcon(this.state.project.name)}
                    </div>
                  </div>
                  <br />
                  <span>{this.state.project.name}</span>
                  <hr />
                  <strong>description:</strong> {this.state.project.description}
                </CardBody>
                <CardFooter>
                  <small>
                    <strong>created:</strong>
                  </small>
                  <small> {this.state.project.created_on}</small>
                  <br />
                  <small>
                    <strong>updated:</strong>
                  </small>
                  <small> {this.state.project.modified_on}</small>
                  <small>
                    <br />
                    <strong>created by:</strong>
                  </small>
                  <small> {this.state.project.created_by}</small>
                </CardFooter>
              </Card>
            </div>
            <div className="col-md-8 col-sm-12 col-xs-12">
            
                {willDelete}
             
              <Card>
                <CardHeader>
                  <strong>Topics</strong>
                </CardHeader>
                <CardBody>{topicList}</CardBody>
              </Card>
              <Card className="mt-3">
                <CardHeader>
                  <strong>Subscriptions</strong>
                </CardHeader>
                <CardBody>{subList}</CardBody>
              </Card>
              <div className="m-2 text-right">
                {willBack}
              </div>
            </div>
          </Row>
        </div>
      </div>
    );
  }
}

export default ProjectDetails;
