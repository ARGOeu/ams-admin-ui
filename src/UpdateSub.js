import React, { Component } from "react";
import { NotificationContainer } from "react-notifications";

import Authen from "./Authen";
import { CardBody, Card } from "reactstrap";
import DataManager from "./DataManager";

class UpdateSub extends Component {
    constructor(props) {
        super(props);
        this.authen = new Authen();
        this.DM = new DataManager(
            this.authen.getEndpoint(),
            this.authen.getToken()
        );
        this.state = {
            project: "",
            subname: "",
            ackDeadlineSeconds: "",
            pushEndpoint: "",
            pushRetryPolicy: "",
            pushRetryInterval: "",
            errors: {
                pushEndpoint: "",
                ack: "",
                retryInterval: "",
                retryPolicy: ""
            }
        };

        if (this.authen.isLogged()) {
            this.state = {
                project: this.props.match.params.projectname,
                subname: this.props.match.params.subname,
                ackDeadlineSeconds: "",
                pushEndpoint: "",
                pushRetryPolicy: "",
                pushRetryInterval: "",
                errors: { pushEndpoint: "", ack: "" }
            };
            // update sub
            this.apiGetData(this.state.project, this.state.subname);
        }

        this.apiGetData = this.apiGetData.bind(this);
        this.handleAck = this.handleAck.bind(this);
        this.handlePushRetryPolicy = this.handlePushRetryPolicy.bind(this);
        this.handlePushRetryInterval = this.handlePushRetryInterval.bind(this);
        this.handlePushEndpoint = this.handlePushEndpoint.bind(this);
        this.doModAck = this.doModAck.bind(this);
        this.doModPushConfig = this.doModPushConfig.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    apiGetData(projectName, subName) {
        this.DM.subGet(projectName, subName).then(r => {
            if (r.done) {
                let pushRetryPolicy = "";
                let pushRetryInterval = "";
                if (r.data.pushConfig.retryPolicy.hasOwnProperty("type")) {
                    pushRetryPolicy = r.data.pushConfig.pushRetryPolicy.type;
                }
                if (r.data.pushConfig.retryPolicy.hasOwnProperty("interval")) {
                    pushRetryInterval =
                        r.data.pushConfig.pushRetryPolicy.interval;
                }

                this.setState({
                    ackDeadlineSeconds: r.data.ackDeadlineSeconds.toString(),
                    pushEndpoint: r.data.pushConfig.pushEndpoint,
                    pushRetryPolicy: pushRetryPolicy,
                    pushRetryInterval: pushRetryInterval
                });
            }
        });
    }

    validateRetryPolicy(value) {
        let errors = this.state.errors;
        if (value !== "" && value !== "linear") {
            errors.retryPolicy = "Please enter linear or leave empty";
        } else {
            errors.retryPolicy = "";
        }
        this.setState({ errors });
    }

    validateRetryInterval(value) {
        let errors = this.state.errors;
        if (value !== "") {
            if (isNaN(value) || parseInt(value) < 300) {
                errors.retryInterval =
                    "Please enter a numeric value larger than 300";
            } else {
                errors.retryInterval = "";
            }
        } else {
            errors.retryInterval = "";
        }
        this.setState({ errors });
    }

    validateAck(value) {
        let errors = this.state.errors;
        if (value !== "") {
            if (
                isNaN(value) ||
                (parseInt(value) < 0 || parseInt(value) > 600)
            ) {
                errors.ack = "Please enter a numeric value between 0 and 600";
            } else {
                errors.ack = "";
            }
        } else {
            errors.ack = "";
        }
        this.setState({ errors });
    }

    validatePushEndpoint(value) {
        let errors = this.state.errors;
        if (
            !/^((https):\/\/)([w|W]{3}\.)?[a-zA-Z0-9\-.]{3,}\.[a-zA-Z]{2,}(\.[a-zA-Z]{2,})?$/i.test(
                value
            )
        ) {
            errors.pushEndpoint = "Please enter a valid https url";
        } else {
            errors.pushEndpoint = "";
        }
        this.setState({ errors });
    }

    handleAck(e) {
        this.validateAck(e.target.value);
        this.setState({ ackDeadlineSeconds: e.target.value });
    }

    handlePushEndpoint(e) {
        this.validatePushEndpoint(e.target.value);
        this.setState({ pushEndpoint: e.target.value });
    }

    handlePushRetryPolicy(e) {
        this.setState({ pushRetryPolicy: e.target.value });
    }

    handlePushRetryInterval(e) {
        this.setState({ pushRetryInterval: e.target.value });
    }

    handleUserChange(e) {
        this.setState({ user: e.target.value });
    }

    handleSubmit(e) {
        e.preventDefault();
        this.doUpdate();
    }

    doUpdate() {
        this.doModAck(this.state.project, this.state.subname);
        this.doModPushConfig(this.state.project, this.state.subname);
    }

    doModAck(project, sub) {
        this.DM.subModAck(project, sub, {
            ackDeadlineSeconds: parseInt(this.state.ackDeadlineSeconds)
        }).then(done => {
            console.log("ack updated");
        });
    }

    doModPushConfig(project, sub) {
        let retryPolicy = {};
        if (
            this.state.pushRetryPolicy !== "" &&
            this.state.pushRetryInterval !== ""
        ) {
            retryPolicy["type"] = this.state.pushRetryPolicy;
            retryPolicy["interval"] = parseInt(this.state.pushRetryInterval);
        }

        let pushConfig = {
            pushConfig: {
                pushEndpoint: this.state.pushEndpoint,
                retryPolicy: retryPolicy
            }
        };

        this.DM.subModPushConfig(project, sub, pushConfig).then(done => {
            if (done) {
                this.props.history.push(
                    "/subs/details/projects/" +
                        project +
                        "/subscriptions/" +
                        sub
                );
            }
        });
    }

    render() {
        let aclUsers = [];

        const onlyConsumer =
            this.authen.isServiceAdmin() === false &&
            this.authen.isProjectAdmin() === false &&
            this.authen.isConsumer() === true;
        
       

        if (this.state.acl) {
            for (let user of this.state.acl) {
                aclUsers.push(
                    <span className="tag-style" key={user}>
                        <strong>{user}</strong>
                        <button
                            className="ml-2 close-link"
                            indexedkey={user}
                            key={user}
                            onClick={this.handleRemove}
                        >
                            X
                        </button>
                    </span>
                );
            }
        }

        return (
            <div>
                <NotificationContainer />
                <div className="row mb-2">
                    <div className="col-3">
                        <h2>Update Subscription</h2>
                    </div>
                </div>
                <Card className="mb-2">
                    <CardBody>
                        <div className="row">
                            <div className="col-8">
                                <form onSubmit={this.handleSubmit}>
                                    <div className="form-control-group">
                                        <label>Project: </label>
                                        <strong className="ml-2">
                                            {this.state.project}
                                        </strong>
                                        <label className="ml-4">
                                            Subname Name:
                                        </label>
                                        <strong className="ml-2">
                                            {this.state.subname}
                                        </strong>
                                    </div>

                                    <div className="form-control-group">
                                        <label>Ack Deadline:</label>
                                        <input
                                            id="inp-ack"
                                            className="form-control"
                                            onChange={this.handleAck}
                                            value={
                                                this.state.ackDeadlineSeconds
                                            }
                                        />
                                        <label className="text-danger">
                                            {this.state.errors.ack}
                                        </label>
                                    </div>
                                    { !onlyConsumer && 
                                    <div>
                                        <div className="form-control-group">
                                            <label>Push Endpoint:</label>
                                            <input
                                                id="inp-push-endpoint"
                                                className="form-control"
                                                onChange={
                                                    this.handlePushEndpoint
                                                }
                                                value={this.state.pushEndpoint}
                                            />
                                            <label className="text-danger">
                                                {this.state.errors.pushEndpoint}
                                            </label>
                                        </div>

                                        <div className="form-control-group">
                                            <label>Push Retry Policy:</label>
                                            <input
                                                id="inp-push-endpoint"
                                                className="form-control"
                                                onChange={
                                                    this.handlePushRetryPolicy
                                                }
                                                value={
                                                    this.state.pushRetryPolicy
                                                }
                                            />
                                        </div>

                                        <div className="form-control-group">
                                            <label>
                                                Push Linear activity internal:
                                            </label>
                                            <input
                                                id="inp-push-endpoint"
                                                className="form-control"
                                                onChange={
                                                    this.handlePushRetryInterval
                                                }
                                                value={
                                                    this.state.pushRetryInterval
                                                }
                                            />
                                        </div>
                                    </div>
                                    }

                                    <br />
                                    <button
                                        type="submit"
                                        className="btn btn-success mr-2"
                                    >
                                        Update
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => {
                                            this.props.history.goBack();
                                        }}
                                        className="btn btn-dark"
                                    >
                                        Cancel
                                    </button>
                                </form>
                            </div>
                        </div>
                    </CardBody>
                </Card>
            </div>
        );
    }
}

export default UpdateSub;
