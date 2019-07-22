import React, { Component } from "react";
import { NotificationContainer } from "react-notifications";

import Authen from "./Authen";
import { CardBody, Card } from "reactstrap";
import DataManager from "./DataManager";

class TopicACL extends Component {
    constructor(props) {
        super(props);
        this.authen = new Authen();
        this.DM = new DataManager(
            this.authen.getEndpoint(),
            this.authen.getToken()
        );
        this.state = { project: "", topic: "", users: "", acl: [] };

        if (this.authen.isLogged()) {
            this.state = {
                project: this.props.match.params.projectname,
                topic: this.props.match.params.topicname,
                acl: this.apiGetTopicACL(
                    this.props.match.params.projectname,
                    this.props.match.params.topicname
                )
            };
        }

        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleAdd = this.handleAdd.bind(this);
        this.handleRemove = this.handleRemove.bind(this);
    }

    componentDidMount() {
        this.apiGetProjectPublishers(this.props.match.params.projectname);
    }

    getNonAclUsers(allUsers, aclUsers) {

        let setAll = new Set(allUsers);
        let setACL = new Set(aclUsers);
        let nonACL = new Set([...setAll].filter(x => !setACL.has(x)));

        return Array.from(nonACL);
    }

    handleSubmit(e) {
        e.preventDefault();
        this.doModACL(this.state.project, this.state.topic);
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

    handleRemove(e) {
        e.preventDefault();
        let key = e.target.getAttribute("indexedkey");
        let acl = this.state.acl.filter(word => word !== key);
        this.setState({ acl: acl });
    }

    doModACL(project, topic) {
        let comp = this;
        this.DM.topicModACL(project, topic, {
            authorized_users: this.state.acl
        }).then(done => {
            if (done) {
                comp.props.history.push(
                    "/topics/details/projects/" + project + "/topics/" + topic
                );
            }
        });
    }

    // get user data
    apiGetProjectPublishers(project) {
        if (project && project !== "") {
            this.DM.projectMembersGet(project).then(r => {
                if (r.done) {
                    let result = [];
                    for (let user of r.data.users) {
                        if (user.projects[0].roles.includes("publisher")) {
                            result.push(user.name);
                        }
                    }
                    this.setState({ users: result });
                }
            });
        } else {
            return [];
        }
    }

    apiGetTopicACL(project, topic) {
        this.DM.topicGetACL(project, topic).then(r => {
            if (r.done) {
                this.setState({ acl: r.data.authorized_users });
            }
        });
    }

    render() {
        let aclUsers = [];
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

        return (
            <div>
                <NotificationContainer />
                <div className="row mb-2">
                    <div className="col-2">
                        <h2>Modify Topic ACL</h2>
                    </div>
                </div>
                <Card className="mb-2">
                    <CardBody>
                        <form onSubmit={this.handleSubmit}>
                            <div className="row">
                                <div className="col-xs-12 col-sm-12 col-md-6 col-lg-4">
                                    <span>
                                        Eligible Publishers in project{" "}
                                        <strong>{this.state.project}</strong>:
                                    </span>
                                    <div className="border rounded p-3 mb-2">
                                       
                                            {nonAclUsers}
                                       
                                        
                                    </div>
                                </div>
                                <div className="col-xs-12 col-sm-12 col-md-6 col-lg-4">
                                    <span>
                                        Authorized Users for topic{" "}
                                        <strong>{this.state.topic}</strong>:
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

export default TopicACL;
