import React from "react";
import Authen from "./Authen";
import config from "./config";
import Autocomplete from "react-autocomplete";
import { Card, CardBody, CardHeader, Form,
         FormGroup, Input, Label, Col, Row, Button, Table} from "reactstrap";
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
    faStar,
    faTimesCircle
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
    faTimesCircle
);

function getProjectColorIcon(projectName) {
    let color = "#616A6B";
    if (projectName in config.project_colors) {
        color = config.project_colors[projectName];
    }

    return <FontAwesomeIcon icon="dice-d6" style={{ color: color }} />;
}

class AverageProjectsMetricsTable extends React.Component {
    constructor(props) {
        super(props);
        this.authen = new Authen();
        this.DM = new DataManager(
            this.authen.getEndpoint(),
            this.authen.getToken()
        );
        if (!this.authen.isLogged()){
            this.state = {
                allProjects: true,
                users: [],
                projects: [],
                value:"",
                isServiceAdmin: false,
                isProjectAdmin: false,
                metricsQuery: {}
            };
        }else {
            this.state = {
                allProjects: true,
                users: [],
                projects: [],
                value:"",
                isServiceAdmin: this.authen.isServiceAdmin(),
                isProjectAdmin: this.authen.isProjectAdmin(),
                metricsQuery: {}
            }
        }
    }

    apiGetProjectOperationalMetrics(start_date, from_date, projects) {
        if (this.state.isServiceAdmin) {
            this.DM.projectOperationalGetMetrics(start_date, from_date, projects).then(r => {
                if (r.done) {
                    console.log(r.data);
                    this.setState({ report: r.data });
                }
            });
        }
        else if (this.state.isProjectAdmin) {
            this.DM.getUsageReport(start_date, from_date, projects).then(r => {
                if (r.done) {
                    this.setState({ report: r.data.va_metrics });
                }
            });
        }
    }

