import React, { Component } from "react";
import {
    NotificationContainer
} from "react-notifications";

import Authen from "./Authen";
import { CardBody, Card } from "reactstrap";
import DataManager from "./DataManager";

class SubACL extends Component {
    constructor(props) {
        super(props);
        this.authen = new Authen();
        this.DM = new DataManager(
            this.authen.getEndpoint(),
            this.authen.getToken()
        );
        this.state = { project: "", sub: "", users: "", acl: [] };

        if (this.authen.isLogged()) {
            this.state = {
                project: this.props.match.params.projectname,
                sub: this.props.match.params.subname,
                users: "",
                acl: this.apiGetSubACL(
                    this.props.match.params.projectname,
                    this.props.match.params.subname
                )
            };
        }

        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleAdd = this.handleAdd.bind(this);
        this.handleRemove = this.handleRemove.bind(this);
    }

    componentDidMount() {
        this.apiGetProjectConsumers(this.props.match.params.projectname);
    }

    handleSubmit(e) {
        e.preventDefault();
        this.doModACL(this.state.project, this.state.sub);
    }

    handleRemove(e) {
        let key = e.target.getAttribute("indexedkey");
        let acl = this.state.acl.filter(word => word !== key);
        this.setState({ acl: acl });
    }

    getNonAclUsers(allUsers, aclUsers) {
        let setAll = new Set(allUsers);
        let setACL = new Set(aclUsers);
        let nonACL = new Set([...setAll].filter(x => !setACL.has(x)));

        return Array.from(nonACL);
    }

    // get user data
    apiGetProjectConsumers(project) {
        if (project && project !== "") {
            this.DM.projectMembersGet(project).then(r => {
                if (r.done) {
                    let result = [];
                    for (let user of r.data.users) {
                        for (let i=0; i < user.projects.length; i++){
                            if (user.projects[i].roles.includes("consumer")) {
                                result.push(user.name);
                                break;
                            }
                        }
                        
                    }
                    this.setState({ users: result });
                }
            });
        } else {
            return [];
        }
    }

    doModACL(project, sub) {
        let comp = this;
        this.DM.subModACL(project, sub, {
            authorized_users: this.state.acl
        }).then(done => {
            comp.props.history.push(
                "/subs/details/projects/" + project + "/subscriptions/" + sub
            );
        });
    }

    handleAdd(e) {
        e.preventDefault();

        let key = e.target.getAttribute("indexedkey");

        let acl = this.state.acl;

        if (acl) {
            acl.push(key);
        }
        this.setState({ acl: acl });
    }

    apiGetSubACL(project, sub) {
        this.DM.subGetACL(project, sub).then(r => {
            if (r.done) {
                this.setState({ acl: r.data.authorized_users });
            }
        });
    }

    render() {
        let aclUsers = [];

        if (this.state.acl) {
            for (let user of this.state.acl) {
                aclUsers.push(
                    <p>
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
                    </p>
                );
            }
        }

        let nonAclUsers = [];

        let availUsers = this.getNonAclUsers(this.state.users, this.state.acl);

        if (availUsers) {
            for (let user of availUsers) {
                nonAclUsers.push(
                    <p>
                        <button
                            className="ml-2"
                            indexedkey={user}
                            key={user}
                            onClick={this.handleAdd}
                            style={{
                                backgroundColor: "#00963A",
                                color: "white",
                                fontWeight: "bold",
                                padding: "5px 20px",
                                borderRadius: "20px",
                                borderStyle: "none"
                            }}
                        >
                            {user}
                        </button>
                    </p>
                );
            }
        }

        return (
            <div>
                <NotificationContainer />
                <div className="row mb-2">
                    <div className="col-2">
                        <h2>Modify Subscription ACL</h2>
                    </div>
                </div>
                <Card className="mb-2">
                    <CardBody>
                        <form onSubmit={this.handleSubmit}>
                            <div className="row">
                                <div className="col-xs-12 col-sm-12 col-md-6 col-lg-4">
                                    <span>
                                        Eligible Consumers in project{" "}
                                        <strong>{this.state.project}</strong>:
                                    </span>
                                    <div className="border rounded p-3 mb-2">
                                        {nonAclUsers}
                                    </div>
                                </div>
                                <div className="col-xs-12 col-sm-12 col-md-6 col-lg-4">
                                    <span>
                                        Authorized Users for subscription{" "}
                                        <strong>{this.state.sub}</strong>:
                                    </span>
                                    <div className="border rounded p-3 mb-2">
                                        {aclUsers}
                                    </div>
                                </div>
                            </div>
                            <div className="row m-1">
                                <button
                                    type="submit"
                                    className="btn btn-success mr-2"
                                >
                                    Save ACL
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
                            </div>
                        </form>
                    </CardBody>
                </Card>
            </div>
        );
    }
}

export default SubACL;
