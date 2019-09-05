
const fs = require('fs');
const mustache = require('mustache');
const timezone = process.env.TIMEZONE || 'America/New_York';

const overviewDoc = fs.readFileSync('./documentation/overview.md', { encoding: 'utf-8' });

function attachListener(controller, botName, rtmBot) {
	controller.hears(['^(help|usage)'],['direct_mention','direct_message', 'slash_command'], (bot, message) => {
		let isSlash = message.type === 'slash_command';
		//if a slash command, ack immediately
		isSlash && bot.replyAcknowledge();
		let replyFn =  isSlash ? bot.replyPrivateDelayed : rtmBot.reply;

		let fullHelp = '';
		if (process.env.URL) {
			fullHelp = `Here's some helpful tips.  You can also check out my [full standup-bot documentation](${process.env.URL}).\n\n`;
		}
		const helpFile = mustache.render(overviewDoc, { bot_name: botName, timezone, full_help: fullHelp });
		isSlash ? bot.replyPrivateDelayed(message, helpFile) : rtmBot.whisper(message, helpFile);

		rtmBot.api.files.upload({
		  title: 'standup-bot help',
		  filename: 'standup-bot-help.md',
		  filetype: 'post',
		  content: helpFile,
		  channels: message.channel
		}, (err) => {
		  if (err) {
		    replyFn(message, helpFile);
		  }
		});
	});
}

module.exports = attachListener;
