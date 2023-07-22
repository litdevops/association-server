const express = require("express");
const auth = require("../../middleware/auth");
const { getBody, getRandomInt } = require("../../utils/api");
const Manager = require("../../models/business/manager");
const Hour = require("../../models/business/Hour");
const Connection = require("../../models/business/Connection");
const File = require("../../models/utils/File");
const {
  smsTransporter,
  emailTransporter,
} = require("../../middleware/message");
const { fixRequestBody } = require("http-proxy-middleware");
const { getPlaceApi } = require("../../public_api/place");
const BusinessProfile = require("../../models/business/BusinessProfile");
const Profile = require("../../models/auth/Profile");
const mongoose = require("mongoose");
const Contact = require("../../models/auth/Contact");
const ObjectId = mongoose.Types.ObjectId;
const createProfile = require("../../utils/profile");
// Google Auth
const router = express.Router();

router.get("/place/isonboard", [auth], async (req, res) => {
  try {
    let published = req.current_place && req.current_place.published;
    let publish_later = req.current_place && req.current_place.publish_later;

    let output = !publish_later && !published;

    res.status(201).json(output);
  } catch (error) {
    res.status(error.status || 403).json({ message: error.messsage });
  }
});

router.get("/place/my_api", [auth], async (req, res) => {
  try {
    const user_id = req.user && req.user.id;
    const place_id = req.current_place && req.current_place._id;

    let found_manager = await Manager.findOne({
      user: user_id,
      access_type: { $in: ["own", "manage"] },
      business_profile: place_id,
    });

    let output = {};
    if (found_manager) {
      output = await getPlaceApi({ _id: found_manager.business_profile });
    }
    res.status(201).json(output);
  } catch (error) {
    res.status(error.status || 403).json({ message: error.messsage });
  }
});

router.post("/place/publish_place", [auth], async (req, res) => {
  try {
    const { published, publish_later } = req.body;

    let found_place = await Place.findOne({ _id: req.current_place._id });
    found_place.published = published;
    found_place.publish_later = publish_later;
    await found_place.save();
    let output = await getPlaceApi({ _id: found_place._id });

    res.status(201).json(output);
  } catch (error) {
    console.log(error, "testing error");
    res.status(error.status || 403).json({ message: error.messsage });
  }
});

router.post("/place/business_members", [auth], async (req, res) => {
  try {
    const { body, current_profile, user, current_place } = req;

    if (!body || !body.place) {
      throw { message: "Your must add a business member" };
    }

    const profile_body = {
      email: body.contact_email,
      name: body.contact_name,
      phone: body.contact_phone_number,
      current: true,
    };

    const contact_profile = await createProfile(profile_body);

    let found_contact;

    if (profile_contact.user) {
      found_contact = await Contact.findOne({
        $and: [
          {
            $or: [
              {
                $and: [
                  { "receiver.profile": current_profile._id },
                  { "sender.profile": contact_profile._id },
                ],
              },
              {
                $and: [
                  { "sender.profile": current_profile._id },
                  { "receiver.profile": contact_profile._id },
                ],
              },
            ],
          },
          {
            $or: [
              { place: current_place.place },
              { business_profile: current_place._id },
            ],
          },
        ],
      });

      if (!found_contact) {
        const contact_body = {
          sender: {
            profile: current_profile._id,
            seen: new Date.now(),
          },
          receiver: {
            profile: contact_profile._id,
          },
          place: current_place.place,
          business_profile: current_place._id,
        };
        found_contact = new Contact(contact_body);
        await found_contact.save();
      }
    }

    // associate place with users
    // check if connection exists
    let connections = await body.place.map(async (receiver) => {
      let connection = await Connection.findOne({
        $or: [
          {
            "receiver.business_profile": receiver,
            "sender.business_profile": current_place._id,
          },
          {
            "sender.business_profile": receiver,
            "receiver.business_profile": current_place._id,
          },
        ],
      });

      if (!connection) {
        let connection_body = {
          user: user.id,
          profile: current_profile._id,
          contact: found_contact._id,
          sender: {
            business_profile: current_place._id,
            place: current_place.place,
            status: "accepted",
          },
          receiver: {
            place: receiver,
          },
        };

        connection = new Connection(connection_body);
        await connection.save();
      } else {
        let dont_reconnect = ["denied", "blocked"];
        let nogo = dont_reconnect.includes(connection.receiver.status);
        if (connection.receiver.place === receiver) {
          // this means that they already received a message from the seller
          // check if the user denied the connection.
          // if user denied the connection or block the connection,
          // we should not removed seen
          if (!nogo) {
            // this means that they already received a message from the seller
            // and we can recoonect
            connection.receiver.seen = null;
          }
        } else if (connection.sender.place === receiver) {
          if (!nogo) {
            // this means that they already received a message from the seller
            // and we can recoonect
            delete connection.sender.null;
            connection.receiver.status = "accepted";
          }
        }
      }
      await connection.save();

      // connect to contact
      const contact_body = {};

      console.log(connection, "testing_connection");

      return connection;
    });

    const complete_connections = await Promise.all(connections);

    console.log(complete_connections);

    let output = await getPlaceApi({ _id: current_place._id });

    res.status(201).json(output);
  } catch (error) {
    console.log(error, "testing_error");
    res.status(error.status || 403).json({ message: error.messsage });
  }
});

