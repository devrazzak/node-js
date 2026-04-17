// dependencies
const http = require("http");
const { handleReqRes } = require("./helpers/handleReqRes");
const env = require("./helpers/environment");
const data = require("./lib/data");

// app object - module scaffolding
const app = {};

// testing file system
// TODO: Remove later
data.delete("test", "newFile", (err) => {
//   console.log(err, "file deleting fail");
console.log("hello")
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
