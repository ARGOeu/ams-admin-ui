import React, { Component } from "react";
import {
    NotificationManager,
    NotificationContainer
} from "react-notifications";
import { Formik, Field, Form, ErrorMessage, FieldArray } from "formik";
import Authen from "./Authen";

import { Card, Button } from "reactstrap";
import DataManager from "./DataManager";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { library } from "@fortawesome/fontawesome-svg-core";
import { faKeyboard, faEnvelope } from "@fortawesome/free-solid-svg-icons";
library.add(faKeyboard, faEnvelope);

function clip() {
    let copyText = document.getElementById("curl-snip");
    copyText.select();
    document.execCommand("copy");
    NotificationManager.info("snippet copied to clipboard", null, 1000);
}

function genCurlSnippet(endpoint, project, topic, token, msgBody) {
    return (
        "curl -X POST \\\n" +
        "'https://" +
        endpoint +
        "/v1/projects/" +
        project +
        "/topics/" +
        topic +
        ":publish?key=" +
        token +
        "' \\\n" +
        "-H 'Accept: application/json' \\\n" +
        "-H 'Content-Type: application/json' \\\n" +
        "-d '" +
        JSON.stringify(msgBody) +
        "'"
    );
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

function validate(values, other) {
    let errors = {};

    if (values.defineAttr) {
        let prevNames = new Set();
        let errListAttributes = [];
        values.attributes.forEach(attr => {
            let aErrors = {};
            if (!attr.name) aErrors.name = "Required";
            if (attr.name.includes(" ")) {
                aErrors.name = "Dont use spaces in attribute names";
            }
            if (prevNames.has(attr.name)) {
                aErrors.name = "Use attribute with unique name";
            }

            prevNames.add(attr.name);

            errListAttributes.push(aErrors);
        });

        // check if attribute errors are indeed empty
        let empty = true;
        for (let item of errListAttributes) {
            if (
                !(Object.keys(item).length === 0 && item.constructor === Object)
            ) {
                empty = false;
            }
        }

        if (!empty) {
            errors.attributes = errListAttributes;
        }
    }

    return errors;
}

class TopicPublish extends Component {
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
            msgId: 0
        };

        if (this.authen.isLogged()) {
            this.state = {
                project: this.props.match.params.projectname,
                topic: this.props.match.params.topicname
            };
        }

        this.handleMsgText = this.handleMsgText.bind(this);
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

    handleMsgText(e) {
        if (e) {
            this.setState({
                msg: e.target.value,
                payload: btoa(e.target.value)
            });
        }
    }

    render() {
        let dispPost = "d-none";
        let dispForm = "d-block p-4";
        if (this.state.published) {
            dispForm = "d-none";
            dispPost = "d-block p-4";
        }

        return (
            <div>
                <NotificationContainer />

                <div className="row mb-2">
                    <div className="col-12">
                        <h2>
                            Publish message to topic:{" "}
                            <strong>{this.state.topic}</strong>{" "}
                            <small>({this.state.project})</small>
                        </h2>
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
                        validate={validate}
                        onSubmit={values => {
                            this.doPublish(
                                this.state.project,
                                this.state.topic,
                                values
                            );
                        }}
                        render={({ values, errors, touched }) => {
                            let msgBody = composeMsgBody(
                                values.message,
                                values.attributes,
                                values.defineAttr
                            );
                            let curlStr = genCurlSnippet(
                                this.authen.getEndpoint(),
                                this.state.project,
                                this.state.topic,
                                this.authen.getToken(),
                                msgBody
                            );
                            return (
                                <Form>
                                    <div className="form-group">
                                        <label htmlFor="name">Message:</label>
                                        <Field
                                            name="message"
                                            component="textarea"
                                            className="form-control"
                                            rows="3"
                                        />
                                        <small className="field-error form-text text-danger">
                                            <ErrorMessage name="message" />
                                        </small>
                                    </div>

                                    <div className="form-check">
                                        <Field
                                            name="defineAttr"
                                            className="form-check-input"
                                            type="checkbox"
                                        />
                                        <label htmlFor="defineAttr">
                                            Define Attributes
                                        </label>
                                    </div>
                                    {values.defineAttr && (
                                        <div className="form-group border p-3 col">
                                            <FieldArray
                                                name="attributes"
                                                render={({
                                                    insert,
                                                    remove,
                                                    push
                                                }) => (
                                                    <div>
                                                        <div className="mb-2">
                                                            <label className="mr-3">
                                                                Attributes:
                                                            </label>
                                                        </div>
                                                        {values.attributes
                                                            .length > 0 &&
                                                            values.attributes.map(
                                                                (
                                                                    attributes,
                                                                    index
                                                                ) => (
                                                                    <div
                                                                        className="row form-row"
                                                                        key={
                                                                            index
                                                                        }
                                                                    >
                                                                        <div className="form-group col">
                                                                            <label
                                                                                className="sr-only"
                                                                                htmlFor={`attributes.${index}.name`}
                                                                            >
                                                                                Name:
                                                                            </label>
                                                                            <div className="input-group mb-2 mr-sm-2">
                                                                                <div className="input-group-prepend">
                                                                                    <div className="input-group-text">
                                                                                        Name:
                                                                                    </div>
                                                                                </div>
                                                                                <Field
                                                                                    name={`attributes.${index}.name`}
                                                                                    type="text"
                                                                                    className="form-control"
                                                                                />
                                                                            </div>
                                                                            <ErrorMessage
                                                                                name={`attributes.${index}.name`}
                                                                                component="div"
                                                                                className="field-error form-text text-danger"
                                                                            />
                                                                        </div>
                                                                        <div className="form-group col">
                                                                            <label
                                                                                className="sr-only"
                                                                                htmlFor={`attributes.${index}.value`}
                                                                            >
                                                                                Value:
                                                                            </label>
                                                                            <div className="input-group mb-2 mr-sm-2">
                                                                                <div className="input-group-prepend">
                                                                                    <div className="input-group-text">
                                                                                        Value:
                                                                                    </div>
                                                                                </div>
                                                                                <Field
                                                                                    name={`attributes.${index}.value`}
                                                                                    className="form-control"
                                                                                    type="text"
                                                                                />
                                                                            </div>
                                                                            <ErrorMessage
                                                                                name={`attributes.${index}.value`}
                                                                                component="div"
                                                                                className="field-error form-text text-danger"
                                                                            />
                                                                        </div>
                                                                        <div className="form-group col">
                                                                            <button
                                                                                type="button"
                                                                                className="btn btn-danger"
                                                                                onClick={() =>
                                                                                    remove(
                                                                                        index
                                                                                    )
                                                                                }
                                                                            >
                                                                                X
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                )
                                                            )}
                                                        <button
                                                            type="button"
                                                            className="btn btn-success"
                                                            onClick={() =>
                                                                push({
                                                                    name: "",
                                                                    value: ""
                                                                })
                                                            }
                                                        >
                                                            Add New Attribute
                                                        </button>
                                                    </div>
                                                )}
                                            />
                                        </div>
                                    )}
                                    <button
                                        type="submit"
                                        className="btn btn-success"
                                    >
                                        Publish
                                    </button>
                                    <span> </span>
                                    <Button
                                        id="reset-form"
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
                                    <div className="m-2 border p-2">
                                        <div className="row">
                                            <div className="col-11">
                                                <strong className="ml-1">
                                                    <FontAwesomeIcon
                                                        className="ml-1 mr-1"
                                                        icon="keyboard"
                                                    />
                                                    Curl call to AMS API:{" "}
                                                </strong>
                                            </div>
                                            <div className="col-1 text-right">
                                                <button
                                                    type="button"
                                                    onClick={clip}
                                                    className="btn btn-sm btn-warning"
                                                >
                                                    Copy
                                                </button>
                                            </div>
                                        </div>

                                        <div
                                            className="border p-2 mt-1"
                                            style={{
                                                backgroundColor: "#282B2F"
                                            }}
                                        >
                                            <code
                                                style={{
                                                    color: "lightgrey",
                                                    fontWeight: "bold",
                                                    fontSize: "1.2em"
                                                }}
                                            >
                                                {curlStr}
                                            </code>
                                            <textarea
                                                style={{
                                                    opacity: "0",
                                                    height: "0px",
                                                    width: "0px"
                                                }}
                                                className="form-control"
                                                readOnly
                                                value={curlStr}
                                                id="curl-snip"
                                            />
                                        </div>
                                    </div>
                                </Form>
                            );
                        }}
                    />
                </Card>
            </div>
        );
    }
}

export default TopicPublish;
