import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { library } from "@fortawesome/fontawesome-svg-core";
import config from './config'
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


// const colors = [
//   "#A6ACAF",
//   "#616A6B",
//   "#717D7E",
//   "#616A6B",
//   "#884EA0",
//   "#7D3C98",
//   "#283747",
//   "#212F3D",
// ];

class ProjectRoles extends React.Component {

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
        let color = "grey";
        if  (project.project in projectColors){
          color = projectColors[project.project];
        }
        prList.push(
          <span key={project.project} className="mr-2 badge badge-dark" style={{backgroundColor:color}}>
            {project.project}
            <span className="ml-1">{rolesList}</span>
          </span>
        );
      }
  
      return prList;
    }

  render() {
    

    return (
      <div>
        <strong>Projects (Roles): </strong>
        <span className="projects">{this.beautifyProjects(this.props.projects,config.project_colors)}</span>
      </div>
    );
  }
}

export default ProjectRoles;
