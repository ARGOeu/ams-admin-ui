import React from 'react';
import argologoAnim from './argologo_anim.svg'
import { Card, CardBody, CardHeader } from "reactstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { library } from "@fortawesome/fontawesome-svg-core";
import {
    faEnvelopeOpen,
} from "@fortawesome/free-solid-svg-icons";
library.add(
    faEnvelopeOpen,
);
class About extends React.Component{

    render() {
        return (  <div className="row">
        <div className="col-sm-6 mx-auto">
          <Card>
            <CardHeader><FontAwesomeIcon icon="envelope-open"/> Subscriptions</CardHeader>
            <CardBody>
              <p>
                Subscriptions are resources that can be attached on topics and allow 
                clients to connect and consume messages
              </p>
              <code>Subscription implementation is coming soon <img alt="argo logo" src={argologoAnim} /></code>
            </CardBody>
          </Card>
        </div>
      </div>);
    }
}

export default About;