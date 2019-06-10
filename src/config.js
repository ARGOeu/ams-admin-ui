// Basic config here.
// Replace endpoint value with target AMS endpoint you want to retrieve data from
var config = {
	endpoint: "localhost",
	available_endpoints: ["localhost", "remote-api.example.com"]
	endpoint_colors: {
		"localhost:":"#6E8DC4",
		"remote-api.example.com":"#c46e7a"},
	service: "ams",
	project_colors: {
		"ARGO": "#769B9E",
		"ARGOTEST": "#769B9E"
	}

}

export default config;
