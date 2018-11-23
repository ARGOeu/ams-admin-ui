import React from 'react';
import argologoAnim from './argologo_anim.svg'
import { Card, CardBody, CardHeader} from "reactstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { library } from "@fortawesome/fontawesome-svg-core";
import {
    faEnvelope,
} from "@fortawesome/free-solid-svg-icons";
library.add(
    faEnvelope,
);

class Topics extends React.Component{

    render() {
        return (<div className="row">
        <div className="col-sm-6 mx-auto">
          <Card>
            <CardHeader><FontAwesomeIcon icon="envelope"/> Topics</CardHeader>
            <CardBody>
              <p>
                Topics are like mail-box resources in a project where clients can connect and leave messages
              </p>
              <code>Topics implementation is coming soon <img alt="argo logo" src={argologoAnim} /></code>
            </CardBody>
          </Card>
        </div>
      </div>);
    }
}

export default Topics;