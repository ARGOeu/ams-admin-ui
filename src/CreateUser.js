import React, { Component } from "react";
import { Formik, Field, Form, ErrorMessage, FieldArray } from "formik";
import {
  NotificationContainer,
  NotificationManager
} from "react-notifications";
import config from "./config";
import Authen from "./Authen";
import { Button, Card } from "reactstrap";

window.valid_projects = [];

function sendData(url = ``, data = {}, method = "POST") {
  return fetch(url, {
    method: method,
    mode: "cors",
    cache: "no-cache",
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json; charset=utf-8"
    },
    redirect: "follow",
    referrer: "no-referrer",
    body: JSON.stringify(data)
  }).then(response => {
    if (response.status === 200) {
      NotificationManager.info("User Created", null, 1000);
      return true;
    } else {
      NotificationManager.info("Issues with user creation", null, 1000);
      return false;
    }
  });
}

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

  let errListProjects = [];
  values.projects.forEach(project => {
    let pErrors = {};
    if (!project.project) pErrors.project = "Required";
    if (!project.roles) pErrors.roles = "Required";

    if (project.project) {
      // check projectv validity
      if (!(window.valid_projects.indexOf(project.project) > -1)) {
        pErrors.project = "Project " + project.project + " doesn't exist";
      }
    }

    if (project.roles) {
      // check each role validity
      let roles = project.roles.split(",");

      let errorRoles = [];

      for (let role of roles) {
        if (!(["project_admin", "consumer", "publisher"].indexOf(role) > -1)) {
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

  return errors;
}

class CreateUser extends Component {
  constructor(props) {
    super(props);
    this.authen = new Authen(config.endpoint);
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
          this.authen.getToken(),
          config.endpoint,
          this.props.match.params.username
        )
      };
    }

    this.apiGetProjects(this.authen.getToken(), config.endpoint);
  }

  apiGetData(token, endpoint, username) {
    // If token or endpoint empty return
    if (token === "" || token === null || endpoint === "" || username === "") {
      return;
    }
    // quickly construct request url
    let url = "https://" + endpoint + "/v1/users/" + username + "?key=" + token;
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
      .then(json => {
        let initVal = {
          name: json.name,
          email: json.email,
          service_admin: json.service_admin,
          projects: [{ project: "", roles: "" }]
        };

        if (json.projects.length > 0) {
          let projectList = [];

          for (let project of json.projects) {
            projectList.push({
              project: project.project,
              roles: project.roles.join()
            });
          }
          initVal.projects = projectList;
        }

        this.setState({ initialValues: initVal });
      })
      .catch(error => console.log(error));
  }



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
      .then(json => {
        let projects = [];
        for (let project of json.projects) {
          projects.push(project.name);
        }

        window.valid_projects = projects;
        this.setState({ projects: projects });
      })
      .catch(error => console.log(error));
  }

  doCreateUser(data) {
    let name = data.name;
    let body = { email: data.email };

    if (data.service_admin) {
      body["service_roles"] = true;
    } else {
      let projects = [];
      for (let project of data.projects) {
        projects.push({
          project: project.project,
          roles: project.roles.split(",")
        });
      }
      body["projects"] = projects;
    }

    // quickly construct request url
    let url =
      "https://" +
      config.endpoint +
      "/v1/users/" +
      name +
      "?key=" +
      this.authen.getToken();

    sendData(url, body, "POST")
      .then(done => {
        console.log(done);
        if (done) {
          window.location = "/users/details/" + name;
        }
      })
      .catch(error => console.error(error));
  }

  doUpdateUser(data) {
    let name = data.name;
    let body = { email: data.email };

    if (data.service_admin) {
      body["service_roles"] = true;
    } else {
      let projects = [];
      for (let project of data.projects) {
        projects.push({
          project: project.project,
          roles: project.roles.split(",")
        });
      }
      body["projects"] = projects;
    }

    // quickly construct request url
    let url =
      "https://" +
      config.endpoint +
      "/v1/users/" +
      name +
      "?key=" +
      this.authen.getToken();

    sendData(url, body, "PUT")
      .then(done => {
        console.log(done);
        if (done) {
          window.location = "/users/details/" + name;
        }
      })
      .catch(error => console.error(error));
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
            initialValues={
              this.state.initialValues || {
                name: "",
                email: "",
                projects: [{ project: "", roles: "" }]
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
                  <Field name="name" className="form-control" />
                  <small className="field-error form-text text-danger">
                    <ErrorMessage name="name" />
                  </small>
                </div>
                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <Field name="email" type="email" className="form-control" />
                  <small className="field-error form-text text-danger">
                    <ErrorMessage name="email" />
                  </small>
                </div>
                <div className="form-check">
                  <Field
                    name="service_admin"
                    className="form-check-input"
                    type="checkbox"
                  />
                  <label htmlFor="service_admin">Service Admin</label>
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
                            <button
                              type="button"
                              className="btn btn-success"
                              onClick={() => push({ project: "", roles: "" })}
                            >
                              Assign project/roles
                            </button>
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
                  </div>
                )}
                <button type="submit" className="btn btn-success">
                  {actionOnUser}
                </button>
                <span> </span>
                <Button
                  onClick={() => {
                    window.history.back();
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

export default CreateUser;
