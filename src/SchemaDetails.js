import React from "react";
import Authen from "./Authen";
import config from "./config";
import "react-table/react-table.css";
import {
  Col,
  Button,
  Card,
  CardBody,
  CardHeader,
  CardFooter,
  Row
} from "reactstrap";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { library } from "@fortawesome/fontawesome-svg-core";
import {
  NotificationContainer,
  NotificationManager
} from "react-notifications";
import {
  faDiceD6,
  faEnvelope,
  faEnvelopeOpen,
  faInfoCircle,
  faEdit,
  faTrashAlt,
  faPlay
} from "@fortawesome/free-solid-svg-icons";
import DataManager from "./DataManager";
library.add(faDiceD6, faEnvelope, faEnvelopeOpen, faInfoCircle, faEdit,
            faTrashAlt, faPlay);

function getShortName(fullName) {
  let tokens = fullName.split("/");
  return tokens[tokens.length - 1];
}

function getProjectColorIcon(projectName) {
  let color = "#616A6B";
  if (projectName in config.project_colors) {
    color = config.project_colors[projectName];
  }

  return <FontAwesomeIcon icon="dice-d6" style={{ color: color }} size="4x" />;
}

class SchemaDetails extends React.Component {
  constructor(props) {
    super(props);
    this.authen = new Authen();
    this.DM = new DataManager(this.authen.getEndpoint(), this.authen.getToken());
    this.state = { project: null, topics: null, subs: null, metrics: [], modalCreate: false,
      modalEdit: false, newSchemaName: "", newSchemaData: "", selectedSchemaName: ""};

    this.apiGetData.bind(this);
    this.apiGetTopics.bind(this);
    this.apiGetSubs.bind(this);
    this.toggleModal.bind(this);
    this.handleCreateSchema.bind(this);
    this.handleCloseModal.bind(this);

    if (this.authen.isLogged()) {
      this.state = {
        toDelete: this.props.toDelete,
        project: this.apiGetData(this.props.match.params.projectname),
        topics: this.apiGetTopics(this.props.match.params.projectname),
        subs: this.apiGetSubs(this.props.match.params.projectname),
        metrics: this.apiGetMetrics(this.props.match.params.projectname),
        schemas: this.apiGetSchemas(this.props.match.params.projectname),
        schema: "",
        modalCreate: false,
        modalEdit: false,
        newSchemaName: "",
        newSchemaData: "",
        selectedSchemaName: ""
      };
    }
  }

  componentWillReceiveProps(props) {
    this.setState({
        toDelete: this.props.toDelete,
        project: this.apiGetData(this.props.match.params.projectname),
        topics: this.apiGetTopics(this.props.match.params.projectname),
        subs: this.apiGetSubs(this.props.match.params.projectname),
        metrics: this.apiGetMetrics(this.props.match.params.projectname),
        schemas: this.apiGetSchemas(this.props.match.params.projectname),
        schema: "",
        modalCreate: false,
        modalEdit: false,
        newSchemaName: "",
        newSchemaData: "",
        selectedSchemaName: ""
      });
  }

  apiGetMetrics(projectName) {
    this.DM.projectGetMetrics(projectName).then(r => {
      if (r.done) {
        this.setState({ metrics: r.data });
      }
    });
  }

  apiGetSchemas(projectName) {
    this.DM.projectGetSchemas(projectName).then(r => {
      if (r.done) {
        r.data.schemas.forEach((item,i) => {
          if (getShortName(item.name) === this.props.match.params.schemaname) {
            this.setState({ schema: item });
          }
        });
      }
    });
  }

  apiCreateSchema(projectName, schemaName, schema) {
    this.DM.projectCreateSchema(projectName, schemaName, schema).then(r => {
      if (r.done) {
        this.apiGetSchemas(projectName);
      }
    });
  }

  apiEditSchema(projectName, schemaName, schema) {
    this.DM.projectEditSchema(projectName, schemaName, schema).then(r => {
      if (r.done) {
        this.apiGetSchemas(projectName);
      }
    });
  }

  apiDeleteSchema(projectName, schemaName) {
    let comp = this;
    this.DM.projectDeleteSchema(projectName, schemaName).then(r => {
      if (r) {
        NotificationManager.info("Schema Deleted", null, 1000);
        setTimeout(function() {
          comp.props.history.push("/projects/details/"+projectName);
        }, 1000);
      } else {
        NotificationManager.error("Error during schema deletion", null, 1000);
      }
    });
  }

  handleCreateSchema(projectName, schemaName, schemaData) {
    this.apiCreateSchema(projectName, schemaName, schemaData);
  }

  handleEditSchema(projectName, schemaName, schemaData) {
    this.apiEditSchema(projectName, schemaName, schemaData);
  }

  handleDeleteSchema(projectName, schemaName) {
    this.apiDeleteSchema(projectName, schemaName);
  }

