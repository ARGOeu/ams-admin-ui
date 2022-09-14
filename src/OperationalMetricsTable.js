import React from "react";
import Authen from "./Authen";
import { Card, CardBody, CardHeader, Table } from "reactstrap";
import "react-table/react-table.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { library } from "@fortawesome/fontawesome-svg-core";
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
    faStar
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
    faStar
);

class OperationalMetricsTable extends React.Component {
    constructor(props) {
        super(props);
        this.authen = new Authen();
        this.DM = new DataManager(
            this.authen.getEndpoint(),
            this.authen.getToken()
        );
        if (!this.authen.isLogged()) {
            this.state = {
                allProjects: true,
                users: [],
                projects: [],
                value: "",
                isServiceAdmin: false,
                isProjectAdmin: false,
                operationalMetrics: []
            };
        } else {
            this.state = {
                allProjects: true,
                users: [],
                projects: [],
                value: "",
                isServiceAdmin: this.authen.isServiceAdmin(),
                isProjectAdmin: this.authen.isProjectAdmin(),
                operationalMetrics: []
            }
        }
    }

    apiGetOperationalMetrics() {
        if (this.state.isServiceAdmin) {
            this.DM.operationalGetMetrics().then(r => {
                if (r.done) {
                    this.setState({ operationalMetrics: r.data.metrics });
                }
            });
        }
        else if (this.state.isProjectAdmin) {
            this.DM.getUsageReport().then(r => {
                if (r.done) {
                    this.setState({ operationalMetrics: r.data.operational_metrics.metrics });
                }
            });
        }
    }

    componentDidMount() {
        if (this.authen.isLogged()) {
            this.setState({
                value: "",
                allProjects: true,
                users: [],
                projects: this.apiGetProjects(),
                operationalMetrics: this.apiGetOperationalMetrics()
            });
            this.apiGetData();
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
                        <h2>Metrics</h2>
                    </div>
                </div>
            </div>
        );

        return (
            <div>
                {userHeading}
                <Card className="mb-2">
                    <CardHeader>
                        Operational
                    </CardHeader>
                    <CardBody>
                        <div style={{ overflow: "hidden" }}>
                            <div className="row p-3">
                                <Table key="opmetric-table-{i}" hover>
                                    <thead>
                                        <tr>
                                            <th>#</th>
                                            <th>Metric</th>
                                            <th>Resource Type</th>
                                            <th>Resource Name</th>
                                            <th>Value</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {this.state.operationalMetrics && this.state.operationalMetrics.metrics && this.state.operationalMetrics.metrics.map((item, i) =>
                                            <tr key={"opmetric-" + i}>
                                                <th scope="row">{i}</th>
                                                <td>{item.metric}</td>
                                                <td>{item.resource_type}</td>
                                                <td>{item.resource_name}</td>
                                                <td>{item.timeseries[0]["value"] * 10}%</td>
                                            </tr>
                                        )}
                                        {this.state.operationalMetrics && this.state.operationalMetrics.map((item, i) =>
                                            <tr key={"opmetric-" + i}>
                                                <th scope="row">{i}</th>
                                                <td>{item.metric}</td>
                                                <td>{item.resource_type}</td>
                                                <td>{item.resource_name}</td>
                                                <td>{item.timeseries[0]["value"] * 10}%</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </Table>
                            </div>
                        </div>
                    </CardBody>
                </Card>
            </div>
        );
    }
}

export default OperationalMetricsTable;