router.post("/place/business_branding", [auth], async (req, res) => {
  let api_key = "business_branding";
  try {
    const { body: BODY } = req;
    let { logo, banner, poster } = (await getBody(api_key, BODY)) || {};

    let current_place = await BusinessProfile.findOne({
      _id: req.current_place._id,
    });
    if (current_place) {
      if (logo) {
        current_place.logo = logo;
        let found = await File.findOne({ _id: logo });
        found.user = req.user.id;
        found.business_profile = req.current_place._id;
        await found.save();
      }
      if (banner) {
        current_place.banner = banner;
        let found = await File.findOne({ _id: banner });
        found.user = req.user.id;
        found.business_profile = req.current_place._id;
        await found.save();
      } else {
        // delete current_place.banner;
      }

      if (poster) {
        current_place.poster = poster;
        let found = await File.findOne({ _id: poster });
        found.user = req.user.id;
        found.business_profile = req.current_place._id;
        await found.save();
      } else {
        // delete current_place.poster;
      }
      await current_place.save();

      let output = await getPlaceApi({ _id: current_place._id });
      console.log(output, "current_place");

      res.status(206).json(output);
    } else {
      throw {
        status: 500,
        message: "Invalid Credentials",
      };
    }
  } catch (error) {
    res.status(error.status || 400).json({ message: error.message });
  }
});

