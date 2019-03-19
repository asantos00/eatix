const axios = require("axios");
const demo = require("./interactPayload");

const PORT = 3000;

axios.post(
  `http://localhost:${PORT}/slack/interact`,
  demo,
  {
    headers: {
      "content-type": "application/json"
    }
  }
);
