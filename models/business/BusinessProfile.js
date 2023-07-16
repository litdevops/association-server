const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const TheSchema = new Schema({
  // ownership
  place: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Place",
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
});

module.exports = mongoose.model("BusinessProfile", TheSchema);
