import React from "react";
import Authen from "./Authen";
import config from "./config";
import NumberFormat from 'react-number-format';
import {
  BarChart,
  CartesianGrid,
  Bar,
  XAxis,
  YAxis,
  Tooltip
} from "recharts";
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
import { NotificationContainer } from "react-notifications";
import {
  faDiceD6,
  faEnvelope,
  faEnvelopeOpen,
  faUser,
  faUserLock
} from "@fortawesome/free-solid-svg-icons";
library.add(faDiceD6, faEnvelope, faEnvelopeOpen, faUser, faUserLock);

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

class TopicDetails extends React.Component {
  constructor(props) {
    super(props);
    this.authen = new Authen(config.endpoint);
    this.state = { topics: null, acl: null };

    this.apiGetData.bind(this);

    if (this.authen.isLogged()) {
      this.state = {
        toDelete: this.props.toDelete,
        topic: this.apiGetData(
          this.authen.getToken(),
          config.endpoint,
          this.props.match.params.projectname,
          this.props.match.params.topicname
        ),
        acl: this.apiGetAcl(
          this.authen.getToken(),
          config.endpoint,
          this.props.match.params.projectname,
          this.props.match.params.topicname
        ),
        metrics: this.apiGetMetrics(
          this.authen.getToken(),
          config.endpoint,
          this.props.match.params.projectname,
          this.props.match.params.topicname
        )
      };
    } else {
      this.state = { topic: null };
    }
  }

  apiGetData(token, endpoint, projectName, topicName) {
    // If token or endpoint empty return
    if (token === "" || token === null || endpoint === "" || topicName === "") {
      return;
    }
    // quickly construct request url
    let url =
      "https://" +
      endpoint +
      "/v1/projects/" +
      projectName +
      "/topics/" +
      topicName +
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
          return { topic: [] };
        }
      })
      .then(json => {
        this.setState({ topic: json });
      })
      .catch(error => console.log(error));
  }

  apiGetMetrics(token, endpoint, projectName, topicName) {
    // If token or endpoint empty return
    if (token === "" || token === null || endpoint === "" || topicName === "") {
      return;
    }
    // quickly construct request url
    let url =
      "https://" +
      endpoint +
      "/v1/projects/" +
      projectName +
      "/topics/" +
      topicName +
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

  apiGetAcl(token, endpoint, projectName, topicName) {
    // If token or endpoint empty return
    if (token === "" || token === null || endpoint === "" || topicName === "") {
      return;
    }
    // quickly construct request url
    let url =
      "https://" +
      endpoint +
      "/v1/projects/" +
      projectName +
      "/topics/" +
      topicName +
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
    if (this.state.topic === undefined) {
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
          latestDate = item.timeseries[0].timestamp
          let metricItem = <Card key={item.metric} className="col-4 p-2 rounded">
            <CardBody className="text-center">
             
              
                <h3>
                  <strong>
                  
                  <NumberFormat value={item.timeseries[0].value} displayType={'text'} thousandSeparator={true} />
                  </strong>
                </h3>
                <br/><h6><abbr title={item.description}>{item.metric.split(".")[1]}</abbr></h6>
                <br/>
                
              
            </CardBody>
          </Card>

          smallMetricList.push(metricItem)

        }
      }
      metrics = <div>
          <div class="row p-3">{smallMetricList}</div>
          
          <div class="row text-right">
            <div class="col-12"><small>{latestDate}</small></div>
          </div>
          <br/>
          <div>{metricList}</div>
        </div>;
    }

    if (this.state.toDelete) {
      willDelete = (
        <Card className="border-danger mb-2">
          <CardHeader className="border-danger text-danger text-center">
            <h5>
              <FontAwesomeIcon className="mx-3" icon="exclamation-triangle" />
              <strong>Topic Deletion</strong>
            </h5>
          </CardHeader>
          <CardBody className="border-danger text-center">
            Are you sure you want to delete Topic:{" "}
            <strong>{this.state.topic.name}</strong>
          </CardBody>
          <CardFooter className="border-danger text-danger text-center">
            <Button color="danger" className="mr-2" onClick={() => {}}>
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
            <h2>Topic Details</h2>
          </Col>
          <Col className="text-right">
            <Link
              className="btn btn-info  ml-1 mr-1"
              to={"/topics/update-acl/" + this.state.topic.name}
            >
              <FontAwesomeIcon icon="user-lock" /> Modify ACL
            </Link>
            <a
              className="btn btn-danger  ml-1 mr-1"
              href={"/topics/delete/" + this.state.topic.name}
            >
              <FontAwesomeIcon icon="times" /> Delete Topic
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
                        icon="envelope"
                      />
                    </div>
                  </div>
                  <br />
                  <span className="text-center">
                    <h4>{getShortName(this.state.topic.name)}</h4>
                  </span>
                  <hr />
                  <span className="text-center d-block">
                    <strong>project:</strong>{" "}
                    {getProjectColorIcon(getProjectName(this.state.topic.name))}{" "}
                    {getProjectName(this.state.topic.name)}
                  </span>
                  <span className="text-center d-block">
                    <strong>full name:</strong>{" "}
                    <code>{this.state.topic.name}</code>
                  </span>
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

export default TopicDetails;
