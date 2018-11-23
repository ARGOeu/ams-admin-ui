import React, { Component } from "react";
import "./App.css";
import UserList from "./UserList";
import { BrowserRouter, Route, Switch, Link, Redirect, withRouter } from "react-router-dom";
import About from "./About";
import Subscriptions from "./Subscriptions";
import Projects from "./Projects";
import Topics from "./Topics";
import CreateUser from "./CreateUser";
import UserDetails from "./UserDetails";
import Welcome from "./Welcome";
import Login from "./Login";
import "bootstrap/dist/css/bootstrap.min.css";

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

const ProtectedRoute = ({ auth: isAuth, component: Component, ...rest }) => (
  <Route
    {...rest}
    render={props =>
      isAuth === true ? (
        <Component {...props} />
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

    this.authen = new Authen(config.endpoint);
    this.authen.tryLogin(this.authen.getToken());

    this.state = {
      users: [],
      popoverOpen: false,
      popoverOpen2: false,
      isLogged: this.authen.isLogged()
    };

    this.toggle = this.toggle.bind(this);
    this.toggle2 = this.toggle2.bind(this);
   
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
    return (
      <BrowserRouter>
        <div className="App">
          <Navbar id="argo-nav" expand="md">
            <NavbarBrand className="text-light">
              <img
                alt="argo admin ui"
                className="logo img-responsive"
                src={argologo}
              />
              <strong>ARGO</strong> Admin UI
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
                          <strong>{config.service}</strong>{": " + config.endpoint}
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
                      <Link to="/subscriptions">
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
                    <Route exact path="/projects" component={Projects} />
                    <Route exact path="/topics" component={Topics} />
                    <Route exact path="/subscriptions" component={Subscriptions} />

                    <ProtectedRoute exact auth={this.authen.isLogged()} path="/" component={Welcome} />
                    <ProtectedRoute
                      exact
                      auth={this.authen.isLogged()}
                      path="/users/details/:username"
                      component={UserDetails}
                    />
                    <ProtectedRoute exact
                      auth={this.authen.isLogged()}
                      path="/users/create"
                      component={CreateUser}
                    />
                    <ProtectedRoute
                      exact
                      auth={this.authen.isLogged()}
                      path="/users"
                      component={UserList}
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
