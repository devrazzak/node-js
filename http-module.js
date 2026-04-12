const http = require("http");

// const server = http.createServer((req, res) => {
//   res.write("Hello, this is a simple HTTP server created using Node.js!");
//   res.end();
// });

const server = http.createServer((req, res) => {
  if (req.url === "/") {
    res.write("Hello this is a home page");
    res.end();
  } else if (req.url === "/about") {
    res.write("This is about page");
    res.end();
  } else {
    res.write("Not found");
    res.end();
  }
});

server.listen(3000);

console.log("Server is listening on port 3000...");
