import React from "react";
import argologoAnim from "./argologo_anim.svg";
import { Card, CardBody, CardHeader } from "reactstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { library } from "@fortawesome/fontawesome-svg-core";
import {
    faDiceD6,
} from "@fortawesome/free-solid-svg-icons";
library.add(
    faDiceD6,
);
class Projects extends React.Component {
  render() {
    return (
      <div className="row">
        <div className="col-sm-6 mx-auto">
          <Card>
            <CardHeader><FontAwesomeIcon icon="dice-d6"/> Projects</CardHeader>
            <CardBody>
              <p>
                Projects are used to group topics and subscriptions in an
                isolated enviroment (under a client or organization for example)
              </p>
              <code>Project implementation is coming soon <img alt="argo logo" src={argologoAnim} /></code>
            </CardBody>
          </Card>
        </div>
      </div>
    );
  }
}

export default Projects;
