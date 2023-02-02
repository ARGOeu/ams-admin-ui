import React, { Component } from "react";
import {
    NotificationManager,
    NotificationContainer
} from "react-notifications";
import { Formik, Field, Form, ErrorMessage } from "formik";
import Authen from "./Authen";

import { Card, Button, Alert } from "reactstrap";
import DataManager from "./DataManager";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { library } from "@fortawesome/fontawesome-svg-core";
import { faKeyboard, faEnvelope } from "@fortawesome/free-solid-svg-icons";
library.add(faKeyboard, faEnvelope);

function getShortName(fullName) {
    let tokens = fullName.split("/");
    return tokens[tokens.length - 1];
  }

function composeMsgBody(msg, attrs, defineAttr) {
    let attrD = {};
    let payload = "";
    if (attrs && attrs.length > 0) {
        for (let attr of attrs) {
            attrD[attr.name] = attr.value;
        }
    }

    if (msg) {
        payload = btoa(msg);
    }

   
  
    if (attrs && attrs.length > 0 && defineAttr) {
        return { data: payload, attributes: attrD };
    }
    return { data: payload };
}

class SchemaValidate extends Component {
    constructor(props) {
        super(props);
        this.authen = new Authen();
        this.DM = new DataManager(
            this.authen.getEndpoint(),
            this.authen.getToken()
        );
        this.state = {
            project: "",
            topic: "",
            msg: "",
            payload: "",
            published: false,
            msgId: 0,
            validationErrorMessage: ""
        };

        if (this.authen.isLogged()) {
            this.state = {
                restrictPublish: this.props.restrictPublish,
                project: this.props.match.params.projectname,
                topic: this.props.match.params.topicname,
                schemas: this.apiGetSchemas(this.props.match.params.projectname),
                schema: "",
            };
        }
    }

    componentWillReceiveProps(props) {
        this.setState({
            restrictPublish: this.props.restrictPublish,
            project: this.apiGetData(this.props.match.params.projectname),
            schemas: this.apiGetSchemas(this.props.match.params.projectname),
            schema: "",
          });
    }

    apiGetSchemas(projectName) {
        this.DM.projectGetSchemas(projectName).then(r => {
          if (r.done) {
            r.data.schemas.forEach((item,i) => {
              if (getShortName(item.name) === this.props.match.params.schemaname) {
                this.setState({ schema: item });
              }
            });
          }
        });
    }

    doPublish(project, topic, values) {
        let data = composeMsgBody(values.message, values.attributes, values.defineAttr);
        
        this.DM.topicPublish(project, topic, data).then(r => {
            if (r.done) {
                // get msg id
                let msgId = r.data["messageIds"][0];
                this.setState({ published: true, msgId: msgId });
                NotificationManager.info(
                    "Message Published! (msg id:" + msgId + ")",
                    null,
                    1000
                );
            } else {

                NotificationManager.error("Message Publish Failed...", null, 1000);

            }
        });
    }

    apiValidateSchema(projectName, schemaName, schema) {
        let data;
        data = this.DM.projectValidateSchema(projectName, schemaName, schema).then(r => {
          if (r.done) {
            NotificationManager.info("Schema is valid", null, 1000);
            this.setState({
                "validationErrorMessage": ""
            });
          } else {
            // NotificationManager.error(r.data.error.message, null, 0);
            this.setState({
                "validationErrorMessage": r.data.error.message
            });
          }
        });
        return data;
      }
    
    handleValidateSchema(projectName, schemaName, schemaData) {
        return this.apiValidateSchema(projectName, schemaName, schemaData);
    }

    formMessage(message) {
        if (this.state.schema.type === "avro") {
            return JSON.stringify({data:btoa(JSON.stringify(message))})
        }
        else {
            return message;
        }
    }

    render() {
        let header = null;
        let dispPost = "d-none";
        let dispForm = "d-block p-4";
        if (this.state.published) {
            dispForm = "d-none";
            dispPost = "d-block p-4";
        }

        if (this.state.restrictPublish) {
            header = (
                <h2>
                    Validate schema:{" "}
                    <strong>{this.state.topic}</strong>{" "}
                    <small>({getShortName(this.state.schema.name || "")})</small>
                </h2>
            )
        }
        else {
            header = (
                <h2>
                    Publish message to topic:{" "}
                    <strong>{this.state.topic}</strong>{" "}
                    <small>({this.state.project})</small>
                </h2>
            )
        }

        return (
            <div>
                <NotificationContainer />

                <div className="row mb-2">
                    <div className="col-12">
                        {header}
                    </div>
                </div>
                <Card className={dispPost}>
                    <div className="text-center">
                        <div className="appear">
                            <FontAwesomeIcon size="4x" icon="envelope" />
                        </div>

                        <h2>Message published!</h2>
                        <h5>
                            with message id: <code>{this.state.msgId}</code>
                        </h5>
                        <hr />
                        <button
                            onClick={e => {
                                this.setState({ published: false });
                                document.querySelector("#reset-form").click();
                            }}
                            className="m-2 btn btn-success"
                        >
                            Publish new message
                        </button>
                        <br />
                        <button
                            onClick={e => {
                                this.setState({ published: false });
                            }}
                            className="m-2 btn btn-success"
                        >
                            Edit and republish previous message
                        </button>
                        <br />
                        <button onClick={() => {
                            this.props.history.goBack();
                            }}
                        className="m-2 btn btn-dark">Cancel</button>
                    </div>
                </Card>
                <Card className={dispForm}>
                    <Formik
                        initialValues={{
                            defineAttr: false,
                            message: "",
                            attributes: []
                        }}
                        onSubmit={values => {
                            if (this.state.restrictPublish) {
                                this.handleValidateSchema(
                                    this.props.match.params.projectname,
                                    this.props.match.params.schemaname,
                                    this.formMessage(values.message));
                            }
                            else {
                                this.doPublish(
                                    this.state.project,
                                    this.state.topic,
                                    values
                                );
                            }
                        }}
                        render={({ values, errors, touched }) => {
                            return (
                                <Form>
                                    <div className="form-group">
                                        <label htmlFor="name">Message:</label>
                                        <Field
                                            name="message"
                                            disabled={(this.state.schema.type==="avro") ? true : false}
                                            component="textarea"
                                            className="form-control"
                                            rows="3"
                                        />
                                        <small className="field-error form-text text-danger">
                                            <ErrorMessage name="message" />
                                        </small>
                                    </div>
                                    <div className="form-group">
                                        {this.state.validationErrorMessage ?
                                        <Alert color="danger">
                                            {this.state.validationErrorMessage}
                                        </Alert>
                                        :null}
                                    </div>

                                    
                                    {this.state.restrictPublish?
                                    <button
                                        type="submit"
                                        disabled={(this.state.schema.type==="avro") ? true : false}
                                        className="btn btn-success"
                                    >
                                        Validate
                                    </button>
                                    :
                                    <button
                                        type="submit"
                                        className="btn btn-success"
                                    >
                                        Publish
                                    </button>}
                                    <span> </span>
                                    <Button
                                        id="reset-form"
                                        disabled={(this.state.schema.type==="avro") ? true : false}
                                        className="btn btn-secondary"
                                        type="reset"
                                    >
                                        Reset
                                    </Button>
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
                            );
                        }}
                    />
                </Card>
            </div>
        );
    }
}

export default SchemaValidate;
