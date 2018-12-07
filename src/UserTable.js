import React from "react";
import User from "./User";
import Authen from "./Authen";
import argologoAnim from "./argologo_anim.svg";
import config from "./config";
import { Link } from "react-router-dom";
import ReactTable from "react-table";
import "react-table/react-table.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { library } from "@fortawesome/fontawesome-svg-core";
import {
  faCrown,
  faHeartbeat,
  faUser,
  faTimes,
  faPen,
  faList,
  faPlus,
  faCloudDownloadAlt,
  faCloudUploadAlt,
  faShieldAlt
} from "@fortawesome/free-solid-svg-icons";
library.add(
  faCrown,
  faCrown,
  faHeartbeat,
  faUser,
  faTimes,
  faPen,
  faList,
  faPlus,
  faCloudDownloadAlt,
  faCloudUploadAlt,
  faShieldAlt
);


const colors = [
  "#A6ACAF",
  "#616A6B",
  "#717D7E",
  "#616A6B",
  "#884EA0",
  "#7D3C98",
  "#283747",
  "#212F3D",
];

class UserList extends React.Component {
  constructor(props) {
    super(props);
    this.authen = new Authen(config.endpoint);
    this.projectColors = {}
    this.state = { users: [] };

    if (this.authen.isLogged()) {
      this.state = {
        users: this.apiGetData(this.authen.getToken(), config.endpoint)
      };
    } 
  }



  // Assign colors to unique projects found in users
  getProjectColors(uniqueProjects) {
    let projectColors ={}
    for (let pIndex in uniqueProjects)
    {
      let project = uniqueProjects[pIndex];
      if (project in config.project_colors) {
        projectColors[project] = config.project_colors[project];
      } else {
        projectColors[project]=colors[pIndex % colors.length];
      }
    
    }
    
    return projectColors;
  }

  // Get unique project list from user project assignments
  getDistinctProjects(users) {
    if (users===undefined) {
      return [];
    }
    let uniqueProjects = new Set();
    for (let user of users) {
      for (let project of user.projects) {
        uniqueProjects.add(project.project);
      }
    }

    return Array.from(uniqueProjects);
  }

  // get user data
  apiGetData(token, endpoint) {
    // If token or endpoint empty return
    if (token === "" || token === null || endpoint === "") {
      return;
    }
    // quickly construct request url
    let url = "https://" + endpoint + "/v1/users?key=" + token;
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
          return { users: [] };
        }
      })
      .then(json => this.setState({ users: json.users, token: token }))
      .catch(error => console.log(error));
  }

  // based on specific role return an appropriate fa icon
  getRoleIcon(role) {
    if (role === "consumer")
      return (
        <FontAwesomeIcon key={role} className="ml-1 mr-1" icon="cloud-download-alt" />
      );
    if (role === "publisher")
      return <FontAwesomeIcon key={role} className="ml-1 mr-1" icon="cloud-upload-alt" />;
    if (role === "project_admin")
      return <FontAwesomeIcon key={role} className="ml-1 mr-1 " icon="shield-alt" />;
    return null;
  }

  // pare projects json and produce a list of html span elements to represent project/role assignment
  beautifyProjects(projects, projectColors) {
    let prList = [];
    for (let project of projects) {
      let rolesList = [];
      for (let role of project.roles) {
        rolesList.push(this.getRoleIcon(role));
      }
      prList.push(
        <span key="project" className="mr-2 badge badge-dark" style={{backgroundColor:projectColors[project.project]}}>
          {project.project}
          <span className="ml-1">{rolesList}</span>
        </span>
      );
    }

    return prList;
  }

  // based on service role return an appropriate fa icon
  beautifyServiceRoles(serviceRoles) {
    

    if (serviceRoles.includes("service_admin")) {
      return (<FontAwesomeIcon className="service-crown" icon="crown" />);
    } else if (serviceRoles.includes("metric_viewer")) {
     return (
        <FontAwesomeIcon className="service-metric" icon="heartbeat" />
      );
    } 
      
    
    return (<FontAwesomeIcon icon="user" />);
    

  }

  render() {
    let userComps = [];
    let count = 0;
    const projectColors=this.getProjectColors(this.getDistinctProjects(this.state.users))
    const columns = [
      {
        Header: "#",
        accessor: "service_roles",
        Cell: props => (
          <span className="admin">
            {this.beautifyServiceRoles(props.value)}
          </span>
        ),
        width: 40,
        headerClassName: "list-header",
        className: "text-center"
      },
      {
        Header: "Name",
        accessor: "name",
        Cell: props => (
          <Link className="user-link" to={"/users/details/" + props.value}>
            {props.value}
          </Link>
        ),
        minWidth: 55,
        filterable: true,
        headerClassName: "list-header"
      },
      {
        Header: "Email",
        accessor: "email",
        minWidth: 40,
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
        Header: "Projects",
        accessor: "projects",
        Cell: props => (
          <span className="projects">{this.beautifyProjects(props.value,projectColors)}</span>
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
              to={"/users/details/" + props.value}
            >
              <FontAwesomeIcon icon="list" />
            </Link>
            <Link
              className="btn btn-light btn-sm ml-1 mr-1"
              to={"/users/update/" + props.value}
            >
              <FontAwesomeIcon icon="pen" />
            </Link>
            <Link
              className="btn btn-light btn-sm ml-1 mr-1"
              to={"/users/delete/" + props.value}
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

    const userHeading = (
      <div className="row  mb-2">
        <div className="col-2">
          <h2>Users</h2>
        </div>
        <div className="col">
          <Link className="btn btn-light" to="/users/create">
            <FontAwesomeIcon className="mr-2" icon="plus" size="lg" /> Create
            User
          </Link>
        </div>
      </div>
    );

    if (this.state.users === undefined) {
      return (
        <div>
          {userHeading}
          <div className="card text-center p-4">
            <img alt="argo admin ui" src={argologoAnim} />
            <h3>Loading data...</h3>
          </div>
        </div>
      );
    }

    for (let user of this.state.users) {
      userComps.push(<User key={count} item={user} />);
      count++;
    }
    return (
      <div>
        {userHeading}

        <div className="card p-4">
          <h4 className="pt-2 pb-2">List of users</h4>
          <ReactTable
            data={this.state.users}
            columns={columns}
            className="-striped -highlight"
            defaultPageSize={20}
          />
        </div>
      </div>
    );
  }
}

export default UserList;
