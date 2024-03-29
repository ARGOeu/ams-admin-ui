import React from "react";
import Authen from "./Authen";
import argologoAnim from "./argologo_anim.svg";
import config from "./config";
import { Link } from "react-router-dom";
import Autocomplete from "react-autocomplete";
import ReactTable from "react-table";
import { Card, CardBody } from "reactstrap";
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

// const colors = [
//     "#A6ACAF",
//     "#616A6B",
//     "#717D7E",
//     "#616A6B",
//     "#884EA0",
//     "#7D3C98",
//     "#283747",
//     "#212F3D"
// ];


function getProjectColorIcon(projectName) {
    let color = "#616A6B";
    if (projectName in config.project_colors) {
        color = config.project_colors[projectName];
    }

    return <FontAwesomeIcon icon="dice-d6" style={{ color: color }} />;
}

class UserTable extends React.Component {
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
                isProjectAdmin: false
            };
        }else {
            this.state = {
                allProjects: true,
                users: [],
                projects: [],
                value:"",
                isServiceAdmin: this.authen.isServiceAdmin(),
                isProjectAdmin: this.authen.isProjectAdmin()
            }
        } 
    }

    componentDidMount(){
        if (this.authen.isLogged()) {
            this.setState({
                value: "",
                allProjects: true,
                users: [],
                projects: this.apiGetProjects()
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

        
        const columns = [
            {
                Header: "#",
                accessor: "service_roles",
                Cell: props => (
                    <span className="admin">
                        {this.beautifyServiceRoles(props.value)}
                    </span>
                ),
                width: 40,
                headerClassName: "list-header",
                className: "text-center"
            },
            {
                Header: "Name",
                accessor: "name",
                Cell: props => {
                    if (this.state.isServiceAdmin) {
                        return (
                            <Link
                        className="item-link"
                        to={"/users/details/" + props.value}
                    >
                        {props.value}
                    </Link>
                        )
                    } else {
                        return (
                            <span>{props.value}</span>
                        )
                    }
                    
                    }
                ,
                
                minWidth: 55,
                filterable: true,
                headerClassName: "list-header"
            },
            {
                Header: "Email",
                accessor: "email",
                minWidth: 40,
                filterable: true,
                headerClassName: "list-header"
            },
            {
                Header: "Date",
                accessor: "modified_on",
                Cell: props => (
                    <span className="date-format">
                        {props.value.split("T")[0]}
                    </span>
                ),
                width: 100,
                headerClassName: "list-header"
            }
        ];
        
        if (this.state.isServiceAdmin){
                columns.push({
                    Header: "Actions",
                    accessor: "name",
                    Cell: props => (
                        <div className="edit-buttons">
                            <Link
                                className="btn btn-light btn-sm ml-1 mr-1"
                                to={"/users/details/" + props.value}
                            >
                                <FontAwesomeIcon icon="list" />
                            </Link>
                            <Link
                                className="btn btn-light btn-sm ml-1 mr-1"
                                to={"/users/update/" + props.value}
                            >
                                <FontAwesomeIcon icon="pen" />
                            </Link>
                            <Link
                                className="btn btn-light btn-sm ml-1 mr-1"
                                to={"/users/delete/" + props.value}
                            >
                                <FontAwesomeIcon icon="times" />
                            </Link>
                        </div>
                    ),
                    width: 130,
                    headerClassName: "list-header",
                    className: "text-center"
                })
        }

        const userHeading = (
            <div>
                <div className="row  mb-2">
                    <div className="col-2">
                        <h2>Users</h2>
                    </div>
                    <div className="col">
                        { this.state.isServiceAdmin &&
                        <Link className="btn btn-light" to="/users/create">
                            <FontAwesomeIcon
                                className="mr-2"
                                icon="plus"
                                size="lg"
                            />{" "}
                            Create User
                        </Link>
                        }
                    </div>
                </div>
                <Card className="mb-2">
                    <CardBody>
                        <div className="row">
                            <div className="col-8">
                               
                                <div className="input-group mb-2 mr-sm-2">
                                { !this.state.allProjects && 
                                <span className="btn btn-success mr-2" onClick={e=>this.apiGetData(null)}>
                                    <FontAwesomeIcon icon="star" />
                                     <span className="ml-2">All Projects</span></span>
                                }
                                    <div className="input-group-prepend">
                                        <div className="input-group-text">
                                            Project:
                                        </div>
                                    </div>
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
                                        getItemValue={item => item.name}
                                        shouldItemRender={this.matchProjects}
                                        onChange={(event, value) => {
                                            this.setState({ value });
                                        }}
                                        onSelect={value => {
                                            this.setState({ value });
                                            this.apiGetData(value);
                                        }}
                                        renderMenu={children => (
                                            <div className="menu">
                                                {children}
                                            </div>
                                        )}
                                        renderItem={(item, isHighlighted) => (
                                            <div
                                                className={`item ${
                                                    isHighlighted
                                                        ? "item-highlighted"
                                                        : ""
                                                }`}
                                                key={item.name}
                                            >
                                                {getProjectColorIcon(item.name)}
                                                <span className="ml-2">
                                                    {item.name}
                                                </span>
                                            </div>
                                        )}
                                    />
                                </div>
                            </div>
                            <div className="col-4 p-2">
                                Type a project name to list it's user members
                            </div>
                        </div>
                    </CardBody>
                </Card>
            </div>
        );

        if (this.state.users === undefined) {
            return (
                <div>
                    {userHeading}
                
                    <div className="card text-center p-4">
                        <img alt="argo admin ui" src={argologoAnim} />
                        <h3>Loading data...</h3>
                    </div>
                </div>
            );
        }

        return (
            <div>
                {userHeading}
                
                <div className="card p-4">
                    <h4 className="pt-2 pb-2">List of users</h4>
                    <ReactTable
                        data={this.state.users}
                        columns={columns}
                        className="-striped -highlight"
                        defaultPageSize={20}
                        defaultFilterMethod={
                            (filter, row, column) => {
                                const id = filter.pivotId || filter.id
                                return row[id] !== undefined ? String(row[id]).includes(filter.value) : true
                            }
                        }
                        
                    />
                </div>
            </div>
        );
    }
}

export default UserTable;
