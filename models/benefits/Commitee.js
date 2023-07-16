const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const TheSchema = new Schema({
  // ownership
  ip_address: String,
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  place: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Place",
  },

  // data
  title: String,
  price: Number,
  categories: [String],
  invite_only: Boolean,
  mission: String,
  image: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "File",
  },

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
});

module.exports = mongoose.model("Commitee", TheSchema);
