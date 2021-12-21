import React from "react";
import Authen from "./Authen";
import config from "./config";
import NumberFormat from "react-number-format";
import { BarChart, CartesianGrid, Bar, XAxis, YAxis, Tooltip } from "recharts";
import {
  Col,
  Button,
  Card,
  CardBody,
  CardHeader,
  CardFooter,
  Row,
  Table
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
  faEnvelopeOpen,
  faInfoCircle
} from "@fortawesome/free-solid-svg-icons";
import DataManager from "./DataManager";
library.add(faDiceD6, faEnvelope, faEnvelopeOpen, faInfoCircle);

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
    this.authen = new Authen();
    this.DM = new DataManager(this.authen.getEndpoint(), this.authen.getToken());
    this.state = { project: null, topics: null, subs: null, metrics: [] };

    this.apiGetData.bind(this);
    this.apiGetTopics.bind(this);
    this.apiGetSubs.bind(this);

    if (this.authen.isLogged()) {
      this.state = {
        toDelete: this.props.toDelete,
        project: this.apiGetData(this.props.match.params.projectname),
        topics: this.apiGetTopics(this.props.match.params.projectname),
        subs: this.apiGetSubs(this.props.match.params.projectname),
        metrics: this.apiGetMetrics(this.props.match.params.projectname)
      };
    }
  }

  componentWillReceiveProps(props) {
    this.setState({
        toDelete: this.props.toDelete,
        project: this.apiGetData(this.props.match.params.projectname),
        topics: this.apiGetTopics(this.props.match.params.projectname),
        subs: this.apiGetSubs(this.props.match.params.projectname),
        metrics: this.apiGetMetrics(this.props.match.params.projectname)
      });
  }

  apiGetMetrics(projectName) {
    this.DM.projectGetMetrics(projectName).then(r => {
      if (r.done) {
        this.setState({ metrics: r.data });
      }
    });
  }

  apiDelete(projectname) {
    let comp = this;
    this.DM.projectDelete(projectname).then(done => {
      if (done) {
        NotificationManager.info("Project Deleted", null, 1000);
        setTimeout(function() {
          comp.props.history.push("/projects");
        }, 1000);
      } else {
        NotificationManager.error("Error during project deletion", null, 1000);
      }
    });
  }

  apiGetData(projectName) {
    this.DM.projectGet(projectName).then(r => {
      if (r.done) {
        this.setState({ project: r.data });
      }
    });
  }

  apiGetTopics(projectName) {
    this.DM.topicGet(projectName).then(r => {
      if (r.done) {
        this.setState({ topics: r.data.topics });
      }
    });
  }

  apiGetSubs(projectName) {
    this.DM.subGet(projectName).then(r => {
      if (r.done) {
        this.setState({ subs: r.data.subscriptions });
      }
    });
  }

  render() {
    if (this.state.project === undefined) {
      return <h3>loading</h3>;
    }

    let willDelete = null;
    let willBack = null;

    let topicList = null;
    let subList = null;
    let metrics = null;

    if (this.state.topics !== null && this.state.topics !== undefined) {
      let topics = [];
      for (let topic of this.state.topics) {
        topics.push(
          <span key={topic.name} className="badge blue-badge mr-2 p-2 mb-2">
            <FontAwesomeIcon icon="envelope" className="mr-2" />
            <Link to={"/topics/details" + topic.name} className="text-white">
              {getShortName(topic.name)}
            </Link>
          </span>
        );
      }
      topicList = <div>{topics}</div>;
    }

    if (this.state.subs !== null && this.state.subs !== undefined) {
      let topicSubs = {};
      for (let sub of this.state.subs) {
        let subItem = (
          <span key={sub.name} className="badge blue-badge  mr-2 p-2 mb-2">
            <FontAwesomeIcon icon="envelope-open" className="mr-2" />
            <Link className="text-white" to={"/subs/details" + sub.name}>
              {getShortName(sub.name)}
            </Link>
          </span>
        );
        if (sub.topic in topicSubs) {
          topicSubs[sub.topic].push(subItem);
        } else {
          topicSubs[sub.topic] = [subItem];
        }
      }
      let topicSubList = [];
      for (let topic in topicSubs) {
        topicSubList.push(
          <span key={topic}>
            <FontAwesomeIcon icon="envelope" className="mr-2" />
            {getShortName(topic)}
            <p className="mt-2 ml-2">{topicSubs[topic]}</p>
          </span>
        );
      }

      subList = <div>{topicSubList}</div>;
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
                this.apiDelete(this.state.project.name);
              }}
            >
              Delete
            </Button>
            <Button
              onClick={() => {
                this.props.history.goBack();
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
            this.props.history.goBack();
          }}
          className="btn btn-dark"
        >
          Back
        </Button>
      );
    }

    if (this.state.metrics && this.state.metrics.metrics.length > 0) {
      let smallMetricList = [];
      let metricList = [];
      let latestDate = "";
      let userMetricList = [];

      for (let item of this.state.metrics["metrics"]) {
        let timedata = [];
        let chart = null;

        // If metric contains large timeseries of data plot it on it's own card
        if (item.timeseries.length > 1) {
          chart = (
            <div style={{ overflow: "hidden" }}>
              <BarChart
                width={700}
                height={300}
                data={item.timeseries.reverse()}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="timestamp" />
                <YAxis dataKey="value" />
                <Tooltip />
                <Bar dataKey="value" fill="#8884d8" />
              </BarChart>
            </div>
          );

          for (let timedatum of item.timeseries) {
            timedata.push(
              <tr key={timedatum.timestamp}>
                <td style={{ width: "1%", whiteSpace: "nowrap" }}>
                  <small>{timedatum.timestamp}</small>
                </td>
                <td className="td-fit">
                  <code>{timedatum.value}</code>
                </td>
              </tr>
            );
          }

          let card = (
            <Card key={item.metric} className="mb-4">
              <CardHeader>
                <strong>name: </strong>
                {item.metric}
              </CardHeader>
              <CardBody>
                {chart}
                <table className="table table-sm table-striped table-hover">
                  <thead>
                    <tr>
                      <th
                        style={{ width: "1%", whiteSpace: "nowrap" }}
                        scope="col"
                      >
                        Timestamp
                      </th>
                      <th className="th-fit" scope="col">
                        Value
                      </th>
                    </tr>
                  </thead>
                  <tbody>{timedata}</tbody>
                </table>
              </CardBody>
              <CardFooter>{item.description}</CardFooter>
            </Card>
          );

          metricList.push(card);
        } else if (item.timeseries.length === 1) {
          // combine smaller metrics in one view
          latestDate = item.timeseries[0].timestamp;

          if (item["resource_type"] === "project.user") {
            let metricItem = (
              <Table key="project-user-metrics" hover>
                <thead>
                    <tr>
                        <th>User</th>
                        <th>Metric</th>
                        <th>Resource Name</th>
                        <th>Description</th>
                        <th>Value</th>
                    </tr>
                </thead>
                <tbody>
                    <tr key={item.metric + "/" + item["resource_name"]}>
                        <th scope="row">{item["resource_name"].split(".")[1]}</th>
                        <td>{item.metric}</td>
                        <td>{item.metric.split(".")[2]}</td>
                        <td>{item.description}</td>
                        <td>{item.timeseries[0].value}</td>
                    </tr>
                </tbody>
            </Table>
            )
            userMetricList.push(metricItem);
          } else {
            let metricItem = (
              <Card key={item.metric} className="col-4 p-2 rounded">
                <CardBody className="text-center">
                  <h3>
                    <strong>
                      <NumberFormat
                        value={item.timeseries[0].value}
                        displayType={"text"}
                        thousandSeparator={true}
                      />
                    </strong>
                  </h3>
                  <br />
                  <h6>
                    <abbr title={item.description}>
                      {item.metric.split(".")[1]}{" "}
                      <FontAwesomeIcon
                        icon="info-circle"
                        className="ml-2"
                        style={{ color: "grey" }}
                      />
                    </abbr>
                  </h6>
                  <br />
                </CardBody>
              </Card>
            );
            smallMetricList.push(metricItem);
          }
        }
      }
      metrics = (
        <div>
          <h6>
            <strong>Project Metrics:</strong>
          </h6>
          <div className="row p-3">{smallMetricList}</div>
          <br />
          <h6>
            <strong>Project User Metrics:</strong>
          </h6>
          <div className="row p-3">{userMetricList}</div>

          <div className="row text-right">
            <div className="col-12">
              <small>{latestDate}</small>
            </div>
          </div>
          <br />
          <div>{metricList}</div>
        </div>
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
                  <span className="text-center">
                    <h4>{this.state.project.name}</h4>
                  </span>
                  <hr />
                  <span className="text-center d-block">
                    {this.state.project.description}
                  </span>
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
                  {this.state.project.created_by?
                  <React.Fragment>
                    <small>
                      <br />
                      <strong>created by:</strong>
                    </small>
                    <small> {this.state.project.created_by}</small>
                  </React.Fragment>
                  :null}
                </CardFooter>
              </Card>
            </div>
            <div className="col-md-8 col-sm-12 col-xs-12">
              {willDelete}

              <Card>
                <CardHeader>
                  <strong>Topics</strong>
                  <Link
                    style={{ borderColor: "grey" }}
                    className="btn btn-light btn-sm ml-4"
                    to={"/topics/create#" + this.state.project.name}
                  >
                    + Create a new topic
                  </Link>
                </CardHeader>
                <CardBody>{topicList}</CardBody>
              </Card>
              <Card className="mt-3">
                <CardHeader>
                  <strong>Subscriptions</strong>
                  <Link
                    style={{ borderColor: "grey" }}
                    className="btn btn-light btn-sm ml-4"
                    to={"/subs/create#" + this.state.project.name}
                  >
                    + Create a new subscription
                  </Link>
                </CardHeader>
                <CardBody>{subList}</CardBody>
              </Card>
              <Card className="mt-2 text-secondary">
                <CardFooter>
                  <strong>Icon legend:</strong>
                  <span className="border p-2 mx-2 rounded">
                    <FontAwesomeIcon className="ml-1 mr-1" icon="envelope" />{" "}
                    topic
                  </span>
                  <span className="border p-2 mx-2 rounded">
                    <FontAwesomeIcon
                      className="ml-1 mr-1"
                      icon="envelope-open"
                    />{" "}
                    subscription
                  </span>
                </CardFooter>
              </Card>

              <Card className="mt-4">
                <CardHeader>
                  <strong>Metrics</strong>
                </CardHeader>
                <CardBody>{metrics}</CardBody>
              </Card>

              <div className="m-2 text-right">{willBack}</div>
            </div>
          </Row>
        </div>
      </div>
    );
  }
}

export default ProjectDetails;
