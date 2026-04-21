// dependencies
const http = require("http");
const { handleReqRes } = require("../helpers/handleReqRes");
const env = require("../helpers/environment");
const data = require("./data");

// server object - module scaffolding
const server = {};

// create server
server.createServer = () => {
  const createSeverVariable = http.createServer(server.handleReqRes);
  createSeverVariable.listen(env.port, () => {
    console.log(`listening to port ${env.port}`);
  });
};

// handle Request Response
server.handleReqRes = handleReqRes;

// start the server
server.init = () => {
  server.createServer();
};

module.exports = server;
