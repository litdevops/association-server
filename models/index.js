// analytics
const action = require("./analytics/Action");
const error_log = require("./analytics/ErrorLog");

// auth
const access = require("./auth/Access");
const phone = require("./auth/Phone");
const profile = require("./auth/Profile");
const user = require("./auth/User");

// benefits
const packages = require("./benefits/Package");
const commitees = require("./benefits/Commitee");
const events = require("./benefits/Event");
const thresholds = require("./benefits/Threshold");

// businesses
const hour = require("./business/Hour");
const manager = require("./business/manager");
const place = require("./business/Place");
const jobs = require("./business/Job");
const connections = require("./business/Connection");

// utils
const file = require("./utils/File");
const temp_file = require("./utils/TempFile");
const business_profile = require("./business/BusinessProfile");

const dict = {
  // logs
  action,
  error_log,
  // auth
  access,
  phone,
  profile,
  user,
  // benefits
  commitees,
  events,
  packages,
  jobs,
  thresholds,
  // businesses
  hour,
  manager,
  place,
  connections,
  business_profile,
  // utils
  file,
  temp_file,
};

const getModel = ({ model }) => {
  const output = dict[model];
  return output;
};

module.exports = getModel;
