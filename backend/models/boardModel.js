const mongoose = require("mongoose");
const { Schema } = mongoose;

const boardSchema = new Schema({
    projectName: { type: String, require: true },
    seeds: {type: Array},
    admins: {type: Array},
    users: {type: Array},
    weight1: {type: Number},
    weight2: {type: Number},
    weight3: {type: Number},
    weight4: {type: Number},
    weight5: {type: Number},
    weight6: {type: Number},
    weight7: {type: Number},
});

const Board = mongoose.model("Board", boardSchema);

module.exports = Board;