router.post("/place/my_business", [auth], async (req, res) => {
  let api_key = "my_business";
  let confirmation_code = getRandomInt(100001, 999999);

  try {
    const BODY = req.body;
    const user_id = req.user && req.user.id;
    let error_list = [];
    const found_profile = await Profile.findOne({ user: user_id });

    if (!user_id || !found_profile) {
      error_list = [{ message: "Invalid Credentials" }];
      throw {
        status: 403,
        message: { errors: error_list },
      };
    }

    let got_body = (await getBody(api_key, BODY)) || {};
    let place = got_body.my_business && got_body.my_business[0];

    if (place) {
      // check if user is a manager
      let found_manager = await Manager.findOne({
        user: user_id,
        place,
        access_type: { $in: ["own", "manage"] },
      });

      // check if place is claimed
      let found_place = await Place.findOne({ _id: place });

      if (!found_place || (found_place.claimed && !found_manager)) {
        throw { message: "You are not Authorized" };
      }

      // if theirs a current place and
      // user have not solidified their management position.
      // include the current business information to the new business informaiton.
      let found_current_place;
      if (req.current_place) {
        found_current_place = await BusinessProfile.findOne({
          _id: req.current_place._id,
        });
      }

      let new_business_profile;
      // check if user is a manager

      let found_current_place_id;
      let found_manager_place_id;

      if (found_current_place) {
        found_current_place_id = String(found_current_place._doc.place);
      }
      if (found_manager) {
        found_manager_place_id = String(found_manager.place);
      }

      if (
        found_manager &&
        found_manager.place ==
          (found_manager_place_id && found_current_place_id)
      ) {
        // check if the manager is managingin the current business profile.
        // this will indicate that it is the user is already managing that business and if so,
        // we don't need to create a nother business profile.

        new_business_profile = found_current_place;
      } else {
        let business_place_body = {
          place,
          owner: req.user.id,
          profile: found_profile._id,
        };

        console.log(req.user, "testing_user");

        if (found_current_place) {
          business_place_body = {
            ...found_current_place.doc,
          };
        }
        business_place_body = {
          ...found_place._doc,
          ...business_place_body,
        };
        delete business_place_body._id;

        console.log(business_place_body, "business_place_body");
        new_business_profile = new BusinessProfile(business_place_body);
        await new_business_profile.save();

        // add place to profile current_place
        found_profile.current_place = place;
        await found_profile.save();

        // create manager body
        let manager_body = {
          place,
          user: user_id,
          profile: found_profile._id,
          business_profile: new_business_profile._id,
          place: found_place._id,
          place_id: found_place._id,
          owned: true,
          place_confirmed: false,
          user_confirmed: true,
          confirmation_code,
          access_type: ["own"],
        };
        found_manager = new Manager(manager_body);
        await found_manager.save();
      }

      output = await getPlaceApi({
        business_profile: new_business_profile,
      });

      res.status(201).json(output);
    } else {
      throw {
        status: 403,
        message: ["You must first select a place"],
      };
    }
  } catch (error) {
    console.log(error, "testing_error_here");
    res.status(error.status || 400).json({ message: error.message });
  }
});

router.post("/place/business_profile", [auth], async (req, res) => {
  let api_key = "updated_place";

  try {
    const BODY = req.body;
    const user_id = req.user && req.user.id;
    let error_list = [];
    if (!user_id) {
      error_list = [{ message: "Invalid Credentials" }];
      throw {
        status: 403,
        message: { errors: error_list },
      };
    }
    let got_body = (await getBody(api_key, BODY)) || {};

    // check if business exists

    let found_place = await BusinessProfile.findOne({
      _id: req.current_place && req.current_place._id,
    }).populate([
      { path: "logo", select: { link: 1, name: 1 } },
      { path: "poster", select: { link: 1, name: 1 } },
      { path: "banner", select: { link: 1, name: 1 } },
    ]);
    const got_keys = Object.keys(got_body);

    got_keys.forEach((key) => {
      let value = got_body[key];
      if (value) {
        found_place[key] = value;
      }
    });
    found_place.corrected = true;
    await found_place.save();

    // todo: make sure user is adding and editing the correct place
    let place_card = await getBody("place_card", found_place);
    let business_hours = await Hour.find({ place: place_card._id }).sort({
      created_at: -1,
    });

    let output = await getPlaceApi({ _id: found_place._doc });
    console.log(output, "info");

    res.status(206).json(output);
  } catch (error) {
    console.log(error, "testing_error");
    res.status(error.status || 400).json({ message: error.message });
  }
});

router.post("/place/business_hours", [auth], async (req, res) => {
  let api_key = "business_hours";
  try {
    const { body: BODY, current_place } = req;

    let got_body = (await getBody(api_key, BODY)) || {};

    let payload = {
      ...got_body,
      place: current_place.place,
      business_profile: current_place._id,
      user: req.user.id,
    };

    let new_time = new Hour(payload);
    await new_time.save();

    let output = await getPlaceApi({ _id: current_place._id });

    res.status(206).json(output);
  } catch (error) {
    res.status(error.status || 400).json({ message: error.message });
  }
});

router.post("/place/drop/business_hours", [auth], async (req, res) => {
  let api_key = "business_hours";
  try {
    const { body: BODY, current_place } = req;

    await Hour.findOneAndDelete(BODY);

    let output = await getPlaceApi({ _id: current_place._id });

    res.status(206).json(output);
  } catch (error) {
    res.status(error.status || 400).json({ message: error.message });
  }
});

module.exports = router;
