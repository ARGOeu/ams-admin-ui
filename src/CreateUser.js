import React, { Component } from "react";
import { Formik, Field, Form, ErrorMessage, FieldArray } from "formik";
import {
  NotificationContainer,
  NotificationManager,
} from "react-notifications";
import Autocomplete from "react-autocomplete";
import config from "./config";
import Authen from "./Authen";
import { Button, Card, Input } from "reactstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { library } from "@fortawesome/fontawesome-svg-core";
import {
  faExclamationTriangle,
  faUser,
  faCrown,
  faHeartbeat,
  faCloudDownloadAlt,
  faCloudUploadAlt,
  faShieldAlt,
} from "@fortawesome/free-solid-svg-icons";
import DataManager from "./DataManager";
library.add(
  faExclamationTriangle,
  faUser,
  faCrown,
  faHeartbeat,
  faCloudDownloadAlt,
  faCloudUploadAlt,
  faShieldAlt
);

window.valid_projects = [];

function getProjectColorIcon(projectName) {
  let color = "#616A6B";
  if (projectName in config.project_colors) {
    color = config.project_colors[projectName];
  }

  return <FontAwesomeIcon icon="dice-d6" style={{ color: color }} />;
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

  return errors;
}

class CreateUser extends Component {
  constructor(props) {
    super(props);
    this.authen = new Authen();
    this.DM = new DataManager(
      this.authen.getEndpoint(),
      this.authen.getToken()
    );
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
          projects: [{ project: "", roles: "consumer" }],
        },
        values: [{project: "", roles: "consumer"}],
      };
    } else {
      this.state = {
        action: this.props.action, // create or update
        projects: [],
        roles: ["project_admin", "consumer", "producer"],
        initialValues: this.apiGetData(this.props.match.params.username),
        values: [{project: "", roles: "consumer"}],
      };
    }

    this.apiGetProjects(this.authen.getToken(), this.authen.getEndpoint());
  }

  apiGetData(username) {
    this.DM.userGet(username).then((r) => {
      if (r.done) {
        let sa_value = false;
        if (r.data.service_roles.length > 0) sa_value = true;

        let initVal = {
          name: r.data.name,
          email: r.data.email,
          service_admin: sa_value,
          projects: [{ project: "", roles: "" }],
        };

        if (r.data.projects.length > 0) {
          let projectList = [];

          for (let project of r.data.projects) {
            projectList.push({
              project: project.project,
              roles: project.roles.join(),
            });
          }
          initVal.projects = projectList;
        }

        this.setState({ initialValues: initVal });
      }
    });
  }

  matchProjects(state, value) {
    if (value["project"] !== undefined) {
      return (
        state.name.toLowerCase().indexOf(value["project"].toLowerCase()) !== -1
      );
    }
    return state.name.toLowerCase().indexOf(value.toLowerCase()) !== -1;
  }

  apiGetProjects() {
    if (this.authen.isServiceAdmin()) {
      this.DM.projectGet().then((r) => {
        if (r.done) {
          this.setState({ projects: r.data.projects });
        }
      });
      return;
    } else if (this.authen.isProjectAdmin()) {
      // get project list from allowed projects
      let allowedProjects = this.authen.getProjectsPerRole()["project_admin"];
      let results = [];
      for (let project of allowedProjects)
        results.push({
          name: project,
          created_on: "",
          modified_on: "",
        });
      return results;
    }

    return [];
  }

  prepUser(data) {
    let name = data.name;
    let body = { email: data.email };

    if (data.service_admin) {
      body["service_roles"] = ["service_admin"];
    } else {
      let projects = [];
      for (let project of data.projects) {
        projects.push({
          project: project.project,
          roles: project.roles.replace(/\s/g, "").split(","),
        });
      }
      body["projects"] = projects;
    }
    return { name: name, body: body };
  }

  doCreateUser(data) {
    let comp = this;
    let { name, body } = this.prepUser(data);

    this.DM.userCreate(name, body).then((r) => {
      if (r.done) {
        NotificationManager.info("User Created!", null, 1000);
        setTimeout(() => {
          comp.props.history.push("/users/details/" + name);
        }, 1000);
      } else {
        NotificationManager.error("User Creation Failed...", null, 1000);
      }
    });
  }

  doUpdateUser(data) {
    let comp = this;
    let { name, body } = this.prepUser(data);

    this.DM.userUpdate(name, body).then((r) => {
      if (r.done) {
        NotificationManager.info("User Updated!", null, 1000);
        setTimeout(() => {
          comp.props.history.push("/users/details/" + name);
        }, 1000);
      } else {
        NotificationManager.error("User Update Failed...", null, 1000);
      }
    });
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
                projects: [{ project: "", roles: "" }],
              }
            }
            validate={validate}
            onSubmit={(values) => {
              values["projects"] = this.state.values
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
                              onClick={() => push({ project: "", roles: ["consumer"] })}
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
                                      <Autocomplete
                                        name={`projects.${index}.project`}
                                        value={
                                          this.state.values[index]["project"]
                                        }
                                        inputProps={{
                                          id: `projects.${index}.project`,
                                          className: "form-control",
                                        }}
                                        wrapperProps={{
                                          className: "input-group-append",
                                        }}
                                        wrapperStyle={{ width: "75%" }}
                                        items={this.state.projects}
                                        getItemValue={(item) => item.name}
                                        shouldItemRender={this.matchProjects}
                                        onChange={(event, value) => {
                                          let values = this.state.values;
                                          values[index] = { ...values[index], project: value };
                                          this.setState({ values });
                                        }}
                                        onSelect={(value) => {
                                          let values = this.state.values;
                                          values[index] = { ...values[index], project: value };
                                          this.setState({ values });
                                        }}
                                        renderMenu={(children) => (
                                          <div className="menu">{children}</div>
                                        )}
                                        renderItem={(item, isHighlighted) => (
                                          <div
                                            className={`item ${
                                              isHighlighted
                                                ? "item-highlighted"
                                                : ""
                                            }`}
                                            key={item.name}
                                          >
                                            {getProjectColorIcon(item.name)}
                                            <span className="ml-2">
                                              {item.name}
                                            </span>
                                          </div>
                                        )}
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
                                    <Input type="select"
                                      name={`projects.${index}.roles`}
                                      value={this.state.values[0]["roles"]}
                                      onSelect={(e) => {
                                        let values = this.state.values;
                                        values[index]["roles"] = e.target.value;
                                        this.setState({ values });
                                      }}
                                      onChange={(e) => {
                                        let values = this.state.values;
                                        values[index]["roles"] = e.target.value;
                                        this.setState({ values });
                                      }}
                                    >
                                      <option value="project_admin">
                                        Project Admin
                                      </option>
                                      <option value="publisher">
                                        Publisher
                                      </option>
                                      <option value="consumer" selected>Consumer</option>
                                    </Input>
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
                      <span className="border p-2 mx-2 rounded">
                        <FontAwesomeIcon
                          className="ml-1 mr-1"
                          icon="shield-alt"
                        />{" "}
                        project admin
                      </span>
                      <span className="border p-2 mx-2 rounded">
                        <FontAwesomeIcon
                          className="ml-1 mr-1"
                          icon="cloud-upload-alt"
                        />{" "}
                        publisher
                      </span>
                      <span className="border p-2 mx-2 rounded">
                        {" "}
                        <FontAwesomeIcon
                          className="ml-1 mr-1"
                          icon="cloud-download-alt"
                        />{" "}
                        consumer
                      </span>
                    </div>
                  </div>
                )}
                <button type="submit" className="btn btn-success">
                  {actionOnUser}
                </button>
                <span> </span>
                <Button
                  type="button"
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

export default CreateUser;
