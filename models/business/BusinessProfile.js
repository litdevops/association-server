const mongoose = require("mongoose");
const pointSchema = require("../utils/Point");

const Schema = mongoose.Schema;

const TheSchema = new Schema({
  // ownership
  place: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Place",
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  profile: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Profile",
  },

  // branding
  logo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "File",
  },
  banner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "File",
  },
  poster: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "File",
  },
  // data
  title: String,
  motto: String,
  mission: String,
  description: String,
  terms: [
    {
      effective_date: Date,
      description: String,
    },
  ],
  privacy: [
    {
      effective_date: Date,
      description: String,
    },
  ],
  refund_policy: [
    {
      effective_date: Date,
      description: String,
    },
  ],
  // universal
  public: {
    type: Boolean,
    default: false,
  },
  published: {
    type: Boolean,
    default: true,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
  updated_at: {
    type: Date,
  },

  point: { type: pointSchema },
  // from body
  name: String,
  place_id: String,
  business_status: String,
  formatted_address: String,
  international_phone_number: String,
  icon: String,
  types: [String],
  website: String,
});

module.exports = mongoose.model("BusinessProfile", TheSchema);
