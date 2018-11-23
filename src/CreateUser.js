import React, { Component } from "react";
import { Formik, Field, Form, ErrorMessage } from "formik";
import {NotificationContainer, NotificationManager} from 'react-notifications';
import {Link} from 'react-router-dom';
import config from './config';
import Authen from "./Authen";


function postData(url = ``, data = {}) {
   
    // Default options are marked with *
      return fetch(url, {
          method: "POST", 
          mode: "cors", 
          cache: "no-cache", 
          credentials: "same-origin", 
          headers: {
              "Content-Type": "application/json; charset=utf-8",
              
          },
          redirect: "follow", 
          referrer: "no-referrer", 
          body: JSON.stringify(data), 
      })
      .then(response => {
          if (response.status === 200) {
            NotificationManager.info('User Created',null,1000);
            return true;
            
          } else {
            NotificationManager.info('Issues with user creation',null,1000);
            return false;
          }
      }); // parses response to JSON
  }

const validate = values => {
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
};

class CreateUser extends Component {
  constructor(props) {
    super(props);
    this.authen = new Authen(config.endpoint);
    this.doCreateUser.bind(this);
  }

  doCreateUser(data) {
    let name = data.name;
    let body = { email: data.email };
    if (data.service_admin) {
      body["service_roles"] = ["service_admin"];
    }
  
    // quickly construct request url
    let url = "https://" + config.endpoint + "/v1/users/" + name + "?key=" + this.authen.getToken();
  
    postData(url, body)
      .then(done => 
        { console.log(done); if (done){window.location="/users/details/"+name;}}
      )
      .catch(error => console.error(error));
  }

  render() {
    return (
      <div>
           <NotificationContainer/>
        <h1>Create User</h1>
        <Formik
          initialValues={{
            name: "",
            email: "",
            service_admin: false
          }}
          validate={validate}
          onSubmit={values => {
            // request to backend to create user
            this.doCreateUser(values);
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
                <div className="form-group">
                  <code className="form-control">
                    This is a project / roles placeholder
                  </code>
                </div>
              )}
              <button type="submit" className="btn btn-success">
                Create user
              </button>
              <span> </span><Link className="btn btn-dark" to="/users">Cancel</Link>
            </Form>
          )}
        />
      </div>
    );
  }
}

export default CreateUser;
