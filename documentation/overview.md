{{full_help}}
## Creating a standup

To create a standup, I must be in a channel - you can invite me with
`/invite @{{bot_name}}`.  Then, in that channel, say:

```
@{{bot_name}} create standup <time> [days]
```

The time is required and will be assumed to be in the
{{timezone}} timezone.  Days are optional - if omitted, the standup will
run every weekday.  If provided, days should be separated by spaces.  For
example:

```
@{{bot_name}} create standup 10:30am Monday Wednesday Friday
```

* To create a reminder for a standup, you can just tell me `@{{bot_name}} reminder <minutes before standup>`
* By default, I don't use any @-notices when posting the standup reminder, but you can set an audience that should be notified by saying `@{{bot_name}} audience <target>`. The target can be `@here`, `@channel`, `@<user-group>`, etc.
* To remove an existing standup, message me from the channel where the standup is currently scheduled with `@{{bot_name}} remove standup`

---

## Submitting your standup

If I'm configured to send a reminder, you can just add an emoji
`reaction` to my reminder message (or any of my other messages) and I
will start an interview with you via DM.  You can also DM me just
the channel name to start the interview.

You can also send me your standup in a single message by sending me
a DM like this:

```
#channel-name
y: what you did yesterday
t: what you did today
b: what's in your way (blockers)
```

## All commands

All of the following commands can only be invoked by mentioning the standup bot in a channel.  Unless specified otherwise, they will not work via a direct message to the standup bot.

* `help` or `usage` - Get the usage information for the standup bot.  Works in a direct message or by mentioning the bot in a channel.

### Standup interview/report related
* `interview` OR *Add an emoji reaction to a message from the standup bot in a channel* - Tell the standup bot to start an interview with you for the current channel.  The standup bot will start the interview in a direct messsage.
* *Direct Message* - Submit standup info. See the [`Submitting your standup`](#submitting-your-standup) section above for details
* `report [channel] [user] [days]` - Valid in channel or direct mention.  Show the user-specific standup report for today for the current channel for the current user by default.  If a different channel or user mention is supplied, those will be used instead.   e.g. `report` (today, current channel, current user), `report 2` (today and yesterday, current channel, current user), `report #testroom @userA 3` (past 3 days for in testroom for userA),...
* `ooo (days)` - Specify that the user will be out of the office for the specified number of calendar days (not business days or standup-only days).  e.g. `ooo for 7 days` (out for the next week), `out of the office 5` (our for next 5 calendar days)
* `(where|show|latest)` - Provide a link to the most recent standup thread.  e.g. `where is the most recent standup?`, `show the latest standup`, or simply `latest`.


### Scheduling Related
* `(schedule|create|move) standup (time) [day1] [day2]` - Create or move the standup for the current channel for a specific time for specific days.  If days are not specified, Monday-Friday are assumed.  e.g. `create standup 10:00am` (create standup for 10:00am M-F), `schedule standup 13:00 M Th F` (1:00 PM Monday, Thursday, and Friday), `move standup 9:00 Wednesday` (9:00am Wednesday)
*  `remind[er] XX` - Have the standup bot message the current channel `XX` minutes before the standup will be reported to remind people that they need to submit a standup report.  No mentions are used in the reminder message unless specified in the `audience` command.  e.g. `remind 5`, `reminder 30`.
* `audience @who [@who2] [@who3]` - Set the mentions that will be included in a reminder message (if scheduled) so that they will get notified to submit their standup report. e.g. `audience @here`, `audience @channel`, `audience @user1 @user2 @user3 @user4`
* `(enable|disable) updates` - If enabled, when a user edits their standup report that has already been submitted for a day, the standup bot will notify the channel saying that the user updated their report.  If disabled (default) the standup bot will only update the report message that was submitted to the channel.  e.g. `enable updates` or `disable updates`
* `when` - Responds with scheduling information about the current standup
* `(remove|delete) standup` - Remove/delete the standup from the current channel, e.g. `remove standup` or `delete standup`




