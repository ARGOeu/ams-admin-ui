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

  projectGetSchemas(project) {
    if (!project || !this.token || !this.endpoint)
      return Promise.resolve({ done: false });

    // quickly construct request url
    let url =
      "https://" +
      this.endpoint +
      "/v1/projects/" +
      project +
      "/schemas"
    return this.doGet(url, "schemas");
  }

  projectCreateSchema(project, name, data) {
    if (!project || !this.token || !this.endpoint) {
      return Promise.resolve({ done: false });
    }

    // quickly construct request url
    let url =
      "https://" +
      this.endpoint +
      "/v1/projects/" +
      project +
      "/schemas/" +
      name;

    return this.doPost(url, JSON.parse(data))
  }

  projectEditSchema(project, name, data) {
    if (!project || !this.token || !this.endpoint) {
      return Promise.resolve({ done: false });
    }

    // quickly construct request url
    let url =
      "https://" +
      this.endpoint +
      "/v1/projects/" +
      project +
      "/schemas/" +
      name;

    return this.doPut(url, JSON.parse(data))
  }

  projectDeleteSchema(project, name) {
    if (!project || !this.token || !this.endpoint) {
      return Promise.resolve({ done: false });
    }

    // quickly construct request url
    let url =
      "https://" +
      this.endpoint +
      "/v1/projects/" +
      project +
      "/schemas/" +
      name;

    return this.doDelete(url)
  }

  projectValidateSchema(project, name, data) {
    if (!project || !this.token || !this.endpoint) {
      return Promise.resolve({ done: false });
    }

    // quickly construct request url
    let url =
      "https://" +
      this.endpoint +
      "/v1/projects/" +
      project +
      "/schemas/" +
      name + ":validate";
    return this.doPost(url, JSON.parse(data))
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

  projectMembersGet(project) {
    if (!this.token || !this.endpoint) return Promise.resolve({ done: false });

    // quickly construct request url
    let url =
      "https://" + this.endpoint + "/v1/projects/" + project + "/members?details=true";

    return this.doGet(url, "users");
  }

  projectMemberDetailsGet(project, username) {
    if (!this.token || !this.endpoint) return Promise.resolve({ done: false });

    // quickly construct request url
    let url =
      "https://" + this.endpoint + "/v1/projects/" + project + "/members/" + username;

    return this.doGet(url);
  }

  userGet(userName) {
    if (!this.token || !this.endpoint) return Promise.resolve({ done: false });
    let user = "";
    if (userName) user = "/" + userName;

    // quickly construct request url
    let url =
      "https://" + this.endpoint + "/v1/users" + user;

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

  topicCreate(project, topic, schema) {
    if (!project || !topic || !this.token || !this.endpoint)
      return Promise.resolve({ done: false });
    // quickly construct request url
    let url =
      "https://" +
      this.endpoint +
      "/v1/projects/" +
      project + "/topics/" + topic

    return this.doPut(url, { schema: schema });
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

  topicDetachSchema(project, topicName = "") {
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
      ":detachSchema"
    return this.doPost(url, {});
  }

  topicAttachSchema(project, topicName, schema) {
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
      ":attachSchema"
    return this.doPost(url, { schema: schema });
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

  operationalGetMetrics() {
    if (!this.token || !this.endpoint)
      return Promise.resolve({ done: false });

    // quickly construct request url
    let url =
      "https://" +
      this.endpoint +
      "/v1/metrics"
    return this.doGet(url, "metrics");
  }

  getRegistrations() {
    if (!this.token || !this.endpoint)
      return Promise.resolve({ done: false });

    // quickly construct request url
    let url =
      "https://" +
      this.endpoint +
      "/v1/registrations"
    return this.doGet(url, "registrations");
  }

  acceptRegistration(uuid) {
    if (!this.token || !this.endpoint)
      return Promise.resolve({ done: false });

    // quickly construct request url
    let url =
      "https://" +
      this.endpoint +
      "/v1/registrations/" + uuid + ":accept"
    return this.doPost(url, "");
  }

  declineRegistration(uuid, comment) {
    if (!this.token || !this.endpoint)
      return Promise.resolve({ done: false });

    // quickly construct request url
    let url =
      "https://" +
      this.endpoint +
      "/v1/registrations/" + uuid + ":decline"
    return this.doPost(url, { "comment": comment });
  }

  projectOperationalGetMetrics(start_date, end_date, projects) {
    if (!this.token || !this.endpoint)
      return Promise.resolve({ done: false });

    // quickly construct request url
    let url =
      "https://" +
      this.endpoint +
      "/v1/metrics/va_metrics?";
    if (start_date) {
      let s = "&start_date=" + start_date;
      url += s;
    }
    if (end_date) {
      let s = "&end_date=" + end_date;
      url += s;
    }
    if (projects) {
      let s = projects.map((p, i) => `${p}`).join(',');
      url += "&projects=" + s;
    }
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


  subAck(project, sub, ackId) {
    if (!project || !sub || !this.token || !this.endpoint) {
      return Promise.resolve({ done: false });
    }

    let data = { "ackIds": [ackId] }

    // quickly construct request url
    let url =
      "https://" +
      this.endpoint +
      "/v1/projects/" +
      project + "/subscriptions/" + sub +
      ":acknowledge"

    return this.doPost(url, data)
  }


  subPull(project, sub, max, retImm) {

    if (!project || !sub || !this.token || !this.endpoint) {
      return Promise.resolve({ done: false });
    }

    let data = { "maxMessages": Number(max).toString(), "returnImmediately": Boolean(retImm).toString() }

    // quickly construct request url
    let url =
      "https://" +
      this.endpoint +
      "/v1/projects/" +
      project + "/subscriptions/" + sub +
      ":pull"

    return this.doPost(url, data)

  }

  topicPublish(project, topic, msg) {

    if (!project || !topic || !this.token || !this.endpoint) {
      return Promise.resolve({ done: false });
    }

    let data = { "messages": [msg] }

    // quickly construct request url
    let url =
      "https://" +
      this.endpoint +
      "/v1/projects/" +
      project + "/topics/" + topic +
      ":publish"

    return this.doPost(url, data)

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

  projectMemberUpdate(project, username, data) {
    if (!username || !this.token || !this.endpoint)
      return Promise.resolve({ done: false });
    // quickly construct request url
    let url =
      "https://" +
      this.endpoint +
      "/v1/projects/" +
      project + "/members/" + username;

    return this.doPut(url, data);
  }

  projectMemberCreate(project, username, data) {
    if (!username || !this.token || !this.endpoint)
      return Promise.resolve({ done: false });
    // quickly construct request url
    let url =
      "https://" +
      this.endpoint +
      "/v1/projects/" +
      project + "/members/" + username;

    return this.doPost(url, data);
  }

  projectMemberAdd(project, username, data) {
    if (!username || !this.token || !this.endpoint)
      return Promise.resolve({ done: false });
    // quickly construct request url
    let url =
      "https://" +
      this.endpoint +
      "/v1/projects/" +
      project + "/members/" + username + ":add";

    return this.doPost(url, data);
  }

  projectMemberRemove(project, username) {
    if (!username || !this.token || !this.endpoint)
      return Promise.resolve({ done: false });
    // quickly construct request url
    let url =
      "https://" +
      this.endpoint +
      "/v1/projects/" +
      project + "/members/" + username +
      ":remove";

    return this.doPost(url);
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
    if (!project || !sub || !this.token || !this.endpoint)
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

  doSimplePost(url = "", data = {}) {
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

  doSimpleSend(method = "POST", url = "", data = {}) {
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
          return { done: true }
        } else {
          return { done: false };
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
        return r.json().then(json => {
          return { data: json, done: r.ok };
        });
      })
      .catch(error => console.log(error));
  }
}

export default DataManager;
