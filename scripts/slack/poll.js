const axios = require("axios");
const demo = require("./pollPayload");

const PORT = 3000;

axios.post(
  `http://localhost:${PORT}/api/slack`,
  demo,
  {
    headers: {
      "content-type": "application/json"
    }
  }
);
