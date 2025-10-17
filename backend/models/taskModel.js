const mongoose = require("mongoose");
const { Schema } = mongoose;

const taskSchema = new Schema({
  taskName: { type: String, required: true },
  subTaskCategory: { type: String },
  startDate : {type: String},
  dueDate: { type: String },
  timeDue: { type: String },
  seedId: { type: Schema.Types.ObjectId, ref: "Seed", required: true },
  createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true }
});

const Task = mongoose.model("Task", taskSchema);

module.exports = Task;