  handleCloseModal(modalName) {
    this.setState({
      newSchemaName: "",
      newSchemaData: "",
      selectedSchemaName: ""
    });
    this.toggleModal(modalName);
  }

  apiDelete(projectname) {
    let comp = this;
    this.DM.projectDelete(projectname).then(done => {
      if (done) {
        NotificationManager.info("Project Deleted", null, 1000);
        setTimeout(function() {
          comp.props.history.push("/projects");
        }, 1000);
      } else {
        NotificationManager.error("Error during project deletion", null, 1000);
      }
    });
  }

  apiGetData(projectName) {
    this.DM.projectGet(projectName).then(r => {
      if (r.done) {
        this.setState({ project: r.data });
      }
    });
  }

  apiGetTopics(projectName) {
    this.DM.topicGet(projectName).then(r => {
      if (r.done) {
        this.setState({ topics: r.data.topics });
      }
    });
  }

  apiGetSubs(projectName) {
    this.DM.subGet(projectName).then(r => {
      if (r.done) {
        this.setState({ subs: r.data.subscriptions });
      }
    });
  }

  toggleModal(modalName, schemaName) {
    if (this.state !== undefined) {
      if (modalName === "modalCreate") {
        this.setState({
          modalCreate: !this.state.modalCreate,
          newSchemaData: "",
          newSchemaName: ""
        });
      }
      else if (modalName === "modalEdit") {
        this.setState({
          modalEdit: !this.state.modalEdit,
          selectedSchemaName: schemaName,
          newSchemaName: schemaName,
          newSchemaData: "",
        });
      }
    }
  }

  render() {
    if (this.state.project === undefined) {
      return <h3>loading</h3>;
    }

    let willDelete = null;

    if (this.state.toDelete) {
      willDelete = (
        <Card className="border-danger mb-2">
          <CardHeader className="border-danger text-danger text-center">
            <h5>
              <FontAwesomeIcon className="mx-3" icon="exclamation-triangle" />
              <strong>Schema Deletion</strong>
            </h5>
          </CardHeader>
          <CardBody className="border-danger text-center">
            Are you sure you want to delete schema:{" "}
            <strong>{this.state.schema.name && getShortName(this.state.schema.name)}</strong>
          </CardBody>
          <CardFooter className="border-danger text-danger text-center">
            <Button
              color="danger"
              className="mr-2"
              onClick={() => {
                this.handleDeleteSchema(
                  this.state.project.name,
                  getShortName(this.state.schema.name));
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
    }

    return (
      <div>
        <NotificationContainer />
        <Row>
          <Col>
            <h2>Schema Details</h2>
          </Col>
          <Col className="text-right">
            <Link
              className="btn btn-success  ml-1 mr-1"
              to={this.state.schema && "/projects/"+this.state.project.name+"/schemas/validate/"+getShortName(this.state.schema.name)}
            >
              <FontAwesomeIcon icon="play" /> Validate
            </Link>
            <Link
              className="btn btn-info  ml-1 mr-1"
              to={this.state.schema && "/projects/"+this.state.project.name+"/schemas/update/"+getShortName(this.state.schema.name)}
            >
              <FontAwesomeIcon icon="pen" /> Modify
            </Link>
            <a
              className="btn btn-danger  ml-1 mr-1"
              href={this.state.schema && "/projects/"+this.state.project.name+"/schemas/delete/"+getShortName(this.state.schema.name)}
            >
              <FontAwesomeIcon icon="times" /> Delete
            </a>
          </Col>
        </Row>

        <div>
          <Row>
            <div className="col-md-12 col-sm-12 col-xs-12">
              {willDelete}
              <Card>
                <CardBody>
                  <div className="mx-auto profile-circle">
                    <div className="mt-3">
                      {getProjectColorIcon(this.state.project.name)}
                    </div>
                  </div>
                  <br />
                  <span className="text-center">
                    <h4>
                      { this.state.schema &&
                        getShortName(this.state.schema.name)}
                    </h4>
                  </span>
                  <hr/>
                  <div>
                    <pre>
                      <code className="prettyprint"> 
                      {JSON.stringify(this.state.schema.schema, null, 4)}
                      </code>
                    </pre>
                  </div>
                </CardBody>
                <CardFooter>
                   <small>
                    <strong>uuid:</strong>
                  </small>
                  <small> {this.state.schema && this.state.schema.uuid}</small> 
                  <br />
                  <small>
                    <strong>type:</strong>
                  </small>
                  <small> {this.state.schema && this.state.schema.type}</small>
                  {this.state.project?
                  <React.Fragment>
                    <small>
                      <br />
                      <strong>parent project:</strong>
                    </small>
                    <small> {this.state.project.name}</small>
                  </React.Fragment>
                  :null}
                </CardFooter>
              </Card>
            </div>
          </Row>
        </div>
      </div>
    );
  }
}

export default SchemaDetails;
