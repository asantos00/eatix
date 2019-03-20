const { WebClient } = require("@slack/client");
const web = new WebClient(process.env.SLACK_TOKEN);

const CHANNEL = "GDLEEK01E";

/**
 * @name sendRestaurantMessage
 * @object restaurants - restaurants to show for the final choice
 */
exports.sendRestaurantMessage = (restaurant, numberOfVotes) => {
  return web.chat.postMessage({
    channel: CHANNEL,
    blocks: buildRestaurantPayload(restaurant, numberOfVotes),
    text: "Here's the selected restaurant§"
  });
};

/**
 * @name sendMessage
 * @object args - wrapper around slack postMessage
 */
exports.sendMessage = args => {
  return web.chat.postMessage(args);
};

/**
 * @name sendConfirmedBookingMessage
 */
exports.sendConfirmedBookingMessage = () => {
  return web.chat.postMessage({
    channel: CHANNEL,
    text: "*Congratulations*, restaurant booked! :tada:"
  });
};

const buildRestaurantText = ({name, rating, description, pricePerPerson }) => {
  const ratingText = Array(rating)
    .map(() => `::star::`)
    .join("");

  return [`*${name}*`, ratingText, description, `${pricePerPerson}€`].join("\n");
};

const buildRestaurantPayload = (restaurant, numberOfVotes) => {
  return [
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `Time is up :alarm_clock:!\n${numberOfVotes} voted and chose the restaurant listed below`
      }
    },
    {
      type: "divider"
    },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: buildRestaurantText(restaurant)
      },
      accessory: {
        type: "image",
        image_url: restaurant.image,
        alt_text: "alt text for image"
      }
    },
    {
      type: "divider"
    },
    {
      type: "actions",
      block_id: "call",
      elements: [
        {
          type: "button",
          text: {
            type: "plain_text",
            text: "Book a table!",
            emoji: true
          },
          value: numberOfVotes.toString()
        }
      ]
    }
  ];
};
