

let asyncLib = require('async');
let _ = require('underscore');
let models = require('../../models');
let helpers = require('../helpers');
let log = require('../../getLogger')('user report');

function userReport(bot, message) {
	log.verbose('Got a request for a user report');
	let channel = /<#C\w+>/.test(message.text) ? message.text.match(/<#(C\w+)>/)[1] : message.channel;
	let user = /<@U\w+>/.test(message.text) ? message.text.match(/<@(U\w+)>/)[1] : message.user;
	let days = /\s\d+(\s|$)/.test(message.text) ? message.text.match(/\s(\d+)(\s|$)/)[1] : 7;
	models.Standup.findAll({
		where: {
			channel,
			user,
			date: {
				$gt: new Date(new Date() - days * 24 * 60 * 60 * 1000),
				$lte: new Date()
			}
		}
	}).then((standups) => {
		// Begin a Slack message for this channel
		// https://api.slack.com/docs/attachments
		let report = {
			attachments: [],
			channel
		};
		let attachments = [];
		asyncLib.series([
			// Iterate over this channels standup messages
			function(callback) {
				_.each(standups, (standup) => {
					attachments.push(helpers.getUserReport(standup));
				});
				callback(null);
			},

			function(callback) {
				// Create summary statistics
				let fields = [];

				// Find common channels
				let regex = /<#\w+>/g;
				let search;
				let results = {};
				let commonChannels = '';
				while ((search = regex.exec(JSON.stringify(attachments))) !== null) {
					if (results[search[0]]) {
						results[search[0]] += 1;
					}
					else {
						results[search[0]] = 1;
					}
				}
				for (let i in results) {
					if (results[i] > 1) {
						// common[i] = results[i];
						commonChannels += '- ' + i + ' ('+results[i]+')\n';
					}
				}

				// Find total number of standups
				let length = attachments.length;

				// Assemble stats
				fields.push({
					title: 'Days reported',
					value: length,
					short: true
				});
				if (commonChannels.length >= 1) {
					fields.push({
						title: 'Common projects',
						value: commonChannels,
						short: false
					});
				}

				// Add starter attachment
				attachments.unshift({
					fallback: 'Report for '+user+' in '+channel,
					title: 'Summary',
					fields
				});
				callback(null);
			},

			// Send that report off to Slack
			function(callback) {
				report.attachments = attachments;
				bot.reply(message, report, (err, response) => {
					if (err) {
						log.error(err);
					}
				});
				callback(null);
			}
		]);
	});
}

function attachListener(controller) {
	controller.hears(['^report'],['direct_mention','direct_message'], userReport);
	log.verbose('Attached');
}

module.exports = attachListener;
