import axios from 'axios';

const axiosClient = ({ req }) => {
	if (typeof window == 'undefined') {
		// must be on server as window exists only ion browser
		// must declare domain to be ingrsss-nginx
		return axios.create({
			baseURL:
				'http://ingress-nginx-controller.ingress-nginx.svc.cluster.local',
			headers: req.headers,
		});
	} else {
		//on the browser
		return axios.create({
			baseURL: '/',
		});
	}
};

export default axiosClient;
