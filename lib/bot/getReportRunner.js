

let log = require('../../getLogger')('report runner');
let models = require('../../models');
let helpers = require('../helpers');
let fedHolidays = require('@18f/us-federal-holidays');

function runReports(anytimeBot) {
	let time = helpers.time.getScheduleFormat();

	// Don't run if today is a federal holiday
	if (fedHolidays.isAHoliday()) {
		return;
	}

	let where = {
		time
	};
	where[helpers.time.getScheduleDay()] = true;

	models.Channel.findAll({
		where
	}).then((channels) => {
		if (channels.length > 0) {
			log.verbose('Reporting standups for ' + channels.length + ' channel(s)');

			// Iterate over the channels
			channels.forEach( (channel) => {
				helpers.doChannelReport(anytimeBot, channel.name, false);
			});
		}
	});
}

module.exports = function(anytimeBot) {
	return function() {
		runReports(anytimeBot);
	};
};
