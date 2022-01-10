import React from "react";
import Authen from "./Authen";
import config from "./config";
import "react-table/react-table.css";
import {
  Formik,
  Field,
  ErrorMessage,
  FieldArray,
} from "formik";
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
  Label,
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
} from "@fortawesome/free-solid-svg-icons";
import DataManager from "./DataManager";
library.add(
  faDiceD6,
  faEnvelope,
  faEnvelopeOpen,
  faInfoCircle,
  faEdit,
  faTrashAlt,
  faPlay
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

function validate(values) {
  let errors = {};

  let prevNames = new Set();
  let errListAttributes = [];
  values.attributes.forEach((attr) => {
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
    if (!(Object.keys(item).length === 0 && item.constructor === Object)) {
      empty = false;
    }
  }

  if (!empty) {
    errors.attributes = errListAttributes;
  }
  return errors;
}

function parseJSON(value) {
  let dict = {};
  let tmp;
  let required = [];
  value.nested.forEach(function (attr, i) {
    if (attr.name_required) {
      required.push(attr.name);
    }
    if (attr.nested.length > 0) {
      dict[attr.name] = parseJSON(attr);
      dict["type"] = attr.value;
    } else {
      dict[attr.name] = { type: attr.value };
      dict["type"] = "object";
      tmp = attr.type;
      return dict;
    }
  });
  if (Object.keys(dict).length > 0) {
    // final["properties"] = dict;
    // dict["type"] = "object";
    dict["required"] = required;
  }
  return dict;
}

function composeSchema(values, errors) {
  let schema = {};
  let schema_items = {};
  let required = [];
  let root = {};
  let msg = {};

  if (values.attributes && values.attributes.length > 0) {
    values.attributes.forEach(function (attr, i) {
      if (attr.name_required) {
        required.push(attr.name);
      }
      msg = parseJSON(attr);
      if (Object.keys(msg).length === 0) {
        root[attr.name] = { type: attr.value };
      } else {
        root[attr.name] = msg;
      }
    });
  }

  if (values.attributes && values.attributes.length > 0) {
    schema_items["properties"] = root;
    schema_items["required"] = required;
    schema_items["type"] = "object";
  }
  schema["type"] = "json";
  schema["schema"] = schema_items;
  return schema;
}

function renderProperty(props, attributes, index, arrayHelpers, name) {
  return (
    <div>
      <div className="row form-row" key={index}>
        <div className="form-group col-10 mb-0">
          <div className="input-group mb-0">
            <div className="input-group-prepend">
              <span className="input-group-text">Required:</span>
              <div className="input-group-text">
                <Field
                  type="checkbox"
                  name={"test"}
                  onClick={() => {
                    attributes.name_required = !attributes.name_required;
                  }}
                  checked={attributes.name_required}
                />
              </div>
              <span className="input-group-text">Name:</span>
            </div>
            <Field
              name={`${name}.${index}.name`}
              type="text"
              className="form-control"
            />
            <div className="input-group-prepend">
              <span className="input-group-text">Value:</span>
            </div>
            <Field
              as="select"
              name={`${name}.${index}.value`}
              className="form-control"
              onChange={(e) => {
                props.handleChange(e);
              }}
            >
              <option value="string">string</option>
              <option value="number">float</option>
              <option value="integer">integer</option>
              <option value="object">object</option>
            </Field>
          </div>
        </div>
        <div className="form-group col mb-0">
          <button
            type="button"
            className="btn btn-danger"
            onClick={() => arrayHelpers.remove(index)}
          >
            X
          </button>
        </div>
        <div className="form-group col-12">
          <ErrorMessage
            name={`${name}.${index}.name`}
            component="div"
            className="field-error form-text text-danger"
          />
          <ErrorMessage
            name={`${name}.${index}.value`}
            component="div"
            className="field-error form-text text-danger"
          />
        </div>
      </div>
    </div>
  );
}

const Property = ({ props, nested, name }) => {
  return (
    <FieldArray
      name={name}
      render={(arrayHelpers) => (
        <div className="row form-row">
          {nested.nested.length > 0 &&
            nested.nested.map((item, index) => {
              let propertyElement = null;
              if (item.value === "object") {
                propertyElement = (
                  <div className="row form-row mb-2">
                  <Card>
                    <CardHeader>
                      {renderProperty(props, item, index, arrayHelpers, name)}
                    </CardHeader>
                    <CardBody>
                      <Property
                        props={props}
                        nested={item}
                        name={`${name}.${index}.nested`}
                      />
                    </CardBody>
                  </Card>
                  </div>
                );
              } else {
                propertyElement = (
                  <div className="row form-row mb-2">
                    {renderProperty(props, item, index, arrayHelpers, name)}
                    <Property
                      props={props}
                      nested={item}
                      name={`${name}.${index}.nested`}
                    />
                  </div>
                );
              }
              return propertyElement;
            })}
          {nested.value === "object" && (
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => {
                arrayHelpers.push({
                  name_required: false,
                  name: "",
                  value: "string",
                  nested: [],
                });
              }}
            >
              +
            </button>
          )}
        </div>
      )}
    />
  );
};

class SchemaCreate extends React.Component {
  constructor(props) {
    super(props);
    this.authen = new Authen();
    this.DM = new DataManager(
      this.authen.getEndpoint(),
      this.authen.getToken()
    );

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

  apiEditSchema(projectName, schemaName, schema) {
    let comp = this;
    let newSchemaName = getShortName(JSON.parse(schema).name);
    this.DM.projectEditSchema(projectName, schemaName, schema).then((r) => {
      if (r.done) {
        NotificationManager.info("Schema Updated", null, 1000);
        this.apiGetSchemas(projectName);
        setTimeout(function () {
          comp.props.history.push(
            "/projects/" + projectName + "/schemas/" + newSchemaName
          );
        }, 1000);
      } else {
        NotificationManager.error("Error during schema deletion", null, 1000);
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
        NotificationManager.error("Error during schema deletion", null, 1000);
      }
    });
  }

  handleCreateSchema(projectName, schemaName, schemaData) {
    this.apiCreateSchema(projectName, schemaName, schemaData);
  }

  apiGetData(projectName) {
    this.DM.projectGet(projectName).then((r) => {
      if (r.done) {
        this.setState({ project: r.data });
      }
    });
  }

  initForm() {
    let attrs = [];
    attrs.push({ name: "", value: "string", name_required: false, nested: [] });
    attrs.schemaName = this.state.schema.name;
    return attrs;
  }

  handleForm(values, projectName, schemaName, msgBody, handleChange) {
    let props = { values, projectName, schemaName, msgBody, handleChange };
    return (
      <div>
        <FieldArray
          name="attributes"
          render={(arrayHelpers) => (
            <div>
              <Row>
                <Col className="col-md-6 col-sm-12 col-xs-12 d-flex align-items-stretch">
                  <Card>
                    <CardHeader>Parameters:</CardHeader>
                    <CardBody>
                      <div className="row form-row mb-2">
                        <FormGroup>
                          <Label for="schemaNameField">Name:</Label>
                          <Field
                            name={`schemaName`}
                            type="text"
                            className="form-control"
                          />
                        </FormGroup>
                      </div>
                      <div className="row form-row mb-2">
                        <FormGroup>
                          <Label for="exampleSelect">Type:</Label>
                          <Input id="exampleSelect" name="select" type="select">
                            <option>JSON</option>
                            <option>ARVO</option>
                          </Input>
                        </FormGroup>
                      </div>
                      <div className="row form-row">
                        <label>Properties:</label>

                        {props.values.attributes.length > 0 &&
                          props.values.attributes.map((attributes, index) => {
                            let propertyElement = null;
                            if (attributes.value === "object") {
                              propertyElement = (
                                <div className="row form-row mb-2">
                                <Card>
                                  <CardHeader>
                                    {renderProperty(
                                      props,
                                      attributes,
                                      index,
                                      arrayHelpers,
                                      "attributes"
                                    )}
                                  </CardHeader>
                                  <CardBody>
                                    <Property
                                      props={props}
                                      nested={attributes}
                                      name={`attributes.${index}.nested`}
                                    />
                                  </CardBody>
                                </Card>
                                </div>
                              );
                            } else {
                              propertyElement = (
                                <div>
                                  {renderProperty(
                                    props,
                                    attributes,
                                    index,
                                    arrayHelpers,
                                    "attributes"
                                  )}
                                  <Property
                                    props={props}
                                    nested={attributes}
                                    name={`attributes.${index}.nested`}
                                  />
                                </div>
                              );
                            }
                            return propertyElement;
                          })}

                        <button
                          type="button"
                          className="btn btn-primary"
                          onClick={() =>
                            arrayHelpers.push({
                              name_required: false,
                              name: "",
                              value: "string",
                              nested: [],
                            })
                          }
                        >
                          +
                        </button>
                      </div>
                    </CardBody>
                  </Card>
                </Col>
                <Col className="col-md-6 col-sm-12 col-xs-12">
                  <Card>
                    <CardHeader>Schema:</CardHeader>
                    <CardBody>
                      <pre>
                        <code className="prettyprint">
                          {JSON.stringify(props.msgBody, null, 4)}
                        </code>
                      </pre>
                    </CardBody>
                  </Card>
                </Col>
              </Row>
              <Row>
                <Col className="col-md-10"></Col>
                <Col className="col-md mt-4" style={{ textAlign: "right" }}>
                  <Button
                    type="submit"
                    className="btn btn-warning mr-2"
                    onClick={() => {
                      this.handleCreateSchema(
                        props.projectName,
                        props.schemaName,
                        JSON.stringify(props.msgBody, null, 4)
                      );
                    }}
                  >
                    Create
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
            <strong>
              {this.state.schema.name && getShortName(this.state.schema.name)}
            </strong>
          </CardBody>
          <CardFooter className="border-danger text-danger text-center">
            <Button
              color="danger"
              className="mr-2"
              onClick={() => {
                this.handleDeleteSchema(
                  this.state.project.name,
                  getShortName(this.state.schema.name)
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
            <h2>Create Schema</h2>
          </Col>
          <Col className="text-right">
            <a
              className="btn btn-danger  ml-1 mr-1"
              href={
                this.state.schema &&
                "/projects/" +
                  this.state.project.name +
                  "/schemas/delete/" +
                  getShortName(this.state.schema.name)
              }
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
                      {this.state.schema &&
                        getShortName(this.state.schema.name)}
                    </h4>
                  </span>
                  <hr />
                  <Row>
                    <div className="col-md-12 col-sm-12 col-xs-12">
                      <Formik
                        enableReinitialize={true}
                        validateOnBlur={true}
                        validateOnChange={true}
                        initialValues={{
                          attributes: this.initForm(),
                        }}
                        validate={validate}
                        render={({ values, errors, touched, handleChange }) => {
                          let msgBody = composeSchema(values, errors);
                          return this.handleForm(
                            values,
                            this.state.project.name,
                            values["schemaName"],
                            msgBody,
                            handleChange
                          );
                        }}
                      />
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
