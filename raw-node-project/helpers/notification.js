// Dependencies
const https = require("https");
const { twilio } = require("../helpers/environment");
const querystring = require("querystring");

// module scaffolding
const notifications = {};

// send sms to user using Twilio API
notifications.sendTwilioSMS = (phone, msg, callback) => {
  const userPhone = typeof phone === "string" && phone.trim().length >= 11 ? phone.trim() : false;
  const userMsg = typeof msg === "string" && msg.trim().length > 0 ? msg.trim() : false;
  if (userPhone && userMsg) {
    // configure the request payload
    const payload = {
      From: twilio.fromPhone,
      To: `+88${userPhone}`,
      Body: userMsg,
    };

    // stringify the payload
    const stringifyPayload = querystring.stringify(payload);

    // configure the request details
    const requestDetails = {
      hostname: "api.twilio.com",
      method: "POST",
      path: `/2010-04-01/Accounts/${twilio.accountSid}/Messages.json`,
      auth: `${twilio.accountSid}:${twilio.authToken}`,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Content-Length": Buffer.byteLength(stringifyPayload),
      },
    };

    // instantiate the request object
    const req = https.request(requestDetails, (res) => {
      // get the status of the send request
      const status = res.statusCode;
      let responseString = "";

      res.on("data", (chunk) => {
        responseString += chunk;
      });

      res.on("end", () => {
        // callback successfully if the request went through
        if (status === 200 || status === 201) {
          callback(false);
        } else {
          callback(`Status code returned was ${status}. Response: ${responseString}`);
        }
      });
    });

    req.on("error", (err) => {
      callback(err);
    });
    req.write(stringifyPayload);
    req.end();
  } else {
    callback("Given parameter were invalid");
  }
};

// export module
module.exports = notifications;
