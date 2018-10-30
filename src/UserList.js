import React from 'react';
import User from './User'

class UserList extends React.Component {

    render(){
        
        let userComps = [];
        let count=0;
       
        for (let user of this.props.item ) {
            userComps.push(<User key={count} item={user}/>)
            count++;
        }
    return <ul>{userComps}</ul>
    }
}

export default UserList