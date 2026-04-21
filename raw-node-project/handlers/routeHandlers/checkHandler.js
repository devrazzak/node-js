// dependencies
const { parseJSON, CreateRandomString } = require("../../helpers/utilities");
const data = require("../../lib/data");
const tokenHandler = require("./tokenHandler");
const { maxChecks } = require("../../helpers/environment");

// module scaffolding
const handler = {};

handler.checkHandler = (requestProperties, callback) => {
  const acceptedMethod = ["get", "post", "put", "delete"];
  if (acceptedMethod.indexOf(requestProperties.method) > -1) {
    handler._checks[requestProperties.method](requestProperties, callback);
  } else {
    // 405 state code is for 'request not allowed'
    callback(405);
  }
};

handler._checks = {};

handler._checks.post = (requestProperties, callback) => {
  // validate inputs
  const protocol =
    typeof requestProperties.body.protocol === "string" &&
    ["http", "https"].indexOf(requestProperties.body.protocol) > -1
      ? requestProperties.body.protocol
      : false;

  const url =
    typeof requestProperties.body.url === "string" && requestProperties.body.url.trim().length > 0
      ? requestProperties.body.url
      : false;

  const method =
    typeof requestProperties.body.method === "string" &&
    ["GET", "POST", "PUT", "DELETE"].indexOf(requestProperties.body.method) > -1
      ? requestProperties.body.method
      : false;

  const successCodes =
    typeof requestProperties.body.successCodes === "object" && requestProperties.body.successCodes instanceof Array
      ? requestProperties.body.successCodes
      : false;

  const timeOutSeconds =
    typeof requestProperties.body.timeOutSeconds === "number" &&
    requestProperties.body.timeOutSeconds % 1 === 0 &&
    requestProperties.body.timeOutSeconds >= 1 &&
    requestProperties.body.timeOutSeconds <= 5
      ? requestProperties.body.timeOutSeconds
      : false;

  if (protocol && url && method && successCodes && timeOutSeconds) {
    // verify the token
    const token =
      typeof requestProperties.headersObject.token === "string" &&
      requestProperties.headersObject.token.trim().length > 0
        ? requestProperties.headersObject.token
        : false;
    // lookup the user phone by reading the token
    data.read("tokens", token, (err, tData) => {
      if (!err && tData) {
        const userPhone = parseJSON(tData).phone;
        // lookup the user data
        data.read("users", userPhone, (err2, uData) => {
          if (!err2 && uData) {
            tokenHandler._tokens.verify(token, userPhone, (tokenIsValid) => {
              if (tokenIsValid) {
                const userObject = { ...parseJSON(uData) };
                const userChecks =
                  typeof userObject.checks === "object" && userObject.checks instanceof Array ? userObject.checks : [];

                if (userChecks.length < maxChecks) {
                  const checkId = CreateRandomString(20);
                  const checkObject = {
                    id: checkId,
                    userPhone,
                    protocol,
                    url,
                    method,
                    successCodes,
                    timeOutSeconds,
                  };
                  // save the object in db
                  data.create("checks", checkId, checkObject, (err3) => {
                    if (!err3) {
                      // add check id to the user's object
                      userObject.checks = userChecks;
                      userObject.checks.push(checkId);

                      // save the new user in db
                      data.update("users", userPhone, userObject, (err4) => {
                        if (!err4) {
                          callback(200, {
                            message: "Check added successfully!",
                            data: checkObject,
                          });
                        } else {
                          callback(500, {
                            error: "Internal server error!",
                          });
                        }
                      });
                    } else {
                      callback(500, {
                        error: "Internal sever error!",
                      });
                    }
                  });
                } else {
                  callback(401, {
                    error: "User has already reached max check limit!",
                  });
                }
              } else {
                callback(403, {
                  error: "You don't have permission for this action!",
                });
              }
            });
          } else {
            callback(404, {
              error: "User not found!",
            });
          }
        });
      } else {
        callback(403, {
          error: "Your don't haver permission for this action!",
        });
      }
    });
  } else {
    callback(400, {
      error: "Invalid request payload!",
    });
  }
};

