const jwt = require("jsonwebtoken");
require("dotenv").config();
const Profile = require("../models/auth/Profile");
const User = require("../models/auth/User");
const BusinessProfile = require("../models/business/BusinessProfile");
const Manager = require("../models/business/manager");
const { getBody } = require("../utils/api");

module.exports = async (req, res, next = (f) => f) => {
  try {
    // Get token from header
    let ip_address = req.connection.remoteAddress;
    req.ip_address = ip_address;

    const token = req.header("x-auth-token");

    // Check if not token
    if (!token) {
      return res.status(401).json({ msg: "No token, authorization denied" });
    }

    if (token) {
      // Verify token
      try {
        const decoded = await jwt.verify(token, process.env.JWT_SECRET);

        req.user = decoded.user;

        let user = await User.findOne({ _id: decoded.user && decoded.user.id });
        // get current profile
        let profile = await Profile.findOne({ user: user._id });
        // check for users current place.
        if (profile.current_place) {
          let found_manager = await Manager.findOne({
            user: user && user._id,
            place: profile.current_place,
            access_type: { $in: ["own", "manage"] },
          });

          if (found_manager) {
            let current_place = await BusinessProfile.findOne({
              _id: found_manager.business_profile,
            }).populate(["poster", "banner", "logo"]);

            current_place = await getBody("current_place", current_place);

            if (current_place) {
              req.current_place = current_place;
            }
          }
        }
        if (decoded.forgot_password) {
          req.forgot_password = decoded.forgot_password;
        }

        next();
      } catch (err) {
        console.log(err, "auth_err");
        res.status(500).json({
          status: 400,
          errors: [{ msg: err.message || "Token is not valid" }],
        });
      }
    } else if (ip_address) {
      try {
        let current_profile = await Profile.findOne({
          ip_address,
          user: { $exists: false },
        });

        if (!current_profile) {
          current_profile = await Profile.findOne({
            ip_address,
          });
          if (!current_profile) {
            current_profile = new Profile({
              ip_address,
              name: "Guest",
            });
            await current_profile.save();
          }
        }

        req.current_profile = current_profile;
      } catch (error) {
        console.log(error, "auth");
      }

      next();
    } else {
      return res
        .status(401)
        .json({ msg: "No token or ip address, authorization denied" });
    }
  } catch (error) {
    next();
  }
};
