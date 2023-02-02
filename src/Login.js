import React from "react";
import { Formik, Field, Form, ErrorMessage } from "formik";
import { Redirect } from "react-router-dom";
import { Card, CardBody } from "reactstrap";
import Authen from "./Authen";
import "react-notifications/lib/notifications.css";
import {
  NotificationContainer,
  NotificationManager
} from "react-notifications";

import config from "./config";

const validate = values => {
  let errors = {};
  // token validation
  if (!values.token) {
    errors.token = "Required";
  }
  return errors;
};

class Login extends React.Component {
  constructor(props) {
    super(props);
    // add first available endpoint as default
    this.authen = new Authen();
    
    this.state = {
      redirectToReferrer: this.authen.isLogged()
    };
  }

  doLogin(data) {
    this.authen.setEndpoint(data.backend);
    console.log("endpoint set to", data.backend);
    config.endpoint = data.backend;
    this.authen.tryLogin(data.token, data => {
      if (data.isLogged === true) {
        this.setState({ redirectToReferrer: true });
        console.log("will transition....");
        window.location = "/";
      } else {
        NotificationManager.error("Could not login");
      }
    });
  }

  render() {
    if (this.state.redirectToReferrer === true) {
      return <Redirect to="/welcome" />;
    }

    return (
      <div className="row">
        <NotificationContainer />
        <div className="col-sm-6 mx-auto">
          <Card>
            <CardBody>
              <h1>Login</h1>
              <Formik
                initialValues={{
                  token: "",
                  backend: config.available_endpoints[0]
                }}
                validate={validate}
                onSubmit={values => {
                  // request to login user
                  this.doLogin(values);
                }}
                render={({ values, errors, touched }) => (
                  <Form>
                    <div className="form-group">
                      <label htmlFor="backend">Select service</label>
                      <Field component="select" name="backend" className="form-control">
                      {config.available_endpoints.map((value, index) => {
                          return <option key={index} value={value}>{value}</option>
                      })}
                      </Field>
                      <label htmlFor="token">Access Token</label>
                      <Field name="token" className="form-control" />
                      <small className="field-error form-text text-danger">
                        <ErrorMessage name="token" />
                      </small>
                    </div>
                    <button type="submit" className="btn btn-success">
                      Login
                    </button>
                    
                  </Form>
                )}
              />
            </CardBody>
          </Card>
        </div>
      </div>
    );
  }
}

export default Login;
