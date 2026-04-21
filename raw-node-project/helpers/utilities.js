// Dependencies
const crypto = require("crypto");
const environment = require("./environment");

// module scaffolding
const utilities = {};

// parse json string to object
utilities.parseJSON = (jsonString) => {
  let output;
  try {
    output = JSON.parse(jsonString);
  } catch {
    output = {};
  }

  return output;
};

// hash string
utilities.hash = (string) => {
  if (typeof string === "string" && string.length > 0) {
    const hash = crypto.createHmac("sha256", environment.secretKey).update(string).digest("hex");
    return hash;
  } else {
    return false;
  }
};

// create random string
utilities.CreateRandomString = (strLength) => {
  let length = strLength;
  length = typeof strLength === "number" && strLength > 0 ? strLength : false;
  if (length) {
    let possibleCharacters = "abcdefghijklmnopqrstuvwxyz1234567890";
    let output = "";
    for (let i = 0; i <= length; i++) {
      const randomCharacter = possibleCharacters.charAt(Math.floor(Math.random() * possibleCharacters.length));
      output += randomCharacter;
    }
    return output;
  } else {
    return false;
  }
};

// export module
module.exports = utilities;
