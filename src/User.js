import React from 'react';
import userIcon from './user.svg'

class User extends React.Component{

    validateEmail(email) {
        var re = /\S+@\S+\.\S+/;
        if  (re.test(String(email).toLowerCase())){
            return "email-valid"
        } else {
            return "email-nonvalid"
        }
    }
    

    render() {

        // parse the info contained in users projects/roles section
        let prStr = "";
        for (let project of this.props.item.projects){
            let rolesStr = "";
            for (let role of project.roles){
                rolesStr= rolesStr + " " + role;
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

        return <li>
            <img src={userIcon} alt="user" />
            Name: <span>{this.props.item.name}</span>
            {   this.props.item.email !== "" &&
             <>
                Email: <span className={this.validateEmail(this.props.item.email)}>{this.props.item.email}</span>
             </>
            }  
            
            { sRolesStr !== ""  &&
            <>
                Service_Roles: <span className="roleList">{sRolesStr}</span>
            </>
            }

            { prStr !== ""  &&
            <>
                Roles:<span className="roleList">{prStr}</span> 
            </>
            }
            
            Created-on: <span>{this.props.item.created_on}</span>
            </li>
    }
}

export default User;