    componentDidMount(){
        if (this.authen.isLogged()) {
            this.setState({
                value: "",
                allProjects: true,
                users: [],
                projects: this.apiGetProjects(),
                report: this.apiGetProjectOperationalMetrics(),
                metricsQuery: {
                    to: "",
                    from: "",
                    projects: []
                }
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
            if (this.authen.isServiceAdmin()){
                this.setState({users:undefined, value: "", allProjects: true})
            this.DM.userGet().then(r => {
                if (r.done) {
                    this.setState({ users: r.data.users });
                }
            });
            } else {
                this.setState({users:[], value: "", allProjects: true})
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
        if (serviceRoles){
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
                {this.state.report &&
                <Row>
                    <Col className="" xs="4">
                        <Card className="mb-2">
                            <CardHeader>Total Messages</CardHeader>
                            <CardBody>
                                {this.state.report.projects_metrics.total_message_count}
                            </CardBody>
                        </Card>
                    </Col>
                    <Col className="" xs="4">
                        <Card className="mb-2">
                            <CardHeader>Average Daily Messages</CardHeader>
                            <CardBody>
                                {this.state.report.projects_metrics.average_daily_messages}
                            </CardBody>
                        </Card>
                    </Col>
                    <Col className="" xs="4">
                        <Card className="mb-2">
                            <CardHeader>Total Users</CardHeader>
                            <CardBody>
                                {this.state.report.total_users_count}
                            </CardBody>
                        </Card>
                    </Col>
                    <Col className="" xs="4">
                        <Card className="mb-2">
                            <CardHeader>Total Topics</CardHeader>
                            <CardBody>
                                {this.state.report.total_topics_count}
                            </CardBody>
                        </Card>
                    </Col>
                    <Col className="" xs="4">
                        <Card className="mb-2">
                            <CardHeader>Total Subscriptions</CardHeader>
                            <CardBody>
                                {this.state.report.total_subscriptions_count}
                            </CardBody>
                        </Card>
                    </Col>
                </Row>
                }    
                <Card className="mb-2">
                    <CardHeader>Project Metrics</CardHeader>
                    <CardBody>
                        <Card className="mb-2" style={{border: "none"}}>
                            <Form>
                                <Row>
                                    <Col
                                        className=""
                                        xs="3"
                                    >
                                        <FormGroup>
                                            <Label for="exampleDate">From</Label>
                                            <Input
                                                id="fromDate"
                                                name="date"
                                                placeholder="date placeholder"
                                                type="date"
                                                onChange={(event, value) => {
                                                    const newMetricsQuery = {
                                                        ...this.state.metricsQuery,
                                                        from: event.target.value
                                                    };
                                                    this.setState({metricsQuery: newMetricsQuery});
                                                }}
                                            />
                                        </FormGroup>
                                    </Col>
                                    <Col
                                        className=""
                                        xs="3"
                                    >
                                        <FormGroup>
                                            <Label for="exampleDate">To</Label>
                                            <Input
                                                id="exampleDate"
                                                name="date"
                                                placeholder="date placeholder"
                                                type="date"
                                                onChange={(event, value) => {
                                                    const newMetricsQuery = {
                                                        ...this.state.metricsQuery,
                                                        to: event.target.value
                                                    };
                                                    this.setState({metricsQuery: newMetricsQuery});
                                                }}
                                            />
                                        </FormGroup>
                                    </Col>
                                    <Col
                                        className=""
                                        xs="5"
                                    >
                                        <FormGroup>
                                            <Label for="exampleDate">Projects</Label>
                                            <Autocomplete
                                                value={this.state.value}
                                                inputProps={{
                                                    id: "states-autocomplete",
                                                    className: "form-control"
                                                }}
                                                wrapperProps={{
                                                    className: "input-group-append"
                                                }}
                                                wrapperStyle={{ width: "75%" }}
                                                items={this.getProjects()}
                                                getItemValue={(item) => this.state.metricsQuery.projects.toString()}
                                                shouldItemRender={this.matchProjects}
                                                onSelect={(event, value) => {
                                                    let p = new Set(this.state.metricsQuery.projects)
                                                    p.add(value.name);
                                                    const newMetricsQuery = {
                                                        ...this.state.metricsQuery,
                                                        projects: Array.from(p)
                                                    };
                                                    this.setState({metricsQuery: newMetricsQuery});
                                                }}
                                                onChange={(event, value) => {
                                                    this.setState({ value });
                                                }}
                                                renderMenu={children => (
                                                    <div className="menu">{children}</div>
                                                )}
                                                renderItem={(item, isHighlighted) => (
                                                    <div
                                                    className={`item ${
                                                        isHighlighted ? "item-highlighted" : ""
                                                    }`}
                                                    key={item.name}
                                                    >
                                                    {getProjectColorIcon(item.name)}
                                                    <span className="ml-2">{item.name}</span>
                                                    </div>
                                                )}
                                                />
                                                {this.state.metricsQuery.projects &&
                                                 this.state.metricsQuery.projects.length > 0 &&
                                                 this.state.metricsQuery.projects.map((item,i) =>
                                                <span className="btn btn-danger mr-2 mt-2"
                                                      id={item} key={"filter-project-"+item}
                                                      onClick={
                                                    (event) => {
                                                        let p = new Set(this.state.metricsQuery.projects)
                                                        p.delete(event.currentTarget.id);
                                                        const newMetricsQuery = {
                                                            ...this.state.metricsQuery,
                                                            projects: Array.from(p)
                                                        };
                                                        this.setState({metricsQuery: newMetricsQuery});
                                                    }}>
                                                    <FontAwesomeIcon icon="times-circle" />
                                                    <span>&nbsp;</span>
                                                    {item}
                                                </span>
                                                )
                                                }
                                        </FormGroup>
                                    </Col>
                                    <Col
                                        className=""
                                        xs="1"
                                    >
                                        <Row>
                                            <Label>&#8203;</Label>
                                        </Row>
                                        <Row>
                                        <FormGroup className="d-flex align-items-center">
                                            <Button
                                                type="button"
                                                onClick={() => {
                                                let value = this.apiGetProjectOperationalMetrics(this.state.metricsQuery.from,
                                                                                    this.state.metricsQuery.to,
                                                                                    this.state.metricsQuery.projects);
                                                if (value) {
                                                    this.setState({report: value.va_metrics});
                                                }
                                                }}>
                                                Submit
                                            </Button>
                                        </FormGroup>
                                        </Row>
                                    </Col>
                                </Row>
                            </Form>
                        </Card>
                        <Card className="mb-2">
                            <CardBody>
                            <div style={{ overflow: "hidden" }}>
                                <div className="row p-3">
                                    <Table key="opmetric-table-{i}" hover>
                                        <thead>
                                            <tr>
                                                <th>#</th>
                                                <th>Name</th>
                                                <th>Average Daily Messages</th>
                                                <th>Messages</th>
                                                <th>Subscriptions</th>
                                                <th>Topics</th>
                                                <th>Users</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                {this.state.report &&
                                this.state.report.projects_metrics.projects.map((item,i)=>
                                        <tr key={"opmetric-" + i}>
                                            <td>{i}</td>
                                            <td>{item.project}</td>
                                            <td>{item.average_daily_messages}</td>
                                            <td>{item.message_count}</td>
                                            <td>{item.subscriptions_count}</td>
                                            <td>{item.topics_count}</td>
                                            <td>{item.users_count}</td>
                                        </tr>
                                )}
                                        </tbody>
                                    </Table>
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

export default AverageProjectsMetricsTable;
