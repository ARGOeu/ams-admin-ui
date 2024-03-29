import React from "react";
import Authen from "./Authen";
import config from "./config";
import NumberFormat from "react-number-format";
import { BarChart, CartesianGrid, Bar, XAxis, YAxis, Tooltip } from "recharts";
import {
    Col,
    Button,
    Card,
    CardBody,
    CardHeader,
    CardFooter,
    Row,
    Popover,
    PopoverBody,
    PopoverHeader

} from "reactstrap";
import { Link, Redirect } from "react-router-dom";
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
    faUser,
    faUserLock,
    faPaperPlane,
    faSlidersH,
    faInfoCircle
    
} from "@fortawesome/free-solid-svg-icons";
import DataManager from "./DataManager";
library.add(
    faDiceD6,
    faEnvelope,
    faEnvelopeOpen,
    faUser,
    faUserLock,
    faPaperPlane,
    faSlidersH,
    faInfoCircle
  
);

function getShortName(fullName) {
    let tokens = fullName.split("/");
    return tokens[tokens.length - 1];
}

function getProjectName(fullName) {
    if (fullName) {
        let tokens = fullName.split("/");
        if (tokens.length >= 1) return tokens[2];
    }
    return "";
}

function getProjectColorIcon(projectName) {
    let color = "#616A6B";
    if (projectName in config.project_colors) {
        color = config.project_colors[projectName];
    }

    return (
        <FontAwesomeIcon icon="dice-d6" style={{ color: color }} size="1x" />
    );
}

class SubDetails extends React.Component {
    constructor(props) {
        super(props);
        this.authen = new Authen();
        this.DM = new DataManager(
            this.authen.getEndpoint(),
            this.authen.getToken()
        );
        this.state = {
            popoverOpen: false,
            sub: null,
            acl: null,
            offsets: { min: 0, current: 0, max: 0 }
        };

        this.apiGetData = this.apiGetData.bind(this);
        this.apiDoVerify = this.apiDoVerify.bind(this);

        if (this.authen.isLogged()) {
            this.state = {
                toDelete: this.props.toDelete,
                sub: this.apiGetData(
                    this.props.match.params.projectname,
                    this.props.match.params.subname
                ),
                subs: this.apiGetSubs(this.props.match.params.projectname),
                acl: this.apiGetAcl(
                    this.props.match.params.projectname,
                    this.props.match.params.subname
                ),
                offsets: this.apiGetOffsets(
                    this.props.match.params.projectname,
                    this.props.match.params.subname
                ),
                metrics: this.apiGetMetrics(
                    this.props.match.params.projectname,
                    this.props.match.params.subname
                ),
                isServiceAdmin: this.authen.isServiceAdmin(),
                isProjectAdmin: this.authen.isProjectAdmin(),
                isConsumer: this.authen.isConsumer()
            };
        } else {
            this.state = { sub: null, popoverOpen: false };
        }
    }


    toggle() {
      if (this.state){
        this.setState({
            popoverOpen: !this.state.popoverOpen
          });
      } 
    }

    apiDoVerify() {
       this.DM.subVerifyEndpoint(this.props.match.params.projectname, this.props.match.params.subname).then(r =>{
       
            if (r.done) {
                
                this.apiGetData(
                    this.props.match.params.projectname,
                    this.props.match.params.subname
                )
            } else {
                
                NotificationManager.error(
                    "Error during endpoint verification",
                    null,
                    1000
                );
            }
       })
    }

    apiClearPushConfig() {
        this.DM.subModPushConfig( this.props.match.params.projectname, 
            this.props.match.params.subname, {}).then(r => {
            if (r.done) {
                this.apiGetData(
                    this.props.match.params.projectname,
                    this.props.match.params.subname
               )
            } 
        });
    }

