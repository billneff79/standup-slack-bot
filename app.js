

require('./env');
let log = require('./getLogger')('app');
let Botkit = require('botkit');
let schedule = require('node-schedule');
let botLib = require('./lib/bot');
let startWebServer = require('./lib/web/start');

// Database setup
let models = require('./models');
models.sequelize.sync(
	// Set to true to reset db on load
	{ force: false }
);

if (!process.env.SLACK_TOKEN) {
	log.error('SLACK_TOKEN not set in environment.');
	process.exit(1);
}

let bkLogger = require('./getLogger')('botkit');
function bkLog(level, ...restArgs) {

	// Remap botkit log levels
	if (level === 'debug') {
		return;
	}
	else if (level === 'info') {
		level = 'verbose';
	}
	else if (level === 'notice') {
		level = 'info';
	}

	let fn, thisObj;
	if (bkLogger[level]) {
		fn = bkLogger[level];
		thisObj = bkLogger;
	}
	else {
		fn = console.log; //eslint-disable-line
		thisObj = console;
		restArgs.unshift('[' + level + ']');
	}

	fn.apply(thisObj, restArgs);
}

let controller = Botkit.slackbot({
	json_file_store: __dirname + '/.data/db',
	clientSigningSecret: process.env.CLIENT_SIGNING_SECRET,
	debug: false,
	logger: { log: bkLog },
	webserver: {
		static_dir: __dirname + '/lib/web/static'
	}
});

// Initialize the bot
controller.spawn({
	token: process.env.SLACK_TOKEN,
	retry: 5
}).startRTM((err, bot) => {
	if (err) {
		log.error(err);
		throw new Error(err);
	}
	else {
		log.info('Connected to RTM');

		bot.identifyBot((err,identity) => {
			// identity contains...
			// {name, id, team_id}
			log.info('Bot name: ' + identity.name);

			//persist the team info so webhooks can be verified later on
			controller.storage.teams.save({
				...bot.team_info,
				bot: identity
			});

			// Set up cron job to check every minute for channels that need a standup report
			schedule.scheduleJob('* * * * 1-5', botLib.getReportRunner(bot));
			schedule.scheduleJob('* * * * 1-5', botLib.getReminderRunner(bot));

			// TODO: method to set standup frequency
			// TODO: add usage messages
			botLib.giveHelp(controller, bot);

			// Set yourself OOO for some time.  Put this above getStandupInfo
			// because getStandupInfo catches anything that starts with "#channel",
			// so catch the more precise
			botLib.setOutOfOffice(controller, bot);

			botLib.getStandupInfo(controller, bot);

			// TODO: remind people to do standup?
			botLib.setReminder(controller, bot);

			// Message for when the bot is added to a channel
			botLib.joinChannel(controller, identity.name);

			// Create a standup in a channel
			botLib.createStandup(controller, bot);

			// Add or change a standup message for today in a DM with the bot
			botLib.getUserStandupInfo(controller, bot);

			// DM a user when they ask to be interviewed or
			// they react to a reminder DM
			botLib.startInterview(controller, bot);
			botLib.startDmEmoji(controller, identity.id);

			// Remove a standup
			botLib.removeStandup(controller, bot);

			// Set a standup audience to a user group
			botLib.setAudience(controller, bot);

			// Configure in-channel updates
			botLib.setInChannelUpdate(controller, bot);

			// Get a weekly user report
			botLib.userReport(controller, bot);

			// show link to most recent standup thread
			botLib.showLatestStandup(controller, bot);

			// Respond to all other direct messages - MAKE SURE THIS IS ALWAYS REGISTERED LAST
			botLib.unhandledDM(controller, bot);

			log.verbose('All bot functions initialized');

			startWebServer(controller, identity.name);
		});

	}
});
