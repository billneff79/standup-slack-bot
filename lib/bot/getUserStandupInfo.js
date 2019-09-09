

let log = require('../../getLogger')('get user standup');
let { doBlock, doInterview, getChannelInfoFromMessage, getResponseFunction } = require('../helpers');

let models = require('../../models');

function getUserStandupInfo(rtmBot, bot, message) {
	let content = message.match[2];
	let section;
	let sectionMatch = content ? content.match(/edit\s+(yesterday|today|blockers|goal)/i) : false;

	if (sectionMatch) {
		section = sectionMatch[1].toLowerCase();
		content = '';
	}

	let replyFn = getResponseFunction(rtmBot, bot, message);

	getChannelInfoFromMessage(rtmBot, message)
		.then(({ id, mention })  =>
			models.Channel.findOne({
				where: {
					name: id
				}
			}).then((channel) => {
				if (channel) {
					if (content.length > 0) {
						doBlock(rtmBot, bot, message, content, id, mention);
					}
					else {
						doInterview(rtmBot, id, mention, message.user, section);
					}
				}
				else {
					log.verbose('Channel doesn\'t have a standup scheduled');
					replyFn(message, `${mention} channel doesn\'t have any standups set`);
				}
			})
		)
		.catch(err => {
			let replyFn = getResponseFunction(bot, bot, message);
			replyFn(message, `I don't know what room you want to interview for.  Try \`/${process.env.SLASH_COMMAND} interview\` from the channel you want to interview for`);
		});
}

function attachListener(controller, rtmBot) {
	const understoodMessageRegex = /^(standup )?(?:<#[^|]+\|[^>]+>|#[^\s]+)((.|\n)*)/;
	// TODO: allow multiple ways to separate messages (i.e. \n or ; or |)
	// TODO: update reports when edited
	// TODO: parse standup messages
	controller.hears([understoodMessageRegex],['direct_message', 'direct_mention', 'slash_command'], getUserStandupInfo.bind(null, rtmBot));
	controller.on('message_changed', (bot, m) => {
		m.user = m.message.user;
		m.match = m.message.text.match(understoodMessageRegex);
		if (m.match && m.channel[0] === 'D') {
			getUserStandupInfo(rtmBot, bot, m);
		}
	});
	log.verbose('Attached');
}

module.exports = attachListener;
