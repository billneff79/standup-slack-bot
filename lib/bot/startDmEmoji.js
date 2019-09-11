

let log = require('../../getLogger')('emoji response');
let models = require('../../models');
let helpers = require('../helpers');

function startDmEmoji(bot, message) {
	models.Channel.findOne({ where: { name: message.item.channel } })
		.then((channel) => {
			if (channel) {
				log.verbose(`Got an emoji reaction: ${message.reaction} from ${message.user}`);
				helpers.getChannelInfoFromMessage(bot, message)
					.then(({ id, mention })  => {
						helpers.doInterview(bot, id, mention, message.user);
					})
					.catch(err => {
						let replyFn = helpers.getResponseFunction(bot, bot, message, false, true, true);
						replyFn(message, `I don't know what room you want to interview for.  Try \`/${process.env.SLASH_COMMAND} interview\` from the channel you want to interview for`);
					});
			}
		});
}

function attachListener(controller, botId) {
	controller.on('reaction_added', (bot, message) => {
		if (message.item_user === botId && message.user !== botId) {
			startDmEmoji(bot, message);
		}
	});
}

module.exports = attachListener;
