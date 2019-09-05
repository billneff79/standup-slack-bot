

let models = require('../../models');
const { getResponseFunction }  = require('../helpers');
const getHistoricalReport = require('../helpers/reports/forChannelHistorical');
let log = require('../../getLogger')('manual report');

function manualReport(rtmBot, bot, message) {
	log.verbose('Got a request');
	let replyFn = getResponseFunction(rtmBot, bot, message);

	let channel = /<#C\w+>/.test(message.text) ? message.text.match(/<#(C\w+)>/)[1] : message.channel;

	let user = /<@U\w+>/.test(message.text) && message.text.match(/<@(U\w+)>/)[1];

	let days = /\s\d+(\s+|$)/.test(message.text) ? message.text.match(/\s(\d+)(\s|$)/)[1] : 1;

	models.Standup.findAll({
		where: {
			channel,
			...user && { user },
			date: {
				$gt: new Date(new Date() - days * 24 * 60 * 60 * 1000),
				$lte: new Date()
			}
		},
		order: [[ 'date', 'DESC' ]]
	}).then((standups) => {
		// Begin a Slack message for this channel
		// https://api.slack.com/docs/attachments
		let report = {
			channel
		};
		let { attachments, numDays } = getHistoricalReport(standups);

		// Add starter attachment
		attachments.unshift({
			fallback: 'Report for '+channel,
			title: 'Summary',
			fields: [
				{
					title: 'Days reported',
					value: numDays,
					short: true
				}
			]
		});

		// Send that report off to Slack
		report.attachments = attachments;
		replyFn(message, report, (err) => {
			if (err) {
				log.error(err);
			}
		});
	});
}

function attachListener(controller, rtmBot) {
	controller.hears(['^report'],['direct_mention','direct_message', 'slash_command'], manualReport.bind(null, rtmBot));
	log.verbose('Attached');
}

module.exports = attachListener;
