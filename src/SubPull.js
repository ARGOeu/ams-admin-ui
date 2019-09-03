import React, { Component } from "react";
import {
    NotificationManager,
    NotificationContainer
} from "react-notifications";
import { Formik, Field, Form, ErrorMessage } from "formik";
import Authen from "./Authen";

import { Card, Button, Progress } from "reactstrap";
import DataManager from "./DataManager";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { library } from "@fortawesome/fontawesome-svg-core";
import { faKeyboard, faEnvelope, faClock } from "@fortawesome/free-solid-svg-icons";
library.add(faKeyboard, faEnvelope, faClock);

function clip() {
    let copyText = document.getElementById("curl-snip");
    copyText.select()
    document.execCommand("copy");
    NotificationManager.info("snippet copied to clipboard", null, 1000);
}

function genCurlSnippet(endpoint, project, sub, token, max, returnImm) {
    
    return (
        "curl -X POST \\\n" +
        "'https://" +
        endpoint +
        "/v1/projects/" +
        project +
        "/subscriptions/" +
        sub +
        ":pull?key=" +
        token +
        "' \\\n" +
        "-H 'Accept: application/json' \\\n" +
        "-H 'Content-Type: application/json' \\\n" +
        "-d '" +
        JSON.stringify({"maxMessages":Number(max).toString(),"returnImmediately":Boolean(returnImm).toString()}) +
        "'"
    );
}


// validate pull options
function validate(values, other) {
    let errors = {};

    if (isNaN(values.maxMessages)) {
        errors.maxMessages = "please enter a valid integer number"
    }

    if (values.maxMessages < 1) {
        errors.maxMessages = "please enter an integer number larger than 0"
    }

    return errors;
}

class SubPull extends Component {
    constructor(props) {
        super(props);
        this.authen = new Authen();
        this.DM = new DataManager(
            this.authen.getEndpoint(),
            this.authen.getToken()
        );
        this.state = {
            project: "",
            sub: "",
            messages: [],
            placeholder: "Empty",
            subAckTimeout: 10,
            timeout: 0
        };

        if (this.authen.isLogged()) {
            this.state = {
                project: this.props.match.params.projectname,
                sub: this.props.match.params.subname,
                messages: [],
                placeholder: "Empty",
                subAckTimeout: 10,
                timeout: 0
            };
        }

        this.interval = null;

        this.handleMsgText = this.handleMsgText.bind(this);
    }


    componentDidMount(){
        // begin with return immediately box checked
        document.querySelector("#returnImmed-check").click()
    }

    doInterval() {
        this.setState({timeout:this.state.subAckTimeout})
        this.interval = setInterval( () => {
            let left = this.state.timeout - 1
            if (this.state.timeout === 0) {
                clearInterval(this.interval);
                left = 0
            }
            this.setState({timeout: left})
        },1000)
    }

    doAck(project, sub, ackId) {
        this.setState({placeholder:"sending ack...", messages:[]})
        this.DM.subAck(project, sub, ackId).then(r => {
            if (r && r.done) { 
                this.setState({ "messages": [], placeholder: "messages acknowledged - ready to pull" });
                NotificationManager.info(
                    "Messages Acknowledged!",
                    null,
                    1000
                );
            } else {
                this.setState({ "messages": [], placeholder: "ack failed - retry pulling" })
                NotificationManager.error(
                    "Ack of messages failed",
                    null,
                    1000
                );
            }
        });
    }


    doPull(project, sub, max, returnImm) {
        this.setState({placeholder:"pulling messages...", messages:[]})
        
        this.DM.subGet(project,sub).then(r=>{
            if (r && r.done){
                this.setState({subAckTimeout:r.data["ackDeadlineSeconds"]})
            }
        }).then(this.DM.subPull(project, sub, max, returnImm).then(r => {
            if (r && r.done) { 
                this.setState({ "messages": r.data["receivedMessages"], placeholder: "Empty" });
                this.doInterval()
                NotificationManager.info(
                    "Messages Pulled!",
                    null,
                    1000
                );
            } else {
                NotificationManager.error(
                    "Pulling of messages failed...",
                    null,
                    1000
                );
            }
        }));
    }

    handleMsgText(e) {
        if (e) {
            this.setState({
                msg: e.target.value,
                payload: btoa(e.target.value)
            });
        }
    }

