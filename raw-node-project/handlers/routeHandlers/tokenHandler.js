const { hash, CreateRandomString, parseJSON } = require("../../helpers/utilities");
const data = require("../../lib/data");

// module scaffolding
const handler = {};

handler.tokenHandler = (requestProperties, callback) => {
  const acceptedMethod = ["get", "post", "put", "delete"];
  if (acceptedMethod.indexOf(requestProperties.method) > -1) {
    handler._tokens[requestProperties.method](requestProperties, callback);
  } else {
    // 405 state code is for 'request not allowed'
    callback(405);
  }
};

handler._tokens = {};

handler._tokens.post = (requestProperties, callback) => {
  const phone =
    typeof requestProperties.body.phone === "string" && requestProperties.body.phone.trim().length === 11
      ? requestProperties.body.phone
      : false;
  const password =
    typeof requestProperties.body.password === "string" && requestProperties.body.password.trim().length > 0
      ? requestProperties.body.password
      : false;

  if (phone && password) {
    data.read("users", phone, (err, user) => {
      const userData = { ...parseJSON(user) };
      if (!err && userData) {
        const hashedPassword = hash(password);
        if (hashedPassword === userData.password) {
          const tokenId = CreateRandomString(50);
          const expires = Date.now() + 60 * 60 * 1000;
          const tokenObject = {
            phone,
            tokenId,
            expires,
          };

          // store the token in db
          data.create("tokens", tokenId, tokenObject, (err2) => {
            if (!err2) {
              callback(200, tokenObject);
            } else {
              callback(500, {
                error: "Internal server Error!",
              });
            }
          });
        } else {
          callback(403, {
            error: "You don't have permission for this action!",
          });
        }
      } else {
        callback(500, {
          error: "Internal server error!",
        });
      }
    });
  } else {
    callback(400, {
      error: "You have a problem in your request!",
    });
  }
};

handler._tokens.get = (requestProperties, callback) => {
  // check the  token id is valid
  const tokenId =
    typeof requestProperties.queryStringObject.tokenId === "string" &&
    requestProperties.queryStringObject.tokenId.trim().length > 0
      ? requestProperties.queryStringObject.tokenId
      : false;

  if (tokenId) {
    // look up the use
    data.read("tokens", tokenId, (err, token) => {
      const tokenData = { ...parseJSON(token) };
      if (!err && tokenData) {
        callback(200, tokenData);
      } else {
        callback(404, {
          error: "Token not found! ",
        });
      }
    });
  } else {
    callback(404, {
      error: "Token not found! ",
    });
  }
};

handler._tokens.put = (requestProperties, callback) => {
  const tokenId =
    typeof requestProperties.body.tokenId === "string" && requestProperties.body.tokenId.trim().length > 0
      ? requestProperties.body.tokenId
      : false;
  const extend =
    typeof requestProperties.body.extend === "boolean" && requestProperties.body.extend === true ? true : false;
  if (tokenId && extend) {
    data.read("tokens", tokenId, (err, token) => {
      const tokenData = { ...parseJSON(token) };
      if (!err && tokenData) {
        if (tokenData.expires > Date.now()) {
          tokenData.expires = Date.now() + 60 * 60 * 1000;
          // store the update token in db
          data.update("tokens", tokenId, tokenData, (err2) => {
            if (!err) {
              callback(200, {
                message: "Token updated successfully !",
                ...tokenData,
              });
            } else {
              callback(500, {
                error: "Internal server error!",
              });
            }
          });
        } else {
          callback(400, {
            error: "Token already expired!",
          });
        }
      } else {
        callback(404, {
          error: "Token not found!",
        });
      }
    });
  } else {
    callback(400, {
      error: "Invalid token id. Please try again!",
    });
  }
};

handler._tokens.delete = (requestProperties, callback) => {
  // check the token id is valid
  const tokenId =
    typeof requestProperties.queryStringObject.tokenId === "string" &&
    requestProperties.queryStringObject.tokenId.trim().length > 0
      ? requestProperties.queryStringObject.tokenId
      : false;

  if (tokenId) {
    // lookup the user
    data.read("tokens", tokenId, (err, user) => {
      if (!err && user) {
        data.delete("tokens", tokenId, (err2) => {
          if (!err2) {
            callback(200, {
              message: "Token Deleted successfully!",
            });
          } else {
            callback(500, {
              error: "Internal Server Error!",
            });
          }
        });
      } else {
        callback(400, {
          error: "Token not found!",
        });
      }
    });
  } else {
    callback(400, {
      error: "Please provide a valid tokenId!",
    });
  }
};

handler._tokens.verify = (tokenId, phone, callback) => {
  data.read("tokens", tokenId, (err, token) => {
    const tokenData = { ...parseJSON(token) };
    if (!err && tokenData) {
      if (tokenData.phone === phone && tokenData.expires > Date.now()) {
        callback(true);
      } else {
        callback(false);
      }
    } else {
      callback(false);
    }
  });
};

// export module
module.exports = handler;
