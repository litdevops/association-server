const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const TheSchema = new Schema({
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
  profile: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "profile",
  },
  place: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "place",
  },
  ip_address: {
    type: String,
  },
  occurance: [
    {
      reason: {
        type: String,
        default: true,
      },
      created_at: {
        type: Date,
      },
      updated_at: {
        type: Date,
        default: Date.now,
      },
    },
  ],
});

module.exports = mongoose.model("Search", TheSchema);
