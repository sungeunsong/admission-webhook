const fs = require("fs");
const https = require("https");
const express = require("express");

const app = express();
app.use(express.json());

app.post("/validate", (req, res) => {
  const uid = req.body.request.uid;
  const labels = req.body.request.object?.metadata?.labels || {};
  const allowed = labels.team === "dev";

  const review = {
    apiVersion: "admission.k8s.io/v1",
    kind: "AdmissionReview",
    response: {
      uid: uid,
      allowed: allowed,
    },
  };

  if (!allowed) {
    review.response.status = {
      message: "Missing required label: team=dev",
    };
  }

  res.json(review);
});

const options = {
  key: fs.readFileSync("/certs/tls.key"),
  cert: fs.readFileSync("/certs/tls.crt"),
};

https.createServer(options, app).listen(443, () => {
  console.log("Admission webhook server running on port 443");
});
