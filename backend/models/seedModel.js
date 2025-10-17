const mongoose = require("mongoose");
const { Schema } = mongoose;

const seedSchema = new Schema({
  title: { type: String, require: true },
  description: { type: String, required: true },
  creatorName: { type: Schema.Types.ObjectId, ref: "User", required: true },
  creatorEmail: { type: String },
  dateRecorded: { type: Date, default: Date.now },
  // New specific metrics with a rating scale
  maintainingCompliance: { type: String, enum: ["very high", "high", "medium", "low", "very low"] },
  reducingCost: { type: String, enum: ["very high", "high", "medium", "low", "very low"] },
  reducingRisk: { type: String, enum: ["very high", "high", "medium", "low", "very low"] },
  improvingProductivity: { type: String, enum: ["very high", "high", "medium", "low", "very low"] },
  improvingProcesses: { type: String, enum: ["very high", "high", "medium", "low", "very low"] },
  creatingNewRevenueStreams: { type: String, enum: ["very high", "high", "medium", "low", "very low"] },
  metricScore: { type: Number, default: 0 }, 
  priority: { type: String, enum: ["low", "medium", "high"] },
  status: { type: String },
  isFavorite: { type: Boolean, default: false },
  // Media attachments
  attachments: [{
    fileName: { type: String, required: true },
    originalName: { type: String, required: true },
    mimeType: { type: String, required: true },
    fileSize: { type: Number, required: true },
    url: { type: String, required: true },
    uploadedAt: { type: Date, default: Date.now },
    uploadedBy: { type: Schema.Types.ObjectId, ref: "User", required: true }
  }],
  comments: [{
    text: { type: String, required: true },
    author: { type: String, required: true },
    authorEmail: { type: String },
    createdAt: { type: Date, default: Date.now }
  }]
});

seedSchema.index(
  { title: "text", description: "text" },
  { name: "seed_text_index", weights: { title: 5, description: 1 } }
);

const Seed = mongoose.model("Seed", seedSchema);

module.exports = Seed;