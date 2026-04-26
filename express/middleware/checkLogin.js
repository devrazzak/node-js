const jwt = require("jsonwebtoken");

const checkLogin = (req, res, next) => {
  const { authorization } = req.headers;

  try {
    const token = authorization.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const { username, userid } = decoded;
    ((req.username = username), (req.userid = userid));
    next();
  } catch {
    next("Authentication Failed!  ");
  }
};

module.exports = checkLogin;
