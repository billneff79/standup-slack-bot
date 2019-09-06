

let log = require('../../getLogger')('interview recorder');
let models = require('../../models');
let moment = require('moment');
let Queue = require('better-queue');
let timeHelper = require('./time');
let standupHelper = require('./getStandupReport');
let reportHelper = require('./doChannelReport');

const userInterviewQueue = { };

module.exports = function doInterview(bot, interviewChannel, interviewUser, singleSection) {
	if (!userInterviewQueue[interviewUser]) {
		userInterviewQueue[interviewUser] = {
			queue: new Queue(handleQueuedItem),
			current: null
		};
	}

	//ignore if channel is currently running
	if (userInterviewQueue[interviewUser].current === interviewChannel) {
		return bot.say({
			text: `You are already running an interview for <#${interviewChannel}>, so I'm ignoring your duplicate request for the interview for that room.`,
			channel: interviewUser
		});
	}

	let queuedInterview = {
		id: interviewChannel, //use id for merging to work
		bot,
		interviewChannel,
		//Can straight mention normal channels, but private/group chats we need to lookup the name for
		channelMentionPromise: interviewChannel[0] === 'C' ? Promise.resolve(`<#${interviewChannel}>`) :
			 new Promise((resolve, reject) => bot.api.conversations.info({ channel: interviewChannel }, (err, response) => {
				 err ? reject(err) : resolve(`#${response.channel.name}`);
			})),
		//start gathering the user information immediately so it's ready when we need it later
		userInfoPromise: new Promise((resolve,reject) => bot.api.users.info({ user: interviewUser }, (err, response) =>
			err ? reject(err) : resolve({
				userRealName: response.user.real_name || response.user.name,
				thumbUrl: response.user.profile.image_72
			})
		)),
		interviewUser,
		singleSection,
		isQueuedInterview: !!userInterviewQueue[interviewUser].queue.length
	};

	userInterviewQueue[interviewUser].queue.push(queuedInterview);

	if (userInterviewQueue[interviewUser].queue.length > 0) {
		bot.say({
			attachments: [{
				color: '#00BB00',
				fields: [{
					value: `:thumbsup: I see you also want to do a standup for <#${interviewChannel}>, but you're already doing one for <#${userInterviewQueue[interviewUser].current}>.  Once you finish this one up, I'll ask you for your info for <#${interviewChannel}>!`
				}],
				fallback: `We'll get to the <#${interviewChannel}> standup as soon as this one is done!`
			}],
			channel: interviewUser
		});
	}
};

module.exports.flush = function() {
	for (let user of Object.keys(userInterviewQueue)) {
		userInterviewQueue[user].queue.destroy();
		delete userInterviewQueue[user];
	}
};

