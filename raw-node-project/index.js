// dependencies
const http = require("http");
const { handleReqRes } = require("./helpers/handleReqRes");
const env = require("./helpers/environment");
const data = require("./lib/data");
const { sendTwilioSMS } = require("./helpers/notification");

// app object - module scaffolding
const app = {};

sendTwilioSMS("01723287379", "This is a test message", (err) => {
  console.log(err);
});

// create server
app.createServer = () => {
  const server = http.createServer(app.handleReqRes);
  server.listen(env.port, () => {
    console.log(`listening to port ${env.port}`);
  });
};

// handle Request Response
app.handleReqRes = handleReqRes;

// start the server
app.createServer();
