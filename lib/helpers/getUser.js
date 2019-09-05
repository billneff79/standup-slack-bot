
let request = require('request');

let knownUsers = { };

module.exports = function getUserInfo(userID) {
	if (knownUsers[userID]) {
		return Promise.resolve(knownUsers[userID]);
	}

	return new Promise(((resolve, reject) => {
		request.post({
			url: 'https://slack.com/api/users.info',
			form: {
				token: process.env.SLACK_TOKEN,
				user: userID
			}
		}, (err, res, body) => {
			if (err) {
				return reject(err);
			}

			if (typeof body === 'string') {
				body = JSON.parse(body);
			}

			if (body.ok) {
				knownUsers[userID] = body.user;
				resolve(body.user);
			}
			else {
				reject(new Error('User object not okay'));
			}
		});
	}));
};
