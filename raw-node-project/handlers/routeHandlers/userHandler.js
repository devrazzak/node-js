const { toASCII } = require("node:punycode");
const data = require("../../lib/data");
const { hash, parseJSON } = require("../../helpers/utilities");
const tokenHandler = require("./tokenHandler");

// module scaffolding
const handler = {};

handler.userHandler = (requestProperties, callback) => {
  const acceptedMethod = ["get", "post", "put", "delete"];
  if (acceptedMethod.indexOf(requestProperties.method) > -1) {
    handler._users[requestProperties.method](requestProperties, callback);
  } else {
    // 405 state code is for 'request not allowed'
    callback(405);
  }
};

handler._users = {};

handler._users.post = (requestProperties, callback) => {
  const firstName =
    typeof requestProperties.body.firstName === "string" && requestProperties.body.firstName.trim().length > 0
      ? requestProperties.body.firstName
      : false;
  const lastName =
    typeof requestProperties.body.lastName === "string" && requestProperties.body.lastName.trim().length > 0
      ? requestProperties.body.lastName
      : false;
  const phone =
    typeof requestProperties.body.phone === "string" && requestProperties.body.phone.trim().length === 11
      ? requestProperties.body.phone
      : false;
  const password =
    typeof requestProperties.body.password === "string" && requestProperties.body.password.trim().length > 0
      ? requestProperties.body.password
      : false;

  const tosAgreement =
    typeof requestProperties.body.tosAgreement === "boolean" ? requestProperties.body.tosAgreement : false;

  console.log(requestProperties.body);

  if (firstName && lastName && phone && password && tosAgreement) {
    // make sure that the user doesn't already exist
    data.read("users", phone, (error) => {
      if (error) {
        let userObject = {
          firstName,
          lastName,
          phone,
          password: hash(password),
          tosAgreement,
        };
        // store the user to db
        data.create("users", phone, userObject, (err) => {
          if (!err) {
            delete userObject.password;
            callback(200, {
              message: "User Created Successfully!",
              data: userObject,
            });
          } else {
            callback(500, { error: "Could not create user!" });
          }
        });
      } else {
        callback(500, {
          error: "This user is already exists!",
        });
      }
    });
  } else {
    callback(400, {
      error: "You have a problem in your request",
    });
  }
};

handler._users.get = (requestProperties, callback) => {
  // check the phone number is valid
  const phone =
    typeof requestProperties.queryStringObject.phone === "string" &&
    requestProperties.queryStringObject.phone.trim().length === 11
      ? requestProperties.queryStringObject.phone
      : false;

  if (phone) {
    // verify the token
    const token =
      typeof requestProperties.headersObject.token === "string" &&
      requestProperties.headersObject.token.trim().length > 0
        ? requestProperties.headersObject.token
        : false;

    tokenHandler._tokens.verify(token, phone, (tokenId) => {
      if (tokenId) {
        // look up the use
        data.read("users", phone, (err, u) => {
          const user = { ...parseJSON(u) };
          if (!err && user) {
            delete user.password;
            callback(200, user);
          } else {
            callback(404, {
              error: "User not found! ",
            });
          }
        });
      } else {
        callback(403, {
          error: "You don't have the permission for this action!",
        });
      }
    });
  } else {
    callback(404, {
      error: "User not found! ",
    });
  }
};

handler._users.put = (requestProperties, callback) => {
  const firstName =
    typeof requestProperties.body.firstName === "string" && requestProperties.body.firstName.trim().length > 0
      ? requestProperties.body.firstName
      : false;
  const lastName =
    typeof requestProperties.body.lastName === "string" && requestProperties.body.lastName.trim().length > 0
      ? requestProperties.body.lastName
      : false;
  const phone =
    typeof requestProperties.body.phone === "string" && requestProperties.body.phone.trim().length === 11
      ? requestProperties.body.phone
      : false;
  const password =
    typeof requestProperties.body.password === "string" && requestProperties.body.password.trim().length > 0
      ? requestProperties.body.password
      : false;

  if (phone) {
    if (firstName || lastName || password) {
      // verify the token
      const token =
        typeof requestProperties.headersObject.token === "string" &&
        requestProperties.headersObject.token.trim().length > 0
          ? requestProperties.headersObject.token
          : false;

      tokenHandler._tokens.verify(token, phone, (tokenId) => {
        if (tokenId) {
          // lookup the user
          data.read("users", phone, (err, uData) => {
            const userData = { ...parseJSON(uData) };

            if (!err && userData) {
              if (firstName) userData.firstName = firstName;
              if (lastName) userData.lastName = lastName;
              if (password) userData.password = hash(password);

              // store to database
              data.update("users", phone, userData, (err2) => {
                if (!err2) {
                  delete userData.password;
                  callback(200, {
                    message: "User was updated successfully!",
                    data: userData,
                  });
                } else {
                  callback(500, {
                    error: "There was a problem in server side!",
                  });
                }
              });
            } else {
              callback(400, {
                error: "You have a problem in your request",
              });
            }
          });
        } else {
          callback(403, {
            error: "You don't have the permission for this action!",
          });
        }
      });
    } else {
      callback(400, {
        error: "Please provide at last one properties",
      });
    }
  } else {
    callback(400, {
      error: "Invalid phone number. Please try again!",
    });
  }
};

handler._users.delete = (requestProperties, callback) => {
  // check the phone number is valid
  const phone =
    typeof requestProperties.queryStringObject.phone === "string" &&
    requestProperties.queryStringObject.phone.trim().length === 11
      ? requestProperties.queryStringObject.phone
      : false;

  if (phone) {
    // verify the token
    const token =
      typeof requestProperties.headersObject.token === "string" &&
      requestProperties.headersObject.token.trim().length > 0
        ? requestProperties.headersObject.token
        : false;

    tokenHandler._tokens.verify(token, phone, (tokenId) => {
      if (tokenId) {
        // lookup the user
        data.read("users", phone, (err, user) => {
          if (!err && user) {
            data.delete("Users", phone, (err2) => {
              if (!err2) {
                callback(200, {
                  message: "User Deleted successfully!",
                });
              } else {
                callback(500, {
                  error: "Internal Server Error!",
                });
              }
            });
          } else {
            callback(400, {
              error: "User not found!",
            });
          }
        });
      } else {
        callback(403, {
          error: "You don't have the permission for this action!",
        });
      }
    });
  } else {
    callback(400, {
      error: "Please provide a valid phone number!",
    });
  }
};

module.exports = handler;
