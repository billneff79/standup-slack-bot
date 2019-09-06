

let log = require('../../getLogger')('reply to bad standup');

function reply(replyFn, message, time) {
	log.warn(`Responding to bad standup creation request "${message.text}"`);

	let detail = ' ';
	if (!time) {
		detail += 'I can\'t understand the time format.';
	}

	return replyFn(message,
		':x: Sorry, I couldn\'t understand that message.'+detail
	);
}

module.exports = reply;
