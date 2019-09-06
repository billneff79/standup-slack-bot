# Administering standups

## Creating or rescheduling a standup

To create a new standup or reschedule one, first ensure that the standup-bot is in the channel that the standup is for.  Then say:

`@{{bot_name}} schedule standup for 10:00 am`

or

`/{{slash_command}} schedule standup for 14:00`

Additionally, you can schedule the standups for just certain days of the week:

`@{{bot_name}} schedule standup for 1300 M W F`

Some things to note:

- The standup bot can only work in public channels
- All times are assumed to be in Eastern time
- The time indicates what time the bot will report
- Days of the week are accepted as:
  - M, Mo, Monday
  - T, Tu, Tuesday
  - W, We, Wednesday
  - Th, Thursday
  - F, Fr, Friday
- You can also say "create" or "move" instead of "schedule"

## Setting a standup reminder

Once a standup is scheduled in a channel, you can have it notify the channel some time before the report to remind folks to submit their standups.  To do that, in the channel, say:

`@{{bot_name}} reminder 10`

or

`/{{slash_command}} reminder 10`

This will schedule a reminder message to be sent to the channel 10 minutes prior to the report.

- The time is always in minutes
- The channel must already have a scheduled standup
- You can also say "remind" instead of "reminder"

## Setting an audience

By default, whenever the bot sends a reminder or posts a report, it begins the message with `@here`.  However, you can have the bot direct its messages to a set of alternate mentions instead.  To do that, from the channel for the standup, say something like:

`@{{bot_name}} audience @user1 @user2 @user3`

or

`/{{slash_command}} audience @user1 @user2 @user3`

To have `@user1 @user2 @user` mentioned in the reminder messages instead of `@here`.  Any mention is valid, including user mentions, `@here` and `@channel`.

## Enabling in-channel updates

When new reports come in after the bot has posted the daily reports, by default the bot doesn't notify anyone - it just updates the report in the thread.  You can have the bot post an update in the channel, though:

`@{{bot_name}} enable updates`

or

`/{{slash_command}} enable updates`

This will cause the bot to post a message in the channel for each new report after its initial post.  To turn it back off, just disable updates:

`@{{bot_name}} disable updates`

or

`/{{slash_command}} disable updates`



slash commands also work:
`/{{slash_command}} enable updates`

## Deleting a standup

To remove a standup and stop reporting on it, in the channel, say:

`@{{bot_name}} remove standup`

or

`/{{slash_command}} remove standup`

- There is no confirmation, so be sure!
- User standups that have already been recorded will not be deleted.  It just stops scheduling new standups.
- You can say "delete" instead of "remove"
