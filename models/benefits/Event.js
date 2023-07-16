const mongoose = require("mongoose");
const pointSchema = require("../location/Point");
const Schema = mongoose.Schema;

const TheSchema = new Schema({
  // ownership
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
  },
  profile: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "profile",
  },
  // information
  title: String,
  category: String,
  pricing_timing: String,
  timing_type: String,
  interested: [String],
  description: String,
  days: [String],

  start_date_time: {
    type: Date,
  },
  end_date_time: {
    type: Date,
  },

  price_min: Number,
  price_max: Number,
  min_age: Number,
  max_age: Number,
  total_qty: Number,
  ticket_types: { type: [String], default: "event_hour" },
  // missing
  entrances: [String],

  // join
  poster: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "upload",
    },
  ],
  likes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "like",
    },
  ],

  location: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "place",
    },
  ],
  tickets: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ticket",
    },
  ],
  plans: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "plan",
    },
  ],
  // universal
  current: Boolean,
  available_date: {
    type: Date,
  },
  published: {
    type: Boolean,
    default: false,
  },
  public: {
    type: Boolean,
    default: false,
  },

  created_at: {
    type: Date,
    default: Date.now,
  },
  updated_at: {
    type: Date,
  },
  posts: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "post",
    },
  ],
});

module.exports = mongoose.model("event", TheSchema);
