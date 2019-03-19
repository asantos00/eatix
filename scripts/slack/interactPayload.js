module.exports = {
  "payload": JSON.stringify({
    "type": "block_actions",
    "team": {
      "id": "TBHRTR1MJ",
      "domain": "ki-labs-pt"
    },
    "user": {
      "id": "UC4A8E1PZ",
      "username": "a.santos",
      "team_id": "TBHRTR1MJ"
    },
    "api_app_id": "ADZ918WMP",
    "token": "aDfjL9vgj7VdEpftPM29w7gZ",
    "container": {
      "type": "message",
      "message_ts": "1553029027.009200",
      "channel_id": "GDLEEK01E",
      "is_ephemeral": false
    },
    "trigger_id": "582121374946.391877851732.4a064e9d34ac19476cde2c1c683d5573",
    "channel": {
      "id": "GDLEEK01E",
      "name": "privategroup"
    },
    "message": {
      "type": "message",
      "subtype": "bot_message",
      "text": "Hello there",
      "ts": "1553029027.009200",
      "username": "ki-eatix",
      "bot_id": "BH3UASA3W",
    },
    "response_url": "https:\\/\\/hooks.slack.com\\/actions\\/TBHRTR1MJ\\/583555575398\\/Q1LvrzBtm44WaRwBpVjtAU9a",
    "actions": [
      {
        "type": "static_select",
        "action_id": "vote_cuisine",
        "block_id": "Oaw8J",
        "selected_option": {
          "text": {
            "type": "plain_text",
            "text": "Burger",
            "emoji": true
          },
          "value": "168"
        },
        "placeholder": {
          "type": "plain_text",
          "text": "Select an item",
          "emoji": true
        },
        "action_ts": "1553029424.466666"
      }
    ]
  })
}
