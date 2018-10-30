import React from 'react';

class User extends React.Component{

    

    render() {

        // parse the info contained in users projects/roles section
        let prStr = "";
        for (let project of this.props.item.projects){
            let rolesStr = "";
            for (let role of project.roles){
                rolesStr= rolesStr + " " + role;
            }
            prStr = prStr + " " + project.project + "(" + rolesStr + ")";
        }


        return <li>
            Name: <span>{this.props.item.name}</span>  
            Roles:<span className="roleList">{prStr}</span> 
            Created-on: <span>{this.props.item.created_on}</span>
            Email: <span>{this.props.item.email}</span>
            Description: <span>{this.props.item.description}</span>
            </li>
    }
}

export default User;