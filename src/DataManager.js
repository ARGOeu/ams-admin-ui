class DataManager {
  endpoint = "";
  token = "";
  headers = {
    "Content-Type": "application/json",
    Accept: "application/json",
    "x-api-key": ""
  };

  constructor(endpoint, token) {
    this.endpoint = endpoint;
    this.token = token;
    this.headers["x-api-key"] = token;
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
      ":metrics"
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
      project
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
      ":refreshToken"
    return this.doPost(url);
  }

  projectMembersGet(project){
    if (!this.token || !this.endpoint) return Promise.resolve({ done: false });

    // quickly construct request url
    let url =
      "https://" + this.endpoint + "/v1/projects/" + project +  "/members?details=true";
   
    return this.doGet(url, "users");
  }

  userGet(userName) {
    if (!this.token || !this.endpoint) return Promise.resolve({ done: false });
    let user = "";
    if (userName) user = "/" + userName;

    // quickly construct request url
    let url =
      "https://" + this.endpoint + "/v1/users" + user ;
   
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
      topic
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
      ":metrics"
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
      project + "/topics/" + topic

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
      ":acl"
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
      sub
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
      ":metrics"
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
      ":offsets"
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
      ":acl"
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
      sub

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
    ":modifyOffset"

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
    ":modifyAckDeadline"

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
    ":modifyPushConfig"

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
      project + "/subscriptions/" + sub

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
    ":modifyAcl"

    return this.doSimplePost(url, data)
  }


  subAck(project,sub,ackId){
    if (!project || !sub || !this.token || !this.endpoint){
        return Promise.resolve({ done: false });
    }
   
    let data = {"ackIds":[ackId]}
    
    // quickly construct request url
    let url =
    "https://" +
    this.endpoint +
    "/v1/projects/" +
    project + "/subscriptions/" + sub +
    ":acknowledge"
    
    return this.doPost(url,data)
  }


  subPull(project,sub,max,retImm){
    
    if (!project || !sub || !this.token || !this.endpoint){
        return Promise.resolve({ done: false });
    }
   
    let data = {"maxMessages":Number(max).toString(), "returnImmediately": Boolean(retImm).toString()}
    
    // quickly construct request url
    let url =
    "https://" +
    this.endpoint +
    "/v1/projects/" +
    project + "/subscriptions/" + sub +
    ":pull"
    
    return this.doPost(url,data)

  }

  topicPublish(project,topic,msg){
    
    if (!project || !topic || !this.token || !this.endpoint){
        return Promise.resolve({ done: false });
    }

    let data = {"messages":[msg]}

    // quickly construct request url
    let url =
    "https://" +
    this.endpoint +
    "/v1/projects/" +
    project + "/topics/" + topic +
    ":publish"

    return this.doPost(url,data)

  }

  userCreate(username, data) {
    if (!username || !this.token || !this.endpoint)
      return Promise.resolve({ done: false });
    // quickly construct request url
    let url =
      "https://" +
      this.endpoint +
      "/v1/users/" +
      username

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
      project

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
      project

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
      username

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
      username

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
      project

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
    ":modifyAcl"

    return this.doSimplePost(url, data)
  }

  subVerifyEndpoint(project, sub) {
    if (!project || !sub  || !this.token || !this.endpoint)
        return Promise.resolve({ done: false });
    
    // quickly construct the request url 
    let url = "https://" + this.endpoint + "/v1/projects/" +
    project + "/subscriptions/" + sub + ":verifyPushEndpoint";

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
      topic

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
