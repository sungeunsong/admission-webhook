const fs = require("fs");
const https = require("https");
const express = require("express");

const app = express();
app.use(express.json());

app.post("/validate", (req, res) => {
  const uid = req.body.request.uid;
  const labels = req.body.request.object?.metadata?.labels || {};
  const allowed = labels.team === "dev";

  const response = {
    response: {
      uid,
      allowed,
    },
  };

  if (!allowed) {
    response.response.status = {
      message: "Missing required label: team=dev",
    };
  }

  res.json(response);
});

const options = {
  key: fs.readFileSync("/certs/tls.key"),
  cert: fs.readFileSync("/certs/tls.crt"),
};

https.createServer(options, app).listen(443, () => {
  console.log("Admission webhook server running on port 443");
});
