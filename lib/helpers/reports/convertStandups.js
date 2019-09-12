

const standupReport = require('../getStandupReport');

module.exports = function createAttachments(standups) {
	let attachments = [];

	standups.forEach((standup) => {
		attachments.push(standupReport(standup));
	});

	return attachments;
};

