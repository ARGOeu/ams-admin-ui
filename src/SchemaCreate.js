import React from "react";
import Authen from "./Authen";
import config from "./config";
import "react-table/react-table.css";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  CardFooter,
  Row,
  Input,
  FormGroup,
  Label,
  Alert,
} from "reactstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { library } from "@fortawesome/fontawesome-svg-core";
import {
  NotificationContainer,
  NotificationManager,
} from "react-notifications";
import {
  faDiceD6,
  faEnvelope,
  faEnvelopeOpen,
  faInfoCircle,
  faEdit,
  faTrashAlt,
  faPlay,
  faExternalLinkAlt,
} from "@fortawesome/free-solid-svg-icons";
import DataManager from "./DataManager";
library.add(
  faDiceD6,
  faEnvelope,
  faEnvelopeOpen,
  faInfoCircle,
  faEdit,
  faTrashAlt,
  faPlay,
  faExternalLinkAlt
);

function getShortName(fullName) {
  if (fullName !== undefined) {
    if (fullName === "") {
      return fullName;
    }
    let tokens = fullName.split("/");
    return tokens[tokens.length - 1];
  }
}

function getProjectColorIcon(projectName) {
  let color = "#616A6B";
  if (projectName in config.project_colors) {
    color = config.project_colors[projectName];
  }

  return <FontAwesomeIcon icon="dice-d6" style={{ color: color }} size="4x" />;
}

class SchemaCreate extends React.Component {
  constructor(props) {
    super(props);
    this.authen = new Authen();
    this.DM = new DataManager(
      this.authen.getEndpoint(),
      this.authen.getToken()
    );

    this.apiGetData.bind(this);

    if (this.authen.isLogged()) {
      this.state = {
        toDelete: this.props.toDelete,
        project: this.apiGetData(this.props.match.params.projectname),
        schemas: this.apiGetSchemas(this.props.match.params.projectname),
        schema: "",
        schemaType: "JSON",
        schemaFieldError: "",
      };
    }
  }

  componentWillReceiveProps(props) {
    this.setState({
      toDelete: this.props.toDelete,
      project: this.apiGetData(this.props.match.params.projectname),
      schemas: this.apiGetSchemas(this.props.match.params.projectname),
      schema: "",
    });
  }

  apiGetSchemas(projectName) {
    this.DM.projectGetSchemas(projectName).then((r) => {
      if (r.done) {
        r.data.schemas.forEach((item, i) => {
          if (getShortName(item.name) === this.props.match.params.schemaname) {
            this.setState({ schema: item });
          }
        });
      }
    });
  }

  apiCreateSchema(projectName, schemaName, schema) {
    let comp = this;
    this.DM.projectCreateSchema(projectName, schemaName, schema).then((r) => {
      if (r.done) {
        NotificationManager.info("Schema Created", null, 1000);
        this.apiGetSchemas(projectName);
        setTimeout(function () {
          comp.props.history.push("/projects/details/" + projectName);
        }, 1000);
      } else {
        NotificationManager.error("Error during schema creation", null, 1000);
      }
    });
  }

  handleCreateSchema(projectName, schemaName, schemaData) {
    if (schemaData) {
      this.apiCreateSchema(projectName, schemaName, schemaData);
    }
  }

  apiGetData(projectName) {
    this.DM.projectGet(projectName).then((r) => {
      if (r.done) {
        this.setState({ project: r.data });
      }
    });
  }

  formRequestBody() {
    if (this.state.schemaType === "JSON") {
      if (this.state.schemaProperties) {
        let body = {};
        body["type"] = this.state.schemaType.toLowerCase();
        try {
          body["schema"] = JSON.parse(this.state.schemaProperties);
        } catch {}
        return body;
      }
    } else if (this.state.schemaType === "AVRO") {
      let body = {};
      body["type"] = this.state.schemaType.toLowerCase();
      body["schema"] = JSON.parse(this.state.schemaProperties);
      return body;
    }
  }

  renderSchema() {
    return this.state.schemaProperties;
  }

