// Basic config here.
// Replace endpoint value with target AMS endpoint you want to retrieve data from
var config = {
	endpoint: "localhost",
	available_endpoints: ["localhost:8080", "remote-api.example.com","msg-devel.argo.grnet.gr"],
	endpoint_colors: {
		"localhost:8080":"#6E8DC4",
		"remote-api.example.com":"#c46e7a",
		"msg-devel.argo.grnet.gr":"#123abc"},
	service: "ams",
	project_colors: {
		"ARGO": "#769B9E",
		"ARGOTEST": "#769B9E"
	}

}

export default config;
