const mongoose = require("mongoose");
const { Schema } = mongoose;

const seedSchema = new Schema({
  title: { type: String, require: true },
  description: { type: String, required: true },
  creatorName: { type: Schema.Types.ObjectId, ref: "User", required: true },
  creatorEmail: { type: String },
  dateRecorded: { type: Date, default: Date.now },
  metric1: { type: String },
  metric2: { type: String },
  metric3: { type: String },
  metric4: { type: String },
  metric5: { type: String },
  metric6: { type: String },
  metric7: { type: String },
  metric8: { type: String },
  metricScore: { type: Number, default: 0 }, 
  priority: { type: String, enum: ["low", "medium", "high"] },
  status: { type: String },
  isFavorite: { type: Boolean, default: false },
  comments: [{
    text: { type: String, required: true },
    author: { type: String, required: true },
    authorEmail: { type: String },
    createdAt: { type: Date, default: Date.now }
  }]
});

const Seed = mongoose.model("Seed", seedSchema);

module.exports = Seed;