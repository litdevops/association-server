const express = require("express");
const auth = require("../../middleware/auth");
const { getBody, getRandomInt } = require("../../utils/api");
const getModel = require("../../models/index");
const { getPlaceApi } = require("../../public_api/place");
const Profile = require("../../models/auth/Profile");
const BusinessProfile = require("../../models/business/BusinessProfile");
const User = getModel({ model: "user" });
const Manager = getModel({ model: "manager" });

// Google Auth
const router = express.Router();

const createProfile = async (payload) => {
  try {
    const { body } = payload;
    let found_profile = await Profile.findOne({
      $or: [{ email: body.email }],
    });

    if (!found_profile) {
      let profile_body = (await getBody("create_profile", body)) || {};
      found_profile = new Profile(profile_body);
      await found_profile.save();
    }

    return found_profile;
  } catch (error) {
    console.log(error, "testing_error");
    return null;
  }
};

const createEmployee = async (payload) => {
  let { body, user, place, business_profile } = payload;
  let output = {};
  let place_id = place && place.place_id;

  try {
    let found_profile = await createProfile(payload);

    if (!place_id) {
      let found_business_profile = await BusinessProfile.findOne({
        _id: business_profile,
      });

      place_id = found_business_profile && found_business_profile.place;
    }

    //   check to see if theirs an existing manager
    let found_manager = await Manager.findOne({
      profile: found_profile._id,
      business_profile,
    });
    // console.log(
    //   found_manager,
    //   place_id,
    //   business_profile,
    //   "finding_place_here_is_not"
    // );
    console.log(found_manager, "found_business_profile");

    if (!found_manager) {
      let manager_body = (await getBody("manager", body)) || {};
      let confirmation_code = getRandomInt(100001, 999999);

      manager_body = {
        profile: found_profile._id,
        business_profile,
        host: user,
        place: place_id,
        place_confirmed: true,
        internal_user_id: body.internal_user_id,
        positions: body.positions,
        access_type: body.access_type,
        confirmation_code,
      };
      found_manager = new Manager(manager_body);
    } else {
      let update_body = (await getBody("update_manager", body)) || {};

      Object.entries(update_body).forEach((entry) => {
        found_manager[entry[0]] = entry[1];
      });
    }
    await found_manager.save();

    let public_manager = (await getBody("public_manager", found_manager)) || {};

    output.found_manager = public_manager;
  } catch (error) {
    console.log(error, "  error from  land");
  }

  return output;
};
router.post("/jobs/employee", [auth], async (req, res) => {
  const { current_place, body } = req;

  try {
    const employees = await createEmployee({
      body,
      user: req.user.id,
      business_profile: current_place._id,
      place: current_place.place,
    });

    console.log(employees, "this_is_employees_output");
    let output = await getPlaceApi({ _id: current_place._id });

    res.status(206).json(output);
  } catch (error) {
    console.log(error);
    res.status(error.status || 400).json({ message: error.message });
  }
});

module.exports = router;
