
let botLib = require('../../lib/bot');
let common = require('./common');

const doIt = (type) => () => {
	botLib.giveHelp(common.botController, common.rtmBot);
	const fn = common.botController.hears;
	const handler = fn.args[0][fn.args[0].length - 1];
	handler(type === 'slash_command' ? fn.__webhookBot : fn.__bot, { type });
};

module.exports = function() {
	//
	this.When('I say "@bot help"', doIt('direct_mention'));
	this.When('I say "/standup help"', doIt('slash_command'));
	this.When('I DM the bot with "help"', doIt('direct_message'));
};
