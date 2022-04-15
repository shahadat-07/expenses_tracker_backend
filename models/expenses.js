const mongoose = require("mongoose");
const { Schema } = mongoose;

const ExpensesSchema = new Schema({
  email: String,
  name: String,
  cost: String,
  date: String,
});
const model = mongoose.model("expenses", ExpensesSchema);

module.exports = model;
