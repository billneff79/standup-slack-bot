Feature: Get a report of user's past standups

  Scenario:
    Given the bot is running
    And I am in a public room with the bot
    And I have previous standup reports
    When I say "@bot report <user> <channel>"
    Then the bot should respond "Report"
