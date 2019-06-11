class Authen {
  

  setEndpoint(endpoint) {
    localStorage.setItem("auth_endpoint", endpoint);
  }

  tryLogin(token, callback) {
    let endpoint = localStorage.getItem("auth_endpoint");

    // If token or endpoint empty return
    if (token === "" || token === null || endpoint === "") {
      return {error: "invalid credentials"}
    }
    // quickly construct request url
    let url =
      "https://" + endpoint + "/v1/users:byToken/" + token + "?key=" + token;
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
          return {error: "could not login", isLogged: false}
        }
      })
      .then(json => {
        if (json.error === undefined) {
          this.setLogin(json.name, token)
          if (callback !== undefined){
            return callback({ username: json.name, token: token, error: null, isLogged:true})
          }
          return { username: json.name, token: token, error: null, isLogged: true}   
        } else {
          if (callback !== undefined){
            return callback({ username: null, token: null, error: json.error, isLogged:json.isLogged})
          }
          return { username: null, token: null, error: json.error, isLogged:json.isLogged}   
        }

      })
      .catch(error => {
        console.log(error);
      });
  }

  isLogged() {
    let logged =  JSON.parse(localStorage.getItem("auth_logged"));
    
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

  setLogin(username, token) {
    localStorage.setItem("auth_username", username);
    localStorage.setItem("auth_token", token);
    localStorage.setItem("auth_logged", true);
  }

  setLogout(username, token) {
    localStorage.removeItem("auth_username");
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_logged");
  }
}

export default Authen;
