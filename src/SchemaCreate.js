import React from "react";
import Authen from "./Authen";
import config from "./config";
import "react-table/react-table.css";
import { Formik, Field, Form, ErrorMessage, FieldArray } from "formik";
import {
  Col,
  Button,
  Card,
  CardBody,
  CardHeader,
  CardFooter,
  Row,
  Input,
  FormGroup,
  Label
} from "reactstrap";
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

function validate(values) {
  let errors = {};

  let prevNames = new Set();
  let errListAttributes = [];
  values.attributes.forEach(attr => {
      let aErrors = {};
      // if (!attr.name) aErrors.name = "Required";
      if (attr.name.includes(" ")) {
          aErrors.name = "Dont use spaces in attribute names";
      }
      if (prevNames.has(attr.name)) {
          aErrors.name = "Use attribute with unique name";
      }

      prevNames.add(attr.name);

      errListAttributes.push(aErrors);
  });

  // check if attribute errors are indeed empty
  let empty = true;
  for (let item of errListAttributes) {
      if (
          !(Object.keys(item).length === 0 && item.constructor === Object)
      ) {
          empty = false;
      }
  }

  if (!empty) {
      errors.attributes = errListAttributes;
  }
  return errors;
}

function composeSchema(values, errors) {
  
  let attrD = {};
  let schema = {};
  let schema_items = {};
  let required = [];
  if (values.attributes && values.attributes.length > 0) {
    values.attributes.forEach(function (attr, i) {
      if (errors.attributes && errors.attributes[i].hasOwnProperty("name")) {
        return;
      }
      else {
        attrD[attr.name] = {"type": attr.value};
        if (attr.name_required) {
          required.push(attr.name);
        }
      }
    });
  }

  if (values.attributes && values.attributes.length > 0) {
      schema_items["properties"] = attrD;
      schema_items["type"] = "object";
      schema_items["required"] = required;
  }
  
  schema["type"] = "json";
  schema["name"] = values.schemaName;
  schema["schema"] = schema_items;

  return schema;
}