    apiDelete(project, sub) {
        let comp = this;
        this.DM.subDelete(project, sub).then(done => {
            if (done) {
                NotificationManager.info("Subscription Deleted", null, 1000);
                setTimeout(function() {
                    comp.props.history.push("/subs#" + project);
                }, 1000);
            } else {
                NotificationManager.error(
                    "Error during subscription deletion",
                    null,
                    1000
                );
            }
        });
    }

    apiGetData(projectName, subName) {
        this.DM.subGet(projectName, subName).then(r => {
            if (r.done) {
                if (subName) {
                    this.setState({ sub: r.data });
                }
                else {
                    this.setState({ subs: r.data });
                }
            }
        });
    }

    // get subscription data
    apiGetSubs(project) {
        this.DM.subGet(project).then(r => {
            if (r.done) {
                this.setState({ subs: r.data.subscriptions });
            }
            else {
                this.props.history.push("/404");
              }
        });
    }

    apiGetMetrics(projectName, subName) {
        this.DM.subGetMetrics(projectName, subName).then(r => {
            if (r.done) {
                this.setState({ metrics: r.data });
            }
            else {
                this.props.history.push("/404");
              }
        });
    }

    apiGetOffsets(projectName, subName) {
        this.DM.subGetOffsets(projectName, subName).then(r => {
            if (r.done) {
                this.setState({ offsets: r.data });
            }
        });
    }

    apiGetAcl(projectName, subName) {
       
        this.DM.subGetACL(projectName, subName).then(r => {
            if (r.done) {
                this.setState({ acl: r.data });
            }
        });
    
    }

