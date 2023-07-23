const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const TheSchema = new Schema({
  to_place: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Place",
  },
  from_place: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Place",
  },
  public: {
    type: Boolean,
    default: false,
  },
  published: {
    type: Boolean,
    default: false,
  },
  publish_later: {
    type: Boolean,
    default: false,
  },
  updated_at: {
    type: Date,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Chat", TheSchema);
