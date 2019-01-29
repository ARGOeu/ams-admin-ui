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
  faEnvelopeOpen,
  faUser,
  faUserLock,
  faPaperPlane
} from "@fortawesome/free-solid-svg-icons";
library.add(
  faDiceD6,
  faEnvelope,
  faEnvelopeOpen,
  faUser,
  faUserLock,
  faPaperPlane
);

function getShortName(fullName) {
  let tokens = fullName.split("/");
  return tokens[tokens.length - 1];
}

function getProjectName(fullName) {
  if (fullName) {
    let tokens = fullName.split("/");
    if (tokens.length >= 1) return tokens[2];
  }
  return "";
}

function getProjectColorIcon(projectName) {
  let color = "#616A6B";
  if (projectName in config.project_colors) {
    color = config.project_colors[projectName];
  }

  return <FontAwesomeIcon icon="dice-d6" style={{ color: color }} size="1x" />;
}

class SubDetails extends React.Component {
  constructor(props) {
    super(props);
    this.authen = new Authen(config.endpoint);
    this.state = { sub: null, acl: null };

    this.apiGetData.bind(this);

    if (this.authen.isLogged()) {
      this.state = {
        toDelete: this.props.toDelete,
        sub: this.apiGetData(
          this.authen.getToken(),
          config.endpoint,
          this.props.match.params.projectname,
          this.props.match.params.subname
        ),
        acl: this.apiGetAcl(
          this.authen.getToken(),
          config.endpoint,
          this.props.match.params.projectname,
          this.props.match.params.subname
        ),
        metrics: this.apiGetMetrics(
          this.authen.getToken(),
          config.endpoint,
          this.props.match.params.projectname,
          this.props.match.params.subname
        )
      };
    } else {
      this.state = { sub: null };
    }
  }

