import React from "react";
import Authen from "./Authen";
import { Card, CardBody, Badge } from "reactstrap";
import ReactTable from "react-table";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { library } from "@fortawesome/fontawesome-svg-core";
import { Link } from "react-router-dom";
import {
    faCrown,
    faHeartbeat,
    faUser,
    faTimes,
    faPen,
    faList,
    faPlus,
    faCloudDownloadAlt,
    faCloudUploadAlt,
    faShieldAlt,
    faStar,
    faTimesCircle,
    faChevronDown,
    faChevronUp,
} from "@fortawesome/free-solid-svg-icons";
import DataManager from "./DataManager";
library.add(
    faCrown,
    faCrown,
    faHeartbeat,
    faUser,
    faTimes,
    faPen,
    faList,
    faPlus,
    faCloudDownloadAlt,
    faCloudUploadAlt,
    faShieldAlt,
    faStar,
    faTimesCircle,
    faChevronDown,
    faChevronUp,
);

class Registrations extends React.Component {
    constructor(props) {
        super(props);
        this.authen = new Authen();
        this.DM = new DataManager(
            this.authen.getEndpoint(),
            this.authen.getToken()
        );
        if (!this.authen.isLogged()) {
            this.state = {
                isServiceAdmin: false,
                isProjectAdmin: false,
                collapse: false,
                registrations: this.apiGetRegistrations(),
            };
        } else {
            this.state = {
                isServiceAdmin: this.authen.isServiceAdmin(),
                isProjectAdmin: this.authen.isProjectAdmin(),
                registrations: this.apiGetRegistrations(),
            }
        }
        this.toggle = this.toggle.bind(this);
    }

    toggle() {
        this.setState({ collapse: !this.state.collapse });
    }

    apiGetRegistrations() {
        this.DM.getRegistrations().then(r => {
            if (r.done) {
                this.setState({ registrations: r.data["user_registrations"] });
            }
        });
    }

    componentDidMount() {
        if (this.authen.isLogged()) {
            this.setState({
                registrations: this.apiGetRegistrations()
            });
        }
    }

    matchProjects(state, value) {
        return state.name.toLowerCase().indexOf(value.toLowerCase()) !== -1;
    }

    getProjects() {
        if (this.state.projects === undefined) return [];
        return this.state.projects;
    }

    // get project data
    apiGetProjects() {
        if (this.authen.isServiceAdmin()) {
            this.DM.projectGet().then(r => {
                if (r.done) {
                    this.setState({ projects: r.data.projects });
                }
            });
            return;
        } else if (this.authen.isProjectAdmin()) {
            // get project list from allowed projects
            let allowedProjects = this.authen.getProjectsPerRole()[
                "project_admin"
            ];
            let results = [];
            for (let project of allowedProjects)
                results.push({
                    name: project,
                    created_on: "",
                    modified_on: ""
                });
            return results;
        }
        return [];
    }

    // Get unique project list from user project assignments
    getDistinctProjects(users) {
        if (!users) {
            return [];
        }
        let uniqueProjects = new Set();
        for (let user of users) {
            for (let project of user.projects) {
                uniqueProjects.add(project.project);
            }
        }

        return Array.from(uniqueProjects);
    }

    // get user data
    apiGetData(project) {
        if (project && project !== "") {
            this.DM.projectMembersGet(project).then(r => {
                if (r.done) {
                    this.setState({ users: r.data.users, allProjects: false });
                }
            });
        } else {
            if (this.authen.isServiceAdmin()) {
                this.setState({ users: undefined, value: "", allProjects: true })
                this.DM.userGet().then(r => {
                    if (r.done) {
                        this.setState({ users: r.data.users });
                    }
                });
            } else {
                this.setState({ users: [], value: "", allProjects: true })
            }
        }
    }

