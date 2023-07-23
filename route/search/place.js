const express = require("express");
const Place = require("../../models/business/Place");
const { sendErrors, getBody } = require("../../utils/api");
const auth = require("../../middleware/auth");
const Profile = require("../../models/auth/Profile");
const Search = require("../../models/business/Search");
const { GetBusinessInfo } = require("../../utils/agent");
const router = express.Router();

router.post("/place/select/:reason", [auth], async (req, res) => {
  const config = {
    unauthorized: [{ msg: "unauthorized user" }],
    body_key: "searched_place",
    return_body: "place_public",
    new_model: { msg: "created" },
    updated_model: { msg: "updated" },
  };
  let ip_address = req.connection.remoteAddress;
  let need_claimed = ["claimed_place"];

  let body = req.body && req.body.places && req.body.places[0];
  if (body) {
    body = JSON.parse(body);
  }

  try {
    let got_body = body;

    let model = await Place.findOne({ place_id: got_body.place_id });
    let new_search = [
      {
        ip_address,
        analytics: [{ created_at: Date.now() }],
      },
    ];
    if (model && req.user && req.user.id) {
      // create a search
      let search_query = {
        place: model._id,
      };
      let found_profile;
      if (req.user && req.current_user) {
        found_profile = await Profile.findOne({
          user: req.user.id,
          current: true,
        });
        search_query.profile = found_profile._id;
      }

      let found_search = await Search.findOne(search_query);

      let occurance = { reason: "search" || req.params.reason };
      if (need_claimed.includes(req.params.reason)) {
        if (model.claimed) {
          config.updated_model = { claimed: true };
        } else {
          config.updated_model = { claimed: true };
        }
      }
      let output;
      if (found_search) {
        // add reasoning
        found_search.occurance.push(occurance);

        await found_search.save();
      } else {
        let searched_payload = {
          ip_address: req.ip_address,
          place: model._id,
          occurance: [occurance],
        };
        if (found_profile) {
          searched_payload.profile = found_profile._id;
        }

        let new_search = new Search(searched_payload);

        await new_search.save();
      }
    } else {
      got_body.searched = new_search;
      // let location = model.geometry.location
      let location = body.geometry.location;

      got_body.point = {
        coordinates: [location.lng, location.lat],
      };

      model = new Place(got_body);
      // create place
      await model.save();
    }
    // let return_body = await getBody("place_public",model);
    let return_body = await GetBusinessInfo(model._doc);

    res.send(return_body);

    return;
  } catch (error) {
    console.log(error, "testing_errors");
    await sendErrors(res, true, config.unauthorized);
    return;
  }
});

module.exports = router;
