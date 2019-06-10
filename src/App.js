import React, { Component } from "react";
import "./App.css";
import UserTable from "./UserTable";
import { BrowserRouter, Route, Switch, Link, Redirect, withRouter } from "react-router-dom";
import About from "./About";
import ProjectTable from "./ProjectTable";
import ProjectDetails from "./ProjectDetails"
import TopicTable from "./TopicTable";
import CreateUser from "./CreateUser";
import CreateProject from "./CreateProject";
import UserDetails from "./UserDetails";
import Welcome from "./Welcome";
import Login from "./Login";
import TopicDetails from "./TopicDetails"
import CreateTopic from "./CreateTopic"
import TopicACL from "./TopicACL"
import SubTable from "./SubTable"
import SubDetails from "./SubDetails"
import CreateSub from "./CreateSub"
import UpdateSub from "./UpdateSub"
import SubACL from "./SubACL"
import SubModOffset from "./SubModOffset"
import "bootstrap/dist/css/bootstrap.min.css";

import DataManager from "./DataManager"

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
  PopoverHeader
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
  faUser
} from "@fortawesome/free-solid-svg-icons";

import config from './config';

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
  faUser
);



const ProtectedRoute = ({ action, toDelete, auth: isAuth, component: Component, ...rest }) => (
  <Route
    {...rest}
    render={props =>
      isAuth === true ? (
        <Component {...props} toDelete={toDelete} action={action} />
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
      isLogged: this.authen.isLogged()
    };

    this.toggle = this.toggle.bind(this);
    this.toggle2 = this.toggle2.bind(this);
    window.DM = new DataManager(this.authen.getEndpoint(), this.authen.getToken())
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


  render() {
    // Create a navigation bar with links to different routes
    // Create a BrowserRouter Wrapper above App
    // Use Switch with two Routers to render two views: UserManager and About

    // create a service backend label if logged 
    var backendLabel=null;
    let barColor = "#6E8DC4";

    if (this.authen.isLogged()) {
      backendLabel =  <span>: [ <code style={{fontWeight:"bold",color:"white",fontSize:"1em"}}>{this.authen.getEndpoint()}</code> ]</span>
      barColor = config.endpoint_colors[this.authen.getEndpoint()];
    }



    return (
      <BrowserRouter>
        <div className="App">
          <Navbar id="argo-nav" expand="md" style={{backgroundColor:barColor}}>
            <NavbarBrand className="text-light">
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
                  <React.Fragment >
                    <NavItem className="non-user-nav">
                      <Link to="#">
                        <FontAwesomeIcon className="ico-nav" icon="bell" />
                      </Link>
                    </NavItem>
                    <NavItem className="non-user-nav">
                      <Link id="service-details" onClick={this.toggle2} to="#">
                        <FontAwesomeIcon className="ico-nav" icon="th" />
                        <Popover
                        placement="bottom"
                        isOpen={this.state.popoverOpen2}
                        target="service-details"
                        toggle={this.toggle2}
                      >
                        <PopoverHeader>Services</PopoverHeader>
                        <PopoverBody>
                          <strong>{config.service}</strong>{": " + this.authen.getEndpoint()}
                        </PopoverBody>
                      </Popover>
                      </Link>
                    </NavItem>
                  </React.Fragment>
                )}
                <NavItem className="non-user-nav">
                  <Link to="#">
                    <FontAwesomeIcon
                      className="ico-nav"
                      icon="question-circle"
                    />
                  </Link>
                </NavItem>
                {this.state.isLogged && (
                  <React.Fragment>
                    <NavItem className="non-user-nav"  >
                      <Link id="user-details" onClick={this.toggle} to="#">
                        <FontAwesomeIcon
                          
                          className="ico-nav"
                          icon="ellipsis-v"
                          
                        />
                      </Link>
                      <Popover
                        placement="bottom"
                        isOpen={this.state.popoverOpen}
                        target="user-details"
                        toggle={this.toggle}
                      >
                        <PopoverHeader>{this.authen.getUsername()}</PopoverHeader>
                        <PopoverBody>
                          <button onClick={()=>{this.authen.setLogout(); this.setState({isLogged:false}); this.toggle();}}>logout</button>
                        </PopoverBody>
                      </Popover>
                    </NavItem>
                    <NavItem>
                      <FontAwesomeIcon
                        className="ico-user"
                        icon="user-astronaut"
                      />
                    </NavItem>
                  </React.Fragment>
                )}
              </Nav>
            </Collapse>
          </Navbar>
          <nav />
         
          <Container fluid={true}>
            <Row>
            {this.state.isLogged &&
              <Col id="sticky-sidebar" sm={{ size: 2, order: 0 }}>
                <div className="sticky-top">
                  <Nav vertical id="sidebar">
                    <span className="service-name">AMS</span>
                    <NavItem>
                      <Link to="/projects">
                        <FontAwesomeIcon className="side-ico" icon="dice-d6" />
                        Projects
                      </Link>
                    </NavItem>
                    <NavItem>
                      <Link to="/topics">
                        <FontAwesomeIcon className="side-ico" icon="envelope" />
                        Topics
                      </Link>
                    </NavItem>
                    <NavItem>
                      <Link to="/subs">
                        <FontAwesomeIcon
                          className="side-ico"
                          icon="envelope-open"
                        />
                        Subscriptions
                      </Link>
                    </NavItem>
                    <NavItem>
                      <Link to="/users">
                        <FontAwesomeIcon
                          className="side-ico"
                          icon="users-cog"
                        />
                        Users
                      </Link>
                    </NavItem>
                  </Nav>
                </div>
              </Col>
             }
              <Col id="main">
                <main>
                  <Switch>
                    <Route exact path="/welcome" component={Welcome}/>
                    <Route exact path="/login" component={withRouter(Login)} />
                    <ProtectedRoute 
                      exact
                      auth={this.authen.isLogged()}
                      path="/subs/mod-offset/projects/:projectname/subscriptions/:subname"
                      component={SubModOffset}
                    />
                    <ProtectedRoute exact
                      auth={this.authen.isLogged()}
                      path="/subs/update/projects/:projectname/subscriptions/:subname"
                      component={UpdateSub}
                      
                    />
                     <ProtectedRoute
                      exact 
                      auth={this.authen.isLogged()}
                      path="/subs/delete/projects/:projectname/subscriptions/:subname"
                      component={SubDetails}
                      toDelete={true}
                    />
                    <ProtectedRoute 
                      exact
                      auth={this.authen.isLogged()}
                      path="/subs/mod-acl/projects/:projectname/subscriptions/:subname"
                      component={SubACL}
                    />
                    <ProtectedRoute exact
                      auth={this.authen.isLogged()}
                      path="/subs/create"
                      component={CreateSub}
                      action="create"
                    />
                    <ProtectedRoute
                      exact 
                      auth={this.authen.isLogged()}
                      path="/subs/details/projects/:projectname/subscriptions/:subname"
                      component={SubDetails}
                      toDelete={false}
                    />
                    <ProtectedRoute
                      exact
                      auth={this.authen.isLogged()}
                      path="/subs"
                      component={SubTable}
                    />
                    <ProtectedRoute
                      exact 
                      auth={this.authen.isLogged()}
                      path="/topics/delete/projects/:projectname/topics/:topicname"
                      component={TopicDetails}
                      toDelete={true}
                    />
                    <ProtectedRoute exact
                      auth={this.authen.isLogged()}
                      path="/topics/mod-acl/projects/:projectname/topics/:topicname"
                      component={TopicACL}
                    />
                    <ProtectedRoute exact
                      auth={this.authen.isLogged()}
                      path="/topics/create"
                      component={CreateTopic}
                      action="create"
                    />
                    <ProtectedRoute
                      exact
                      auth={this.authen.isLogged()}
                      path="/topics"
                      component={TopicTable}
                    />
                    <ProtectedRoute
                      exact
                      auth={this.authen.isLogged()}
                      path="/projects"
                      component={ProjectTable}
                    />
                    <ProtectedRoute
                      exact 
                      auth={this.authen.isLogged()}
                      path="/topics/details/projects/:projectname/topics/:topicname"
                      component={TopicDetails}
                      toDelete={false}
                    />
                    <ProtectedRoute
                      exact
                      auth={this.authen.isLogged()}
                      path="/projects/details/:projectname"
                      component={ProjectDetails}
                      toDelete={false}
                    />
                    <ProtectedRoute
                      exact
                      auth={this.authen.isLogged()}
                      path="/projects/delete/:projectname"
                      component={ProjectDetails}
                      toDelete={true}
                    />
                     <ProtectedRoute exact
                      auth={this.authen.isLogged()}
                      path="/projects/create"
                      component={CreateProject}
                      action="create"
                    />
                     <ProtectedRoute exact
                      auth={this.authen.isLogged()}
                      path="/projects/update/:projectname"
                      component={CreateProject}
                      action="update"
                    />
                    <ProtectedRoute exact auth={this.authen.isLogged()} path="/" component={Welcome} />
                    <ProtectedRoute
                      exact
                      auth={this.authen.isLogged()}
                      path="/users/delete/:username"
                      component={UserDetails}
                      toDelete={true}
                    />
                    <ProtectedRoute
                      exact
                      auth={this.authen.isLogged()}
                      path="/users/details/:username"
                      component={UserDetails}
                      toDelete={false}
                    />
                    <ProtectedRoute exact
                      auth={this.authen.isLogged()}
                      path="/users/update/:username"
                      component={CreateUser}
                      action="update"
                    />
                    <ProtectedRoute exact
                      auth={this.authen.isLogged()}
                      path="/users/create"
                      component={CreateUser}
                      action="create"
                    />
                    <ProtectedRoute
                      exact
                      auth={this.authen.isLogged()}
                      path="/users"
                      component={UserTable}
                    />
                    
                    <ProtectedRoute auth={this.authen.isLogged()} exact path="/about" component={About} />
                  </Switch>
                </main>
              </Col>
            </Row>
          </Container>
          
          <footer className="page-footer font-small blue">
            <div className="footer-copyright text-center py-3">
              © 2018 Copyright:
              <a href="/about">ARGO</a>
            </div>
          </footer>
        </div>
      </BrowserRouter>
    );
  }
}

export default App;