  apiDelete(token, endpoint, project, sub) {
    // If token or endpoint empty return
    if (token === "" || endpoint === null || project === "" || sub === "") {
      return;
    }
    // quickly construct request url
    let url =
      "https://" +
      endpoint +
      "/v1/projects/" +
      project +
      "/subscriptions/" +
      sub +
      "?key=" +
      token;
    // setup the required headers
    let headers = {
      "Content-Type": "application/json",
      Accept: "application/json"
    };
    // fetch the data and if succesfull change the component state - which will trigger a re-render
    fetch(url, { method: "delete", headers: headers })
      .then(response => {
        if (response.status === 200) {
          NotificationManager.info("Sub Deleted", null, 1000);
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
            window.location = "/subs#" + project;
          }, 1000);
        }
      })
      .catch(error => console.log(error));
  }

  apiGetData(token, endpoint, projectName, subName) {
    // If token or endpoint empty return
    if (token === "" || token === null || endpoint === "" || subName === "") {
      return;
    }
    // quickly construct request url
    let url =
      "https://" +
      endpoint +
      "/v1/projects/" +
      projectName +
      "/subscriptions/" +
      subName +
      "?key=" +
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
          return { sub: [] };
        }
      })
      .then(json => {
        this.setState({ sub: json });
      })
      .catch(error => console.log(error));
  }

  apiGetMetrics(token, endpoint, projectName, subName) {
    // If token or endpoint empty return
    if (token === "" || token === null || endpoint === "" || subName === "") {
      return;
    }
    // quickly construct request url
    let url =
      "https://" +
      endpoint +
      "/v1/projects/" +
      projectName +
      "/subscriptions/" +
      subName +
      ":metrics?key=" +
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
          return { metrics: [] };
        }
      })
      .then(json => {
        this.setState({ metrics: json });
      })
      .catch(error => console.log(error));
  }

  apiGetAcl(token, endpoint, projectName, subName) {
    // If token or endpoint empty return
    if (token === "" || token === null || endpoint === "" || subName === "") {
      return;
    }
    // quickly construct request url
    let url =
      "https://" +
      endpoint +
      "/v1/projects/" +
      projectName +
      "/subscriptions/" +
      subName +
      ":acl?key=" +
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
        this.setState({ acl: json });
      })
      .catch(error => console.log(error));
  }

  render() {
    if (this.state.sub === undefined) {
      return <h3>loading</h3>;
    }

    let willDelete = null;
    let willBack = null;

    let acl = null;
    let metrics = null;

    if (this.state.acl && this.state.acl.authorized_users.length > 0) {
      let aclUsers = [];
      aclUsers.push(
        <li key="_header" className="list-group-item list-group-item-success">
          authorized_users
        </li>
      );
      for (let item of this.state.acl["authorized_users"]) {
        aclUsers.push(
          <li key={item} className="list-group-item py-2">
            {" "}
            <FontAwesomeIcon icon="user" />
            <Link to={"/users/details/" + item}>{item}</Link>
          </li>
        );
      }
      acl = <ul className="text-center list-group">{aclUsers}</ul>;
    }

    if (this.state.metrics && this.state.metrics.metrics.length > 0) {
      let smallMetricList = [];
      let metricList = [];
      let latestDate = "";

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
                    {item.metric.split(".")[1]}
                  </abbr>
                </h6>
                <br />
              </CardBody>
            </Card>
          );

          smallMetricList.push(metricItem);
        }
      }
      metrics = (
        <div>
          <div className="row p-3">{smallMetricList}</div>

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

    if (this.state.toDelete) {
      willDelete = (
        <Card className="border-danger mb-2">
          <CardHeader className="border-danger text-danger text-center">
            <h5>
              <FontAwesomeIcon className="mx-3" icon="exclamation-triangle" />
              <strong>Subscription Deletion</strong>
            </h5>
          </CardHeader>
          <CardBody className="border-danger text-center">
            Are you sure you want to delete Subscription:{" "}
            <strong>{this.state.sub.name}</strong>
          </CardBody>
          <CardFooter className="border-danger text-danger text-center">
            <Button
              color="danger"
              className="mr-2"
              onClick={() => {
                this.apiDelete(
                  this.authen.getToken(),
                  config.endpoint,
                  this.props.match.params.projectname,
                  this.props.match.params.subname
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

    let subIconName = "envelope-open";

    if (this.state.sub.pushConfig.pushEndpoint !== "") {
      subIconName = "paper-plane";
    }

    return (
      <div>
        <NotificationContainer />
        <Row>
          <Col>
            <h2>Subscription Details</h2>
          </Col>
          <Col className="text-right">
            <Link
              className="btn btn-info  ml-1 mr-1"
              to={"/subscriptions/mod-acl" + this.state.sub.name}
            >
              <FontAwesomeIcon icon="user-lock" /> Modify ACL
            </Link>
            <a
              className="btn btn-danger  ml-1 mr-1"
              href={"/subscriptions/delete" + this.state.sub.name}
            >
              <FontAwesomeIcon icon="times" /> Delete Sub
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
                      <FontAwesomeIcon
                        className="ml-1 mr-1"
                        size="4x"
                        icon={subIconName}
                      />
                    </div>
                  </div>
                  <br />
                  <span className="text-center">
                    <h4>{getShortName(this.state.sub.name)}</h4>
                  </span>
                  <hr />
                  <span className="text-center d-block">
                    <strong>project:</strong>{" "}
                    {getProjectColorIcon(getProjectName(this.state.sub.name))}{" "}
                    {getProjectName(this.state.sub.name)}
                  </span>
                  <span className="text-center d-block">
                    <strong>full name:</strong>{" "}
                    <code>{this.state.sub.name}</code>
                  </span>
                  <span className="text-center d-block">
                    <strong>attached to topic:</strong>{" "}
                    <code>{this.state.sub.topic}</code>
                  </span>
                  { this.state.sub.pushConfig.pushEndpoint != "" && 
                  <span className="text-center d-block">
                    <strong>push endpoint:</strong>{" "}
                    <code>{this.state.sub.pushConfig.pushEndpoint}</code>
                  </span>
                  }
                   <hr />
                  {acl}
                </CardBody>
              </Card>
            </div>
            <div className="col-md-8 col-sm-12 col-xs-12">
              {willDelete}

              <Card>
                <CardHeader>
                  <strong>Metrics</strong>
                </CardHeader>
                <CardBody>{metrics}</CardBody>
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
              <div className="m-2 text-right">{willBack}</div>
            </div>
          </Row>
        </div>
      </div>
    );
  }
}

export default SubDetails;
