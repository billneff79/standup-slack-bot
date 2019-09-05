

const convertStandups = require('./convertStandups');
const generateFields  = require('./generateFields');

module.exports = function(standups) {
	let attachments = [];
	let currentStandups = [], currentDay = standups[0].date, numDays = 1;
	standups.forEach(standup => {
		if (currentDay === standup.date) {
			currentStandups.push(standup);
		}
		else {
			//process all attachments for the date
			processDay(currentStandups, currentDay, attachments);
			//switch to a new date
			currentStandups = [standup];
			currentDay = standup.date;
			numDays++;
		}
	});
	//process the last day
	processDay(currentStandups, currentDay, attachments);

	return {
		attachments,
		numDays

	};
};

function processDay(currentStandups, currentDay, attachments) {
	let attachmentsForDate = convertStandups(currentStandups);
	let pretext = `*${currentDay}*`;
	attachments.push({
		fallback: pretext,
		pretext,
		fields: generateFields(attachmentsForDate)
	});
	attachments.push(...attachmentsForDate);
}

