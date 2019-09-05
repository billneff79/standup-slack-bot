

let log = require('../../getLogger')('reply to bad standup');

function reply(replyFn, message, time) {
	log.info('Responding to bad standup creation request');
	log.info('"' + message.text + '"');

	let detail = ' ';
	if (!time) {
		detail += 'I can\'t understand the time format.';
	}

	return replyFn(message,
		':x: Sorry, I couldn\'t understand that message.'+detail
	);
}

module.exports = reply;