function handleQueuedItem(dequeuedObject, taskFinished) {
	const { bot, interviewUser, interviewChannel, channelMentionPromise, userInfoPromise, singleSection } = dequeuedObject;
	userInterviewQueue[interviewUser].current = interviewChannel;

	log.verbose('Starting an interview with '+interviewUser+' for channel ' + interviewChannel);

	let todaysDate = timeHelper.getReportFormat();

	models.Channel.findOne({
		where: {
			name: interviewChannel
		}
	}).then((channel) => {
		if (!channel) return;

		//get the last 7 days of standups
		Promise.all([channelMentionPromise, models.Standup.findAll({
			where: {
				user: interviewUser,
				channel: interviewChannel,
				date: {
					$gt: new Date(new Date() - 7 * 24 * 60 * 60 * 1000),
					$lte: new Date()
				}
			},
			order: [[ 'date', 'DESC' ]]
		})])
			.then(([channelMention, standups]) => {
				let existingTodayStandup, pastBlockers = '', existingTodayResponse='', existingYesterdayResponse='', existingBlockersResponse='';
				if (standups.length) {
					if (timeHelper.datesAreSameDay(standups[0].date, new Date())) {
						existingTodayStandup = standups[0];
						existingTodayResponse = standups[0].today ? `\n_Existing Response (type \`skip\` to keep or \`delete\` to remove):_\n> ${standups[0].today}` : '';
						existingYesterdayResponse = standups[0].yesterday ? `\n_Existing Response (type \`skip\` to keep or \`delete\` to remove):_\n> ${standups[0].yesterday}` : '';
						existingBlockersResponse = standups[0].blockers ? `\n_Existing Response (type \`skip\` to keep or \`delete\` to remove):_\n> ${standups[0].blockers}` : '';
					}
					else {
						pastBlockers += ' Recent blockers were:';
						for (let s in standups) {
							if (standups[s].blockers) pastBlockers += `\n> *${standups[s].date}*: ${standups[s].blockers}`;
						}
					}
				}

				bot.startPrivateConversation({ user: interviewUser }, (response, convo) => {
				// TODO: consider allowing multi-line responses
					let interviewSetup = new Promise(((resolve, reject) => {
						if (singleSection) {
						// Need to make sure the user already has a standup recorded for today.
						// If not, prompt them to do it because there's nothing to edit.
							if (existingTodayStandup) {
								convo.say(`:thumbsup: You bet!  Let's update the ${singleSection} portion of your standup for ${channelMention} (Say "exit" to cancel this update)\nYour previous response was:\n>${standups[0][singleSection]}`);
								resolve();
							}
							else {
								convo.ask(`:thinking_face: It seems you haven't recorded a standup for today yet. Would you like to do that now?`, [
									{
										pattern: bot.utterances.yes,
										callback(_, c) {
											c.next();
											resolve();
										}
									},
									{
										default: true,
										callback(_, c) {
											c.say('Okay! Maybe later. :simple_smile:');
											c.next();
											reject();
										}
									}
								]);
							}
						}
						else {
							let intro = `Hey there! Let's`;
							if (dequeuedObject.isQueuedInterview) {
								intro = `Alright, now let's`;
							}
							convo.say(`${intro} record your standup for ${channelMention} (Say \`skip\` to skip any of the questions or \`exit\` to stop):`);
							resolve();
						}
					}));

					// Flag whether the conversation is closed by
					// user action.
					let exited = false;
					function checkForExit(response, conversation) {
						if (response.text.match(/^exit$/i)) {
						// Clear the conversation queue.  We can call
						// conversation.stop(), but that will prevent this say
						// from happening, or we can put conversation.stop()
						// inside a timeout, but that's a timing guessing game
						// about how long to wait - too short and the say
						// won't happen, too long and the next ask will happen.
						// So...  to heck with time guessing, just clear
						// the queue of stuff to come.
							conversation.messages.length = 0;
							conversation.say(`Okay! I won't record anything right now for ${channelMention}. :simple_smile:`);
							conversation.next();
							exited = true;
							return true;
						}
						return false;
					}

					interviewSetup.then(() => {
						const answers = {
							yesterday: null,
							today: null,
							blockers: null,
							goal: null
						};

						const sections = [
							{
								question: `What did you do yesterday?${existingYesterdayResponse}`,
								name: 'yesterday'
							},
							{
								question: `What are you doing today?${existingTodayResponse}`,
								name: 'today'
							},
							{
								question: `What are your blockers?${existingBlockersResponse}${pastBlockers}`,
								name: 'blockers'
							}
						// Don't ask about daily goals for now
						// ,
						// {
						//   question: 'Any major goal for the day?',
						//   name: 'goal'
						// }
						];

						let reminderTimer = null;
						const resetReminderTimer = () => {
							if (reminderTimer) {
								clearTimeout(reminderTimer);
							}
							reminderTimer = setTimeout(() => {
								bot.say({
									attachments: [{
										color: '#FFBB00',
										fields: [{
											value: `:wave: Just a reminder, you haven't yet finished your standup for ${channelMention}. If you'd like to finish it, I'm still waiting on :point_up: the last question!  Otherwise, you can end this one by saying \`exit\`.`
										}],
										fallback: `Just a reminder, you haven't finished your standup for ${channelMention}`
									}],
									channel: interviewUser
								});
							},10 * 60 * 1000); // 10 minutes
						};

						// Add questions and handling for each conversation section.
						for (let section of sections) {
							if (!singleSection || singleSection === section.name) {
								convo.ask(section.question, (response, conversation) => {
									if (!checkForExit(response, conversation)) {
										if (!response.text.match(/^(skip|none|n\/?a)$/ig)) {
											answers[section.name] = response.text;
										}
										else {
											answers[section.name] = null;
										}
										conversation.next();
									}
									resetReminderTimer();
								});
							}
						}
						resetReminderTimer();

						convo.on('end',(convo) => {
							if (reminderTimer) {
								clearTimeout(reminderTimer);
								reminderTimer = null;
							}

							if (!exited && convo.status === 'completed') {
							// botkit provides a cool function to get all responses, but it was easier
							// to just set them during the convo
							// var res = convo.extractResponses();

								let promiseForTodayStandup = existingTodayStandup ? Promise.resolve([existingTodayStandup]) : models.Standup.findOrCreate({
									where: {
										channel: interviewChannel,
										date: todaysDate,
										user: interviewUser
									}
								});

								let userRealName, thumbUrl;

								Promise.all([userInfoPromise, promiseForTodayStandup])
									.then( ([userInfo, [standup]]) => {
										({ userRealName, thumbUrl } = userInfo);
										standup.userRealName = userRealName;
										standup.thumbUrl = thumbUrl;


										for (let section in answers) {
											// If they typed del, delete, remove, rm, clear, or none then delete the section
											if (/^\s*(?:del(?:ete)?|remove|rm|clear|none)\s*(?:answer|response|entry)?\s*$/i.test(answers[section])) {
												standup[section] = null;
											}
											else if (answers[section]) {
												standup[section] = answers[section];
											}
										}

										return standup.save();
									})
									.then((standup) => {
										let now = timeHelper.getDisplayFormat();
										let channelTime = timeHelper.getDisplayFormat(channel.time);
										if (moment(now, 'hh:mm a Z').isBefore(moment(channelTime, 'hh:mm a Z'))) {
											log.verbose('Standup info recorded for ' + userRealName);
											bot.say({
												text: 'Thanks! Your standup for ' + channelMention +
													' is recorded and will be reported at ' +
													timeHelper.getDisplayFormat(channel.time) +
													'.  It will look like:',
												attachments: [ standupHelper(standup) ],
												channel: interviewUser
											});
										}
										else {
											log.verbose('Late report from '+userRealName+'; updating previous report');
											bot.say({
												text: 'Thanks! Your standup for ' + channelMention +
													' is recorded and and the existing report will be updated to look like:',
												attachments: [ standupHelper(standup) ],
												channel: interviewUser
											});
											reportHelper(bot, interviewChannel, true, userRealName);
										}
										userInterviewQueue[interviewUser].current = null;
										taskFinished();
									});
							}
							else {
							// something happened that caused the conversation to stop prematurely
								userInterviewQueue[interviewUser].current = null;
								taskFinished();
							}
						});
					});
				});
			});
	});
}