handler._checks.get = (requestProperties, callback) => {
  // check the phone number is valid
  const checkId =
    typeof requestProperties.queryStringObject.checkId === "string" &&
    requestProperties.queryStringObject.checkId.trim().length > 0
      ? requestProperties.queryStringObject.checkId
      : false;

  if (checkId) {
    // verify the token
    const token =
      typeof requestProperties.headersObject.token === "string" &&
      requestProperties.headersObject.token.trim().length > 0
        ? requestProperties.headersObject.token
        : false;

    // lookup the user phone by reading the token
    data.read("tokens", token, (err, tData) => {
      if (!err && tData) {
        const userPhone = parseJSON(tData).phone;
        tokenHandler._tokens.verify(token, userPhone, (tokenIsValid) => {
          if (tokenIsValid) {
            // look up the checks
            data.read("checks", checkId, (err, cData) => {
              const checkData = { ...parseJSON(cData) };
              if (!err && checkData) {
                callback(200, {
                  data: checkData,
                });
              } else {
                callback(404, {
                  error: "check not found! ",
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
        callback(403, {
          error: "Your don't haver permission for this action!",
        });
      }
    });
  } else {
    callback(404, {
      error: "User not found! ",
    });
  }
};

handler._checks.put = (requestProperties, callback) => {
  // validate inputs
  const protocol =
    typeof requestProperties.body.protocol === "string" &&
    ["http", "https"].indexOf(requestProperties.body.protocol) > -1
      ? requestProperties.body.protocol
      : false;

  const url =
    typeof requestProperties.body.url === "string" && requestProperties.body.url.trim().length > 0
      ? requestProperties.body.url
      : false;

  const method =
    typeof requestProperties.body.method === "string" &&
    ["GET", "POST", "PUT", "DELETE"].indexOf(requestProperties.body.method) > -1
      ? requestProperties.body.method
      : false;

  const successCodes =
    typeof requestProperties.body.successCodes === "object" && requestProperties.body.successCodes instanceof Array
      ? requestProperties.body.successCodes
      : false;

  const timeOutSeconds =
    typeof requestProperties.body.timeOutSeconds === "number" &&
    requestProperties.body.timeOutSeconds % 1 === 0 &&
    requestProperties.body.timeOutSeconds >= 1 &&
    requestProperties.body.timeOutSeconds <= 5
      ? requestProperties.body.timeOutSeconds
      : false;
  const id = typeof requestProperties.body.id === "string" ? requestProperties.body.id : false;
  if (id) {
    if (protocol || url || method || successCodes || timeOutSeconds) {
      // verify the token
      const token =
        typeof requestProperties.headersObject.token === "string" &&
        requestProperties.headersObject.token.trim().length > 0
          ? requestProperties.headersObject.token
          : false;

      // lookup the user phone by reading the token
      data.read("tokens", token, (err, tData) => {
        if (!err && tData) {
          const userPhone = parseJSON(tData).phone;
          tokenHandler._tokens.verify(token, userPhone, (tokenIsValid) => {
            if (tokenIsValid) {
              data.read("checks", id, (err, cData) => {
                const checkData = { ...parseJSON(cData) };

                if (!err && checkData) {
                  if (protocol) checkData.protocol = protocol;
                  if (url) checkData.url = url;
                  if (method) checkData.method = method;
                  if (successCodes) checkData.successCodes = successCodes;
                  if (timeOutSeconds) checkData.timeOutSeconds = timeOutSeconds;

                  // store to database
                  data.update("checks", id, checkData, (err2) => {
                    if (!err2) {
                      callback(200, {
                        message: "Check was updated successfully!",
                        data: checkData,
                      });
                    } else {
                      callback(500, {
                        error: "Internal server error!",
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
          callback(403, {
            error: "Your don't haver permission for this action!",
          });
        }
      });
    }
  } else {
    callback(400, {
      error: "Invalid request payload!",
    });
  }
};

handler._checks.delete = (requestProperties, callback) => {
  // check the phone number is valid
  const id =
    typeof requestProperties.queryStringObject.id === "string" &&
    requestProperties.queryStringObject.id.trim().length > 0
      ? requestProperties.queryStringObject.id
      : false;

  if (id) {
    // verify the token
    const token =
      typeof requestProperties.headersObject.token === "string" &&
      requestProperties.headersObject.token.trim().length > 0
        ? requestProperties.headersObject.token
        : false;

    // lookup the user phone by reading the token
    data.read("tokens", token, (err, tData) => {
      if (!err && tData) {
        const userPhone = parseJSON(tData).phone;
        tokenHandler._tokens.verify(token, userPhone, (tokenIsValid) => {
          if (tokenIsValid) {
            // look up the checks
            data.read("checks", id, (err2, checkData) => {
              if (!err2 && checkData) {
                data.delete("checks", id, (err3) => {
                  if (!err2) {
                    data.read("users", userPhone, (err3, uData) => {
                      const userData = { ...parseJSON(uData) };
                      if (!err3 && userData) {
                        const userChecks =
                          typeof userData.checks === "object" && userData.checks instanceof Array
                            ? userData.checks
                            : [];
                        // remove the deleted check id from user's list of checks
                        const checkPosition = userChecks.indexOf(id);
                        if (checkPosition > -1) {
                          userChecks.splice(checkPosition, 1);
                          userData.checks = userChecks;

                          // update the user data
                          data.update("users", userPhone, userData, (err4) => {
                            if (!err4) {
                              callback(200, {
                                message: "Check deleted successfully!",
                              });
                            } else {
                              callback(500, {
                                error: "Internal server error!",
                              });
                            }
                          });
                        } else {
                          callback(500, {
                            error: "Internal sever error!",
                          });
                        }
                      } else {
                        callback(500, {
                          error: "Internal server error!",
                        });
                      }
                    });
                  } else {
                    callback(500, {
                      error: "Internal server error!",
                    });
                  }
                });
              } else {
                callback(404, {
                  error: "check not found! ",
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
        callback(403, {
          error: "Your don't haver permission for this action!",
        });
      }
    });
  } else {
    callback(404, {
      error: "Check not found! ",
    });
  }
};

module.exports = handler;
