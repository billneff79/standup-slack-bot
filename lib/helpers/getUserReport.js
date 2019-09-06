

let timeHelper = require('./time');

module.exports = function getUserReport(standup) {
	let color = '#000000'.replace(/0/g, () => (~~(Math.random()*16)).toString(16));
	let fields = [];
	if (standup.yesterday) {
		fields.push({
			title: 'Yesterday',
			value: standup.yesterday,
			short: false
		});
	}
	if (standup.today) {
		fields.push({
			title: 'Today',
			value: standup.today,
			short: false
		});
	}
	if (standup.blockers) {
		fields.push({
			title: 'Blockers',
			value: standup.blockers,
			short: false
		});
	}
	if (standup.goal) {
		fields.push({
			title: 'Goal',
			value: standup.goal,
			short: false
		});
	}

	return {
		title: timeHelper.getReportFormat(standup.date),
		fields,
		// thumb_url: standup.thumbUrl, //don't show thumbnail for now as it takes up a lot of room in threads
		color
	};
};