class SchemaCreate extends React.Component {
  constructor(props) {
    super(props);
    this.authen = new Authen();
    this.DM = new DataManager(this.authen.getEndpoint(), this.authen.getToken());

    this.apiGetData.bind(this);
    this.initForm.bind(this);

    if (this.authen.isLogged()) {
      this.state = {
        toDelete: this.props.toDelete,
        project: this.apiGetData(this.props.match.params.projectname),
        schemas: this.apiGetSchemas(this.props.match.params.projectname),
        schema: "",
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

  apiEditSchema(projectName, schemaName, schema) {
    let comp = this;
    let newSchemaName = getShortName(JSON.parse(schema).name);
    this.DM.projectEditSchema(projectName, schemaName, schema).then(r => {
      if (r.done) {
        NotificationManager.info("Schema Updated", null, 1000);
        this.apiGetSchemas(projectName);
        setTimeout(function() {
          comp.props.history.push("/projects/"+projectName+"/schemas/"+newSchemaName);
        }, 1000);
      } else {
        NotificationManager.error("Error during schema deletion", null, 1000);
      }
    });
  }

  apiCreateSchema(projectName, schemaName, schema) {
    let comp = this;
    this.DM.projectCreateSchema(projectName, schemaName, schema).then(r => {
      if (r.done) {
        NotificationManager.info("Schema Created", null, 1000);
        this.apiGetSchemas(projectName);
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

  apiGetData(projectName) {
    this.DM.projectGet(projectName).then(r => {
      if (r.done) {
        this.setState({ project: r.data });
      }
    });
  }

  initForm() {
    let attrs = []
    attrs.push({"name":"", "value": "", "name_required": false});
    attrs.schemaName = this.state.schema.name;
    return attrs;
  }

  handleForm(values, projectName, schemaName, msgBody) {
    return (
      <Form>
          {(
              <div className="form-group p-3">
                  <FieldArray
                      name="attributes"
                      render={({
                          insert,
                          remove,
                          push
                      }) => (
                        <div>
                      <Row>
                        <Col className="col-md-6 col-sm-12 col-xs-12 d-flex align-items-stretch">
                        <Card>
                            <CardHeader>
                              Parameters:
                            </CardHeader>
                            <CardBody>
                            <div
                                              className="row form-row mb-2"
                                          >
                            <FormGroup>
                              <Label for="schemaNameField">
                                Name:
                              </Label>
                              <Field
                                  name={`schemaName`}
                                  type="text"
                                  className="form-control"
                              />
                            </FormGroup>
                            </div>
                            <div
                                              className="row form-row mb-2"
                                          >
                            <FormGroup>
                              <Label for="exampleSelect">
                                Type:
                              </Label>
                              <Input
                                id="exampleSelect"
                                name="select"
                                type="select"
                              >
                                <option>
                                  JSON
                                </option>
                                <option>
                                  ARVO
                                </option>
                              </Input>
                            </FormGroup>
                            </div>
                            <div
                                              className="row form-row"
                                          >
                            <label>Properties:</label>
                            
                          {values.attributes.length > 0 &&
                                  values.attributes.map(
                                      (
                                          attributes,
                                          index
                                      ) => (
                                          <div
                                              className="row form-row"
                                              key={
                                                  index
                                              }
                                          >
                                              <div className="form-group col-10 mb-0">
                                              <div className="input-group mb-0">
                                                <div className="input-group-prepend">
                                                  <span className="input-group-text">Required:</span>
                                                  <div className="input-group-text">
                                                  <Field
                                                    type="checkbox"
                                                    name={"test"}
                                                    onClick={() => {
                                                      attributes.name_required = !attributes.name_required
                                                      }
                                                    }
                                                    checked={attributes.name_required}
                                                    />
                                                  </div>
                                                  <span className="input-group-text">Name:</span>
                                                </div>
                                                <Field
                                                          name={`attributes.${index}.name`}
                                                          type="text"
                                                          className="form-control"
                                                      />
                                                <div className="input-group-prepend">
                                                  <span className="input-group-text">Value:</span>
                                                </div>
                                                <Field
                                                          name={`attributes.${index}.value`}
                                                          className="form-control"
                                                          type="text"
                                                      />
                                              </div>
                                              </div>
                                              <div className="form-group col mb-0">
                                                  <button
                                                      type="button"
                                                      className="btn btn-danger"
                                                      onClick={() =>
                                                          remove(
                                                              index
                                                          )
                                                      }
                                                  >
                                                      X
                                                  </button>
                                              </div>
                                              <div className="form-group col-12">
                                              <ErrorMessage
                                                    name={`attributes.${index}.name`}
                                                    component="div"
                                                    className="field-error form-text text-danger"
                                                />
                                              <ErrorMessage
                                                  name={`attributes.${index}.value`}
                                                  component="div"
                                                  className="field-error form-text text-danger"
                                              />
                                                </div>
                                          </div>
                                          
                                      )
                                  )}
                                  
                                  <button
                              type="button"
                              className="btn btn-primary"
                              onClick={() =>
                                  push({
                                      name_required: false,
                                      name: "",
                                      value: ""
                                  })
                              }
                          >
                              Add
                          </button>
                          </div>
                          
                          </CardBody>
                          </Card>
                        </Col>
                        <Col className="col-md-6 col-sm-12 col-xs-12">
                          <Card>
                            <CardHeader>
                              Schema:
                            </CardHeader>
                            <CardBody>
                              <pre>
                                <code className="prettyprint"> 
                                {JSON.stringify(msgBody, null, 4)}
                                </code>
                              </pre>
                            </CardBody>
                          </Card>
                        </Col>
                      </Row>
                      <Row>
                      <Col className="col-md-10">
                      </Col>
                      <Col className="col-md mt-4" style={{textAlign: "right"}}>
                      <Button
                          type="submit"
                          className="btn btn-warning mr-2"
                          onClick={()=> {this.handleCreateSchema(projectName, schemaName, JSON.stringify(msgBody, null, 4))}}
                      >
                        Edit
                        </Button>
                      {/* <Button
                          type="button"
                          onClick={() => {
                              this.props.history.goBack();
                          }}
                          className="btn btn-dark"
                      >
                        Back
                      </Button> */}
                      </Col>
                      </Row>
                      </div>
                      )}
                  />
              </div>
          )}
      </Form>
    );
  }

  render() {
    if (this.state.project === undefined) {
      return <h3>loading</h3>;
    }

    let willDelete = null;
    let willBack = null;

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
            <h2>Create Schema</h2>
          </Col>
          <Col className="text-right">
            <a
              className="btn btn-danger  ml-1 mr-1"
              href={this.state.schema && "/projects/"+this.state.project.name+"/schemas/delete/"+getShortName(this.state.schema.name)}
            >
              <FontAwesomeIcon icon="times" /> Delete Project
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
                  <Row>
                    <div className="col-md-12 col-sm-12 col-xs-12">
                    <Formik
                        enableReinitialize={true}
                        validateOnBlur={true}
                        validateOnChange={true}
                        initialValues={{
                            attributes: this.initForm()
                        }}
                        validate={validate}
                        render={({ values, errors, touched }) => {
                            let msgBody = composeSchema(
                                values,
                                errors
                            );
                            return (
                              this.handleForm(values, this.state.project.name, values["schemaName"], msgBody)
                            );
                        }}
                    />
                    </div>
                  </Row>
                </CardBody>
                <CardFooter>
                  {this.state.project?
                  <React.Fragment>
                    <small>
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

export default SchemaCreate;
