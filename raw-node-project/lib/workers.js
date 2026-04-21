// dependencies
const https = require("https");
const http = require("http");
const { handleReqRes } = require("../helpers/handleReqRes");
const env = require("../helpers/environment");
const data = require("./data");
const { parseJSON } = require("../helpers/utilities");
const url = require("url");
const { check } = require("../routes");
const { sendTwilioSMS } = require("../helpers/notification");

// workers object - module scaffolding
const workers = {};

// validate individual check data
workers.validateCheckData = (checkData) => {
  if (checkData && checkData.id) {
    const timeoutSeconds =
      typeof checkData.timeoutSeconds === "number" ? checkData.timeoutSeconds : checkData.timeOutSeconds;

    checkData.state =
      typeof checkData.state === "string" && ["up", "down"].indexOf(checkData.state) > -1 ? checkData.state : "down";
    checkData.lastChecked =
      typeof checkData.lastChecked === "number" && checkData.lastChecked > 0 ? checkData.lastChecked : false;
    checkData.timeoutSeconds =
      typeof timeoutSeconds === "number" && timeoutSeconds >= 1 && timeoutSeconds <= 5 ? timeoutSeconds : false;

    // pass to the next process only when timeout is valid
    if (checkData.timeoutSeconds) {
      workers.performCheck(checkData);
    } else {
      console.log("Error: check timeoutSeconds was invalid!");
    }
  } else {
    console.log("Error: check was invalid or not properly formatted!");
  }
};

// perform check
workers.performCheck = (checkData) => {
  // prepare the initial check outcome
  let checkOutCome = {
    error: false,
    responseCode: false,
  };
  // mark the outcome has not been sent yet
  let outcomeSent = false;

  // parse the hostname & full url from original data
  const parsedUrl = url.parse(`${checkData.protocol}://${checkData.url}`, true);
  const hostName = parsedUrl.hostname;
  const path = parseJSON.path;

  // construct the request
  const requestDetails = {
    protocol: checkData.protocol + ":",
    hostname: hostName,
    method: checkData.method.toUpperCase(),
    path: path,
    timeout: checkData.timeoutSeconds * 1000,
  };

  const protocolToUse = checkData.protocol === "http" ? http : https;
  let req = protocolToUse.request(requestDetails, (res) => {
    // grab the status of the response
    const status = res.statusCode;

    // update the check outcome and pass to the next process
    checkOutCome.responseCode = status;
    if (!outcomeSent) {
      workers.processCheckOutCome(checkData, checkOutCome);
      outcomeSent = true;
    }
  });
  req.on("error", (e) => {
    checkOutCome = {
      error: true,
      value: e,
    };
    // update the check outcome and pass to the next process
    if (!outcomeSent) {
      workers.processCheckOutCome(checkData, checkOutCome);
      outcomeSent = true;
    }
  });
  req.on("timeout", () => {
    checkOutCome = {
      error: true,
      value: "timeout",
    };
    // update the check outcome and pass to the next process
    if (!outcomeSent) {
      workers.processCheckOutCome(checkData, checkOutCome);
      outcomeSent = true;
    }
  });
  req.end();
};

// save check outcome to database and send to next process
workers.processCheckOutCome = (checkData, checkOutCome) => {
  // check if check outcome is up or down
  let state =
    !checkOutCome.error && checkOutCome.responseCode && checkData.successCodes.indexOf(checkOutCome.responseCode) > -1
      ? "up"
      : "down";

  // decide whether we should alert the user or not
  let alertWanted = !!(checkData.lastChecked && checkData.state !== state);

  // update the check data
  let newCheckData = checkData;
  newCheckData.state = state;
  newCheckData.lastChecked = Date.now();

  // update the check to the db
  data.update("checks", newCheckData.id, newCheckData, (err) => {
    if (!err) {
      if (alertWanted) {
        // send the checkData to next process
        workers.alertUserToStatusChange(newCheckData);
      } else {
        console.log("Alert is not need as there is not state changed!");
      }
    } else {
      console.log("Error: trying to save check data of one of the checks!");
    }
  });
};

// send notification sms to user if sate change
workers.alertUserToStatusChange = (newCheckData) => {
  let msg = `Alert: Your check for  ${newCheckData.method.toUpperCase()} ${newCheckData.protocol}://${newCheckData.url} is currently ${newCheckData.state}`;
  sendTwilioSMS(newCheckData.userPhone, msg, (err) => {
    if (!err) {
      console.log(`User was alerted to a status change via SMS ${msg}`);
    } else {
      console.log("There was a problem sending sms to one of the user");
    }
  });
};

// lookup all the check from database
workers.gatherAllChecks = () => {
  // get all the checks
  data.list("checks", (err, checks) => {
    if (!err && checks && checks.length > 0) {
      checks.forEach((check) => {
        // read the check data
        data.read("checks", check, (err2, cData) => {
          const checkData = { ...parseJSON(cData) };
          if (!err2 && checkData) {
            // pass the data to the check validator
            workers.validateCheckData(checkData);
          } else {
            console.log("Error: Not find the file");
          }
        });
      });
    } else {
      console.log("Error: could not find any checks process!");
    }
  });
};

// timer to execute the workers once per minute
workers.loop = () => {
  setInterval(() => {
    workers.gatherAllChecks();
  }, 5000);
};

// start the workers
workers.init = () => {
  // execute all the checks
  workers.gatherAllChecks();

  // call the loop so that checks continue
  workers.loop();
};

module.exports = workers;
