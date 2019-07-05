// Basic config here.
// Replace endpoint value with target AMS endpoint you want to retrieve data from
var config = {
	endpoint: "localhost",
<<<<<<< HEAD
	available_endpoints: ["localhost:8080", "remote-api.example.com"],
	endpoint_colors: {
		"localhost:8080":"#6E8DC4",
		"remote-api.example.com":"#c46e7a"},
=======
	available_endpoints: ["localhost","remote-api.example.com"],
	endpoint_colors: {
		"remote-api.example.com":"red",
		"localhost":"green"},
>>>>>>> ARGO-1863 User views based on roles
	service: "ams",
	project_colors: {
		"ARGO": "#769B9E",
		"ARGOTEST": "#769B9E"
	}

}

export default config;
