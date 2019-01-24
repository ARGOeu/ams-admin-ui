import React, { Component } from "react";
import { Formik, Field, Form, ErrorMessage } from "formik";
import {
  NotificationContainer,
  NotificationManager
} from "react-notifications";
import config from "./config";
import Authen from "./Authen";
import {Button, Card} from "reactstrap"
import DataManager from "./DataManager";

window.valid_projects = [];



function validate(values, other) {
  let errors = {};

  // name validation
  if (!values.name) {
    errors.name = "Required";
  } else if (!/^[A-Z0-9_-]+$/i.test(values.name)) {
    errors.name =
      "Invalid name (use only letters, numbers, underscores and dashes)";
  } else if (values.action === "create" && window.valid_projects.indexOf(values.name) > -1) {
    errors.name = 
      "Project name already exists. Choose another one";
  }




  return errors;
}

class CreateProject extends Component {
  constructor(props) {
    super(props);
    this.authen = new Authen(config.endpoint);
    this.DM = new DataManager(config.endpoint, this.authen.getToken());
    this.doCreateProject.bind(this);

    if (this.props.action === "create") {
      this.state = {
        action: this.props.action, // create or update
        projects: [],
        roles: ["project_admin", "consumer", "producer"],
        initialValues: {
          name: "",
          description: "",
          action: "create"
        }
      };
    } else {
      this.state = {
        action: this.props.action, // create or update
        project: null,
        projects: [],
        roles: ["project_admin", "consumer", "producer"],
        initialValues: this.apiGetData(
          this.props.match.params.projectname
        )
      };
    }

    this.apiGetProjects(this.authen.getToken(), config.endpoint);
  }

  apiGetData(projectname) {

    this.DM.projectGet(projectname).then(r =>{
      if (r.done){
        let initVal = {
          name: r.data.name,
          description: r.data.description,
          action: "update"
        };
        

        this.setState({ initialValues: initVal });
      }
    })

  }

  apiGetProjects() {
    this.DM.projectGet().then(r => {
      if (r.done) {
        let projects = [];
        for (let project of r.data.projects) {
          projects.push(project.name);
        }

        window.valid_projects = projects;
        this.setState({ projects: projects });
      }
    })
  }

  doCreateProject(data) {
    let comp = this;
    let name = data.name;
    let body = { description: data.description };

    this.DM.projectCreate(name,body).then(r=>{
      if (r.done){
        NotificationManager.info("Project Created!", null, 1000);
        setTimeout(()=>{comp.props.history.push("/projects/details/" + name)},1000)
      } else {
        NotificationManager.error("Project Creation Failed...", null, 1000);
      }
    })

  }

  doUpdateProject(data) {
    let comp = this;
    let name = data.name;
    let body = { description: data.description };

    this.DM.projectUpdate(name,body).then(r=>{
      if (r.done){
        NotificationManager.info("Project Update!", null, 1000);
        setTimeout(()=>{comp.props.history.push("/projects/details/" + name)},1000)
      } else {
        NotificationManager.error("Project Update Failed...", null, 1000);
      }
    })

  }

  render() {
    let actionOnProject = null;

    if (this.state.action === "create") {
      actionOnProject = "Create Project";
    } else if (this.state.action === "update") {
      actionOnProject = "Update Project";
    }

    if (this.state.initialValues===undefined){
      return <h1>Loading ...</h1>
    }

    

    return (

     

      <div>
        <NotificationContainer />
        <div className="row mb-2">
          <div className="col-2">
            <h2>{actionOnProject}</h2>
          </div>
        </div>
        <Card className="p-4" >
        <Formik
          initialValues={this.state.initialValues || {name:"",email:"",projects:[{project:"",roles:""}]}}
          validate={validate}
          onSubmit={values => {
            // request to backend to create project
            if (this.state.action === "create") {
              this.doCreateProject(values);
            } else {
              this.doUpdateProject(values);
            }
          }}
          render={({ values, errors, touched }) => (
            <Form>
              <div className="form-group">
                <label htmlFor="name">Name</label>
                
                <Field name="name" className="form-control" disabled={(this.state.initialValues.action==="update")}/>
                <small className="field-error form-text text-danger">
                  <ErrorMessage name="name" />
                </small>
              </div>
              <div className="form-group">
                <label htmlFor="description">Description</label>
                <Field name="description" type="description" className="form-control" />
                <small className="field-error form-text text-danger">
                  <ErrorMessage name="decsription" />
                </small>
              </div>
              <button type="submit" className="btn btn-success">
                {actionOnProject}
              </button>
              <span> </span>
              <Button onClick={()=>{this.props.history.goBack()}} className="btn btn-dark">
                Cancel
              </Button>
            </Form>
          )}
        />
        </Card>
      </div>
    );
  }
}

export default CreateProject;
