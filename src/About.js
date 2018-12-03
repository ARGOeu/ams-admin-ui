import React from 'react';
import argologoAnim from './argologo_anim.svg'

class About extends React.Component{

    render() {
        return (<div>
       <img src={argologoAnim}></img>
       <h1>About Argo Admin UI</h1>
       <p>This is an admin ui to create,list,update and delete user items in remote argo services</p>
       </div>);
    }
}

export default About;