// dependencies
const http = require("http");
const { handleReqRes } = require("./helpers/handleReqRes");
const env = require("./helpers/environment");
const data = require("./lib/data");
const server = require("./lib/server");
const workers = require("./lib/workers");

// app object - module scaffolding
const app = {};

app.init = () => {
  // start the server
  server.init();

  // start the workers
  workers.init();
};

app.init();

// export module
module.exports = app;