    // based on specific role return an appropriate fa icon
    getRoleIcon(role) {
        if (role === "consumer")
            return (
                <FontAwesomeIcon
                    key={role}
                    className="ml-1 mr-1"
                    icon="cloud-download-alt"
                />
            );
        if (role === "publisher")
            return (
                <FontAwesomeIcon
                    key={role}
                    className="ml-1 mr-1"
                    icon="cloud-upload-alt"
                />
            );
        if (role === "project_admin")
            return (
                <FontAwesomeIcon
                    key={role}
                    className="ml-1 mr-1 "
                    icon="shield-alt"
                />
            );
        return null;
    }

    // based on service role return an appropriate fa icon
    beautifyServiceRoles(serviceRoles) {
        if (serviceRoles) {
            if (serviceRoles.includes("service_admin")) {
                return <FontAwesomeIcon className="service-crown" icon="crown" />;
            } else if (serviceRoles.includes("metric_viewer")) {
                return (
                    <FontAwesomeIcon className="service-metric" icon="heartbeat" />
                );
            }
        }

        return <FontAwesomeIcon icon="user" style={{ color: "#616A6B" }} />;
    }

    render() {

        const userHeading = (
            <div>
                <div className="row  mb-2">
                    <div className="col-2">
                        <h2>Registrations</h2>
                    </div>
                </div>
            </div>
        );

        const columns = [
            {
                Header: "UUID",
                accessor: "uuid",
                Cell: (props) => (
                    <span>{props.value}</span>
                ),
                minWidth: 85,
                headerClassName: "list-header",
                className: "text-center",
            },
            {
                Header: "Status",
                accessor: "status",
                Cell: (props) => {
                    if (props.value === "accepted") {
                        return <Badge color="success">{props.value}</Badge>
                    }
                    else if (props.value === "declined") {
                        return <Badge color="danger">{props.value}</Badge>
                    }
                    else {
                        return <Badge color="info">{props.value}</Badge>
                    }
                },
                filterable: true,
                minWidth: 25,
                headerClassName: "list-header",
                className: "text-center",
            },
            {
                Header: "Name",
                accessor: "name",
                Cell: (props) => (
                    <span>{props.value}</span>
                ),
                minWidth: 55,
                filterable: true,
                headerClassName: "list-header",
            },
            {
                Header: "First Name",
                accessor: "first_name",
                Cell: (props) => (
                    <span>{props.value}</span>
                ),
                minWidth: 55,
                filterable: true,
                headerClassName: "list-header",
            },
            {
                Header: "Last Name",
                accessor: "last_name",
                Cell: (props) => (
                    <span>{props.value}</span>
                ),
                minWidth: 55,
                filterable: true,
                headerClassName: "list-header",
            },
            {
                Header: "Description",
                accessor: "description",
                Cell: (props) => (
                    <span>{props.value}</span>
                ),
                minWidth: 55,
                filterable: true,
                headerClassName: "list-header",
            },
            {
                Header: "Actions",
                accessor: "uuid",
                Cell: (props) => (
                    <Link
                        className="btn btn-light btn-sm ml-1 mr-1"
                        to={"/registrations/" + props.value}
                    >
                        <FontAwesomeIcon icon="list" />
                    </Link>),
                width: 130,
                headerClassName: "list-header",
                className: "text-center",
            },
        ];

        return (
            <div>
                {userHeading}
                <Card className="mb-12">
                    <CardBody>
                        <Card className="mb-12">
                            <CardBody>
                                <div style={{ overflow: "hidden" }}>
                                    <div className="row p-3">
                                        <ReactTable
                                            data={this.state.registrations}
                                            columns={columns}
                                            className="-striped -highlight"
                                            defaultPageSize={20}
                                            style={{ width: "100%" }}
                                            defaultFilterMethod={(filter, row, column) => {
                                                const id = filter.pivotId || filter.id;
                                                return row[id] !== undefined
                                                    ? String(row[id]).includes(filter.value)
                                                    : true;
                                            }}
                                        />
                                    </div>
                                </div>
                            </CardBody>
                        </Card>
                    </CardBody>
                </Card>
            </div>
        );
    }
}

export default Registrations;