    render() {
        return (
            <div>
                <NotificationContainer />
                <div className="row mb-2">
                    <div className="col-12">
                        <h2>
                            Pull messages from subscription:{" "}
                            <strong>{this.state.sub}</strong>{" "}
                            <small>({this.state.project})</small>
                        </h2>
                    </div>
                </div>
                <Card className="d-block p-4">
                    <Formik
                        initialValues={{
                            maxMessages: 1,
                            returnImm: false
                        }}
                        validate={validate}
                        onSubmit={values => {
                            this.doPull(
                                this.state.project,
                                this.state.sub,
                                values.maxMessages,
                                values.returnImm
                            );
                        }}
                        render={({ values, errors, touched }) => {
                            
                            let msgList = [<li key="list_header" className="list-group-item">List of pulled Messages:</li>]

                            if (this.state.messages.length === 0) {
                                msgList.push(<li key="list_empty" 
                                                className="list-group-item" 
                                                style={{color:"grey",backgroundColor:"#EEEEEE"}}>
                                                    ({this.state.placeholder})
                                             </li>)
                            } else {
                                let recMsgs = this.state.messages
                                for (let i=0;i<recMsgs.length;i++){

                                

                                    let msg = recMsgs[i]["message"]
                                    let hasAttr = ("attributes" in msg)
                                    let attrList = []

                                    if (hasAttr){
                                        for (let key in msg["attributes"]) {
                                            attrList.push(<span className="attr" key={"attr"+key}><strong>&nbsp;{key}:&nbsp;</strong><em>&nbsp;{msg["attributes"][key]}&nbsp;</em></span>)
                                        }
                                    }

                                    let ackCol = null   
                                    if (this.state.timeout > 0) {
                                        ackCol = (
                                        <div className="col-auto pull-right">
                                            
                                             <label>Acknowledge up to this message:</label>
                                             <button type="button"
                                           
                                            onClick={e=>{this.doAck(this.state.project,this.state.sub,recMsgs[i]["ackId"])}}
                                            className="ackbtn btn btn-success btn-sm ml-4">
                                                Ack
                                            </button> 
                                            <Progress animated color="secondary" value={this.state.timeout * 100 / this.state.subAckTimeout}> {this.state.timeout + " sec"} </Progress>
                                            
                                          </div>);
                                    } else {
                                        ackCol = (<div className="col-auto pull-right">
                                            
                                             <label>Ack timeout passed, please pull again...</label>
                                             <button type="button"
                                           
                                            onClick={e=>{this.doAck(this.state.project,this.state.sub,recMsgs[i]["ackId"])}}
                                            className="ackbtn btn btn-success btn-sm ml-4 disabled">
                                                Ack
                                            </button> 
                                            
                                          </div>)
                                    }

                                    msgList.push(<li className="list-group-item text-left pb-4" key={"recMsg_"+i}>
                                         
                                         <div className="row">
                                          <div className="col-lg">
                                            <h5><FontAwesomeIcon icon="envelope" /><strong> Message id: </strong><code>{msg["messageId"]}</code></h5>
                                          </div>
                                          {ackCol}
                                         </div>
                                         <div className="row mx-1">
                                         <em style={{color:"#888888"}}><FontAwesomeIcon icon="clock" /> <code style={{color:"grey"}}>{msg["publishTime"]}</code></em>
                                         </div>
                                         <div className="row mx-1">
                                         <code className="form-control mt-2 mb-2">
                                             {atob(msg["data"])}
                                         </code>
                                         <div>{attrList}</div>
                                         </div>
                                         
                                       
                                         
                                         


                                           
                                    
                                    </li>)
                                }
                                
                            }

                            
                            let curlStr = genCurlSnippet(
                                this.authen.getEndpoint(),
                                this.state.project,
                                this.state.sub,
                                this.authen.getToken(),
                                values.maxMessages,
                                values.returnImm
                            );

                           
                            return (
                                <Form>
                                    <div className="form-row align-items-center">
                                        <div className="col-auto my-1">
                                            <div className="input-group">
                                                <div className="input-group-prepend">
                                                    <div className="input-group-text">
                                                        Max Messages:
                                                    </div>
                                                </div>
                                                <Field
                                                    name="maxMessages"
                                                    type="text"
                                                    className="form-control"
                                                />
                                            </div>
                                            <small className="field-error form-text text-danger">
                                                <ErrorMessage name="message" />
                                            </small>
                                        </div>
                                        <div className="col-auto my-1">
                                            <div className="form-check">
                                                <Field
                                                    name="returnImm"
                                                    type="checkbox"
                                                    id="returnImmed-check"
                                                    className="form-check-input"
                                                />
                                                <label className="form-check-label" htmlFor="returnImm">
                                                    Don't wait (in case of no
                                                    new messages)
                                                </label>
                                                
                                            </div>
                                            <small className="field-error form-text text-danger">
                                                <ErrorMessage name="message" />
                                            </small>
                                        </div>
                                        <div className="col-auto my-1">
                                            <button
                                                type="submit"
                                                className="btn btn-success"
                                            >
                                                Pull
                                            </button>
                                            <span> </span>
                                            <Button
                                                type="button"
                                                onClick={() => {
                                                    clearInterval(this.interval);
                                                    this.props.history.goBack();
                                                }}
                                                className="btn btn-dark"
                                            >
                                                Cancel
                                            </Button>
                                        </div>
                                    </div>
                                    <div className="mt-2 text-center">
                                    
                                    <ul className="list-group list-group-hover list-group-striped">
                                        {msgList}
                                    </ul>
                                    </div>
                                    

                                    <div className="m-2 border p-2">
                                        <div className="row">
                                            <div className="col-11">
                                                <strong className="ml-1">
                                                    <FontAwesomeIcon
                                                        className="ml-1 mr-1"
                                                        icon="keyboard"
                                                    />
                                                    Curl call to AMS API:{" "}
                                                </strong>
                                            </div>
                                            <div className="col-1 text-right">
                                                <button
                                                    type="button"
                                                    onClick={clip}
                                                    className="btn btn-sm btn-warning"
                                                >
                                                    Copy
                                                </button>
                                            </div>
                                        </div>

                                        <div
                                            className="border p-2 mt-1"
                                            style={{
                                                backgroundColor: "#282B2F"
                                            }}
                                        >
                                            <code
                                                style={{
                                                    color: "lightgrey",
                                                    fontWeight: "bold",
                                                    fontSize: "1.2em"
                                                }}
                                            >
                                                {curlStr}
                                            </code>
                                            <textarea
                                                style={{
                                                    opacity: "0",
                                                    height: "0px",
                                                    width: "0px"
                                                }}
                                                className="form-control"
                                                readOnly
                                                value={curlStr}
                                                id="curl-snip"
                                            />
                                        </div>
                                    </div>
                                </Form>
                            );
                        }}
                    />
                </Card>
            </div>
        );
    }
}

export default SubPull;
