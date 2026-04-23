const express = require("express");

const app = express();

app.use(express.json());

const myMiddleware1 = (req, res, next) => {
  console.log("This is middleware 1");
  next();
};

const myMiddleware2 = (req, res, next) => {
  console.log("This is middleware 2");
  next();
};

app.use(myMiddleware1);
app.use(myMiddleware2);

app.get("/", (req, res) => {
  res.send("This is home page!");
});

app.post("/", (req, res) => {
  console.log(req.body.name);
  res.send("This is home page with post request!");
});

app.listen(3000, () => {
  console.log("listening on port 3000...");
  console.log("hello");
});
