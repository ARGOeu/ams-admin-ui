import React from "react";
import Authen from "./Authen";
import DataManager from "./DataManager"
import {
  Col,
  Button,
  Card,
  CardBody,
  CardHeader,
  CardFooter,
  Row,
  Badge,
  Input,
  InputGroup
} from "reactstrap";
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
  faShieldAlt,
  faCheck
} from "@fortawesome/free-solid-svg-icons";

library.add(faExclamationTriangle, faUser, faCrown, faHeartbeat, faCloudDownloadAlt,
  faCloudUploadAlt, faShieldAlt, faCheck);

function clip() {
  let copyText = document.getElementById("usertoken");
  copyText.select();
  document.execCommand("copy");
  NotificationManager.info("token copied to clipboard", null, 1000);
}

class RegistrationDetails extends React.Component {
  constructor(props) {
    super(props);
    this.authen = new Authen();
    this.DM = new DataManager(this.authen.getEndpoint(), this.authen.getToken())
    this.state = { user: null, popoverOpen: false, declineComment: "" };

    this.apiGetData = this.apiGetData.bind(this);
    this.apiDelete = this.apiDelete.bind(this);
    this.apiAcceptRegistration = this.apiAcceptRegistration.bind(this);
    this.handleAccept = this.handleAccept.bind(this);

    if (this.authen.isLogged()) {
      this.state = {
        toDelete: this.props.toDelete,
        registration: this.apiGetRegistration(),
        declineComment: ""
      };
    } else {
      this.state = { registration: null, popoverOpen: false, declineComment: "" };
    }
  }

  apiGetRegistration() {
    this.DM.getRegistrations().then(r => {
      if (r.done) {
        r.data.user_registrations.forEach((item, i) => {
          if (item.uuid === this.props.match.params.uuid) {
            this.setState({ registration: item });
          }
        });
      }
    });
  }

  apiAcceptRegistration() {
    let comp = this;
    let uuid = this.props.match.params.uuid;
    this.DM.acceptRegistration(uuid).then(r => {
      if (r.done) {
        NotificationManager.info("Registration accepted", null, 1000);
        setTimeout(function () {
          comp.props.history.push("/registrations");
        }, 1000);
      } else {
        NotificationManager.error("Error while accepting registration", null, 1000);
      }
    });
  }

  apiDeclineRegistration() {
    let comp = this;
    let uuid = this.props.match.params.uuid;
    this.DM.declineRegistration(uuid, this.state.declineComment).then(r => {
      if (r.done) {
        NotificationManager.info("Registration declined", null, 1000);
        setTimeout(function () {
          comp.props.history.push("/registrations/");
        }, 1000);
      } else {
        NotificationManager.error("Error while declining registration", null, 1000);
      }
    });
  }

  handleAccept() {
    this.apiAcceptRegistration();
  }

  handleDecline() {
    this.apiDeclineRegistration();
  }

  apiDelete(uuid) {
    let comp = this;
    this.DM.declineRegistration(uuid).then(done => {
      if (done) {
        NotificationManager.info("Registration Declined", null, 1000);
        setTimeout(function () {
          comp.props.history.push("/registrations")
          console.log(comp.props);
        }, 1000);
      } else {
        NotificationManager.error("Error rejecting registration", null, 1000);
      }
    })
  }

  apiGetData(username) {
    this.DM.userGet(username).then(r => {
      if (r.done) {
        this.setState({ user: r.data })
      }
    })
  }

  render() {
    if (this.state.registration === undefined) {
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
              <strong>Decline Registration</strong></h5>
          </CardHeader>
          <CardBody className="border-danger text-center">
            <Row>
            <Col style={{textAlign: "start"}}>
              Are you sure you want to decline registration: <strong>{this.state.registration.name}</strong> ?
            </Col>
            </Row>
            <Row>
              <span>&#8203;</span>
            </Row>
            <Row>
              <Col>
              <InputGroup>
                <Input
                  placeholder="Leave a comment to justify the declination."
                  type="textarea"
                  onChange={(e) => {
                    this.setState({ declineComment: e.target.value });
                  }}
                />
              </InputGroup>
              </Col>
            </Row>
          </CardBody>
          <CardFooter className="border-danger text-danger text-center">

            <Button
              color="danger"
              className="mr-2"
              onClick={() => { this.handleDecline() }}
            >
              <FontAwesomeIcon icon="times" />
              &#x200B;
              Decline
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
            <h2>Registration Details</h2>
          </Col>
          <Col className="text-right">
            {this.state.registration.status === "pending" && willBack ?
              <div>
                <Button
                  className="btn btn-danger  ml-1 mr-1"
                  href={"/registrations/decline/" + this.state.registration.uuid}
                >
                  <FontAwesomeIcon icon="times" /> Decline
                </Button>
                <button
                  className="btn btn-success  ml-1 mr-1"
                  onClick={() => { this.handleAccept() }}
                >
                  <FontAwesomeIcon icon="check" /> Accept
                </button>
                {willBack}
              </div>
              : <div>{willBack}</div>}
          </Col>
        </Row>
        <Row style={{justifyContent: "center"}}>
          <Col className="col-8">
            <div className="m-2 text-right">
              {willDelete}
            </div>
          </Col>
        </Row>

        <div>
          <Row>
            <div className="col-md-6 col-sm-6 col-xs-6">
              <Card>
                <CardBody>
                  <div className="mx-auto profile-circle">
                    <div className="mt-3">
                      <FontAwesomeIcon icon="user" size="4x" />
                    </div>
                  </div>
                  <br />
                  <span>{this.state.registration.name}</span>
                  <hr />
                  <span><strong>First Last Name:</strong> {this.state.registration.first_name} {this.state.registration.last_name}</span>
                  <hr />
                  <span><strong>Email:</strong> {this.state.registration.email}</span>
                  <hr />
                  <span><strong>Organization:</strong> {this.state.registration.organization}</span>
                  <hr />
                  <span><strong>Description:</strong> {this.state.registration.description}</span>
                  <hr />
                  <strong>Status: </strong>
                  {this.state.registration.status === "accepted" &&
                    <Badge color="success">{this.state.registration.status}</Badge>
                  }
                  {this.state.registration.status === "declined" &&
                    <Badge color="danger">{this.state.registration.status}</Badge>
                  }
                  {this.state.registration.status === "pending" &&
                    <Badge color="info">{this.state.registration.status}</Badge>
                  }
                  {this.state.registration.decline_comment &&
                    <div>
                      <hr />
                      <span><strong>Declination Comment:</strong> {this.state.registration.decline_comment}</span>
                    </div>
                  }
                </CardBody>
                <CardFooter>
                  <small>
                    <strong>Registered at:</strong>
                  </small>
                  <small> {this.state.registration.registered_at}</small>
                </CardFooter>
              </Card>
              </div>
              <div className="col-md-6 col-sm-6 col-xs-6">
              <Card>
                <CardBody>
                  <div>
                    <span><strong>UUID:</strong> {this.state.registration.uuid}</span>
                    { this.state.registration.activation_token &&
                    <div>
                      <hr />
                      <strong>Token: </strong>
                      <code className="p-2 border ml-2 rounded d-none">
                        {this.state.registration.activation_token}
                      </code>
                      <input
                        type="text"
                        className="form-control-static"
                        readOnly
                        value={this.state.registration.activation_token}
                        id="usertoken"
                      />
                      <button onClick={clip} className="btn btn-secondary">
                        Copy
                      </button>
                    </div>
                    }
                  </div>
                </CardBody>
              </Card>
            </div>
          </Row>
        </div>
      </div>
    );
  }
}

export default RegistrationDetails;