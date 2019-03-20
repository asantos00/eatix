const { WebClient } = require('@slack/client');
const web = new WebClient(process.env.SLACK_TOKEN);

const CHANNEL = 'GDLEEK01E';

/**
 * @name sendRestaurantsMessage
 * @object restaurants - restaurants to show for the final choice
 */
exports.sendRestaurantsMessage = (restaurants) => {
    return web.chat.postMessage({
        blocks: buildRestaurantPayload(restaurants),
        channel: CHANNEL,
        text: "Here's the selected restaurant§"
    })
}

/**
 * @name sendMessage
 * @object args - wrapper around slack postMessage
 */
exports.sendMessage = (args) => {
    return web.chat.postMessage(args);
}

exports.sendConfirmedBookingMessage = () => {
    return web.chat.postMessage({
        channel: CHANNEL,
        text: '*Congratulations*, restaurant booked! :tada:'
    });
}

const buildRestaurantText = (restaurant) => {
    const name = `*${restaurant.name}*`
    const rating = Array(3).map(() => `::star::`).join('');
    const description = 'The best in town blablablabalab';
    const pricePerPerson = 15

    return [
        name,
        rating,
        description,
        `${pricePerPerson}€`,
    ].join('\n');
}

const buildRestaurantPayload = (restaurants) => {
    return [
        {
            "type": "section",
            "text": {
                "type": "mrkdwn",
                "text": "Time is up :alarm_clock:!\nBelow are the 3 most voted restaurants\n${numberOfVotes} voted"
            }
        },
        {
            "type": "divider"
        },
        ...restaurants.map(({ name, image, rating, restaurant }) => ({
            "type": "section",
            "text": {
                "type": "mrkdwn",
                "text": buildRestaurantText({name, image, rating, ...restaurant}),
            },
            "accessory": {
                "type": "image",
                "image_url": image,
                "alt_text": "alt text for image"
            }

        })),
        {
            "type": "divider"
        },
        {
            "type": "actions",
            "block_id": "vote_restaurant",
            "elements": restaurants.map(({ name, id }) => ({
                "type": "button",
                "text": {
                    "type": "plain_text",
                    "text": name,
                    "emoji": true
                },
                "value": id.toString(),
            }))
        }
    ]
}
