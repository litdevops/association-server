const express = require("express");
const auth = require("../../middleware/auth");
const { getBody, getRandomInt } = require("../../utils/api");
const Manager = require("../../models/business/manager");
const Hour = require("../../models/business/Hour");
const Connection = require("../../models/business/Connection");
const File = require("../../models/utils/File");

const { fixRequestBody } = require("http-proxy-middleware");
const { getPlaceApi } = require("../../public_api/place");
const getModel = require("../../models");
const BusinessProfile = require("../../models/business/BusinessProfile");

// Google Auth
const router = express.Router();

router.post("/profile", [auth], async (req, res) => {
  try {
    let body = req.body;
    const gotModel = getModel({ model: "business_profile" });
    if (!gotModel) {
      throw { message: "server error", status: 500 };
    }
    // const findUpdate = await BusinessProfile.findOneAndUpdate({})
    console.log(req.current_place, "testing business profile body");
    let output = {};
    res.status(201).json(output);
  } catch (error) {
    console.log(error, "got error");
    res.status(error.status || 403).json({ message: error.messsage });
  }
});

module.exports = router;
