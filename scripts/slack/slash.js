const axios = require("axios");
const slash = require("./slashPayload");

const PORT = 3000;

axios.post(
  `http://localhost:${PORT}/api/slack`,
  slash,
  {
    headers: {
      "content-type": "application/json"
    }
  }
);
