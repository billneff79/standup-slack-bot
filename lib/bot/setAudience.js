

let log = require('../../getLogger')('set audience');
let models = require('../../models');
const { getResponseFunction }  = require('../helpers');

function setUserGroup(rtmBot, bot, message) {
	log.verbose(`Heard a request to set an audience to ${message.match[2]}`);

	let replyFn = getResponseFunction(rtmBot, bot, message);

	// Currently, bots cannot access the usergroups api endpoint, so we can't check
	// See https://api.slack.com/bot-users

	// var userGroups = [];
	// bot.api.usergroups.list({}, function(err, response) {
	//   if (err) {
	//     log.error('API Error: '+err);
	//   } else {
	//     _.each(response.usergroups, function(group) {
	//       userGroups.push(group.handle);
	//     });
	//   }
	// });
	// console.log(userGroups);
	models.Channel.findOne({
		where: {
			name: message.channel
		}
	}).then((channel) => {
		if (channel) {
			models.Channel.update(
				{
					audience: message.match[2]
				},
				{
					where: {
						name: channel.name
					}
				}
			).then(() => {
				replyFn(message, ':thumbsup: Set audience to `' + message.match[2] + '`. If you\'re using a '+
        'user group, make sure that it exists');
			});
		}
		else {
			replyFn(message,
				'There\'s no standup scheduled yet. Create one before setting an audience');
		}
	});
}

function attachListener(controller, rtmBot) {
	controller.hears(['(usergroup|audience)\\s+((?:[^>]+>[\\s;,]*)+)'],['direct_mention', 'slash_command'], setUserGroup.bind(null, rtmBot));
	log.verbose('Attached');
}

module.exports = attachListener;
