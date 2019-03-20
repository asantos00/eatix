const { WebClient } = require("@slack/client");
const web = new WebClient(process.env.SLACK_TOKEN);

const CHANNEL = "GDLEEK01E";

/**
 * @name sendRestaurantsMessage
 * @object restaurants - restaurants to show for the final choice
 */
exports.sendRestaurantsMessage = (restaurants, numberOfVotes) => {
  return web.chat.postMessage({
    channel: CHANNEL,
    blocks: buildRestaurantPayload(restaurants, numberOfVotes),
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

const buildRestaurantPayload = (restaurants, numberOfVotes) => {
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
    ...restaurants.map((restaurant) => ({
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
    })),
    {
      type: "divider"
    },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: "Book a table at:"
      }
    },
    {
      type: "actions",
      block_id: "call",
      elements: restaurants.map(restaurant => ({
          type: "button",
          text: {
            type: "plain_text",
            text: restaurant.name,
            emoji: true
          },
          value: "call_restaurant"
      }))
    }
  ];
};
