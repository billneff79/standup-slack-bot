
let log = require('../../getLogger')('start web server');
let path = require('path');
let buildPage = require('./buildPage');

module.exports = function start(controller, botName) {
	if (process.env.PORT) {
		controller.setupWebserver(process.env.PORT, (err, server) => {
			if (err) {
				log.error(err);
				return;
			}

			controller.createWebhookEndpoints(server);

			let apiRoot = '/api';
			log.info('Registering API endpoints at ' + apiRoot);
			server.delete = server.del;
			let apiEndpoints = require('./api');
			for (let endpoint of apiEndpoints) {
				for (let handler of endpoint.handlers) {
					server[handler.verb.toLowerCase()](path.join(apiRoot, endpoint.path), handler.handler);
					log.verbose(' --> ' + handler.verb.toUpperCase() + '\t' + path.join(apiRoot, endpoint.path));
				}
			}

			function indexView(req, res) {
				res.send(buildPage(botName));
			}

			server.get('/', indexView);
			server.get('/index.htm', indexView);
			server.get('/index.html', indexView);
		});
	}
	else {
		log.warn('Web server not started: PORT env variable not set');
	}
};
