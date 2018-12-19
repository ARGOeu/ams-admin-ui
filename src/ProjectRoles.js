import React from "react";

class ProjectRoles extends React.Component {

  render() {

    let projectRows = [];

    for (let project of this.props.projects){
        let roleSpan=[]
        for (let role of project.roles){
            roleSpan.push(<span className="badge badge-info">{role}</span>)
        }
        let projectSpan = <strong className="mr-2">{project.project}:</strong>;
        projectRows.push(<div className="border p-2 mb-2 rounded form-control-inline">{projectSpan}{roleSpan}</div>)
    }

    return (
      <div className="form-group">
        <h6>Projects (Roles):</h6>
        {projectRows}
      </div>
    );
  }
}

export default ProjectRoles;
