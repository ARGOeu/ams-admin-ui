import React, { Component } from "react";
import { Formik, Field, Form, ErrorMessage, FieldArray } from "formik";
import {
  NotificationContainer,
  NotificationManager
} from "react-notifications";

import Authen from "./Authen";
import { Button, Card } from "reactstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { library } from "@fortawesome/fontawesome-svg-core";
import {
  faExclamationTriangle,
  faUser,
  faCrown,
  faHeartbeat,
  faCloudDownloadAlt,
  faCloudUploadAlt,
  faShieldAlt
} from "@fortawesome/free-solid-svg-icons";
import DataManager from "./DataManager";
library.add(faExclamationTriangle, faUser, faCrown, faHeartbeat,  faCloudDownloadAlt,
  faCloudUploadAlt,faShieldAlt);

window.valid_projects = [];


function validate(values, other) {
  let errors = {};
  // email validation
  if (!values.email) {
    errors.email = "Required";
  } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(values.email)) {
    errors.email = "Invalid email address";
  }
  // name validation
  if (!values.name) {
    errors.name = "Required";
  } else if (!/^[A-Z0-9_-]+$/i.test(values.name)) {
    errors.name =
      "Invalid name (use only letters, numbers, underscores and dashes)";
  }

  if (!values.service_admin) {
    let errListProjects = [];
  values.projects.forEach(project => {
    let pErrors = {};
    if (!project.project) pErrors.project = "Required";
    if (!project.roles) pErrors.roles = "Required";

    if (project.roles) {
      // check each role validity
      let roles = project.roles.split(",");

      let errorRoles = [];

      for (let role of roles) {
        if (!(["project_admin", "consumer", "publisher"].indexOf(role.trim()) > -1)) {
          errorRoles.push(role);
        }
      }

      if (errorRoles.length > 0) {
        pErrors.roles = "Roles " + errorRoles.toString() + " don't exist!";
      }
    }

    errListProjects.push(pErrors);
  });

  // check if project errors are indeed empty
  let empty = true;
  for (let item of errListProjects) {
    if (!(Object.keys(item).length === 0 && item.constructor === Object)) {
      empty = false;
    }
  }

  if (!empty) {
    errors.projects = errListProjects;
  }
  }

  

  return errors;
}

class ProjectMemberUpdate extends Component {
  constructor(props) {
    super(props);
    this.authen = new Authen();
    this.DM = new DataManager(this.authen.getEndpoint(), this.authen.getToken());
    this.doCreateUser.bind(this);

    if (this.props.action === "create") {
      this.state = {
        action: this.props.action, // create or update
        projects: [],
        roles: ["project_admin", "consumer", "producer"],
        initialValues: {
          name: "",
          email: "",
          service_admin: false,
          projects: [{ project: "", roles: "" }]
        }
      };
    } else {
      this.state = {
        action: this.props.action, // create or update
        projects: [],
        roles: ["project_admin", "consumer", "producer"],
        initialValues: this.apiGetData(
          this.props.match.params.projectname,
          this.props.match.params.username
        )
      };
    }

    this.apiGetProjects(this.authen.getToken(), this.authen.getEndpoint());
  }

  apiGetData(project, username) {
    this.DM.projectMemberDetailsGet(project, username).then(r => {
      if (r.done){
        
        let sa_value = false;
        if (r.data.service_roles.length > 0) sa_value = true; 

        let initVal = {
          name: r.data.name,
          email: r.data.email,
          service_admin: sa_value,
          projects: [{ project: "", roles: "" }]
        };

        if (r.data.projects.length > 0) {
          let projectList = [];

          for (let project of r.data.projects) {
            projectList.push({
              project: project.project,
              roles: project.roles.join()
            });
          }
          initVal.projects = projectList;
        }

        this.setState({ initialValues: initVal });
      }
    })

  }

  apiGetProjects() {
    this.DM.projectGet().then( r =>{
      if (r.done){
        let projects = [];
        for (let project of r.data.projects) {
          projects.push(project.name);
        }

        window.valid_projects = projects;
        this.setState({ projects: projects });
      }

    })
  }

  prepUser(data) {
    let name = data.name;
    let body = { email: data.email, name: data.name };

    if (data.service_admin) {
      body["service_roles"] = ["service_admin"]
    } else {
      let projects = [];
      for (let project of data.projects) {
        
        projects.push({
          project: project.project,
          roles: project.roles.replace(/\s/g,"").split(",")
        });
      }
      body["projects"] = projects;
    }
    return {name: name, body: body}
  }

  doCreateUser(data) {
    let comp = this;
    let {name, body} = this.prepUser(data);
    this.DM.projectMemberCreate(this.props.match.params.projectname, name, body).then(r => {
      if (r.done){
        NotificationManager.info("Member Added!", null, 1000);
        setTimeout(()=>{comp.props.history.push("/projects/"+this.props.match.params.projectname+"/members/details/" + name)},1000)
      } else {
        NotificationManager.error("Member Addition Failed...", null, 1000);
      }
    })
  }