    render() {

        if (this.state.subs) {
            let flag = true;
            this.state.subs.forEach(item => {
                if (getShortName(item.name) === this.props.match.params.subname) {
                    flag = false;
                }
            });
            if (flag) {
                return <Redirect to={"/subs/#"+this.props.match.params.projectname} />
            }
        }
        else {
            return <h3>loading</h3>;
        }

        if (this.state.sub === undefined) {
            return <h3>loading</h3>;
        }

        const onlyConsumer =
            this.state.isServiceAdmin === false &&
            this.state.isProjectAdmin === false &&
            this.state.isConsumer === true;

        let willDelete = null;
        let willBack = null;

        let acl = null;
        let push = null;
        let metrics = null;

        if (this.state.sub && this.state.sub.pushConfig && this.state.sub.pushConfig.pushEndpoint !== "") {
            push = (<ul className="text-left list-group">
                <li key="push_header" className="list-group-item list-group-item-success text-center">
                <FontAwesomeIcon icon="paper-plane" /> push mode enabled
                <button
                    id="disable-push"
                    onClick={() => {
                      this.toggle();
                    }}
                    className="ml-2 btn btn-sm btn-danger"
                  >
                    Disable
                  </button>
                <Popover
                    placement="bottom"
                    isOpen={this.state.popoverOpen}
                    target="disable-push"
                    toggle={this.toggle}
                  >
                    <PopoverHeader>Are you sure ?</PopoverHeader>
                    <PopoverBody>
                      <button
                        id="confirm-disable-push"
                        onClick={() => {
                          this.apiClearPushConfig();
                          this.toggle();
                        }}
                        className="ml-2 btn btn-sm btn-dark"
                      >
                        Confirm
                      </button>
                    </PopoverBody>
                  </Popover>
                </li>
                <li key="push_info" className="list-group-item py-2 ">
                    <strong>push to: </strong> <a target="_blank" rel="noopener noreferrer" href={this.state.sub.pushConfig.pushEndpoint}><code>{this.state.sub.pushConfig.pushEndpoint}</code></a>
                </li>
                <li key="push_policy" className="list-group-item py-2 ">
                <strong>retry policy:</strong><br/>
                <span>  - type:</span><code>{this.state.sub.pushConfig.retryPolicy.type}</code><br/>
                <span>  - period:</span><code>{this.state.sub.pushConfig.retryPolicy.period}</code>
                </li>
                { this.state.sub.pushConfig.verified &&
                 <li className="list-group-item py-2 ">
                     Push endpoint <strong style={{color:"green"}}>verified!</strong><br/>
                     <strong>Status</strong>{this.state.sub.pushConfig.status}

                 </li>
                }
                { !this.state.sub.pushConfig.verified &&
                 <li className="list-group-item py-2 ">
                     Push endpoint <strong style={{color:"red"}}>unverified!</strong><br/>
                     
                     <p className="font-weight-normal">
                         Please configure the remote endpoint so that:
                         <code className="border rounded d-block font-weight-bold p-2">
                             <a className="text-dark" href={this.state.sub.pushConfig.pushEndpoint+"/ams_verification_hash"}>{this.state.sub.pushConfig.pushEndpoint}/ams_verification_hash</a>
                        </code>
                         responds with the following text:
                         <code className="border text-dark rounded d-block font-weight-bold p-2">
                         {this.state.sub.pushConfig.verification_hash}
                         </code>
                     </p>
                     <p className="text-center">
                     <button className="btn btn-secondary btn-sm" onClick={e=>this.apiDoVerify()}>Verify Endpoint</button>
                     </p>
                     

                 </li>
                }  


            </ul>)
        }

        if (this.state.acl && this.state.acl.authorized_users.length > 0) {
            let aclUsers = [];
            aclUsers.push(
                <li
                    key="_header"
                    className="list-group-item list-group-item-success"
                >
                    authorized_users
                </li>
            );
            for (let item of this.state.acl["authorized_users"]) {
                aclUsers.push(
                    <li key={item} className="list-group-item py-2">
                        {" "}
                        <FontAwesomeIcon icon="user" />
                        <Link to={"/users/details/" + item}>{item}</Link>
                    </li>
                );
            }
            acl = <ul className="text-center list-group">{aclUsers}</ul>;
        }

        if (this.state.metrics && this.state.metrics.metrics.length > 0) {
            let smallMetricList = [];
            let metricList = [];
            let latestDate = "";

            for (let item of this.state.metrics["metrics"]) {
                let timedata = [];
                let chart = null;

                // If metric contains large timeseries of data plot it on it's own card
                if (item.timeseries.length > 1) {
                    chart = (
                        <div style={{ overflow: "hidden" }}>
                            <BarChart
                                width={700}
                                height={300}
                                data={item.timeseries.reverse()}
                            >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="timestamp" />
                                <YAxis dataKey="value" />
                                <Tooltip />
                                <Bar dataKey="value" fill="#8884d8" />
                            </BarChart>
                        </div>
                    );

                    for (let timedatum of item.timeseries) {
                        timedata.push(
                            <tr key={timedatum.timestamp}>
                                <td
                                    style={{
                                        width: "1%",
                                        whiteSpace: "nowrap"
                                    }}
                                >
                                    <small>{timedatum.timestamp}</small>
                                </td>
                                <td className="td-fit">
                                    <code>{timedatum.value}</code>
                                </td>
                            </tr>
                        );
                    }

                    let card = (
                        <Card key={item.metric} className="mb-4">
                            <CardHeader>
                                <strong>name: </strong>
                                {item.metric}
                            </CardHeader>
                            <CardBody>
                                {chart}
                                <table className="table table-sm table-striped table-hover">
                                    <thead>
                                        <tr>
                                            <th
                                                style={{
                                                    width: "1%",
                                                    whiteSpace: "nowrap"
                                                }}
                                                scope="col"
                                            >
                                                Timestamp
                                            </th>
                                            <th className="th-fit" scope="col">
                                                Value
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>{timedata}</tbody>
                                </table>
                            </CardBody>
                            <CardFooter>{item.description}</CardFooter>
                        </Card>
                    );

                    metricList.push(card);
                } else if (item.timeseries.length === 1) {
                    // combine smaller metrics in one view
                    latestDate = item.timeseries[0].timestamp;
                    let metricItem = (
                        <Card key={item.metric} className="col-4 p-2 rounded">
                            <CardBody className="text-center">
                                <h3>
                                    <strong>
                                        <NumberFormat
                                            value={item.timeseries[0].value}
                                            displayType={"text"}
                                            thousandSeparator={true}
                                        />
                                    </strong>
                                </h3>
                                <br />
                                <h6>
                                    <abbr title={item.description}>
                                        {item.metric.split(".")[1]}
                                        <FontAwesomeIcon
                                            icon="info-circle"
                                            className="ml-2"
                                            style={{ color: "grey" }}
                                        />
                                    </abbr>
                                </h6>
                                <br />
                            </CardBody>
                        </Card>
                    );

                    smallMetricList.push(metricItem);
                }
            }
            metrics = (
                <div>
                    <div className="row p-3">{smallMetricList}</div>

                    <div className="row text-right">
                        <div className="col-12">
                            <small>{latestDate}</small>
                        </div>
                    </div>
                    <br />
                    <div>{metricList}</div>
                </div>
            );
        }

        if (this.state.toDelete) {
            willDelete = (
                <Card className="border-danger mb-2">
                    <CardHeader className="border-danger text-danger text-center">
                        <h5>
                            <FontAwesomeIcon
                                className="mx-3"
                                icon="exclamation-triangle"
                            />
                            <strong>Subscription Deletion</strong>
                        </h5>
                    </CardHeader>
                    <CardBody className="border-danger text-center">
                        Are you sure you want to delete Subscription:{" "}
                        <strong>{this.state.sub.name}</strong>
                    </CardBody>
                    <CardFooter className="border-danger text-danger text-center">
                        <Button
                            color="danger"
                            className="mr-2"
                            onClick={() => {
                                this.apiDelete(
                                    this.props.match.params.projectname,
                                    this.props.match.params.subname
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

        let subIconName = "envelope-open";

        if (this.state.sub.pushConfig.pushEndpoint !== "") {
            subIconName = "paper-plane";
        }

        return (
            <div>
                <NotificationContainer />
                <Row>
                    <Col>
                        <h2>Subscription Details</h2>
                    </Col>
                    <Col className="text-right">
                      <Link
                            className="btn btn-info  ml-1 mr-1 mt-1"
                            to={"/subs/pull" + this.state.sub.name}
                        >
                            <FontAwesomeIcon icon="envelope-open" /> Pull Messages
                        </Link>
                        <Link
                            className="btn btn-info  ml-1 mr-1  mt-1"
                            to={"/subs/update" + this.state.sub.name}
                        >
                            <FontAwesomeIcon icon="pen" /> Modify Subscription
                        </Link>
                        {!onlyConsumer && (
                            <Link
                                className="btn btn-info  ml-1 mr-1  mt-1"
                                to={"/subs/mod-acl" + this.state.sub.name}
                            >
                                <FontAwesomeIcon icon="user-lock" /> Modify ACL
                            </Link>
                        )}

                        <Link
                            className="btn btn-info  ml-1 mr-1  mt-1"
                            to={"/subs/mod-offset" + this.state.sub.name}
                        >
                            <FontAwesomeIcon icon="sliders-h" /> Modify Offset
                        </Link>
                        {!onlyConsumer && (
                            <a
                                className="btn btn-danger  ml-1 mr-1  mt-1"
                                href={"/subs/delete" + this.state.sub.name}
                            >
                                <FontAwesomeIcon icon="times" /> Delete Sub
                            </a>
                        )}
                    </Col>
                </Row>

                <div>
                    <Row>
                        <div className="col-md-4 col-sm-12 col-xs-12">
                            <Card>
                                <CardBody>
                                    <div className="mx-auto profile-circle">
                                        <div className="mt-3">
                                            <FontAwesomeIcon
                                                className="ml-1 mr-1"
                                                size="4x"
                                                icon={subIconName}
                                            />
                                        </div>
                                    </div>
                                    <br />
                                    <span className="text-center">
                                        <h4>
                                            {getShortName(this.state.sub.name)}
                                        </h4>
                                    </span>

                                    <ul className="list-group mb-4">
                                        <li className="list-group-item">
                                            <span className="text-center d-block">
                                                <strong>project:</strong>{" "}
                                                {getProjectColorIcon(
                                                    getProjectName(
                                                        this.state.sub.name
                                                    )
                                                )}{" "}
                                                {!onlyConsumer && (
                                                    <Link
                                                        style={{
                                                            color: "black"
                                                        }}
                                                        to={
                                                            "/projects/details/" +
                                                            getProjectName(
                                                                this.state.sub
                                                                    .name
                                                            )
                                                        }
                                                    >
                                                        {getProjectName(
                                                            this.state.sub.name
                                                        )}
                                                    </Link>
                                                )}
                                                {onlyConsumer && (
                                                    <span>
                                                        {getProjectName(
                                                            this.state.sub.name
                                                        )}
                                                    </span>
                                                )}
                                            </span>
                                        </li>
                                        <li className="list-group-item">
                                            <span>
                                                <strong>full name:</strong>{" "}
                                                <code>
                                                    {this.state.sub.name}
                                                </code>
                                            </span>
                                        </li>
                                        <li className="list-group-item">
                                            <span>
                                                <strong>
                                                    attached to topic:
                                                </strong>{" "}
                                                <code>
                                                    {!onlyConsumer && (
                                                          <Link
                                                          to={
                                                              "/topics/details" +
                                                              this.state.sub.topic
                                                          }
                                                      >
                                                          {this.state.sub.topic}
                                                      </Link>
                                                    )}
                                                    {onlyConsumer && (
                                                        <span>
                                                             {this.state.sub.topic}
                                                        </span>
                                                    )}
                                                  
                                                </code>
                                            </span>
                                        </li>
                                        <li className="list-group-item">
                                            <span>
                                                <strong>
                                                    offsets (min,cur,max):
                                                </strong>{" "}
                                                {this.state.offsets && (
                                                    <code>
                                                        {this.state.offsets.min}
                                                        ,
                                                        {
                                                            this.state.offsets
                                                                .current
                                                        }
                                                        ,
                                                        {this.state.offsets.max}
                                                    </code>
                                                )}
                                            </span>
                                        </li>
                                        <li className="list-group-item">
                                            <span>
                                                <strong>ack deadline:</strong>{" "}
                                                <code>
                                                    {
                                                        this.state.sub
                                                            .ackDeadlineSeconds
                                                    }
                                                </code>
                                            </span>
                                        </li>
                                        
                                    </ul>
                                    
                                    {push}
                                    <br/>
                                    {acl}

                                    
                                </CardBody>
                            </Card>
                        </div>
                        <div className="col-md-8 col-sm-12 col-xs-12">
                            {willDelete}

                            <Card>
                                <CardHeader>
                                    <strong>Metrics</strong>
                                </CardHeader>
                                <CardBody>{metrics}</CardBody>
                            </Card>

                            <Card className="mt-2 text-secondary">
                                <CardFooter>
                                    <strong>Icon legend:</strong>
                                    <span className="border p-2 mx-2 rounded">
                                        <FontAwesomeIcon
                                            className="ml-1 mr-1"
                                            icon="envelope"
                                        />{" "}
                                        topic
                                    </span>
                                    <span className="border p-2 mx-2 rounded">
                                        <FontAwesomeIcon
                                            className="ml-1 mr-1"
                                            icon="envelope-open"
                                        />{" "}
                                        subscription
                                    </span>
                                </CardFooter>
                            </Card>
                            <div className="m-2 text-right">{willBack}</div>
                        </div>
                    </Row>
                </div>
            </div>
        );
    }
}

export default SubDetails;
