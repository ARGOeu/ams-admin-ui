import React from "react";
import Authen from "./Authen";
import argologoAnim from "./argologo_anim.svg";
import config from "./config";
import { Link } from "react-router-dom";
import ReactTable from "react-table";
import "react-table/react-table.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { library } from "@fortawesome/fontawesome-svg-core";
import {
  faDiceD6,
} from "@fortawesome/free-solid-svg-icons";
library.add(
  faDiceD6,
);



function getProjectColorIcon(projectName){
  let color="#616A6B";
  if (projectName in config.project_colors){
    color = config.project_colors[projectName];
  }

  return <FontAwesomeIcon icon="dice-d6" style={{color:color}}/>
}


class ProjectTable extends React.Component {
  constructor(props) {
    super(props);
    this.authen = new Authen(config.endpoint);
    this.projectColors = {}
    this.state = { projects: [] };

    if (this.authen.isLogged()) {
      this.state = {
        projects: this.apiGetProjects(this.authen.getToken(), config.endpoint)
      };
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

  
  render() {
    
    
    const columns = [
      {
        Header: "#",
        accessor: "name",
        Cell: props => (getProjectColorIcon(props.value)),
        width: 40,
        headerClassName: "list-header",
        className: "text-center"
      },
      {
        Header: "Name",
        accessor: "name",
        Cell: props => (
          <Link className="item-link" to={"/projects/details/" + props.value}>
            {props.value}
          </Link>
        ),
        minWidth: 55,
        filterable: true,
        headerClassName: "list-header"
      },
      {
        Header: "Date",
        accessor: "modified_on",
        Cell: props => (
          <span className="date-format">{props.value.split("T")[0]}</span>
        ),
        width: 100,
        headerClassName: "list-header"
      },
      {
        Header: "Description",
        accessor: "description",
        Cell: props => (
          <span>{props.value}</span>
        ),
        headerClassName: "list-header"
      },
      {
        Header: "Actions",
        accessor: "name",
        Cell: props => (
          <div className="edit-buttons">
            <Link
              className="btn btn-light btn-sm ml-1 mr-1"
              to={"/projects/details/" + props.value}
            >
              <FontAwesomeIcon icon="list" />
            </Link>
            <Link
              className="btn btn-light btn-sm ml-1 mr-1"
              to={"/projects/update/" + props.value}
            >
              <FontAwesomeIcon icon="pen" />
            </Link>
            <Link
              className="btn btn-light btn-sm ml-1 mr-1"
              to={"/projects/delete/" + props.value}
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
      <div className="row  mb-2">
        <div className="col-2">
          <h2>Projects</h2>
        </div>
        <div className="col">
          <Link className="btn btn-light" to="/projects/create">
            <FontAwesomeIcon className="mr-2" icon="plus" size="lg" /> Create
            Project
          </Link>
        </div>
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
          <h4 className="pt-2 pb-2">List of projects</h4>
          <ReactTable
            data={this.state.projects}
            columns={columns}
            className="-striped -highlight"
            defaultPageSize={20}
          />
        </div>
      </div>
    );
  }
}

export default ProjectTable;