  doUpdateUser(data) {
    let comp = this;
    let {name, body} = this.prepUser(data);
    this.DM.projectMemberUpdate(this.props.match.params.projectname, this.props.match.params.username, body).then(r => {
      if (r.done){
        NotificationManager.info("Member Updated!", null, 1000);
          setTimeout(()=>{comp.props.history.push("/projects/"+this.props.match.params.projectname+"/members/details/" + name)},1000)
        } else {
          NotificationManager.error("Member Update Failed...", null, 1000);
        }
      
    })
  }

  render() {
    let actionOnUser = null;

    if (this.state.action === "create") {
      actionOnUser = "Create User";
    } else if (this.state.action === "update") {
      actionOnUser = "Update User";
    }

    if (this.state.initialValues === undefined) {
      return <h1>Loading ...</h1>;
    }

    let role = "";
    this.state.initialValues.projects.forEach((item) => {
      if (item.project === this.props.match.params.projectname) {
        role = item.roles;
      }
    });

    return (
      <div>
        <NotificationContainer />

        <div className="row mb-2">
          <div className="col-2">
            <h2>{actionOnUser}</h2>
          </div>
        </div>
        <Card className="p-4">
          <Formik
            initialValues={{
                name: this.state.initialValues.name  || "",
                email: this.state.initialValues.email || "",
                projects: [{ project: this.props.match.params.projectname,
                  roles: role}]
              }
            }
            validate={validate}
            onSubmit={values => {
              // request to backend to create user
              if (this.state.action === "create") {
                this.doCreateUser(values);
              } else {
                this.doUpdateUser(values);
              }
            }}
            render={({ values, errors, touched }) => (
              <Form>
                <div className="form-group">
                  <label htmlFor="name">Name</label>
                  <Field
                    name="name"
                    className="form-control"
                    disabled={this.state.initialValues.name ? true : false}
                  />
                  <small className="field-error form-text text-danger">
                    <ErrorMessage name="name" />
                  </small>
                </div>
                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <Field
                    name="email"
                    type="email"
                    className="form-control"
                    disabled={this.state.initialValues.email ? true : false}
                  />
                  <small className="field-error form-text text-danger">
                    <ErrorMessage name="email" />
                  </small>
                </div>
                {!values.service_admin && (
                  <div className="form-group border p-3 col">
                    <FieldArray
                      name="projects"
                      render={({ insert, remove, push }) => (
                        <div>
                          <div className="mb-2">
                            <label className="mr-3">
                              Project/Role membership:
                            </label>
                          </div>
                          {values.projects.length > 0 &&
                            values.projects.map((projects, index) => (
                              <div className="row form-row" key={index}>
                                <div className="form-group col">
                                  <label
                                    className="sr-only"
                                    htmlFor={`projects.${index}.project`}
                                  >
                                    Project:
                                  </label>
                                  <div className="input-group mb-2 mr-sm-2">
                                    <div className="input-group-prepend">
                                      <div className="input-group-text">
                                        Project:
                                      </div>
                                    </div>
                                    <Field
                                      name={`projects.${index}.project`}
                                      type="text"
                                      disabled
                                      className="form-control"
                                    />
                                  </div>
                                  <ErrorMessage
                                    name={`projects.${index}.project`}
                                    component="div"
                                    className="field-error form-text text-danger"
                                  />
                                </div>
                                <div className="form-group col">
                                  <label
                                    className="sr-only"
                                    htmlFor={`projects.${index}.roles`}
                                  >
                                    Roles:
                                  </label>
                                  <div className="input-group mb-2 mr-sm-2">
                                    <div className="input-group-prepend">
                                      <div className="input-group-text">
                                        Roles:
                                      </div>
                                    </div>
                                    <Field
                                      name={`projects.${index}.roles`}
                                      className="form-control"
                                      type="text"
                                    />
                                  </div>
                                  <ErrorMessage
                                    name={`projects.${index}.roles`}
                                    component="div"
                                    className="field-error form-text text-danger"
                                  />
                                </div>
                                <div className="form-group col">
                                  <button
                                    type="button"
                                    className="btn btn-danger"
                                    onClick={() => remove(index)}
                                  >
                                    X
                                  </button>
                                </div>
                              </div>
                            ))}
                        </div>
                        
                        
                      )}
                    />
                    <div>
                        <strong>Available roles:</strong>
                        <span className="border p-2 mx-2 rounded"><FontAwesomeIcon className="ml-1 mr-1" icon="shield-alt" /> project admin</span>
                        <span className="border p-2 mx-2 rounded"><FontAwesomeIcon className="ml-1 mr-1" icon="cloud-upload-alt" /> publisher
                        </span>
                        <span className="border p-2 mx-2 rounded"> <FontAwesomeIcon className="ml-1 mr-1" icon="cloud-download-alt" /> consumer</span> 
                        </div>
                  </div>
                )}
                <button type="submit" className="btn btn-success">
                  {actionOnUser}
                </button>
                <span> </span>
                <Button type="button"
                  onClick={() => {
                    this.props.history.goBack();
                  }}
                  className="btn btn-dark"
                >
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

export default ProjectMemberUpdate;
