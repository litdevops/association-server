const logger = require("./logger");

(() => {
  console.log = function (message, status = "info") {
    // the available status
    let status_dict = ["error", "warn", "info", "http", "verbose", "debug"];
    // if status is not part of the availability, change it to info
    if (!status_dict.includes(status)) {
      status = "info";
    }
    logger.log(status, message);
  };
})();
