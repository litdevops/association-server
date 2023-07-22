const Place = require("../models/business/Place");
const Hour = require("../models/business/Hour");
const Access = require("../models/auth/Access");
const Package = require("../models/benefits/Package");
const Commitee = require("../models/benefits/Commitee");
const BusinessEvent = require("../models/benefits/Event");
const Job = require("../models/business/Job");
const Manager = require("../models/business/manager");
const Connection = require("../models/business/Connection");
const BusinessProfile = require("../models/business/BusinessProfile");
const { getDict } = require("../config/body");

const getPlaceApi = async (obj) => {
  let output = {};
  try {
    const { business_profile, public_key, private_key } = obj;
    const _id = (business_profile && business_profile._id) || obj._id;
    let business_profile_query = {};
    let place_populate = [
      { path: "logo", select: "link" },
      { path: "poster", select: "link" },
      { path: "banner", select: "link" },
    ];

    let package_populate = [{ path: "image", select: "link" }];
    let commitee_populate = [{ path: "poster", select: "link" }];
    let event_populate = [{ path: "poster", select: "link" }];
    let job_populate = [
      { path: "public_files", select: "link" },
      { path: "private_files", select: "link" },
    ];
    let business_members_populate = [];

    let manager_populate = [
      {
        path: "profile",
        select: getDict("public_profile"),
      },
    ];

    let hours_query = {};
    if (_id) {
      business_profile_query = { _id: _id };
      place_populate = ["logo", "banner", "poster"];
    } else if (public_key && private_key) {
      let access = Access.find({
        public_key,
        private_key,
      });
      business_profile_query = { _id: access.place };
      hours_query.public = true;
    }
    let found_business_profile = await BusinessProfile.findOne(
      business_profile_query
    ).populate(place_populate);

    hours_query.business_profile = found_business_profile._id;
    let hours = await Hour.find({
      business_profile: found_business_profile._id,
    }).sort({
      created_at: -1,
    });
    let packages = await Package.find({
      business_profile: found_business_profile._id,
    }).populate(package_populate);
    let commitees = await Commitee.find({
      business_profile: found_business_profile._id,
    }).populate(commitee_populate);
    let events = await BusinessEvent.find({
      business_profile: found_business_profile._id,
    }).populate(event_populate);

    let jobs = await Job.find({
      business_profile: found_business_profile._id,
    }).populate(job_populate);
    let employees = await Manager.find({
      business_profile: found_business_profile._id,
    }).populate(manager_populate);

    let business_members = await Connection.find({
      $or: [
        { "sender.business_profile": found_business_profile._id },
        { "receiver.business_profile": found_business_profile._id },
      ],
    }).populate(business_members_populate);

    output = {
      place: found_business_profile,
      hours,
      packages,
      commitees,
      events,
      jobs,
      employees,
      business_members,
    };
  } catch (error) {
    console.log(error, "testing errors");
  }
  return output;
};

module.exports = {
  getPlaceApi,
};
