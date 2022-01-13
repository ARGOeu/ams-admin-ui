import React, { Component } from "react";
import "./App.css";
import UserTable from "./UserTable";
import OperationalMetricsTable from "./OperationalMetricsTable";
import AverageProjectMetricsTable from "./AverageProjectMetricsTable";
import {
    BrowserRouter,
    Route,
    Switch,
    Link,
    Redirect,
    withRouter
} from "react-router-dom";
import About from "./About";
import ProjectTable from "./ProjectTable";
import ProjectDetails from "./ProjectDetails";
import TopicTable from "./TopicTable";
import CreateUser from "./CreateUser";
import CreateProject from "./CreateProject";
import UserDetails from "./UserDetails";
import Welcome from "./Welcome";
import Login from "./Login";
import TopicDetails from "./TopicDetails";
import CreateTopic from "./CreateTopic";
import TopicACL from "./TopicACL";
import TopicPublish from "./TopicPublish";
import SubTable from "./SubTable";
import SubDetails from "./SubDetails";
import CreateSub from "./CreateSub";
import UpdateSub from "./UpdateSub";
import SubACL from "./SubACL";
import SubPull from "./SubPull"
import SubModOffset from "./SubModOffset";
import SchemaDetails from "./SchemaDetails";
import "bootstrap/dist/css/bootstrap.min.css";

import DataManager from "./DataManager";

import Authen from "./Authen";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import {
    Collapse,
    Navbar,
    NavbarToggler,
    NavbarBrand,
    Nav,
    Container,
    Row,
    Col,
    NavItem,
    Popover,
    PopoverBody,
    PopoverHeader,
    ListGroup,
    ListGroupItem,
    ListGroupItemHeading,
    ListGroupItemText
} from "reactstrap";

import argologo from "./argologo_color.svg";

import { library } from "@fortawesome/fontawesome-svg-core";
import {
    faBell,
    faTh,
    faQuestionCircle,
    faEllipsisV,
    faDiceD6,
    faEnvelope,
    faEnvelopeOpen,
    faUsersCog,
    faUserAstronaut,
    faUser,
    faChartBar,
    faCogs
} from "@fortawesome/free-solid-svg-icons";

import config from "./config";

library.add(
    faBell,
    faTh,
    faQuestionCircle,
    faEllipsisV,
    faDiceD6,
    faEnvelope,
    faEnvelopeOpen,
    faUsersCog,
    faUserAstronaut,
    faUser,
    faChartBar,
    faCogs
);

const ProtectedRoute = ({
    action,
    toDelete,
    restrictPublish,
    auth: isAuth,
    component: Component,
    ...rest
}) => (
    <Route
        {...rest}
        render={props =>
            isAuth === true ? (
                <Component {...props} toDelete={toDelete} restrictPublish={restrictPublish} action={action} />
            ) : (
                <Redirect
                    to={{
                        pathname: "/login",
                        state: { from: props.location }
                    }}
                />
            )
        }
    />
);

class App extends Component {
    constructor(props) {
        super(props);

        this.authen = new Authen();
        this.authen.tryLogin(this.authen.getToken());

        this.state = {
            users: [],
            popoverOpen: false,
            popoverOpen2: false,
            popoverOpen3: false,
            isLogged: this.authen.isLogged(),
            isServiceAdmin: this.authen.isServiceAdmin(),
            isProjectAdmin: this.authen.isProjectAdmin(),
            isConsumer: this.authen.isConsumer(),
            isPublisher: this.authen.isPublisher()
        };

        this.toggle = this.toggle.bind(this);
        this.toggle2 = this.toggle2.bind(this);
        this.toggle3 = this.toggle3.bind(this);
        window.DM = new DataManager(
            this.authen.getEndpoint(),
            this.authen.getToken()
        );
    }

    toggle() {
        this.setState({
            popoverOpen: !this.state.popoverOpen
        });
    }

    toggle2() {
        this.setState({
            popoverOpen2: !this.state.popoverOpen2
        });
    }

    toggle3() {
        this.setState({
            popoverOpen3: !this.state.popoverOpen3
        });
    }

