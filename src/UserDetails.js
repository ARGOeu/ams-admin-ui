import React from "react";
import Authen from "./Authen";
import DataManager from "./DataManager"
import {
  Col,
  Popover,
  PopoverHeader,
  PopoverBody,
  Button,
  Card,
  CardBody,
  CardHeader,
  CardFooter,
  Row
} from "reactstrap";
import { Link } from "react-router-dom";
import ProjectRoles from "./ProjectRoles";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { library } from "@fortawesome/fontawesome-svg-core";
import {
  NotificationContainer,
  NotificationManager
} from "react-notifications";
import {
  faExclamationTriangle,
  faUser,
  faCrown,
  faHeartbeat,
  faCloudDownloadAlt,
  faCloudUploadAlt,
  faShieldAlt
} from "@fortawesome/free-solid-svg-icons";

library.add(faExclamationTriangle, faUser, faCrown, faHeartbeat,  faCloudDownloadAlt,
  faCloudUploadAlt,faShieldAlt);

function clip() {
  let copyText = document.getElementById("usertoken");
  copyText.select();
  document.execCommand("copy");
  NotificationManager.info("token copied to clipboard", null, 1000);
}

class UserDetails extends React.Component {
  constructor(props) {
    super(props);
    this.authen = new Authen();
    this.DM = new DataManager(this.authen.getEndpoint(), this.authen.getToken())
    this.state = { user: null, popoverOpen: false };

    this.apiGetData = this.apiGetData.bind(this);
    this.apiDelete = this.apiDelete.bind(this);

    if (this.authen.isLogged()) {
      this.state = {
        toDelete: this.props.toDelete,
        user: this.apiGetData(
         
          this.props.match.params.username
        )
      };
    } else {
      this.state = { user: null, popoverOpen: false };
    }

    this.toggle = this.toggle.bind(this);
  }

  toggle() {
    this.setState({
      popoverOpen: !this.state.popoverOpen
    });
  }

  apiRenewToken(username) {
    this.DM.userRefreshToken(username).then(res => {
      if (res.done) {
        NotificationManager.info("Token refreshed", null, 1000);
        this.setState({user: res.data})
      }
      else NotificationManager.error("Token refresh operation failed", null ,1000)
    })
  }

  apiDelete(username) {
    let comp = this;
    this.DM.userDelete(username).then(done => {
      if (done) {
        NotificationManager.info("User Deleted", null, 1000);
        setTimeout(function() {
          comp.props.history.push("/users")
          console.log(comp.props);
        }, 1000);
      } else {
        NotificationManager.error("Error deleting user", null, 1000);
      }
    })
  }

  // based on service role return an appropriate fa icon
  beautifyServiceRoles(serviceRoles) {
    if (serviceRoles !== undefined)  {
      if (serviceRoles.includes("service_admin")) {
        return (
          <FontAwesomeIcon className="service-crown" icon="crown" size="4x" />
        );
      } else if (serviceRoles.includes("metric_viewer")) {
        return (
          <FontAwesomeIcon
            className="service-metric"
            icon="heartbeat"
            size="4x"
          />
        );
      }
    }
    

    return <FontAwesomeIcon icon="user" size="4x" />;
  }

  apiGetData(username) {
    this.DM.userGet(username).then(r => {
      if (r.done){
        this.setState({user:r.data})
      }
      else {
        this.props.history.push("/404");
      }
    })
  }

