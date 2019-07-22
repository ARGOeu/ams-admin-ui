class Authen {
    setEndpoint(endpoint) {
        localStorage.setItem("auth_endpoint", endpoint);
    }

    tryLogin(token, callback) {
        let endpoint = localStorage.getItem("auth_endpoint");

        // If token or endpoint empty return
        if (token === "" || token === null || endpoint === "") {
            return { error: "invalid credentials" };
        }
        // quickly construct request url
        let url = "https://" + endpoint + "/v1/users/profile?key=" + token;
        // setup the required headers
        let headers = {
            "Content-Type": "application/json",
            Accept: "application/json"
        };
        // fetch the data and if succesfull change the component state - which will trigger a re-render
        fetch(url, { headers: headers })
            .then(response => {
                if (response.status === 200) {
                    return response.json();
                } else {
                    return { error: "could not login", isLogged: false };
                }
            })
            .then(json => {
                if (json.error === undefined) {
                    this.setLogin(
                        json.name,
                        token,
                        json.projects,
                        json.service_roles
                    );
                    if (callback !== undefined) {
                        return callback({
                            username: json.name,
                            token: token,
                            error: null,
                            isLogged: true
                        });
                    }
                    return {
                        username: json.name,
                        token: token,
                        error: null,
                        isLogged: true
                    };
                } else {
                    if (callback !== undefined) {
                        return callback({
                            username: null,
                            token: null,
                            error: json.error,
                            isLogged: json.isLogged
                        });
                    }
                    return {
                        username: null,
                        token: null,
                        error: json.error,
                        isLogged: json.isLogged
                    };
                }
            })
            .catch(error => {
                console.log(error);
            });
    }

    isLogged() {
        let logged = JSON.parse(localStorage.getItem("auth_logged"));

        if (logged === null) return false;
        return logged;
    }

    getToken() {
        return localStorage.getItem("auth_token");
    }

    getEndpoint() {
        return localStorage.getItem("auth_endpoint");
    }

    getUsername() {
        return localStorage.getItem("auth_username");
    }

    getServiceRoles() {
        let strServiceRoles = localStorage.getItem("auth_service_roles");
        if (strServiceRoles) {
            return JSON.parse(strServiceRoles);
        }
        return [];
    }

    isServiceAdmin(){
        return this.getServiceRoles().indexOf("service_admin") > -1
    }

    isPublisher(){
        return "publisher" in this.getProjectsPerRole()
    }

    isConsumer(){
        return "consumer" in this.getProjectsPerRole()
    }

    isProjectAdmin() {
        return "project_admin" in this.getProjectsPerRole()
    }

    getProjects() {
        let strProjects = localStorage.getItem("auth_projects");
        if (strProjects) {
            return JSON.parse(strProjects);
        }
        return [];
    }

    getProjectsPerRole() {
        let roles = {};
        let strProjects = localStorage.getItem("auth_projects");
        if (strProjects) {
            let projects = JSON.parse(strProjects);
            for (let project of projects) {
                for (let role of project["roles"]) {
                    if (!(role in roles)) {
                        roles[role] = new Set();
                    }
                    roles[role].add(project["project"]);
                }
            }
        }
        return roles;
    }

    setLogin(username, token, projects, serviceRoles) {
        localStorage.setItem("auth_username", username);
        localStorage.setItem("auth_token", token);
        localStorage.setItem("auth_logged", true);
        localStorage.setItem("auth_projects", JSON.stringify(projects));
        localStorage.setItem(
            "auth_service_roles",
            JSON.stringify(serviceRoles)
        );
    }

    setLogout() {
        localStorage.removeItem("auth_username");
        localStorage.removeItem("auth_token");
        localStorage.removeItem("auth_logged");
        localStorage.removeItem("auth_projects");
        localStorage.removeItem("auth_service_roles");
    }
}

export default Authen;
