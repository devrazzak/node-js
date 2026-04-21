// module scaffolding
const environments = {};

environments.staging = {
  port: 3000,
  envName: "staging",
  secretKey: "asdfasdfasdasdfasd",
  maxChecks: 5,
  twilio: {
    fromPhone: "+17753736585",
    accountSid: process.env.TWILIO_ACCOUNT_SID,
    authToken: process.env.TWILIO_ACCOUNT_AUTH_TOKEN,
  },
};

environments.production = {
  port: 5000,
  envName: "production",
  secretKey: "asdfasdfasdasdfasd",
  maxChecks: 5,
  twilio: {
    fromPhone: "+17753736585",
    accountSid: process.env.TWILIO_ACCOUNT_SID,
    authToken: process.env.TWILIO_ACCOUNT_AUTH_TOKEN,
  },
};

// determine which environment was passed
const currentEnvironment = typeof process.env.NODE_ENV === "string" ? process.env.NODE_ENV : "staging";

// export corresponding environment object
const environmentToExport =
  typeof environments[currentEnvironment] === "object" ? environments[currentEnvironment] : environments.staging;

// export module
module.exports = environmentToExport;