    render() {
        // Create a navigation bar with links to different routes
        // Create a BrowserRouter Wrapper above App
        // Use Switch with two Routers to render two views: UserManager and About

        // create a service backend label if logged
        var backendLabel = null;
        let barColor = "#6E8DC4";

        if (this.authen.isLogged()) {
            backendLabel = (
                <span>
                    : [{" "}
                    <code
                        style={{
                            fontWeight: "bold",
                            color: "white",
                            fontSize: "1em"
                        }}
                    >
                        {this.authen.getEndpoint()}
                    </code>{" "}
                    ]
                </span>
            );
            barColor = config.endpoint_colors[this.authen.getEndpoint()];
        }

        let user_roles = null;

        // check eligible actions
        const allowUsers = this.state.isServiceAdmin || this.state.isProjectAdmin;
        const allowProjects =
            this.state.isServiceAdmin || this.state.isProjectAdmin;
        const allowTopics =
            this.state.isServiceAdmin ||
            this.state.isProjectAdmin ||
            this.state.isPublisher;
        const allowSubs =
            this.state.isServiceAdmin ||
            this.state.isProjectAdmin ||
            this.state.isConsumer;
        const allowOperationalMetrics = this.state.isServiceAdmin
        const allowAverageProjectMetrics = this.state.isServiceAdmin
        const allowSchema = this.state.isServiceAdmin || this.state.isProjectAdmin;

      

        let servRoles = this.authen.getServiceRoles();
        if (servRoles.length > 0) {
            if (servRoles[0] === "service_admin") {
                user_roles = (
                    <span>
                        <FontAwesomeIcon icon="crown" /> {servRoles[0]}
                        <br />
                    </span>
                );
            }
        } else {
            let roleList = [];
            let roles = this.authen.getProjectsPerRole();
            for (let key in roles) {
               
                let projectList = [];
                let projects = Array.from(roles[key]);
                if (key === "project_admin") {
                    for (let project of projects) {
                        projectList.push(
                            <Link
                                key={project}
                                className="badge blue-badge mr-2 p-2 mb-2 text-white"
                                to={"/projects/details/" + project}
                            >
                                {project}
                            </Link>
                        );
                    }
                    roleList.push(
                        <li key={key}>
                            <strong>
                                <FontAwesomeIcon icon="shield-alt" /> {key}:
                            </strong>
                            <br />
                            {projectList}
                        </li>
                    );
                } else if (key === "publisher") {
                    for (let project of projects) {
                        projectList.push(
                            <Link
                                key={project}
                                className="badge blue-badge mr-2 p-2 mb-2 text-white"
                                to={"/topics#" + project}
                            >
                                {project}
                            </Link>
                        );
                    }
                    roleList.push(
                        <li key={key}>
                            <strong>
                                <FontAwesomeIcon icon="cloud-upload-alt" /> {key}:
                            </strong>
                            <br />
                            {projectList}
                        </li>
                    );
                } else if (key === "consumer") {
                    for (let project of projects) {
                        projectList.push(
                            <Link
                                key={project}
                                className="badge blue-badge mr-2 p-2 mb-2 text-white"
                                to={"/subs#" + project}
                            >
                                {project}
                            </Link>
                        );
                    }
                    roleList.push(
                        <li key={key}>
                            <strong>
                                <FontAwesomeIcon icon="cloud-download-alt" /> {key}:
                            </strong>
                            <br />
                            {projectList}
                        </li>
                    );
                }
            }

            user_roles = (
                <ul style={{ listStyle: "none", padding: 0 }}>{roleList}</ul>
            );
        }

        return (
            <BrowserRouter>
                <div className="App">
                    <Navbar
                        id="argo-nav"
                        expand="md"
                        style={{ backgroundColor: barColor }}
                    >
                        <NavbarBrand className="text-light" href="/">
                            <img
                                alt="argo admin ui"
                                className="logo img-responsive"
                                src={argologo}
                            />
                            <strong>ARGO</strong> Admin UI {backendLabel}
                        </NavbarBrand>
                        <NavbarToggler onClick={this.toggle} />
                        <Collapse isOpen={this.state.isOpen} navbar>
                            <Nav navbar className="ml-auto" id="userbar">
                                {this.state.isLogged && (
                                    <React.Fragment>
                                        <NavItem className="non-user-nav">
                                            <Link
                                                id="service-details"
                                                onClick={this.toggle2}
                                                to="#"
                                            >
                                                <FontAwesomeIcon
                                                    className="ico-nav"
                                                    icon="th"
                                                />
                                                <Popover
                                                    placement="bottom"
                                                    isOpen={
                                                        this.state.popoverOpen2
                                                    }
                                                    target="service-details"
                                                    toggle={this.toggle2}
                                                >
                                                    <PopoverHeader>
                                                        Services
                                                    </PopoverHeader>
                                                    <PopoverBody>
                                                        <strong>
                                                            {config.service}
                                                        </strong>
                                                        {": " +
                                                            this.authen.getEndpoint()}
                                                    </PopoverBody>
                                                </Popover>
                                            </Link>
                                        </NavItem>
                                    </React.Fragment>
                                )}
                                <NavItem className="non-user-nav">
                                    <Link
                                        id="help-details"
                                        to="#"
                                        onClick={this.toggle3}
                                    >
                                        <FontAwesomeIcon
                                            className="ico-nav"
                                            icon="question-circle"
                                        />
                                        <Popover
                                            placement="bottom"
                                            isOpen={
                                                this.state.popoverOpen3
                                            }
                                            target="help-details"
                                            toggle={this.toggle3}
                                        >
                                            <PopoverHeader>
                                                Help
                                            </PopoverHeader>
                                            <PopoverBody>
                                                <ListGroup>
                                                    <ListGroupItem
                                                        action
                                                        href="https://argoeu.github.io/argo-messaging/"
                                                        target= "_blank"
                                                        tag="a"
                                                    >
                                                        <ListGroupItemHeading>
                                                            <FontAwesomeIcon
                                                                className="side-ico"
                                                                icon="envelope-open"
                                                            />
                                                            Documentation
                                                        </ListGroupItemHeading>
                                                        <ListGroupItemText>
                                                            ARGO Messaging service v1 documentation.
                                                        </ListGroupItemText>
                                                    </ListGroupItem>
                                                    <ListGroupItem
                                                        action
                                                        href="https://api-doc.argo.grnet.gr/argo-messaging"
                                                        tag="a"
                                                        target= "_blank"
                                                    >
                                                        <ListGroupItemHeading>
                                                            <FontAwesomeIcon
                                                                className="side-ico"
                                                                icon="cogs"
                                                            />
                                                            API
                                                        </ListGroupItemHeading>
                                                        <ListGroupItemText>
                                                            ARGO Messaging service v1 API.
                                                        </ListGroupItemText>
                                                    </ListGroupItem>
                                                </ListGroup>
                                            </PopoverBody>
                                        </Popover>
                                    </Link>
                                </NavItem>
                                {this.state.isLogged && (
                                    <React.Fragment>
                                        <NavItem className="non-user-nav">
                                            <Link
                                                id="user-details"
                                                onClick={this.toggle}
                                                to="#"
                                            >
                                                <FontAwesomeIcon
                                                    className="ico-nav"
                                                    icon="ellipsis-v"
                                                />
                                                <span>&nbsp;</span>
                                                <FontAwesomeIcon
                                                    className="ico-user"
                                                    icon="user-astronaut"
                                                />
                                            </Link>
                                            <Popover
                                                placement="bottom"
                                                isOpen={this.state.popoverOpen}
                                                target="user-details"
                                                toggle={this.toggle}
                                            >
                                                <PopoverHeader>
                                                    {this.authen.getUsername()}
                                                </PopoverHeader>
                                                <PopoverBody>
                                                    {user_roles}
                                                    <button
                                                        onClick={() => {
                                                            this.authen.setLogout();
                                                            this.setState({
                                                                isLogged: false
                                                            });
                                                            this.toggle();
                                                        }}
                                                    >
                                                        logout
                                                    </button>
                                                </PopoverBody>
                                            </Popover>
                                        </NavItem>
                                    </React.Fragment>
                                )}
                            </Nav>
                        </Collapse>
                    </Navbar>
                    <nav />

                    <Container fluid={true}>
                        <Row>
                            {this.state.isLogged && (
                                <Col
                                    id="sticky-sidebar"
                                    sm={{ size: 2, order: 0 }}
                                >
                                    <div className="sticky-top">
                                        <Nav vertical id="sidebar">
                                            <span className="service-name">
                                                AMS
                                            </span>
                                            {allowProjects && (
                                                <NavItem>
                                                    <Link to="/projects">
                                                        <FontAwesomeIcon
                                                            className="side-ico"
                                                            icon="dice-d6"
                                                        />
                                                        Projects
                                                    </Link>
                                                </NavItem>
                                            )}
                                            {allowTopics && (
                                                <NavItem>
                                                    <Link to="/topics">
                                                        <FontAwesomeIcon
                                                            className="side-ico"
                                                            icon="envelope"
                                                        />
                                                        Topics
                                                    </Link>
                                                </NavItem>
                                            )}
                                            {allowSubs && (
                                                <NavItem>
                                                    <Link to="/subs">
                                                        <FontAwesomeIcon
                                                            className="side-ico"
                                                            icon="envelope-open"
                                                        />
                                                        Subscriptions
                                                    </Link>
                                                </NavItem>
                                            )}
                                            {allowUsers && (
                                                <NavItem>
                                                    <Link to="/users">
                                                        <FontAwesomeIcon
                                                            className="side-ico"
                                                            icon="users-cog"
                                                        />
                                                        Users
                                                    </Link>
                                                </NavItem>
                                            )}
                                            {allowOperationalMetrics && (
                                                <NavItem>
                                                    <Link to="/operational_metrics">
                                                        <FontAwesomeIcon
                                                            className="side-ico"
                                                            icon="chart-bar"
                                                        />
                                                        Operational Metrics
                                                    </Link>
                                                </NavItem>
                                            )}
                                            {allowAverageProjectMetrics && (
                                                <NavItem>
                                                    <Link to="/average_project_metrics">
                                                        <FontAwesomeIcon
                                                            className="side-ico"
                                                            icon="chart-bar"
                                                        />
                                                        Average Project Metrics
                                                    </Link>
                                                </NavItem>
                                            )}
                                        </Nav>
                                    </div>
                                </Col>
                            )}
                            <Col id="main">
                                <main>
                                    <Switch>
                                        <Route
                                            exact
                                            path="/welcome"
                                            component={Welcome}
                                        />
                                        <Route
                                            exact
                                            path="/login"
                                            component={withRouter(Login)}
                                        />
                                        <ProtectedRoute
                                            exact
                                            auth={
                                                this.authen.isLogged() &&
                                                allowSubs
                                            }
                                            path="/subs/mod-offset/projects/:projectname/subscriptions/:subname"
                                            component={SubModOffset}
                                        />
                                         <ProtectedRoute
                                            exact
                                            auth={
                                                this.authen.isLogged() &&
                                                allowSubs
                                            }
                                            path="/subs/pull/projects/:projectname/subscriptions/:subname"
                                            component={SubPull}
                                        />
                                        <ProtectedRoute
                                            exact
                                            auth={
                                                this.authen.isLogged() &&
                                                allowSubs
                                            }
                                            path="/subs/update/projects/:projectname/subscriptions/:subname"
                                            component={UpdateSub}
                                        />
                                        <ProtectedRoute
                                            exact
                                            auth={
                                                this.authen.isLogged() &&
                                                allowSubs
                                            }
                                            path="/subs/delete/projects/:projectname/subscriptions/:subname"
                                            component={SubDetails}
                                            toDelete={true}
                                        />
                                        <ProtectedRoute
                                            exact
                                            auth={
                                                this.authen.isLogged() &&
                                                allowProjects
                                            }
                                            path="/subs/mod-acl/projects/:projectname/subscriptions/:subname"
                                            component={SubACL}
                                        />
                                        <ProtectedRoute
                                            exact
                                            auth={
                                                this.authen.isLogged() &&
                                                allowProjects
                                            }
                                            path="/subs/create"
                                            component={CreateSub}
                                            action="create"
                                        />
                                        <ProtectedRoute
                                            exact
                                            auth={
                                                this.authen.isLogged() &&
                                                allowSubs
                                            }
                                            path="/subs/details/projects/:projectname/subscriptions/:subname"
                                            component={SubDetails}
                                            toDelete={false}
                                        />
                                        <ProtectedRoute
                                            exact
                                            auth={
                                                this.authen.isLogged() &&
                                                allowSubs
                                            }
                                            path="/subs"
                                            component={SubTable}
                                        />
                                        <ProtectedRoute
                                            exact
                                            auth={
                                                this.authen.isLogged() &&
                                                allowProjects
                                            }
                                            path="/topics/delete/projects/:projectname/topics/:topicname"
                                            component={TopicDetails}
                                            toDelete={true}
                                        />
                                        <ProtectedRoute
                                            exact
                                            auth={
                                                this.authen.isLogged() &&
                                                allowTopics
                                            }
                                            path="/topics/mod-acl/projects/:projectname/topics/:topicname"
                                            component={TopicACL}
                                        />
                                        <ProtectedRoute
                                            exact
                                            auth={
                                                this.authen.isLogged() &&
                                                allowTopics
                                            }
                                            path="/topics/publish/projects/:projectname/topics/:topicname"
                                            component={TopicPublish}
                                        />
                                        <ProtectedRoute
                                            exact
                                            auth={
                                                this.authen.isLogged() &&
                                                allowProjects
                                            }
                                            path="/topics/create"
                                            component={CreateTopic}
                                            action="create"
                                        />
                                        <ProtectedRoute
                                            exact
                                            auth={
                                                this.authen.isLogged() &&
                                                allowTopics
                                            }
                                            path="/topics"
                                            component={TopicTable}
                                        />
                                        <ProtectedRoute
                                            exact
                                            auth={
                                                this.authen.isLogged() &&
                                                allowProjects
                                            }
                                            path="/projects"
                                            component={ProjectTable}
                                        />
                                        <ProtectedRoute
                                            exact
                                            auth={
                                                this.authen.isLogged() &&
                                                allowTopics
                                            }
                                            path="/topics/details/projects/:projectname/topics/:topicname"
                                            component={TopicDetails}
                                            toDelete={false}
                                        />
                                        <ProtectedRoute
                                            exact
                                            auth={
                                                this.authen.isLogged() &&
                                                allowProjects
                                            }
                                            path="/projects/details/:projectname"
                                            component={ProjectDetails}
                                            toDelete={false}
                                        />
                                        <ProtectedRoute
                                            exact
                                            auth={
                                                this.authen.isLogged() &&
                                                allowProjects
                                            }
                                            path="/projects/delete/:projectname"
                                            component={ProjectDetails}
                                            toDelete={true}
                                        />
                                        <ProtectedRoute
                                            exact
                                            auth={
                                                this.authen.isLogged() &&
                                                allowUsers
                                            }
                                            path="/projects/create"
                                            component={CreateProject}
                                            action="create"
                                        />
                                        <ProtectedRoute
                                            exact
                                            auth={
                                                this.authen.isLogged() &&
                                                allowProjects
                                            }
                                            path="/projects/update/:projectname"
                                            component={CreateProject}
                                            action="update"
                                        />
                                        <ProtectedRoute
                                            exact
                                            auth={this.authen.isLogged()}
                                            path="/"
                                            component={Welcome}
                                        />
                                        <ProtectedRoute
                                            exact
                                            auth={
                                                this.authen.isLogged() &&
                                                allowUsers
                                            }
                                            path="/users/delete/:username"
                                            component={UserDetails}
                                            toDelete={true}
                                        />
                                        <ProtectedRoute
                                            exact
                                            auth={
                                                this.authen.isLogged() &&
                                                allowUsers
                                            }
                                            path="/users/details/:username"
                                            component={UserDetails}
                                            toDelete={false}
                                        />
                                        <ProtectedRoute
                                            exact
                                            auth={
                                                this.authen.isLogged() &&
                                                allowUsers
                                            }
                                            path="/users/update/:username"
                                            component={CreateUser}
                                            action="update"
                                        />
                                        <ProtectedRoute
                                            exact
                                            auth={
                                                this.authen.isLogged() &&
                                                allowUsers
                                            }
                                            path="/users/create"
                                            component={CreateUser}
                                            action="create"
                                        />
                                        <ProtectedRoute
                                            exact
                                            auth={
                                                this.authen.isLogged() &&
                                                allowUsers
                                            }
                                            path="/users"
                                            component={UserTable}
                                        />
                                        <ProtectedRoute
                                            auth={this.authen.isLogged()}
                                            exact
                                            path="/about"
                                            component={About}
                                        />
                                        <ProtectedRoute
                                            auth={this.authen.isLogged()}
                                            exact
                                            path="/operational_metrics"
                                            component={OperationalMetricsTable}
                                        />
                                        <ProtectedRoute
                                            auth={this.authen.isLogged()}
                                            exact
                                            path="/average_project_metrics"
                                            component={AverageProjectMetricsTable}
                                        />
                                        <ProtectedRoute
                                            exact
                                            auth={
                                                this.authen.isLogged() &&
                                                allowSchema
                                            }
                                            path="/projects/:projectname/schemas/:schemaname"
                                            component={SchemaDetails}
                                            toDelete={false}
                                        />
                                        <ProtectedRoute
                                            exact
                                            auth={
                                                this.authen.isLogged() &&
                                                allowProjects
                                            }
                                            path="/projects/:projectname/schemas/delete/:schemaname"
                                            component={SchemaDetails}
                                            toDelete={true}
                                        />
                                        <Redirect to="/" />
                                    </Switch>
                                </main>
                            </Col>
                        </Row>
                    </Container>

                    <footer className="page-footer font-small blue">
                        <div className="footer-copyright text-center py-3">
                            © 2018-2019 Copyright:
                            <a href="/about">ARGO</a>
                        </div>
                    </footer>
                </div>
            </BrowserRouter>
        );
    }
}

export default App;