  render() {
    if (this.state.user === undefined) {
      return <h3>loading</h3>;
    }

    let willDelete = null;
    let willBack = null;

    if (this.state.toDelete) {
      willDelete = (
        <Card className="border-danger">
          <CardHeader className="border-danger text-danger text-center">
            <h5>
             <FontAwesomeIcon className="mx-3" icon="exclamation-triangle" />
            <strong>User Deletion</strong></h5>
          </CardHeader>
          <CardBody  className="border-danger text-center">
            Are you sure you want to delete user: <strong>{this.state.user.name}</strong>
          </CardBody>
          <CardFooter className="border-danger text-danger text-center">
          
            <Button
              color="danger"
              className="mr-2"
              onClick={() => {
                this.apiDelete(
                  this.state.user.name
                );
              }}
            >
              Delete
            </Button>
            <Button
              onClick={() => {
                this.props.history.goBack();
              }}
              className="btn btn-dark"
            >
              Cancel
            </Button>
          
          </CardFooter>
         
        
          </Card>
      );
    } else {
      willBack = (
        <Button
          onClick={() => {
            this.props.history.goBack();
          }}
          className="btn btn-dark"
        >
          Back
        </Button>
      );
    }

    return (
      <div>
        <NotificationContainer />
        <Row>
          <Col>
            <h2>User Details</h2>
          </Col>
          <Col className="text-right">
            <Link
              className="btn btn-info  ml-1 mr-1"
              to={"/users/update/" + this.state.user.name}
            >
              <FontAwesomeIcon icon="pen" /> Modify User
            </Link>
            <a
              className="btn btn-danger  ml-1 mr-1"
              href={"/users/delete/" + this.state.user.name}
            >
              <FontAwesomeIcon icon="times" /> Delete User
            </a>
          </Col>
        </Row>

        <div>
          <Row>
            <div className="col-md-4 col-sm-12 col-xs-12">
              <Card>
                <CardBody>
                  <div className="mx-auto profile-circle"><div className="mt-3">{this.beautifyServiceRoles(this.state.user.service_roles)}</div></div>
                  <br />
                  <span>{this.state.user.name}</span>
                  <hr />
                  <strong>uuid:</strong> {this.state.user.uuid}
                  <hr />
                  <strong>email:</strong> {this.state.user.email}
                </CardBody>
                <CardFooter>
                  <small>
                    <strong>created:</strong>
                  </small>
                  <small> {this.state.user.created_on}</small>
                  <br />
                  <small>
                    <strong>updated:</strong>
                  </small>
                  <small> {this.state.user.modified_on}</small>
                  <small>
                    <br />
                    <strong>created by:</strong>
                  </small>
                  <small> {this.state.user.created_by}</small>
                </CardFooter>
              </Card>
            </div>
            <div className="col-md-8 col-sm-12 col-xs-12">
              <Card>
                <CardHeader>
                  <strong>{this.state.user.name}</strong>
                </CardHeader>
                <CardBody>
                  <strong>Token: </strong>
                  <code className="p-2 border ml-2 rounded d-none">
                    {this.state.user.token}
                  </code>
                  <input
                    type="text"
                    className="form-control-static"
                    readOnly
                    value={this.state.user.token}
                    id="usertoken"
                  />
                  <button onClick={clip} className="btn btn-sm">
                    Copy
                  </button>
                  <button
                    id="renew-token"
                    onClick={() => {
                      this.toggle();
                    }}
                    className="ml-2 btn btn-sm btn-warning"
                  >
                    Renew
                  </button>
                  <Popover
                    placement="bottom"
                    isOpen={this.state.popoverOpen}
                    target="renew-token"
                    toggle={this.toggle}
                  >
                    <PopoverHeader>Are you sure ?</PopoverHeader>
                    <PopoverBody>
                      <button
                        id="confirm-renew"
                        onClick={() => {
                          this.apiRenewToken(
                            this.state.user.name
                          );
                          this.toggle();
                        }}
                        className="ml-2 btn btn-sm btn-dark"
                      >
                        Confirm
                      </button>
                    </PopoverBody>
                  </Popover>

                  <hr />
                  <ProjectRoles projects={this.state.user.projects} />
                </CardBody>
              </Card>
              <Card className="mt-2 text-secondary">
                <CardFooter>
                <strong>Role icon legend:</strong>
               <span className="border p-2 mx-2 rounded"><FontAwesomeIcon className="ml-1 mr-1" icon="shield-alt" /> project admin</span>
               <span className="border p-2 mx-2 rounded"><FontAwesomeIcon className="ml-1 mr-1" icon="cloud-upload-alt" /> publisher
               </span>
                <span className="border p-2 mx-2 rounded"> <FontAwesomeIcon className="ml-1 mr-1" icon="cloud-download-alt" /> consumer</span>
               
                </CardFooter>
                
              </Card>
              <div className="m-2 text-right">
                {willDelete}
                {willBack}
              </div>
            </div>
          </Row>
        </div>
      </div>
    );
  }
}

export default UserDetails;
