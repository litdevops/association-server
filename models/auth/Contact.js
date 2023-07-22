const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const TheSchema = new Schema({
  // join relationship
  ip_address: String,
  sender: {
    profile: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Profile",
    },
    seen: {
      type: Date,
    },
  },
  receiver: {
    profile: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Profile",
    },

    seen: {
      type: Date,
    },
  },
  // personal information
  place: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Place",
  },
  business_profile: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "BusinessProfile",
  },
  public: {
    type: Boolean,
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
});

module.exports = mongoose.model("Contact", TheSchema);
