

const moment = require('moment');
const models = require('../../models');
const { time: timeHelper, getResponseFunction }  = require('../helpers');
const log = require('../../getLogger')('set ooo');

function setUserOOOForDate(user, username, thumb, channel, date) {
	return models.Standup.findOrCreate({
		where: {
			channel,
			date,
			user
		}
	}).then(standupArr => {
		const standup = standupArr[0];
		standup.userRealName = username;
		standup.thumbUrl = thumb;
		standup.today = 'Out of Office';
		return standup.save();
	});
}

function setOOO(rtmBot, bot, message) {
	const oooChannel = message.match[1];

	let replyFn = getResponseFunction(rtmBot, bot, message);

	models.Channel.findOne({
		where: {
			name: oooChannel
		}
	}).then(channel => {
		if (channel) {
			const days = Number(message.match[4]);
			const today = timeHelper.getReportFormat();
			const target = moment(today, 'YYYY-MM-DD');

			rtmBot.api.users.info({ user: message.user }, (err, response) => {
				const userRealName = response.user.real_name || response.user.name;
				const thumbUrl = response.user.profile.image_72;

				const awaiting = [];

				for (let i = 0; i < days; i++) {
					target.add(1, 'd');
					awaiting.push(
						setUserOOOForDate(
							message.user,
							userRealName,
							thumbUrl,
							oooChannel,
							timeHelper.getReportFormat(target)
						)
					);
				}

				Promise.all(awaiting).then(() => {
					if (message.channel !== oooChannel) {
						replyFn(message, `Okay, <@${message.user}>, I've marked you out-of-office for <#${oooChannel}> for the next ${days} days!`);
					}
					else {
						replyFn(message, `Okay, <@${message.user}>, I've marked you out-of-office for the next ${days} days!`);
					}
				});
			});
		}
		else {
			replyFn(message, `There's no standup scheduled for <#${oooChannel}>`);
		}
	});
}

function attachListener(controller, rtmBot) {
	controller.hears(['<#(\\S*?)(\\|\\S*)?> (ooo|out of (the )?office( for)?) (\\d+)'],['direct_message'], (bot, message) => {
		// Normalize the message so that the index-4 element is the OOO duration
		message.match[4] = message.match[6];
		setOOO(rtmBot, bot, message);
	});
	controller.hears(['(ooo()( for)?) (\\d+)', '(out of (the )?office( for)?) (\\d+)'],['direct_mention', 'slash_command'], (bot, message) => {
		// Normalize the message so that the index-1 element is the OOO channel
		message.match[1] = message.channel;
		setOOO(rtmBot, bot, message);
	});
	log.verbose('Attached');
}

module.exports = attachListener;
