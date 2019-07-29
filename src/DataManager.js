class DataManager {
  endpoint = "";
  token = "";
  headers = {
    "Content-Type": "application/json",
    Accept: "application/json"
  };

  constructor(endpoint, token) {
    this.endpoint = endpoint;
    this.token = token;
  }

  projectGetMetrics(project) {
    if (!project || !this.token || !this.endpoint)
      return Promise.resolve({ done: false });

    // quickly construct request url
    let url =
      "https://" +
      this.endpoint +
      "/v1/projects/" +
      project +
      ":metrics?key=" +
      this.token;
    return this.doGet(url, "metrics");
  }

  projectGet(projectName) {
    if (!this.token || !this.endpoint) return Promise.resolve({ done: false });
    let project = "";
    if (projectName) project = "/" + projectName;
    // quickly construct request url
    let url =
      "https://" +
      this.endpoint +
      "/v1/projects" +
      project +
      "?key=" +
      this.token;
    return this.doGet(url, "projects");
  }

  userRefreshToken(username) {
    if (!username || !this.token || !this.endpoint)
      return Promise.resolve({ done: false });
    // quickly construct request url
    let url =
      "https://" +
      this.endpoint +
      "/v1/users/" +
      username +
      ":refreshToken?key=" +
      this.token;
    return this.doPost(url);
  }

  projectMembersGet(project){
    if (!this.token || !this.endpoint) return Promise.resolve({ done: false });

    // quickly construct request url
    let url =
      "https://" + this.endpoint + "/v1/projects/" + project +  "/members?key=" + this.token;
   
    return this.doGet(url, "users");
  }

  userGet(userName) {
    if (!this.token || !this.endpoint) return Promise.resolve({ done: false });
    let user = "";
    if (userName) user = "/" + userName;

    // quickly construct request url
    let url =
      "https://" + this.endpoint + "/v1/users" + user + "?key=" + this.token;
   
    return this.doGet(url, "users");
  }

  topicGet(project, topicName = "") {
    if (!project || !this.token || !this.endpoint)
      return Promise.resolve({ done: false });
    let topic = "";
    if (topicName) topic = "/" + topicName;

    // quickly construct request url
    let url =
      "https://" +
      this.endpoint +
      "/v1/projects/" +
      project +
      "/topics" +
      topic +
      "?key=" +
      this.token;
    return this.doGet(url, "topics");
  }

  topicGetMetrics(project, topic) {
    if (!project || !topic || !this.token || !this.endpoint)
      return Promise.resolve({ done: false });

    // quickly construct request url
    let url =
      "https://" +
      this.endpoint +
      "/v1/projects/" +
      project +
      "/topics/" +
      topic +
      ":metrics?key=" +
      this.token;
    return this.doGet(url, "metrics");
  }

  topicCreate(project, topic) {
    if (!project || !topic || !this.token || !this.endpoint)
      return Promise.resolve({ done: false });
    // quickly construct request url
    let url =
      "https://" +
      this.endpoint +
      "/v1/projects/" +
      project + "/topics/" + topic +
      "?key=" +
      this.token;

    return this.doPut(url, {});
  }

  topicGetACL(project, topic) {
    if (!project || !topic || !this.token || !this.endpoint)
      return Promise.resolve({ done: false });

    // quickly construct request url
    let url =
      "https://" +
      this.endpoint +
      "/v1/projects/" +
      project +
      "/topics/" +
      topic +
      ":acl?key=" +
      this.token;
    return this.doGet(url, "authorized_users");
  }

  subGet(project, subName = "") {
    if (!project || !this.token || !this.endpoint)
      return Promise.resolve({ done: false });
    let sub = "";
    if (subName) sub = "/" + subName;

    // quickly construct request url
    let url =
      "https://" +
      this.endpoint +
      "/v1/projects/" +
      project +
      "/subscriptions" +
      sub +
      "?key=" +
      this.token;
    return this.doGet(url, "subscriptions");
  }

  subGetMetrics(project, sub) {
    if (!project || !sub || !this.token || !this.endpoint)
      return Promise.resolve({ done: false });

    // quickly construct request url
    let url =
      "https://" +
      this.endpoint +
      "/v1/projects/" +
      project +
      "/subscriptions/" +
      sub +
      ":metrics?key=" +
      this.token;
    return this.doGet(url, "metrics");
  }

  subGetOffsets(project, sub) {
    if (!project || !sub || !this.token || !this.endpoint)
      return Promise.resolve({ done: false });

    // quickly construct request url
    let url =
      "https://" +
      this.endpoint +
      "/v1/projects/" +
      project +
      "/subscriptions/" +
      sub +
      ":offsets?key=" +
      this.token;
    return this.doGet(url, "offsets");
  }

  subGetACL(project, sub) {
    if (!project || !sub || !this.token || !this.endpoint)
      return Promise.resolve({ done: false });

    // quickly construct request url
    let url =
      "https://" +
      this.endpoint +
      "/v1/projects/" +
      project +
      "/subscriptions/" +
      sub +
      ":acl?key=" +
      this.token;
    return this.doGet(url, "authorized_users");
  }

  subDelete(project, sub) {
    if (!project || !sub || !this.token || !this.endpoint)
      return Promise.resolve({ done: false });
    // quickly construct request url
    let url =
      "https://" +
      this.endpoint +
      "/v1/projects/" +
      project +
      "/subscriptions/" +
      sub +
      "?key=" +
      this.token;

    return this.doDelete(url);
  }

  subModOffset(project, sub, data) {
    if (!project || !sub || !this.token || !this.endpoint)
      return Promise.resolve({ done: false });

    // quickly construct request url
    let url =
    "https://" +
    this.endpoint +
    "/v1/projects/" +
    project + "/subscriptions/" + sub +
    ":modifyOffset?key=" +
    this.token;

    return this.doSimplePost(url, data)
  }

  subModAck(project, sub, data) {
    if (!project || !sub || !this.token || !this.endpoint)
      return Promise.resolve({ done: false });

    // quickly construct request url
    let url =
    "https://" +
    this.endpoint +
    "/v1/projects/" +
    project + "/subscriptions/" + sub +
    ":modifyAckDeadline?key=" +
    this.token;

    return this.doSimplePost(url, data)
  }

  subModPushConfig(project, sub, data) {
    if (!project || !sub || !this.token || !this.endpoint)
      return Promise.resolve({ done: false });

    // quickly construct request url
    let url =
    "https://" +
    this.endpoint +
    "/v1/projects/" +
    project + "/subscriptions/" + sub +
    ":modifyPushConfig?key=" +
    this.token;

    return this.doSimplePost(url, data)
  }

  subCreate(project, sub, data) {
    if (!project || !sub || !this.token || !this.endpoint)
      return Promise.resolve({ done: false });
    // quickly construct request url
    let url =
      "https://" +
      this.endpoint +
      "/v1/projects/" +
      project + "/subscriptions/" + sub +
      "?key=" +
      this.token;

    return this.doPut(url, data);
  }

  subModACL(project, sub, data) {
    if (!project || !sub || !this.token || !this.endpoint)
      return Promise.resolve({ done: false });

    // quickly construct request url
    let url =
    "https://" +
    this.endpoint +
    "/v1/projects/" +
    project + "/subscriptions/" + sub +
    ":modifyAcl?key=" +
    this.token;

    return this.doSimplePost(url, data)
  }

  userCreate(username, data) {
    if (!username || !this.token || !this.endpoint)
      return Promise.resolve({ done: false });
    // quickly construct request url
    let url =
      "https://" +
      this.endpoint +
      "/v1/users/" +
      username +
      "?key=" +
      this.token;

    return this.doPost(url, data);
  }

  projectCreate(project, data) {
    if (!project || !this.token || !this.endpoint)
      return Promise.resolve({ done: false });
    // quickly construct request url
    let url =
      "https://" +
      this.endpoint +
      "/v1/projects/" +
      project +
      "?key=" +
      this.token;

    return this.doPost(url, data);
  }

  projectUpdate(project, data) {
    if (!project || !this.token || !this.endpoint)
      return Promise.resolve({ done: false });
    // quickly construct request url
    let url =
      "https://" +
      this.endpoint +
      "/v1/projects/" +
      project +
      "?key=" +
      this.token;

    return this.doPut(url, data);
  }

  userUpdate(username, data) {
    if (!username || !this.token || !this.endpoint)
      return Promise.resolve({ done: false });
    // quickly construct request url
    let url =
      "https://" +
      this.endpoint +
      "/v1/users/" +
      username +
      "?key=" +
      this.token;

    return this.doPut(url, data);
  }

  userDelete(username) {
    if (!username || !this.token || !this.endpoint)
      return Promise.resolve({ done: false });
    // quickly construct request url
    let url =
      "https://" +
      this.endpoint +
      "/v1/users/" +
      username +
      "?key=" +
      this.token;

    return this.doDelete(url);
  }

  projectDelete(project) {
    if (!project || !this.token || !this.endpoint)
      return Promise.resolve({ done: false });
    // quickly construct request url
    let url =
      "https://" +
      this.endpoint +
      "/v1/projects/" +
      project +
      "?key=" +
      this.token;

    return this.doDelete(url);
  }

  topicModACL(project, topic, data) {
    if (!project || !topic || !this.token || !this.endpoint)
      return Promise.resolve({ done: false });

    // quickly construct request url
    let url =
    "https://" +
    this.endpoint +
    "/v1/projects/" +
    project + "/topics/" + topic +
    ":modifyAcl?key=" +
    this.token;

    return this.doSimplePost(url, data)
  }

  subVerifyEndpoint(project, sub) {
    if (!project || !sub  || !this.token || !this.endpoint)
        return Promise.resolve({ done: false });
    
    // quickly construct the request url 
    let url = "https://" + this.endpoint + "/v1/projects/" +
    project + "/subscriptions/" + sub + ":verifyPushEndpoint?key=" + 
    this.token;

    return this.doSimplePost(url, {})
  }

  topicDelete(project, topic) {
    if (!project || !topic || !this.token || !this.endpoint)
      return Promise.resolve({ done: false });
    // quickly construct request url
    let url =
      "https://" +
      this.endpoint +
      "/v1/projects/" +
      project +
      "/topics/" +
      topic +
      "?key=" +
      this.token;

    return this.doDelete(url);
  }

  doGet(url, resourceName) {
    // fetch the data and if succesfull change the component state - which will trigger a re-render
    return fetch(url, { headers: this.headers })
      .then(response => {
        if (response.status === 200) {
          return response.json().then(json => {
            return { data: json, done: true };
          });
        } else {
          let empty = {};
          empty[resourceName] = [];
          return { data: empty, done: false };
        }
      })
      .catch(error => console.log(error));
  }

  doSimplePost(url = "", data = {}){
    return this.doSimpleSend("POST", url, data)
  }

  doPost(url = "", data = {}) {
    return this.doSend("POST", url, data);
  }

  doPut(url = "", data = {}) {
    return this.doSend("PUT", url, data);
  }

  doDelete(url = "") {
    return fetch(url, {
      method: "delete",
      headers: this.headers
    })
      .then(response => {
        if (response.status === 200) {
          return true;
        } else {
          return false;
        }
      })
      .catch(error => console.log(error));
  }

  doSimpleSend(method = "POST", url ="", data = {}){
    return fetch(url, {
      method: method,
      mode: "cors",
      cache: "no-cache",
      credentials: "same-origin",
      headers: this.headers,
      body: JSON.stringify(data)
    })
      .then(r => {
        if (r.ok) {
          return {done: true}
        } else {
          return {done: false};
        }
      })
      .catch(error => console.log(error));
  }
  

  doSend(method = "POST", url = "", data = {}) {
    return fetch(url, {
      method: method,
      mode: "cors",
      cache: "no-cache",
      credentials: "same-origin",
      headers: this.headers,
      body: JSON.stringify(data)
    })
      .then(r => {
        if (r.ok) {
          return r.json().then(json => {
            return { data: json, done: true };
          });
        } else {
          return { data: {}, done: false };
        }
      })
      .catch(error => console.log(error));
  }
}

export default DataManager;
