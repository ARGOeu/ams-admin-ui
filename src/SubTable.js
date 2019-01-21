import React from "react";
import Authen from "./Authen";
import argologoAnim from "./argologo_anim.svg";
import config from "./config";
import { Link } from "react-router-dom";
import Autocomplete from "react-autocomplete";
import ReactTable from "react-table";
import "react-table/react-table.css";
import { Card, CardBody } from "reactstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { library } from "@fortawesome/fontawesome-svg-core";
import { faDiceD6, faEnvelopeOpen, faUserLock, faPaperPlane } from "@fortawesome/free-solid-svg-icons";
library.add(faDiceD6, faEnvelopeOpen, faPaperPlane, faUserLock);

function getProjectColorIcon(projectName) {
  let color = "#616A6B";
  if (projectName in config.project_colors) {
    color = config.project_colors[projectName];
  }

  return <FontAwesomeIcon icon="dice-d6" style={{ color: color }} />;
}

class SubTable extends React.Component {


  constructor(props) {
    super(props);
    this.authen = new Authen(config.endpoint);
    this.projectColors = {};
    this.state = { projects: [], subs: [], value: "" };

  

    if (this.authen.isLogged()) {
      this.state = {
        projects: this.apiGetProjects(this.authen.getToken(), config.endpoint),
        value: window.location.hash.substring(1),
        subs: this.apiGetSubs(
          this.authen.getToken(),
          config.endpoint,
          window.location.hash.substring(1)
        )
      };
    }
  }

  getProjects() {
    if (this.state.projects === undefined) return [];
    return this.state.projects;
  }

  matchProjects(state, value) {
    return state.name.toLowerCase().indexOf(value.toLowerCase()) !== -1;
  }

  loadProjectSubs(value) {



    // if project value exists in known projects
    if (this.state.projects.indexOf(value)) {
      this.setState({
        subs: this.apiGetSubs(
          this.authen.getToken(),
          config.endpoint,
          value
        )
      });
      window.location.hash = value;
    }
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

  // get subscription data
  apiGetSubs(token, endpoint, project) {
    // If token or endpoint empty return
    if (token === null || endpoint === "") {
      return;
    }
    // quickly construct request url
    let url =
      "https://" +
      endpoint +
      "/v1/projects/" +
      project +
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
      .then(json => this.setState({ subs: json.subscriptions }))
      .catch(error => console.log(error));
  }

  render() {
    const columns = [
      {
        Header: "#",
        accessor: "pushConfig",
        Cell: props => {
          if (props.value.pushEndpoint === ""){
            return <FontAwesomeIcon
            icon="envelope-open"
            style={{ color: "rgb(97, 106, 107)" }}
          />
          } else {
            return <FontAwesomeIcon
            icon="paper-plane"
            style={{ color: "rgb(97, 106, 107)" }}
          />
          }
        }
        ,
        width: 40,
        headerClassName: "list-header",
        className: "text-center"
      },
      {
        Header: "Name",
        accessor: "name",
        Cell: props => (
          <Link className="item-link" to={"/subs/details" + props.value}>
            {props.value.split("/")[4]}
          </Link>
        ),
        minWidth: 20,

        headerClassName: "list-header"
      },
      {
        Header: "Full Topic",
        accessor: "topic",
        Cell: props => (
          <Link className="item-link" to={"/topics/details" + props.value}>
            {props.value}
          </Link>
        ),
        minWidth: 40,

        headerClassName: "list-header"
      },
      {
        Header: "Full Sub. Name",
        accessor: "name",
        Cell: props => (
          <Link className="item-link" to={"/subs/details" + props.value}>
            {props.value}
          </Link>
        ),
        minWidth: 80,

        headerClassName: "list-header"
      },
      {
        Header: "Actions",
        accessor: "name",
        Cell: props => (
          <div className="edit-buttons">
            <Link
              className="btn btn-light btn-sm ml-1 mr-1"
              to={"/subs/details" + props.value}
            >
              <FontAwesomeIcon icon="list" />
            </Link>
            <Link
              className="btn btn-light btn-sm ml-1 mr-1"
              to={"/subs/mod-acl" + props.value}
            >
              <FontAwesomeIcon icon="user-lock" />
            </Link>
            <Link
              className="btn btn-light btn-sm ml-1 mr-1"
              to={"/subs/delete/" + props.value}
            >
              <FontAwesomeIcon icon="times" />
            </Link>
          </div>
        ),
        width: 130,
        headerClassName: "list-header",
        className: "text-center"
      }
    ];

    const projectHeading = (
      <div>
        <div className="row  mb-2">
          <div className="col-2">
            <h2>Subscriptions</h2>
          </div>
          <div className="col">
            <Link className="btn btn-light" to={"/topics/create#"+this.state.value}>
              <FontAwesomeIcon className="mr-2" icon="plus" size="lg" /> Create
              Subscription
            </Link>
          </div>
        </div>

        <Card className="mb-2">
          <CardBody>
            <div className="row">
              <div className="col-8">
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
                   
                    }}
                    onSelect={value => {
                      this.setState({ value });
                      this.loadProjectSubs(value);
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
              </div>
              <div className="col-4 p-2">
                Type a project name to list its subscriptions
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    );

    if (this.state.projects === undefined) {
      return (
        <div>
          {projectHeading}
          <div className="card text-center p-4">
            <img alt="argo admin ui" src={argologoAnim} />
            <h3>Loading data...</h3>
          </div>
        </div>
      );
    }

    return (
      <div>
        {projectHeading}
        <div className="card p-4">
          <h4 className="pt-2 pb-2">List of subscriptions</h4>
          <ReactTable
            data={this.state.subs}
            columns={columns}
            className="-striped -highlight"
            defaultPageSize={20}
          />
        </div>
      </div>
    );
  }
}

export default SubTable;