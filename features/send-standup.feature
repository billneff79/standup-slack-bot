Feature: Send standup to the bot

  Scenario Outline: I try to send a standup
    Given the bot is running
    And the <channel_type> channel <status> have a standup
    When I DM the bot with standup #<channel_type>
      """
      Y: yesterday
      T: today
      B: blockers
      G: goal

      """
    Then the bot should respond "<response>"

    Examples:
      | channel_type 	| status   | response |
      | public     		| does     | Thanks   |
      | public     		| does not | channel doesn't have any standups set |
      | private    		| does     | I don't know what room you want to interview for |
      | private    		| does not | I don't know what room you want to interview for |

  Scenario: I edit a standup message
    Given the bot is running
    And the public channel does have a standup
    When I edit a DM to the bot to say standup #public
      """
      Y: yesterday-edited
      """
    Then the bot should respond "Thanks"
