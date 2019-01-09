import React, { Component } from "react";
import { Formik, Field, Form, ErrorMessage, FieldArray } from "formik";
import {
  NotificationContainer,
  NotificationManager
} from "react-notifications";
import config from "./config";
import Authen from "./Authen";
import {Button} from "reactstrap"

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
      NotificationManager.info("Project Created", null, 1000);
      return true;
    } else {
      NotificationManager.info("Issues with Project creation", null, 1000);
      return false;
    }
  });
}

function validate(values, other) {
  let errors = {};

  // name validation
  if (!values.name) {
    errors.name = "Required";
  } else if (!/^[A-Z0-9_-]+$/i.test(values.name)) {
    errors.name =
      "Invalid name (use only letters, numbers, underscores and dashes)";
  } else if (window.valid_projects.indexOf(values.name) > -1) {
    errors.name = 
      "Project name already exists. Choose another one";
  }




  return errors;
}

class CreateProject extends Component {
  constructor(props) {
    super(props);
    this.authen = new Authen(config.endpoint);
    this.doCreateProject.bind(this);

    if (this.props.action === "create") {
      this.state = {
        action: this.props.action, // create or update
        projects: [],
        roles: ["project_admin", "consumer", "producer"],
        initialValues: {
          name: "",
          description: "",
        }
      };
    } else {
      this.state = {
        action: this.props.action, // create or update
        project: null,
        projects: [],
        roles: ["project_admin", "consumer", "producer"],
        initialValues: this.apiGetData(
          this.authen.getToken(),
          config.endpoint,
          this.props.match.params.projectname
        )
      };
    }

    this.apiGetProjects(this.authen.getToken(), config.endpoint);
  }

  apiGetData(token, endpoint, projectname) {
    // If token or endpoint empty return
    if (token === "" || token === null || endpoint === "" || projectname === "") {
      return;
    }
    // quickly construct request url
    let url = "https://" + endpoint + "/v1/projects/" + projectname + "?key=" + token;
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
          return { project: null };
        }
      })
      .then(json => {
        
        
        let initVal = {
          name: json.name,
          description: json.description
        };
        

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

  doCreateProject(data) {
    let name = data.name;
    let body = { description: data.description };

   

    // quickly construct request url
    let url =
      "https://" +
      config.endpoint +
      "/v1/projects/" +
      name +
      "?key=" +
      this.authen.getToken();

    sendData(url, body, "POST")
      .then(done => {
        console.log(done);
        if (done) {
          window.location = "/projects/details/" + name;
        }
      })
      .catch(error => console.error(error));
  }

  doUpdateProject(data) {
    let name = data.name;
    let body = { description: data.description };

    // quickly construct request url
    let url =
      "https://" +
      config.endpoint +
      "/v1/projects/" +
      name +
      "?key=" +
      this.authen.getToken();

    sendData(url, body, "PUT")
      .then(done => {
        console.log(done);
        if (done) {
          window.location = "/projects/details/" + name;
        }
      })
      .catch(error => console.error(error));
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
        <h2>{actionOnProject}</h2>
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
                <Field name="name" className="form-control" />
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
              <Button onClick={()=>{window.history.back()}} className="btn btn-dark">
                Cancel
              </Button>
            </Form>
          )}
        />
      </div>
    );
  }
}

export default CreateProject;
