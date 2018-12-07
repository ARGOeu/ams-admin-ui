import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link } from "react-router-dom";
class User extends React.Component {
  validateEmail(email) {
    var re = /\S+@\S+\.\S+/;
    if (re.test(String(email).toLowerCase())) {
      return "email-valid";
    } else {
      return "email-nonvalid";
    }
  }

  render() {
    // parse the info contained in users projects/roles section
    let prStr = "";
    for (let project of this.props.item.projects) {
      let rolesStr = "";
      for (let role of project.roles) {
        rolesStr = rolesStr + " " + role;
      }
      prStr = prStr + " " + project.project + "(" + rolesStr + " )";
    }
    let sRolesStr = "";
    // add also the service roles
    if (this.props.item.service_roles.length > 0) {
      for (let sRole of this.props.item.service_roles) {
        sRolesStr = sRolesStr + " " + sRole;
      }
    }

    return (
    <tr>
      <td>
        <FontAwesomeIcon icon="user" className="mr-1" />
        <span>
          <strong>
            <Link to={"/users/details/" + this.props.item.name}>
              {this.props.item.name}
            </Link>
          </strong>
        </span>
      </td>
      <td>
        <span className={this.validateEmail(this.props.item.email)}>
          {this.props.item.email}
        </span>
      </td>
      <td>
        <span className="roleList">{sRolesStr}</span>
        <span className="roleList">{prStr}</span>
      </td>
      <td>
      <span>{this.props.item.created_on.split("T")[0]}</span>
      </td>
      <td>
      <span>{this.props.item.modified_on.split("T")[0]}</span>
      </td>
    </tr>);
  }
}

export default User;