  render() {
    if (this.state.project === undefined) {
      return <h3>loading</h3>;
    }

    let willBack = null;
    let schemaSpecText = "";
    let schemaSpecLink = "";

    if (this.state.schemaType === "JSON") {
      schemaSpecText = "JSON schema specification";
      schemaSpecLink = "https://json-schema.org/specification.html";
    } else if (this.state.schemaType === "AVRO") {
      schemaSpecText = "AVRO schema specification";
      schemaSpecLink = "https://avro.apache.org/docs/current/spec.html";
    }

    let JSONHint = {
      type: "object",
      properties: {
        name: { type: "string" },
        email: { type: "string" },
        address: { type: "string" },
        telephone: { type: "string" },
      },
      required: ["name", "email"],
    };

    let AVROHint = {
      name: "MyClass",
      type: "record",
      namespace: "com.acme.avro",
      fields: [
        {
          name: "type",
          type: "string",
        },
        {
          name: "properties",
          type: {
            name: "properties",
            type: "record",
            fields: [
              {
                name: "name",
                type: {
                  name: "name",
                  type: "record",
                  fields: [
                    {
                      name: "type",
                      type: "string",
                    },
                  ],
                },
              },
              {
                name: "email",
                type: {
                  name: "email",
                  type: "record",
                  fields: [
                    {
                      name: "type",
                      type: "string",
                    },
                  ],
                },
              },
              {
                name: "address",
                type: {
                  name: "address",
                  type: "record",
                  fields: [
                    {
                      name: "type",
                      type: "string",
                    },
                  ],
                },
              },
              {
                name: "telephone",
                type: {
                  name: "telephone",
                  type: "record",
                  fields: [
                    {
                      name: "type",
                      type: "string",
                    },
                  ],
                },
              },
            ],
          },
        },
        {
          name: "required",
          type: {
            type: "array",
            items: "string",
          },
        },
      ],
    };

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

    return (
      <div>
        <NotificationContainer />
        <div>
          <Row>
            <div className="col-md-12 col-sm-12 col-xs-12">
              <Card>
                <CardBody>
                  <div className="mx-auto mb-4 profile-circle">
                    <div className="mt-3">
                      {getProjectColorIcon(this.state.project.name)}
                    </div>
                  </div>
                  <span className="text-center">
                    <h4>
                      {this.state.schema &&
                        getShortName(this.state.schema.name)}
                    </h4>
                  </span>
                  <hr />
                  <Row>
                    <div className="col-md-4">
                      <Card>
                        <CardHeader>Configuration</CardHeader>
                        <CardBody>
                          <Row>
                            <div className="col-md-6">
                              <FormGroup>
                                <Label for="schemaName">Name</Label>
                                <Input
                                  id="schemaName"
                                  name="schemaName"
                                  type="text"
                                  onChange={(e) =>
                                    this.setState({
                                      schemaName: e.target.value,
                                    })
                                  }
                                />
                              </FormGroup>
                            </div>
                          </Row>

                          <Row>
                            <div className="col-md-6">
                              <FormGroup>
                                <Label for="schemaType">Type</Label>
                                <Input
                                  id="schemaType"
                                  name="select"
                                  type="select"
                                  value={this.state.schemaType || "JSON"}
                                  onChange={(e) => {
                                    this.setState({
                                      schemaType: e.target.value,
                                    });
                                  }}
                                >
                                  <option>JSON</option>
                                  <option>AVRO</option>
                                </Input>
                              </FormGroup>
                            </div>
                            <div className="col-md-2">
                              <Label for="schemaType">&#x200b;</Label>
                              <Button
                                type="submit"
                                className="btn btn-info mr-2"
                                onClick={() => {
                                  if (this.state.schemaType === "JSON") {
                                    this.setState({
                                      schemaProperties: JSON.stringify(
                                        JSONHint,
                                        null,
                                        4
                                      ),
                                    });
                                  } else if (this.state.schemaType === "AVRO") {
                                    this.setState({
                                      schemaProperties: JSON.stringify(
                                        AVROHint,
                                        null,
                                        4
                                      ),
                                    });
                                  }
                                }}
                              >
                                Hint
                              </Button>
                            </div>
                          </Row>
                        </CardBody>
                      </Card>
                    </div>
                    <div className="col-md-8">
                      <Card>
                        <CardHeader>
                          <Row>
                            <div className="col-md-7">Schema</div>
                            {this.state.schemaType? 
                            <div
                              className="col-md-5"
                              style={{ textAlign: "end" }}
                            >
                              <a
                                href={schemaSpecLink}
                                class="btn btn-info"
                                role="button"
                                target="_blank"
                                rel="noreferrer"
                              >
                                {schemaSpecText} &#8203;
                                <FontAwesomeIcon
                                  className="side-ico"
                                  icon="external-link-alt"
                                />
                              </a>
                            </div>
                            :null}
                          </Row>
                        </CardHeader>
                        <CardBody>
                          <FormGroup>
                            <Input
                              id="exampleText"
                              name="text"
                              type="textarea"
                              style={{ height: "256px" }}
                              value={this.renderSchema()}
                              onChange={(e) => {
                                try {
                                  if (e.target.value !== "") {
                                    JSON.parse(e.target.value);
                                    this.setState({
                                      schemaFieldError: "",
                                    });
                                  } else {
                                    this.setState({
                                      schemaFieldError: "",
                                    });
                                  }
                                } catch (err) {
                                  this.setState({
                                    schemaFieldError: err.message,
                                  });
                                }
                                this.setState({
                                  schemaProperties: e.target.value,
                                });
                              }}
                            />
                          </FormGroup>
                          {this.state.schemaFieldError ? (
                            <Alert color="danger">
                              {this.state.schemaFieldError}
                            </Alert>
                          ) : null}
                        </CardBody>
                      </Card>
                    </div>
                  </Row>
                  <Row className={"float-right mt-4"}>
                    <div className="col-md-12">
                      <Button
                        type="submit"
                        className="btn btn-warning mr-2"
                        onClick={() => {
                          if (this.state.schemaFieldError === "") {
                            this.handleCreateSchema(
                              this.props.match.params.projectname,
                              this.state.schemaName,
                              JSON.stringify(this.formRequestBody(), null, 4)
                            );
                          }
                        }}
                      >
                        Create
                      </Button>
                      {willBack}
                    </div>
                  </Row>
                </CardBody>
                <CardFooter>
                  {this.state.project ? (
                    <React.Fragment>
                      <small>
                        <strong>parent project:</strong>
                      </small>
                      <small> {this.state.project.name}</small>
                    </React.Fragment>
                  ) : null}
                </CardFooter>
              </Card>
            </div>
          </Row>
        </div>
      </div>
    );
  }
}

export default SchemaCreate;
